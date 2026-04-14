'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { deliveryAssignmentsApi } from '@/lib/api'
import { useAuth } from '@/lib/auth-context'

export default function DeliveryAssignmentsPage() {
  const { user } = useAuth()
  const [assignments, setAssignments] = useState<any[]>([])
  const [form, setForm] = useState({ prescriptionId: 0, assignedStaffId: 0, building: '', deliveryLocation: '', notes: '' })
  const [receiverName, setReceiverName] = useState('')

  const load = async () => setAssignments(await deliveryAssignmentsApi.getAll() as any[])
  useEffect(() => { load() }, [])

  const isPharmacist = user?.role === 'pharmacist'
  const isNurse = user?.role === 'nurse'

  const assign = async () => {
    await deliveryAssignmentsApi.create({ ...form, prescriptionId: Number(form.prescriptionId), assignedStaffId: Number(form.assignedStaffId) })
    await load()
  }

  const markDelivered = async (id: number) => {
    await deliveryAssignmentsApi.markDelivered(id, receiverName)
    setReceiverName('')
    await load()
  }

  return (
    <div className='space-y-4'>
      <h1 className='text-2xl font-bold'>Medication Delivery Management</h1>

      {isPharmacist && (
        <Card>
          <CardHeader><CardTitle>Pharmacist: Assign Delivery Person</CardTitle></CardHeader>
          <CardContent className='grid gap-2 md:grid-cols-3'>
            <div><Label>Prescription ID</Label><Input value={form.prescriptionId} onChange={(e) => setForm({ ...form, prescriptionId: Number(e.target.value) })} /></div>
            <div><Label>Delivery Staff User ID</Label><Input value={form.assignedStaffId} onChange={(e) => setForm({ ...form, assignedStaffId: Number(e.target.value) })} /></div>
            <div><Label>Building</Label><Input value={form.building} onChange={(e) => setForm({ ...form, building: e.target.value })} /></div>
            <div><Label>Location</Label><Input value={form.deliveryLocation} onChange={(e) => setForm({ ...form, deliveryLocation: e.target.value })} /></div>
            <div className='md:col-span-2'><Label>Notes</Label><Input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
            <div className='md:col-span-3'><Button onClick={assign}>Assign Delivery</Button></div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle>Assignments</CardTitle></CardHeader>
        <CardContent className='space-y-2'>
          {assignments.map((a) => (
            <div key={a.id} className='rounded border p-2 text-sm'>
              #{a.id} | Rx {a.prescription_number} | Patient: {a.patient_name} | Staff: {a.assigned_staff_name} | Building: {a.building} | Status: {a.status}
              {isNurse && a.status !== 'delivered' && (
                <div className='mt-2 flex gap-2'>
                  <Input placeholder='Receiver name' value={receiverName} onChange={(e) => setReceiverName(e.target.value)} />
                  <Button onClick={() => markDelivered(a.id)}>Nurse Mark Delivered</Button>
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
