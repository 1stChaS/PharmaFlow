import { pool } from '../config/database.js';

export const deliveryAssignmentRepository = {
  async create(payload) {
    const [result] = await pool.query(
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

  async markDelivered({ assignmentId, nurseId, receivedByName }) {
    const [result] = await pool.query(
      `UPDATE delivery_assignments
       SET status = 'delivered', delivered_at = CURRENT_TIMESTAMP, marked_delivered_by = ?, received_by_name = ?
       WHERE id = ?`,
      [nurseId, receivedByName, assignmentId],
    );
    return result.affectedRows > 0;
  },
};
