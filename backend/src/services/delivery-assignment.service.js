import { ApiError } from '../utils/api-error.js';
import { deliveryAssignmentRepository } from '../repositories/delivery-assignment.repository.js';

export const deliveryAssignmentService = {
  async list() {
    return deliveryAssignmentRepository.list();
  },

  async create(payload, user) {
    const id = await deliveryAssignmentRepository.create({ ...payload, assignedBy: user.id });
    return id;
  },

  async markDelivered(assignmentId, payload, user) {
    const ok = await deliveryAssignmentRepository.markDelivered({
      assignmentId,
      nurseId: user.id,
      receivedByName: payload.receivedByName,
    });
    if (!ok) throw new ApiError(404, 'Delivery assignment not found');
  },
};
