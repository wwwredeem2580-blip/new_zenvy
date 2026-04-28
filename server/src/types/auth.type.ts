import { Request } from 'express';

export type UserRole = 'admin' | 'agent' | 'client';

export interface JwtTokenPayload {
  userId: string;
  role: UserRole;
  email: string;
  isEmailVerified: boolean;
}

// Augment Express Request globally so req.user is available in all controllers
declare global {
  namespace Express {
    interface Request {
      user?: JwtTokenPayload;
    }
  }
}
