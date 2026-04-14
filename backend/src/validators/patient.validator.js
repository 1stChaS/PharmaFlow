import { body } from 'express-validator';

export const createPatientValidator = [
  body('fullName').trim().notEmpty(),
  body('age').isInt({ min: 0, max: 130 }),
  body('gender').isIn(['male', 'female', 'other']),
  body('weight').optional().isFloat({ min: 0 }),
  body('height').optional().isFloat({ min: 0 }),
  body('bloodPressure').optional().trim(),
  body('underlyingConditions').optional().trim(),
  body('allergies').optional().trim(),
  body('chiefComplaint').trim().notEmpty(),
  body('building').trim().notEmpty(),
  body('roomNumber').optional().trim(),
];
