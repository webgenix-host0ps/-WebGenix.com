import { Router } from 'express';
import { authMiddleware } from '../../middlewares/auth.middleware.js';
import { roleMiddleware } from '../../middlewares/role.middleware.js';
import * as adminController from './admin.controller.js';
import { ROLES } from '../../constants/tickets.js';

const router = Router();

// All admin routes require authentication and admin role
router.use(authMiddleware);
router.use(roleMiddleware([ROLES.ADMIN, ROLES.BILLING]));

// Dashboard stats
router.get('/stats', adminController.getStats);

// User management
router.get('/users', adminController.getUsers);
router.get('/users/:id', adminController.getUser);
router.patch('/users/:id', adminController.updateUser);
router.post('/users/:id/toggle-status', adminController.toggleUserStatus);

// Lead management
router.get('/leads', adminController.getLeads);
router.post('/leads', adminController.createLead);
router.put('/leads/:id', adminController.updateLead);
router.delete('/leads/:id', adminController.deleteLead);

// Analytics
router.get('/analytics/revenue', adminController.getRevenueAnalytics);
router.get('/analytics/users', adminController.getUserAnalytics);
router.get('/analytics/services', adminController.getServiceAnalytics);

export default router;
