// Mock data for Hospital Pharmacy Management System
// This simulates backend responses for the UI demo

import { Drug, DrugCategory, DrugRequest, Delivery, DashboardStats, Notification, StockReport, ExpiryReport, RequestSummaryReport } from './types'

export const mockCategories: DrugCategory[] = [
  { id: 1, name: 'Antibiotics', description: 'Medications used to treat bacterial infections' },
  { id: 2, name: 'Analgesics', description: 'Pain relieving medications' },
  { id: 3, name: 'Cardiovascular', description: 'Medications for heart and blood vessel conditions' },
  { id: 4, name: 'Respiratory', description: 'Medications for respiratory conditions' },
  { id: 5, name: 'Gastrointestinal', description: 'Medications for digestive system' },
  { id: 6, name: 'Vitamins & Supplements', description: 'Nutritional supplements and vitamins' },
  { id: 7, name: 'Antidiabetic', description: 'Medications for diabetes management' },
  { id: 8, name: 'Antihypertensive', description: 'Medications for high blood pressure' },
]

export const mockDrugs: Drug[] = [
  {
    id: 1, drug_code: 'DRG001', drug_name: 'Amoxicillin 500mg', generic_name: 'Amoxicillin',
    category_id: 1, category_name: 'Antibiotics', manufacturer: 'PharmaCorp',
    dosage_form: 'capsule', strength: '500mg', unit_price: 15.50, reorder_level: 100,
    description: 'Broad-spectrum antibiotic', requires_prescription: true,
    total_quantity: 800, batch_count: 2, nearest_expiry: '2026-01-15', stockStatus: 'in_stock'
  },
  {
    id: 2, drug_code: 'DRG002', drug_name: 'Paracetamol 500mg', generic_name: 'Paracetamol',
    category_id: 2, category_name: 'Analgesics', manufacturer: 'MediLabs',
    dosage_form: 'tablet', strength: '500mg', unit_price: 5.00, reorder_level: 200,
    description: 'Pain and fever relief', requires_prescription: false,
    total_quantity: 1000, batch_count: 1, nearest_expiry: '2027-03-10', stockStatus: 'in_stock'
  },
  {
    id: 3, drug_code: 'DRG003', drug_name: 'Ibuprofen 400mg', generic_name: 'Ibuprofen',
    category_id: 2, category_name: 'Analgesics', manufacturer: 'HealthPharma',
    dosage_form: 'tablet', strength: '400mg', unit_price: 8.00, reorder_level: 150,
    description: 'Anti-inflammatory pain relief', requires_prescription: false,
    total_quantity: 800, batch_count: 1, nearest_expiry: '2026-02-20', stockStatus: 'in_stock'
  },
  {
    id: 4, drug_code: 'DRG004', drug_name: 'Metformin 500mg', generic_name: 'Metformin HCl',
    category_id: 7, category_name: 'Antidiabetic', manufacturer: 'DiabaCare',
    dosage_form: 'tablet', strength: '500mg', unit_price: 12.00, reorder_level: 100,
    description: 'Type 2 diabetes management', requires_prescription: true,
    total_quantity: 400, batch_count: 1, nearest_expiry: '2026-04-15', stockStatus: 'in_stock'
  },
  {
    id: 5, drug_code: 'DRG005', drug_name: 'Amlodipine 5mg', generic_name: 'Amlodipine Besylate',
    category_id: 8, category_name: 'Antihypertensive', manufacturer: 'CardioMed',
    dosage_form: 'tablet', strength: '5mg', unit_price: 18.00, reorder_level: 80,
    description: 'Blood pressure control', requires_prescription: true,
    total_quantity: 200, batch_count: 1, nearest_expiry: '2026-05-01', stockStatus: 'in_stock'
  },
  {
    id: 6, drug_code: 'DRG006', drug_name: 'Omeprazole 20mg', generic_name: 'Omeprazole',
    category_id: 5, category_name: 'Gastrointestinal', manufacturer: 'GastroHealth',
    dosage_form: 'capsule', strength: '20mg', unit_price: 22.00, reorder_level: 100,
    description: 'Acid reflux treatment', requires_prescription: true,
    total_quantity: 350, batch_count: 1, nearest_expiry: '2025-09-25', stockStatus: 'in_stock'
  },
  {
    id: 7, drug_code: 'DRG007', drug_name: 'Cetirizine 10mg', generic_name: 'Cetirizine HCl',
    category_id: 2, category_name: 'Analgesics', manufacturer: 'AllergyFree',
    dosage_form: 'tablet', strength: '10mg', unit_price: 6.50, reorder_level: 150,
    description: 'Allergy relief', requires_prescription: false,
    total_quantity: 600, batch_count: 1, nearest_expiry: '2026-06-10', stockStatus: 'in_stock'
  },
  {
    id: 8, drug_code: 'DRG008', drug_name: 'Vitamin C 1000mg', generic_name: 'Ascorbic Acid',
    category_id: 6, category_name: 'Vitamins & Supplements', manufacturer: 'VitaPlus',
    dosage_form: 'tablet', strength: '1000mg', unit_price: 10.00, reorder_level: 200,
    description: 'Immune system support', requires_prescription: false,
    total_quantity: 1500, batch_count: 1, nearest_expiry: '2025-07-01', stockStatus: 'in_stock'
  },
  {
    id: 9, drug_code: 'DRG009', drug_name: 'Salbutamol Inhaler', generic_name: 'Salbutamol',
    category_id: 4, category_name: 'Respiratory', manufacturer: 'RespiCare',
    dosage_form: 'other', strength: '100mcg/puff', unit_price: 45.00, reorder_level: 50,
    description: 'Asthma relief inhaler', requires_prescription: true,
    total_quantity: 100, batch_count: 1, nearest_expiry: '2025-10-20', stockStatus: 'in_stock'
  },
  {
    id: 10, drug_code: 'DRG010', drug_name: 'Aspirin 75mg', generic_name: 'Acetylsalicylic Acid',
    category_id: 3, category_name: 'Cardiovascular', manufacturer: 'CardioMed',
    dosage_form: 'tablet', strength: '75mg', unit_price: 4.50, reorder_level: 200,
    description: 'Heart health and blood thinning', requires_prescription: false,
    total_quantity: 2000, batch_count: 1, nearest_expiry: '2027-02-15', stockStatus: 'in_stock'
  },
  // Low stock items
  {
    id: 11, drug_code: 'DRG011', drug_name: 'Ciprofloxacin 500mg', generic_name: 'Ciprofloxacin',
    category_id: 1, category_name: 'Antibiotics', manufacturer: 'PharmaCorp',
    dosage_form: 'tablet', strength: '500mg', unit_price: 25.00, reorder_level: 80,
    description: 'Fluoroquinolone antibiotic', requires_prescription: true,
    total_quantity: 25, batch_count: 1, nearest_expiry: '2026-05-15', stockStatus: 'low_stock'
  },
  {
    id: 12, drug_code: 'DRG012', drug_name: 'Losartan 50mg', generic_name: 'Losartan Potassium',
    category_id: 8, category_name: 'Antihypertensive', manufacturer: 'CardioMed',
    dosage_form: 'tablet', strength: '50mg', unit_price: 20.00, reorder_level: 100,
    description: 'Blood pressure medication', requires_prescription: true,
    total_quantity: 30, batch_count: 1, nearest_expiry: '2026-06-01', stockStatus: 'low_stock'
  },
  // Near expiry
  {
    id: 13, drug_code: 'DRG013', drug_name: 'Metoprolol 50mg', generic_name: 'Metoprolol Tartrate',
    category_id: 3, category_name: 'Cardiovascular', manufacturer: 'CardioMed',
    dosage_form: 'tablet', strength: '50mg', unit_price: 16.00, reorder_level: 100,
    description: 'Beta blocker for heart', requires_prescription: true,
    total_quantity: 150, batch_count: 1, nearest_expiry: '2024-12-01', stockStatus: 'in_stock'
  },
  // Out of stock
  {
    id: 14, drug_code: 'DRG014', drug_name: 'Insulin Glargine', generic_name: 'Insulin Glargine',
    category_id: 7, category_name: 'Antidiabetic', manufacturer: 'DiabaCare',
    dosage_form: 'injection', strength: '100IU/mL', unit_price: 150.00, reorder_level: 30,
    description: 'Long-acting insulin', requires_prescription: true,
    total_quantity: 0, batch_count: 0, nearest_expiry: '', stockStatus: 'out_of_stock'
  },
]

export const mockRequests: DrugRequest[] = [
  {
    id: 1, request_number: 'REQ-2024-001', requested_by: 4, requested_by_name: 'Dr. Emily Williams',
    department: 'Internal Medicine', status: 'approved', priority: 'normal',
    required_by_date: '2024-06-20', notes: 'Regular monthly request for ward supplies',
    approved_by: 2, approved_by_name: 'Sarah Johnson', approved_at: '2024-06-16 10:30:00',
    rejection_reason: '', created_at: '2024-06-15 09:00:00',
    items: [
      { id: 1, request_id: 1, drug_id: 1, drug_name: 'Amoxicillin 500mg', drug_code: 'DRG001', quantity_requested: 100, quantity_approved: 100, quantity_dispensed: 100, notes: '' },
      { id: 2, request_id: 1, drug_id: 2, drug_name: 'Paracetamol 500mg', drug_code: 'DRG002', quantity_requested: 200, quantity_approved: 200, quantity_dispensed: 200, notes: '' },
    ]
  },
  {
    id: 2, request_number: 'REQ-2024-002', requested_by: 5, requested_by_name: 'Dr. James Brown',
    department: 'Cardiology', status: 'pending', priority: 'high',
    required_by_date: '2024-06-18', notes: 'Urgent need for cardiac medications',
    approved_by: 0, approved_by_name: '', approved_at: '',
    rejection_reason: '', created_at: '2024-06-17 08:00:00',
    items: [
      { id: 3, request_id: 2, drug_id: 5, drug_name: 'Amlodipine 5mg', drug_code: 'DRG005', quantity_requested: 80, quantity_approved: 0, quantity_dispensed: 0, notes: '' },
      { id: 4, request_id: 2, drug_id: 10, drug_name: 'Aspirin 75mg', drug_code: 'DRG010', quantity_requested: 150, quantity_approved: 0, quantity_dispensed: 0, notes: '' },
    ]
  },
  {
    id: 3, request_number: 'REQ-2024-003', requested_by: 6, requested_by_name: 'Lisa Anderson',
    department: 'Emergency', status: 'dispatched', priority: 'urgent',
    required_by_date: '2024-06-15', notes: 'Emergency department restocking',
    approved_by: 2, approved_by_name: 'Sarah Johnson', approved_at: '2024-06-15 14:00:00',
    rejection_reason: '', created_at: '2024-06-15 13:00:00',
    items: [
      { id: 5, request_id: 3, drug_id: 2, drug_name: 'Paracetamol 500mg', drug_code: 'DRG002', quantity_requested: 300, quantity_approved: 300, quantity_dispensed: 300, notes: '' },
      { id: 6, request_id: 3, drug_id: 3, drug_name: 'Ibuprofen 400mg', drug_code: 'DRG003', quantity_requested: 200, quantity_approved: 200, quantity_dispensed: 200, notes: '' },
    ]
  },
  {
    id: 4, request_number: 'REQ-2024-004', requested_by: 7, requested_by_name: 'David Martinez',
    department: 'ICU', status: 'delivered', priority: 'high',
    required_by_date: '2024-06-10', notes: 'ICU critical medications',
    approved_by: 2, approved_by_name: 'Sarah Johnson', approved_at: '2024-06-09 08:00:00',
    rejection_reason: '', created_at: '2024-06-08 16:00:00',
    items: [
      { id: 7, request_id: 4, drug_id: 5, drug_name: 'Amlodipine 5mg', drug_code: 'DRG005', quantity_requested: 50, quantity_approved: 50, quantity_dispensed: 50, notes: '' },
    ]
  },
  {
    id: 5, request_number: 'REQ-2024-005', requested_by: 4, requested_by_name: 'Dr. Emily Williams',
    department: 'Internal Medicine', status: 'pending', priority: 'normal',
    required_by_date: '2024-06-25', notes: 'Additional antibiotics needed',
    approved_by: 0, approved_by_name: '', approved_at: '',
    rejection_reason: '', created_at: '2024-06-18 11:00:00',
    items: [
      { id: 8, request_id: 5, drug_id: 1, drug_name: 'Amoxicillin 500mg', drug_code: 'DRG001', quantity_requested: 150, quantity_approved: 0, quantity_dispensed: 0, notes: '' },
      { id: 9, request_id: 5, drug_id: 11, drug_name: 'Ciprofloxacin 500mg', drug_code: 'DRG011', quantity_requested: 80, quantity_approved: 0, quantity_dispensed: 0, notes: '' },
    ]
  },
]

export const mockDeliveries: Delivery[] = [
  {
    id: 1, delivery_number: 'DEL-2024-001', request_id: 1, request_number: 'REQ-2024-001',
    department: 'Internal Medicine', status: 'delivered',
    dispatched_by: 2, dispatched_by_name: 'Sarah Johnson', dispatched_at: '2024-06-18 10:00:00',
    delivery_location: 'Internal Medicine Ward - Floor 3',
    delivered_by: 3, delivered_by_name: 'Michael Chen', delivered_at: '2024-06-18 10:30:00',
    received_by_name: 'Nurse Maria Santos', notes: '', created_at: '2024-06-18 10:00:00',
    items: [
      { id: 1, delivery_id: 1, drug_id: 1, drug_name: 'Amoxicillin 500mg', drug_code: 'DRG001', batch_id: 1, batch_number: 'BAT-AMX-001', quantity: 100 },
      { id: 2, delivery_id: 1, drug_id: 2, drug_name: 'Paracetamol 500mg', drug_code: 'DRG002', batch_id: 3, batch_number: 'BAT-PCM-001', quantity: 200 },
    ]
  },
  {
    id: 2, delivery_number: 'DEL-2024-002', request_id: 3, request_number: 'REQ-2024-003',
    department: 'Emergency', status: 'in_transit',
    dispatched_by: 2, dispatched_by_name: 'Sarah Johnson', dispatched_at: '2024-06-17 14:00:00',
    delivery_location: 'Emergency Department - Ground Floor',
    delivered_by: 0, delivered_by_name: '', delivered_at: '',
    received_by_name: '', notes: '', created_at: '2024-06-17 14:00:00',
    items: [
      { id: 3, delivery_id: 2, drug_id: 2, drug_name: 'Paracetamol 500mg', drug_code: 'DRG002', batch_id: 3, batch_number: 'BAT-PCM-001', quantity: 300 },
      { id: 4, delivery_id: 2, drug_id: 3, drug_name: 'Ibuprofen 400mg', drug_code: 'DRG003', batch_id: 4, batch_number: 'BAT-IBU-001', quantity: 200 },
    ]
  },
  {
    id: 3, delivery_number: 'DEL-2024-003', request_id: 4, request_number: 'REQ-2024-004',
    department: 'ICU', status: 'delivered',
    dispatched_by: 3, dispatched_by_name: 'Michael Chen', dispatched_at: '2024-06-09 09:00:00',
    delivery_location: 'ICU - Floor 5',
    delivered_by: 3, delivered_by_name: 'Michael Chen', delivered_at: '2024-06-09 09:15:00',
    received_by_name: 'Head Nurse Johnson', notes: '', created_at: '2024-06-09 09:00:00',
    items: [
      { id: 5, delivery_id: 3, drug_id: 5, drug_name: 'Amlodipine 5mg', drug_code: 'DRG005', batch_id: 5, batch_number: 'BAT-AML-001', quantity: 50 },
    ]
  },
]

export const mockNotifications: Notification[] = [
  { id: 1, user_id: 2, title: 'Low Stock Alert', message: 'Ciprofloxacin 500mg is running low (25 units remaining)', type: 'warning', is_read: false, link: '/dashboard/inventory', created_at: '2024-06-18 08:00:00' },
  { id: 2, user_id: 2, title: 'Expiry Alert', message: 'Metoprolol 50mg batch BAT-MTP-001 expires in 30 days', type: 'warning', is_read: false, link: '/dashboard/inventory', created_at: '2024-06-18 08:00:00' },
  { id: 3, user_id: 2, title: 'New Request', message: 'New drug request REQ-2024-005 from Internal Medicine', type: 'info', is_read: false, link: '/dashboard/requests', created_at: '2024-06-18 11:00:00' },
  { id: 4, user_id: 3, title: 'Delivery Assigned', message: 'You have been assigned to delivery DEL-2024-002', type: 'info', is_read: true, link: '/dashboard/deliveries', created_at: '2024-06-17 14:00:00' },
  { id: 5, user_id: 4, title: 'Request Approved', message: 'Your request REQ-2024-001 has been approved', type: 'success', is_read: true, link: '/dashboard/my-requests', created_at: '2024-06-16 10:30:00' },
  { id: 6, user_id: 6, title: 'Request Dispatched', message: 'Your request REQ-2024-003 has been dispatched', type: 'info', is_read: false, link: '/dashboard/my-requests', created_at: '2024-06-17 14:00:00' },
]

export const mockDashboardStats: DashboardStats = {
  totalDrugs: 14,
  lowStockCount: 2,
  expiringCount: 3,
  pendingRequests: 2,
  deliveriesInTransit: 1,
  todayRequests: 1,
  myRequests: 3,
}

export const mockStockReport: StockReport[] = mockDrugs.map(d => ({
  drug_code: d.drug_code,
  drug_name: d.drug_name,
  generic_name: d.generic_name,
  category: d.category_name,
  unit_price: d.unit_price,
  reorder_level: d.reorder_level,
  total_quantity: d.total_quantity,
  batch_count: d.batch_count,
  nearest_expiry: d.nearest_expiry,
  stock_value: d.total_quantity * d.unit_price,
}))

export const mockExpiryReport: ExpiryReport[] = [
  { batch_number: 'BAT-MTP-001', drug_code: 'DRG013', drug_name: 'Metoprolol 50mg', quantity: 150, expiry_date: '2024-12-01', supplier: 'CardioMed Partners', days_until_expiry: 30 },
  { batch_number: 'BAT-VTC-001', drug_code: 'DRG008', drug_name: 'Vitamin C 1000mg', quantity: 1500, expiry_date: '2025-07-01', supplier: 'VitaPlus Nutrition', days_until_expiry: 180 },
  { batch_number: 'BAT-OME-001', drug_code: 'DRG006', drug_name: 'Omeprazole 20mg', quantity: 350, expiry_date: '2025-09-25', supplier: 'GastroHealth Inc', days_until_expiry: 90 },
  { batch_number: 'BAT-SAL-001', drug_code: 'DRG009', drug_name: 'Salbutamol Inhaler', quantity: 100, expiry_date: '2025-10-20', supplier: 'RespiCare Medical', days_until_expiry: 120 },
]

export const mockRequestSummaryReport: RequestSummaryReport[] = [
  { total_requests: 3, pending: 1, approved: 1, rejected: 0, delivered: 1, department: 'Internal Medicine' },
  { total_requests: 1, pending: 1, approved: 0, rejected: 0, delivered: 0, department: 'Cardiology' },
  { total_requests: 1, pending: 0, approved: 0, rejected: 0, delivered: 0, department: 'Emergency' },
  { total_requests: 1, pending: 0, approved: 0, rejected: 0, delivered: 1, department: 'ICU' },
]
