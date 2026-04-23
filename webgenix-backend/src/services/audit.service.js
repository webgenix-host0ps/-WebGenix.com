import AuditLog from '../models/AuditLog.js';

export const logAction = async ({ userId, action, metadata = {}, req }) => {
    try {
        await AuditLog.create({
            userId,
            action,
            metadata,
            ip: req?.ip || req?.socket?.remoteAddress,
            userAgent: req?.headers['user-agent'],
        });
    } catch (error) {
        console.error('Failed to log audit:', error);
        // Non-blocking
    }
};