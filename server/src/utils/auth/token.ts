import jwt from 'jsonwebtoken';
import { JwtTokenPayload } from '../../types/auth.type';
import CustomError from '../CustomError';

// Access-token-only architecture — no refresh tokens needed for CAF.
// 7d expiry is practical for a back-office tool.
export const generateAccessToken = (payload: JwtTokenPayload): string => {
  return jwt.sign(
    payload,
    process.env.JWT_ACCESS_TOKEN_SECRET!,
    { expiresIn: '7d' }
  );
};

export const verifyToken = (token: string, secret: string): JwtTokenPayload => {
  try {
    return jwt.verify(token, secret) as JwtTokenPayload;
  } catch {
    throw new CustomError('Unauthorized', 401);
  }
};