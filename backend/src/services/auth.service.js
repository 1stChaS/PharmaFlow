import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../config/database.js';
import { env } from '../config/env.js';
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
});

async function writeAuditLog({ userId, action, entityType, entityId, oldValues, newValues, ipAddress }) {
  await pool.query(
    'INSERT INTO audit_logs (user_id, action, entity_type, entity_id, old_values, new_values, ip_address) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [userId, action, entityType, entityId || null, oldValues || null, newValues || null, ipAddress || null],
  );
}

export const authService = {
  async login({ username, password, ipAddress }) {
    if (!username || !password) {
      throw new ApiError(400, 'Username and password are required');
    }

    const [rows] = await pool.query(
      'SELECT * FROM users WHERE username = ? AND is_active = TRUE LIMIT 1',
      [username],
    );
    const user = rows[0] || null;

    if (!user) throw new ApiError(401, 'Invalid credentials');

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) throw new ApiError(401, 'Invalid credentials');

    const token = jwt.sign(
      { id: user.id, role: user.role, username: user.username },
      env.jwt.secret,
      { expiresIn: env.jwt.expiresIn },
    );

    await writeAuditLog({
      userId: user.id,
      action: 'LOGIN',
      entityType: 'user',
      entityId: user.id,
      ipAddress,
    });

    return { token, user: mapUser(user) };
  },

  async me(userId) {
    const [rows] = await pool.query(
      'SELECT id, username, email, full_name, role, department, avatar_url, is_active FROM users WHERE id = ? LIMIT 1',
      [userId],
    );
    const user = rows[0] || null;

    if (!user) throw new ApiError(404, 'User not found');
    return mapUser(user);
  },
};
