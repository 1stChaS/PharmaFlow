import { pool } from '../config/database.js';
import { prescriptionRepository } from '../repositories/prescription.repository.js';

export const prescriptionService = {
  async list() {
    return prescriptionRepository.list();
  },

  async create(payload, user) {
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
};
