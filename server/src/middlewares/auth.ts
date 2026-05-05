import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/auth/token';
import { UserRole } from '../types/auth.type';
import CustomError from '../utils/CustomError';

/**
 * requireAuth — verifies the accessToken cookie (or Authorization Bearer header).
 * Attaches decoded payload to req.user.
 */
export const requireAuth = (req: Request, res: Response, next: NextFunction): void => {
  try {
    // Support both cookie and Authorization header so the API works from web clients and tools like Postman
    const token =
      req.cookies?.accessToken ||
      (req.headers.authorization?.startsWith('Bearer ')
        ? req.headers.authorization.split(' ')[1]
        : undefined);

    if (!token) {
      throw new CustomError('Unauthorized — no token provided', 401);
    }

    const decoded = verifyToken(token, process.env.JWT_ACCESS_TOKEN_SECRET!);
    req.user = decoded;
    next();
  } catch (error: any) {
    res.status(error.status || 401).json({
      success: false,
      message: error.message || 'Unauthorized',
    });
  }
};

/**
 * requireRole — role-gate factory.
 * Usage: router.get('/admin-only', requireAuth, requireRole('admin'), handler)
 */
export const requireRole = (...roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }
    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: `Access denied — required role: ${roles.join(' or ')}`,
      });
      return;
    }
    next();
  };
};
