import bcrypt from 'bcryptjs';
import { ApiError } from '../utils/api-error.js';
import { userRepository } from '../repositories/user.repository.js';

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

export const userService = {
  async list(filters) {
    const rows = await userRepository.list(filters);
    return rows.map(mapUser);
  },

  async create(payload, actor) {
    const passwordHash = await bcrypt.hash(payload.password, 10);
    try {
      const id = await userRepository.create({ ...payload, passwordHash });
      await userRepository.audit({
        userId: actor.id,
        action: 'CREATE',
        entityType: 'user',
        entityId: id,
        newValues: JSON.stringify({ ...payload, password: '***' }),
      });
      return id;
    } catch (err) {
      if (err.code === 'ER_DUP_ENTRY') throw new ApiError(409, 'Username or email already exists');
      throw err;
    }
  },

  async update(id, updates, actor) {
    const existing = await userRepository.findSafeById(id);
    if (!existing) throw new ApiError(404, 'User not found');

    await userRepository.update(id, updates);
    await userRepository.audit({
      userId: actor.id,
      action: 'UPDATE',
      entityType: 'user',
      entityId: id,
      oldValues: JSON.stringify(existing),
      newValues: JSON.stringify(updates),
    });
  },
};
