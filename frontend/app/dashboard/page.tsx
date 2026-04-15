// frontend/app/dashboard/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { Package, Truck, ClipboardList, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/lib/auth-context'

type DashboardStats = {
  totalDrugs: number
  lowStockItems: number
  pendingRequests: number
  activeDeliveries: number
}

type RequestItem = {
  id: number | string
  request_number?: string
  status?: string
  created_at?: string
}

type DeliveryItem = {
  id: number | string
  delivery_number?: string
  status?: string
  created_at?: string
}

export default function DashboardPage() {
  const { user } = useAuth()

  const [stats, setStats] = useState<DashboardStats>({
    totalDrugs: 0,
    lowStockItems: 0,
    pendingRequests: 0,
    activeDeliveries: 0,
  })
  const [recentRequests, setRecentRequests] = useState<RequestItem[]>([])
  const [recentDeliveries, setRecentDeliveries] = useState<DeliveryItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [inventoryRes, requestsRes, deliveriesRes] = await Promise.allSettled([
          fetch('http://localhost:3001/api/inventory/stock-status'),
          fetch('http://localhost:3001/api/requests'),
          fetch('http://localhost:3001/api/deliveries'),
        ])

        let inventory: any[] = []
        let requests: any[] = []
        let deliveries: any[] = []

        if (inventoryRes.status === 'fulfilled' && inventoryRes.value.ok) {
          inventory = await inventoryRes.value.json()
        }

        if (requestsRes.status === 'fulfilled' && requestsRes.value.ok) {
          requests = await requestsRes.value.json()
        }

        if (deliveriesRes.status === 'fulfilled' && deliveriesRes.value.ok) {
          deliveries = await deliveriesRes.value.json()
        }

        setStats({
          totalDrugs: inventory.length,
          lowStockItems: inventory.filter(
            (item) => Number(item.total_quantity ?? 0) > 0 && Number(item.total_quantity ?? 0) < 10
          ).length,
          pendingRequests: requests.filter((item) => item.status === 'pending').length,
          activeDeliveries: deliveries.filter(
            (item) => item.status === 'pending' || item.status === 'in_transit'
          ).length,
        })

        setRecentRequests(requests.slice(0, 5))
        setRecentDeliveries(deliveries.slice(0, 5))
      } catch (error) {
        console.error('Failed to load dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome back, {user?.full_name || user?.username || 'User'}
        </h1>
        <p className="text-muted-foreground">
          Overview of pharmacy operations and recent activity.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Drugs</CardTitle>
            <Package className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalDrugs}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
            <AlertTriangle className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.lowStockItems}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
            <ClipboardList className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingRequests}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Deliveries</CardTitle>
            <Truck className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeDeliveries}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Requests</CardTitle>
            <CardDescription>Latest drug request activity</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p>Loading...</p>
            ) : recentRequests.length === 0 ? (
              <p className="text-sm text-muted-foreground">No requests found.</p>
            ) : (
              <div className="space-y-3">
                {recentRequests.map((request) => (
                  <div key={request.id} className="rounded-lg border p-3">
                    <div className="font-medium">{request.request_number || `Request #${request.id}`}</div>
                    <div className="text-sm text-muted-foreground">
                      Status: {request.status || 'unknown'}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Deliveries</CardTitle>
            <CardDescription>Latest delivery updates</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p>Loading...</p>
            ) : recentDeliveries.length === 0 ? (
              <p className="text-sm text-muted-foreground">No deliveries found.</p>
            ) : (
              <div className="space-y-3">
                {recentDeliveries.map((delivery) => (
                  <div key={delivery.id} className="rounded-lg border p-3">
                    <div className="font-medium">
                      {delivery.delivery_number || `Delivery #${delivery.id}`}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Status: {delivery.status || 'unknown'}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
