import { z } from 'zod';

export const registerSchema = z.object({
    body: z.object({
        email: z.string().email('Invalid email format'),
        password: z.string().min(8, 'Password must be at least 8 characters'),
        name: z.string().min(1, 'Name is required'),
        phone: z.string().optional(),
        company: z.string().optional(),
    }),
});

export const loginSchema = z.object({
    body: z.object({
        email: z.string().email('Invalid email'),
        password: z.string().min(1, 'Password is required'),
    }),
});

export const forgotPasswordSchema = z.object({
    body: z.object({
        email: z.string().email('Invalid email'),
    }),
});

export const resetPasswordSchema = z.object({
    body: z.object({
        token: z.string().min(1, 'Token required'),
        newPassword: z.string().min(8, 'Password must be at least 8 characters'),
    }),
});

export const verifyEmailSchema = z.object({
    query: z.object({
        token: z.string().min(1, 'Token required'),
    }),
});

export const refreshTokenSchema = z.object({
    body: z.object({
        refreshToken: z.string().optional(), // Will be taken from cookie if not provided
    }),
});