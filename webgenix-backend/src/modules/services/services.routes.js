import { Router } from 'express';
import { authMiddleware } from '../../middlewares/auth.middleware.js';
import { roleMiddleware } from '../../middlewares/role.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';
import * as ctrl from './services.controller.js';
import { createServiceSchema, updateServiceSchema } from './services.validation.js';
import { ROLES } from '../../constants/tickets.js';

const router = Router();

// Public routes
router.get('/', ctrl.list);
router.get('/:id', ctrl.getById);
router.get('/slug/:slug', ctrl.getBySlug);

// Admin routes
router.use(authMiddleware);
router.use(roleMiddleware([ROLES.ADMIN]));
router.post('/', validate(createServiceSchema), ctrl.create);
router.patch('/:id', validate(updateServiceSchema), ctrl.update);
router.delete('/:id', ctrl.remove);

export default router;
