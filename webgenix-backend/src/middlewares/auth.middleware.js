import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { verifyAccessToken } from '../services/token.service.js';
import User from '../models/User.js';

export const authMiddleware = asyncHandler(async (req, res, next) => {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new ApiError(401, 'Access token required');
    }

    const token = authHeader.split(' ')[1];
    
    let decoded;
    try {
        decoded = verifyAccessToken(token);
    } catch (error) {
        throw new ApiError(401, error.message || 'Invalid or expired token');
    }

    if (!decoded || !decoded.sub) {
        throw new ApiError(401, 'Invalid token payload');
    }

    // Fetch user to ensure they still exist and are active
    const user = await User.findById(decoded.sub).select('-password');
    if (!user || !user.isActive) {
        throw new ApiError(401, 'User not found or inactive');
    }

    req.user = user;
    req.userId = user._id;
    next();
});