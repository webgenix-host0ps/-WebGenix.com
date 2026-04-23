import { env } from '../config/env.js';
import logger from '../utils/logger.js';
import { ApiError } from '../utils/ApiError.js';

export const errorHandler = (err, req, res, next) => {
    let { statusCode, message } = err;

    if (!(err instanceof ApiError)) {
        statusCode = err.statusCode || 500;
        message = err.message || 'Internal Server Error';
    }

    // Log error
    logger.error(`[${statusCode}] ${message}`, {
        stack: err.stack,
        path: req.path,
        method: req.method,
    });

    const response = {
        success: false,
        message,
        ...(env.NODE_ENV === 'development' && { stack: err.stack }),
    };

    res.status(statusCode).json(response);
};

// 404 handler
export const notFound = (req, res, next) => {
    next(new ApiError(404, `Route ${req.originalUrl} not found`));
};