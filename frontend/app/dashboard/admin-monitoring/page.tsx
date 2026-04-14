'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { reportsApi } from '@/lib/api'
import { useAuth } from '@/lib/auth-context'

export default function AdminMonitoringPage() {
  const { user } = useAuth()
  const [data, setData] = useState<{ distribution: { status: string; total: number }[]; roleSummary: { role: string; prescriptions: number }[] } | null>(null)

  useEffect(() => {
    reportsApi.getDistributionMonitoring().then(setData).catch(() => setData(null))
  }, [])

  if (user?.role !== 'administrator') {
    return <div className='text-sm text-muted-foreground'>Only administrators can view distribution monitoring reports.</div>
  }

  return (
    <div className='space-y-4'>
      <h1 className='text-2xl font-bold'>Administrator Monitoring & Reporting</h1>
      <Card>
        <CardHeader><CardTitle>Distribution Monitoring</CardTitle></CardHeader>
        <CardContent className='space-y-2'>
          {data?.distribution?.map((x) => <div key={x.status}>{x.status}: {x.total}</div>)}
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Role-wise Prescription Summary</CardTitle></CardHeader>
        <CardContent className='space-y-2'>
          {data?.roleSummary?.map((x) => <div key={x.role}>{x.role}: {x.prescriptions}</div>)}
        </CardContent>
      </Card>
    </div>
  )
}
