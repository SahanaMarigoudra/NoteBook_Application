import { Router } from 'express';
import * as controller from './trash.controller.js';
import { authenticate } from '../../middleware/authenticate.js';

const router = Router();
router.use(authenticate);

router.get('/', controller.list);
router.post('/:id/restore', controller.restore);
router.delete('/:id', controller.permanentDelete);
router.delete('/', controller.emptyTrash);

export default router;
