'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  ClipboardList,
  Clock,
  CheckCircle2,
  Truck,
  Eye,
  Check,
  X,
  Calendar,
  User,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { StatusBadge, PriorityBadge } from '@/components/pharmacy/status-badge'
import { StatCard } from '@/components/pharmacy/stat-card'
import { EmptyState } from '@/components/pharmacy/empty-state'
import { requestsApi, ApiError } from '@/lib/api'
import { DrugRequest } from '@/lib/types'
import { cn } from '@/lib/utils'

type FilterTab =
  | 'all'
  | 'pending'
  | 'approved'
  | 'dispatched'
  | 'delivered'
  | 'rejected'

export default function RequestsPage() {
  const [activeTab, setActiveTab] = useState<FilterTab>('all')
  const [requests, setRequests] = useState<DrugRequest[]>([])
  const [selectedRequest, setSelectedRequest] = useState<DrugRequest | null>(null)
  const [showApproveDialog, setShowApproveDialog] = useState(false)
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionLoading, setActionLoading] = useState(false)

  const fetchRequests = async () => {
    try {
      setIsLoading(true)
      setError('')
      const data = await requestsApi.getAll()
      setRequests(data as DrugRequest[])
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : 'Failed to load requests'
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchRequests()
  }, [])

  const filteredRequests = useMemo(() => {
    if (activeTab === 'all') return requests
    return requests.filter((r) => r.status === activeTab)
  }, [activeTab, requests])

  const stats = useMemo(
    () => ({
      pending: requests.filter((r) => r.status === 'pending').length,
      approved: requests.filter((r) => r.status === 'approved').length,
      dispatched: requests.filter((r) => r.status === 'dispatched').length,
      delivered: requests.filter((r) => r.status === 'delivered').length,
      rejected: requests.filter((r) => r.status === 'rejected').length,
    }),
    [requests]
  )

  const tabs: { value: FilterTab; label: string; count?: number }[] = [
    { value: 'all', label: 'All Requests' },
    { value: 'pending', label: 'Pending', count: stats.pending },
    { value: 'approved', label: 'Approved', count: stats.approved },
    { value: 'dispatched', label: 'Dispatched', count: stats.dispatched },
    { value: 'delivered', label: 'Delivered', count: stats.delivered },
    { value: 'rejected', label: 'Rejected', count: stats.rejected },
  ]

  const refreshSelectedRequest = (requestId: number | string) => {
    setSelectedRequest((prev) => {
      if (!prev || prev.id !== requestId) return prev
      const updated = requests.find((r) => r.id === requestId)
      return updated ?? prev
    })
  }

  const handleApprove = async () => {
    if (!selectedRequest) return

    try {
      setActionLoading(true)
      setError('')
      await requestsApi.approve(selectedRequest.id)
      await fetchRequests()
      setShowApproveDialog(false)
      setSelectedRequest(null)
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : 'Failed to approve request'
      setError(message)
    } finally {
      setActionLoading(false)
    }
  }

  const handleReject = async () => {
    if (!selectedRequest || !rejectionReason.trim()) return

    try {
      setActionLoading(true)
      setError('')
      await requestsApi.reject(selectedRequest.id, rejectionReason.trim())
      await fetchRequests()
      setShowRejectDialog(false)
      setRejectionReason('')
      setSelectedRequest(null)
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : 'Failed to reject request'
      setError(message)
    } finally {
      setActionLoading(false)
    }
  }

  const handleDispatch = async (request: DrugRequest) => {
    try {
      setActionLoading(true)
      setError('')
      await requestsApi.dispatch(request.id)
      await fetchRequests()
      refreshSelectedRequest(request.id)
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : 'Failed to dispatch request'
      setError(message)
    } finally {
      setActionLoading(false)
    }
  }

  const closeDetails = () => {
    setSelectedRequest(null)
    setShowApproveDialog(false)
    setShowRejectDialog(false)
    setRejectionReason('')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Drug Requests</h1>
        <p className="text-muted-foreground">Review and manage incoming drug requests</p>
      </div>

      {error && (
        <div className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Pending"
          value={stats.pending}
          subtitle="Awaiting approval"
          icon={Clock}
          variant="warning"
        />
        <StatCard
          title="Approved"
          value={stats.approved}
          subtitle="Ready to dispatch"
          icon={CheckCircle2}
          variant="success"
        />
        <StatCard
          title="In Transit"
          value={stats.dispatched}
          subtitle="Being delivered"
          icon={Truck}
          variant="info"
        />
        <StatCard
          title="Delivered"
          value={stats.delivered}
          subtitle="Completed"
          icon={CheckCircle2}
          variant="primary"
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
                  'relative flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors',
                  activeTab === tab.value
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {tab.label}
                {tab.count !== undefined && tab.count > 0 && (
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
          {isLoading ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              Loading requests...
            </div>
          ) : filteredRequests.length === 0 ? (
            <EmptyState
              variant="requests"
              title="No requests found"
              description={`There are no ${activeTab === 'all' ? '' : activeTab} requests at the moment.`}
            />
          ) : (
            <div className="space-y-4">
              {filteredRequests.map((request) => (
                <div
                  key={request.id}
                  className="group rounded-2xl border border-border/50 bg-card p-4 transition-all hover:shadow-md hover:border-border"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex gap-4">
                      <div
                        className={cn(
                          'flex h-12 w-12 shrink-0 items-center justify-center rounded-xl',
                          request.status === 'pending' && 'bg-warning/10',
                          request.status === 'approved' && 'bg-success/10',
                          request.status === 'rejected' && 'bg-destructive/10',
                          request.status === 'dispatched' && 'bg-info/10',
                          request.status === 'delivered' && 'bg-success/10'
                        )}
                      >
                        <ClipboardList
                          className={cn(
                            'h-6 w-6',
                            request.status === 'pending' && 'text-warning',
                            request.status === 'approved' && 'text-success',
                            request.status === 'rejected' && 'text-destructive',
                            request.status === 'dispatched' && 'text-info',
                            request.status === 'delivered' && 'text-success'
                          )}
                        />
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold">{request.request_number}</h3>
                          <StatusBadge status={request.status} size="sm" />
                          <PriorityBadge priority={request.priority} />
                        </div>

                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <User className="h-3.5 w-3.5" />
                            {request.requested_by_name}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            {new Date(request.created_at).toLocaleDateString()}
                          </span>
                        </div>

                        <p className="text-sm text-muted-foreground">
                          {request.department} - {request.items.length} item(s)
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-lg"
                        onClick={() => setSelectedRequest(request)}
                      >
                        <Eye className="mr-1.5 h-4 w-4" />
                        View
                      </Button>

                      {request.status === 'pending' && (
                        <>
                          <Button
                            size="sm"
                            className="rounded-lg bg-success hover:bg-success/90"
                            onClick={() => {
                              setSelectedRequest(request)
                              setShowApproveDialog(true)
                            }}
                            disabled={actionLoading}
                          >
                            <Check className="mr-1.5 h-4 w-4" />
                            Approve
                          </Button>

                          <Button
                            variant="outline"
                            size="sm"
                            className="rounded-lg text-destructive hover:text-destructive"
                            onClick={() => {
                              setSelectedRequest(request)
                              setShowRejectDialog(true)
                            }}
                            disabled={actionLoading}
                          >
                            <X className="mr-1.5 h-4 w-4" />
                            Reject
                          </Button>
                        </>
                      )}

                      {request.status === 'approved' && (
                        <Button
                          size="sm"
                          className="rounded-lg"
                          onClick={() => handleDispatch(request)}
                          disabled={actionLoading}
                        >
                          <Truck className="mr-1.5 h-4 w-4" />
                          Dispatch
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {request.items.slice(0, 3).map((item) => (
                      <Badge
                        key={item.id}
                        variant="secondary"
                        className="rounded-lg font-normal"
                      >
                        {item.drug_name} x{item.quantity_requested}
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

      <Dialog
        open={!!selectedRequest && !showApproveDialog && !showRejectDialog}
        onOpenChange={(open) => {
          if (!open) closeDetails()
        }}
      >
        <DialogContent className="rounded-2xl max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <ClipboardList className="h-5 w-5 text-primary" />
              </div>
              {selectedRequest?.request_number}
            </DialogTitle>
            <DialogDescription>Request details and items</DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-xl bg-muted/50 p-3">
                  <p className="text-xs text-muted-foreground">Requested By</p>
                  <p className="font-medium">{selectedRequest.requested_by_name}</p>
                </div>

                <div className="rounded-xl bg-muted/50 p-3">
                  <p className="text-xs text-muted-foreground">Department</p>
                  <p className="font-medium">{selectedRequest.department}</p>
                </div>

                <div className="rounded-xl bg-muted/50 p-3">
                  <p className="text-xs text-muted-foreground">Required By</p>
                  <p className="font-medium">
                    {new Date(selectedRequest.required_by_date).toLocaleDateString()}
                  </p>
                </div>

                <div className="rounded-xl bg-muted/50 p-3">
                  <p className="text-xs text-muted-foreground">Priority</p>
                  <PriorityBadge priority={selectedRequest.priority} />
                </div>
              </div>

              {selectedRequest.notes && (
                <div className="rounded-xl bg-muted/50 p-3">
                  <p className="text-xs text-muted-foreground">Notes</p>
                  <p className="font-medium whitespace-pre-line">{selectedRequest.notes}</p>
                </div>
              )}

              {selectedRequest.rejection_reason && (
                <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-3">
                  <p className="text-xs text-muted-foreground">Rejection Reason</p>
                  <p className="font-medium whitespace-pre-line">{selectedRequest.rejection_reason}</p>
                </div>
              )}

              <div>
                <h4 className="font-semibold mb-3">Requested Items</h4>
                <div className="space-y-2">
                  {selectedRequest.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between rounded-xl border border-border/50 bg-card p-3"
                    >
                      <div>
                        <p className="font-medium">{item.drug_name}</p>
                        <p className="text-xs text-muted-foreground">{item.drug_code}</p>
                      </div>

                      <div className="text-right">
                        <p className="font-semibold">{item.quantity_requested} units</p>
                        {item.quantity_approved > 0 && (
                          <p className="text-xs text-success">
                            {item.quantity_approved} approved
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-border/50 p-4">
                <div>
                  <p className="text-sm text-muted-foreground">Current Status</p>
                  <StatusBadge status={selectedRequest.status} size="lg" />
                </div>

                {selectedRequest.approved_by_name && (
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">
                      {selectedRequest.status === 'rejected' ? 'Reviewed by' : 'Approved by'}
                    </p>
                    <p className="font-medium">{selectedRequest.approved_by_name}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={showApproveDialog}
        onOpenChange={(open) => {
          setShowApproveDialog(open)
          if (!open) {
            setSelectedRequest(null)
          }
        }}
      >
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>Approve Request</DialogTitle>
            <DialogDescription>
              Are you sure you want to approve request {selectedRequest?.request_number}?
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <div className="rounded-xl bg-success/10 border border-success/20 p-4 text-center">
              <CheckCircle2 className="mx-auto h-10 w-10 text-success" />
              <p className="mt-2 font-medium">
                {selectedRequest?.items.length} items will be approved for dispatch
              </p>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              className="rounded-xl"
              onClick={() => {
                setShowApproveDialog(false)
                setSelectedRequest(null)
              }}
              disabled={actionLoading}
            >
              Cancel
            </Button>

            <Button
              className="rounded-xl bg-success hover:bg-success/90"
              onClick={handleApprove}
              disabled={actionLoading}
            >
              <Check className="mr-2 h-4 w-4" />
              {actionLoading ? 'Approving...' : 'Confirm Approval'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={showRejectDialog}
        onOpenChange={(open) => {
          setShowRejectDialog(open)
          if (!open) {
            setRejectionReason('')
            setSelectedRequest(null)
          }
        }}
      >
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>Reject Request</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting request {selectedRequest?.request_number}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <Textarea
              placeholder="Enter rejection reason..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="rounded-xl min-h-24"
              disabled={actionLoading}
            />
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              className="rounded-xl"
              onClick={() => {
                setShowRejectDialog(false)
                setRejectionReason('')
                setSelectedRequest(null)
              }}
              disabled={actionLoading}
            >
              Cancel
            </Button>

            <Button
              variant="destructive"
              className="rounded-xl"
              onClick={handleReject}
              disabled={!rejectionReason.trim() || actionLoading}
            >
              <X className="mr-2 h-4 w-4" />
              {actionLoading ? 'Rejecting...' : 'Reject Request'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
