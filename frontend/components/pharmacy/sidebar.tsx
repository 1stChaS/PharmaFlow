'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Pill,
  ClipboardList,
  Truck,
  FileBarChart,
  Users,
  AlertTriangle,
  Package,
  PlusCircle,
  History,
  X,
  UserRound,
  Activity,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { UserRole } from '@/lib/types'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

interface NavItem {
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  roles: UserRole[]
  badge?: number
}

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['pharmacist', 'doctor', 'nurse', 'administrator'] },
  { label: 'Inventory', href: '/dashboard/inventory', icon: Package, roles: ['pharmacist', 'administrator'] },
  { label: 'Add Drug', href: '/dashboard/inventory/add', icon: PlusCircle, roles: ['pharmacist'] },
  { label: 'Drug Requests', href: '/dashboard/requests', icon: ClipboardList, roles: ['pharmacist'] },
  { label: 'Patients', href: '/dashboard/patients', icon: UserRound, roles: [ 'nurse'] },
  { label: 'Prescriptions', href: '/dashboard/prescriptions', icon: Pill, roles: ['doctor'] },
  { label: 'My Requests', href: '/dashboard/my-requests', icon: History, roles: ['doctor', 'nurse'] },
  { label: 'Deliveries', href: '/dashboard/deliveries', icon: Truck, roles: ['pharmacist', 'administrator', 'doctor', 'nurse'] },
  { label: 'Admin Monitoring', href: '/dashboard/admin-monitoring', icon: Activity, roles: ['administrator'] },
  { label: 'Expiry Alerts', href: '/dashboard/alerts', icon: AlertTriangle, roles: ['pharmacist'] },
  { label: 'Reports', href: '/dashboard/reports', icon: FileBarChart, roles: ['pharmacist'] },
  { label: 'User Management', href: '/dashboard/users', icon: Users, roles: ['administrator'] },
]

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname()
  const { user } = useAuth()

  const filteredItems = navItems.filter(
    (item) => user?.role && item.roles.includes(user.role as UserRole)
  )

  const mainItems = filteredItems.filter((item) =>
    ['Dashboard', 'Inventory', 'Add Drug'].includes(item.label)
  )

  const clinicalItems = filteredItems.filter((item) =>
    ['Patients', 'Prescriptions', 'My Requests', 'Drug Requests'].includes(item.label)
  )

  const otherItems = filteredItems.filter((item) =>
    ['Deliveries', 'Expiry Alerts', 'Reports', 'User Management', 'Admin Monitoring'].includes(
      item.label
    )
  )

  const NavLink = ({ item }: { item: NavItem }) => {
    const isActive =
      pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
    const Icon = item.icon

    return (
      <Link
        href={item.href}
        onClick={onClose}
        className={cn(
          'group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all duration-200',
          isActive
            ? 'bg-primary text-primary-foreground shadow-md shadow-primary/25'
            : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
        )}
      >
        <Icon
          className={cn(
            'h-5 w-5 transition-transform duration-200 group-hover:scale-110',
            isActive && 'text-primary-foreground'
          )}
        />
        <span className="flex-1">{item.label}</span>
        {item.badge && item.badge > 0 && (
          <span
            className={cn(
              'flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-bold',
              isActive ? 'bg-white/20 text-white' : 'bg-destructive/10 text-destructive'
            )}
          >
            {item.badge}
          </span>
        )}
      </Link>
    )
  }

  const SectionTitle = ({ title }: { title: string }) => (
    <h3 className="mb-2 px-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
      {title}
    </h3>
  )

  const sidebarContent = (
    <ScrollArea className="h-full py-6">
      <div className="space-y-6 px-3">
        {mainItems.length > 0 && (
          <div>
            <SectionTitle title="Main" />
            <nav className="space-y-1">
              {mainItems.map((item) => (
                <NavLink key={item.href} item={item} />
              ))}
            </nav>
          </div>
        )}

        {clinicalItems.length > 0 && (
          <div>
            <SectionTitle title="Clinical Workflow" />
            <nav className="space-y-1">
              {clinicalItems.map((item) => (
                <NavLink key={item.href} item={item} />
              ))}
            </nav>
          </div>
        )}

        {otherItems.length > 0 && (
          <div>
            <SectionTitle title="Management" />
            <nav className="space-y-1">
              {otherItems.map((item) => (
                <NavLink key={item.href} item={item} />
              ))}
            </nav>
          </div>
        )}

        <div className="mx-1 mt-8 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/20">
            <Pill className="h-5 w-5 text-primary" />
          </div>
          <h4 className="mt-3 text-sm font-semibold">Need Help?</h4>
          <p className="mt-1 text-xs text-muted-foreground">
            Contact IT support for assistance with the pharmacy system.
          </p>
          <Button size="sm" variant="secondary" className="mt-3 w-full rounded-xl text-xs">
            Get Support
          </Button>
        </div>
      </div>
    </ScrollArea>
  )

  return (
    <>
      <aside className="hidden md:flex h-screen w-64 flex-col border-r border-sidebar-border bg-sidebar">
        {sidebarContent}
      </aside>

      {isOpen && <div className="fixed inset-0 z-40 bg-black/50 md:hidden" onClick={onClose} />}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-72 transform bg-sidebar shadow-xl transition-transform duration-300 ease-in-out md:hidden',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-16 items-center justify-between border-b px-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/70">
              <svg viewBox="0 0 24 24" className="h-5 w-5 text-white" fill="currentColor">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10h-4v4h-2v-4H7v-2h4V7h2v4h4v2z" />
              </svg>
            </div>
            <span className="font-bold">PharmaFlow</span>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-xl">
            <X className="h-5 w-5" />
          </Button>
        </div>
        {sidebarContent}
      </aside>
    </>
  )
}
