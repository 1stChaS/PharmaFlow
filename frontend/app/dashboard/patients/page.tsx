'use client'

import { useEffect, useMemo, useState } from 'react'
import { PlusCircle, Send, UserRound } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { patientsApi } from '@/lib/api'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { Patient } from '@/lib/types'
import {
  addWorkflowPrescriptionRequest,
  generatePatientNumber,
  generateRequestNumber,
  getWorkflowPrescriptionRequests,
} from '@/lib/prescription-workflow'

const PATIENTS_STORAGE_KEY = 'workflow_patients_v2'

type Priority = 'low' | 'normal' | 'high' | 'urgent'

type PatientFormState = {
  fullName: string
  age: string
  gender: 'male' | 'female' | 'other'
  weight: string
  height: string
  bloodPressure: string
  chronicDiseases: string
  drugAllergies: string
  chiefComplaint: string
  medicationDetails: string
  building: string
  roomNumber: string
}

const defaultForm: PatientFormState = {
  fullName: '',
  age: '',
  gender: 'female',
  weight: '',
  height: '',
  bloodPressure: '',
  chronicDiseases: '',
  drugAllergies: '',
  chiefComplaint: '',
  medicationDetails: '',
  building: 'Main Building',
  roomNumber: '',
}

function loadPatientsFromStorage(): Patient[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(PATIENTS_STORAGE_KEY)
    return raw ? (JSON.parse(raw) as Patient[]) : []
  } catch {
    return []
  }
}

function savePatientsToStorage(patients: Patient[]) {
  if (typeof window === 'undefined') return
  localStorage.setItem(PATIENTS_STORAGE_KEY, JSON.stringify(patients))
}

function calculateBMI(weight: number, heightCm: number) {
  if (!weight || !heightCm) return 0
  const heightM = heightCm / 100
  return Number((weight / (heightM * heightM)).toFixed(1))
}

export default function PatientsPage() {
  const { user } = useAuth()
  const [patients, setPatients] = useState<Patient[]>([])
  const [form, setForm] = useState<PatientFormState>(defaultForm)
  const [sendDialogOpen, setSendDialogOpen] = useState(false)
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [priority, setPriority] = useState<Priority>('normal')
  const [requiredByDate, setRequiredByDate] = useState(new Date().toISOString().split('T')[0])
  const [nurseNotes, setNurseNotes] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [editPatient, setEditPatient] = useState<any | null>(null)
  const [editForm, setEditForm] = useState<any>(null)

  const isNurse = user?.role === 'nurse'

  useEffect(() => {
  const loadPatients = async () => {
    try {
      const data = await patientsApi.getAll()
      setPatients(data)
    } catch (error) {
      console.error('Failed to load patients from API:', error)
      setPatients([])
    }
  }

  loadPatients()
}, [])

  const submittedPatientIds = useMemo(() => {
    const workflowRequests = getWorkflowPrescriptionRequests()
    return workflowRequests.map((request) => request.patientId)
  }, [successMessage])

  const bmiPreview = useMemo(() => {
    return calculateBMI(Number(form.weight || 0), Number(form.height || 0))
  }, [form.weight, form.height])

  const resetForm = () => {
    setForm(defaultForm)
  }

  const handleCreatePatient = async () => {
  if (!isNurse) {
    alert('Only nurse accounts can register patients.')
    return
  }

  if (
    !form.fullName.trim() ||
    !form.age ||
    !form.weight ||
    !form.height ||
    !form.chiefComplaint.trim()
  ) {
    alert('Please fill in Patient Name, Age, Weight, Height, and Chief Complaint.')
    return
  }

  try {
    await patientsApi.create({
      fullName: form.fullName.trim(),
      age: Number(form.age),
      gender: form.gender,
      weight: Number(form.weight),
      height: Number(form.height),
      bloodPressure: form.bloodPressure.trim(),
      chronicDiseases: form.chronicDiseases.trim(),
      drugAllergies: form.drugAllergies.trim(),
      chiefComplaint: form.chiefComplaint.trim(),
      medicationDetails: form.medicationDetails.trim(),
      building: form.building.trim(),
      roomNumber: form.roomNumber.trim(),
    })

    const freshPatients = await patientsApi.getAll()
    setPatients(freshPatients)

    setSuccessMessage(`Patient ${form.fullName} registered successfully.`)
    resetForm()
  } catch (error) {
    console.error(error)
    alert('Failed to save patient to database.')
  }
}

  const handleOpenSendDialog = (patient: Patient) => {
    setSelectedPatient(patient)
    setPriority('normal')
    setRequiredByDate(new Date().toISOString().split('T')[0])
    setNurseNotes('')
    setSendDialogOpen(true)
  }

  const handleSendToDoctor = () => {
    if (!selectedPatient) return

    addWorkflowPrescriptionRequest({
      id: crypto.randomUUID(),
      requestNumber: generateRequestNumber(),
      patientId: selectedPatient.id,
      patientName: selectedPatient.fullName,
      patientSnapshot: selectedPatient,
      createdAt: new Date().toISOString(),
      requiredByDate,
      priority,
      status: 'submitted_to_doctor',
      nurseNotes,
      items: [],
      submittedById: user?.id,
      submittedByName: user?.fullName,
    })

    setSuccessMessage(`Patient case for ${selectedPatient.fullName} was sent to doctor successfully.`)
    setSendDialogOpen(false)
    setSelectedPatient(null)
  }

  const handleDeletePatient = (id: number) => {
  const updated = patients.filter(p => p.id !== id)
  setPatients(updated)
  localStorage.setItem('workflow_patients_v2', JSON.stringify(updated))
  }

  const handleUpdatePatient = (updatedPatient: any) => {
    const updated = patients.map(p =>
      p.id === updatedPatient.id ? updatedPatient : p
    )
    setPatients(updated)
    localStorage.setItem('workflow_patients_v2', JSON.stringify(updated))
  }

  const handleSaveEdit = () => {
    const updated = patients.map(p =>
      p.id === editPatient.id ? editForm : p
    )

    setPatients(updated)
    localStorage.setItem('workflow_patients_v2', JSON.stringify(updated))

    setEditPatient(null)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Patient Intake</h1>
        <p className="text-muted-foreground">
          Nurse enters patient clinical information and sends the case to doctor for prescribing.
        </p>
      </div>

      {successMessage && (
        <Card className="rounded-2xl border-primary/20 bg-primary/5">
          <CardContent className="py-3 text-sm text-primary">{successMessage}</CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="rounded-2xl lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PlusCircle className="h-5 w-5 text-primary" />
              New Patient Intake
            </CardTitle>
            <CardDescription>
              Required fields should be completed carefully, especially complaint and medication details.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Patient Name *</Label>
              <Input
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                className="rounded-xl"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Age *</Label>
                <Input
                  type="number"
                  value={form.age}
                  onChange={(e) => setForm({ ...form, age: e.target.value })}
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label>Gender *</Label>
                <select
                  value={form.gender}
                  onChange={(e) =>
                    setForm({ ...form, gender: e.target.value as PatientFormState['gender'] })
                  }
                  className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="female">Female</option>
                  <option value="male">Male</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Weight (kg) *</Label>
                <Input
                  type="number"
                  value={form.weight}
                  onChange={(e) => setForm({ ...form, weight: e.target.value })}
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label>Height (cm) *</Label>
                <Input
                  type="number"
                  value={form.height}
                  onChange={(e) => setForm({ ...form, height: e.target.value })}
                  className="rounded-xl"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>BMI</Label>
              <Input value={bmiPreview ? bmiPreview.toString() : ''} readOnly className="rounded-xl bg-muted/40" />
            </div>

            <div className="space-y-2">
              <Label>Blood Pressure</Label>
              <Input
                value={form.bloodPressure}
                onChange={(e) => setForm({ ...form, bloodPressure: e.target.value })}
                placeholder="e.g. 120/80 mmHg"
                className="rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label>Chronic Diseases</Label>
              <Textarea
                value={form.chronicDiseases}
                onChange={(e) => setForm({ ...form, chronicDiseases: e.target.value })}
                className="rounded-xl min-h-20"
                placeholder="e.g. Hypertension, Diabetes Mellitus"
              />
            </div>

            <div className="space-y-2">
              <Label>Drug Allergies</Label>
              <Textarea
                value={form.drugAllergies}
                onChange={(e) => setForm({ ...form, drugAllergies: e.target.value })}
                className="rounded-xl min-h-20"
                placeholder="e.g. Penicillin"
              />
            </div>

            <div className="space-y-2">
              <Label>Chief Complaint (CC) *</Label>
              <Textarea
                value={form.chiefComplaint}
                onChange={(e) => setForm({ ...form, chiefComplaint: e.target.value })}
                className="rounded-xl min-h-20"
                placeholder="Main complaint and current symptoms"
              />
            </div>

            <div className="space-y-2">
              <Label>Medication Details</Label>
              <Textarea
                value={form.medicationDetails}
                onChange={(e) => setForm({ ...form, medicationDetails: e.target.value })}
                className="rounded-xl min-h-24"
                placeholder="Current medicines, previous medicine use, important medication notes"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Building</Label>
                <Input
                  value={form.building}
                  onChange={(e) => setForm({ ...form, building: e.target.value })}
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label>Room Number</Label>
                <Input
                  value={form.roomNumber}
                  onChange={(e) => setForm({ ...form, roomNumber: e.target.value })}
                  className="rounded-xl"
                />
              </div>
            </div>

            <Button onClick={handleCreatePatient} className="w-full rounded-xl" disabled={!isNurse}>
              Register Patient
            </Button>
          </CardContent>
        </Card>

        <Card className="rounded-2xl lg:col-span-3">
          <CardHeader>
            <CardTitle>Registered Patients</CardTitle>
            <CardDescription>
              Nurse can send each patient case to doctor after intake is complete.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {patients.length === 0 ? (
              <div className="rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">
                No patients registered yet.
              </div>
            ) : (
              <div className="rounded-xl border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Patient ID</TableHead>
                      <TableHead>Vitals</TableHead>
                      <TableHead>Chief Complaint</TableHead>
                      <TableHead>Medication Details</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {patients.map((patient) => {
                      const alreadySent = submittedPatientIds.includes(patient.id)

                      return (
                        <TableRow key={patient.id}>
                          <TableCell>
                            <div className="font-medium">{patient.fullName}</div>
                            <div className="text-xs text-muted-foreground">
                              {patient.gender}, age {patient.age}
                            </div>
                          </TableCell>
                          <TableCell>{patient.patientNumber}</TableCell>
                          <TableCell>
                            <div>BP: {patient.bloodPressure || '-'}</div>
                            <div className="text-xs text-muted-foreground">
                              Wt {patient.weight} kg / Ht {patient.height} cm / BMI {patient.bmi}
                            </div>
                          </TableCell>
                          <TableCell>{patient.chiefComplaint}</TableCell>
                          <TableCell className="max-w-[220px] truncate">
                            {patient.medicationDetails || '-'}
                          </TableCell>
                          <TableCell className="text-right space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleOpenSendDialog(patient)}
                          >
                            Send
                          </Button>

                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => {
                              setEditPatient(patient)
                              setEditForm(patient)
                            }}
                          >
                            Edit
                          </Button>

                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeletePatient(patient.id)}
                          >
                            Delete
                          </Button>
                        </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={sendDialogOpen} onOpenChange={setSendDialogOpen}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserRound className="h-5 w-5 text-primary" />
              Send Patient Case to Doctor
            </DialogTitle>
            <DialogDescription>
              {selectedPatient?.fullName} will be sent into the prescription workflow.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Required By Date</Label>
              <Input
                type="date"
                value={requiredByDate}
                onChange={(e) => setRequiredByDate(e.target.value)}
                className="rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label>Priority</Label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label>Nurse Notes</Label>
              <Textarea
                value={nurseNotes}
                onChange={(e) => setNurseNotes(e.target.value)}
                className="rounded-xl min-h-24"
                placeholder="Additional nursing notes for doctor"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" className="rounded-xl" onClick={() => setSendDialogOpen(false)}>
              Cancel
            </Button>
            <Button className="rounded-xl" onClick={handleSendToDoctor}>
              Confirm Send
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={!!editPatient} onOpenChange={() => setEditPatient(null)}>
      <DialogContent className="rounded-2xl max-w-xl">
        <DialogHeader>
          <DialogTitle>Edit Patient</DialogTitle>
        </DialogHeader>

        {editForm && (
          <div className="space-y-3">

            <Input
              value={editForm.fullName}
              onChange={(e) => setEditForm({...editForm, fullName: e.target.value})}
              placeholder="Name"
            />

            <Input
              type="number"
              value={editForm.age}
              onChange={(e) => setEditForm({...editForm, age: e.target.value})}
              placeholder="Age"
            />

            <Input
              value={editForm.bloodPressure}
              onChange={(e) => setEditForm({...editForm, bloodPressure: e.target.value})}
              placeholder="Blood Pressure"
            />

            <Textarea
              value={editForm.chiefComplaint}
              onChange={(e) => setEditForm({...editForm, chiefComplaint: e.target.value})}
              placeholder="Chief Complaint"
            />

            <Textarea
              value={editForm.medicationDetails}
              onChange={(e) => setEditForm({...editForm, medicationDetails: e.target.value})}
              placeholder="Medication Details"
            />

          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => setEditPatient(null)}>
            Cancel
          </Button>
          <Button onClick={handleSaveEdit}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </div>
  )
}
