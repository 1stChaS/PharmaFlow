import { asyncHandler } from '../utils/async-handler.js';
import { sendSuccess } from '../utils/response.js';
import { reportService } from '../services/report.service.js';

export const reportController = {
  adminDistributionMonitoring: asyncHandler(async (_req, res) => {
    const data = await reportService.adminDistributionMonitoring();
    return sendSuccess(res, data, 'Distribution monitoring report fetched');
  }),
};
