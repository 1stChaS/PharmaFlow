import { pool } from '../config/database.js';
import { ApiError } from '../utils/api-error.js';

export const deliveryAssignmentService = {
  async list() {
    const [rows] = await pool.query(
      `SELECT da.*, p.prescription_number, pa.full_name AS patient_name,
              s.full_name AS assigned_staff_name,
              a.full_name AS assigned_by_name,
              n.full_name AS marked_delivered_by_name
       FROM delivery_assignments da
       JOIN prescriptions p ON da.prescription_id = p.id
       JOIN patients pa ON p.patient_id = pa.id
       JOIN users s ON da.assigned_staff_id = s.id
       JOIN users a ON da.assigned_by = a.id
       LEFT JOIN users n ON da.marked_delivered_by = n.id
       ORDER BY da.created_at DESC`,
    );
    return rows;
  },

  async create(payload, user) {
    if (!payload.prescriptionId || !payload.assignedStaffId || !payload.building) {
      throw new ApiError(400, 'prescriptionId, assignedStaffId, and building are required');
    }

    const [prescriptionRows] = await pool.query(
      'SELECT id, status FROM prescriptions WHERE id = ? LIMIT 1',
      [payload.prescriptionId],
    );
    const prescription = prescriptionRows[0] || null;
    if (!prescription) throw new ApiError(404, 'Prescription not found');
    if (!['approved', 'ready', 'dispatched'].includes(prescription.status)) {
      throw new ApiError(400, 'Prescription must be approved before delivery assignment');
    }

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const [result] = await connection.query(
        `INSERT INTO delivery_assignments (
          prescription_id, assigned_staff_id, assigned_by, building, delivery_location, notes
        ) VALUES (?, ?, ?, ?, ?, ?)`,
        [
          payload.prescriptionId,
          payload.assignedStaffId,
          user.id,
          payload.building,
          payload.deliveryLocation || null,
          payload.notes || null,
        ],
      );

      await connection.query(
        `UPDATE prescriptions
         SET status = 'dispatched', reviewed_by = COALESCE(reviewed_by, ?), reviewed_at = COALESCE(reviewed_at, CURRENT_TIMESTAMP)
         WHERE id = ?`,
        [user.id, payload.prescriptionId],
      );

      await connection.commit();
      return result.insertId;
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  },

  async markDelivered(assignmentId, payload, user) {
    const receivedByName = payload?.receivedByName?.trim();
    if (!receivedByName) throw new ApiError(400, 'receivedByName is required');

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const [assignmentRows] = await connection.query(
        'SELECT id, prescription_id FROM delivery_assignments WHERE id = ? LIMIT 1',
        [assignmentId],
      );
      const assignment = assignmentRows[0] || null;
      if (!assignment) throw new ApiError(404, 'Delivery assignment not found');

      await connection.query(
        `UPDATE delivery_assignments
         SET status = 'delivered', delivered_at = CURRENT_TIMESTAMP, marked_delivered_by = ?, received_by_name = ?
         WHERE id = ?`,
        [user.id, receivedByName, assignmentId],
      );

      await connection.query(
        `UPDATE prescriptions
         SET status = 'delivered'
         WHERE id = ?`,
        [assignment.prescription_id],
      );

      await connection.commit();
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  },
};
