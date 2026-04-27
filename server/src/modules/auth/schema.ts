import { z } from 'zod';
import { sanitizedString } from '../../utils/zodSanitizer';

export const RegisterSchema = z.object({
  firstName: sanitizedString({ min: 1, max: 50 }),
  lastName: sanitizedString({ min: 1, max: 50 }),
  email: z
    .string()
    .email('Please provide a valid email address')
    .transform((val) => val.trim().toLowerCase()),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password is too long'),
});

export const LoginSchema = z.object({
  email: z
    .string()
    .email('Please provide a valid email address')
    .transform((val) => val.trim().toLowerCase()),
  password: z.string().min(1, 'Password is required'),
});

export type RegisterInput = z.infer<typeof RegisterSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
