import { Router } from 'express';
import { deliveryAssignmentController } from '../controllers/delivery-assignment.controller.js';
import { authenticate, authorize } from '../middlewares/auth.middleware.js';
import { validationGuard } from '../middlewares/error.middleware.js';
import { createDeliveryAssignmentValidator, markDeliveredValidator } from '../validators/delivery-assignment.validator.js';
import { ROLES } from '../constants/roles.js';

const router = Router();

router.use(authenticate);
router.get('/', authorize(ROLES.ADMINISTRATOR, ROLES.PHARMACIST, ROLES.DOCTOR, ROLES.NURSE), deliveryAssignmentController.list);
router.post('/', authorize(ROLES.PHARMACIST), createDeliveryAssignmentValidator, validationGuard, deliveryAssignmentController.create);
router.patch('/:id/mark-delivered', authorize(ROLES.NURSE), markDeliveredValidator, validationGuard, deliveryAssignmentController.markDelivered);

export default router;
