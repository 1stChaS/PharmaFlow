import { Patient } from './api'

export interface WorkflowPrescriptionItem {
  id: string
  drugId: number
  drugName: string
  drugCode: string
  quantity: number
  dosageInstructions: string
  duration: string
  notes: string
}

export interface WorkflowPrescriptionRequest {
  id: string
  patientId: number
  patientName: string
  patientSnapshot: Patient
  createdAt: string
  requiredByDate: string
  priority: 'low' | 'normal' | 'high' | 'urgent'
  diagnosis: string
  notes: string
  status: 'pending' | 'approved' | 'dispatched' | 'delivered'
  items: WorkflowPrescriptionItem[]
}

const WORKFLOW_REQUESTS_KEY = 'workflow_prescription_requests'
const COMPLETED_PATIENTS_KEY = 'workflow_completed_patient_ids'

function isBrowser() {
  return typeof window !== 'undefined'
}

export function getWorkflowPrescriptionRequests(): WorkflowPrescriptionRequest[] {
  if (!isBrowser()) return []

  try {
    const raw = localStorage.getItem(WORKFLOW_REQUESTS_KEY)
    return raw ? (JSON.parse(raw) as WorkflowPrescriptionRequest[]) : []
  } catch {
    return []
  }
}

export function addWorkflowPrescriptionRequest(request: WorkflowPrescriptionRequest) {
  if (!isBrowser()) return

  const current = getWorkflowPrescriptionRequests()
  localStorage.setItem(WORKFLOW_REQUESTS_KEY, JSON.stringify([request, ...current]))
}

export function getCompletedPatientIds(): number[] {
  if (!isBrowser()) return []

  try {
    const raw = localStorage.getItem(COMPLETED_PATIENTS_KEY)
    return raw ? (JSON.parse(raw) as number[]) : []
  } catch {
    return []
  }
}

export function markPatientAsPrescribed(patientId: number) {
  if (!isBrowser()) return

  const current = getCompletedPatientIds()
  if (!current.includes(patientId)) {
    localStorage.setItem(COMPLETED_PATIENTS_KEY, JSON.stringify([...current, patientId]))
  }
}
