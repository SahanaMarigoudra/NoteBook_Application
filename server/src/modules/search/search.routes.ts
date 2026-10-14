import { Router } from 'express';
import { search } from './search.controller.js';
import { authenticate } from '../../middleware/authenticate.js';
import { searchRateLimit } from '../../middleware/rate-limit.js';

const router = Router();
router.get('/', authenticate, searchRateLimit, search);
export default router;
