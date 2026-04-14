-- Additional tables for patient management and prescriptions
-- Run this after the initial schema

-- Patients table (nurses input patient data)
CREATE TABLE IF NOT EXISTS patients (
  id INT PRIMARY KEY AUTO_INCREMENT,
  patient_number VARCHAR(50) UNIQUE NOT NULL,
  full_name VARCHAR(150) NOT NULL,
  age INT NOT NULL,
  gender ENUM('male', 'female', 'other') NOT NULL,
  weight DECIMAL(5, 2) COMMENT 'Weight in kg',
  height DECIMAL(5, 2) COMMENT 'Height in cm',
  blood_pressure VARCHAR(20) COMMENT 'e.g., 120/80',
  bmi DECIMAL(4, 2),
  underlying_conditions TEXT COMMENT 'Comma separated list',
  allergies TEXT COMMENT 'Comma separated list',
  chief_complaint TEXT COMMENT 'CC - Chief Complaint',
  building VARCHAR(100) COMMENT 'Building/Ward location',
  room_number VARCHAR(20),
  registered_by INT NOT NULL COMMENT 'Nurse who registered',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (registered_by) REFERENCES users(id) ON DELETE CASCADE
);

-- Prescriptions table (doctors prescribe to pharmacist)
CREATE TABLE IF NOT EXISTS prescriptions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  prescription_number VARCHAR(50) UNIQUE NOT NULL,
  patient_id INT NOT NULL,
  prescribed_by INT NOT NULL COMMENT 'Doctor who prescribed',
  status ENUM('pending', 'approved', 'preparing', 'ready', 'dispatched', 'delivered', 'cancelled') DEFAULT 'pending',
  priority ENUM('low', 'normal', 'high', 'urgent') DEFAULT 'normal',
  diagnosis TEXT,
  notes TEXT,
  reviewed_by INT COMMENT 'Pharmacist who reviewed',
  reviewed_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
  FOREIGN KEY (prescribed_by) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Prescription items (medications in a prescription)
CREATE TABLE IF NOT EXISTS prescription_items (
  id INT PRIMARY KEY AUTO_INCREMENT,
  prescription_id INT NOT NULL,
  drug_id INT NOT NULL,
  quantity INT NOT NULL,
  dosage_instructions TEXT COMMENT 'e.g., Take 1 tablet 3 times daily after meals',
  duration VARCHAR(50) COMMENT 'e.g., 7 days, 2 weeks',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (prescription_id) REFERENCES prescriptions(id) ON DELETE CASCADE,
  FOREIGN KEY (drug_id) REFERENCES drugs(id) ON DELETE CASCADE
);

-- Staff delivery assignments (pharmacist assigns staff to deliver)
CREATE TABLE IF NOT EXISTS delivery_assignments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  prescription_id INT NOT NULL,
  assigned_staff_id INT NOT NULL COMMENT 'Staff member assigned to deliver',
  assigned_by INT NOT NULL COMMENT 'Pharmacist who assigned',
  building VARCHAR(100) NOT NULL,
  delivery_location VARCHAR(200),
  status ENUM('assigned', 'in_transit', 'delivered', 'cancelled') DEFAULT 'assigned',
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  picked_up_at TIMESTAMP NULL,
  delivered_at TIMESTAMP NULL,
  marked_delivered_by INT COMMENT 'Nurse who marked as delivered',
  received_by_name VARCHAR(100),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (prescription_id) REFERENCES prescriptions(id) ON DELETE CASCADE,
  FOREIGN KEY (assigned_staff_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (assigned_by) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (marked_delivered_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Create indexes
CREATE INDEX idx_patients_number ON patients(patient_number);
CREATE INDEX idx_patients_name ON patients(full_name);
CREATE INDEX idx_patients_building ON patients(building);
CREATE INDEX idx_prescriptions_status ON prescriptions(status);
CREATE INDEX idx_prescriptions_patient ON prescriptions(patient_id);
CREATE INDEX idx_prescriptions_doctor ON prescriptions(prescribed_by);
CREATE INDEX idx_delivery_assignments_status ON delivery_assignments(status);
CREATE INDEX idx_delivery_assignments_staff ON delivery_assignments(assigned_staff_id);
