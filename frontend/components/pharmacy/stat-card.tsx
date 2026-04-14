'use client'

import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: LucideIcon
  trend?: {
    value: number
    isPositive: boolean
  }
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info'
  className?: string
}

export function StatCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  trend, 
  variant = 'default',
  className 
}: StatCardProps) {
  const variants = {
    default: {
      card: 'bg-card',
      iconBg: 'bg-muted',
      iconColor: 'text-muted-foreground',
    },
    primary: {
      card: 'bg-card',
      iconBg: 'bg-primary/10',
      iconColor: 'text-primary',
    },
    success: {
      card: 'bg-card',
      iconBg: 'bg-success/10',
      iconColor: 'text-success',
    },
    warning: {
      card: 'bg-card',
      iconBg: 'bg-warning/10',
      iconColor: 'text-warning',
    },
    danger: {
      card: 'bg-card',
      iconBg: 'bg-destructive/10',
      iconColor: 'text-destructive',
    },
    info: {
      card: 'bg-card',
      iconBg: 'bg-info/10',
      iconColor: 'text-info',
    },
  }

  const styles = variants[variant]

  return (
    <div className={cn(
      'group relative overflow-hidden rounded-2xl border border-border/50 p-5 shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5',
      styles.card,
      className
    )}>
      {/* Background decoration */}
      <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-gradient-to-br from-primary/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      
      <div className="relative flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-bold tracking-tight">{value}</p>
            {trend && (
              <span className={cn(
                'flex items-center text-xs font-semibold',
                trend.isPositive ? 'text-success' : 'text-destructive'
              )}>
                {trend.isPositive ? '+' : ''}{trend.value}%
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          )}
        </div>
        
        <div className={cn(
          'flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl transition-transform duration-200 group-hover:scale-110',
          styles.iconBg
        )}>
          <Icon className={cn('h-6 w-6', styles.iconColor)} />
        </div>
      </div>
    </div>
  )
}

// Loading skeleton for stat cards
export function StatCardSkeleton() {
  return (
    <div className="rounded-2xl border border-border/50 bg-card p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="space-y-3">
          <div className="h-4 w-24 rounded-lg bg-muted animate-pulse" />
          <div className="h-8 w-16 rounded-lg bg-muted animate-pulse" />
          <div className="h-3 w-32 rounded-lg bg-muted animate-pulse" />
        </div>
        <div className="h-12 w-12 rounded-2xl bg-muted animate-pulse" />
      </div>
    </div>
  )
}
