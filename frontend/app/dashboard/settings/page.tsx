"use client";

import { useState } from "react";
import { 
  Settings, 
  Bell, 
  Shield, 
  Database, 
  Palette, 
  Globe,
  Mail,
  Save,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Building2,
  Clock,
  FileText
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/lib/auth-context";
import { EmptyState } from "@/components/pharmacy/empty-state";

export default function SettingsPage() {
  const { user } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("general");

  // Settings state
  const [settings, setSettings] = useState({
    // General
    hospitalName: "City General Hospital",
    pharmacyName: "Main Pharmacy",
    address: "123 Healthcare Drive, Medical City, MC 12345",
    phone: "+1 (555) 123-4567",
    email: "pharmacy@citygeneral.com",
    timezone: "America/New_York",
    dateFormat: "MM/DD/YYYY",
    currency: "USD",
    
    // Notifications
    emailNotifications: true,
    lowStockAlerts: true,
    expiryAlerts: true,
    requestNotifications: true,
    deliveryUpdates: true,
    dailyReport: false,
    weeklyReport: true,
    
    // Inventory
    lowStockThreshold: 50,
    expiryWarningDays: 90,
    autoReorderEnabled: false,
    batchTracking: true,
    
    // Security
    sessionTimeout: 30,
    requireStrongPassword: true,
    twoFactorAuth: false,
    auditLogRetention: 365,
  });

  // Only administrators can access this page
  if (user?.role !== "administrator") {
    return (
      <EmptyState
        icon={Shield}
        title="Access Restricted"
        description="You don&apos;t have permission to access settings. Only administrators can modify system configuration."
      />
    );
  }

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSaving(false);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">System Settings</h1>
          <p className="text-muted-foreground">
            Configure pharmacy system preferences and policies
          </p>
        </div>
        <Button 
          className="rounded-xl bg-primary hover:bg-primary/90"
          onClick={handleSave}
          disabled={isSaving}
        >
          {isSaving ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </>
          )}
        </Button>
      </div>

      {/* Settings Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="inline-flex h-auto gap-2 rounded-2xl bg-primary/10 p-2">
          <TabsTrigger 
            value="general" 
            className="rounded-xl px-4 py-2.5 data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            <Building2 className="mr-2 h-4 w-4" />
            General
          </TabsTrigger>
          <TabsTrigger 
            value="notifications" 
            className="rounded-xl px-4 py-2.5 data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            <Bell className="mr-2 h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger 
            value="inventory" 
            className="rounded-xl px-4 py-2.5 data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            <Database className="mr-2 h-4 w-4" />
            Inventory
          </TabsTrigger>
          <TabsTrigger 
            value="security" 
            className="rounded-xl px-4 py-2.5 data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            <Shield className="mr-2 h-4 w-4" />
            Security
          </TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-6">
          <Card className="rounded-2xl border-0 bg-white/80 shadow-soft backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" />
                Organization Information
              </CardTitle>
              <CardDescription>
                Basic information about your hospital and pharmacy
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="hospitalName">Hospital Name</Label>
                  <Input
                    id="hospitalName"
                    value={settings.hospitalName}
                    onChange={(e) => setSettings({ ...settings, hospitalName: e.target.value })}
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pharmacyName">Pharmacy Name</Label>
                  <Input
                    id="pharmacyName"
                    value={settings.pharmacyName}
                    onChange={(e) => setSettings({ ...settings, pharmacyName: e.target.value })}
                    className="rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  value={settings.address}
                  onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                  className="rounded-xl resize-none"
                  rows={2}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={settings.phone}
                    onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={settings.email}
                    onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                    className="rounded-xl"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-0 bg-white/80 shadow-soft backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-primary" />
                Regional Settings
              </CardTitle>
              <CardDescription>
                Timezone, date format, and currency preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select 
                    value={settings.timezone}
                    onValueChange={(value) => setSettings({ ...settings, timezone: value })}
                  >
                    <SelectTrigger className="rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                      <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                      <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
                      <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                      <SelectItem value="UTC">UTC</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dateFormat">Date Format</Label>
                  <Select 
                    value={settings.dateFormat}
                    onValueChange={(value) => setSettings({ ...settings, dateFormat: value })}
                  >
                    <SelectTrigger className="rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                      <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                      <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Select 
                    value={settings.currency}
                    onValueChange={(value) => setSettings({ ...settings, currency: value })}
                  >
                    <SelectTrigger className="rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                      <SelectItem value="GBP">GBP (£)</SelectItem>
                      <SelectItem value="CAD">CAD ($)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications" className="space-y-6">
          <Card className="rounded-2xl border-0 bg-white/80 shadow-soft backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-primary" />
                Alert Preferences
              </CardTitle>
              <CardDescription>
                Configure which notifications you want to receive
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between rounded-xl bg-primary/5 p-4">
                <div className="space-y-0.5">
                  <Label className="text-base">Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications via email
                  </p>
                </div>
                <Switch
                  checked={settings.emailNotifications}
                  onCheckedChange={(checked) => setSettings({ ...settings, emailNotifications: checked })}
                />
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">Inventory Alerts</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Low Stock Alerts</Label>
                      <p className="text-sm text-muted-foreground">
                        Get notified when items fall below threshold
                      </p>
                    </div>
                    <Switch
                      checked={settings.lowStockAlerts}
                      onCheckedChange={(checked) => setSettings({ ...settings, lowStockAlerts: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Expiry Alerts</Label>
                      <p className="text-sm text-muted-foreground">
                        Get notified about expiring medications
                      </p>
                    </div>
                    <Switch
                      checked={settings.expiryAlerts}
                      onCheckedChange={(checked) => setSettings({ ...settings, expiryAlerts: checked })}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">Request & Delivery Alerts</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Request Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        New requests and status updates
                      </p>
                    </div>
                    <Switch
                      checked={settings.requestNotifications}
                      onCheckedChange={(checked) => setSettings({ ...settings, requestNotifications: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Delivery Updates</Label>
                      <p className="text-sm text-muted-foreground">
                        Track delivery status changes
                      </p>
                    </div>
                    <Switch
                      checked={settings.deliveryUpdates}
                      onCheckedChange={(checked) => setSettings({ ...settings, deliveryUpdates: checked })}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">Scheduled Reports</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Daily Summary Report</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive daily activity summary
                      </p>
                    </div>
                    <Switch
                      checked={settings.dailyReport}
                      onCheckedChange={(checked) => setSettings({ ...settings, dailyReport: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Weekly Summary Report</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive weekly activity summary
                      </p>
                    </div>
                    <Switch
                      checked={settings.weeklyReport}
                      onCheckedChange={(checked) => setSettings({ ...settings, weeklyReport: checked })}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Inventory Settings */}
        <TabsContent value="inventory" className="space-y-6">
          <Card className="rounded-2xl border-0 bg-white/80 shadow-soft backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                Alert Thresholds
              </CardTitle>
              <CardDescription>
                Configure when inventory alerts are triggered
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="lowStockThreshold">Low Stock Threshold (units)</Label>
                  <Input
                    id="lowStockThreshold"
                    type="number"
                    value={settings.lowStockThreshold}
                    onChange={(e) => setSettings({ ...settings, lowStockThreshold: parseInt(e.target.value) })}
                    className="rounded-xl"
                  />
                  <p className="text-xs text-muted-foreground">
                    Items with quantity below this will be flagged as low stock
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expiryWarningDays">Expiry Warning (days)</Label>
                  <Input
                    id="expiryWarningDays"
                    type="number"
                    value={settings.expiryWarningDays}
                    onChange={(e) => setSettings({ ...settings, expiryWarningDays: parseInt(e.target.value) })}
                    className="rounded-xl"
                  />
                  <p className="text-xs text-muted-foreground">
                    Days before expiry to trigger warning
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-0 bg-white/80 shadow-soft backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5 text-primary" />
                Inventory Management
              </CardTitle>
              <CardDescription>
                Configure inventory tracking and automation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-xl bg-primary/5 p-4">
                <div className="space-y-0.5">
                  <Label className="text-base">Batch Tracking</Label>
                  <p className="text-sm text-muted-foreground">
                    Track drugs by batch number and expiry date
                  </p>
                </div>
                <Switch
                  checked={settings.batchTracking}
                  onCheckedChange={(checked) => setSettings({ ...settings, batchTracking: checked })}
                />
              </div>

              <div className="flex items-center justify-between rounded-xl bg-primary/5 p-4">
                <div className="space-y-0.5">
                  <Label className="text-base">Auto Reorder</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically create purchase orders for low stock items
                  </p>
                </div>
                <Switch
                  checked={settings.autoReorderEnabled}
                  onCheckedChange={(checked) => setSettings({ ...settings, autoReorderEnabled: checked })}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security" className="space-y-6">
          <Card className="rounded-2xl border-0 bg-white/80 shadow-soft backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Authentication Security
              </CardTitle>
              <CardDescription>
                Configure security policies for user authentication
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                <Input
                  id="sessionTimeout"
                  type="number"
                  value={settings.sessionTimeout}
                  onChange={(e) => setSettings({ ...settings, sessionTimeout: parseInt(e.target.value) })}
                  className="w-[200px] rounded-xl"
                />
                <p className="text-xs text-muted-foreground">
                  Users will be automatically logged out after this period of inactivity
                </p>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Strong Password Required</Label>
                    <p className="text-sm text-muted-foreground">
                      Passwords must include uppercase, lowercase, numbers, and symbols
                    </p>
                  </div>
                  <Switch
                    checked={settings.requireStrongPassword}
                    onCheckedChange={(checked) => setSettings({ ...settings, requireStrongPassword: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Two-Factor Authentication</Label>
                    <p className="text-sm text-muted-foreground">
                      Require 2FA for all users
                    </p>
                  </div>
                  <Switch
                    checked={settings.twoFactorAuth}
                    onCheckedChange={(checked) => setSettings({ ...settings, twoFactorAuth: checked })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-0 bg-white/80 shadow-soft backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Audit Log Settings
              </CardTitle>
              <CardDescription>
                Configure audit trail and logging preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="auditLogRetention">Audit Log Retention (days)</Label>
                <Input
                  id="auditLogRetention"
                  type="number"
                  value={settings.auditLogRetention}
                  onChange={(e) => setSettings({ ...settings, auditLogRetention: parseInt(e.target.value) })}
                  className="w-[200px] rounded-xl"
                />
                <p className="text-xs text-muted-foreground">
                  Audit logs older than this will be automatically archived
                </p>
              </div>

              <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-emerald-600" />
                  <div>
                    <p className="font-medium text-emerald-800">Audit Logging Active</p>
                    <p className="text-sm text-emerald-600">
                      All user actions are being tracked for compliance
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
