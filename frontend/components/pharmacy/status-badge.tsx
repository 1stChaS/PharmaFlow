'use client'

import { cn } from '@/lib/utils'

type StatusType = 
  | 'pending' | 'approved' | 'rejected' | 'dispatched' | 'delivered' | 'cancelled' | 'partially_approved'
  | 'preparing' | 'in_transit'
  | 'in_stock' | 'low_stock' | 'out_of_stock'
  | 'low' | 'normal' | 'high' | 'urgent'

interface StatusBadgeProps {
  status: StatusType
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

const statusConfig: Record<StatusType, { label: string; className: string }> = {
  // Request statuses
  pending: { label: 'Pending', className: 'bg-warning/10 text-warning border-warning/20' },
  approved: { label: 'Approved', className: 'bg-success/10 text-success border-success/20' },
  rejected: { label: 'Rejected', className: 'bg-destructive/10 text-destructive border-destructive/20' },
  dispatched: { label: 'Dispatched', className: 'bg-info/10 text-info border-info/20' },
  delivered: { label: 'Delivered', className: 'bg-success/10 text-success border-success/20' },
  cancelled: { label: 'Cancelled', className: 'bg-muted text-muted-foreground border-muted' },
  partially_approved: { label: 'Partial', className: 'bg-warning/10 text-warning border-warning/20' },
  
  // Delivery statuses
  preparing: { label: 'Preparing', className: 'bg-muted text-muted-foreground border-muted' },
  in_transit: { label: 'In Transit', className: 'bg-info/10 text-info border-info/20' },
  
  // Stock statuses
  in_stock: { label: 'In Stock', className: 'bg-success/10 text-success border-success/20' },
  low_stock: { label: 'Low Stock', className: 'bg-warning/10 text-warning border-warning/20' },
  out_of_stock: { label: 'Out of Stock', className: 'bg-destructive/10 text-destructive border-destructive/20' },
  
  // Priority levels
  low: { label: 'Low', className: 'bg-muted text-muted-foreground border-muted' },
  normal: { label: 'Normal', className: 'bg-info/10 text-info border-info/20' },
  high: { label: 'High', className: 'bg-warning/10 text-warning border-warning/20' },
  urgent: { label: 'Urgent', className: 'bg-destructive/10 text-destructive border-destructive/20' },
}

const sizeClasses = {
  sm: 'px-2 py-0.5 text-[10px]',
  md: 'px-3 py-1 text-xs',
  lg: 'px-4 py-1.5 text-sm',
}

export function StatusBadge({ status, className, size = 'md' }: StatusBadgeProps) {
  const config = statusConfig[status] || { label: status, className: 'bg-muted text-muted-foreground' }
  
  return (
    <span className={cn(
      'inline-flex items-center rounded-full border font-semibold',
      config.className,
      sizeClasses[size],
      className
    )}>
      {config.label}
    </span>
  )
}

// Priority indicator with icon
interface PriorityBadgeProps {
  priority: 'low' | 'normal' | 'high' | 'urgent'
  showLabel?: boolean
  className?: string
}

export function PriorityBadge({ priority, showLabel = true, className }: PriorityBadgeProps) {
  const priorityConfig = {
    low: { label: 'Low', color: 'bg-slate-400', ring: 'ring-slate-200' },
    normal: { label: 'Normal', color: 'bg-info', ring: 'ring-info/20' },
    high: { label: 'High', color: 'bg-warning', ring: 'ring-warning/20' },
    urgent: { label: 'Urgent', color: 'bg-destructive', ring: 'ring-destructive/20' },
  }

  const config = priorityConfig[priority]

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <span className={cn(
        'h-2.5 w-2.5 rounded-full ring-2',
        config.color,
        config.ring
      )} />
      {showLabel && (
        <span className="text-sm font-medium text-muted-foreground">{config.label}</span>
      )}
    </div>
  )
}
