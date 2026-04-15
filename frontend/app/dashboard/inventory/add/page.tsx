// frontend/app/dashboard/inventory/add/page.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Pill, Save, Package } from 'lucide-react'
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
import { Switch } from '@/components/ui/switch'
import { InlineAlert } from '@/components/pharmacy/alert-card'

const dosageForms = [
  { value: 'tablet', label: 'Tablet' },
  { value: 'capsule', label: 'Capsule' },
  { value: 'syrup', label: 'Syrup' },
  { value: 'injection', label: 'Injection' },
  { value: 'cream', label: 'Cream' },
  { value: 'ointment', label: 'Ointment' },
  { value: 'drops', label: 'Drops' },
  { value: 'powder', label: 'Powder' },
  { value: 'suspension', label: 'Suspension' },
  { value: 'other', label: 'Other' },
]

const mockCategories = [
  { id: 1, name: 'Antibiotics' },
  { id: 2, name: 'Analgesics' },
  { id: 3, name: 'Cardiovascular' },
  { id: 4, name: 'Respiratory' },
  { id: 5, name: 'Vitamins' },
]

export default function AddDrugPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  
  const [formData, setFormData] = useState({
    drugCode: '',
    drugName: '',
    genericName: '',
    categoryId: '',
    manufacturer: '',
    dosageForm: '',
    strength: '',
    unitPrice: '',
    reorderLevel: '50',
    description: '',
    requiresPrescription: true,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    setSuccess(true)
    setIsLoading(false)
    
    // Redirect after showing success
    setTimeout(() => {
      router.push('/dashboard/inventory')
    }, 2000)
  }

  const updateField = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  if (success) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Card className="rounded-3xl border-success/30 bg-success/5 max-w-md text-center p-8">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-success/20">
            <Package className="h-8 w-8 text-success" />
          </div>
          <h2 className="mt-4 text-xl font-bold">Drug Added Successfully</h2>
          <p className="mt-2 text-muted-foreground">
            The new drug has been added to the inventory catalog.
          </p>
          <p className="mt-4 text-sm text-muted-foreground">Redirecting to inventory...</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/inventory">
          <Button variant="ghost" size="icon" className="rounded-xl">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Add New Drug</h1>
          <p className="text-muted-foreground">Add a new drug to the pharmacy inventory</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card className="rounded-2xl border-border/50 shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <Pill className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">Basic Information</CardTitle>
                <CardDescription>Drug identification and classification</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="drugCode">Drug Code *</Label>
                <Input
                  id="drugCode"
                  placeholder="e.g., DRG016"
                  value={formData.drugCode}
                  onChange={(e) => updateField('drugCode', e.target.value)}
                  className="rounded-xl h-11"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="drugName">Drug Name *</Label>
                <Input
                  id="drugName"
                  placeholder="e.g., Amoxicillin 500mg"
                  value={formData.drugName}
                  onChange={(e) => updateField('drugName', e.target.value)}
                  className="rounded-xl h-11"
                  required
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="genericName">Generic Name</Label>
                <Input
                  id="genericName"
                  placeholder="e.g., Amoxicillin"
                  value={formData.genericName}
                  onChange={(e) => updateField('genericName', e.target.value)}
                  className="rounded-xl h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select value={formData.categoryId} onValueChange={(v) => updateField('categoryId', v)}>
                  <SelectTrigger id="category" className="rounded-xl h-11">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {mockCategories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id.toString()}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="manufacturer">Manufacturer</Label>
              <Input
                id="manufacturer"
                placeholder="e.g., PharmaCorp"
                value={formData.manufacturer}
                onChange={(e) => updateField('manufacturer', e.target.value)}
                className="rounded-xl h-11"
              />
            </div>
          </CardContent>
        </Card>

        {/* Drug Details */}
        <Card className="rounded-2xl border-border/50 shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-info/10">
                <Package className="h-5 w-5 text-info" />
              </div>
              <div>
                <CardTitle className="text-lg">Drug Details</CardTitle>
                <CardDescription>Dosage, pricing, and inventory settings</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="dosageForm">Dosage Form *</Label>
                <Select value={formData.dosageForm} onValueChange={(v) => updateField('dosageForm', v)}>
                  <SelectTrigger id="dosageForm" className="rounded-xl h-11">
                    <SelectValue placeholder="Select form" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {dosageForms.map((form) => (
                      <SelectItem key={form.value} value={form.value}>
                        {form.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="strength">Strength *</Label>
                <Input
                  id="strength"
                  placeholder="e.g., 500mg"
                  value={formData.strength}
                  onChange={(e) => updateField('strength', e.target.value)}
                  className="rounded-xl h-11"
                  required
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="unitPrice">Unit Price ($) *</Label>
                <Input
                  id="unitPrice"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="e.g., 15.50"
                  value={formData.unitPrice}
                  onChange={(e) => updateField('unitPrice', e.target.value)}
                  className="rounded-xl h-11"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reorderLevel">Reorder Level *</Label>
                <Input
                  id="reorderLevel"
                  type="number"
                  min="0"
                  placeholder="e.g., 50"
                  value={formData.reorderLevel}
                  onChange={(e) => updateField('reorderLevel', e.target.value)}
                  className="rounded-xl h-11"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Alert will be triggered when stock falls below this level
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Brief description of the drug, usage, and storage instructions..."
                value={formData.description}
                onChange={(e) => updateField('description', e.target.value)}
                className="rounded-xl min-h-24 resize-none"
              />
            </div>

            <div className="flex items-center justify-between rounded-xl border border-border/50 bg-muted/30 p-4">
              <div className="space-y-0.5">
                <Label htmlFor="prescription" className="text-base font-medium">
                  Requires Prescription
                </Label>
                <p className="text-sm text-muted-foreground">
                  This drug requires a valid prescription to dispense
                </p>
              </div>
              <Switch
                id="prescription"
                checked={formData.requiresPrescription}
                onCheckedChange={(checked) => updateField('requiresPrescription', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Info Alert */}
        <InlineAlert 
          type="info" 
          message="After adding the drug, you can add stock batches from the inventory details page."
        />

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          <Link href="/dashboard/inventory">
            <Button type="button" variant="outline" className="rounded-xl">
              Cancel
            </Button>
          </Link>
          <Button 
            type="submit" 
            className="rounded-xl min-w-32"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Saving...
              </div>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Add Drug
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
