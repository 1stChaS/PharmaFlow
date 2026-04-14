'use client'

import { useEffect, useMemo, useState } from 'react'
import { ClipboardList, Send, UserRound } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { mockDrugs } from '@/lib/mock-data'
import { patientsApi, type Patient } from '@/lib/api'
import {
  addWorkflowPrescriptionRequest,
  getCompletedPatientIds,
  markPatientAsPrescribed,
} from '@/lib/prescription-workflow'

interface PrescriptionItemForm {
  id: string
  drugId: string
  drugName: string
  drugCode: string
  quantity: number
  dosageInstructions: string
  duration: string
  notes: string
}

const priorityOptions = [
  { value: 'low', label: 'Low', description: 'Can wait up to a week' },
  { value: 'normal', label: 'Normal', description: 'Within 2-3 days' },
  { value: 'high', label: 'High', description: 'Within 24 hours' },
  { value: 'urgent', label: 'Urgent', description: 'Immediate attention needed' },
] as const

const emptyItem = (): PrescriptionItemForm => ({
  id: crypto.randomUUID(),
  drugId: '',
  drugName: '',
  drugCode: '',
  quantity: 1,
  dosageInstructions: '',
  duration: '',
  notes: '',
})

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [completedPatientIds, setCompletedPatientIds] = useState<number[]>([])
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [submitSuccess, setSubmitSuccess] = useState('')

  const [formData, setFormData] = useState({
    priority: 'normal' as 'low' | 'normal' | 'high' | 'urgent',
    requiredByDate: new Date().toISOString().split('T')[0],
    diagnosis: '',
    notes: '',
  })
  const [items, setItems] = useState<PrescriptionItemForm[]>([emptyItem()])

  const availableDrugs = useMemo(
    () => mockDrugs.filter((d) => d.stockStatus !== 'out_of_stock'),
    []
  )

  const activePatients = useMemo(
    () => patients.filter((patient) => !completedPatientIds.includes(patient.id)),
    [patients, completedPatientIds]
  )

  const loadPatients = async () => {
    const allPatients = await patientsApi.getAll()
    setPatients(allPatients)
  }

  useEffect(() => {
    loadPatients()
    setCompletedPatientIds(getCompletedPatientIds())
  }, [])

  const resetForm = () => {
    setFormData({
      priority: 'normal',
      requiredByDate: new Date().toISOString().split('T')[0],
      diagnosis: '',
      notes: '',
    })
    setItems([emptyItem()])
  }

  const updateItem = (id: string, field: keyof PrescriptionItemForm, value: string | number) => {
    setItems((currentItems) =>
      currentItems.map((item) => {
        if (item.id !== id) return item

        if (field === 'drugId') {
          const drug = availableDrugs.find((d) => d.id.toString() === value)
          return {
            ...item,
            drugId: String(value),
            drugName: drug?.drug_name || '',
            drugCode: drug?.drug_code || '',
          }
        }

        return { ...item, [field]: value }
      })
    )
  }

  const addItem = () => setItems((currentItems) => [...currentItems, emptyItem()])

  const removeItem = (id: string) => {
    if (items.length === 1) return
    setItems((currentItems) => currentItems.filter((item) => item.id !== id))
  }

  const submitPrescription = async () => {
    if (!selectedPatient) return

    const hasValidItems = items.every(
      (item) => item.drugId && item.quantity > 0 && item.dosageInstructions.trim()
    )

    if (!hasValidItems || !formData.diagnosis.trim() || !formData.requiredByDate) {
      return
    }

    addWorkflowPrescriptionRequest({
      id: `WRK-${Date.now()}`,
      patientId: selectedPatient.id,
      patientName: selectedPatient.fullName,
      patientSnapshot: selectedPatient,
      createdAt: new Date().toISOString(),
      requiredByDate: formData.requiredByDate,
      priority: formData.priority,
      diagnosis: formData.diagnosis,
      notes: formData.notes,
      status: 'pending',
      items: items.map((item) => ({
        id: item.id,
        drugId: Number(item.drugId),
        drugName: item.drugName,
        drugCode: item.drugCode,
        quantity: item.quantity,
        dosageInstructions: item.dosageInstructions,
        duration: item.duration,
        notes: item.notes,
      })),
    })

    markPatientAsPrescribed(selectedPatient.id)
    setCompletedPatientIds((current) => [...current, selectedPatient.id])
    setSubmitSuccess(`Prescription submitted for ${selectedPatient.fullName}. Added to My Requests.`)
    setSelectedPatient(null)
    resetForm()
  }

  const isValidForm = Boolean(
    formData.diagnosis.trim() &&
      formData.requiredByDate &&
      items.every((item) => item.drugId && item.quantity > 0 && item.dosageInstructions.trim())
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Patients</h1>
        <p className="text-muted-foreground">Today&apos;s patients waiting for prescription review</p>
      </div>

      {submitSuccess && (
        <Card className="rounded-2xl border-success/30 bg-success/5">
          <CardContent className="py-3 text-sm text-success">{submitSuccess}</CardContent>
        </Card>
      )}

      <Card className="rounded-2xl border-border/50 shadow-sm">
        <CardHeader>
          <CardTitle>Today&apos;s Patients</CardTitle>
          <CardDescription>
            Click a patient name to view details and complete a prescription.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {activePatients.length === 0 ? (
            <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
              No pending patients for today. All reviewed patients are moved to My Requests.
            </div>
          ) : (
            <div className="rounded-xl border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Patient Name</TableHead>
                    <TableHead>Patient ID</TableHead>
                    <TableHead>Vitals</TableHead>
                    <TableHead>Conditions</TableHead>
                    <TableHead>Chief Complaint</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activePatients.map((patient) => (
                    <TableRow key={patient.id}>
                      <TableCell>
                        <button
                          onClick={() => {
                            setSelectedPatient(patient)
                            resetForm()
                          }}
                          className="font-semibold text-primary hover:underline"
                        >
                          {patient.fullName}
                        </button>
                      </TableCell>
                      <TableCell>{patient.patientNumber}</TableCell>
                      <TableCell>
                        Age {patient.age}, {patient.gender}, BP {patient.bloodPressure || '-'}
                      </TableCell>
                      <TableCell>{patient.underlyingConditions || '-'}</TableCell>
                      <TableCell>{patient.chiefComplaint}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selectedPatient} onOpenChange={() => setSelectedPatient(null)}>
        <DialogContent className="max-w-4xl rounded-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <UserRound className="h-5 w-5 text-primary" />
              </div>
              {selectedPatient?.fullName}
            </DialogTitle>
            <DialogDescription>
              Review patient profile and submit prescription
            </DialogDescription>
          </DialogHeader>

          {selectedPatient && (
            <div className="space-y-5">
              <Card className="rounded-2xl border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg">Patient Clinical Summary</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 text-sm">
                  <div className="rounded-xl bg-muted/50 p-3">
                    <p className="text-xs text-muted-foreground">Patient Number</p>
                    <p className="font-medium">{selectedPatient.patientNumber}</p>
                  </div>
                  <div className="rounded-xl bg-muted/50 p-3">
                    <p className="text-xs text-muted-foreground">Age / Gender</p>
                    <p className="font-medium">{selectedPatient.age} / {selectedPatient.gender}</p>
                  </div>
                  <div className="rounded-xl bg-muted/50 p-3">
                    <p className="text-xs text-muted-foreground">Weight / Height</p>
                    <p className="font-medium">{selectedPatient.weight || '-'} kg / {selectedPatient.height || '-'} cm</p>
                  </div>
                  <div className="rounded-xl bg-muted/50 p-3">
                    <p className="text-xs text-muted-foreground">Blood Pressure</p>
                    <p className="font-medium">{selectedPatient.bloodPressure || '-'}</p>
                  </div>
                  <div className="rounded-xl bg-muted/50 p-3">
                    <p className="text-xs text-muted-foreground">BMI</p>
                    <p className="font-medium">{selectedPatient.bmi || '-'}</p>
                  </div>
                  <div className="rounded-xl bg-muted/50 p-3">
                    <p className="text-xs text-muted-foreground">Location</p>
                    <p className="font-medium">{selectedPatient.building} {selectedPatient.roomNumber ? `- Room ${selectedPatient.roomNumber}` : ''}</p>
                  </div>
                  <div className="rounded-xl bg-muted/50 p-3 sm:col-span-2 lg:col-span-3">
                    <p className="text-xs text-muted-foreground">Medical Conditions</p>
                    <p className="font-medium">{selectedPatient.underlyingConditions || '-'}</p>
                  </div>
                  <div className="rounded-xl bg-muted/50 p-3 sm:col-span-2 lg:col-span-3">
                    <p className="text-xs text-muted-foreground">Allergies / Chief Complaint</p>
                    <p className="font-medium">Allergies: {selectedPatient.allergies || '-'}</p>
                    <p className="font-medium">CC: {selectedPatient.chiefComplaint || '-'}</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-2xl border-border/50 shadow-sm">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                      <ClipboardList className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Prescription Form</CardTitle>
                      <CardDescription>Reuse of Request Drug workflow inside patient popup</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="requiredByDate">Required By Date *</Label>
                      <Input
                        id="requiredByDate"
                        type="date"
                        value={formData.requiredByDate}
                        onChange={(e) => setFormData({ ...formData, requiredByDate: e.target.value })}
                        className="rounded-xl h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Priority Level</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {priorityOptions.map((option) => (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => setFormData({ ...formData, priority: option.value })}
                            className={`rounded-xl border p-2 text-left transition-all ${
                              formData.priority === option.value
                                ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                                : 'border-border/50 hover:border-border hover:bg-muted/30'
                            }`}
                          >
                            <p className="font-medium text-xs">{option.label}</p>
                            <p className="text-[11px] text-muted-foreground">{option.description}</p>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="diagnosis">Diagnosis *</Label>
                    <Input
                      id="diagnosis"
                      value={formData.diagnosis}
                      onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                      className="rounded-xl h-11"
                      placeholder="Primary diagnosis"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="prescriptionNotes">Clinical Notes</Label>
                    <Textarea
                      id="prescriptionNotes"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      className="rounded-xl min-h-20 resize-none"
                      placeholder="Additional notes for pharmacist"
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold">Prescription Items</h4>
                      <Button type="button" variant="outline" size="sm" className="rounded-xl" onClick={addItem}>
                        Add Item
                      </Button>
                    </div>

                    {items.map((item, index) => (
                      <div key={item.id} className="rounded-xl border border-border/50 bg-muted/30 p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <Badge variant="outline" className="rounded-lg">Item {index + 1}</Badge>
                          {items.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="rounded-lg"
                              onClick={() => removeItem(item.id)}
                            >
                              Remove
                            </Button>
                          )}
                        </div>

                        <div className="grid gap-3 sm:grid-cols-3">
                          <div className="sm:col-span-2 space-y-2">
                            <Label>Drug *</Label>
                            <Select
                              value={item.drugId}
                              onValueChange={(value) => updateItem(item.id, 'drugId', value)}
                            >
                              <SelectTrigger className="rounded-xl h-11">
                                <SelectValue placeholder="Select a drug" />
                              </SelectTrigger>
                              <SelectContent className="rounded-xl">
                                {availableDrugs.map((drug) => (
                                  <SelectItem key={drug.id} value={drug.id.toString()}>
                                    {drug.drug_name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Quantity *</Label>
                            <Input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => updateItem(item.id, 'quantity', Number(e.target.value) || 1)}
                              className="rounded-xl h-11"
                            />
                          </div>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2">
                          <div className="space-y-2">
                            <Label>Dosage Instructions *</Label>
                            <Input
                              value={item.dosageInstructions}
                              onChange={(e) => updateItem(item.id, 'dosageInstructions', e.target.value)}
                              className="rounded-xl h-11"
                              placeholder="e.g. 1 tablet twice daily"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Duration</Label>
                            <Input
                              value={item.duration}
                              onChange={(e) => updateItem(item.id, 'duration', e.target.value)}
                              className="rounded-xl h-11"
                              placeholder="e.g. 7 days"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label>Item Notes</Label>
                          <Textarea
                            value={item.notes}
                            onChange={(e) => updateItem(item.id, 'notes', e.target.value)}
                            className="rounded-xl min-h-16 resize-none"
                            placeholder="Optional"
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-end">
                    <Button
                      type="button"
                      className="rounded-xl min-w-48"
                      disabled={!isValidForm}
                      onClick={submitPrescription}
                    >
                      <Send className="mr-2 h-4 w-4" />
                      Submit Prescription
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
