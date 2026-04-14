import { asyncHandler } from '../utils/async-handler.js';
import { sendSuccess } from '../utils/response.js';
import { prescriptionService } from '../services/prescription.service.js';

export const prescriptionController = {
  list: asyncHandler(async (_req, res) => {
    const data = await prescriptionService.list();
    return sendSuccess(res, data, 'Prescriptions fetched');
  }),

  create: asyncHandler(async (req, res) => {
    const data = await prescriptionService.create(req.body, req.user);
    return sendSuccess(res, data, 'Prescription created', 201);
  }),
};
