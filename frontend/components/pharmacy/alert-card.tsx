'use client'

import { AlertTriangle, Package, Calendar, TrendingDown, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface AlertCardProps {
  type: 'low_stock' | 'expiry' | 'urgent_request'
  title: string
  description: string
  metadata?: string
  action?: {
    label: string
    onClick: () => void
  }
  onDismiss?: () => void
  className?: string
}

const alertConfig = {
  low_stock: {
    icon: TrendingDown,
    gradient: 'from-warning/10 to-warning/5',
    iconBg: 'bg-warning/20',
    iconColor: 'text-warning',
    border: 'border-warning/30',
  },
  expiry: {
    icon: Calendar,
    gradient: 'from-destructive/10 to-destructive/5',
    iconBg: 'bg-destructive/20',
    iconColor: 'text-destructive',
    border: 'border-destructive/30',
  },
  urgent_request: {
    icon: AlertTriangle,
    gradient: 'from-info/10 to-info/5',
    iconBg: 'bg-info/20',
    iconColor: 'text-info',
    border: 'border-info/30',
  },
}

export function AlertCard({ 
  type, 
  title, 
  description, 
  metadata, 
  action, 
  onDismiss,
  className 
}: AlertCardProps) {
  const config = alertConfig[type]
  const Icon = config.icon

  return (
    <div className={cn(
      'group relative overflow-hidden rounded-2xl border bg-gradient-to-br p-4 transition-all duration-200 hover:shadow-md',
      config.gradient,
      config.border,
      className
    )}>
      {onDismiss && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 top-2 h-6 w-6 rounded-lg opacity-0 transition-opacity group-hover:opacity-100"
          onClick={onDismiss}
        >
          <X className="h-4 w-4" />
        </Button>
      )}
      
      <div className="flex gap-4">
        <div className={cn(
          'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
          config.iconBg
        )}>
          <Icon className={cn('h-5 w-5', config.iconColor)} />
        </div>
        
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-foreground">{title}</h4>
          <p className="mt-0.5 text-sm text-muted-foreground line-clamp-2">{description}</p>
          {metadata && (
            <p className="mt-1 text-xs font-medium text-muted-foreground">{metadata}</p>
          )}
          {action && (
            <Button 
              variant="link" 
              className="mt-2 h-auto p-0 text-sm"
              onClick={action.onClick}
            >
              {action.label}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

// Compact alert for inline warnings
interface InlineAlertProps {
  type: 'warning' | 'error' | 'info' | 'success'
  message: string
  className?: string
}

const inlineAlertConfig = {
  warning: {
    bg: 'bg-warning/10',
    text: 'text-warning',
    border: 'border-warning/20',
  },
  error: {
    bg: 'bg-destructive/10',
    text: 'text-destructive',
    border: 'border-destructive/20',
  },
  info: {
    bg: 'bg-info/10',
    text: 'text-info',
    border: 'border-info/20',
  },
  success: {
    bg: 'bg-success/10',
    text: 'text-success',
    border: 'border-success/20',
  },
}

export function InlineAlert({ type, message, className }: InlineAlertProps) {
  const config = inlineAlertConfig[type]
  
  return (
    <div className={cn(
      'flex items-center gap-2 rounded-xl border px-3 py-2',
      config.bg,
      config.border,
      className
    )}>
      <AlertTriangle className={cn('h-4 w-4 shrink-0', config.text)} />
      <span className={cn('text-sm font-medium', config.text)}>{message}</span>
    </div>
  )
}

// Summary alert banner
interface AlertBannerProps {
  alerts: {
    lowStock: number
    expiring: number
    urgentRequests: number
  }
  onViewAlerts: () => void
  className?: string
}

export function AlertBanner({ alerts, onViewAlerts, className }: AlertBannerProps) {
  const totalAlerts = alerts.lowStock + alerts.expiring + alerts.urgentRequests
  
  if (totalAlerts === 0) return null

  return (
    <div className={cn(
      'flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-warning/30 bg-gradient-to-r from-warning/10 to-warning/5 px-4 py-3',
      className
    )}>
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-warning/20">
          <AlertTriangle className="h-4 w-4 text-warning" />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">
            {totalAlerts} alert{totalAlerts > 1 ? 's' : ''} require your attention
          </p>
          <p className="text-xs text-muted-foreground">
            {alerts.lowStock > 0 && `${alerts.lowStock} low stock`}
            {alerts.lowStock > 0 && alerts.expiring > 0 && ' • '}
            {alerts.expiring > 0 && `${alerts.expiring} expiring soon`}
            {(alerts.lowStock > 0 || alerts.expiring > 0) && alerts.urgentRequests > 0 && ' • '}
            {alerts.urgentRequests > 0 && `${alerts.urgentRequests} urgent requests`}
          </p>
        </div>
      </div>
      <Button variant="outline" size="sm" className="rounded-xl" onClick={onViewAlerts}>
        View Alerts
      </Button>
    </div>
  )
}
