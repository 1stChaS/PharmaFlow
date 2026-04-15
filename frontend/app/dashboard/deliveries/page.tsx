// frontend/app/dashboard/deliveries/page.tsx
'use client'

import { useState, useMemo } from 'react'
import { 
  Truck, 
  Package,
  MapPin,
  Clock,
  CheckCircle2,
  User,
  Calendar,
  ChevronDown,
  ChevronUp
} from 'lucide-react'
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
import { StatusBadge } from '@/components/pharmacy/status-badge'
import { StatCard } from '@/components/pharmacy/stat-card'
import { EmptyState } from '@/components/pharmacy/empty-state'
import { useAuth } from '@/lib/auth-context'
import { Delivery } from '@/lib/types'
import { cn } from '@/lib/utils'

type FilterTab = 'all' | 'preparing' | 'in_transit' | 'delivered'

export default function DeliveriesPage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<FilterTab>('all')
  const [expandedDelivery, setExpandedDelivery] = useState<number | null>(null)
  const [showDeliverDialog, setShowDeliverDialog] = useState(false)
  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(null)
  const [receiverName, setReceiverName] = useState('')

  const isPharmacist = user?.role === 'pharmacist' || user?.role === 'administrator'

  const mockDeliveries: Delivery[] = []

  // Filter deliveries
  const filteredDeliveries = useMemo(() => {
    if (activeTab === 'all') return mockDeliveries
    return mockDeliveries.filter(d => d.status === activeTab)
  }, [activeTab])

  // Stats
  const stats = useMemo(() => ({
    preparing: mockDeliveries.filter(d => d.status === 'preparing').length,
    inTransit: mockDeliveries.filter(d => d.status === 'in_transit').length,
    delivered: mockDeliveries.filter(d => d.status === 'delivered').length,
    total: mockDeliveries.length,
  }), [])

  const tabs: { value: FilterTab; label: string; count?: number }[] = [
    { value: 'all', label: 'All Deliveries' },
    { value: 'preparing', label: 'Preparing', count: stats.preparing },
    { value: 'in_transit', label: 'In Transit', count: stats.inTransit },
    { value: 'delivered', label: 'Delivered', count: stats.delivered },
  ]

  const handleMarkDelivered = () => {
    // Handle mark as delivered
    setShowDeliverDialog(false)
    setSelectedDelivery(null)
    setReceiverName('')
  }

  const getTimelineSteps = (delivery: Delivery) => {
    const steps = [
      { 
        label: 'Request Approved', 
        completed: true, 
        time: delivery.created_at,
        icon: CheckCircle2 
      },
      { 
        label: 'Preparing', 
        completed: delivery.status !== 'preparing',
        time: delivery.dispatched_at || '',
        icon: Package 
      },
      { 
        label: 'In Transit', 
        completed: delivery.status === 'in_transit' || delivery.status === 'delivered',
        time: delivery.dispatched_at,
        icon: Truck 
      },
      { 
        label: 'Delivered', 
        completed: delivery.status === 'delivered',
        time: delivery.delivered_at,
        icon: MapPin 
      },
    ]
    return steps
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Delivery Tracking</h1>
        <p className="text-muted-foreground">Track and manage drug deliveries</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Deliveries"
          value={stats.total}
          subtitle="All time"
          icon={Package}
          variant="primary"
        />
        <StatCard
          title="Preparing"
          value={stats.preparing}
          subtitle="Being packaged"
          icon={Package}
          variant="default"
        />
        <StatCard
          title="In Transit"
          value={stats.inTransit}
          subtitle="On the way"
          icon={Truck}
          variant="info"
        />
        <StatCard
          title="Delivered"
          value={stats.delivered}
          subtitle="Completed"
          icon={CheckCircle2}
          variant="success"
        />
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
                  'relative flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap',
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
          {filteredDeliveries.length === 0 ? (
            <EmptyState
              variant="deliveries"
              title="No deliveries found"
              description={`There are no ${activeTab === 'all' ? '' : activeTab.replace('_', ' ')} deliveries at the moment.`}
            />
          ) : (
            <div className="space-y-4">
              {filteredDeliveries.map((delivery) => {
                const isExpanded = expandedDelivery === delivery.id
                const timeline = getTimelineSteps(delivery)

                return (
                  <div
                    key={delivery.id}
                    className="rounded-2xl border border-border/50 bg-card overflow-hidden transition-all hover:border-border"
                  >
                    {/* Header */}
                    <div 
                      className="flex flex-col gap-4 p-4 cursor-pointer sm:flex-row sm:items-center sm:justify-between"
                      onClick={() => setExpandedDelivery(isExpanded ? null : delivery.id)}
                    >
                      <div className="flex gap-4">
                        <div className={cn(
                          'flex h-12 w-12 shrink-0 items-center justify-center rounded-xl',
                          delivery.status === 'preparing' && 'bg-muted',
                          delivery.status === 'in_transit' && 'bg-info/10',
                          delivery.status === 'delivered' && 'bg-success/10'
                        )}>
                          <Truck className={cn(
                            'h-6 w-6',
                            delivery.status === 'preparing' && 'text-muted-foreground',
                            delivery.status === 'in_transit' && 'text-info',
                            delivery.status === 'delivered' && 'text-success'
                          )} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold">{delivery.delivery_number}</h3>
                            <StatusBadge status={delivery.status} size="sm" />
                          </div>
                          <p className="text-sm text-muted-foreground mt-0.5">
                            Request: {delivery.request_number}
                          </p>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3.5 w-3.5" />
                              {delivery.delivery_location}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {isPharmacist && delivery.status === 'in_transit' && (
                          <Button
                            size="sm"
                            className="rounded-lg bg-success hover:bg-success/90"
                            onClick={(e) => {
                              e.stopPropagation()
                              setSelectedDelivery(delivery)
                              setShowDeliverDialog(true)
                            }}
                          >
                            <CheckCircle2 className="mr-1.5 h-4 w-4" />
                            Mark Delivered
                          </Button>
                        )}
                        <Button variant="ghost" size="icon" className="rounded-lg">
                          {isExpanded ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    {/* Expanded Content */}
                    {isExpanded && (
                      <div className="border-t bg-muted/20 p-4 space-y-4">
                        {/* Timeline */}
                        <div>
                          <h4 className="text-sm font-semibold mb-3">Delivery Timeline</h4>
                          <div className="relative">
                            {timeline.map((step, index) => {
                              const Icon = step.icon
                              const isLast = index === timeline.length - 1
                              
                              return (
                                <div key={step.label} className="flex gap-4 pb-4 last:pb-0">
                                  <div className="relative flex flex-col items-center">
                                    <div className={cn(
                                      'flex h-8 w-8 items-center justify-center rounded-full border-2',
                                      step.completed
                                        ? 'bg-success border-success text-white'
                                        : 'bg-muted border-muted-foreground/30 text-muted-foreground'
                                    )}>
                                      <Icon className="h-4 w-4" />
                                    </div>
                                    {!isLast && (
                                      <div className={cn(
                                        'absolute top-8 left-1/2 -translate-x-1/2 w-0.5 h-full',
                                        step.completed ? 'bg-success' : 'bg-muted-foreground/30'
                                      )} />
                                    )}
                                  </div>
                                  <div className="flex-1 pb-4">
                                    <p className={cn(
                                      'font-medium',
                                      !step.completed && 'text-muted-foreground'
                                    )}>
                                      {step.label}
                                    </p>
                                    {step.time && step.completed && (
                                      <p className="text-xs text-muted-foreground">
                                        {new Date(step.time).toLocaleString()}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </div>

                        {/* Items */}
                        <div>
                          <h4 className="text-sm font-semibold mb-3">Items ({delivery.items.length})</h4>
                          <div className="grid gap-2 sm:grid-cols-2">
                            {delivery.items.map((item) => (
                              <div 
                                key={item.id}
                                className="flex items-center gap-3 rounded-xl border border-border/50 bg-card p-3"
                              >
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                                  <Package className="h-4 w-4 text-primary" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-sm truncate">{item.drug_name}</p>
                                  <p className="text-xs text-muted-foreground">
                                    Batch: {item.batch_number}
                                  </p>
                                </div>
                                <Badge variant="secondary" className="rounded-lg">
                                  x{item.quantity}
                                </Badge>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Delivery Details */}
                        <div className="grid gap-4 sm:grid-cols-3">
                          <div className="rounded-xl bg-card border border-border/50 p-3">
                            <p className="text-xs text-muted-foreground">Dispatched By</p>
                            <p className="font-medium">{delivery.dispatched_by_name || '-'}</p>
                          </div>
                          {delivery.delivered_by_name && (
                            <div className="rounded-xl bg-card border border-border/50 p-3">
                              <p className="text-xs text-muted-foreground">Delivered By</p>
                              <p className="font-medium">{delivery.delivered_by_name}</p>
                            </div>
                          )}
                          {delivery.received_by_name && (
                            <div className="rounded-xl bg-card border border-border/50 p-3">
                              <p className="text-xs text-muted-foreground">Received By</p>
                              <p className="font-medium">{delivery.received_by_name}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Mark Delivered Dialog */}
      <Dialog open={showDeliverDialog} onOpenChange={setShowDeliverDialog}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>Mark as Delivered</DialogTitle>
            <DialogDescription>
              Confirm delivery of {selectedDelivery?.delivery_number}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="rounded-xl bg-success/10 border border-success/20 p-4 text-center">
              <CheckCircle2 className="mx-auto h-10 w-10 text-success" />
              <p className="mt-2 font-medium">
                {selectedDelivery?.items.length} items will be marked as delivered
              </p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Received By *</label>
              <Input
                placeholder="Enter receiver's name"
                value={receiverName}
                onChange={(e) => setReceiverName(e.target.value)}
                className="rounded-xl h-11"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" className="rounded-xl" onClick={() => setShowDeliverDialog(false)}>
              Cancel
            </Button>
            <Button 
              className="rounded-xl bg-success hover:bg-success/90" 
              onClick={handleMarkDelivered}
              disabled={!receiverName.trim()}
            >
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Confirm Delivery
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
