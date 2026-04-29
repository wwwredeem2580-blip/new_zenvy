import { Router } from 'express';
import { requireAuth, requireRole } from '../../middlewares/auth';

import * as adminController from './controller';

const router = Router();

// Staff Management
router.get('/agents', requireAuth, requireRole('admin', 'agent'), adminController.listAgents);

router.get('/health', requireAuth, requireRole('admin'), (_req, res) => {
  res.json({ success: true, message: 'Admin router is active' });
});

export default router;
