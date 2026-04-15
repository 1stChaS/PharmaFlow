'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  ClipboardList,
  CheckCircle2,
  Truck,
  Eye,
  Calendar,
  UserRound,
  Package,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { EmptyState } from '@/components/pharmacy/empty-state'
import { StatCard } from '@/components/pharmacy/stat-card'
import { useAuth } from '@/lib/auth-context'
import { cn } from '@/lib/utils'
import type { WorkflowPrescriptionRequest } from '@/lib/types'
import {
  getWorkflowPrescriptionRequests,
  updateWorkflowPrescriptionRequest,
} from '@/lib/prescription-workflow'

type FilterTab = 'all' | 'prescribed' | 'dispatched' | 'received_complete'

function getStatusLabel(status: WorkflowPrescriptionRequest['status']) {
  switch (status) {
    case 'submitted_to_doctor':
      return 'Waiting Doctor'
    case 'prescribed':
      return 'Ready for Dispatch'
    case 'dispatched':
      return 'Dispatched'
    case 'received_complete':
      return 'Completed'
    default:
      return status
  }
}

function getStatusClasses(status: WorkflowPrescriptionRequest['status']) {
  switch (status) {
    case 'prescribed':
      return 'bg-blue-100 text-blue-700 border-blue-200'
    case 'dispatched':
      return 'bg-purple-100 text-purple-700 border-purple-200'
    case 'received_complete':
      return 'bg-green-100 text-green-700 border-green-200'
    default:
      return 'bg-muted text-muted-foreground border-border'
  }
}

export default function RequestsPage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<FilterTab>('all')
  const [requests, setRequests] = useState<WorkflowPrescriptionRequest[]>([])
  const [selectedRequest, setSelectedRequest] = useState<WorkflowPrescriptionRequest | null>(null)

  const isPharmacist = user?.role === 'pharmacist' || user?.role === 'administrator'

  useEffect(() => {
    const loadRequests = () => {
      setRequests(getWorkflowPrescriptionRequests())
    }

    loadRequests()
    window.addEventListener('storage', loadRequests)

    return () => {
      window.removeEventListener('storage', loadRequests)
    }
  }, [])

  const pharmacistRequests = useMemo(() => {
    const workflowItems = requests.filter(
      (request) =>
        request.status === 'prescribed' ||
        request.status === 'dispatched' ||
        request.status === 'received_complete'
    )

    if (activeTab === 'all') return workflowItems
    return workflowItems.filter((request) => request.status === activeTab)
  }, [requests, activeTab])

  const stats = useMemo(() => {
    const workflowItems = requests.filter(
      (request) =>
        request.status === 'prescribed' ||
        request.status === 'dispatched' ||
        request.status === 'received_complete'
    )

    return {
      prescribed: workflowItems.filter((request) => request.status === 'prescribed').length,
      dispatched: workflowItems.filter((request) => request.status === 'dispatched').length,
      completed: workflowItems.filter((request) => request.status === 'received_complete').length,
      total: workflowItems.length,
    }
  }, [requests])

  const tabs: { value: FilterTab; label: string }[] = [
    { value: 'all', label: 'All Requests' },
    { value: 'prescribed', label: 'Ready for Dispatch' },
    { value: 'dispatched', label: 'Dispatched' },
    { value: 'received_complete', label: 'Completed' },
  ]

  const refreshRequests = () => {
    setRequests(getWorkflowPrescriptionRequests())
    window.dispatchEvent(new Event('storage'))
  }

  const handleDispatch = (request: WorkflowPrescriptionRequest) => {
    updateWorkflowPrescriptionRequest(request.id, (current) => ({
      ...current,
      status: 'dispatched',
      dispatchedById: user?.id,
      dispatchedByName: user?.fullName,
      dispatchedAt: new Date().toISOString(),
    }))
    refreshRequests()
  }

  if (!isPharmacist) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Drug Requests</h1>
          <p className="text-muted-foreground">Only pharmacists can manage this page.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Drug Requests</h1>
        <p className="text-muted-foreground">
          Review doctor-prescribed medication requests and dispatch them to delivery.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Requests"
          value={stats.total}
          subtitle="Prescription workflow"
          icon={ClipboardList}
          variant="primary"
        />
        <StatCard
          title="Ready for Dispatch"
          value={stats.prescribed}
          subtitle="Doctor completed"
          icon={CheckCircle2}
          variant="success"
        />
        <StatCard
          title="Dispatched"
          value={stats.dispatched}
          subtitle="Sent out"
          icon={Truck}
          variant="info"
        />
        <StatCard
          title="Completed"
          value={stats.completed}
          subtitle="Received by nurse"
          icon={Package}
          variant="default"
        />
      </div>

      <Card className="rounded-2xl border-border/50 shadow-sm">
        <CardHeader className="border-b pb-0">
          <div className="flex items-center gap-1 overflow-x-auto pb-0">
            {tabs.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={cn(
                  'relative px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap',
                  activeTab === tab.value
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground'
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
          {pharmacistRequests.length === 0 ? (
            <EmptyState
              variant="requests"
              title="No requests found"
              description="There are no pharmacist workflow requests at the moment."
            />
          ) : (
            <div className="space-y-4">
              {pharmacistRequests.map((request) => (
                <div
                  key={request.id}
                  className="group rounded-2xl border border-border/50 bg-card p-4 transition-all hover:shadow-md"
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
                          <Badge className={cn('rounded-lg border', getStatusClasses(request.status))}>
                            {getStatusLabel(request.status)}
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
                          Diagnosis: {request.diagnosis || '-'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {request.status === 'prescribed' && (
                        <Button
                          size="sm"
                          className="rounded-lg"
                          onClick={() => handleDispatch(request)}
                        >
                          <Truck className="mr-1.5 h-4 w-4" />
                          Dispatch
                        </Button>
                      )}

                      <Button
                        variant="ghost"
                        size="sm"
                        className="rounded-lg"
                        onClick={() => setSelectedRequest(request)}
                      >
                        <Eye className="mr-1.5 h-4 w-4" />
                        Details
                      </Button>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {request.items.slice(0, 3).map((item) => (
                      <Badge key={item.id} variant="secondary" className="rounded-lg font-normal">
                        {item.medicationName} x{item.quantity}
                      </Badge>
                    ))}
                    {request.items.length > 3 && (
                      <Badge variant="outline" className="rounded-lg font-normal">
                        +{request.items.length - 3} more
                      </Badge>
                    )}
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
            <DialogDescription>
              Doctor prescription details for pharmacist review.
            </DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-4">
              <div className="rounded-xl border p-4">
                <div className="flex items-center gap-2 mb-2">
                  <UserRound className="h-4 w-4 text-primary" />
                  <p className="font-semibold">{selectedRequest.patientName}</p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
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
                  <div className="rounded-xl bg-muted/40 p-3 sm:col-span-2">
                    <p className="text-xs text-muted-foreground">Diagnosis</p>
                    <p className="font-medium">{selectedRequest.diagnosis || '-'}</p>
                  </div>
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
              </div>

              <div className="rounded-xl border p-4">
                <h4 className="font-semibold mb-3">Workflow Info</h4>
                <div className="space-y-2 text-sm">
                  <div>Submitted by: {selectedRequest.submittedByName || '-'}</div>
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