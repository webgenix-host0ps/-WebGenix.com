import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import { env } from './config/env.js';
import routes from './routes/index.js';
import razorpayWebhookRoutes from './modules/payments/razorpay.webhook.js';
import { sanitizeInput } from './middlewares/sanitize.middleware.js';
import { errorHandler, notFound } from './middlewares/error.middleware.js';
import { apiLimiter } from './middlewares/rateLimit.middleware.js';
import logger from './utils/logger.js';

import path from 'path';

const app = express();

// Serve static files
app.use('/uploads', express.static(path.resolve('uploads')));

// Security middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
        },
    },
    hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true,
    },
}));
app.use(cors({
    origin: env.CLIENT_URL,
    credentials: true,
}));

// Custom security headers
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    next();
});

// Webhook routes (must be before express.json() to preserve raw body)
app.use('/api/webhooks', razorpayWebhookRoutes);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(mongoSanitize()); // Prevent NoSQL injection
app.use(sanitizeInput); // XSS sanitization

// Request logging
app.use((req, res, next) => {
    logger.debug(`${req.method} ${req.path}`);
    next();
});

// Rate limiting
app.use('/api', apiLimiter);

// API routes (excluding webhooks which are handled above)
app.use('/api', routes);

// Error handling
app.use(notFound);
app.use(errorHandler);

export default app;