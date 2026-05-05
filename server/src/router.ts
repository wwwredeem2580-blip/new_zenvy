import { Router } from 'express';
import authRoutes from './modules/auth/router';
import applicationRoutes from './modules/application/router';
import mediaRoutes from './modules/media/router';
import adminRoutes from './modules/admin/router';
import serviceRoutes from './modules/service/routes';
import branchRoutes from './modules/branch/router';
import { getPaymentSettings } from './modules/admin/paymentSettings.controller';

const router = Router();

router.use('/auth', authRoutes);
router.use('/applications', applicationRoutes);
router.use('/media', mediaRoutes);
router.use('/admin', adminRoutes);
router.use('/services', serviceRoutes);
router.use('/branches', branchRoutes);

// Public payment settings (no auth — needed for payment modal before login)
router.get('/payment-settings', getPaymentSettings);

export default router;
