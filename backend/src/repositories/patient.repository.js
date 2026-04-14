import { pool } from '../config/database.js';

export const patientRepository = {
  async create(payload) {
    const [result] = await pool.query(
      `INSERT INTO patients (
        patient_number, full_name, age, gender, weight, height, blood_pressure, bmi,
        underlying_conditions, allergies, chief_complaint, building, room_number, registered_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        payload.patientNumber,
        payload.fullName,
        payload.age,
        payload.gender,
        payload.weight,
        payload.height,
        payload.bloodPressure,
        payload.bmi,
        payload.underlyingConditions,
        payload.allergies,
        payload.chiefComplaint,
        payload.building,
        payload.roomNumber,
        payload.registeredBy,
      ],
    );
    return result.insertId;
  },

  async list() {
    const [rows] = await pool.query(
      `SELECT p.*, u.full_name AS registered_by_name
       FROM patients p
       JOIN users u ON p.registered_by = u.id
       WHERE p.is_active = TRUE
       ORDER BY p.created_at DESC`,
    );
    return rows;
  },

  async findById(id) {
    const [rows] = await pool.query(
      `SELECT p.*, u.full_name AS registered_by_name
       FROM patients p
       JOIN users u ON p.registered_by = u.id
       WHERE p.id = ? LIMIT 1`,
      [id],
    );
    return rows[0] || null;
  },
};
