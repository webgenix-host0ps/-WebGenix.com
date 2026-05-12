import { Router } from 'express';
import { authMiddleware } from '../../middlewares/auth.middleware.js';
import { roleMiddleware } from '../../middlewares/role.middleware.js';
import * as kbController from './kb.controller.js';
import { ROLES } from '../../constants/tickets.js';

const router = Router();

// Public routes (clients can view articles)
router.get('/categories', kbController.getCategories);
router.get('/articles', kbController.getArticles);
router.get('/articles/search', kbController.searchArticles);
router.get('/articles/:id', kbController.getArticle);

// Admin routes (requires admin or support role)
router.post('/categories', authMiddleware, roleMiddleware([ROLES.ADMIN, ROLES.SUPPORT]), kbController.createCategory);
router.post('/articles', authMiddleware, roleMiddleware([ROLES.ADMIN, ROLES.SUPPORT]), kbController.createArticle);
router.patch('/articles/:id', authMiddleware, roleMiddleware([ROLES.ADMIN, ROLES.SUPPORT]), kbController.updateArticle);

export default router;
