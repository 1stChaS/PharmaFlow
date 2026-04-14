import { Router } from 'express';
import { authController } from '../controllers/auth.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { validationGuard } from '../middlewares/error.middleware.js';
import { loginValidator } from '../validators/auth.validator.js';

const router = Router();

router.post('/login', loginValidator, validationGuard, authController.login);
router.get('/me', authenticate, authController.me);

export default router;
