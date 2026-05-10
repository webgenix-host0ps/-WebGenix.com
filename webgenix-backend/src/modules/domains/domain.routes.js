import { Router } from 'express';
import { authMiddleware } from '../../middlewares/auth.middleware.js';
import { roleMiddleware } from '../../middlewares/role.middleware.js';
import * as domainController from './domain.controller.js';
import { ROLES } from '../../constants/tickets.js';

const router = Router();

router.use(authMiddleware);
router.use(roleMiddleware([ROLES.ADMIN, ROLES.BILLING]));

// Domains
router.get('/', domainController.getDomains);

// Pricing
router.get('/pricing', domainController.getTldPricing);
router.post('/pricing', domainController.createTldPricing);
router.patch('/pricing/:id', domainController.updateTldPricing);

// Registrars
router.get('/registrars', domainController.getRegistrars);
router.post('/registrars', domainController.createRegistrar);

export default router;
