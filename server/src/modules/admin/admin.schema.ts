import { z } from 'zod';
import { Types } from 'mongoose';

const objectIdSchema = z.string().refine((v) => Types.ObjectId.isValid(v), {
  message: 'Invalid ObjectId format',
});

export const updateRoleSchema = z.object({
  role: z.enum(['user', 'admin']),
});

export const updateStatusSchema = z.object({
  status: z.enum(['active', 'suspended']),
});

export const updateSettingsSchema = z.object({
  appName: z.string().min(1).max(100).optional(),
  allowRegistration: z.boolean().optional(),
  sessionTimeoutMinutes: z.number().int().min(15).max(43200).optional(),
  maintenanceMode: z.boolean().optional(),
  maxNotesPerUser: z.number().int().min(10).max(100000).optional(),
  passwordMinLength: z.number().int().min(6).max(32).optional(),
});

export const adminUserQuerySchema = z.object({
  search: z.string().max(100).optional(),
  role: z.enum(['all', 'user', 'admin']).default('all'),
  status: z.enum(['all', 'active', 'suspended']).default('all'),
  page: z.string().default('1').transform((v) => Math.max(1, parseInt(v, 10) || 1)),
  limit: z.string().default('10').transform((v) => Math.min(100, Math.max(1, parseInt(v, 10) || 10))),
  sort: z.enum(['createdAt', 'name', 'email', 'lastActiveAt']).default('createdAt'),
  order: z.enum(['asc', 'desc']).default('desc'),
});

export const adminNoteQuerySchema = z.object({
  search: z.string().max(100).optional(),
  status: z.enum(['all', 'active', 'archived', 'trashed']).default('all'),
  userId: objectIdSchema.optional(),
  categoryId: objectIdSchema.optional(),
  page: z.string().default('1').transform((v) => Math.max(1, parseInt(v, 10) || 1)),
  limit: z.string().default('10').transform((v) => Math.min(100, Math.max(1, parseInt(v, 10) || 10))),
});

export const adminAuditQuerySchema = z.object({
  search: z.string().max(100).optional(),
  action: z.string().optional(),
  targetType: z.enum(['all', 'user', 'note', 'category', 'tag', 'settings', 'system']).default('all'),
  page: z.string().default('1').transform((v) => Math.max(1, parseInt(v, 10) || 1)),
  limit: z.string().default('15').transform((v) => Math.min(100, Math.max(1, parseInt(v, 10) || 15))),
});

export const adminViewContentSchema = z.object({
  reason: z.string().min(3, 'A valid administrative reason is required for privacy tracking').max(300),
});
