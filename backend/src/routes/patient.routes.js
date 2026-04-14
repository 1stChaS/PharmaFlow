import { Router } from 'express';
import { patientController } from '../controllers/patient.controller.js';
import { authenticate, authorize } from '../middlewares/auth.middleware.js';
import { validationGuard } from '../middlewares/error.middleware.js';
import { createPatientValidator } from '../validators/patient.validator.js';
import { ROLES } from '../constants/roles.js';

const router = Router();

router.use(authenticate);
router.get('/', authorize(ROLES.ADMINISTRATOR, ROLES.PHARMACIST, ROLES.DOCTOR, ROLES.NURSE), patientController.list);
router.get('/:id', authorize(ROLES.ADMINISTRATOR, ROLES.PHARMACIST, ROLES.DOCTOR, ROLES.NURSE), patientController.getById);
router.post('/', authorize(ROLES.NURSE, ROLES.ADMINISTRATOR), createPatientValidator, validationGuard, patientController.create);

export default router;
