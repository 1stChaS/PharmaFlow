import { asyncHandler } from '../utils/async-handler.js';
import { sendSuccess } from '../utils/response.js';
import { authService } from '../services/auth.service.js';

export const authController = {
  login: asyncHandler(async (req, res) => {
    const data = await authService.login({ ...req.body, ipAddress: req.ip });
    return sendSuccess(res, data, 'Login successful');
  }),

  me: asyncHandler(async (req, res) => {
    const data = await authService.me(req.user.id);
    return sendSuccess(res, data, 'Current user fetched');
  }),
};
