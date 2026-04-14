import { asyncHandler } from '../utils/async-handler.js';
import { sendSuccess } from '../utils/response.js';
import { deliveryAssignmentService } from '../services/delivery-assignment.service.js';

export const deliveryAssignmentController = {
  list: asyncHandler(async (_req, res) => {
    const data = await deliveryAssignmentService.list();
    return sendSuccess(res, data, 'Delivery assignments fetched');
  }),

  create: asyncHandler(async (req, res) => {
    const id = await deliveryAssignmentService.create(req.body, req.user);
    return sendSuccess(res, { id }, 'Delivery assignment created', 201);
  }),

  markDelivered: asyncHandler(async (req, res) => {
    await deliveryAssignmentService.markDelivered(Number(req.params.id), req.body, req.user);
    return sendSuccess(res, null, 'Delivery marked as delivered');
  }),
};
