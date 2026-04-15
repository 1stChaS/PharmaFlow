import { Router } from 'express';
import { inventoryController } from '../controllers/inventory.controller.js';
import { authenticate, authorize } from '../middlewares/auth.middleware.js';
import { ROLES } from '../constants/roles.js';

const router = Router();

router.use(authenticate);

router.get(
  '/stock-status',
  authorize(
    ROLES.ADMINISTRATOR,
    ROLES.PHARMACIST,
    ROLES.DOCTOR,
    ROLES.NURSE
  ),
  inventoryController.getStockStatus
);

export default router;
