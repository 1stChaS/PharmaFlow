const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  (typeof window !== 'undefined'
    ? `${window.location.protocol}//${window.location.hostname}:3001/api`
    : 'http://localhost:3001/api')
    
type ApiMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

interface ApiOptions {
  method?: ApiMethod
  body?: unknown
}

export class ApiError extends Error {
  status: number
  details: unknown

  constructor(message: string, status: number, details: unknown = null) {
    super(message)
    this.status = status
    this.details = details
  }
}

async function apiRequest<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('pharmacy_token') : null

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: options.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  })

  const payload = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new ApiError(payload.message || 'API error', response.status, payload.details)
  }

  return (payload.data ?? payload) as T
}

export interface User {
  id: number
  username: string
  email: string
  fullName: string
  role: 'administrator' | 'pharmacist' | 'doctor' | 'nurse'
  department?: string
  avatarUrl?: string
  isActive?: boolean
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
  underlyingConditions?: string
  allergies?: string
  chiefComplaint: string
  building: string
  roomNumber?: string
}

export interface CreatePatientInput {
  fullName: string
  age: number
  gender: 'male' | 'female' | 'other'
  weight?: number
  height?: number
  bloodPressure?: string
  underlyingConditions?: string
  allergies?: string
  chiefComplaint: string
  building: string
  roomNumber?: string
  assignedDoctorId?: number
}

export const patientsApi = {
  getAll: () => apiRequest<Patient[]>('/patients'),

  create: (data: CreatePatientInput) =>
    apiRequest('/patients', {
      method: 'POST',
      body: data,
    }),
}

export interface PrescriptionItemInput {
  drugId: number
  quantity: number
  dosageInstructions: string
  duration?: string
  notes?: string
}

export interface PrescriptionInput {
  patientId: number
  priority: 'low' | 'normal' | 'high' | 'urgent'
  diagnosis: string
  notes?: string
  items: PrescriptionItemInput[]
}

export interface DeliveryAssignmentInput {
  prescriptionId: number
  assignedStaffId: number
  building: string
  deliveryLocation?: string
  notes?: string
}

export interface RequestItem {
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

export interface RequestRecord {
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
  items: RequestItem[]
}

export const authApi = {
  login: (username: string, password: string) =>
    apiRequest<{ token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: { username, password },
    }),
  me: () => apiRequest<User>('/auth/me'),
}

export const usersApi = {
  getAll: () => apiRequest<User[]>('/users'),
  create: (payload: { username: string; email: string; password: string; fullName: string; role: string; department?: string }) =>
    apiRequest<{ id: number }>('/users', { method: 'POST', body: payload }),
}

export const prescriptionsApi = {
  getAll: () => apiRequest<unknown[]>('/prescriptions'),
  create: (payload: PrescriptionInput) =>
    apiRequest<{ id: number; prescriptionNumber: string }>('/prescriptions', {
      method: 'POST',
      body: payload,
    }),
}

export const deliveryAssignmentsApi = {
  getAll: () => apiRequest<unknown[]>('/delivery-assignments'),
  create: (payload: DeliveryAssignmentInput) =>
    apiRequest<{ id: number }>('/delivery-assignments', { method: 'POST', body: payload }),
  markDelivered: (id: number, receivedByName: string) =>
    apiRequest('/delivery-assignments/' + id + '/mark-delivered', {
      method: 'PATCH',
      body: { receivedByName },
    }),
}

export const dashboardApi = {
  getStats: () => apiRequest<Record<string, number>>('/dashboard/stats'),
  getActivity: () => apiRequest<unknown[]>('/dashboard/activity'),
}

export const reportsApi = {
  getDistributionMonitoring: () =>
    apiRequest<{
      distribution: { status: string; total: number }[]
      roleSummary: { role: string; prescriptions: number }[]
    }>('/reports/distribution-monitoring'),
}

export const requestsApi = {
  getAll: () => apiRequest<RequestRecord[]>('/requests'),

  approve: (id: number | string) =>
    apiRequest<RequestRecord>(`/requests/${id}/approve`, {
      method: 'PATCH',
    }),

  reject: (id: number | string, reason: string) =>
    apiRequest<RequestRecord>(`/requests/${id}/reject`, {
      method: 'PATCH',
      body: { reason },
    }),

  dispatch: (id: number | string) =>
    apiRequest<RequestRecord>(`/requests/${id}/dispatch`, {
      method: 'PATCH',
    }),
}
