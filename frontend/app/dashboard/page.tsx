'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { 
  Pill, 
  Package, 
  ClipboardList, 
  Truck, 
  AlertTriangle, 
  TrendingUp,
  ArrowRight,
  Clock,
  CheckCircle2,
  Calendar
} from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { StatCard } from '@/components/pharmacy/stat-card'
import { AlertCard, AlertBanner } from '@/components/pharmacy/alert-card'
import { StatusBadge, PriorityBadge } from '@/components/pharmacy/status-badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { mockDashboardStats, mockRequests, mockDeliveries, mockDrugs } from '@/lib/mock-data'

export default function DashboardPage() {
  const { user } = useAuth()
  const [stats] = useState(mockDashboardStats)
  
  const isPharmacist = user?.role === 'pharmacist' || user?.role === 'administrator'
  const recentRequests = mockRequests.slice(0, 3)
  const recentDeliveries = mockDeliveries.slice(0, 3)
  const lowStockDrugs = mockDrugs.filter(d => d.stockStatus === 'low_stock').slice(0, 3)
  const expiringDrugs = mockDrugs.filter(d => d.nearest_expiry && new Date(d.nearest_expiry) < new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)).slice(0, 3)

  return (
    <div className="space-y-6">
      {/* Welcome Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary/90 to-info/80 p-6 md:p-8 text-white shadow-lg shadow-primary/20">
        {/* Decorative elements */}
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute right-20 bottom-10 h-20 w-20 rounded-full bg-white/5" />
        
        <div className="relative">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">
                Welcome back, {user?.fullName?.split(' ')[0]}
              </h1>
              <p className="mt-1 text-white/80">
                {isPharmacist 
                  ? "Here's what's happening in the pharmacy today"
                  : "Track your drug requests and deliveries"
                }
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <div className="flex items-center gap-2 rounded-full bg-white/20 px-3 py-1.5 text-sm">
                  <Calendar className="h-4 w-4" />
                  {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </div>
                <div className="flex items-center gap-2 rounded-full bg-white/20 px-3 py-1.5 text-sm">
                  <Clock className="h-4 w-4" />
                  {user?.department}
                </div>
              </div>
            </div>
            
            {isPharmacist ? (
              <div className="flex gap-3">
                <Link href="/dashboard/inventory/add">
                  <Button variant="secondary" className="rounded-xl shadow-lg">
                    <Pill className="mr-2 h-4 w-4" />
                    Add Drug
                  </Button>
                </Link>
                <Link href="/dashboard/requests">
                  <Button className="rounded-xl bg-white/20 hover:bg-white/30 text-white border-0 shadow-lg">
                    View Requests
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            ) : (
              <Link href="/dashboard/my-requests">
                <Button variant="secondary" className="rounded-xl shadow-lg">
                  <ClipboardList className="mr-2 h-4 w-4" />
                  My Requests
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Alert Banner */}
      {isPharmacist && (
        <AlertBanner 
          alerts={{
            lowStock: stats.lowStockCount,
            expiring: stats.expiringCount,
            urgentRequests: mockRequests.filter(r => r.priority === 'urgent' && r.status === 'pending').length,
          }}
          onViewAlerts={() => {}}
        />
      )}

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Drugs"
          value={stats.totalDrugs}
          subtitle="In inventory"
          icon={Package}
          variant="primary"
        />
        <StatCard
          title={isPharmacist ? "Pending Requests" : "My Requests"}
          value={isPharmacist ? stats.pendingRequests : stats.myRequests || 0}
          subtitle={isPharmacist ? "Awaiting approval" : "Total submitted"}
          icon={ClipboardList}
          variant={stats.pendingRequests > 0 ? 'warning' : 'default'}
        />
        <StatCard
          title="In Transit"
          value={stats.deliveriesInTransit}
          subtitle="Deliveries active"
          icon={Truck}
          variant="info"
        />
        {isPharmacist ? (
          <StatCard
            title="Expiry Alerts"
            value={stats.expiringCount}
            subtitle="Within 90 days"
            icon={AlertTriangle}
            variant={stats.expiringCount > 0 ? 'danger' : 'success'}
          />
        ) : (
          <StatCard
            title="Delivered"
            value={mockRequests.filter(r => r.status === 'delivered').length}
            subtitle="Completed requests"
            icon={CheckCircle2}
            variant="success"
          />
        )}
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Requests */}
        <Card className="rounded-2xl border-border/50 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-semibold">Recent Requests</CardTitle>
                <CardDescription>Latest drug requests</CardDescription>
              </div>
              <Link href={isPharmacist ? "/dashboard/requests" : "/dashboard/my-requests"}>
                <Button variant="ghost" size="sm" className="rounded-xl">
                  View All
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentRequests.map((request) => (
              <div 
                key={request.id} 
                className="flex items-center gap-4 rounded-xl border border-border/50 bg-muted/30 p-3 transition-colors hover:bg-muted/50"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                  <ClipboardList className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm">{request.request_number}</p>
                    <PriorityBadge priority={request.priority} showLabel={false} />
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    {request.department} - {request.items.length} item(s)
                  </p>
                </div>
                <StatusBadge status={request.status} size="sm" />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Deliveries */}
        <Card className="rounded-2xl border-border/50 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-semibold">Delivery Tracking</CardTitle>
                <CardDescription>Active deliveries</CardDescription>
              </div>
              <Link href="/dashboard/deliveries">
                <Button variant="ghost" size="sm" className="rounded-xl">
                  View All
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentDeliveries.map((delivery) => (
              <div 
                key={delivery.id} 
                className="flex items-center gap-4 rounded-xl border border-border/50 bg-muted/30 p-3 transition-colors hover:bg-muted/50"
              >
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                  delivery.status === 'delivered' ? 'bg-success/10' : 'bg-info/10'
                }`}>
                  <Truck className={`h-5 w-5 ${
                    delivery.status === 'delivered' ? 'text-success' : 'text-info'
                  }`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{delivery.delivery_number}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    To: {delivery.delivery_location}
                  </p>
                </div>
                <StatusBadge status={delivery.status} size="sm" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Pharmacist-only: Alerts Section */}
      {isPharmacist && (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Low Stock Alerts */}
          <Card className="rounded-2xl border-border/50 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-warning" />
                    Low Stock Alerts
                  </CardTitle>
                  <CardDescription>Items below reorder level</CardDescription>
                </div>
                <Link href="/dashboard/alerts">
                  <Button variant="ghost" size="sm" className="rounded-xl">
                    View All
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {lowStockDrugs.length > 0 ? (
                lowStockDrugs.map((drug) => (
                  <AlertCard
                    key={drug.id}
                    type="low_stock"
                    title={drug.drug_name}
                    description={`Only ${drug.total_quantity} units remaining. Reorder level: ${drug.reorder_level}`}
                    metadata={`Code: ${drug.drug_code}`}
                    action={{ label: 'Reorder', onClick: () => {} }}
                  />
                ))
              ) : (
                <div className="rounded-xl bg-success/10 border border-success/20 p-4 text-center">
                  <CheckCircle2 className="mx-auto h-8 w-8 text-success" />
                  <p className="mt-2 text-sm font-medium text-success">All stock levels healthy</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Expiry Alerts */}
          <Card className="rounded-2xl border-border/50 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-destructive" />
                    Expiry Alerts
                  </CardTitle>
                  <CardDescription>Items expiring within 90 days</CardDescription>
                </div>
                <Link href="/dashboard/alerts">
                  <Button variant="ghost" size="sm" className="rounded-xl">
                    View All
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {expiringDrugs.length > 0 ? (
                expiringDrugs.map((drug) => (
                  <AlertCard
                    key={drug.id}
                    type="expiry"
                    title={drug.drug_name}
                    description={`Expires on ${new Date(drug.nearest_expiry).toLocaleDateString()}`}
                    metadata={`${drug.total_quantity} units affected`}
                    action={{ label: 'View Details', onClick: () => {} }}
                  />
                ))
              ) : (
                <div className="rounded-xl bg-success/10 border border-success/20 p-4 text-center">
                  <CheckCircle2 className="mx-auto h-8 w-8 text-success" />
                  <p className="mt-2 text-sm font-medium text-success">No items expiring soon</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
