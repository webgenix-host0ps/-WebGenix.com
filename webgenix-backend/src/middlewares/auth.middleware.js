import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { verifyAccessToken } from '../services/token.service.js';
import User from '../models/User.js';

export const authMiddleware = asyncHandler(async (req, res, next) => {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    console.log('[AuthMiddleware] Authorization header:', authHeader ? 'Present' : 'Missing');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        console.error('[AuthMiddleware] 401: Access token required or invalid format');
        throw new ApiError(401, 'Access token required');
    }

    const token = authHeader.split(' ')[1];
    console.log('[AuthMiddleware] Token extracted:', token ? `${token.substring(0, 20)}...` : 'Missing');
    
    let decoded;
    try {
        decoded = verifyAccessToken(token);
        console.log('[AuthMiddleware] Token decoded successfully:', decoded ? 'Yes' : 'No');
    } catch (error) {
        console.error('[AuthMiddleware] 401: Token verification failed:', error.message);
        throw new ApiError(401, error.message || 'Invalid or expired token');
    }

    if (!decoded || !decoded.sub) {
        console.error('[AuthMiddleware] 401: Invalid token payload - missing sub');
        throw new ApiError(401, 'Invalid token payload');
    }

    console.log('[AuthMiddleware] Token subject (userId):', decoded.sub);

    // Fetch user to ensure they still exist and are active
    const user = await User.findById(decoded.sub).select('-password');
    if (!user) {
        console.error('[AuthMiddleware] 401: User not found for id:', decoded.sub);
        throw new ApiError(401, 'User not found or inactive');
    }
    
    if (!user.isActive) {
        console.error('[AuthMiddleware] 401: User is inactive:', decoded.sub);
        throw new ApiError(401, 'User not found or inactive');
    }

    console.log('[AuthMiddleware] User authenticated:', user.email, 'Role:', user.role);
    req.user = user;
    req.userId = user._id;
    next();
});