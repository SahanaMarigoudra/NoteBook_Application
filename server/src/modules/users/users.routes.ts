import { Router } from 'express';
import * as controller from './users.controller.js';
import { validate } from '../../middleware/validate.js';
import { authenticate } from '../../middleware/authenticate.js';
import { updateProfileSchema, deleteAccountSchema } from './users.schema.js';

const router = Router();
router.use(authenticate);
router.patch('/me', validate(updateProfileSchema), controller.updateMe);
router.delete('/me', validate(deleteAccountSchema), controller.deleteMe);
export default router;
