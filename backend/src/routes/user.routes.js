import { Router } from 'express';
import { userController } from '../controllers/user.controller.js';
import { authenticate, authorize } from '../middlewares/auth.middleware.js';
import { validationGuard } from '../middlewares/error.middleware.js';
import { createUserValidator, updateUserValidator } from '../validators/user.validator.js';
import { ROLES } from '../constants/roles.js';

const router = Router();

router.use(authenticate, authorize(ROLES.ADMINISTRATOR));
router.get('/', userController.list);
router.post('/', createUserValidator, validationGuard, userController.create);
router.put('/:id', updateUserValidator, validationGuard, userController.update);

export default router;
