'use client'

import { useEffect, useMemo, useState } from 'react'
import { CheckCircle2, Truck, Package, Calendar, UserRound } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
      return 'Received Complete'
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

export default function DeliveriesPage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<FilterTab>('all')
  const [requests, setRequests] = useState<WorkflowPrescriptionRequest[]>([])
  const [selectedRequest, setSelectedRequest] = useState<WorkflowPrescriptionRequest | null>(null)
  const [receiverName, setReceiverName] = useState('')

  const isPharmacist = user?.role === 'pharmacist' || user?.role === 'administrator'
  const isNurse = user?.role === 'nurse'

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

  const deliveryRequests = useMemo(() => {
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
      total: workflowItems.length,
      prescribed: workflowItems.filter((request) => request.status === 'prescribed').length,
      dispatched: workflowItems.filter((request) => request.status === 'dispatched').length,
      completed: workflowItems.filter((request) => request.status === 'received_complete').length,
    }
  }, [requests])

  const tabs: { value: FilterTab; label: string; count: number }[] = [
    { value: 'all', label: 'All Deliveries', count: stats.total },
    { value: 'prescribed', label: 'Ready for Dispatch', count: stats.prescribed },
    { value: 'dispatched', label: 'Dispatched', count: stats.dispatched },
    { value: 'received_complete', label: 'Completed', count: stats.completed },
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

  const openReceiveDialog = (request: WorkflowPrescriptionRequest) => {
    setSelectedRequest(request)
    setReceiverName(user?.fullName || '')
  }

  const handleConfirmReceived = () => {
    if (!selectedRequest || !receiverName.trim()) return

    updateWorkflowPrescriptionRequest(selectedRequest.id, (current) => ({
      ...current,
      status: 'received_complete',
      receivedById: user?.id,
      receivedByName: receiverName.trim(),
      receivedAt: new Date().toISOString(),
    }))

    setSelectedRequest(null)
    setReceiverName('')
    refreshRequests()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Delivery Tracking</h1>
        <p className="text-muted-foreground">
          Pharmacist dispatches prescribed medicine and nurse confirms complete receipt.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Deliveries"
          value={stats.total}
          subtitle="Prescription workflow"
          icon={Package}
          variant="primary"
        />
        <StatCard
          title="Ready for Dispatch"
          value={stats.prescribed}
          subtitle="Doctor completed"
          icon={Package}
          variant="default"
        />
        <StatCard
          title="Dispatched"
          value={stats.dispatched}
          subtitle="On the way"
          icon={Truck}
          variant="info"
        />
        <StatCard
          title="Completed"
          value={stats.completed}
          subtitle="Received by nurse"
          icon={CheckCircle2}
          variant="success"
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
                  'relative flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap',
                  activeTab === tab.value
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {tab.label}
                {tab.count > 0 && (
                  <Badge
                    variant="secondary"
                    className={cn(
                      'rounded-full h-5 min-w-5 px-1.5',
                      activeTab === tab.value && 'bg-primary/10 text-primary'
                    )}
                  >
                    {tab.count}
                  </Badge>
                )}
                {activeTab === tab.value && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
                )}
              </button>
            ))}
          </div>
        </CardHeader>

        <CardContent className="p-4">
          {deliveryRequests.length === 0 ? (
            <EmptyState
              variant="deliveries"
              title="No deliveries found"
              description="No prescription workflow deliveries are available right now."
            />
          ) : (
            <div className="space-y-4">
              {deliveryRequests.map((request) => (
                <div
                  key={request.id}
                  className="rounded-2xl border border-border/50 bg-card p-4 transition-all hover:border-border"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                        <Truck className="h-6 w-6 text-primary" />
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold">{request.requestNumber}</h3>
                          <Badge className={cn('rounded-lg border', getStatusClasses(request.status))}>
                            {getStatusLabel(request.status)}
                          </Badge>
                        </div>

                        <div className="text-sm text-muted-foreground">
                          Patient: {request.patientName}
                        </div>

                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            Required by: {request.requiredByDate}
                          </span>
                          <span className="flex items-center gap-1">
                            <UserRound className="h-3.5 w-3.5" />
                            Doctor: {request.prescribedByName || '-'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {isPharmacist && request.status === 'prescribed' && (
                        <Button
                          size="sm"
                          className="rounded-lg"
                          onClick={() => handleDispatch(request)}
                        >
                          Mark Dispatched
                        </Button>
                      )}

                      {isNurse && request.status === 'dispatched' && (
                        <Button
                          size="sm"
                          className="rounded-lg bg-success hover:bg-success/90"
                          onClick={() => openReceiveDialog(request)}
                        >
                          <CheckCircle2 className="mr-1.5 h-4 w-4" />
                          Confirm Receipt
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-xl bg-card border border-border/50 p-3">
                      <p className="text-xs text-muted-foreground">Chief Complaint</p>
                      <p className="font-medium">{request.patientSnapshot.chiefComplaint || '-'}</p>
                    </div>

                    <div className="rounded-xl bg-card border border-border/50 p-3">
                      <p className="text-xs text-muted-foreground">Diagnosis</p>
                      <p className="font-medium">{request.diagnosis || '-'}</p>
                    </div>

                    <div className="rounded-xl bg-card border border-border/50 p-3">
                      <p className="text-xs text-muted-foreground">Dispatched By</p>
                      <p className="font-medium">{request.dispatchedByName || '-'}</p>
                    </div>

                    <div className="rounded-xl bg-card border border-border/50 p-3">
                      <p className="text-xs text-muted-foreground">Received By</p>
                      <p className="font-medium">{request.receivedByName || '-'}</p>
                    </div>
                  </div>

                  <div className="mt-4">
                    <h4 className="text-sm font-semibold mb-3">
                      Medications ({request.items.length})
                    </h4>

                    {request.items.length === 0 ? (
                      <div className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground">
                        No medication items added yet.
                      </div>
                    ) : (
                      <div className="grid gap-2 sm:grid-cols-2">
                        {request.items.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center gap-3 rounded-xl border border-border/50 bg-card p-3"
                          >
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                              <Package className="h-4 w-4 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate">{item.medicationName}</p>
                              <p className="text-xs text-muted-foreground">
                                {item.dosage} · {item.frequency} · {item.duration || '-'}
                              </p>
                            </div>
                            <Badge variant="secondary" className="rounded-lg">
                              x{item.quantity}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>Confirm Complete Receipt</DialogTitle>
            <DialogDescription>
              Confirm that all medicines were received completely for {selectedRequest?.patientName}.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-4">
            <div className="rounded-xl bg-success/10 border border-success/20 p-4 text-center">
              <CheckCircle2 className="mx-auto h-10 w-10 text-success" />
              <p className="mt-2 font-medium">
                {selectedRequest?.items.length || 0} items will be marked as received complete
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Received By *</label>
              <Input
                placeholder="Enter nurse receiver name"
                value={receiverName}
                onChange={(e) => setReceiverName(e.target.value)}
                className="rounded-xl h-11"
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              className="rounded-xl"
              onClick={() => setSelectedRequest(null)}
            >
              Cancel
            </Button>
            <Button
              className="rounded-xl bg-success hover:bg-success/90"
              onClick={handleConfirmReceived}
              disabled={!receiverName.trim()}
            >
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Confirm Receipt
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
