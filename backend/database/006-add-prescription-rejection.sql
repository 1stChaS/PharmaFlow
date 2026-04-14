-- Add rejected status and rejection reason to prescriptions for pharmacist review workflow
ALTER TABLE prescriptions
  MODIFY COLUMN status ENUM('pending', 'approved', 'rejected', 'preparing', 'ready', 'dispatched', 'delivered', 'cancelled') DEFAULT 'pending';

ALTER TABLE prescriptions
  ADD COLUMN rejection_reason TEXT NULL AFTER reviewed_at;
