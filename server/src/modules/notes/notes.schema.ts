import { z } from 'zod';
import { Types } from 'mongoose';

const objectIdSchema = z.string().refine(
  (v) => Types.ObjectId.isValid(v),
  { message: 'Invalid ID format' }
);

export const createNoteSchema = z.object({
  title: z.string().min(1, 'Title is required').max(500),
  content: z.string().max(500000).default(''),
  categoryId: objectIdSchema.nullable().optional(),
  tags: z.array(objectIdSchema).max(20).default([]),
  isPinned: z.boolean().default(false),
  isFavorite: z.boolean().default(false),
});

export const updateNoteSchema = z.object({
  title: z.string().min(1).max(500).optional(),
  content: z.string().max(500000).optional(),
  categoryId: objectIdSchema.nullable().optional(),
  tags: z.array(objectIdSchema).max(20).optional(),
  isPinned: z.boolean().optional(),
  isFavorite: z.boolean().optional(),
});

export const noteQuerySchema = z.object({
  page: z.string().default('1').transform(Number),
  limit: z.string().default('20').transform((v) => Math.min(Number(v), 100)),
  sort: z.enum(['updatedAt', 'createdAt', 'title', 'isPinned']).default('updatedAt'),
  order: z.enum(['asc', 'desc']).default('desc'),
  search: z.string().max(200).optional(),
  categoryId: objectIdSchema.optional(),
  tag: objectIdSchema.optional(),
  isFavorite: z.enum(['true', 'false']).optional(),
  isArchived: z.enum(['true', 'false']).optional(),
});

export const noteIdSchema = z.object({
  id: objectIdSchema,
});

export type CreateNoteInput = z.infer<typeof createNoteSchema>;
export type UpdateNoteInput = z.infer<typeof updateNoteSchema>;
export type NoteQuery = z.infer<typeof noteQuerySchema>;
