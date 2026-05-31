import { Router } from 'express';
import { authMiddleware } from '../../middlewares/auth.middleware.js';
import { roleMiddleware } from '../../middlewares/role.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';
import * as billingController from './billing.controller.js';
import paymentRoutes from './payment.routes.js';
import {
    createProductSchema,
    updateProductSchema,
    productQuerySchema,
    getProductSchema,
    createOrderSchema,
} from './billing.validation.js';
import { ROLES } from '../../constants/tickets.js';

const router = Router();

// Payment routes (with its own middleware setup)
router.use('/payments', paymentRoutes);

// Public routes (no auth required)
router.get('/products/homepage', billingController.getHomepageProducts);
router.get('/products', validate(productQuerySchema), billingController.listProducts);

// All routes require authentication
router.use(authMiddleware);

// ============ PROTECTED PRODUCT ROUTES ============

// Get featured products (public)
// Public product routes (no auth required)
router.get('/products/featured', billingController.getFeaturedProducts);
router.get('/products/slug/:slug', billingController.getProductBySlug);
router.get('/products/categories', billingController.getProductCategories);

// Get single product
router.get('/products/:id', validate(getProductSchema), billingController.getProduct);

// ============ PROTECTED ORDER/INVOICE ROUTES ============

// Create order (checkout)
router.post('/orders', validate(createOrderSchema), billingController.createOrder);

// Get user's orders
router.get('/orders', billingController.listOrders);

// Get single order
router.get('/orders/:id', billingController.getOrder);

// Cancel order
router.post('/orders/:id/cancel', billingController.cancelOrder);

// Get user's invoices
router.get('/invoices', billingController.listInvoices);

// Get single invoice
router.get('/invoices/:id', billingController.getInvoice);
router.get('/invoices/:id/download', billingController.downloadInvoice);

// Validate promo code
router.post('/promocode/validate', billingController.validatePromoCode);

// ============ SERVICES (User's active services) ============
router.get('/services', billingController.getUserServices);
router.get('/services/:id', billingController.getService);

// Billing dashboard stats
router.get('/stats', billingController.getBillingStats);

// Credit balance
router.get('/credits', billingController.getCredits);

// Service delivery details (admin, billing, and support)
router.get('/admin/services/:id/delivery', roleMiddleware(ROLES.ADMIN, ROLES.BILLING, ROLES.SUPPORT), billingController.getServiceDelivery);
router.put('/admin/services/:id/delivery', roleMiddleware(ROLES.ADMIN, ROLES.BILLING, ROLES.SUPPORT), billingController.updateServiceDelivery);
router.patch('/admin/services/:id/delivery', roleMiddleware(ROLES.ADMIN, ROLES.BILLING, ROLES.SUPPORT), billingController.updateServiceDelivery);

// ============ ADMIN ONLY ROUTES ============

router.use(roleMiddleware(ROLES.ADMIN, ROLES.BILLING));

// Products CRUD
router.post('/products', validate(createProductSchema), billingController.createProduct);
router.patch('/products/:id', validate(updateProductSchema), billingController.updateProduct);
router.delete('/products/:id', billingController.deleteProduct);
router.post('/products/:id/toggle', billingController.toggleProductStatus);
router.post('/products/:id/duplicate', billingController.duplicateProduct);

// All invoices (admin)
router.get('/admin/invoices', billingController.listAllInvoices);
router.post('/admin/invoices', billingController.createInvoice);
router.patch('/admin/invoices/:id/status', billingController.updateInvoiceStatus);

// All orders (admin)
router.get('/admin/orders', billingController.listAllOrders);
router.patch('/admin/orders/:id/status', billingController.updateOrderStatus);

// All services (admin)
router.get('/admin/services', billingController.listAllServices);
router.patch('/admin/services/:id/status', billingController.updateServiceStatus);

// Refund processing
router.post('/admin/invoices/:id/refund', billingController.processRefund);

// Proration calculation
router.get('/services/:id/proration', billingController.calculateProration);

// Service cancellation request
router.post('/services/:id/cancel', billingController.requestCancellation);

// Promo codes CRUD
router.post('/promocode', billingController.createPromoCode);
router.get('/promocode', billingController.listPromoCodes);
router.patch('/promocode/:id', billingController.updatePromoCode);
router.delete('/promocode/:id', billingController.deletePromoCode);

export default router;