-- Seed data for Hospital Pharmacy Management System

-- Insert drug categories
INSERT INTO drug_categories (name, description) VALUES
('Antibiotics', 'Medications used to treat bacterial infections'),
('Analgesics', 'Pain relieving medications'),
('Cardiovascular', 'Medications for heart and blood vessel conditions'),
('Respiratory', 'Medications for respiratory conditions'),
('Gastrointestinal', 'Medications for digestive system'),
('Vitamins & Supplements', 'Nutritional supplements and vitamins'),
('Antidiabetic', 'Medications for diabetes management'),
('Antihypertensive', 'Medications for high blood pressure'),
('Antihistamines', 'Allergy medications'),
('Vaccines', 'Immunization vaccines');

-- Insert sample drugs
INSERT INTO drugs (drug_code, drug_name, generic_name, category_id, manufacturer, dosage_form, strength, unit_price, reorder_level, requires_prescription) VALUES
('DRG001', 'Amoxicillin 500mg', 'Amoxicillin', 1, 'PharmaCorp', 'capsule', '500mg', 15.50, 100, TRUE),
('DRG002', 'Paracetamol 500mg', 'Paracetamol', 2, 'MediLabs', 'tablet', '500mg', 5.00, 200, FALSE),
('DRG003', 'Ibuprofen 400mg', 'Ibuprofen', 2, 'HealthPharma', 'tablet', '400mg', 8.00, 150, FALSE),
('DRG004', 'Metformin 500mg', 'Metformin HCl', 7, 'DiabaCare', 'tablet', '500mg', 12.00, 100, TRUE),
('DRG005', 'Amlodipine 5mg', 'Amlodipine Besylate', 8, 'CardioMed', 'tablet', '5mg', 18.00, 80, TRUE),
('DRG006', 'Omeprazole 20mg', 'Omeprazole', 5, 'GastroHealth', 'capsule', '20mg', 22.00, 100, TRUE),
('DRG007', 'Cetirizine 10mg', 'Cetirizine HCl', 9, 'AllergyFree', 'tablet', '10mg', 6.50, 150, FALSE),
('DRG008', 'Vitamin C 1000mg', 'Ascorbic Acid', 6, 'VitaPlus', 'tablet', '1000mg', 10.00, 200, FALSE),
('DRG009', 'Salbutamol Inhaler', 'Salbutamol', 4, 'RespiCare', 'other', '100mcg/puff', 45.00, 50, TRUE),
('DRG010', 'Aspirin 75mg', 'Acetylsalicylic Acid', 3, 'CardioMed', 'tablet', '75mg', 4.50, 200, FALSE),
('DRG011', 'Ciprofloxacin 500mg', 'Ciprofloxacin', 1, 'PharmaCorp', 'tablet', '500mg', 25.00, 80, TRUE),
('DRG012', 'Losartan 50mg', 'Losartan Potassium', 8, 'CardioMed', 'tablet', '50mg', 20.00, 100, TRUE),
('DRG013', 'Metoprolol 50mg', 'Metoprolol Tartrate', 3, 'CardioMed', 'tablet', '50mg', 16.00, 100, TRUE),
('DRG014', 'Pantoprazole 40mg', 'Pantoprazole', 5, 'GastroHealth', 'tablet', '40mg', 28.00, 80, TRUE),
('DRG015', 'Insulin Glargine', 'Insulin Glargine', 7, 'DiabaCare', 'injection', '100IU/mL', 150.00, 30, TRUE);

-- Insert sample drug batches
INSERT INTO drug_batches (drug_id, batch_number, quantity, manufacturing_date, expiry_date, supplier, purchase_price) VALUES
(1, 'BAT-AMX-001', 500, '2024-01-15', '2026-01-15', 'PharmaCorp Distribution', 12.00),
(1, 'BAT-AMX-002', 300, '2024-06-01', '2026-06-01', 'PharmaCorp Distribution', 12.50),
(2, 'BAT-PCM-001', 1000, '2024-03-10', '2027-03-10', 'MediLabs Wholesale', 3.50),
(3, 'BAT-IBU-001', 800, '2024-02-20', '2026-02-20', 'HealthPharma Direct', 6.00),
(4, 'BAT-MET-001', 400, '2024-04-15', '2026-04-15', 'DiabaCare Supply', 9.00),
(5, 'BAT-AML-001', 200, '2024-05-01', '2026-05-01', 'CardioMed Partners', 14.00),
(6, 'BAT-OME-001', 350, '2024-03-25', '2025-09-25', 'GastroHealth Inc', 18.00),
(7, 'BAT-CET-001', 600, '2024-06-10', '2026-06-10', 'AllergyFree Pharma', 5.00),
(8, 'BAT-VTC-001', 1500, '2024-01-01', '2025-07-01', 'VitaPlus Nutrition', 7.00),
(9, 'BAT-SAL-001', 100, '2024-04-20', '2025-10-20', 'RespiCare Medical', 35.00),
(10, 'BAT-ASP-001', 2000, '2024-02-15', '2027-02-15', 'CardioMed Partners', 3.00),
-- Low stock items for testing
(11, 'BAT-CIP-001', 25, '2024-05-15', '2026-05-15', 'PharmaCorp Distribution', 20.00),
(12, 'BAT-LOS-001', 30, '2024-06-01', '2026-06-01', 'CardioMed Partners', 16.00),
-- Near expiry items for testing
(13, 'BAT-MTP-001', 150, '2023-06-01', '2024-12-01', 'CardioMed Partners', 12.00),
(14, 'BAT-PAN-001', 80, '2023-08-15', '2024-11-15', 'GastroHealth Inc', 22.00),
(15, 'BAT-INS-001', 50, '2024-01-10', '2025-01-10', 'DiabaCare Supply', 120.00);

-- Insert sample users (passwords are hashed versions of 'password123')
-- Note: In production, use proper bcrypt hashing
INSERT INTO users (username, email, password_hash, full_name, role, department) VALUES
('admin', 'admin@hospital.com', '$2b$10$rIC/E.J5E1nW5P8K4IvNOOtHN8s7rxqzEHXL3h.rHW5Z5Z5Z5Z5Z5', 'System Administrator', 'administrator', 'Administration'),
('pharmacist1', 'pharmacist1@hospital.com', '$2b$10$rIC/E.J5E1nW5P8K4IvNOOtHN8s7rxqzEHXL3h.rHW5Z5Z5Z5Z5Z5', 'Sarah Johnson', 'pharmacist', 'Pharmacy'),
('pharmacist2', 'pharmacist2@hospital.com', '$2b$10$rIC/E.J5E1nW5P8K4IvNOOtHN8s7rxqzEHXL3h.rHW5Z5Z5Z5Z5Z5', 'Michael Chen', 'pharmacist', 'Pharmacy'),
('doctor1', 'doctor1@hospital.com', '$2b$10$rIC/E.J5E1nW5P8K4IvNOOtHN8s7rxqzEHXL3h.rHW5Z5Z5Z5Z5Z5', 'Dr. Emily Williams', 'doctor', 'Internal Medicine'),
('doctor2', 'doctor2@hospital.com', '$2b$10$rIC/E.J5E1nW5P8K4IvNOOtHN8s7rxqzEHXL3h.rHW5Z5Z5Z5Z5Z5', 'Dr. James Brown', 'doctor', 'Cardiology'),
('nurse1', 'nurse1@hospital.com', '$2b$10$rIC/E.J5E1nW5P8K4IvNOOtHN8s7rxqzEHXL3h.rHW5Z5Z5Z5Z5Z5', 'Lisa Anderson', 'nurse', 'Emergency'),
('nurse2', 'nurse2@hospital.com', '$2b$10$rIC/E.J5E1nW5P8K4IvNOOtHN8s7rxqzEHXL3h.rHW5Z5Z5Z5Z5Z5', 'David Martinez', 'nurse', 'ICU');

-- Insert sample drug requests
INSERT INTO drug_requests (request_number, requested_by, department, status, priority, required_by_date, notes) VALUES
('REQ-2024-001', 4, 'Internal Medicine', 'approved', 'normal', '2024-06-20', 'Regular monthly request for ward supplies'),
('REQ-2024-002', 5, 'Cardiology', 'pending', 'high', '2024-06-18', 'Urgent need for cardiac medications'),
('REQ-2024-003', 6, 'Emergency', 'dispatched', 'urgent', '2024-06-15', 'Emergency department restocking'),
('REQ-2024-004', 7, 'ICU', 'delivered', 'high', '2024-06-10', 'ICU critical medications'),
('REQ-2024-005', 4, 'Internal Medicine', 'pending', 'normal', '2024-06-25', 'Additional antibiotics needed');

-- Insert sample request items
INSERT INTO drug_request_items (request_id, drug_id, quantity_requested, quantity_approved, quantity_dispensed) VALUES
(1, 1, 100, 100, 100),
(1, 2, 200, 200, 200),
(1, 6, 50, 50, 50),
(2, 5, 80, 0, 0),
(2, 10, 150, 0, 0),
(2, 13, 100, 0, 0),
(3, 2, 300, 300, 300),
(3, 3, 200, 200, 200),
(3, 7, 100, 100, 100),
(4, 15, 20, 20, 20),
(4, 5, 50, 50, 50),
(5, 1, 150, 0, 0),
(5, 11, 80, 0, 0);

-- Insert sample deliveries
INSERT INTO deliveries (delivery_number, request_id, status, dispatched_by, dispatched_at, delivery_location, delivered_by, delivered_at, received_by_name) VALUES
('DEL-2024-001', 1, 'delivered', 2, '2024-06-18 10:00:00', 'Internal Medicine Ward - Floor 3', 3, '2024-06-18 10:30:00', 'Nurse Maria Santos'),
('DEL-2024-002', 3, 'in_transit', 2, '2024-06-17 14:00:00', 'Emergency Department - Ground Floor', NULL, NULL, NULL),
('DEL-2024-003', 4, 'delivered', 3, '2024-06-09 09:00:00', 'ICU - Floor 5', 3, '2024-06-09 09:15:00', 'Head Nurse Johnson');

-- Insert sample notifications
INSERT INTO notifications (user_id, title, message, type, is_read, link) VALUES
(2, 'Low Stock Alert', 'Ciprofloxacin 500mg is running low (25 units remaining)', 'warning', FALSE, '/inventory'),
(2, 'Expiry Alert', 'Metoprolol 50mg batch BAT-MTP-001 expires in 30 days', 'warning', FALSE, '/inventory'),
(2, 'New Request', 'New drug request REQ-2024-005 from Internal Medicine', 'info', FALSE, '/requests'),
(3, 'Delivery Assigned', 'You have been assigned to delivery DEL-2024-002', 'info', TRUE, '/deliveries'),
(4, 'Request Approved', 'Your request REQ-2024-001 has been approved', 'success', TRUE, '/my-requests'),
(6, 'Request Dispatched', 'Your request REQ-2024-003 has been dispatched', 'info', FALSE, '/my-requests');
