-- Seed data for patient/prescription/delivery-assignment role workflows
-- Run after 003-add-patients-prescriptions.sql

INSERT INTO patients (
  patient_number, full_name, age, gender, weight, height, blood_pressure, bmi,
  underlying_conditions, allergies, chief_complaint, building, room_number, registered_by
) VALUES
('PAT-2026-000001', 'Somchai Prasert', 68, 'male', 72.5, 168.0, '145/90', 25.69, 'Hypertension', 'Penicillin', 'Dizziness and chest discomfort', 'Building A', 'A-305', 6),
('PAT-2026-000002', 'Suda Kanchana', 54, 'female', 61.0, 158.0, '130/85', 24.43, 'Type 2 Diabetes', 'None', 'Persistent fatigue', 'Building B', 'B-210', 7);

INSERT INTO prescriptions (
  prescription_number, patient_id, prescribed_by, status, priority, diagnosis, notes
) VALUES
('PRX-2026-000001', 1, 4, 'pending', 'high', 'Suspected unstable angina', 'Monitor BP and pain closely'),
('PRX-2026-000002', 2, 5, 'pending', 'normal', 'Glycemic control adjustment', 'Review after 3 days');

INSERT INTO prescription_items (
  prescription_id, drug_id, quantity, dosage_instructions, duration, notes
) VALUES
(1, 5, 14, 'Take 1 tablet daily', '14 days', 'Morning after meal'),
(1, 10, 14, 'Take 1 tablet daily', '14 days', 'After breakfast'),
(2, 4, 30, 'Take 1 tablet twice daily', '15 days', 'Before meals');

INSERT INTO delivery_assignments (
  prescription_id, assigned_staff_id, assigned_by, building, delivery_location, status, notes
) VALUES
(1, 6, 2, 'Building A', 'A-305', 'assigned', 'Deliver only by authorized internal staff');
