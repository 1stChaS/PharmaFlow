import { pool } from '../config/database.js';

export const deliveryAssignmentRepository = {
  async create(connectionOrPayload, maybePayload) {
    const connection = maybePayload ? connectionOrPayload : pool;
    const payload = maybePayload || connectionOrPayload;

    const [result] = await connection.query(
      `INSERT INTO delivery_assignments (
        prescription_id, assigned_staff_id, assigned_by, building, delivery_location, notes
      ) VALUES (?, ?, ?, ?, ?, ?)`,
      [payload.prescriptionId, payload.assignedStaffId, payload.assignedBy, payload.building, payload.deliveryLocation, payload.notes || null],
    );
    return result.insertId;
  },

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

  async markPrescriptionDispatched(connectionOrPool, prescriptionId, reviewedBy) {
    const db = connectionOrPool || pool;
    const [result] = await db.query(
      `UPDATE prescriptions
       SET status = 'dispatched', reviewed_by = COALESCE(reviewed_by, ?), reviewed_at = COALESCE(reviewed_at, CURRENT_TIMESTAMP)
       WHERE id = ?`,
      [reviewedBy, prescriptionId],
    );
    return result.affectedRows > 0;
  },

  async markDelivered({ assignmentId, nurseId, receivedByName }) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const [[assignment]] = await connection.query(
        'SELECT prescription_id FROM delivery_assignments WHERE id = ? LIMIT 1',
        [assignmentId],
      );

      if (!assignment) {
        await connection.rollback();
        return false;
      }

      const [result] = await connection.query(
        `UPDATE delivery_assignments
         SET status = 'delivered', delivered_at = CURRENT_TIMESTAMP, marked_delivered_by = ?, received_by_name = ?
         WHERE id = ?`,
        [nurseId, receivedByName, assignmentId],
      );

      if (result.affectedRows === 0) {
        await connection.rollback();
        return false;
      }

      await connection.query(
        `UPDATE prescriptions
         SET status = 'delivered'
         WHERE id = ?`,
        [assignment.prescription_id],
      );

      await connection.commit();
      return true;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  },
};
