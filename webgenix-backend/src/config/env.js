import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from the backend root directory
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const requiredEnvVars = [
    ['JWT_ACCESS_SECRET', 'JWT_ACCESS_SECRET'],
    ['JWT_REFRESH_SECRET', 'JWT_REFRESH_SECRET'],
    ['MONGODB_URI', 'MONGODB_URI'],
];

const missing = requiredEnvVars.filter(([key]) => !process.env[key]);
if (missing.length > 0) {
    const names = missing.map(([_, name]) => name).join(', ');
    console.error(`[ENV] FATAL: Missing required environment variables: ${names}`);
    console.error('[ENV] Please ensure these are set in your .env file.');
    process.exit(1);
}

export const env = {
    NODE_ENV: process.env.NODE_ENV || 'development',
    PORT: parseInt(process.env.PORT, 10) || 5000,

    // MongoDB
    MONGODB_URI: process.env.MONGODB_URI,

    // JWT
    JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET,
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
    JWT_ACCESS_EXPIRY: process.env.JWT_ACCESS_EXPIRY || '15m',
    JWT_REFRESH_EXPIRY: process.env.JWT_REFRESH_EXPIRY || '7d',

    // Security
    BCRYPT_ROUNDS: parseInt(process.env.BCRYPT_ROUNDS, 10) || 12,

    // Email
    SMTP_HOST: process.env.SMTP_HOST,
    SMTP_PORT: parseInt(process.env.SMTP_PORT, 10) || 587,
    SMTP_USER: process.env.SMTP_USER,
    SMTP_PASS: process.env.SMTP_PASS,
    EMAIL_FROM: process.env.EMAIL_FROM || 'noreply@webgenix.com',

    // Client URL
    CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',

    // Cookie options
    COOKIE_SECURE: process.env.COOKIE_SECURE === 'true' || process.env.NODE_ENV === 'production',
    COOKIE_DOMAIN: process.env.COOKIE_DOMAIN,

    // Payment Gateways
    RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID,
    RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET,
    RAZORPAY_WEBHOOK_SECRET: process.env.RAZORPAY_WEBHOOK_SECRET,
};
