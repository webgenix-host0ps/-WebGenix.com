import crypto from 'crypto';
import bcrypt from 'bcrypt';
import { env } from '../config/env.js';

export const hashToken = async (token) => {
    return bcrypt.hash(token, env.BCRYPT_ROUNDS);
};

export const compareTokenHash = async (token, hashedToken) => {
    return bcrypt.compare(token, hashedToken);
};

export const generateRandomToken = (length = 32) => {
    return crypto.randomBytes(length).toString('hex');
};

export const generateRandomCode = (length = 6) => {
    return Math.floor(Math.random() * 10 ** length).toString().padStart(length, '0');
};

export const hashString = (str) => {
    return crypto.createHash('sha256').update(str).digest('hex');
};