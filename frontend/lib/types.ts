// Hospital Pharmacy Management System Types

export type UserRole = 'pharmacist' | 'doctor' | 'nurse' | 'administrator'

export interface User {
  id: number
  username: string
  email: string
  fullName: string
  role: UserRole
  department: string
  avatarUrl?: string
}

export interface Drug {
  id: number
  drug_code: string
  drug_name: string
  generic_name: string
  category_id: number
  category_name: string
  manufacturer: string
  dosage_form: string
  strength: string
  unit_price: number
  reorder_level: number
  description: string
  requires_prescription: boolean
  total_quantity: number
  batch_count: number
  nearest_expiry: string
  stockStatus: 'in_stock' | 'low_stock' | 'out_of_stock'
}

export interface DrugBatch {
  id: number
  drug_id: number
  batch_number: string
  quantity: number
  manufacturing_date: string
  expiry_date: string
  supplier: string
  purchase_price: number
  received_date: string
}

export interface DrugCategory {
  id: number
  name: string
  description: string
}

export interface DrugRequest {
  id: number
  request_number: string
  requested_by: number
  requested_by_name: string
  department: string
  status: RequestStatus
  priority: 'low' | 'normal' | 'high' | 'urgent'
  required_by_date: string
  notes: string
  approved_by: number
  approved_by_name: string
  approved_at: string
  rejection_reason: string
  created_at: string
  items: DrugRequestItem[]
}

export type RequestStatus = 'pending' | 'approved' | 'partially_approved' | 'rejected' | 'dispatched' | 'delivered' | 'cancelled'

export interface DrugRequestItem {
  id: number
  request_id: number
  drug_id: number
  drug_name: string
  drug_code: string
  quantity_requested: number
  quantity_approved: number
  quantity_dispensed: number
  notes: string
}

export interface Delivery {
  id: number
  delivery_number: string
  request_id: number
  request_number: string
  department: string
  status: DeliveryStatus
  dispatched_by: number
  dispatched_by_name: string
  dispatched_at: string
  delivery_location: string
  delivered_by: number
  delivered_by_name: string
  delivered_at: string
  received_by_name: string
  notes: string
  created_at: string
  items: DeliveryItem[]
}

export type DeliveryStatus = 'preparing' | 'in_transit' | 'delivered' | 'cancelled'

export interface DeliveryItem {
  id: number
  delivery_id: number
  drug_id: number
  drug_name: string
  drug_code: string
  batch_id: number
  batch_number: string
  quantity: number
}

export interface Notification {
  id: number
  user_id: number
  title: string
  message: string
  type: 'info' | 'warning' | 'success' | 'error'
  is_read: boolean
  link: string
  created_at: string
}

// Patient - registered by nurses
export interface Patient {
  id: number
  patient_number: string
  full_name: string
  age: number
  gender: 'male' | 'female' | 'other'
  weight: number
  height: number
  blood_pressure: string
  bmi: number
  underlying_conditions: string
  allergies: string
  chief_complaint: string
  building: string
  room_number: string
  registered_by: number
  registered_by_name: string
  is_active: boolean
  created_at: string
}

// Prescription - created by doctors
export interface Prescription {
  id: number
  prescription_number: string
  patient_id: number
  patient: Patient
  prescribed_by: number
  prescribed_by_name: string
  status: PrescriptionStatus
  priority: 'low' | 'normal' | 'high' | 'urgent'
  diagnosis: string
  notes: string
  reviewed_by: number
  reviewed_by_name: string
  reviewed_at: string
  created_at: string
  items: PrescriptionItem[]
  delivery_assignment?: DeliveryAssignment
}

export type PrescriptionStatus = 'pending' | 'approved' | 'preparing' | 'ready' | 'dispatched' | 'delivered' | 'cancelled'

export interface PrescriptionItem {
  id: number
  prescription_id: number
  drug_id: number
  drug_name: string
  drug_code: string
  quantity: number
  dosage_instructions: string
  duration: string
  notes: string
}

// Delivery assignment - pharmacist assigns staff
export interface DeliveryAssignment {
  id: number
  prescription_id: number
  prescription_number: string
  patient_name: string
  assigned_staff_id: number
  assigned_staff_name: string
  assigned_by: number
  assigned_by_name: string
  building: string
  delivery_location: string
  status: DeliveryAssignmentStatus
  assigned_at: string
  picked_up_at: string
  delivered_at: string
  marked_delivered_by: number
  marked_delivered_by_name: string
  received_by_name: string
  notes: string
}

export type DeliveryAssignmentStatus = 'assigned' | 'in_transit' | 'delivered' | 'cancelled'

export interface DashboardStats {
  totalDrugs: number
  lowStockCount: number
  expiringCount: number
  pendingRequests: number
  deliveriesInTransit: number
  todayRequests?: number
  myRequests?: number
}

export interface StockReport {
  drug_code: string
  drug_name: string
  generic_name: string
  category: string
  unit_price: number
  reorder_level: number
  total_quantity: number
  batch_count: number
  nearest_expiry: string
  stock_value: number
}

export interface ExpiryReport {
  batch_number: string
  drug_code: string
  drug_name: string
  quantity: number
  expiry_date: string
  supplier: string
  days_until_expiry: number
}

export interface RequestSummaryReport {
  total_requests: number
  pending: number
  approved: number
  rejected: number
  delivered: number
  department: string
}

// Navigation items per role
export interface NavItem {
  label: string
  href: string
  icon: string
  roles: UserRole[]
}

// Form interfaces
export interface AddDrugForm {
  drugCode: string
  drugName: string
  genericName: string
  categoryId: number
  manufacturer: string
  dosageForm: string
  strength: string
  unitPrice: number
  reorderLevel: number
  description: string
  requiresPrescription: boolean
}

export interface CreateRequestForm {
  department: string
  priority: 'low' | 'normal' | 'high' | 'urgent'
  requiredByDate: string
  notes: string
  items: { drugId: number; quantity: number; notes: string }[]
}

export interface AddBatchForm {
  batchNumber: string
  quantity: number
  manufacturingDate: string
  expiryDate: string
  supplier: string
  purchasePrice: number
  notes: string
}
