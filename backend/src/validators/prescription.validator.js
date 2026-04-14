import { body } from 'express-validator';

export const createPrescriptionValidator = [
  body('patientId').isInt({ min: 1 }),
  body('priority').isIn(['low', 'normal', 'high', 'urgent']),
  body('diagnosis').trim().notEmpty(),
  body('items').isArray({ min: 1 }),
  body('items.*.drugId').isInt({ min: 1 }),
  body('items.*.quantity').isInt({ min: 1 }),
  body('items.*.dosageInstructions').trim().notEmpty(),
];
