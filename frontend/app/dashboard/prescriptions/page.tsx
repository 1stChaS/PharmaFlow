'use client'

import { useEffect, useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  ClipboardPlus,
  UserRound,
  Pill,
  Plus,
  Trash2,
  Eye,
  AlertTriangle,
  Send,
} from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { mockPatients, mockDrugs } from '@/lib/mock-data'
import { Patient } from '@/lib/types'
import { StatusBadge, PriorityBadge } from '@/components/pharmacy/status-badge'
import { cn } from '@/lib/utils'

interface PrescriptionItemForm {
  id: string
  drugId: string
  quantity: string
  dosageInstructions: string
  duration: string
}

// Mock prescription data for display
const mockPrescriptions = [
  {
    id: 1, prescription_number: 'PRX-2026-000001', patient_name: 'Somchai Prasert',
    patient_id: 1, prescribed_by_name: 'Dr. Emily Williams', status: 'pending',
    priority: 'high', diagnosis: 'Suspected unstable angina', created_at: '2024-06-15 09:00:00',
    items: [
      { drug_name: 'Amlodipine 5mg', quantity: 14, dosage_instructions: 'Take 1 tablet daily' },
      { drug_name: 'Aspirin 75mg', quantity: 14, dosage_instructions: 'Take 1 tablet daily' },
    ],
  },
  {
    id: 2, prescription_number: 'PRX-2026-000002', patient_name: 'Suda Kanchana',
    patient_id: 2, prescribed_by_name: 'Dr. James Brown', status: 'pending',
    priority: 'normal', diagnosis: 'Glycemic control adjustment', created_at: '2024-06-16 10:00:00',
    items: [
      { drug_name: 'Metformin 500mg', quantity: 30, dosage_instructions: 'Take 1 tablet twice daily' },
    ],
  },
]

export default function PrescriptionsPage() {
  const { user } = useAuth()
  const [showPrescribeForm, setShowPrescribeForm] = useState(false)
  const [selectedPrescription, setSelectedPrescription] = useState<typeof mockPrescriptions[0] | null>(null)

  const isDoctor = user?.role === 'doctor'

  // Only show patients assigned to this doctor
  const myPatients = useMemo(() => {
    if (!isDoctor || !user?.id) return []
    return mockPatients.filter(p => p.assigned_doctor_id === user.id)
  }, [isDoctor, user])

  const [form, setForm] = useState({
    patientId: '',
    priority: 'normal',
    diagnosis: '',
    notes: '',
  })
  const [items, setItems] = useState<PrescriptionItemForm[]>([
    { id: '1', drugId: '', quantity: '1', dosageInstructions: '', duration: '' },
  ])

  const addItem = () => {
    setItems([...items, { id: Date.now().toString(), drugId: '', quantity: '1', dosageInstructions: '', duration: '' }])
  }
  const removeItem = (id: string) => {
    if (items.length > 1) setItems(items.filter(i => i.id !== id))
  }

  const handleSubmit = () => {
    // In real app, call prescriptionsApi.create(...)
    setShowPrescribeForm(false)
    setForm({ patientId: '', priority: 'normal', diagnosis: '', notes: '' })
    setItems([{ id: '1', drugId: '', quantity: '1', dosageInstructions: '', duration: '' }])
  }

  const selectedPatient = myPatients.find(p => p.id === Number(form.patientId))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Prescriptions</h1>
          <p className="text-muted-foreground">
            {isDoctor ? 'Create and manage prescriptions for your patients' : 'View prescriptions and medication orders'}
          </p>
        </div>
        {isDoctor && (
          <Button className="rounded-xl shadow-md" onClick={() => setShowPrescribeForm(true)}>
            <ClipboardPlus className="mr-2 h-4 w-4" />
            New Prescription
          </Button>
        )}
      </div>

      {/* Info for non-doctors */}
      {!isDoctor && (
        <Card className="rounded-2xl border-primary/20 bg-primary/5">
          <CardContent className="p-4 flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-primary" />
            <p className="text-sm">Only doctors can create prescriptions for their assigned patients.</p>
          </CardContent>
        </Card>
      )}

      {/* Prescription List */}
      <Card className="rounded-2xl border-border/50 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Prescription History</CardTitle>
          <CardDescription>All prescriptions in the system</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {mockPrescriptions.map((prx) => (
            <div
              key={prx.id}
              className="group rounded-2xl border border-border/50 bg-card p-4 transition-all hover:shadow-md cursor-pointer"
              onClick={() => setSelectedPrescription(prx)}
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                    <ClipboardPlus className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold">{prx.patient_name}</h3>
                      <Badge variant="outline" className="rounded-lg text-xs">{prx.prescription_number}</Badge>
                      <StatusBadge status={prx.status as any} size="sm" />
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {prx.prescribed_by_name} · {prx.diagnosis}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <PriorityBadge priority={prx.priority as any} />
                  <Button variant="ghost" size="sm" className="rounded-lg">
                    <Eye className="mr-1.5 h-4 w-4" />
                    Details
                  </Button>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {prx.items.map((item, idx) => (
                  <Badge key={idx} variant="secondary" className="rounded-lg font-normal">
                    {item.drug_name} x{item.quantity}
                  </Badge>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* View Prescription Detail */}
      <Dialog open={!!selectedPrescription} onOpenChange={() => setSelectedPrescription(null)}>
        <DialogContent className="rounded-2xl max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedPrescription?.prescription_number}</DialogTitle>
            <DialogDescription>Prescription details</DialogDescription>
          </DialogHeader>
          {selectedPrescription && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-xl bg-muted/50 p-3">
                  <p className="text-xs text-muted-foreground">Patient</p>
                  <p className="font-medium">{selectedPrescription.patient_name}</p>
                </div>
                <div className="rounded-xl bg-muted/50 p-3">
                  <p className="text-xs text-muted-foreground">Prescribed By</p>
                  <p className="font-medium">{selectedPrescription.prescribed_by_name}</p>
                </div>
                <div className="rounded-xl bg-muted/50 p-3">
                  <p className="text-xs text-muted-foreground">Diagnosis</p>
                  <p className="font-medium">{selectedPrescription.diagnosis}</p>
                </div>
                <div className="rounded-xl bg-muted/50 p-3">
                  <p className="text-xs text-muted-foreground">Priority</p>
                  <PriorityBadge priority={selectedPrescription.priority as any} />
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-3">Medications</h4>
                <div className="space-y-2">
                  {selectedPrescription.items.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between rounded-xl border border-border/50 bg-card p-3">
                      <div>
                        <p className="font-medium">{item.drug_name}</p>
                        <p className="text-xs text-muted-foreground">{item.dosage_instructions}</p>
                      </div>
                      <p className="font-semibold">{item.quantity} units</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* New Prescription Dialog (Doctor only) */}
      <Dialog open={showPrescribeForm} onOpenChange={setShowPrescribeForm}>
        <DialogContent className="rounded-2xl max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <ClipboardPlus className="h-5 w-5 text-primary" />
              </div>
              New Prescription
            </DialogTitle>
            <DialogDescription>
              Prescribe medication for your assigned patients only
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Patient Selection */}
            <div>
              <h4 className="font-semibold mb-3 text-sm uppercase tracking-wide text-muted-foreground">Patient</h4>
              <div className="space-y-2">
                <Label>Select Patient (assigned to you) *</Label>
                <Select value={form.patientId} onValueChange={(v) => setForm({ ...form, patientId: v })}>
                  <SelectTrigger className="rounded-xl h-11">
                    <SelectValue placeholder="Select one of your assigned patients" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {myPatients.length === 0 ? (
                      <div className="p-3 text-sm text-muted-foreground text-center">No patients assigned to you</div>
                    ) : (
                      myPatients.map((p) => (
                        <SelectItem key={p.id} value={String(p.id)}>
                          {p.full_name} ({p.patient_number}) - {p.building} {p.room_number}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Patient Preview */}
              {selectedPatient && (
                <div className="mt-3 rounded-xl bg-muted/50 p-4 space-y-1">
                  <p className="font-semibold">{selectedPatient.full_name}</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedPatient.age} yrs / {selectedPatient.gender} · BP: {selectedPatient.blood_pressure} · BMI: {selectedPatient.bmi}
                  </p>
                  {selectedPatient.allergies && selectedPatient.allergies !== 'None' && (
                    <p className="text-sm text-orange-600 flex items-center gap-1">
                      <AlertTriangle className="h-3.5 w-3.5" /> Allergies: {selectedPatient.allergies}
                    </p>
                  )}
                  <p className="text-sm text-muted-foreground">CC: {selectedPatient.chief_complaint}</p>
                </div>
              )}
            </div>

            {/* Prescription Details */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Priority *</Label>
                <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v })}>
                  <SelectTrigger className="rounded-xl h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Diagnosis *</Label>
                <Input
                  value={form.diagnosis}
                  onChange={(e) => setForm({ ...form, diagnosis: e.target.value })}
                  className="rounded-xl h-11"
                  placeholder="Clinical diagnosis"
                />
              </div>
              <div className="sm:col-span-2 space-y-2">
                <Label>Notes</Label>
                <Textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className="rounded-xl min-h-16"
                  placeholder="Additional notes..."
                />
              </div>
            </div>

            {/* Medication Items */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">Medications</h4>
                <Button type="button" variant="outline" size="sm" className="rounded-xl" onClick={addItem}>
                  <Plus className="mr-1.5 h-4 w-4" />
                  Add Medication
                </Button>
              </div>
              <div className="space-y-4">
                {items.map((item, index) => (
                  <div key={item.id} className="rounded-xl border border-border/50 bg-muted/30 p-4">
                    <div className="flex items-start justify-between mb-3">
                      <Badge variant="outline" className="rounded-lg">Item {index + 1}</Badge>
                      {items.length > 1 && (
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-muted-foreground hover:text-destructive" onClick={() => removeItem(item.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Drug *</Label>
                        <Select value={item.drugId} onValueChange={(v) => setItems(items.map(i => i.id === item.id ? { ...i, drugId: v } : i))}>
                          <SelectTrigger className="rounded-xl h-11">
                            <SelectValue placeholder="Select drug" />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl max-h-60">
                            {mockDrugs.filter(d => d.stockStatus !== 'out_of_stock').map((drug) => (
                              <SelectItem key={drug.id} value={String(drug.id)}>
                                {drug.drug_name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Quantity *</Label>
                        <Input type="number" min="1" value={item.quantity} onChange={(e) => setItems(items.map(i => i.id === item.id ? { ...i, quantity: e.target.value } : i))} className="rounded-xl h-11" />
                      </div>
                      <div className="space-y-2">
                        <Label>Dosage Instructions *</Label>
                        <Input value={item.dosageInstructions} onChange={(e) => setItems(items.map(i => i.id === item.id ? { ...i, dosageInstructions: e.target.value } : i))} className="rounded-xl h-11" placeholder="e.g., Take 1 tablet 3 times daily" />
                      </div>
                      <div className="space-y-2">
                        <Label>Duration</Label>
                        <Input value={item.duration} onChange={(e) => setItems(items.map(i => i.id === item.id ? { ...i, duration: e.target.value } : i))} className="rounded-xl h-11" placeholder="e.g., 7 days" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" className="rounded-xl" onClick={() => setShowPrescribeForm(false)}>
              Cancel
            </Button>
            <Button
              className="rounded-xl"
              onClick={handleSubmit}
              disabled={!form.patientId || !form.diagnosis || items.some(i => !i.drugId || !i.dosageInstructions)}
            >
              <Send className="mr-2 h-4 w-4" />
              Submit Prescription
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
