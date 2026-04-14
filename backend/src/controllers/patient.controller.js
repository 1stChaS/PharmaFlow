import { asyncHandler } from '../utils/async-handler.js';
import { sendSuccess } from '../utils/response.js';
import { patientService } from '../services/patient.service.js';

export const patientController = {
  list: asyncHandler(async (_req, res) => {
    const data = await patientService.list();
    return sendSuccess(res, data, 'Patients fetched');
  }),

  getById: asyncHandler(async (req, res) => {
    const data = await patientService.getById(Number(req.params.id));
    return sendSuccess(res, data, 'Patient detail fetched');
  }),

  create: asyncHandler(async (req, res) => {
    const data = await patientService.create(req.body, req.user);
    return sendSuccess(res, data, 'Patient created', 201);
  }),
};
