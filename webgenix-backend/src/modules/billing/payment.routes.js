import { Router } from 'express';
import { authMiddleware } from '../../middlewares/auth.middleware.js';
import { roleMiddleware } from '../../middlewares/role.middleware.js';
import * as paymentController from './payment.controller.js';
import { ROLES } from '../../constants/tickets.js';
import rateLimit from 'express-rate-limit';
import { ApiError } from '../../utils/ApiError.js';

const paymentLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 30,
    message: 'Too many payment requests, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res, next, options) => {
        throw new ApiError(429, options.message);
    },
});

const router = Router();

// ============ PROTECTED ROUTES ============

router.use(authMiddleware);

// Create Razorpay order for invoice payment
router.post('/razorpay/create-order', paymentLimiter, paymentController.createRazorpayOrder);

// Verify and complete payment
router.post('/razorpay/verify', paymentLimiter, paymentController.verifyPayment);

// Process offline payment request
router.post('/offline/payment', paymentLimiter, paymentController.processOfflinePaymentRequest);

// Get payment history
router.get('/payments', paymentController.getUserPayments);

// Get single payment details
router.get('/payments/:id', paymentController.getPaymentDetails);

// ============ ADMIN ONLY ROUTES ============

router.use(roleMiddleware([ROLES.ADMIN, ROLES.BILLING]));

// Get all payments (admin)
router.get('/admin/payments', paymentController.getAllPayments);

// Process refund
router.post('/payments/:id/refund', paymentController.adminRefund);

export default router;