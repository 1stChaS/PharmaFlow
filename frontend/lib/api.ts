const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

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

export const patientsApi = {
  getAll: () => apiRequest<Patient[]>('/patients'),
  getById: (id: number) => apiRequest<Patient>(`/patients/${id}`),
  create: (payload: Omit<Patient, 'id' | 'patientNumber' | 'bmi'>) =>
    apiRequest<{ id: number; patientNumber: string }>('/patients', { method: 'POST', body: payload }),
}

export const prescriptionsApi = {
  getAll: () => apiRequest<unknown[]>('/prescriptions'),
  create: (payload: PrescriptionInput) => apiRequest<{ id: number; prescriptionNumber: string }>('/prescriptions', { method: 'POST', body: payload }),
}

export const deliveryAssignmentsApi = {
  getAll: () => apiRequest<unknown[]>('/delivery-assignments'),
  create: (payload: DeliveryAssignmentInput) => apiRequest<{ id: number }>('/delivery-assignments', { method: 'POST', body: payload }),
  markDelivered: (id: number, receivedByName: string) =>
    apiRequest('/delivery-assignments/' + id + '/mark-delivered', { method: 'PATCH', body: { receivedByName } }),
}

export const dashboardApi = {
  getStats: () => apiRequest<Record<string, number>>('/dashboard/stats'),
  getActivity: () => apiRequest<unknown[]>('/dashboard/activity'),
}

export const reportsApi = {
  getDistributionMonitoring: () => apiRequest<{ distribution: { status: string; total: number }[]; roleSummary: { role: string; prescriptions: number }[] }>('/reports/distribution-monitoring'),
}
