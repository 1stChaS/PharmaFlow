'use client'

import { LucideIcon, Package, ClipboardList, Truck, FileBarChart, Pill, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
  }
  variant?: 'default' | 'inventory' | 'requests' | 'deliveries' | 'reports' | 'alerts'
  className?: string
}

const variantIcons = {
  default: Package,
  inventory: Pill,
  requests: ClipboardList,
  deliveries: Truck,
  reports: FileBarChart,
  alerts: AlertTriangle,
}

export function EmptyState({ 
  icon, 
  title, 
  description, 
  action, 
  variant = 'default',
  className 
}: EmptyStateProps) {
  const Icon = icon || variantIcons[variant]

  return (
    <div className={cn(
      'flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-muted/30 px-6 py-16 text-center',
      className
    )}>
      {/* Decorative circles */}
      <div className="relative">
        <div className="absolute -inset-4 rounded-full bg-primary/5" />
        <div className="absolute -inset-8 rounded-full bg-primary/5" />
        <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
          <Icon className="h-8 w-8 text-primary" />
        </div>
      </div>
      
      <h3 className="mt-6 text-lg font-semibold text-foreground">{title}</h3>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">{description}</p>
      
      {action && (
        <Button 
          onClick={action.onClick}
          className="mt-6 rounded-xl"
          size="lg"
        >
          {action.label}
        </Button>
      )}
    </div>
  )
}

// Loading skeleton component
export function LoadingSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 rounded-2xl border bg-card p-4">
          <div className="h-10 w-10 rounded-xl bg-muted animate-pulse" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-1/3 rounded-lg bg-muted animate-pulse" />
            <div className="h-3 w-1/2 rounded-lg bg-muted animate-pulse" />
          </div>
          <div className="h-6 w-20 rounded-full bg-muted animate-pulse" />
        </div>
      ))}
    </div>
  )
}

// Table loading skeleton
export function TableSkeleton({ columns = 5, rows = 5 }: { columns?: number; rows?: number }) {
  return (
    <div className="rounded-2xl border bg-card overflow-hidden">
      {/* Header */}
      <div className="border-b bg-muted/30 px-4 py-3">
        <div className="flex gap-4">
          {Array.from({ length: columns }).map((_, i) => (
            <div key={i} className="h-4 flex-1 rounded bg-muted animate-pulse" />
          ))}
        </div>
      </div>
      {/* Rows */}
      <div className="divide-y">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex gap-4 px-4 py-4">
            {Array.from({ length: columns }).map((_, j) => (
              <div key={j} className="h-4 flex-1 rounded bg-muted animate-pulse" />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

// Card grid skeleton
export function CardGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-2xl border bg-card p-5">
          <div className="flex justify-between">
            <div className="space-y-2">
              <div className="h-4 w-24 rounded bg-muted animate-pulse" />
              <div className="h-8 w-16 rounded bg-muted animate-pulse" />
            </div>
            <div className="h-12 w-12 rounded-2xl bg-muted animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  )
}
