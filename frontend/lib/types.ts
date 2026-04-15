// Hospital Pharmacy Management System Types

export type UserRole = 'pharmacist' | 'doctor' | 'nurse' | 'administrator'

export interface User {
  id: number
  username: string
  email: string
  fullName: string
  role: UserRole
  department?: string
  avatarUrl?: string
}

export interface Drug {
  id: number
  drug_code: string
  drug_name: string
  generic_name?: string
  category_id?: number
  category_name?: string
  manufacturer?: string
  dosage_form?: string
  strength?: string
  unit_price?: number
  reorder_level?: number
  description?: string
  requires_prescription?: boolean
  total_quantity?: number
  batch_count?: number
  nearest_expiry?: string
  stockStatus?: 'in_stock' | 'low_stock' | 'out_of_stock'
}

export interface Patient {
  id: number
  patientNumber: string
  fullName: string
  age: number
  gender: 'male' | 'female' | 'other'
  weight?: number
  height?: number
  bloodPressure?: string
  bmi?: number
  chronicDiseases?: string
  drugAllergies?: string
  chiefComplaint: string
  medicationDetails?: string
  building: string
  roomNumber?: string
  registeredBy?: number
  registeredByName?: string
  isActive?: boolean
  createdAt?: string
}

export interface PrescriptionItem {
  id: string
  medicationName: string
  dosage: string
  frequency: string
  duration: string
  quantity: number
  notes?: string
}

export type WorkflowRequestStatus =
  | 'submitted_to_doctor'
  | 'prescribed'
  | 'dispatched'
  | 'received_complete'

export interface WorkflowPrescriptionRequest {
  id: string
  requestNumber: string
  patientId: number
  patientName: string
  patientSnapshot: Patient
  createdAt: string
  requiredByDate: string
  priority: 'low' | 'normal' | 'high' | 'urgent'
  status: WorkflowRequestStatus
  nurseNotes?: string
  diagnosis?: string
  doctorNotes?: string
  items: PrescriptionItem[]
  submittedById?: number
  submittedByName?: string
  prescribedById?: number
  prescribedByName?: string
  prescribedAt?: string
  dispatchedById?: number
  dispatchedByName?: string
  dispatchedAt?: string
  receivedById?: number
  receivedByName?: string
  receivedAt?: string
}

export interface DrugRequest {
  id: number
  request_number: string
  requested_by: number
  requested_by_name: string
  department: string
  status:
    | 'pending'
    | 'approved'
    | 'partially_approved'
    | 'rejected'
    | 'dispatched'
    | 'delivered'
    | 'cancelled'
  priority: 'low' | 'normal' | 'high' | 'urgent'
  required_by_date: string
  notes: string
  approved_by?: number
  approved_by_name?: string
  approved_at?: string
  rejection_reason?: string
  created_at: string
  items: DrugRequestItem[]
  patient_name?: string
}

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
  request_id?: number
  request_number?: string
  department?: string
  status: 'preparing' | 'in_transit' | 'delivered' | 'cancelled'
  dispatched_by?: number
  dispatched_by_name?: string
  dispatched_at?: string
  delivery_location?: string
  delivered_by?: number
  delivered_by_name?: string
  delivered_at?: string
  received_by_name?: string
  notes?: string
  created_at?: string
  items: DeliveryItem[]
}

export interface DeliveryItem {
  id: number
  delivery_id?: number
  drug_id?: number
  drug_name: string
  drug_code?: string
  batch_id?: number
  batch_number?: string
  quantity: number
}

export interface DashboardStats {
  totalDrugs: number
  lowStockCount: number
  expiringCount: number
  pendingRequests: number
  deliveriesInTransit: number
  todayRequests?: number
  myRequests?: number
}