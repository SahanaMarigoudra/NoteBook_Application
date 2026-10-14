import { Router } from 'express';
import * as controller from './dashboard.controller.js';
import { authenticate } from '../../middleware/authenticate.js';

const router = Router();
router.use(authenticate);
router.get('/summary', controller.summary);
router.get('/activity', controller.activity);
export default router;
