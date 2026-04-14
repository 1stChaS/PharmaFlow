import { pool } from '../config/database.js';

export const dashboardService = {
  async getStats(user) {
    const stats = {};

    const [[drugCount]] = await pool.query('SELECT COUNT(*) AS count FROM drugs WHERE is_active = TRUE');
    stats.totalDrugs = drugCount.count;

    const [lowStock] = await pool.query(
      `SELECT d.id
       FROM drugs d
       LEFT JOIN drug_batches db ON d.id = db.drug_id
       WHERE d.is_active = TRUE
       GROUP BY d.id
       HAVING COALESCE(SUM(db.quantity), 0) < d.reorder_level`,
    );
    stats.lowStockCount = lowStock.length;

    const [[pendingRx]] = await pool.query("SELECT COUNT(*) AS count FROM prescriptions WHERE status = 'pending'");
    stats.pendingPrescriptions = pendingRx.count;

    const [[transitAssignments]] = await pool.query(
      "SELECT COUNT(*) AS count FROM delivery_assignments WHERE status IN ('assigned', 'in_transit')",
    );
    stats.deliveriesInTransit = transitAssignments.count;

    if (['doctor', 'nurse'].includes(user.role)) {
      const [[myPatients]] = await pool.query(
        'SELECT COUNT(*) AS count FROM patients WHERE registered_by = ?',
        [user.id],
      );
      stats.myPatients = myPatients.count;
    }

    return stats;
  },

  async getActivity() {
    const [rows] = await pool.query(
      `SELECT al.*, u.full_name AS user_name
       FROM audit_logs al
       LEFT JOIN users u ON al.user_id = u.id
       ORDER BY al.created_at DESC LIMIT 20`,
    );
    return rows;
  },
};
