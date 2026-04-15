'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import {
  Search,
  Plus,
  Filter,
  Package,
  AlertTriangle,
  Eye,
  Edit,
  MoreHorizontal,
  SlidersHorizontal,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { StatusBadge } from '@/components/pharmacy/status-badge'
import { StatCard } from '@/components/pharmacy/stat-card'
import { EmptyState, TableSkeleton } from '@/components/pharmacy/empty-state'
import { cn } from '@/lib/utils'

type InventoryDrug = {
  id: number
  drug_code: string
  drug_name: string
  generic_name?: string | null
  category_id?: number | null
  category_name?: string | null
  manufacturer?: string | null
  dosage_form?: string | null
  strength?: string | null
  unit_price?: number | string | null
  reorder_level?: number | null
  total_quantity?: number | null
  batch_count?: number | null
  nearest_expiry?: string | null
  nearest_expiry_date?: string | null
  stockStatus?: 'in_stock' | 'low_stock' | 'out_of_stock'
}

type Category = {
  id: number
  name: string
}

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') || 'http://localhost:3001/api'

function deriveStockStatus(drug: InventoryDrug): 'in_stock' | 'low_stock' | 'out_of_stock' {
  const qty = Number(drug.total_quantity ?? 0)
  const reorder = Number(drug.reorder_level ?? 10)

  if (qty <= 0) return 'out_of_stock'
  if (qty <= reorder) return 'low_stock'
  return 'in_stock'
}

export default function InventoryPage() {
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedDrug, setSelectedDrug] = useState<InventoryDrug | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [drugs, setDrugs] = useState<InventoryDrug[]>([])
  const [categories, setCategories] = useState<Category[]>([])

  useEffect(() => {
    let isMounted = true

    const fetchInventory = async () => {
      try {
        setIsLoading(true)
        setError('')

        const [stockRes, categoryRes] = await Promise.allSettled([
          fetch(`${API_BASE}/reports/stock`, { cache: 'no-store' }),
          fetch(`${API_BASE}/inventory/categories`, { cache: 'no-store' }),
        ])

        let stockData: InventoryDrug[] = []
        let categoryData: Category[] = []

        if (stockRes.status === 'fulfilled' && stockRes.value.ok) {
          stockData = await stockRes.value.json()
        } else {
          throw new Error('Failed to fetch inventory stock status')
        }

        if (categoryRes.status === 'fulfilled' && categoryRes.value.ok) {
          categoryData = await categoryRes.value.json()
        }

        const normalized = stockData.map((drug) => ({
          ...drug,
          stockStatus: drug.stockStatus ?? deriveStockStatus(drug),
          nearest_expiry: drug.nearest_expiry ?? drug.nearest_expiry_date ?? null,
        }))

        if (!isMounted) return
        setDrugs(normalized)
        setCategories(Array.isArray(categoryData) ? categoryData : [])
      } catch (err) {
        if (!isMounted) return
        setError(err instanceof Error ? err.message : 'Failed to load inventory')
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    fetchInventory()

    return () => {
      isMounted = false
    }
  }, [])

  const filteredDrugs = useMemo(() => {
    return drugs.filter((drug) => {
      const matchesSearch =
        search === '' ||
        drug.drug_name?.toLowerCase().includes(search.toLowerCase()) ||
        drug.drug_code?.toLowerCase().includes(search.toLowerCase()) ||
        drug.generic_name?.toLowerCase().includes(search.toLowerCase())

      const matchesCategory =
        categoryFilter === 'all' || String(drug.category_id ?? '') === categoryFilter

      const matchesStatus =
        statusFilter === 'all' || drug.stockStatus === statusFilter

      return matchesSearch && matchesCategory && matchesStatus
    })
  }, [drugs, search, categoryFilter, statusFilter])

  const stats = useMemo(
    () => ({
      total: drugs.length,
      inStock: drugs.filter((d) => d.stockStatus === 'in_stock').length,
      lowStock: drugs.filter((d) => d.stockStatus === 'low_stock').length,
      outOfStock: drugs.filter((d) => d.stockStatus === 'out_of_stock').length,
    }),
    [drugs]
  )

  const statusFilters = [
    { value: 'all', label: 'All Status' },
    { value: 'in_stock', label: 'In Stock' },
    { value: 'low_stock', label: 'Low Stock' },
    { value: 'out_of_stock', label: 'Out of Stock' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Inventory Management</h1>
          <p className="text-muted-foreground">Manage and track all drug inventory</p>
        </div>

        <Link href="/dashboard/inventory/add">
          <Button className="rounded-xl shadow-md">
            <Plus className="mr-2 h-4 w-4" />
            Add New Drug
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Drugs"
          value={stats.total}
          subtitle="In catalog"
          icon={Package}
          variant="primary"
        />
        <StatCard
          title="In Stock"
          value={stats.inStock}
          subtitle="Healthy levels"
          icon={Package}
          variant="success"
        />
        <StatCard
          title="Low Stock"
          value={stats.lowStock}
          subtitle="Need reorder"
          icon={AlertTriangle}
          variant="warning"
        />
        <StatCard
          title="Out of Stock"
          value={stats.outOfStock}
          subtitle="Requires attention"
          icon={AlertTriangle}
          variant="danger"
        />
      </div>

      <Card className="rounded-2xl border-border/50 shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by name, code, or generic name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-11 rounded-xl border-border/50 pl-9"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="h-11 w-[180px] rounded-xl border-border/50">
                  <Filter className="mr-2 h-4 w-4 text-muted-foreground" />
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={String(cat.id)}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="flex items-center gap-1 rounded-xl border border-border/50 bg-muted/30 p-1">
                {statusFilters.map((filter) => (
                  <button
                    key={filter.value}
                    onClick={() => setStatusFilter(filter.value)}
                    className={cn(
                      'rounded-lg px-3 py-1.5 text-sm font-medium transition-all',
                      statusFilter === filter.value
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    )}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden rounded-2xl border-border/50 shadow-sm">
        <CardHeader className="border-b bg-muted/30 py-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-semibold">Drug Inventory</CardTitle>
              <CardDescription>{filteredDrugs.length} items found</CardDescription>
            </div>
            <Button variant="outline" size="sm" className="rounded-xl">
              <SlidersHorizontal className="mr-2 h-4 w-4" />
              Columns
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-4">
              <TableSkeleton columns={6} rows={5} />
            </div>
          ) : error ? (
            <div className="p-8">
              <EmptyState
                variant="inventory"
                title="Failed to load inventory"
                description={error}
              />
            </div>
          ) : filteredDrugs.length === 0 ? (
            <div className="p-8">
              <EmptyState
                variant="inventory"
                title="No drugs found"
                description="Try adjusting your search or filter criteria to find what you're looking for."
                action={{
                  label: 'Clear Filters',
                  onClick: () => {
                    setSearch('')
                    setCategoryFilter('all')
                    setStatusFilter('all')
                  },
                }}
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/20">
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Drug
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Code
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Category
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Quantity
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Nearest Expiry
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Status
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-border/50">
                  {filteredDrugs.map((drug) => (
                    <tr key={drug.id} className="group transition-colors hover:bg-muted/30">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={cn(
                              'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
                              drug.stockStatus === 'out_of_stock'
                                ? 'bg-destructive/10'
                                : drug.stockStatus === 'low_stock'
                                  ? 'bg-yellow-100'
                                  : 'bg-primary/10'
                            )}
                          >
                            <Package
                              className={cn(
                                'h-5 w-5',
                                drug.stockStatus === 'out_of_stock'
                                  ? 'text-destructive'
                                  : drug.stockStatus === 'low_stock'
                                    ? 'text-yellow-600'
                                    : 'text-primary'
                              )}
                            />
                          </div>
                          <div>
                            <p className="font-medium">{drug.drug_name}</p>
                            <p className="text-xs text-muted-foreground">
                              {drug.generic_name || '-'}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        <Badge variant="outline" className="rounded-lg font-mono text-xs">
                          {drug.drug_code}
                        </Badge>
                      </td>

                      <td className="px-4 py-4 text-sm text-muted-foreground">
                        {drug.category_name || '-'}
                      </td>

                      <td className="px-4 py-4 text-center">
                        <div className="flex flex-col items-center">
                          <span
                            className={cn(
                              'text-lg font-semibold',
                              drug.stockStatus === 'out_of_stock'
                                ? 'text-destructive'
                                : drug.stockStatus === 'low_stock'
                                  ? 'text-yellow-600'
                                  : 'text-foreground'
                            )}
                          >
                            {Number(drug.total_quantity ?? 0)}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {Number(drug.batch_count ?? 0)} batch
                            {Number(drug.batch_count ?? 0) !== 1 ? 'es' : ''}
                          </span>
                        </div>
                      </td>

                      <td className="px-4 py-4 text-sm">
                        {drug.nearest_expiry ? (
                          <span
                            className={cn(
                              new Date(drug.nearest_expiry).getTime() <
                                Date.now() + 90 * 24 * 60 * 60 * 1000 &&
                                'font-medium text-destructive'
                            )}
                          >
                            {new Date(drug.nearest_expiry).toLocaleDateString()}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </td>

                      <td className="px-4 py-4">
                        <StatusBadge status={drug.stockStatus ?? 'in_stock'} />
                      </td>

                      <td className="px-4 py-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="rounded-lg opacity-0 transition-opacity group-hover:opacity-100"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>

                          <DropdownMenuContent align="end" className="w-48 rounded-xl">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="cursor-pointer rounded-lg"
                              onClick={() => setSelectedDrug(drug)}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem className="cursor-pointer rounded-lg">
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Drug
                            </DropdownMenuItem>
                            <DropdownMenuItem className="cursor-pointer rounded-lg">
                              <Plus className="mr-2 h-4 w-4" />
                              Add Batch
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selectedDrug} onOpenChange={() => setSelectedDrug(null)}>
        <DialogContent className="max-w-lg rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <Package className="h-5 w-5 text-primary" />
              </div>
              {selectedDrug?.drug_name}
            </DialogTitle>
            <DialogDescription>
              Drug details and inventory information
            </DialogDescription>
          </DialogHeader>

          {selectedDrug && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-xl bg-muted/50 p-3">
                  <p className="text-xs text-muted-foreground">Drug Code</p>
                  <p className="font-mono font-medium">{selectedDrug.drug_code}</p>
                </div>
                <div className="rounded-xl bg-muted/50 p-3">
                  <p className="text-xs text-muted-foreground">Generic Name</p>
                  <p className="font-medium">{selectedDrug.generic_name || '-'}</p>
                </div>
                <div className="rounded-xl bg-muted/50 p-3">
                  <p className="text-xs text-muted-foreground">Category</p>
                  <p className="font-medium">{selectedDrug.category_name || '-'}</p>
                </div>
                <div className="rounded-xl bg-muted/50 p-3">
                  <p className="text-xs text-muted-foreground">Manufacturer</p>
                  <p className="font-medium">{selectedDrug.manufacturer || '-'}</p>
                </div>
                <div className="rounded-xl bg-muted/50 p-3">
                  <p className="text-xs text-muted-foreground">Dosage Form</p>
                  <p className="font-medium capitalize">{selectedDrug.dosage_form || '-'}</p>
                </div>
                <div className="rounded-xl bg-muted/50 p-3">
                  <p className="text-xs text-muted-foreground">Strength</p>
                  <p className="font-medium">{selectedDrug.strength || '-'}</p>
                </div>
                <div className="rounded-xl bg-muted/50 p-3">
                  <p className="text-xs text-muted-foreground">Unit Price</p>
                  <p className="font-medium">
                    ${Number(selectedDrug.unit_price ?? 0).toFixed(2)}
                  </p>
                </div>
                <div className="rounded-xl bg-muted/50 p-3">
                  <p className="text-xs text-muted-foreground">Reorder Level</p>
                  <p className="font-medium">{Number(selectedDrug.reorder_level ?? 0)} units</p>
                </div>
              </div>

              <div className="rounded-xl border border-border/50 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Current Stock</p>
                    <p className="text-3xl font-bold">
                      {Number(selectedDrug.total_quantity ?? 0)}
                    </p>
                  </div>
                  <StatusBadge status={selectedDrug.stockStatus ?? 'in_stock'} size="lg" />
                </div>
              </div>

              <div className="flex gap-2">
                <Button className="flex-1 rounded-xl">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Batch
                </Button>
                <Button variant="outline" className="flex-1 rounded-xl">
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Details
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
