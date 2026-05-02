import { Router } from 'express';
import * as serviceController from './controller';
import { requireAuth, requireRole } from '../../middlewares/auth';

const router = Router();

// Public: List services
router.get('/', serviceController.list);

// Admin only: Create/Update/Delete
router.post('/', requireAuth, requireRole('admin'), serviceController.createUpdate);
router.delete('/:id', requireAuth, requireRole('admin'), serviceController.remove);

export default router;
