-- Add doctor assignment and phone number to patients table
ALTER TABLE patients ADD COLUMN assigned_doctor_id INT NULL AFTER registered_by;
ALTER TABLE patients ADD COLUMN phone_number VARCHAR(20) NULL AFTER room_number;
ALTER TABLE patients ADD FOREIGN KEY (assigned_doctor_id) REFERENCES users(id) ON DELETE SET NULL;
CREATE INDEX idx_patients_doctor ON patients(assigned_doctor_id);

-- Update existing seed data with doctor assignments
UPDATE patients SET assigned_doctor_id = 4, phone_number = '081-234-5678' WHERE patient_number = 'PAT-2026-000001';
UPDATE patients SET assigned_doctor_id = 5, phone_number = '089-876-5432' WHERE patient_number = 'PAT-2026-000002';
