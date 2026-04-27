import { Router } from 'express';
import { requireAuth, requireRole } from '../../middlewares/auth';

const router = Router();

// Placeholder — admin routes will be built after auth is complete.
// All routes here require auth and admin/agent role.

router.get('/health', requireAuth, requireRole('admin'), (_req, res) => {
  res.json({ success: true, message: 'Admin router is active' });
});

export default router;
