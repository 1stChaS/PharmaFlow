import { validationResult } from 'express-validator';

export const validationGuard = (req, _res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next({ statusCode: 400, message: 'Validation failed', details: errors.array() });
  }
  return next();
};

export const notFoundHandler = (_req, res) => {
  res.status(404).json({ message: 'Route not found' });
};

export const errorHandler = (err, _req, res, _next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';
  const details = err.details || null;

  if (statusCode >= 500) {
    // eslint-disable-next-line no-console
    console.error('Unhandled error:', err);
  }

  return res.status(statusCode).json({ message, details });
};
