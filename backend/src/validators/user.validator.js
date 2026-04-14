import { body } from 'express-validator';
import { ALL_ROLES } from '../constants/roles.js';

export const createUserValidator = [
  body('username').trim().isLength({ min: 3 }).withMessage('Username must be at least 3 chars'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 chars'),
  body('fullName').trim().notEmpty().withMessage('Full name required'),
  body('role').isIn(ALL_ROLES).withMessage('Invalid role'),
];

export const updateUserValidator = [
  body('email').optional().isEmail(),
  body('role').optional().isIn(ALL_ROLES),
  body('isActive').optional().isBoolean(),
];
