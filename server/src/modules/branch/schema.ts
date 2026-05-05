import { z } from 'zod';

export const BranchSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  address: z.string().min(1, 'Address is required'),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  workingHours: z.string().optional(),
  googleMapsUrl: z.string().url().optional().or(z.literal('')),
  isMain: z.boolean().optional(),
  isActive: z.boolean().optional()
});

export type BranchInput = z.infer<typeof BranchSchema>;
