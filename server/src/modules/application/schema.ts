import { z } from 'zod';

export const SubServiceSchema = z.object({
  name: z.string(),
  price: z.number(),
  duration: z.string(),
});

export const CreateApplicationSchema = z.object({
  name: z.string().min(2, 'Name is too short'),
  dob: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
  pob: z.string().min(2, 'Place of birth is required'),
  nationality: z.string().min(2, 'Nationality is required'),
  codiceFiscale: z.string().length(16, 'Codice Fiscale must be 16 characters'),
  phone: z.string().min(5, 'Phone number is required'),
  email: z.string().email('Invalid email address'),
  address: z.string().min(5, 'Address is required'),
  streetAddress: z.string().optional(),
  postCode: z.string().optional(),
  province: z.string().optional(),
  permessoType: z.string().optional(),
  permessoExpiry: z.string().optional(),
  paymentMethod: z.enum(['Cash', 'Revolut', 'PostPay', 'Card', 'Credits']),
  selectedServices: z.array(SubServiceSchema).min(1, 'At least one service must be selected'),
  transactionId: z.string().optional(),
  attachments: z.array(z.object({
    name: z.string(),
    url: z.string(),
    uploadedBy: z.string(),
    uploadedById: z.string(),
    uploadedAt: z.string().optional(),
  })).optional(),
});

export type CreateApplicationInput = z.infer<typeof CreateApplicationSchema>;
