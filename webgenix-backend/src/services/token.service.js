import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';

export const generateAccessToken = (payload, expiresIn) => {
    return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
        expiresIn: expiresIn || env.JWT_ACCESS_EXPIRY,
    });
};

export const generateRefreshToken = (payload) => {
    return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
        expiresIn: env.JWT_REFRESH_EXPIRY,
    });
};

export const verifyAccessToken = (token) => {
    try {
        return jwt.verify(token, env.JWT_ACCESS_SECRET);
    } catch (error) {
        throw new ApiError(401, 'Invalid or expired access token');
    }
};

export const verifyRefreshToken = (token) => {
    try {
        return jwt.verify(token, env.JWT_REFRESH_SECRET);
    } catch (error) {
        throw new ApiError(401, 'Invalid or expired refresh token');
    }
};

export const decodeToken = (token) => {
    return jwt.decode(token);
};