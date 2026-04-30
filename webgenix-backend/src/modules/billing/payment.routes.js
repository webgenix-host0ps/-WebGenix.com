import { Router } from 'express';
import { authMiddleware } from '../../middlewares/auth.middleware.js';
import { roleMiddleware } from '../../middlewares/role.middleware.js';
import * as paymentController from './payment.controller.js';
import { ROLES } from '../../constants/tickets.js';

const router = Router();

// ============ PUBLIC ROUTES (Webhook) ============

// Razorpay webhook (no auth needed - verified by signature)
router.post('/webhook/razorpay', paymentController.razorpayWebhook);

// ============ PROTECTED ROUTES ============

router.use(authMiddleware);

// Create Razorpay order for invoice payment
router.post('/razorpay/create-order', paymentController.createRazorpayOrder);

// Verify and complete payment
router.post('/razorpay/verify', paymentController.verifyPayment);

// Process offline payment request
router.post('/offline/payment', paymentController.processOfflinePaymentRequest);

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