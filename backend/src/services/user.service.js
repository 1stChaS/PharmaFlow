import bcrypt from 'bcryptjs';
import { pool } from '../config/database.js';
import { ApiError } from '../utils/api-error.js';

const mapUser = (u) => ({
  id: u.id,
  username: u.username,
  email: u.email,
  fullName: u.full_name,
  role: u.role,
  department: u.department,
  avatarUrl: u.avatar_url,
  isActive: Boolean(u.is_active),
  createdAt: u.created_at,
});

async function writeAuditLog({ userId, action, entityType, entityId, oldValues, newValues, ipAddress }) {
  await pool.query(
    'INSERT INTO audit_logs (user_id, action, entity_type, entity_id, old_values, new_values, ip_address) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [userId, action, entityType, entityId || null, oldValues || null, newValues || null, ipAddress || null],
  );
}

export const userService = {
  async list(filters) {
    let sql = 'SELECT id, username, email, full_name, role, department, avatar_url, is_active, created_at FROM users WHERE 1=1';
    const params = [];

    if (filters.role) {
      sql += ' AND role = ?';
      params.push(filters.role);
    }
    if (filters.status === 'active') sql += ' AND is_active = TRUE';
    if (filters.status === 'inactive') sql += ' AND is_active = FALSE';

    sql += ' ORDER BY full_name';
    const [rows] = await pool.query(sql, params);
    return rows.map(mapUser);
  },

  async create(payload, actor) {
    const requiredFields = ['username', 'email', 'password', 'fullName', 'role'];
    for (const field of requiredFields) {
      if (!payload[field]) throw new ApiError(400, `${field} is required`);
    }

    const passwordHash = await bcrypt.hash(payload.password, 10);
    try {
      const [result] = await pool.query(
        'INSERT INTO users (username, email, password_hash, full_name, role, department) VALUES (?, ?, ?, ?, ?, ?)',
        [payload.username, payload.email, passwordHash, payload.fullName, payload.role, payload.department || null],
      );

      await writeAuditLog({
        userId: actor.id,
        action: 'CREATE',
        entityType: 'user',
        entityId: result.insertId,
        newValues: JSON.stringify({ ...payload, password: '***' }),
      });

      return result.insertId;
    } catch (err) {
      if (err.code === 'ER_DUP_ENTRY') throw new ApiError(409, 'Username or email already exists');
      throw err;
    }
  },

  async update(id, updates, actor) {
    const [existingRows] = await pool.query(
      'SELECT id, username, email, full_name, role, department, avatar_url, is_active, created_at FROM users WHERE id = ? LIMIT 1',
      [id],
    );
    const existing = existingRows[0] || null;
    if (!existing) throw new ApiError(404, 'User not found');

    await pool.query(
      `UPDATE users SET
        full_name = COALESCE(?, full_name),
        email = COALESCE(?, email),
        role = COALESCE(?, role),
        department = COALESCE(?, department),
        is_active = COALESCE(?, is_active)
      WHERE id = ?`,
      [updates.fullName, updates.email, updates.role, updates.department, updates.isActive, id],
    );

    await writeAuditLog({
      userId: actor.id,
      action: 'UPDATE',
      entityType: 'user',
      entityId: id,
      oldValues: JSON.stringify(existing),
      newValues: JSON.stringify(updates),
    });
  },
};
