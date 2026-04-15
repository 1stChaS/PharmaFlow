import { pool } from '../config/database.js';
import { ApiError } from '../utils/api-error.js';

const mapPatient = (p) => ({
  id: p.id,
  patientNumber: p.patient_number,
  fullName: p.full_name,
  age: p.age,
  gender: p.gender,
  weight: p.weight,
  height: p.height,
  bloodPressure: p.blood_pressure,
  bmi: p.bmi,
  underlyingConditions: p.underlying_conditions,
  allergies: p.allergies,
  chiefComplaint: p.chief_complaint,
  building: p.building,
  roomNumber: p.room_number,
  assignedDoctorId: p.assigned_doctor_id,
  registeredBy: p.registered_by,
  registeredByName: p.registered_by_name,
  createdAt: p.created_at,
});

export const patientService = {
  async list() {
    const [rows] = await pool.query(
      `SELECT p.*, u.full_name AS registered_by_name
       FROM patients p
       JOIN users u ON p.registered_by = u.id
       WHERE p.is_active = TRUE
       ORDER BY p.created_at DESC`,
    );
    return rows.map(mapPatient);
  },

  async getById(id) {
    const [rows] = await pool.query(
      `SELECT p.*, u.full_name AS registered_by_name
       FROM patients p
       JOIN users u ON p.registered_by = u.id
       WHERE p.id = ? LIMIT 1`,
      [id],
    );
    const row = rows[0] || null;
    if (!row) throw new ApiError(404, 'Patient not found');
    return mapPatient(row);
  },

  async create(payload, actor) {
    if (!payload.fullName || !payload.age || !payload.gender) {
      throw new ApiError(400, 'fullName, age, and gender are required');
    }

    const bmi = Number(payload.weight) > 0 && Number(payload.height) > 0
      ? Number((Number(payload.weight) / ((Number(payload.height) / 100) ** 2)).toFixed(2))
      : null;

    const patientNumber = `PAT-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;

    const [result] = await pool.query(
      `INSERT INTO patients (
        patient_number,
        full_name,
        age,
        gender,
        weight,
        height,
        blood_pressure,
        bmi,
        underlying_conditions,
        allergies,
        chief_complaint,
        building,
        room_number,
        registered_by,
        assigned_doctor_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        patientNumber,
        payload.fullName,
        payload.age,
        payload.gender,
        payload.weight || null,
        payload.height || null,
        payload.bloodPressure || null,
        bmi || null,
        payload.underlyingConditions || null,
        payload.allergies || null,
        payload.chiefComplaint,
        payload.building,
        payload.roomNumber || null,
        actor.id,
        payload.assignedDoctorId || null,
      ]
    );

    return { id: result.insertId, patientNumber };
  },
};
