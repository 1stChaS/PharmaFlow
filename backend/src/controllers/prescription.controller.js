import { asyncHandler } from '../utils/async-handler.js';
import { sendSuccess } from '../utils/response.js';
import { prescriptionService } from '../services/prescription.service.js';

export const prescriptionController = {
  list: asyncHandler(async (req, res) => {
    const data = await prescriptionService.list(req.user);
    return sendSuccess(res, data, 'Prescriptions fetched');
  }),

  create: asyncHandler(async (req, res) => {
    const data = await prescriptionService.create(req.body, req.user);
    return sendSuccess(res, data, 'Prescription created', 201);
  }),

  approve: asyncHandler(async (req, res) => {
    const data = await prescriptionService.approve(Number(req.params.id), req.user);
    return sendSuccess(res, data, 'Prescription approved');
  }),

  reject: asyncHandler(async (req, res) => {
    const data = await prescriptionService.reject(Number(req.params.id), req.body, req.user);
    return sendSuccess(res, data, 'Prescription rejected');
  }),

  dispatch: asyncHandler(async (req, res) => {
    const data = await prescriptionService.dispatch(Number(req.params.id), req.user);
    return sendSuccess(res, data, 'Prescription dispatched');
  }),
};
