import { asyncHandler } from '../utils/async-handler.js';
import { sendSuccess } from '../utils/response.js';
import { userService } from '../services/user.service.js';

export const userController = {
  list: asyncHandler(async (req, res) => {
    const data = await userService.list(req.query);
    return sendSuccess(res, data, 'Users fetched');
  }),

  create: asyncHandler(async (req, res) => {
    const id = await userService.create(req.body, req.user);
    return sendSuccess(res, { id }, 'User created', 201);
  }),

  update: asyncHandler(async (req, res) => {
    await userService.update(Number(req.params.id), req.body, req.user);
    return sendSuccess(res, null, 'User updated');
  }),
};
