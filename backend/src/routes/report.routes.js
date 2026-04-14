import { Router } from 'express';
import { reportController } from '../controllers/report.controller.js';
import { authenticate, authorize } from '../middlewares/auth.middleware.js';
import { ROLES } from '../constants/roles.js';

const router = Router();

router.get('/distribution-monitoring', authenticate, authorize(ROLES.ADMINISTRATOR), reportController.adminDistributionMonitoring);

export default router;
