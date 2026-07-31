import { Router } from 'express';
import * as dashboardController from '../controllers/dashboardController.js';
import { authenticate } from '../middlewares/authenticate.js';

const router = Router();

router.get('/charts', authenticate, dashboardController.getCharts);

export default router;
