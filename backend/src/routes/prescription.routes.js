import { Router } from 'express';
import { prescriptionController } from '../controllers/prescription.controller.js';
import { authenticate, authorize } from '../middlewares/auth.middleware.js';
import { validationGuard } from '../middlewares/error.middleware.js';
import { createPrescriptionValidator } from '../validators/prescription.validator.js';
import { ROLES } from '../constants/roles.js';

const router = Router();

router.use(authenticate);
router.get('/', authorize(ROLES.ADMINISTRATOR, ROLES.PHARMACIST, ROLES.DOCTOR, ROLES.NURSE), prescriptionController.list);
router.post('/', authorize(ROLES.DOCTOR), createPrescriptionValidator, validationGuard, prescriptionController.create);

export default router;
