'use client'

import { useMemo, useState } from 'react'
import { ClipboardPlus, Send, Trash2 } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import type { PrescriptionItem, WorkflowPrescriptionRequest } from '@/lib/types'
import {
  getWorkflowPrescriptionRequests,
  updateWorkflowPrescriptionRequest,
} from '@/lib/prescription-workflow'

function getStatusBadge(status: WorkflowPrescriptionRequest['status']) {
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
      return 'bg-muted text-muted-foreground'
  }
}

function getStatusLabel(status: WorkflowPrescriptionRequest['status']) {
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

type ItemForm = PrescriptionItem

const emptyItem = (): ItemForm => ({
  id: crypto.randomUUID(),
  medicationName: '',
  dosage: '',
  frequency: '',
  duration: '',
  quantity: 1,
  notes: '',
})

export default function PrescriptionsPage() {
  const { user } = useAuth()
  const [requests, setRequests] = useState<WorkflowPrescriptionRequest[]>(getWorkflowPrescriptionRequests())
  const [selectedRequest, setSelectedRequest] = useState<WorkflowPrescriptionRequest | null>(null)
  const [diagnosis, setDiagnosis] = useState('')
  const [doctorNotes, setDoctorNotes] = useState('')
  const [items, setItems] = useState<ItemForm[]>([emptyItem()])

  const isDoctor = user?.role === 'doctor'

  const doctorQueue = useMemo(() => {
    return requests.filter(
      (request) => request.status === 'submitted_to_doctor' || request.status === 'prescribed'
    )
  }, [requests])

  const openPrescriptionDialog = (request: WorkflowPrescriptionRequest) => {
    setSelectedRequest(request)
    setDiagnosis(request.diagnosis || '')
    setDoctorNotes(request.doctorNotes || '')
    setItems(request.items.length > 0 ? request.items : [emptyItem()])
  }

  const reload = () => {
    setRequests(getWorkflowPrescriptionRequests())
  }

  const updateItem = (id: string, field: keyof ItemForm, value: string | number) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, [field]: value } : item)))
  }

  const addItem = () => setItems((prev) => [...prev, emptyItem()])

  const removeItem = (id: string) => {
    if (items.length === 1) return
    setItems((prev) => prev.filter((item) => item.id !== id))
  }

  const handleSubmitPrescription = () => {
    if (!selectedRequest) return
    if (!diagnosis.trim()) return
    if (
      items.some(
        (item) =>
          !item.medicationName.trim() ||
          !item.dosage.trim() ||
          !item.frequency.trim() ||
          item.quantity <= 0
      )
    ) {
      return
    }

    updateWorkflowPrescriptionRequest(selectedRequest.id, (request) => ({
      ...request,
      status: 'prescribed',
      diagnosis: diagnosis.trim(),
      doctorNotes: doctorNotes.trim(),
      items: items.map((item) => ({
        ...item,
        medicationName: item.medicationName.trim(),
        dosage: item.dosage.trim(),
        frequency: item.frequency.trim(),
        duration: item.duration.trim(),
        notes: item.notes?.trim(),
      })),
      prescribedById: user?.id,
      prescribedByName: user?.fullName,
      prescribedAt: new Date().toISOString(),
    }))

    setSelectedRequest(null)
    reload()
  }

  if (!isDoctor) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Prescriptions</h1>
          <p className="text-muted-foreground">Only doctors can prescribe medications.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Prescriptions</h1>
        <p className="text-muted-foreground">
          Review nurse-submitted patient cases and prescribe medication for pharmacist processing.
        </p>
      </div>

      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle>Doctor Queue</CardTitle>
          <CardDescription>
            Cases sent by nurse, ready for doctor review and prescription.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {doctorQueue.length === 0 ? (
            <div className="rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">
              No cases waiting for doctor review.
            </div>
          ) : (
            doctorQueue.map((request) => (
              <div key={request.id} className="rounded-2xl border border-border/50 p-4 hover:shadow-sm">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold">{request.patientName}</h3>
                      <Badge variant="outline" className="rounded-lg">
                        {request.requestNumber}
                      </Badge>
                      <Badge className={`rounded-lg border ${getStatusBadge(request.status)}`}>
                        {getStatusLabel(request.status)}
                      </Badge>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      CC: {request.patientSnapshot.chiefComplaint}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Allergies: {request.patientSnapshot.drugAllergies || '-'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Medication details: {request.patientSnapshot.medicationDetails || '-'}
                    </p>
                  </div>

                  <Button className="rounded-xl" onClick={() => openPrescriptionDialog(request)}>
                    <ClipboardPlus className="mr-2 h-4 w-4" />
                    {request.status === 'prescribed' ? 'Update Prescription' : 'Prescribe'}
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
        <DialogContent className="rounded-2xl max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Prescription Form</DialogTitle>
            <DialogDescription>
              Review patient information before sending prescription to pharmacist workflow.
            </DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-5">
              <Card className="rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-lg">Patient Clinical Summary</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 text-sm">
                  <div className="rounded-xl bg-muted/40 p-3">
                    <p className="text-xs text-muted-foreground">Patient Number</p>
                    <p className="font-medium">{selectedRequest.patientSnapshot.patientNumber}</p>
                  </div>
                  <div className="rounded-xl bg-muted/40 p-3">
                    <p className="text-xs text-muted-foreground">Age / Gender</p>
                    <p className="font-medium">
                      {selectedRequest.patientSnapshot.age} / {selectedRequest.patientSnapshot.gender}
                    </p>
                  </div>
                  <div className="rounded-xl bg-muted/40 p-3">
                    <p className="text-xs text-muted-foreground">Weight / Height / BMI</p>
                    <p className="font-medium">
                      {selectedRequest.patientSnapshot.weight} kg / {selectedRequest.patientSnapshot.height} cm / {selectedRequest.patientSnapshot.bmi}
                    </p>
                  </div>
                  <div className="rounded-xl bg-muted/40 p-3">
                    <p className="text-xs text-muted-foreground">Blood Pressure</p>
                    <p className="font-medium">{selectedRequest.patientSnapshot.bloodPressure || '-'}</p>
                  </div>
                  <div className="rounded-xl bg-muted/40 p-3 sm:col-span-2">
                    <p className="text-xs text-muted-foreground">Chronic Diseases</p>
                    <p className="font-medium">{selectedRequest.patientSnapshot.chronicDiseases || '-'}</p>
                  </div>
                  <div className="rounded-xl bg-muted/40 p-3 sm:col-span-2 lg:col-span-3">
                    <p className="text-xs text-muted-foreground">Drug Allergies</p>
                    <p className="font-medium">{selectedRequest.patientSnapshot.drugAllergies || '-'}</p>
                  </div>
                  <div className="rounded-xl bg-muted/40 p-3 sm:col-span-2 lg:col-span-3">
                    <p className="text-xs text-muted-foreground">Chief Complaint</p>
                    <p className="font-medium">{selectedRequest.patientSnapshot.chiefComplaint || '-'}</p>
                  </div>
                  <div className="rounded-xl bg-muted/40 p-3 sm:col-span-2 lg:col-span-3">
                    <p className="text-xs text-muted-foreground">Medication Details</p>
                    <p className="font-medium">{selectedRequest.patientSnapshot.medicationDetails || '-'}</p>
                  </div>
                  {selectedRequest.nurseNotes && (
                    <div className="rounded-xl bg-muted/40 p-3 sm:col-span-2 lg:col-span-3">
                      <p className="text-xs text-muted-foreground">Nurse Notes</p>
                      <p className="font-medium">{selectedRequest.nurseNotes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-lg">Doctor Prescription</CardTitle>
                  <CardDescription>
                    Enter diagnosis and medication instructions.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Diagnosis *</Label>
                    <Input
                      value={diagnosis}
                      onChange={(e) => setDiagnosis(e.target.value)}
                      className="rounded-xl"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Doctor Notes</Label>
                    <Textarea
                      value={doctorNotes}
                      onChange={(e) => setDoctorNotes(e.target.value)}
                      className="rounded-xl min-h-24"
                      placeholder="Clinical notes for pharmacist and nurse"
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold">Medication Items</h4>
                      <Button variant="outline" className="rounded-xl" onClick={addItem}>
                        Add Item
                      </Button>
                    </div>

                    {items.map((item, index) => (
                      <div key={item.id} className="rounded-xl border border-border/50 p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <Badge variant="outline" className="rounded-lg">
                            Item {index + 1}
                          </Badge>
                          {items.length > 1 && (
                            <Button variant="ghost" size="sm" className="rounded-lg" onClick={() => removeItem(item.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2">
                          <div className="space-y-2">
                            <Label>Medication Name *</Label>
                            <Input
                              value={item.medicationName}
                              onChange={(e) => updateItem(item.id, 'medicationName', e.target.value)}
                              className="rounded-xl"
                              placeholder="e.g. Amoxicillin 500mg"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Dosage *</Label>
                            <Input
                              value={item.dosage}
                              onChange={(e) => updateItem(item.id, 'dosage', e.target.value)}
                              className="rounded-xl"
                              placeholder="e.g. 1 capsule"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Frequency *</Label>
                            <Input
                              value={item.frequency}
                              onChange={(e) => updateItem(item.id, 'frequency', e.target.value)}
                              className="rounded-xl"
                              placeholder="e.g. three times daily after meals"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Duration</Label>
                            <Input
                              value={item.duration}
                              onChange={(e) => updateItem(item.id, 'duration', e.target.value)}
                              className="rounded-xl"
                              placeholder="e.g. 7 days"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Quantity *</Label>
                            <Input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => updateItem(item.id, 'quantity', Number(e.target.value) || 1)}
                              className="rounded-xl"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label>Item Notes</Label>
                          <Textarea
                            value={item.notes || ''}
                            onChange={(e) => updateItem(item.id, 'notes', e.target.value)}
                            className="rounded-xl min-h-20"
                            placeholder="Optional item note"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" className="rounded-xl" onClick={() => setSelectedRequest(null)}>
              Cancel
            </Button>
            <Button className="rounded-xl" onClick={handleSubmitPrescription}>
              <Send className="mr-2 h-4 w-4" />
              Save Prescription
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}