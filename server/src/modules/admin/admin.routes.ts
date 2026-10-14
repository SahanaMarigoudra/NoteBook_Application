import { Router } from 'express';
import * as controller from './admin.controller.js';
import { authenticate, requireAdmin } from '../../middleware/authenticate.js';
import { validate } from '../../middleware/validate.js';
import {
  adminUserQuerySchema,
  adminNoteQuerySchema,
  adminAuditQuerySchema,
  updateRoleSchema,
  updateStatusSchema,
  updateSettingsSchema,
} from './admin.schema.js';

const router = Router();

// Enforce authentication AND administrator role for ALL /api/v1/admin/* routes
router.use(authenticate);
router.use(requireAdmin);

// Dashboard & Analytics
router.get('/dashboard', controller.getDashboard);

// User Management
router.get('/users', validate(adminUserQuerySchema, 'query'), controller.listUsers);
router.get('/users/:id', controller.getUserDetails);
router.patch('/users/:id/role', validate(updateRoleSchema), controller.updateUserRole);
router.patch('/users/:id/status', validate(updateStatusSchema), controller.updateUserStatus);
router.delete('/users/:id', controller.deleteUser);

// Notes Management
router.get('/notes', validate(adminNoteQuerySchema, 'query'), controller.listNotes);
router.get('/notes/:id', controller.getNoteDetails);
router.delete('/notes/:id', controller.deleteNote);

// Category & Tag Management
router.get('/categories', controller.listCategories);
router.delete('/categories/:id', controller.deleteCategory);
router.get('/tags', controller.listTags);
router.delete('/tags/:id', controller.deleteTag);

// Audit Logs
router.get('/audit-logs', validate(adminAuditQuerySchema, 'query'), controller.listAuditLogs);

// System Settings & Health
router.get('/settings', controller.getSettings);
router.patch('/settings', validate(updateSettingsSchema), controller.updateSettings);
router.get('/health', controller.getHealth);

export default router;
