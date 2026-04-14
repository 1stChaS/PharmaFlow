import { pool } from '../config/database.js';
import { ApiError } from '../utils/api-error.js';

function buildPrescriptionNumber() {
  return `PRX-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;
}

function mapPrescriptionRow(row) {
  return {
    id: row.id,
    prescription_number: row.prescription_number,
    request_number: row.prescription_number,
    patient_id: row.patient_id,
    patient_name: row.patient_name,
    patient_number: row.patient_number,
    age: row.age,
    gender: row.gender,
    weight: row.weight,
    height: row.height,
    blood_pressure: row.blood_pressure,
    bmi: row.bmi,
    underlying_conditions: row.underlying_conditions,
    allergies: row.allergies,
    chief_complaint: row.chief_complaint,
    prescribed_by: row.prescribed_by,
    prescribed_by_name: row.prescribed_by_name,
    requested_by_name: row.prescribed_by_name,
    department: row.prescriber_department,
    reviewed_by: row.reviewed_by,
    approved_by_name: row.reviewed_by_name,
    reviewed_by_name: row.reviewed_by_name,
    reviewed_at: row.reviewed_at,
    rejection_reason: row.rejection_reason,
    status: row.status,
    priority: row.priority,
    diagnosis: row.diagnosis,
    notes: row.notes,
    created_at: row.created_at,
    updated_at: row.updated_at,
    required_by_date: row.created_at,
    items: [],
  };
}

async function getPrescriptionById(id) {
  const [rows] = await pool.query(
    `SELECT p.*, pa.full_name AS patient_name, pa.patient_number,
            pa.age, pa.gender, pa.weight, pa.height, pa.blood_pressure, pa.bmi,
            pa.underlying_conditions, pa.allergies, pa.chief_complaint,
            doc.full_name AS prescribed_by_name, doc.department AS prescriber_department,
            rev.full_name AS reviewed_by_name
     FROM prescriptions p
     JOIN patients pa ON p.patient_id = pa.id
     JOIN users doc ON p.prescribed_by = doc.id
     LEFT JOIN users rev ON p.reviewed_by = rev.id
     WHERE p.id = ?
     LIMIT 1`,
    [id],
  );
  return rows[0] || null;
}

async function loadItemsForPrescriptions(prescriptions) {
  if (prescriptions.length === 0) return prescriptions;

  const ids = prescriptions.map((p) => p.id);
  const placeholders = ids.map(() => '?').join(',');
  const [items] = await pool.query(
    `SELECT pi.id, pi.prescription_id, pi.drug_id, pi.quantity, pi.dosage_instructions, pi.duration, pi.notes,
            d.drug_name, d.drug_code
     FROM prescription_items pi
     JOIN drugs d ON pi.drug_id = d.id
     WHERE pi.prescription_id IN (${placeholders})
     ORDER BY pi.id`,
    ids,
  );

  const itemsByPrescription = new Map();
  for (const item of items) {
    const normalized = {
      id: item.id,
      prescription_id: item.prescription_id,
      drug_id: item.drug_id,
      drugId: item.drug_id,
      drug_name: item.drug_name,
      drugName: item.drug_name,
      drug_code: item.drug_code,
      drugCode: item.drug_code,
      quantity: item.quantity,
      quantity_requested: item.quantity,
      quantity_approved: item.quantity,
      dosage_instructions: item.dosage_instructions,
      dosageInstructions: item.dosage_instructions,
      duration: item.duration,
      notes: item.notes,
    };
    const list = itemsByPrescription.get(item.prescription_id) || [];
    list.push(normalized);
    itemsByPrescription.set(item.prescription_id, list);
  }

  return prescriptions.map((p) => ({
    ...p,
    items: itemsByPrescription.get(p.id) || [],
  }));
}

export const prescriptionService = {
  async list(user) {
    let sql = `SELECT p.*, pa.full_name AS patient_name, pa.patient_number,
                      pa.age, pa.gender, pa.weight, pa.height, pa.blood_pressure, pa.bmi,
                      pa.underlying_conditions, pa.allergies, pa.chief_complaint,
                      doc.full_name AS prescribed_by_name, doc.department AS prescriber_department,
                      rev.full_name AS reviewed_by_name
               FROM prescriptions p
               JOIN patients pa ON p.patient_id = pa.id
               JOIN users doc ON p.prescribed_by = doc.id
               LEFT JOIN users rev ON p.reviewed_by = rev.id`;
    const params = [];

    if (user?.role === 'doctor') {
      sql += ' WHERE p.prescribed_by = ?';
      params.push(user.id);
    }

    sql += ' ORDER BY p.created_at DESC';
    const [rows] = await pool.query(sql, params);
    const mapped = rows.map(mapPrescriptionRow);
    return loadItemsForPrescriptions(mapped);
  },

  async create(payload, user) {
    if (!payload.patientId) throw new ApiError(400, 'patientId is required');
    if (!Array.isArray(payload.items) || payload.items.length === 0) {
      throw new ApiError(400, 'At least one prescription item is required');
    }

    const [patientRows] = await pool.query(
      'SELECT id, assigned_doctor_id FROM patients WHERE id = ? LIMIT 1',
      [payload.patientId],
    );
    const patient = patientRows[0] || null;

    if (!patient) {
      throw new ApiError(404, 'Patient not found');
    }

    if (patient.assigned_doctor_id && patient.assigned_doctor_id !== user.id) {
      throw new ApiError(403, 'You can only prescribe for patients assigned to you');
    }

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const prescriptionNumber = buildPrescriptionNumber();
      const [result] = await connection.query(
        `INSERT INTO prescriptions (
          prescription_number, patient_id, prescribed_by, priority, diagnosis, notes
        ) VALUES (?, ?, ?, ?, ?, ?)`,
        [
          prescriptionNumber,
          payload.patientId,
          user.id,
          payload.priority || 'normal',
          payload.diagnosis || null,
          payload.notes || null,
        ],
      );

      for (const item of payload.items) {
        if (!item.drugId || !item.quantity) {
          throw new ApiError(400, 'Each item must include drugId and quantity');
        }

        await connection.query(
          `INSERT INTO prescription_items (
            prescription_id, drug_id, quantity, dosage_instructions, duration, notes
          ) VALUES (?, ?, ?, ?, ?, ?)`,
          [
            result.insertId,
            item.drugId,
            item.quantity,
            item.dosageInstructions || null,
            item.duration || null,
            item.notes || null,
          ],
        );
      }

      await connection.commit();
      return { id: result.insertId, prescriptionNumber };
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  },

  async approve(id, user) {
    const prescription = await getPrescriptionById(id);
    if (!prescription) throw new ApiError(404, 'Prescription not found');
    if (prescription.status !== 'pending') {
      throw new ApiError(400, 'Only pending prescriptions can be approved');
    }

    await pool.query(
      `UPDATE prescriptions
       SET status = 'approved', reviewed_by = ?, reviewed_at = CURRENT_TIMESTAMP, rejection_reason = NULL
       WHERE id = ?`,
      [user.id, id],
    );

    return { id, status: 'approved' };
  },

  async reject(id, payload, user) {
    const reason = payload?.reason?.trim() || payload?.rejectionReason?.trim() || '';
    if (!reason) throw new ApiError(400, 'Rejection reason is required');

    const prescription = await getPrescriptionById(id);
    if (!prescription) throw new ApiError(404, 'Prescription not found');
    if (prescription.status !== 'pending') {
      throw new ApiError(400, 'Only pending prescriptions can be rejected');
    }

    await pool.query(
      `UPDATE prescriptions
       SET status = 'rejected', reviewed_by = ?, reviewed_at = CURRENT_TIMESTAMP, rejection_reason = ?
       WHERE id = ?`,
      [user.id, reason, id],
    );

    return { id, status: 'rejected', rejectionReason: reason };
  },

  async dispatch(id, user) {
    const prescription = await getPrescriptionById(id);
    if (!prescription) throw new ApiError(404, 'Prescription not found');
    if (!['approved', 'ready'].includes(prescription.status)) {
      throw new ApiError(400, 'Only approved prescriptions can be dispatched');
    }

    await pool.query(
      `UPDATE prescriptions
       SET status = 'dispatched', reviewed_by = COALESCE(reviewed_by, ?), reviewed_at = COALESCE(reviewed_at, CURRENT_TIMESTAMP)
       WHERE id = ?`,
      [user.id, id],
    );

    return { id, status: 'dispatched' };
  },
};
