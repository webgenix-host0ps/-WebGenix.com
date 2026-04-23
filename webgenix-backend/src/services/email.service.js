import nodemailer from 'nodemailer';
import { env } from '../config/env.js';
import logger from '../utils/logger.js';

// In development, use a test account or log to console
let transporter;

if (env.NODE_ENV === 'production') {
    transporter = nodemailer.createTransport({
        host: env.SMTP_HOST,
        port: env.SMTP_PORT,
        secure: env.SMTP_PORT === 465,
        auth: {
            user: env.SMTP_USER,
            pass: env.SMTP_PASS,
        },
    });
} else {
    // For development, log emails instead of sending
    transporter = {
        sendMail: async (options) => {
            logger.debug('Email would be sent:', options);
            return { messageId: 'test-' + Date.now() };
        },
    };
}

export const sendEmail = async ({ to, subject, html }) => {
    try {
        const info = await transporter.sendMail({
            from: `"Webgenix" <${env.EMAIL_FROM}>`,
            to,
            subject,
            html,
        });
        logger.info(`Email sent: ${info.messageId}`);
        return info;
    } catch (error) {
        logger.error('Email sending failed:', error);
        throw error;
    }
};

export const sendVerificationEmail = async (email, token) => {
    const verificationUrl = `${env.CLIENT_URL}/verify-email?token=${token}`;
    const html = `
    <h1>Verify Your Email</h1>
    <p>Click the link below to verify your email address:</p>
    <a href="${verificationUrl}">${verificationUrl}</a>
    <p>This link will expire in 24 hours.</p>
  `;
    return sendEmail({ to: email, subject: 'Verify Your Email - Webgenix', html });
};

export const sendPasswordResetEmail = async (email, token) => {
    const resetUrl = `${env.CLIENT_URL}/reset-password?token=${token}`;
    const html = `
    <h1>Reset Your Password</h1>
    <p>Click the link below to reset your password:</p>
    <a href="${resetUrl}">${resetUrl}</a>
    <p>This link will expire in 1 hour.</p>
    <p>If you didn't request this, please ignore this email.</p>
  `;
    return sendEmail({ to: email, subject: 'Reset Your Password - Webgenix', html });
};