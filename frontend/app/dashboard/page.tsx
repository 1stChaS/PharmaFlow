'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  Activity,
  ClipboardList,
  Package,
  Stethoscope,
  Truck,
  UserRound,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/lib/auth-context'
import { StatCard } from '@/components/pharmacy/stat-card'
import { getWorkflowPrescriptionRequests } from '@/lib/prescription-workflow'

type WorkflowRequest = {
  id: string
  requestNumber: string
  patientName: string
  createdAt: string
  status: 'submitted_to_doctor' | 'prescribed' | 'dispatched' | 'received_complete'
  diagnosis?: string
  prescribedByName?: string
  dispatchedByName?: string
  receivedByName?: string
  items: Array<{
    id: string
    medicationName: string
    dosage: string
    frequency: string
    duration: string
    quantity: number
    notes?: string
  }>
}

function getStatusLabel(status: WorkflowRequest['status']) {
  switch (status) {
    case 'submitted_to_doctor':
      return 'Waiting Doctor'
    case 'prescribed':
      return 'Prescribed'
    case 'dispatched':
      return 'Dispatched'
    case 'received_complete':
      return 'Completed'
    default:
      return status
  }
}

function getStatusBadgeClass(status: WorkflowRequest['status']) {
  switch (status) {
    case 'submitted_to_doctor':
      return 'bg-amber-100 text-amber-700 border-amber-200'
    case 'prescribed':
      return 'bg-blue-100 text-blue-700 border-blue-200'
    case 'dispatched':
      return 'bg-purple-100 text-purple-700 border-purple-200'
    case 'received_complete':
      return 'bg-green-100 text-green-700 border-green-200'
    default:
      return 'bg-muted text-muted-foreground border-border'
  }
}

export default function DashboardPage() {
  const { user } = useAuth()
  const [requests, setRequests] = useState<WorkflowRequest[]>([])

  useEffect(() => {
    const load = () => {
      setRequests(getWorkflowPrescriptionRequests() as WorkflowRequest[])
    }

    load()
    window.addEventListener('storage', load)

    return () => window.removeEventListener('storage', load)
  }, [])

  const role = user?.role

  const doctorStats = useMemo(() => {
    const waitingDoctor = requests.filter((r) => r.status === 'submitted_to_doctor').length
    const prescribed = requests.filter((r) => r.status === 'prescribed').length
    const dispatched = requests.filter((r) => r.status === 'dispatched').length
    const completed = requests.filter((r) => r.status === 'received_complete').length

    return { waitingDoctor, prescribed, dispatched, completed }
  }, [requests])

  const nurseStats = useMemo(() => {
    const submitted = requests.filter((r) => r.status === 'submitted_to_doctor').length
    const prescribed = requests.filter((r) => r.status === 'prescribed').length
    const dispatched = requests.filter((r) => r.status === 'dispatched').length
    const completed = requests.filter((r) => r.status === 'received_complete').length

    return { submitted, prescribed, dispatched, completed }
  }, [requests])

  const pharmacistStats = useMemo(() => {
    const ready = requests.filter((r) => r.status === 'prescribed').length
    const dispatched = requests.filter((r) => r.status === 'dispatched').length
    const completed = requests.filter((r) => r.status === 'received_complete').length
    const totalItems = requests.reduce((sum, r) => sum + r.items.length, 0)

    return { ready, dispatched, completed, totalItems }
  }, [requests])

  const recentRequests = useMemo(() => requests.slice(0, 5), [requests])

  const renderStats = () => {
    if (role === 'doctor') {
      return (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Waiting Review"
            value={doctorStats.waitingDoctor}
            subtitle="Cases from nurse"
            icon={Stethoscope}
            variant="warning"
          />
          <StatCard
            title="Prescribed"
            value={doctorStats.prescribed}
            subtitle="Ready for pharmacist"
            icon={ClipboardList}
            variant="info"
          />
          <StatCard
            title="Dispatched"
            value={doctorStats.dispatched}
            subtitle="Sent by pharmacist"
            icon={Truck}
            variant="default"
          />
          <StatCard
            title="Completed"
            value={doctorStats.completed}
            subtitle="Received by nurse"
            icon={CheckCircle2}
            variant="success"
          />
        </div>
      )
    }

    if (role === 'nurse') {
      return (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Submitted Cases"
            value={nurseStats.submitted}
            subtitle="Waiting doctor"
            icon={UserRound}
            variant="warning"
          />
          <StatCard
            title="Prescribed"
            value={nurseStats.prescribed}
            subtitle="Doctor completed"
            icon={ClipboardList}
            variant="info"
          />
          <StatCard
            title="Dispatched"
            value={nurseStats.dispatched}
            subtitle="On the way"
            icon={Truck}
            variant="default"
          />
          <StatCard
            title="Completed"
            value={nurseStats.completed}
            subtitle="Received complete"
            icon={CheckCircle2}
            variant="success"
          />
        </div>
      )
    }

    if (role === 'pharmacist' || role === 'administrator') {
      return (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Ready to Dispatch"
            value={pharmacistStats.ready}
            subtitle="Prescribed by doctor"
            icon={ClipboardList}
            variant="info"
          />
          <StatCard
            title="Dispatched"
            value={pharmacistStats.dispatched}
            subtitle="Currently in delivery"
            icon={Truck}
            variant="default"
          />
          <StatCard
            title="Completed"
            value={pharmacistStats.completed}
            subtitle="Received by nurse"
            icon={CheckCircle2}
            variant="success"
          />
          <StatCard
            title="Medication Items"
            value={pharmacistStats.totalItems}
            subtitle="Across all requests"
            icon={Package}
            variant="primary"
          />
        </div>
      )
    }

    return (
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Requests"
          value={requests.length}
          subtitle="Workflow records"
          icon={Activity}
          variant="primary"
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome back, {user?.fullName || user?.username || 'User'}
        </h1>
        <p className="text-muted-foreground">
          Overview of your hospital pharmacy workflow and recent activity.
        </p>
      </div>

      {renderStats()}

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="rounded-2xl border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle>Recent Workflow Requests</CardTitle>
            <CardDescription>Latest nurse → doctor → pharmacist activity</CardDescription>
          </CardHeader>
          <CardContent>
            {recentRequests.length === 0 ? (
              <p className="text-sm text-muted-foreground">No workflow requests found.</p>
            ) : (
              <div className="space-y-3">
                {recentRequests.map((request) => (
                  <div key={request.id} className="rounded-xl border p-3">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="font-medium">{request.patientName}</div>
                      <Badge className={`rounded-lg border ${getStatusBadgeClass(request.status)}`}>
                        {getStatusLabel(request.status)}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {request.requestNumber}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(request.createdAt).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle>Quick Summary</CardTitle>
            <CardDescription>Role-based activity overview</CardDescription>
          </CardHeader>
          <CardContent>
            {requests.length === 0 ? (
              <div className="rounded-xl border border-dashed p-6 text-sm text-muted-foreground">
                No workflow data yet. Start by registering a patient and sending the case to doctor.
              </div>
            ) : (
              <div className="space-y-3">
                <div className="rounded-xl bg-amber-50 border border-amber-200 p-3">
                  <div className="font-medium text-amber-800">
                    Waiting Doctor: {requests.filter((r) => r.status === 'submitted_to_doctor').length}
                  </div>
                </div>
                <div className="rounded-xl bg-blue-50 border border-blue-200 p-3">
                  <div className="font-medium text-blue-800">
                    Prescribed: {requests.filter((r) => r.status === 'prescribed').length}
                  </div>
                </div>
                <div className="rounded-xl bg-purple-50 border border-purple-200 p-3">
                  <div className="font-medium text-purple-800">
                    Dispatched: {requests.filter((r) => r.status === 'dispatched').length}
                  </div>
                </div>
                <div className="rounded-xl bg-green-50 border border-green-200 p-3">
                  <div className="font-medium text-green-800">
                    Completed: {requests.filter((r) => r.status === 'received_complete').length}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {(role === 'doctor' || role === 'nurse') && (
        <Card className="rounded-2xl border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle>Attention Needed</CardTitle>
            <CardDescription>Items that may need your action</CardDescription>
          </CardHeader>
          <CardContent>
            {role === 'doctor' ? (
              requests.filter((r) => r.status === 'submitted_to_doctor').length === 0 ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  No pending doctor reviews right now.
                </div>
              ) : (
                <div className="flex items-center gap-2 text-sm text-amber-700">
                  <AlertTriangle className="h-4 w-4" />
                  You have {requests.filter((r) => r.status === 'submitted_to_doctor').length} case(s) waiting for prescription.
                </div>
              )
            ) : requests.filter((r) => r.status === 'dispatched').length === 0 ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                No dispatched deliveries waiting for nurse confirmation.
              </div>
            ) : (
              <div className="flex items-center gap-2 text-sm text-purple-700">
                <AlertTriangle className="h-4 w-4" />
                You have {requests.filter((r) => r.status === 'dispatched').length} delivery case(s) to confirm.
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
