import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
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
});

export const authService = {
  async login({ username, password, ipAddress }) {
    const user = await userRepository.findActiveByUsername(username);
    if (!user) throw new ApiError(401, 'Invalid credentials');

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) throw new ApiError(401, 'Invalid credentials');

    const token = jwt.sign({ id: user.id, role: user.role, username: user.username }, env.jwt.secret, {
      expiresIn: env.jwt.expiresIn,
    });

    await userRepository.audit({
      userId: user.id,
      action: 'LOGIN',
      entityType: 'user',
      entityId: user.id,
      ipAddress,
    });

    return { token, user: mapUser(user) };
  },

  async me(userId) {
    const user = await userRepository.findSafeById(userId);
    if (!user) throw new ApiError(404, 'User not found');
    return mapUser(user);
  },
};
