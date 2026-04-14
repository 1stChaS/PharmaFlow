import { Router } from 'express';
import { prescriptionController } from '../controllers/prescription.controller.js';
import { authenticate, authorize } from '../middlewares/auth.middleware.js';
import { ROLES } from '../constants/roles.js';

const router = Router();

router.use(authenticate);
router.get('/', authorize(ROLES.ADMINISTRATOR, ROLES.PHARMACIST, ROLES.DOCTOR, ROLES.NURSE), prescriptionController.list);
router.post('/', authorize(ROLES.DOCTOR), prescriptionController.create);
router.patch('/:id/approve', authorize(ROLES.PHARMACIST), prescriptionController.approve);
router.patch('/:id/reject', authorize(ROLES.PHARMACIST), prescriptionController.reject);
router.patch('/:id/dispatch', authorize(ROLES.PHARMACIST), prescriptionController.dispatch);

export default router;
