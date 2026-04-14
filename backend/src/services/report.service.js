import { pool } from '../config/database.js';

export const reportService = {
  async adminDistributionMonitoring() {
    const [distribution, roleSummary] = await Promise.all([
      pool.query(
        `SELECT da.status, COUNT(*) AS total
         FROM delivery_assignments da
         GROUP BY da.status`,
      ).then(([rows]) => rows),
      pool.query(
        `SELECT u.role, COUNT(p.id) AS prescriptions
         FROM users u
         LEFT JOIN prescriptions p ON p.prescribed_by = u.id
         GROUP BY u.role`,
      ).then(([rows]) => rows),
    ]);

    return { distribution, roleSummary };
  },
};
