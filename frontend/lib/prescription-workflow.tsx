import type { WorkflowPrescriptionRequest, WorkflowRequestStatus } from './types'

const WORKFLOW_REQUESTS_KEY = 'workflow_prescription_requests_v2'

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

export function saveWorkflowPrescriptionRequests(requests: WorkflowPrescriptionRequest[]) {
  if (!isBrowser()) return
  localStorage.setItem(WORKFLOW_REQUESTS_KEY, JSON.stringify(requests))
}

export function addWorkflowPrescriptionRequest(request: WorkflowPrescriptionRequest) {
  const current = getWorkflowPrescriptionRequests()
  saveWorkflowPrescriptionRequests([request, ...current])
}

export function updateWorkflowPrescriptionRequest(
  requestId: string,
  updater: (request: WorkflowPrescriptionRequest) => WorkflowPrescriptionRequest
) {
  const current = getWorkflowPrescriptionRequests()
  const updated = current.map((request) =>
    request.id === requestId ? updater(request) : request
  )
  saveWorkflowPrescriptionRequests(updated)
}

export function updateWorkflowPrescriptionStatus(
  requestId: string,
  status: WorkflowRequestStatus,
  extra: Partial<WorkflowPrescriptionRequest> = {}
) {
  updateWorkflowPrescriptionRequest(requestId, (request) => ({
    ...request,
    status,
    ...extra,
  }))
}

export function generateRequestNumber() {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  const time = now.getTime().toString().slice(-5)
  return `REQ-${y}${m}${d}-${time}`
}

export function generatePatientNumber() {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  const time = now.getTime().toString().slice(-4)
  return `PT-${y}${m}${d}-${time}`
}
