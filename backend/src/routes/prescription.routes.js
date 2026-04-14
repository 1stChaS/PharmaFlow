import { Router } from 'express';
import { prescriptionController } from '../controllers/prescription.controller.js';
import { authenticate, authorize } from '../middlewares/auth.middleware.js';
import { validationGuard } from '../middlewares/error.middleware.js';
import {
  createPrescriptionValidator,
  rejectPrescriptionValidator,
  dispatchPrescriptionValidator,
} from '../validators/prescription.validator.js';
import { ROLES } from '../constants/roles.js';

const router = Router();

router.use(authenticate);

router.get('/', authorize(ROLES.ADMINISTRATOR, ROLES.PHARMACIST, ROLES.DOCTOR, ROLES.NURSE), prescriptionController.list);
router.post('/', authorize(ROLES.DOCTOR), createPrescriptionValidator, validationGuard, prescriptionController.create);
router.patch('/:id/approve', authorize(ROLES.PHARMACIST), prescriptionController.approve);
router.patch('/:id/reject', authorize(ROLES.PHARMACIST), rejectPrescriptionValidator, validationGuard, prescriptionController.reject);
router.patch('/:id/dispatch', authorize(ROLES.PHARMACIST), dispatchPrescriptionValidator, validationGuard, prescriptionController.dispatch);

export default router;
