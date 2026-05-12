import { Router } from 'express';
import * as authController from './auth.controller.js';
import { validate } from '../../middlewares/validate.middleware.js';
import { authMiddleware } from '../../middlewares/auth.middleware.js';
import { authLimiter, passwordResetLimiter } from '../../middlewares/rateLimit.middleware.js';
import {
    registerSchema,
    loginSchema,
    forgotPasswordSchema,
    resetPasswordSchema,
    verifyEmailSchema,
} from './auth.validation.js';

const router = Router();

// Public routes with rate limiting
router.post('/register', authLimiter, validate(registerSchema), authController.register);
router.post('/login', authLimiter, validate(loginSchema), authController.login);
router.post('/refresh', authLimiter, authController.refresh);
router.post('/forgot-password', passwordResetLimiter, validate(forgotPasswordSchema), authController.forgotPassword);
router.post('/reset-password', passwordResetLimiter, validate(resetPasswordSchema), authController.resetPassword);
router.get('/verify-email', authLimiter, validate(verifyEmailSchema), authController.verifyEmail);

// 2FA Login (public — uses tempToken, not regular auth)
router.post('/2fa/login', authLimiter, authController.verify2FALogin);

// Protected routes
router.use(authMiddleware);
router.post('/logout', authController.logout);
router.post('/logout-all', authController.logoutAll);
router.get('/me', authController.getMe);
router.patch('/profile', authController.updateProfile);

// Active Sessions
router.get('/sessions', authController.getSessions);
router.delete('/sessions/:id', authController.revokeSession);

// 2FA Routes (setup/verify/disable require auth)
router.post('/2fa/setup', authController.setup2FA);
router.post('/2fa/verify', authController.verify2FA);
router.post('/2fa/disable', authController.disable2FA);

export default router;