import { Router } from 'express';
import { userController } from '../controllers/user.controller.js';
import { authenticate, authorize } from '../middlewares/auth.middleware.js';
import { ROLES } from '../constants/roles.js';

const router = Router();

router.use(authenticate);

// allow nurse to fetch doctor list
router.get('/', authorize(ROLES.ADMINISTRATOR, ROLES.NURSE), userController.list);

router.post('/', authorize(ROLES.ADMINISTRATOR), userController.create);
router.put('/:id', authorize(ROLES.ADMINISTRATOR), userController.update);

export default router;