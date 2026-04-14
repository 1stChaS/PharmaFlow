import { pool } from '../config/database.js';
import { prescriptionRepository } from '../repositories/prescription.repository.js';
import { patientRepository } from '../repositories/patient.repository.js';
import { ApiError } from '../utils/api-error.js';

const APPROVABLE_STATUSES = new Set(['pending']);
const REJECTABLE_STATUSES = new Set(['pending']);
const DISPATCHABLE_STATUSES = new Set(['approved', 'ready', 'preparing']);

export const prescriptionService = {
  async list(user) {
    return prescriptionRepository.list(user);
  },

  async create(payload, user) {
    const patient = await patientRepository.findById(payload.patientId);
    if (!patient) {
      throw new ApiError(404, 'Patient not found');
    }
    if (patient.assigned_doctor_id !== user.id) {
      throw new ApiError(403, 'You can only prescribe for patients assigned to you');
    }

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const prescriptionNumber = `PRX-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;
      const prescriptionId = await prescriptionRepository.create(connection, {
        prescriptionNumber,
        patientId: payload.patientId,
        prescribedBy: user.id,
        priority: payload.priority,
        diagnosis: payload.diagnosis,
        notes: payload.notes,
      });

      for (const item of payload.items) {
        await prescriptionRepository.createItem(connection, prescriptionId, item);
      }

      await connection.commit();
      return { id: prescriptionId, prescriptionNumber };
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  },

  async approve(prescriptionId, user) {
    const prescription = await prescriptionRepository.findById(prescriptionId);
    if (!prescription) {
      throw new ApiError(404, 'Prescription not found');
    }
    if (!APPROVABLE_STATUSES.has(prescription.status)) {
      throw new ApiError(400, `Prescription cannot be approved from status: ${prescription.status}`);
    }

    await prescriptionRepository.updateReviewStatus({
      prescriptionId,
      status: 'approved',
      reviewedBy: user.id,
      rejectionReason: null,
    });

    return prescriptionRepository.findById(prescriptionId);
  },

  async reject(prescriptionId, reason, user) {
    const prescription = await prescriptionRepository.findById(prescriptionId);
    if (!prescription) {
      throw new ApiError(404, 'Prescription not found');
    }
    if (!REJECTABLE_STATUSES.has(prescription.status)) {
      throw new ApiError(400, `Prescription cannot be rejected from status: ${prescription.status}`);
    }

    await prescriptionRepository.updateReviewStatus({
      prescriptionId,
      status: 'rejected',
      reviewedBy: user.id,
      rejectionReason: reason,
    });

    return prescriptionRepository.findById(prescriptionId);
  },

  async dispatch(prescriptionId, payload, user) {
    const prescription = await prescriptionRepository.findById(prescriptionId);
    if (!prescription) {
      throw new ApiError(404, 'Prescription not found');
    }
    if (!DISPATCHABLE_STATUSES.has(prescription.status)) {
      throw new ApiError(400, `Prescription cannot be dispatched from status: ${prescription.status}`);
    }

    await prescriptionRepository.markDispatched({
      prescriptionId,
      reviewedBy: user.id,
      notes: payload.notes || null,
    });

    return prescriptionRepository.findById(prescriptionId);
  },
};
