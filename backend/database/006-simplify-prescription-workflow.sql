ALTER TABLE prescriptions
MODIFY COLUMN status ENUM('pending', 'approved', 'preparing', 'ready', 'rejected', 'dispatched', 'delivered', 'cancelled') DEFAULT 'pending';

ALTER TABLE prescriptions
ADD COLUMN rejection_reason TEXT NULL AFTER reviewed_at;
