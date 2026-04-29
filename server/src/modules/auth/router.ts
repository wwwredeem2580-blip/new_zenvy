import { Router } from 'express';
import {
  register,
  login,
  verifyEmailController,
  googleAuth,
  googleCallback,
  getMe,
  logout,
  resendVerification,
  verifyInvitationController,
  registerAgentController,
} from './controller';
import { requireAuth } from '../../middlewares/auth';

const router = Router();

// Manual auth
router.post('/register', register);
router.post('/login', login);
router.post('/resend-verification', requireAuth, resendVerification);
router.get('/verify-email', verifyEmailController);

// Google OAuth
router.get('/google', googleAuth);
router.get('/google/callback', googleCallback);

// Session
router.get('/me', requireAuth, getMe);
router.post('/logout', requireAuth, logout);

// Staff Onboarding
router.get('/invitations/:token', verifyInvitationController);
router.post('/register-agent', registerAgentController);

export default router;
