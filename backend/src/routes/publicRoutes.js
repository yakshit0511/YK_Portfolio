import { Router } from 'express';

import { getPortfolio } from '../controllers/publicController.js';

const router = Router();

router.get('/portfolio', getPortfolio);

export default router;
