import { Router } from 'express';
import { requireAuth, requireRole } from '../../middlewares/auth';
import * as branchController from './controller';

const router = Router();

// Public routes
router.get('/', branchController.listPublicBranches);

export default router;
