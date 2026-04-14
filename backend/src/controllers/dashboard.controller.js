import { asyncHandler } from '../utils/async-handler.js';
import { sendSuccess } from '../utils/response.js';
import { dashboardService } from '../services/dashboard.service.js';

export const dashboardController = {
  stats: asyncHandler(async (req, res) => {
    const data = await dashboardService.getStats(req.user);
    return sendSuccess(res, data, 'Dashboard stats fetched');
  }),

  activity: asyncHandler(async (_req, res) => {
    const data = await dashboardService.getActivity();
    return sendSuccess(res, data, 'Recent activity fetched');
  }),
};
