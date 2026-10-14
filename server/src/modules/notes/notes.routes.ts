import { Router } from 'express';
import * as controller from './notes.controller.js';
import { validate } from '../../middleware/validate.js';
import { authenticate } from '../../middleware/authenticate.js';
import { createNoteSchema, updateNoteSchema, noteQuerySchema, noteIdSchema } from './notes.schema.js';

const router = Router();
router.use(authenticate);

router.get('/', validate(noteQuerySchema, 'query'), controller.list);
router.post('/', validate(createNoteSchema), controller.create);
router.get('/:id', validate(noteIdSchema, 'params'), controller.getOne);
router.patch('/:id', validate(noteIdSchema, 'params'), validate(updateNoteSchema), controller.update);
router.delete('/:id', validate(noteIdSchema, 'params'), controller.remove);
router.patch('/:id/pin', validate(noteIdSchema, 'params'), controller.pin);
router.patch('/:id/favorite', validate(noteIdSchema, 'params'), controller.favorite);
router.patch('/:id/archive', validate(noteIdSchema, 'params'), controller.archive);

export default router;
