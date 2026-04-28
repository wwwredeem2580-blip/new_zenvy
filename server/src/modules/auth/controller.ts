import { Request, Response } from 'express';
import { handleError } from '../../utils/handleError';
import { ACCESS_TOKEN_CONFIG } from '../../utils/cookieConfig';
import {
  registerManual,
  loginManual,
  verifyEmail,
  getGoogleAuthUrl,
  handleGoogleCallback,
  resendVerificationEmail,
} from './service';
import { RegisterSchema, LoginSchema } from './schema';

// ─── POST /auth/resend-verification ──────────────────────────────────────────
export const resendVerification = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const result = await resendVerificationEmail(userId);
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    handleError(error, res);
  }
};

// ─── POST /auth/register ──────────────────────────────────────────────────────
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const parsed = RegisterSchema.parse(req.body);
    const result = await registerManual(parsed);
    res.status(201).json({ success: true, ...result });
  } catch (error) {
    handleError(error, res);
  }
};

// ─── POST /auth/login ─────────────────────────────────────────────────────────
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const parsed = LoginSchema.parse(req.body);
    const { token, user } = await loginManual(parsed);

    res.cookie('accessToken', token, ACCESS_TOKEN_CONFIG);
    res.status(200).json({ success: true, user });
  } catch (error) {
    handleError(error, res);
  }
};

// ─── GET /auth/verify-email?token=... ────────────────────────────────────────
export const verifyEmailController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token } = req.query;
    await verifyEmail(token as string);

    // Redirect to client with success flag so the frontend can show a success message
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
    res.redirect(`${clientUrl}/login?verified=true`);
  } catch (error: any) {
    // Redirect to client with error flag
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
    const message = encodeURIComponent(error.message || 'Verification failed');
    res.redirect(`${clientUrl}/login?verified=false&error=${message}`);
  }
};

// ─── GET /auth/google ─────────────────────────────────────────────────────────
export const googleAuth = async (_req: Request, res: Response): Promise<void> => {
  try {
    const url = getGoogleAuthUrl();
    res.redirect(url);
  } catch (error) {
    handleError(error, res);
  }
};

// ─── GET /auth/google/callback ────────────────────────────────────────────────
export const googleCallback = async (req: Request, res: Response): Promise<void> => {
  try {
    const { code } = req.query;
    const { token, user } = await handleGoogleCallback(code as string);

    res.cookie('accessToken', token, ACCESS_TOKEN_CONFIG);

    // Redirect back to the client portal after successful Google auth
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
    res.redirect(`${clientUrl}?auth=google&role=${user.role}`);
  } catch (error: any) {
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
    const message = encodeURIComponent(error.message || 'Google authentication failed');
    res.redirect(`${clientUrl}/login?error=${message}`);
  }
};

// ─── GET /auth/me ─────────────────────────────────────────────────────────────
export const getMe = async (req: Request, res: Response): Promise<void> => {
  try {
    // req.user is set by requireAuth middleware
    res.status(200).json({ success: true, user: req.user });
  } catch (error) {
    handleError(error, res);
  }
};

// ─── POST /auth/logout ────────────────────────────────────────────────────────
export const logout = async (_req: Request, res: Response): Promise<void> => {
  try {
    res.clearCookie('accessToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });
    res.status(200).json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    handleError(error, res);
  }
};
