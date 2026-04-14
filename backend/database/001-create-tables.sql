-- Hospital Pharmacy Management System Database Schema
-- MySQL Database

-- Users table for authentication and role-based access
CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(100) NOT NULL,
  role ENUM('pharmacist', 'doctor', 'nurse', 'administrator') NOT NULL,
  department VARCHAR(100),
  avatar_url VARCHAR(255),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Drug categories for organizing medications
CREATE TABLE IF NOT EXISTS drug_categories (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Drugs/Medications inventory
CREATE TABLE IF NOT EXISTS drugs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  drug_code VARCHAR(50) UNIQUE NOT NULL,
  drug_name VARCHAR(150) NOT NULL,
  generic_name VARCHAR(150),
  category_id INT,
  manufacturer VARCHAR(150),
  dosage_form ENUM('tablet', 'capsule', 'syrup', 'injection', 'cream', 'ointment', 'drops', 'powder', 'suspension', 'other') DEFAULT 'tablet',
  strength VARCHAR(50),
  unit_price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  reorder_level INT DEFAULT 50,
  description TEXT,
  requires_prescription BOOLEAN DEFAULT TRUE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES drug_categories(id) ON DELETE SET NULL
);

-- Drug batches for tracking inventory by batch
CREATE TABLE IF NOT EXISTS drug_batches (
  id INT PRIMARY KEY AUTO_INCREMENT,
  drug_id INT NOT NULL,
  batch_number VARCHAR(50) NOT NULL,
  quantity INT NOT NULL DEFAULT 0,
  manufacturing_date DATE,
  expiry_date DATE NOT NULL,
  supplier VARCHAR(150),
  purchase_price DECIMAL(10, 2),
  received_date DATE DEFAULT (CURRENT_DATE),
  received_by INT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (drug_id) REFERENCES drugs(id) ON DELETE CASCADE,
  FOREIGN KEY (received_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Drug requests from departments
CREATE TABLE IF NOT EXISTS drug_requests (
  id INT PRIMARY KEY AUTO_INCREMENT,
  request_number VARCHAR(50) UNIQUE NOT NULL,
  requested_by INT NOT NULL,
  department VARCHAR(100),
  status ENUM('pending', 'approved', 'partially_approved', 'rejected', 'dispatched', 'delivered', 'cancelled') DEFAULT 'pending',
  priority ENUM('low', 'normal', 'high', 'urgent') DEFAULT 'normal',
  required_by_date DATE,
  notes TEXT,
  approved_by INT,
  approved_at TIMESTAMP NULL,
  rejection_reason TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (requested_by) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Drug request items (individual drugs in a request)
CREATE TABLE IF NOT EXISTS drug_request_items (
  id INT PRIMARY KEY AUTO_INCREMENT,
  request_id INT NOT NULL,
  drug_id INT NOT NULL,
  quantity_requested INT NOT NULL,
  quantity_approved INT DEFAULT 0,
  quantity_dispensed INT DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (request_id) REFERENCES drug_requests(id) ON DELETE CASCADE,
  FOREIGN KEY (drug_id) REFERENCES drugs(id) ON DELETE CASCADE
);

-- Deliveries for tracking drug dispatches
CREATE TABLE IF NOT EXISTS deliveries (
  id INT PRIMARY KEY AUTO_INCREMENT,
  delivery_number VARCHAR(50) UNIQUE NOT NULL,
  request_id INT NOT NULL,
  status ENUM('preparing', 'in_transit', 'delivered', 'cancelled') DEFAULT 'preparing',
  dispatched_by INT,
  dispatched_at TIMESTAMP NULL,
  delivery_location VARCHAR(200),
  delivered_by INT,
  delivered_at TIMESTAMP NULL,
  received_by_name VARCHAR(100),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (request_id) REFERENCES drug_requests(id) ON DELETE CASCADE,
  FOREIGN KEY (dispatched_by) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (delivered_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Delivery items tracking
CREATE TABLE IF NOT EXISTS delivery_items (
  id INT PRIMARY KEY AUTO_INCREMENT,
  delivery_id INT NOT NULL,
  drug_id INT NOT NULL,
  batch_id INT,
  quantity INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (delivery_id) REFERENCES deliveries(id) ON DELETE CASCADE,
  FOREIGN KEY (drug_id) REFERENCES drugs(id) ON DELETE CASCADE,
  FOREIGN KEY (batch_id) REFERENCES drug_batches(id) ON DELETE SET NULL
);

-- Audit logs for tracking system activities
CREATE TABLE IF NOT EXISTS audit_logs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT,
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50),
  entity_id INT,
  old_values JSON,
  new_values JSON,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  type ENUM('info', 'warning', 'success', 'error') DEFAULT 'info',
  is_read BOOLEAN DEFAULT FALSE,
  link VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes for better query performance
CREATE INDEX idx_drugs_code ON drugs(drug_code);
CREATE INDEX idx_drugs_name ON drugs(drug_name);
CREATE INDEX idx_drug_batches_expiry ON drug_batches(expiry_date);
CREATE INDEX idx_drug_requests_status ON drug_requests(status);
CREATE INDEX idx_drug_requests_user ON drug_requests(requested_by);
CREATE INDEX idx_deliveries_status ON deliveries(status);
CREATE INDEX idx_notifications_user ON notifications(user_id, is_read);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
