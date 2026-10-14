import { z } from 'zod';

export const updateProfileSchema = z.object({
  name: z.string().min(2).max(100).trim().optional(),
});

export const deleteAccountSchema = z.object({
  password: z.string().min(1, 'Password confirmation is required'),
});
