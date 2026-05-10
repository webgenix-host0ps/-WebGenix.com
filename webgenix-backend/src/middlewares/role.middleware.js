import { ApiError } from '../utils/ApiError.js';

export const roleMiddleware = (...allowedRoles) => {
    // Flatten in case an array was passed as the first argument
    const roles = allowedRoles.flat();
    return (req, res, next) => {
        if (!req.user) {
            throw new ApiError(401, 'Authentication required');
        }
        if (!roles.includes(req.user.role)) {
            throw new ApiError(403, 'Insufficient permissions');
        }
        next();
    };
};

// For more granular permission checks
export const permissionMiddleware = (requiredPermission) => {
    return (req, res, next) => {
        if (!req.user) {
            throw new ApiError(401, 'Authentication required');
        }
        if (!req.user.hasPermission(requiredPermission)) {
            throw new ApiError(403, `Missing required permission: ${requiredPermission}`);
        }
        next();
    };
};