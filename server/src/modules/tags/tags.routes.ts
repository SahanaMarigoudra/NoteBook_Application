import { Router } from 'express';
import * as controller from './tags.controller.js';
import { validate } from '../../middleware/validate.js';
import { authenticate } from '../../middleware/authenticate.js';
import { createTagSchema, updateTagSchema, tagIdSchema } from './tags.schema.js';

const router = Router();
router.use(authenticate);

router.get('/', controller.list);
router.post('/', validate(createTagSchema), controller.create);
router.patch('/:id', validate(tagIdSchema, 'params'), validate(updateTagSchema), controller.update);
router.delete('/:id', validate(tagIdSchema, 'params'), controller.remove);

export default router;
