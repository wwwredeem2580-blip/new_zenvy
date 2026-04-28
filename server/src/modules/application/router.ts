import { Router } from 'express';
import * as applicationController from './controller';
import { requireAuth, requireRole } from '../../middlewares/auth';

const router = Router();

// User (Client) Routes
router.post('/', requireAuth, applicationController.create);
router.get('/my', requireAuth, applicationController.getMyApplications);
router.get('/:id', requireAuth, applicationController.getDetails);

// Admin/Agent Routes
router.get('/', requireAuth, requireRole('admin', 'agent'), applicationController.listAll);

export default router;
