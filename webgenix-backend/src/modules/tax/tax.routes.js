import { Router } from 'express';
import { authMiddleware } from '../../middlewares/auth.middleware.js';
import { roleMiddleware } from '../../middlewares/role.middleware.js';
import * as taxController from './tax.controller.js';
import { ROLES } from '../../constants/tickets.js';

const router = Router();

// Tax calculation - available to all authenticated users
router.get('/calculate', authMiddleware, taxController.calculateTax);

// All tax routes require admin or billing role
router.use(authMiddleware);
router.use(roleMiddleware([ROLES.ADMIN, ROLES.BILLING]));

router.get('/', taxController.getTaxRules);
router.post('/', taxController.createTaxRule);
router.patch('/:id', taxController.updateTaxRule);
router.delete('/:id', taxController.deleteTaxRule);

export default router;
