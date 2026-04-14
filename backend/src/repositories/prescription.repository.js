import { pool } from '../config/database.js';

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

  async list() {
    const [rows] = await pool.query(
      `SELECT p.*, pa.full_name AS patient_name, pa.patient_number,
              pa.age, pa.gender, pa.weight, pa.height, pa.blood_pressure, pa.bmi,
              pa.underlying_conditions, pa.allergies, pa.chief_complaint,
              doc.full_name AS prescribed_by_name,
              rev.full_name AS reviewed_by_name
       FROM prescriptions p
       JOIN patients pa ON p.patient_id = pa.id
       JOIN users doc ON p.prescribed_by = doc.id
       LEFT JOIN users rev ON p.reviewed_by = rev.id
       ORDER BY p.created_at DESC`,
    );

    for (const row of rows) {
      const [items] = await pool.query(
        `SELECT pi.*, d.drug_name, d.drug_code
         FROM prescription_items pi
         JOIN drugs d ON pi.drug_id = d.id
         WHERE pi.prescription_id = ?`,
        [row.id],
      );
      row.items = items;
    }

    return rows;
  },
};
