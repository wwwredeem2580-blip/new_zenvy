import { Router } from 'express';
import {
  register,
  login,
  verifyEmailController,
  googleAuth,
  googleCallback,
  getMe,
  logout,
} from './controller';
import { requireAuth } from '../../middlewares/auth';

const router = Router();

// Manual auth
router.post('/register', register);
router.post('/login', login);
router.get('/verify-email', verifyEmailController);

// Google OAuth
router.get('/google', googleAuth);
router.get('/google/callback', googleCallback);

// Session
router.get('/me', requireAuth, getMe);
router.post('/logout', requireAuth, logout);

export default router;
