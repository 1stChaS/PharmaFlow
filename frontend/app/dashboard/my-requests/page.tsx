'use client'

import { useMemo, useState } from 'react'
import { Calendar, ClipboardList, Eye, Package, UserRound } from 'lucide-react'
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
import { StatusBadge, PriorityBadge } from '@/components/pharmacy/status-badge'
import { EmptyState } from '@/components/pharmacy/empty-state'
import { mockRequests } from '@/lib/mock-data'
import { DrugRequest } from '@/lib/types'
import { cn } from '@/lib/utils'
import { getWorkflowPrescriptionRequests, WorkflowPrescriptionRequest } from '@/lib/prescription-workflow'

type FilterTab = 'all' | 'pending' | 'approved' | 'dispatched' | 'delivered'

type RequestRow = {
  id: string
  patientName: string
  status: 'pending' | 'approved' | 'dispatched' | 'delivered'
  priority: 'low' | 'normal' | 'high' | 'urgent'
  createdAt: string
  requiredByDate: string
  diagnosis: string
  notes: string
  source: 'workflow' | 'legacy'
  legacyRequest?: DrugRequest
  workflowRequest?: WorkflowPrescriptionRequest
}

export default function MyRequestsPage() {
  const [activeTab, setActiveTab] = useState<FilterTab>('all')
  const [selectedRequest, setSelectedRequest] = useState<RequestRow | null>(null)

  const workflowRequests = useMemo(() => getWorkflowPrescriptionRequests(), [])

  const requestRows = useMemo<RequestRow[]>(() => {
    const workflowRows = workflowRequests.map((request) => ({
      id: request.id,
      patientName: request.patientName,
      status: request.status,
      priority: request.priority,
      createdAt: request.createdAt,
      requiredByDate: request.requiredByDate,
      diagnosis: request.diagnosis,
      notes: request.notes,
      source: 'workflow' as const,
      workflowRequest: request,
    }))

    const legacyRows = mockRequests.map((request) => ({
      id: `legacy-${request.id}`,
      patientName: 'Patient data unavailable',
      status: request.status === 'dispatched' || request.status === 'delivered' || request.status === 'approved' ? request.status : 'pending',
      priority: request.priority,
      createdAt: request.created_at,
      requiredByDate: request.required_by_date,
      diagnosis: request.notes || 'N/A',
      notes: request.notes,
      source: 'legacy' as const,
      legacyRequest: request,
    }))

    return [...workflowRows, ...legacyRows]
  }, [workflowRequests])

  const myRequests = useMemo(() => {
    if (activeTab === 'all') return requestRows
    return requestRows.filter((r) => r.status === activeTab)
  }, [activeTab, requestRows])

  const tabs: { value: FilterTab; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'pending', label: 'Pending' },
    { value: 'approved', label: 'Approved' },
    { value: 'dispatched', label: 'In Transit' },
    { value: 'delivered', label: 'Delivered' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">My Requests</h1>
        <p className="text-muted-foreground">Prescriptions created from patient workflows</p>
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
                  activeTab === tab.value ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {tab.label}
                {activeTab === tab.value && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />}
              </button>
            ))}
          </div>
        </CardHeader>

        <CardContent className="p-4">
          {myRequests.length === 0 ? (
            <EmptyState
              variant="requests"
              title="No requests found"
              description="Submit prescriptions from Patients tab to see them here."
            />
          ) : (
            <div className="space-y-4">
              {myRequests.map((request) => (
                <div
                  key={request.id}
                  className="group rounded-2xl border border-border/50 bg-card p-4 transition-all hover:shadow-md hover:border-border cursor-pointer"
                  onClick={() => setSelectedRequest(request)}
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex gap-3">
                      <div className={cn(
                        'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
                        request.status === 'pending' && 'bg-warning/10',
                        request.status === 'approved' && 'bg-success/10',
                        request.status === 'dispatched' && 'bg-info/10',
                        request.status === 'delivered' && 'bg-success/10'
                      )}>
                        <ClipboardList className={cn(
                          'h-5 w-5',
                          request.status === 'pending' && 'text-warning',
                          request.status === 'approved' && 'text-success',
                          request.status === 'dispatched' && 'text-info',
                          request.status === 'delivered' && 'text-success'
                        )} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold">{request.patientName}</h3>
                          <StatusBadge status={request.status} size="sm" />
                        </div>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            {new Date(request.createdAt).toLocaleDateString()}
                          </span>
                          <span>
                            {request.source === 'workflow'
                              ? `${request.workflowRequest?.items.length || 0} prescription item(s)`
                              : `${request.legacyRequest?.items.length || 0} item(s)`}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <PriorityBadge priority={request.priority} />
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

                  <div className="mt-3 flex flex-wrap gap-2">
                    {(request.source === 'workflow'
                      ? request.workflowRequest?.items || []
                      : request.legacyRequest?.items || []
                    )
                      .slice(0, 3)
                      .map((item) => (
                        <Badge key={item.id} variant="secondary" className="rounded-lg font-normal">
                          {item.drug_name} x{'quantity' in item ? item.quantity : item.quantity_requested}
                        </Badge>
                      ))}
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
            <DialogTitle className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <UserRound className="h-5 w-5 text-primary" />
              </div>
              {selectedRequest?.patientName}
            </DialogTitle>
            <DialogDescription>
              Patient summary and prescription details
            </DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-4">
              {selectedRequest.workflowRequest?.patientSnapshot ? (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 text-sm">
                  <div className="rounded-xl bg-muted/50 p-3">
                    <p className="text-xs text-muted-foreground">Age / Gender</p>
                    <p className="font-medium">
                      {selectedRequest.workflowRequest.patientSnapshot.age} / {selectedRequest.workflowRequest.patientSnapshot.gender}
                    </p>
                  </div>
                  <div className="rounded-xl bg-muted/50 p-3">
                    <p className="text-xs text-muted-foreground">Weight / Height</p>
                    <p className="font-medium">
                      {selectedRequest.workflowRequest.patientSnapshot.weight || '-'} kg / {selectedRequest.workflowRequest.patientSnapshot.height || '-'} cm
                    </p>
                  </div>
                  <div className="rounded-xl bg-muted/50 p-3">
                    <p className="text-xs text-muted-foreground">BP / BMI</p>
                    <p className="font-medium">
                      {selectedRequest.workflowRequest.patientSnapshot.bloodPressure || '-'} / {selectedRequest.workflowRequest.patientSnapshot.bmi || '-'}
                    </p>
                  </div>
                  <div className="rounded-xl bg-muted/50 p-3 sm:col-span-2 lg:col-span-3">
                    <p className="text-xs text-muted-foreground">Conditions</p>
                    <p className="font-medium">{selectedRequest.workflowRequest.patientSnapshot.underlyingConditions || '-'}</p>
                  </div>
                  <div className="rounded-xl bg-muted/50 p-3 sm:col-span-2 lg:col-span-3">
                    <p className="text-xs text-muted-foreground">Allergies / Chief Complaint</p>
                    <p className="font-medium">Allergies: {selectedRequest.workflowRequest.patientSnapshot.allergies || '-'}</p>
                    <p className="font-medium">CC: {selectedRequest.workflowRequest.patientSnapshot.chiefComplaint || '-'}</p>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground">
                  Detailed patient vitals are unavailable for this legacy request.
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-xl bg-muted/50 p-3">
                  <p className="text-xs text-muted-foreground">Submitted</p>
                  <p className="font-medium">{new Date(selectedRequest.createdAt).toLocaleString()}</p>
                </div>
                <div className="rounded-xl bg-muted/50 p-3">
                  <p className="text-xs text-muted-foreground">Required By</p>
                  <p className="font-medium">{new Date(selectedRequest.requiredByDate).toLocaleDateString()}</p>
                </div>
                <div className="rounded-xl bg-muted/50 p-3">
                  <p className="text-xs text-muted-foreground">Diagnosis</p>
                  <p className="font-medium">{selectedRequest.diagnosis || '-'}</p>
                </div>
                <div className="rounded-xl bg-muted/50 p-3">
                  <p className="text-xs text-muted-foreground">Priority</p>
                  <PriorityBadge priority={selectedRequest.priority} />
                </div>
              </div>

              {selectedRequest.notes && (
                <div className="rounded-xl bg-muted/50 p-3 text-sm">
                  <p className="text-xs text-muted-foreground">Notes</p>
                  <p>{selectedRequest.notes}</p>
                </div>
              )}

              <div>
                <h4 className="font-semibold mb-3">Prescription Details</h4>
                <div className="space-y-2">
                  {(selectedRequest.source === 'workflow'
                    ? selectedRequest.workflowRequest?.items || []
                    : selectedRequest.legacyRequest?.items || []
                  ).map((item) => (
                    <div key={item.id} className="flex items-center gap-3 rounded-xl border border-border/50 bg-card p-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                        <Package className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{item.drug_name}</p>
                        <p className="text-xs text-muted-foreground">{item.drug_code}</p>
                        {selectedRequest.source === 'workflow' && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Dosage: {'dosageInstructions' in item ? item.dosageInstructions : '-'}
                            {'duration' in item && item.duration ? ` • Duration: ${item.duration}` : ''}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">
                          {'quantity' in item ? item.quantity : item.quantity_requested} units
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
