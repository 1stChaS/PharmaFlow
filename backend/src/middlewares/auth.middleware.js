import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { ApiError } from '../utils/api-error.js';

export const authenticate = (req, _res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) return next(new ApiError(401, 'Access token required'));

  try {
    req.user = jwt.verify(token, env.jwt.secret);
    return next();
  } catch {
    return next(new ApiError(401, 'Invalid or expired token'));
  }
};

export const authorize = (...allowedRoles) => (req, _res, next) => {
  if (!req.user || !allowedRoles.includes(req.user.role)) {
    return next(new ApiError(403, 'Insufficient permissions'));
  }
  return next();
};
