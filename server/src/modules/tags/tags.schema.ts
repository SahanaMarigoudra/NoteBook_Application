import { z } from 'zod';
import { Types } from 'mongoose';

const objectIdSchema = z.string().refine(
  (v) => Types.ObjectId.isValid(v),
  { message: 'Invalid ID format' }
);

export const createTagSchema = z.object({
  name: z.string().min(1).max(50).trim().toLowerCase(),
});

export const updateTagSchema = z.object({
  name: z.string().min(1).max(50).trim().toLowerCase(),
});

export const tagIdSchema = z.object({
  id: objectIdSchema,
});

export type CreateTagInput = z.infer<typeof createTagSchema>;
export type UpdateTagInput = z.infer<typeof updateTagSchema>;
