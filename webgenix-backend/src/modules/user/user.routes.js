import { Router } from 'express';
import * as userController from './user.controller.js';
import { authMiddleware } from '../../middlewares/auth.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';
import { authLimiter } from '../../middlewares/rateLimit.middleware.js';
import { z } from 'zod';

const router = Router();

router.use(authMiddleware);

// Strict rate limiting for sensitive user operations
router.use('/profile', authLimiter);
router.use('/change-password', authLimiter);

router.get('/profile', userController.getProfile);
router.patch('/profile', userController.updateProfile);
router.post('/change-password', validate(z.object({
    body: z.object({
        oldPassword: z.string().min(1),
        newPassword: z.string().min(8),
    }),
})), userController.changePassword);

export default router;