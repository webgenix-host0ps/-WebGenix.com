import { asyncHandler } from '../../utils/asyncHandler.js';
import * as authService from './auth.service.js';
import { env } from '../../config/env.js';

// Cookie options for refresh token
const refreshTokenCookieOptions = {
    httpOnly: true,
    secure: env.COOKIE_SECURE,
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    ...(env.COOKIE_DOMAIN && { domain: env.COOKIE_DOMAIN }),
};

export const register = asyncHandler(async (req, res) => {
    const { user } = await authService.registerUser(req.body, req);

    res.status(201).json({
        success: true,
        message: 'Registration successful. Please check your email to verify your account.',
        data: { user },
    });
});

export const login = asyncHandler(async (req, res) => {
    const { user, accessToken, refreshToken } = await authService.loginUser(req.body, req);

    // Set refresh token in cookie
    res.cookie('refreshToken', refreshToken, refreshTokenCookieOptions);

    res.json({
        success: true,
        message: 'Login successful',
        data: { user, accessToken },
    });
});

export const refresh = asyncHandler(async (req, res) => {
    // Get refresh token from cookie or body
    const refreshToken = req.cookies?.refreshToken || req.body.refreshToken;

    const { accessToken, refreshToken: newRefreshToken } = await authService.refreshTokens(refreshToken, req);

    // Set new refresh token cookie
    res.cookie('refreshToken', newRefreshToken, refreshTokenCookieOptions);

    res.json({
        success: true,
        data: { accessToken },
    });
});

export const logout = asyncHandler(async (req, res) => {
    const refreshToken = req.cookies?.refreshToken;
    await authService.logoutUser(refreshToken, req.userId);

    res.clearCookie('refreshToken', refreshTokenCookieOptions);

    res.json({
        success: true,
        message: 'Logged out successfully',
    });
});

export const logoutAll = asyncHandler(async (req, res) => {
    await authService.logoutAllSessions(req.userId);

    res.clearCookie('refreshToken', refreshTokenCookieOptions);

    res.json({
        success: true,
        message: 'Logged out from all devices',
    });
});

export const forgotPassword = asyncHandler(async (req, res) => {
    await authService.forgotPassword(req.body.email, req);

    res.json({
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent.',
    });
});

export const resetPassword = asyncHandler(async (req, res) => {
    await authService.resetPassword(req.body.token, req.body.newPassword, req);

    res.json({
        success: true,
        message: 'Password reset successful. You can now login with your new password.',
    });
});

export const verifyEmail = asyncHandler(async (req, res) => {
    await authService.verifyEmail(req.query.token, req);

    res.json({
        success: true,
        message: 'Email verified successfully. You can now login.',
    });
});

// Get current user (already handled by auth middleware, but can add endpoint)
export const getMe = asyncHandler(async (req, res) => {
    res.json({
        success: true,
        data: { user: req.user },
    });
});