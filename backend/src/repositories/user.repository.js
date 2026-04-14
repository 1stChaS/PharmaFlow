import { pool } from '../config/database.js';

export const userRepository = {
  async findActiveByUsername(username) {
    const [rows] = await pool.query('SELECT * FROM users WHERE username = ? AND is_active = TRUE LIMIT 1', [username]);
    return rows[0] || null;
  },

  async findSafeById(id) {
    const [rows] = await pool.query(
      'SELECT id, username, email, full_name, role, department, avatar_url, is_active, created_at FROM users WHERE id = ? LIMIT 1',
      [id],
    );
    return rows[0] || null;
  },

  async list({ role, status }) {
    let sql = 'SELECT id, username, email, full_name, role, department, avatar_url, is_active, created_at FROM users WHERE 1=1';
    const params = [];

    if (role) {
      sql += ' AND role = ?';
      params.push(role);
    }
    if (status === 'active') sql += ' AND is_active = TRUE';
    if (status === 'inactive') sql += ' AND is_active = FALSE';

    sql += ' ORDER BY full_name';
    const [rows] = await pool.query(sql, params);
    return rows;
  },

  async create({ username, email, passwordHash, fullName, role, department }) {
    const [result] = await pool.query(
      'INSERT INTO users (username, email, password_hash, full_name, role, department) VALUES (?, ?, ?, ?, ?, ?)',
      [username, email, passwordHash, fullName, role, department || null],
    );
    return result.insertId;
  },

  async update(id, updates) {
    const [result] = await pool.query(
      `UPDATE users SET
        full_name = COALESCE(?, full_name),
        email = COALESCE(?, email),
        role = COALESCE(?, role),
        department = COALESCE(?, department),
        is_active = COALESCE(?, is_active)
      WHERE id = ?`,
      [updates.fullName, updates.email, updates.role, updates.department, updates.isActive, id],
    );
    return result.affectedRows > 0;
  },

  async audit({ userId, action, entityType, entityId, oldValues, newValues, ipAddress }) {
    await pool.query(
      'INSERT INTO audit_logs (user_id, action, entity_type, entity_id, old_values, new_values, ip_address) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [userId, action, entityType, entityId || null, oldValues || null, newValues || null, ipAddress || null],
    );
  },
};
