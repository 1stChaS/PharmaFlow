import { ApiError } from '../utils/api-error.js';
import { patientRepository } from '../repositories/patient.repository.js';

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
  registeredBy: p.registered_by,
  registeredByName: p.registered_by_name,
  createdAt: p.created_at,
});

export const patientService = {
  async list() {
    const rows = await patientRepository.list();
    return rows.map(mapPatient);
  },

  async getById(id) {
    const row = await patientRepository.findById(id);
    if (!row) throw new ApiError(404, 'Patient not found');
    return mapPatient(row);
  },

  async create(payload, user) {
    const bmi = Number(payload.weight) > 0 && Number(payload.height) > 0
      ? Number((Number(payload.weight) / ((Number(payload.height) / 100) ** 2)).toFixed(2))
      : null;

    const patientNumber = `PAT-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;

    const id = await patientRepository.create({
      ...payload,
      bmi,
      patientNumber,
      registeredBy: user.id,
    });

    return { id, patientNumber };
  },
};
