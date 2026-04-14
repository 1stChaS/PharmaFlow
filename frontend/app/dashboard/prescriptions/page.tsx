'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { patientsApi, prescriptionsApi, type Patient } from '@/lib/api'
import { useAuth } from '@/lib/auth-context'

export default function PrescriptionsPage() {
  const { user } = useAuth()
  const [patients, setPatients] = useState<Patient[]>([])
  const [prescriptions, setPrescriptions] = useState<any[]>([])
  const [form, setForm] = useState({ patientId: 0, priority: 'normal', diagnosis: '', notes: '', drugId: 1, quantity: 1, dosageInstructions: '' })

  const load = async () => {
    setPatients(await patientsApi.getAll())
    setPrescriptions(await prescriptionsApi.getAll() as any[])
  }

  useEffect(() => { load() }, [])

  const isDoctor = user?.role === 'doctor'

  const submit = async () => {
    await prescriptionsApi.create({
      patientId: Number(form.patientId),
      priority: form.priority as 'low' | 'normal' | 'high' | 'urgent',
      diagnosis: form.diagnosis,
      notes: form.notes,
      items: [{ drugId: Number(form.drugId), quantity: Number(form.quantity), dosageInstructions: form.dosageInstructions }],
    })
    await load()
  }

  return (
    <div className='space-y-4'>
      <h1 className='text-2xl font-bold'>Prescriptions</h1>
      {isDoctor && (
        <Card>
          <CardHeader><CardTitle>Doctor Medication Prescription</CardTitle></CardHeader>
          <CardContent className='grid gap-2 md:grid-cols-3'>
            <div><Label>Patient ID</Label><Input value={form.patientId} onChange={(e) => setForm({ ...form, patientId: Number(e.target.value) })} /></div>
            <div><Label>Priority</Label><Input value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })} /></div>
            <div><Label>Drug ID</Label><Input value={form.drugId} onChange={(e) => setForm({ ...form, drugId: Number(e.target.value) })} /></div>
            <div><Label>Quantity</Label><Input value={form.quantity} onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })} /></div>
            <div><Label>Dosage Instructions</Label><Input value={form.dosageInstructions} onChange={(e) => setForm({ ...form, dosageInstructions: e.target.value })} /></div>
            <div><Label>Diagnosis</Label><Input value={form.diagnosis} onChange={(e) => setForm({ ...form, diagnosis: e.target.value })} /></div>
            <div className='md:col-span-3'><Label>Notes</Label><Input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
            <div className='md:col-span-3'><Button onClick={submit}>Prescribe to Pharmacist Queue</Button></div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle>Patient Details for Medication Review</CardTitle></CardHeader>
        <CardContent className='space-y-2'>
          {patients.slice(0, 5).map((p) => (
            <div key={p.id} className='rounded border p-2 text-sm'>
              {p.fullName} | Age {p.age} | BP {p.bloodPressure} | BMI {p.bmi} | Allergies: {p.allergies || '-'} | CC: {p.chiefComplaint}
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Prescription List</CardTitle></CardHeader>
        <CardContent className='space-y-2'>
          {prescriptions.map((p) => <div key={p.id} className='rounded border p-2 text-sm'>{p.prescription_number} - Patient: {p.patient_name} - Status: {p.status}</div>)}
        </CardContent>
      </Card>
    </div>
  )
}
