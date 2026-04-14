'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { 
  Plus,
  ClipboardList, 
  Calendar,
  Eye,
  Package,
  UserRound
} from 'lucide-react'
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
import { useAuth } from '@/lib/auth-context'
import { mockRequests } from '@/lib/mock-data'
import { DrugRequest } from '@/lib/types'
import { cn } from '@/lib/utils'

type FilterTab = 'all' | 'pending' | 'approved' | 'dispatched' | 'delivered'

export default function MyRequestsPage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<FilterTab>('all')
  const [selectedRequest, setSelectedRequest] = useState<DrugRequest | null>(null)

  // Filter requests by current doctor's user ID
  const myRequests = useMemo(() => {
    let requests = mockRequests
    // Filter by the logged-in doctor's requests
    if (user?.role === 'doctor' && user?.id) {
      requests = requests.filter(r => r.requested_by === user.id)
    }
    if (activeTab === 'all') return requests
    return requests.filter(r => r.status === activeTab)
  }, [activeTab, user])

  const tabs: { value: FilterTab; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'pending', label: 'Pending' },
    { value: 'approved', label: 'Approved' },
    { value: 'dispatched', label: 'In Transit' },
    { value: 'delivered', label: 'Delivered' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Requests</h1>
          <p className="text-muted-foreground">Prescriptions created from patient workflows</p>
        </div>
      </div>

      {/* Tabs and Content */}
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
          {myRequests.length === 0 ? (
            <EmptyState
              variant="requests"
              title="No requests found"
              description="You haven't submitted any drug requests yet."
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
                        request.status === 'rejected' && 'bg-destructive/10',
                        request.status === 'dispatched' && 'bg-info/10',
                        request.status === 'delivered' && 'bg-success/10'
                      )}>
                        <ClipboardList className={cn(
                          'h-5 w-5',
                          request.status === 'pending' && 'text-warning',
                          request.status === 'approved' && 'text-success',
                          request.status === 'rejected' && 'text-destructive',
                          request.status === 'dispatched' && 'text-info',
                          request.status === 'delivered' && 'text-success'
                        )} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold">{request.patient_name || 'Unknown Patient'}</h3>
                          <StatusBadge status={request.status} size="sm" />
                        </div>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            {new Date(request.created_at).toLocaleDateString()}
                          </span>
                          <span>{request.items.length} item(s)</span>
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

                  {/* Items Preview */}
                  <div className="mt-3 flex flex-wrap gap-2">
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

                  {/* Status Message */}
                  {request.status === 'rejected' && request.rejection_reason && (
                    <div className="mt-3 rounded-lg bg-destructive/10 border border-destructive/20 px-3 py-2 text-sm text-destructive">
                      Rejection reason: {request.rejection_reason}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Request Detail Modal */}
      <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
        <DialogContent className="rounded-2xl max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <ClipboardList className="h-5 w-5 text-primary" />
              </div>
              {selectedRequest?.request_number}
            </DialogTitle>
            <DialogDescription>
              Track your request status and items
            </DialogDescription>
          </DialogHeader>
          
          {selectedRequest && (
            <div className="space-y-4">
              {/* Patient Info */}
              <div className="rounded-xl bg-primary/5 border border-primary/10 p-4">
                <div className="flex items-center gap-2 mb-1">
                  <UserRound className="h-4 w-4 text-primary" />
                  <p className="text-xs text-muted-foreground">Patient</p>
                </div>
                <p className="font-semibold text-lg">{selectedRequest.patient_name || 'Unknown Patient'}</p>
              </div>

              {/* Status Timeline */}
              <div className="relative">
                <div className="flex items-center justify-between">
                  {['pending', 'approved', 'dispatched', 'delivered'].map((status, index) => {
                    const statusOrder = ['pending', 'approved', 'dispatched', 'delivered']
                    const currentIndex = statusOrder.indexOf(selectedRequest.status)
                    const isComplete = index <= currentIndex
                    const isCurrent = index === currentIndex
                    
                    return (
                      <div key={status} className="flex flex-col items-center">
                        <div className={cn(
                          'flex h-8 w-8 items-center justify-center rounded-full border-2 transition-colors',
                          isComplete 
                            ? 'bg-primary border-primary text-white' 
                            : 'bg-muted border-muted-foreground/30 text-muted-foreground'
                        )}>
                          {index + 1}
                        </div>
                        <span className={cn(
                          'mt-1 text-xs capitalize',
                          isCurrent ? 'font-semibold text-primary' : 'text-muted-foreground'
                        )}>
                          {status}
                        </span>
                      </div>
                    )
                  })}
                </div>
                <div className="absolute top-4 left-4 right-4 h-0.5 bg-muted -z-10">
                  <div 
                    className="h-full bg-primary transition-all"
                    style={{
                      width: `${(['pending', 'approved', 'dispatched', 'delivered'].indexOf(selectedRequest.status) / 3) * 100}%`
                    }}
                  />
                </div>
              </div>

              {/* Request Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-xl bg-muted/50 p-3">
                  <p className="text-xs text-muted-foreground">Department</p>
                  <p className="font-medium">{selectedRequest.department}</p>
                </div>
                <div className="rounded-xl bg-muted/50 p-3">
                  <p className="text-xs text-muted-foreground">Required By</p>
                  <p className="font-medium">{new Date(selectedRequest.required_by_date).toLocaleDateString()}</p>
                </div>
                <div className="rounded-xl bg-muted/50 p-3">
                  <p className="text-xs text-muted-foreground">Submitted</p>
                  <p className="font-medium">{new Date(selectedRequest.created_at).toLocaleDateString()}</p>
                </div>
                <div className="rounded-xl bg-muted/50 p-3">
                  <p className="text-xs text-muted-foreground">Priority</p>
                  <PriorityBadge priority={selectedRequest.priority} />
                </div>
              </div>

              {selectedRequest.notes && (
                <div className="rounded-xl bg-muted/50 p-3">
                  <p className="text-xs text-muted-foreground">Notes</p>
                  <p className="text-sm">{selectedRequest.notes}</p>
                </div>
              )}

              {/* Items */}
              <div>
                <h4 className="font-semibold mb-3">Requested Items</h4>
                <div className="space-y-2">
                  {selectedRequest.items.map((item) => (
                    <div 
                      key={item.id}
                      className="flex items-center gap-3 rounded-xl border border-border/50 bg-card p-3"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                        <Package className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{item.drug_name}</p>
                        <p className="text-xs text-muted-foreground">{item.drug_code}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{item.quantity_requested} units</p>
                        {item.quantity_approved > 0 && selectedRequest.status !== 'pending' && (
                          <p className="text-xs text-success">
                            {item.quantity_approved} approved
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Approval Info */}
              {selectedRequest.approved_by_name && (
                <div className="rounded-xl bg-success/10 border border-success/20 p-4">
                  <p className="text-sm text-muted-foreground">Approved by</p>
                  <p className="font-semibold">{selectedRequest.approved_by_name}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(selectedRequest.approved_at).toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
