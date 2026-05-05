import rateLimit from 'express-rate-limit';

// Ticket creation rate limit - 5 tickets per hour per user
export const createTicketLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5, // 5 tickets per hour
    message: {
        error: 'Too many tickets created. Please try again later.',
        retryAfter: '1 hour'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Ticket reply rate limit - 20 replies per hour per user
export const replyTicketLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 20, // 20 replies per hour
    message: {
        error: 'Too many replies. Please wait before replying again.',
        retryAfter: '1 hour'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Admin operations rate limit - 100 operations per hour
export const adminOpsLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 100, // 100 operations per hour
    message: {
        error: 'Too many admin operations. Please try again later.',
        retryAfter: '1 hour'
    },
    standardHeaders: true,
    legacyHeaders: false,
});
