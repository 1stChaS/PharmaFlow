import { body } from 'express-validator';

export const createDeliveryAssignmentValidator = [
  body('prescriptionId').isInt({ min: 1 }),
  body('assignedStaffId').isInt({ min: 1 }),
  body('building').trim().notEmpty(),
  body('deliveryLocation').optional().trim(),
];

export const markDeliveredValidator = [
  body('receivedByName').trim().notEmpty().withMessage('Receiver name is required'),
];
