import { pool } from '../config/database.js';

export const reportRepository = {
  async distributionMonitoring() {
    const [rows] = await pool.query(
      `SELECT da.status, COUNT(*) AS total
       FROM delivery_assignments da
       GROUP BY da.status`,
    );
    return rows;
  },

  async roleWisePrescriptionSummary() {
    const [rows] = await pool.query(
      `SELECT u.role, COUNT(p.id) AS prescriptions
       FROM users u
       LEFT JOIN prescriptions p ON p.prescribed_by = u.id
       GROUP BY u.role`,
    );
    return rows;
  },
};
