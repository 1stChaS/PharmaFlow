import { Router } from 'express';
import { userController } from '../controllers/user.controller.js';
import { authenticate, authorize } from '../middlewares/auth.middleware.js';
import { ROLES } from '../constants/roles.js';

const router = Router();

router.use(authenticate, authorize(ROLES.ADMINISTRATOR));
router.get('/', userController.list);
router.post('/', userController.create);
router.put('/:id', userController.update);

export default router;
