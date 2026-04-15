'use client'

import { useMemo, useState } from 'react'
import { Calendar, ClipboardList, Eye } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import type { WorkflowPrescriptionRequest } from '@/lib/types'
import { getWorkflowPrescriptionRequests } from '@/lib/prescription-workflow'
import { cn } from '@/lib/utils'

type FilterTab = 'all' | 'submitted_to_doctor' | 'prescribed' | 'dispatched' | 'received_complete'

function statusLabel(status: WorkflowPrescriptionRequest['status']) {
  switch (status) {
    case 'submitted_to_doctor':
      return 'Waiting Doctor'
    case 'prescribed':
      return 'Prescribed'
    case 'dispatched':
      return 'Dispatched'
    case 'received_complete':
      return 'Completed'
    default:
      return status
  }
}

function statusClass(status: WorkflowPrescriptionRequest['status']) {
  switch (status) {
    case 'submitted_to_doctor':
      return 'bg-amber-100 text-amber-700 border-amber-200'
    case 'prescribed':
      return 'bg-blue-100 text-blue-700 border-blue-200'
    case 'dispatched':
      return 'bg-purple-100 text-purple-700 border-purple-200'
    case 'received_complete':
      return 'bg-green-100 text-green-700 border-green-200'
    default:
      return 'bg-muted text-muted-foreground'
  }
}

export default function MyRequestsPage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<FilterTab>('all')
  const [selectedRequest, setSelectedRequest] = useState<WorkflowPrescriptionRequest | null>(null)
  const [requests] = useState<WorkflowPrescriptionRequest[]>(getWorkflowPrescriptionRequests())

  const myRequests = useMemo(() => {
    let filtered = requests

    if (user?.role === 'nurse' && user?.id) {
      filtered = filtered.filter((request) => request.submittedById === user.id)
    }

    if (activeTab === 'all') return filtered
    return filtered.filter((request) => request.status === activeTab)
  }, [requests, activeTab, user])

  const tabs: { value: FilterTab; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'submitted_to_doctor', label: 'Waiting Doctor' },
    { value: 'prescribed', label: 'Prescribed' },
    { value: 'dispatched', label: 'Dispatched' },
    { value: 'received_complete', label: 'Completed' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">My Requests</h1>
        <p className="text-muted-foreground">
          Track the patient cases submitted by nurse and their prescription-delivery progress.
        </p>
      </div>

      <Card className="rounded-2xl">
        <CardHeader className="border-b pb-0">
          <div className="flex items-center gap-1 overflow-x-auto pb-0">
            {tabs.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={cn(
                  'relative px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap',
                  activeTab === tab.value ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {tab.label}
                {activeTab === tab.value && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
                )}
              </button>
            ))}
          </div>
        </CardHeader>
        <CardContent className="p-4">
          {myRequests.length === 0 ? (
            <div className="rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">
              No requests found.
            </div>
          ) : (
            <div className="space-y-4">
              {myRequests.map((request) => (
                <div
                  key={request.id}
                  className="group rounded-2xl border border-border/50 bg-card p-4 transition-all hover:shadow-md cursor-pointer"
                  onClick={() => setSelectedRequest(request)}
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                        <ClipboardList className="h-5 w-5 text-primary" />
                      </div>

                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold">{request.patientName}</h3>
                          <Badge variant="outline" className="rounded-lg">
                            {request.requestNumber}
                          </Badge>
                          <Badge className={`rounded-lg border ${statusClass(request.status)}`}>
                            {statusLabel(request.status)}
                          </Badge>
                        </div>

                        <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            {new Date(request.createdAt).toLocaleDateString()}
                          </span>
                          <span>{request.items.length} medication item(s)</span>
                        </div>

                        <p className="mt-1 text-sm text-muted-foreground">
                          CC: {request.patientSnapshot.chiefComplaint}
                        </p>
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      className="rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedRequest(request)
                      }}
                    >
                      <Eye className="mr-1.5 h-4 w-4" />
                      Details
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
        <DialogContent className="rounded-2xl max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedRequest?.requestNumber}</DialogTitle>
            <DialogDescription>Full request and medication workflow details.</DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-4">
              <div className="rounded-xl border p-4">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold">{selectedRequest.patientName}</h3>
                  <Badge className={`rounded-lg border ${statusClass(selectedRequest.status)}`}>
                    {statusLabel(selectedRequest.status)}
                  </Badge>
                </div>

                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl bg-muted/40 p-3">
                    <p className="text-xs text-muted-foreground">Chief Complaint</p>
                    <p className="font-medium">{selectedRequest.patientSnapshot.chiefComplaint}</p>
                  </div>
                  <div className="rounded-xl bg-muted/40 p-3">
                    <p className="text-xs text-muted-foreground">Drug Allergies</p>
                    <p className="font-medium">{selectedRequest.patientSnapshot.drugAllergies || '-'}</p>
                  </div>
                  <div className="rounded-xl bg-muted/40 p-3 sm:col-span-2">
                    <p className="text-xs text-muted-foreground">Medication Details</p>
                    <p className="font-medium">{selectedRequest.patientSnapshot.medicationDetails || '-'}</p>
                  </div>
                  {selectedRequest.diagnosis && (
                    <div className="rounded-xl bg-muted/40 p-3 sm:col-span-2">
                      <p className="text-xs text-muted-foreground">Doctor Diagnosis</p>
                      <p className="font-medium">{selectedRequest.diagnosis}</p>
                    </div>
                  )}
                  {selectedRequest.doctorNotes && (
                    <div className="rounded-xl bg-muted/40 p-3 sm:col-span-2">
                      <p className="text-xs text-muted-foreground">Doctor Notes</p>
                      <p className="font-medium">{selectedRequest.doctorNotes}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="rounded-xl border p-4">
                <h4 className="font-semibold mb-3">Medication Items</h4>
                {selectedRequest.items.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Doctor has not added medication yet.</p>
                ) : (
                  <div className="space-y-2">
                    {selectedRequest.items.map((item) => (
                      <div key={item.id} className="rounded-xl border border-border/50 p-3">
                        <div className="font-medium">{item.medicationName}</div>
                        <div className="text-sm text-muted-foreground">
                          {item.dosage} · {item.frequency} · {item.duration || '-'} · Qty {item.quantity}
                        </div>
                        {item.notes && (
                          <div className="text-sm text-muted-foreground mt-1">Note: {item.notes}</div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="rounded-xl border p-4">
                <h4 className="font-semibold mb-3">Workflow Timeline</h4>
                <div className="space-y-2 text-sm">
                  <div>Submitted by: {selectedRequest.submittedByName || '-'}</div>
                  <div>Submitted at: {new Date(selectedRequest.createdAt).toLocaleString()}</div>
                  <div>Prescribed by: {selectedRequest.prescribedByName || '-'}</div>
                  <div>Dispatched by: {selectedRequest.dispatchedByName || '-'}</div>
                  <div>Received by: {selectedRequest.receivedByName || '-'}</div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}