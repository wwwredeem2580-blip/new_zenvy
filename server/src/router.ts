import { Router } from 'express';
import authRoutes from './modules/auth/router';
import applicationRoutes from './modules/application/router';
import mediaRoutes from './modules/media/router';
import adminRoutes from './modules/admin/router';
import serviceRoutes from './modules/service/routes';


const router = Router();

router.use('/auth', authRoutes);
router.use('/applications', applicationRoutes);
router.use('/media', mediaRoutes);
router.use('/admin', adminRoutes);
router.use('/services', serviceRoutes);

export default router;
