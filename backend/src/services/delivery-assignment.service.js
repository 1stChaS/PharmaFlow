import { pool } from '../config/database.js';
import { ApiError } from '../utils/api-error.js';
import { deliveryAssignmentRepository } from '../repositories/delivery-assignment.repository.js';
import { prescriptionRepository } from '../repositories/prescription.repository.js';

export const deliveryAssignmentService = {
  async list() {
    return deliveryAssignmentRepository.list();
  },

  async create(payload, user) {
    const prescription = await prescriptionRepository.findById(payload.prescriptionId);
    if (!prescription) {
      throw new ApiError(404, 'Prescription not found');
    }

    if (!['approved', 'ready', 'preparing', 'dispatched'].includes(prescription.status)) {
      throw new ApiError(400, 'Only approved prescriptions can be assigned for delivery');
    }

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const id = await deliveryAssignmentRepository.create(connection, {
        ...payload,
        assignedBy: user.id,
      });

      await deliveryAssignmentRepository.markPrescriptionDispatched(connection, payload.prescriptionId, user.id);

      await connection.commit();
      return id;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
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
