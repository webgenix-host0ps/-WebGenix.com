import { Router } from 'express';
import { authMiddleware } from '../../middlewares/auth.middleware.js';
import { roleMiddleware } from '../../middlewares/role.middleware.js';
import * as serverController from './server.controller.js';
import { ROLES } from '../../constants/tickets.js';

const router = Router();

router.use(authMiddleware);
router.use(roleMiddleware([ROLES.ADMIN, ROLES.SUPPORT])); // Support can also see servers

// Servers
router.get('/', serverController.getServers);
router.post('/', serverController.createServer);
router.patch('/:id', serverController.updateServer);
router.delete('/:id', serverController.deleteServer);

// Groups
router.get('/groups', serverController.getServerGroups);
router.post('/groups', serverController.createServerGroup);

export default router;
