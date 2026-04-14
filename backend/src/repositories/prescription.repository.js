import { pool } from '../config/database.js';

const baseSelect = `SELECT p.*, pa.full_name AS patient_name, pa.patient_number,
        pa.age, pa.gender, pa.weight, pa.height, pa.blood_pressure, pa.bmi,
        pa.underlying_conditions, pa.allergies, pa.chief_complaint,
        pa.building, pa.room_number,
        doc.full_name AS prescribed_by_name,
        rev.full_name AS reviewed_by_name
 FROM prescriptions p
 JOIN patients pa ON p.patient_id = pa.id
 JOIN users doc ON p.prescribed_by = doc.id
 LEFT JOIN users rev ON p.reviewed_by = rev.id`;

const itemSelect = `SELECT pi.*, d.drug_name, d.drug_code
 FROM prescription_items pi
 JOIN drugs d ON pi.drug_id = d.id
 WHERE pi.prescription_id = ?`;

function mapPrescription(row) {
  const department = [row.building, row.room_number].filter(Boolean).join(' / ') || 'General Ward';
  const status = row.status;
  const quantityApprovedDefault = ['approved', 'ready', 'preparing', 'dispatched', 'delivered'].includes(status);

  return {
    ...row,
    request_number: row.prescription_number,
    requested_by_name: row.prescribed_by_name,
    approved_by_name: row.reviewed_by_name,
    department,
    required_by_date: row.updated_at,
    rejection_reason: row.rejection_reason || null,
    items: (row.items || []).map((item) => ({
      ...item,
      quantity_requested: item.quantity,
      quantity_approved: quantityApprovedDefault ? item.quantity : 0,
      quantity_dispensed: ['dispatched', 'delivered'].includes(status) ? item.quantity : 0,
    })),
  };
}

export const prescriptionRepository = {
  async create(connection, payload) {
    const [result] = await connection.query(
      `INSERT INTO prescriptions (prescription_number, patient_id, prescribed_by, priority, diagnosis, notes)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [payload.prescriptionNumber, payload.patientId, payload.prescribedBy, payload.priority, payload.diagnosis, payload.notes],
    );
    return result.insertId;
  },

  async createItem(connection, prescriptionId, item) {
    await connection.query(
      `INSERT INTO prescription_items (prescription_id, drug_id, quantity, dosage_instructions, duration, notes)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [prescriptionId, item.drugId, item.quantity, item.dosageInstructions, item.duration, item.notes || null],
    );
  },

  async list(user) {
    let sql = `${baseSelect}`;
    const params = [];

    if (user?.role === 'doctor') {
      sql += ' WHERE p.prescribed_by = ?';
      params.push(user.id);
    }

    sql += ' ORDER BY p.created_at DESC';

    const [rows] = await pool.query(sql, params);

    for (const row of rows) {
      const [items] = await pool.query(itemSelect, [row.id]);
      row.items = items;
    }

    return rows.map(mapPrescription);
  },

  async findById(prescriptionId) {
    const [rows] = await pool.query(`${baseSelect} WHERE p.id = ? LIMIT 1`, [prescriptionId]);
    if (rows.length === 0) return null;

    const row = rows[0];
    const [items] = await pool.query(itemSelect, [row.id]);
    row.items = items;
    return mapPrescription(row);
  },

  async updateReviewStatus({ prescriptionId, status, reviewedBy, rejectionReason }) {
    const [result] = await pool.query(
      `UPDATE prescriptions
       SET status = ?, reviewed_by = ?, reviewed_at = CURRENT_TIMESTAMP, rejection_reason = ?
       WHERE id = ?`,
      [status, reviewedBy, rejectionReason, prescriptionId],
    );
    return result.affectedRows > 0;
  },

  async markDispatched({ prescriptionId, reviewedBy, notes }) {
    const [result] = await pool.query(
      `UPDATE prescriptions
       SET status = 'dispatched', reviewed_by = COALESCE(reviewed_by, ?), reviewed_at = COALESCE(reviewed_at, CURRENT_TIMESTAMP),
           notes = CASE
             WHEN ? IS NULL OR ? = '' THEN notes
             WHEN notes IS NULL OR notes = '' THEN ?
             ELSE CONCAT(notes, '

', ?)
           END
       WHERE id = ?`,
      [reviewedBy, notes, notes, notes, notes, prescriptionId],
    );
    return result.affectedRows > 0;
  },
};
