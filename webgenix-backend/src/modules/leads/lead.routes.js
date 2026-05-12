import { Router } from 'express';
import * as leadController from './lead.controller.js';
import { authMiddleware } from '../../middlewares/auth.middleware.js';
import { roleMiddleware } from '../../middlewares/role.middleware.js';

const router = Router();

router.use(authMiddleware);
router.use(roleMiddleware('admin', 'lead', 'support'));

router.get('/pipeline-stats', leadController.pipelineStats);
router.get('/', leadController.list);
router.get('/:id', leadController.getById);
router.post('/', leadController.create);
router.patch('/:id', leadController.update);
router.post('/:id/transition', leadController.transition);
router.post('/:id/convert', leadController.convert);
router.delete('/:id', leadController.remove);

export default router;
