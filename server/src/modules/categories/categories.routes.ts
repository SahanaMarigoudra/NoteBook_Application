import { Router } from 'express';
import * as controller from './categories.controller.js';
import { validate } from '../../middleware/validate.js';
import { authenticate } from '../../middleware/authenticate.js';
import { createCategorySchema, updateCategorySchema, categoryIdSchema } from './categories.schema.js';

const router = Router();
router.use(authenticate);

router.get('/', controller.list);
router.post('/', validate(createCategorySchema), controller.create);
router.patch('/:id', validate(categoryIdSchema, 'params'), validate(updateCategorySchema), controller.update);
router.delete('/:id', validate(categoryIdSchema, 'params'), controller.remove);

export default router;
