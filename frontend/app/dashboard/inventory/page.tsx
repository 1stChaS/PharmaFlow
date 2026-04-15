'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { 
  Search, 
  Plus, 
  Filter, 
  Package, 
  AlertTriangle,
  ChevronDown,
  Eye,
  Edit,
  MoreHorizontal,
  SlidersHorizontal
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
import { Drug } from '@/lib/types'
import { cn } from '@/lib/utils'
import InventoryList from '@/components/pharmacy/'

export default function InventoryPage() {
  return <InventoryList />
}

export default function InventoryPage() {
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedDrug, setSelectedDrug] = useState<Drug | null>(null)
  const [isLoading] = useState(false)
  const drugs: Drug[] = []
  const categories = []

  // Filter drugs
  const filteredDrugs = useMemo(() => {
    return mockDrugs.filter(drug => {
      const matchesSearch = search === '' || 
        drug.drug_name.toLowerCase().includes(search.toLowerCase()) ||
        drug.drug_code.toLowerCase().includes(search.toLowerCase()) ||
        drug.generic_name?.toLowerCase().includes(search.toLowerCase())
      
      const matchesCategory = categoryFilter === 'all' || 
        drug.category_id.toString() === categoryFilter
      
      const matchesStatus = statusFilter === 'all' || 
        drug.stockStatus === statusFilter
      
      return matchesSearch && matchesCategory && matchesStatus
    })
  }, [search, categoryFilter, statusFilter])

  // Stats
  const stats = useMemo(() => ({
    total: mockDrugs.length,
    inStock: mockDrugs.filter(d => d.stockStatus === 'in_stock').length,
    lowStock: mockDrugs.filter(d => d.stockStatus === 'low_stock').length,
    outOfStock: mockDrugs.filter(d => d.stockStatus === 'out_of_stock').length,
  }), [])

  const statusFilters = [
    { value: 'all', label: 'All Status' },
    { value: 'in_stock', label: 'In Stock' },
    { value: 'low_stock', label: 'Low Stock' },
    { value: 'out_of_stock', label: 'Out of Stock' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
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

      {/* Stats */}
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

      {/* Filters */}
      <Card className="rounded-2xl border-border/50 shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by name, code, or generic name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 rounded-xl border-border/50 h-11"
              />
            </div>

            {/* Filter controls */}
            <div className="flex flex-wrap gap-2">
              {/* Category filter */}
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[180px] rounded-xl border-border/50 h-11">
                  <Filter className="mr-2 h-4 w-4 text-muted-foreground" />
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="all">All Categories</SelectItem>
                  {mockCategories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id.toString()}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Status filter pills */}
              <div className="flex items-center gap-1 rounded-xl border border-border/50 p-1 bg-muted/30">
                {statusFilters.map((filter) => (
                  <button
                    key={filter.value}
                    onClick={() => setStatusFilter(filter.value)}
                    className={cn(
                      'rounded-lg px-3 py-1.5 text-sm font-medium transition-all',
                      statusFilter === filter.value
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
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

      {/* Inventory Table */}
      <Card className="rounded-2xl border-border/50 shadow-sm overflow-hidden">
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
                  }
                }}
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/20">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Drug</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Code</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Category</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">Quantity</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Nearest Expiry</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {filteredDrugs.map((drug) => (
                    <tr key={drug.id} className="group hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
                            drug.stockStatus === 'out_of_stock' ? 'bg-destructive/10' :
                            drug.stockStatus === 'low_stock' ? 'bg-warning/10' : 'bg-primary/10'
                          )}>
                            <Package className={cn(
                              'h-5 w-5',
                              drug.stockStatus === 'out_of_stock' ? 'text-destructive' :
                              drug.stockStatus === 'low_stock' ? 'text-warning' : 'text-primary'
                            )} />
                          </div>
                          <div>
                            <p className="font-medium">{drug.drug_name}</p>
                            <p className="text-xs text-muted-foreground">{drug.generic_name}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <Badge variant="outline" className="rounded-lg font-mono text-xs">
                          {drug.drug_code}
                        </Badge>
                      </td>
                      <td className="px-4 py-4 text-sm text-muted-foreground">
                        {drug.category_name}
                      </td>
                      <td className="px-4 py-4 text-center">
                        <div className="flex flex-col items-center">
                          <span className={cn(
                            'text-lg font-semibold',
                            drug.stockStatus === 'out_of_stock' ? 'text-destructive' :
                            drug.stockStatus === 'low_stock' ? 'text-warning' : 'text-foreground'
                          )}>
                            {drug.total_quantity}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {drug.batch_count} batch{drug.batch_count !== 1 ? 'es' : ''}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm">
                        {drug.nearest_expiry ? (
                          <span className={cn(
                            new Date(drug.nearest_expiry) < new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) && 'text-destructive font-medium'
                          )}>
                            {new Date(drug.nearest_expiry).toLocaleDateString()}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <StatusBadge status={drug.stockStatus} />
                      </td>
                      <td className="px-4 py-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="rounded-xl w-48">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="rounded-lg cursor-pointer"
                              onClick={() => setSelectedDrug(drug)}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem className="rounded-lg cursor-pointer">
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Drug
                            </DropdownMenuItem>
                            <DropdownMenuItem className="rounded-lg cursor-pointer">
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

      {/* Drug Detail Modal */}
      <Dialog open={!!selectedDrug} onOpenChange={() => setSelectedDrug(null)}>
        <DialogContent className="rounded-2xl max-w-lg">
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
                  <p className="font-medium">{selectedDrug.generic_name}</p>
                </div>
                <div className="rounded-xl bg-muted/50 p-3">
                  <p className="text-xs text-muted-foreground">Category</p>
                  <p className="font-medium">{selectedDrug.category_name}</p>
                </div>
                <div className="rounded-xl bg-muted/50 p-3">
                  <p className="text-xs text-muted-foreground">Manufacturer</p>
                  <p className="font-medium">{selectedDrug.manufacturer}</p>
                </div>
                <div className="rounded-xl bg-muted/50 p-3">
                  <p className="text-xs text-muted-foreground">Dosage Form</p>
                  <p className="font-medium capitalize">{selectedDrug.dosage_form}</p>
                </div>
                <div className="rounded-xl bg-muted/50 p-3">
                  <p className="text-xs text-muted-foreground">Strength</p>
                  <p className="font-medium">{selectedDrug.strength}</p>
                </div>
                <div className="rounded-xl bg-muted/50 p-3">
                  <p className="text-xs text-muted-foreground">Unit Price</p>
                  <p className="font-medium">${selectedDrug.unit_price.toFixed(2)}</p>
                </div>
                <div className="rounded-xl bg-muted/50 p-3">
                  <p className="text-xs text-muted-foreground">Reorder Level</p>
                  <p className="font-medium">{selectedDrug.reorder_level} units</p>
                </div>
              </div>

              <div className="rounded-xl border border-border/50 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Current Stock</p>
                    <p className="text-3xl font-bold">{selectedDrug.total_quantity}</p>
                  </div>
                  <StatusBadge status={selectedDrug.stockStatus} size="lg" />
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
