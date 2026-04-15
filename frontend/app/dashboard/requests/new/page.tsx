// frontend/app/dashboard/requests/new/page.tsx
'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Plus, Trash2, ClipboardList, Send, Package, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/lib/auth-context'
import { InlineAlert } from '@/components/pharmacy/alert-card'

interface RequestItem {
  id: string
  drugId: string
  drugName: string
  quantity: number
  notes: string
}

const priorityOptions = [
  { value: 'low', label: 'Low', description: 'Can wait up to a week' },
  { value: 'normal', label: 'Normal', description: 'Within 2-3 days' },
  { value: 'high', label: 'High', description: 'Within 24 hours' },
  { value: 'urgent', label: 'Urgent', description: 'Immediate attention needed' },
]

export default function NewRequestPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const mockPatients: any[] = []
  const mockDrugs: any[] = []

  // Only doctors can create requests
  const isDoctor = user?.role === 'doctor'

  // Get patients assigned to this doctor
  const myPatients = useMemo(() => {
    if (!isDoctor || !user?.id) return []
    return mockPatients.filter(p => p.assigned_doctor_id === user.id)
  }, [isDoctor, user])
  
  const [formData, setFormData] = useState({
    department: user?.department || '',
    priority: 'normal',
    requiredByDate: '',
    notes: '',
    patientId: '',
  })

  const [items, setItems] = useState<RequestItem[]>([
    { id: '1', drugId: '', drugName: '', quantity: 1, notes: '' }
  ])

  const availableDrugs = mockDrugs.filter(d => d.stockStatus !== 'out_of_stock')

  if (!isDoctor) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Card className="rounded-3xl border-destructive/30 bg-destructive/5 max-w-md text-center p-8">
          <AlertTriangle className="mx-auto h-12 w-12 text-destructive" />
          <h2 className="mt-4 text-xl font-bold">Access Restricted</h2>
          <p className="mt-2 text-muted-foreground">
            Only doctors can create drug requests for their assigned patients.
          </p>
          <Link href="/dashboard">
            <Button className="mt-4 rounded-xl">Back to Dashboard</Button>
          </Link>
        </Card>
      </div>
    )
  }

  const addItem = () => {
    setItems([
      ...items,
      { id: Date.now().toString(), drugId: '', drugName: '', quantity: 1, notes: '' }
    ])
  }

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id))
    }
  }

  const updateItem = (id: string, field: keyof RequestItem, value: string | number) => {
    setItems(items.map(item => {
      if (item.id === id) {
        if (field === 'drugId') {
          const drug = mockDrugs.find(d => d.id.toString() === value)
          return { ...item, drugId: value as string, drugName: drug?.drug_name || '' }
        }
        return { ...item, [field]: value }
      }
      return item
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    setSuccess(true)
    setIsLoading(false)
    
    setTimeout(() => {
      router.push('/dashboard/my-requests')
    }, 2000)
  }

  const isValidForm = items.every(item => item.drugId && item.quantity > 0) && formData.requiredByDate && formData.patientId

  if (success) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Card className="rounded-3xl border-success/30 bg-success/5 max-w-md text-center p-8">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-success/20">
            <ClipboardList className="h-8 w-8 text-success" />
          </div>
          <h2 className="mt-4 text-xl font-bold">Request Submitted</h2>
          <p className="mt-2 text-muted-foreground">
            Your drug request has been submitted and is pending approval.
          </p>
          <Badge variant="outline" className="mt-4 rounded-full">
            REQ-2024-006
          </Badge>
          <p className="mt-4 text-sm text-muted-foreground">Redirecting to my requests...</p>
        </Card>
      </div>
    )
  }

  const selectedPatient = myPatients.find(p => p.id === Number(formData.patientId))

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard">
          <Button variant="ghost" size="icon" className="rounded-xl">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">New Drug Request</h1>
          <p className="text-muted-foreground">Submit a request for drugs from the pharmacy for your patient</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Patient Selection */}
        <Card className="rounded-2xl border-border/50 shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <Package className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">Patient</CardTitle>
                <CardDescription>Select the patient this request is for</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Select Patient (assigned to you) *</Label>
              <Select value={formData.patientId} onValueChange={(v) => setFormData({ ...formData, patientId: v })}>
                <SelectTrigger className="rounded-xl h-11">
                  <SelectValue placeholder="Select your patient" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {myPatients.map((p) => (
                    <SelectItem key={p.id} value={String(p.id)}>
                      {p.full_name} ({p.patient_number})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {selectedPatient && (
              <div className="rounded-xl bg-muted/50 p-3 text-sm">
                <p className="font-medium">{selectedPatient.full_name}</p>
                <p className="text-muted-foreground">{selectedPatient.age} yrs / {selectedPatient.gender} · {selectedPatient.building} {selectedPatient.room_number}</p>
                {selectedPatient.allergies && selectedPatient.allergies !== 'None' && (
                  <p className="text-orange-600 mt-1">⚠ Allergies: {selectedPatient.allergies}</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Request Details */}
        <Card className="rounded-2xl border-border/50 shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <ClipboardList className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">Request Details</CardTitle>
                <CardDescription>Basic information about your request</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Input
                  id="department"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="rounded-xl h-11"
                  placeholder="Your department"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="requiredBy">Required By Date *</Label>
                <Input
                  id="requiredBy"
                  type="date"
                  value={formData.requiredByDate}
                  onChange={(e) => setFormData({ ...formData, requiredByDate: e.target.value })}
                  className="rounded-xl h-11"
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Priority Level</Label>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                {priorityOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, priority: option.value })}
                    className={`rounded-xl border p-3 text-left transition-all ${
                      formData.priority === option.value
                        ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                        : 'border-border/50 hover:border-border hover:bg-muted/30'
                    }`}
                  >
                    <p className="font-medium text-sm">{option.label}</p>
                    <p className="text-xs text-muted-foreground">{option.description}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Any additional information about this request..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="rounded-xl min-h-20 resize-none"
              />
            </div>
          </CardContent>
        </Card>

        {/* Request Items */}
        <Card className="rounded-2xl border-border/50 shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-info/10">
                  <Package className="h-5 w-5 text-info" />
                </div>
                <div>
                  <CardTitle className="text-lg">Request Items</CardTitle>
                  <CardDescription>Add the drugs you need</CardDescription>
                </div>
              </div>
              <Button type="button" variant="outline" size="sm" className="rounded-xl" onClick={addItem}>
                <Plus className="mr-1.5 h-4 w-4" />
                Add Item
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {items.map((item, index) => (
              <div key={item.id} className="rounded-xl border border-border/50 bg-muted/30 p-4">
                <div className="flex items-start justify-between mb-3">
                  <Badge variant="outline" className="rounded-lg">Item {index + 1}</Badge>
                  {items.length > 1 && (
                    <Button type="button" variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-muted-foreground hover:text-destructive" onClick={() => removeItem(item.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="sm:col-span-2 space-y-2">
                    <Label>Drug *</Label>
                    <Select value={item.drugId} onValueChange={(v) => updateItem(item.id, 'drugId', v)}>
                      <SelectTrigger className="rounded-xl h-11">
                        <SelectValue placeholder="Select a drug" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl max-h-60">
                        {availableDrugs.map((drug) => (
                          <SelectItem key={drug.id} value={drug.id.toString()}>
                            <div className="flex items-center justify-between w-full">
                              <span>{drug.drug_name}</span>
                              <Badge variant="secondary" className="ml-2 text-xs">{drug.total_quantity} in stock</Badge>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Quantity *</Label>
                    <Input type="number" min="1" value={item.quantity} onChange={(e) => updateItem(item.id, 'quantity', parseInt(e.target.value) || 1)} className="rounded-xl h-11" />
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <InlineAlert type="info" message="Your request will be reviewed by the pharmacy team. You'll be notified once it's approved." />

        <div className="flex gap-3 justify-end">
          <Link href="/dashboard">
            <Button type="button" variant="outline" className="rounded-xl">Cancel</Button>
          </Link>
          <Button type="submit" className="rounded-xl min-w-40" disabled={isLoading || !isValidForm}>
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Submitting...
              </div>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Submit Request
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
