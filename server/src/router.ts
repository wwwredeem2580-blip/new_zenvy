import { Router } from 'express';
import authRoutes from './modules/auth/router';
import mediaRoutes from './modules/media/router';
import adminRoutes from './modules/admin/router';


const router = Router();

router.use('/auth', authRoutes);
router.use('/media', mediaRoutes);
router.use('/admin', adminRoutes);

export default router;
