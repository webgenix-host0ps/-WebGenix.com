import speakeasy from 'speakeasy';
import qrcode from 'qrcode';
import User from '../../models/User.js';
import Session from '../../models/Session.js';
import AuthToken from '../../models/AuthToken.js';
import { ApiError } from '../../utils/ApiError.js';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../../services/token.service.js';
import { hashToken, compareTokenHash, generateRandomToken } from '../../services/crypto.service.js';
import { sendVerificationEmail, sendPasswordResetEmail } from '../../services/email.service.js';
import { logAction } from '../../services/audit.service.js';

export const registerUser = async (userData, req) => {
    const { email, password, name, phone, company } = userData;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        throw new ApiError(409, 'Email already registered');
    }

    // Create user
    const user = await User.create({
        email,
        password,
        name,
        phone,
        clientProfile: company ? { company } : undefined,
    });

    // Create email verification token
    const verificationToken = generateRandomToken();
    await AuthToken.create({
        userId: user._id,
        type: 'email_verification',
        token: await hashToken(verificationToken),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24h
    });

    // Send verification email (async, don't await)
    sendVerificationEmail(user.email, verificationToken).catch(console.error);

    await logAction({
        userId: user._id,
        action: 'user.registered',
        metadata: { email: user.email },
        req,
    });

    return { user: user.toObject() };
};

export const loginUser = async ({ email, password }, req) => {
    // Find user with password field
    const user = await User.findOne({ email }).select('+password');
    if (!user || !user.isActive) {
        throw new ApiError(401, 'Invalid email or password');
    }

    // Enforce email verification
    if (!user.emailVerified) {
        throw new ApiError(403, 'Please verify your email before logging in');
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
        throw new ApiError(401, 'Invalid email or password');
    }

    // Update last login
    user.lastLogin = new Date();
    user.lastLoginIp = req.ip;
    await user.save();

    // If 2FA is enabled, issue a temporary token for 2FA verification
    if (user.twoFactorEnabled && user.twoFactorSecret) {
        const tempToken = generateAccessToken(
            { sub: user._id, role: user.role, email: user.email, purpose: '2fa' },
            '5m'
        );

        await logAction({
            userId: user._id,
            action: 'user.2fa_challenge',
            metadata: { email: user.email },
            req,
        });

        return {
            requiresTwoFactor: true,
            tempToken,
        };
    }

    // Generate tokens
    const payload = { sub: user._id, role: user.role, email: user.email };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    // Hash refresh token and store session
    const hashedRefreshToken = await hashToken(refreshToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await Session.create({
        userId: user._id,
        refreshToken: hashedRefreshToken,
        device: {
            userAgent: req.headers['user-agent'],
            ip: req.ip,
        },
        expiresAt,
        lastUsedAt: new Date(),
    });

    await logAction({
        userId: user._id,
        action: 'user.login',
        metadata: { email: user.email },
        req,
    });

    // Remove sensitive fields
    const userObj = user.toObject();
    delete userObj.password;

    return {
        user: userObj,
        accessToken,
        refreshToken,
    };
};

export const refreshTokens = async (refreshToken, req) => {
    if (!refreshToken) {
        throw new ApiError(401, 'Refresh token required');
    }

    // Verify token signature
    const decoded = verifyRefreshToken(refreshToken);
    const userId = decoded.sub;

    // Find all active sessions for user
    const sessions = await Session.find({ userId, isActive: true });

    // Find the session matching this refresh token
    let validSession = null;
    for (const session of sessions) {
        if (await compareTokenHash(refreshToken, session.refreshToken)) {
            validSession = session;
            break;
        }
    }

    if (!validSession) {
        throw new ApiError(401, 'Invalid refresh token');
    }

    // Check if expired
    if (validSession.expiresAt < new Date()) {
        validSession.isActive = false;
        await validSession.save();
        throw new ApiError(401, 'Refresh token expired');
    }

    // Fetch user
    const user = await User.findById(userId);
    if (!user || !user.isActive) {
        throw new ApiError(401, 'User not found or inactive');
    }

    // Token rotation: create new refresh token, invalidate old one
    const newRefreshToken = generateRefreshToken({ sub: user._id, role: user.role });
    const hashedNewToken = await hashToken(newRefreshToken);

    // Update session with new token
    validSession.refreshToken = hashedNewToken;
    validSession.lastUsedAt = new Date();
    // Extend expiry? Optional: keep original expiry or extend.
    await validSession.save();

    // Generate new access token
    const accessToken = generateAccessToken({ sub: user._id, role: user.role });

    return {
        accessToken,
        refreshToken: newRefreshToken,
    };
};

export const logoutUser = async (refreshToken, userId) => {
    if (!refreshToken) {
        // If no token provided, just return success (client side cleanup)
        return true;
    }

    // Find and invalidate the specific session
    const sessions = await Session.find({ userId, isActive: true });
    for (const session of sessions) {
        if (await compareTokenHash(refreshToken, session.refreshToken)) {
            session.isActive = false;
            await session.save();
            break;
        }
    }
    return true;
};

export const logoutAllSessions = async (userId) => {
    await Session.updateMany({ userId, isActive: true }, { isActive: false });
    return true;
};

export const forgotPassword = async (email, req) => {
    const user = await User.findOne({ email });
    if (!user) {
        // Don't reveal existence, but still return success
        return true;
    }

    // Generate reset token
    const resetToken = generateRandomToken();
    await AuthToken.create({
        userId: user._id,
        type: 'password_reset',
        token: await hashToken(resetToken),
        expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
    });

    // Send email
    await sendPasswordResetEmail(user.email, resetToken);

    await logAction({
        userId: user._id,
        action: 'user.forgot_password',
        metadata: { email: user.email },
        req,
    });

    return true;
};

export const resetPassword = async (token, newPassword, req) => {
    if (!token) {
        throw new ApiError(400, 'Token is required');
    }

    // Find password reset tokens within a limited time window (last 2 hours max)
    const timeWindow = new Date(Date.now() - 2 * 60 * 60 * 1000);
    const authTokens = await AuthToken.find({
        type: 'password_reset',
        expiresAt: { $gt: new Date() },
        createdAt: { $gt: timeWindow }
    });
    if (!authTokens || authTokens.length === 0) {
        throw new ApiError(400, 'Invalid or expired token');
    }

    // Find the matching token by comparing hashes
    let authToken = null;
    for (const candidate of authTokens) {
        if (await compareTokenHash(token, candidate.token)) {
            authToken = candidate;
            break;
        }
    }

    if (!authToken) {
        throw new ApiError(400, 'Invalid or expired token');
    }

    const user = await User.findById(authToken.userId);
    if (!user) {
        throw new ApiError(404, 'User not found');
    }

    // Update password
    user.password = newPassword;
    await user.save();

    // Delete used token
    await authToken.deleteOne();

    // Invalidate all sessions for security
    await Session.updateMany({ userId: user._id, isActive: true }, { isActive: false });

    await logAction({
        userId: user._id,
        action: 'user.reset_password',
        metadata: { email: user.email },
        req,
    });

    return true;
};

export const verifyEmail = async (token, req) => {
    if (!token) {
        throw new ApiError(400, 'Token is required');
    }

    // Find email verification tokens within a limited time window (last 48 hours max)
    const timeWindow = new Date(Date.now() - 48 * 60 * 60 * 1000);
    const authTokens = await AuthToken.find({
        type: 'email_verification',
        expiresAt: { $gt: new Date() },
        createdAt: { $gt: timeWindow }
    });
    if (!authTokens || authTokens.length === 0) {
        throw new ApiError(400, 'Invalid or expired token');
    }

    // Find the matching token by comparing hashes
    let authToken = null;
    for (const candidate of authTokens) {
        if (await compareTokenHash(token, candidate.token)) {
            authToken = candidate;
            break;
        }
    }

    if (!authToken) {
        throw new ApiError(400, 'Invalid or expired token');
    }

    const user = await User.findById(authToken.userId);
    if (!user) {
        throw new ApiError(404, 'User not found');
    }

    user.emailVerified = true;
    await user.save();

    await authToken.deleteOne();

    await logAction({
        userId: user._id,
        action: 'user.verify_email',
        metadata: { email: user.email },
        req,
    });

    return true;
};

export const updateUser = async (userId, updateData) => {
    const user = await User.findByIdAndUpdate(
        userId,
        { $set: updateData },
        { new: true, runValidators: true }
    );
    
    if (!user) {
        throw new ApiError(404, 'User not found');
    }
    
    return user.toObject();
};

export const getUserSessions = async (userId) => {
    const Session = await import('../../models/Session.js').then(m => m.default);
    const sessions = await Session.find({ userId, isActive: true })
        .sort({ lastUsedAt: -1 })
        .limit(20);

    return sessions.map(session => ({
        _id: session._id,
        device: session.device,
        createdAt: session.createdAt,
        lastUsedAt: session.lastUsedAt,
        expiresAt: session.expiresAt,
        isCurrent: false // frontend will set this
    }));
};

export const revokeSession = async (sessionId, userId) => {
    const Session = await import('../../models/Session.js').then(m => m.default);
    const session = await Session.findOneAndUpdate(
        { _id: sessionId, userId, isActive: true },
        { isActive: false },
        { new: true }
    );
    if (!session) {
        throw new ApiError(404, 'Session not found');
    }
    return session;
};

export const generate2FASecret = async (user) => {
    const secret = speakeasy.generateSecret({
        name: `WebGenix:${user.email}`,
        issuer: 'WebGenix',
    });

    await User.findByIdAndUpdate(user._id, { tempTwoFactorSecret: secret.base32 });

    const qrCode = await qrcode.toDataURL(secret.otpauth_url);

    return { secret: secret.base32, qrCode, otpauth_url: secret.otpauth_url };
};

export const verifyAndEnable2FA = async (userId, token) => {
    const user = await User.findById(userId);
    if (!user.tempTwoFactorSecret) {
        throw new ApiError(400, '2FA setup not initiated');
    }

    const verified = speakeasy.totp.verify({
        secret: user.tempTwoFactorSecret,
        encoding: 'base32',
        token,
        window: 1,
    });

    if (!verified) {
        throw new ApiError(400, 'Invalid 2FA token');
    }

    user.twoFactorSecret = user.tempTwoFactorSecret;
    user.twoFactorEnabled = true;
    user.tempTwoFactorSecret = undefined;
    await user.save();

    await logAction({
        userId: user._id,
        action: 'user.2fa_enabled',
        metadata: {},
    });

    return user.toObject();
};

export const disable2FA = async (userId, token) => {
    const user = await User.findById(userId);
    if (!user.twoFactorEnabled) {
        throw new ApiError(400, '2FA is not enabled');
    }

    if (token) {
        const verified = speakeasy.totp.verify({
            secret: user.twoFactorSecret,
            encoding: 'base32',
            token,
            window: 1,
        });
        if (!verified) {
            throw new ApiError(400, 'Invalid 2FA token');
        }
    }

    user.twoFactorEnabled = false;
    user.twoFactorSecret = undefined;
    user.tempTwoFactorSecret = undefined;
    await user.save();

    await logAction({
        userId: user._id,
        action: 'user.2fa_disabled',
        metadata: {},
    });

    return user.toObject();
};

export const verify2FALogin = async (tempToken, twoFactorToken, req) => {
    const { verifyAccessToken } = await import('../../services/token.service.js');
    let decoded;
    try {
        decoded = verifyAccessToken(tempToken);
    } catch {
        throw new ApiError(401, 'Temporary token expired or invalid');
    }

    if (decoded.purpose !== '2fa') {
        throw new ApiError(401, 'Invalid token purpose');
    }

    const user = await User.findById(decoded.sub).select('+password');
    if (!user || !user.isActive || !user.twoFactorEnabled || !user.twoFactorSecret) {
        throw new ApiError(401, '2FA not available for this user');
    }

    const verified = speakeasy.totp.verify({
        secret: user.twoFactorSecret,
        encoding: 'base32',
        token: twoFactorToken,
        window: 1,
    });

    if (!verified) {
        throw new ApiError(401, 'Invalid 2FA token');
    }

    // Generate full session tokens
    const payload = { sub: user._id, role: user.role, email: user.email };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    const hashedRefreshToken = await hashToken(refreshToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await Session.create({
        userId: user._id,
        refreshToken: hashedRefreshToken,
        device: {
            userAgent: req.headers['user-agent'],
            ip: req.ip,
        },
        expiresAt,
        lastUsedAt: new Date(),
    });

    // Update last login
    user.lastLogin = new Date();
    user.lastLoginIp = req.ip;
    await user.save();

    await logAction({
        userId: user._id,
        action: 'user.login',
        metadata: { email: user.email, method: '2fa' },
        req,
    });

    const userObj = user.toObject();
    delete userObj.password;

    return {
        user: userObj,
        accessToken,
        refreshToken,
    };
};