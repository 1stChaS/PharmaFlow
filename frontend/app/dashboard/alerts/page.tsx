"use client";

import { useState } from "react";
import { 
  AlertTriangle, 
  Calendar,
  Package,
  Pill,
  Clock,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Filter,
  ArrowRight,
  Bell,
  Trash2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { EmptyState } from "@/components/pharmacy/empty-state";

// Mock data for alerts
const mockExpiryAlerts = [
  { id: 1, drugName: "Insulin Glargine", batchNumber: "INS-2024-001", expiryDate: "2024-01-25", daysUntilExpiry: 5, quantity: 50, status: "critical" },
  { id: 2, drugName: "Clopidogrel 75mg", batchNumber: "CLO-2024-003", expiryDate: "2024-02-10", daysUntilExpiry: 21, quantity: 120, status: "warning" },
  { id: 3, drugName: "Azithromycin 500mg", batchNumber: "AZI-2024-002", expiryDate: "2024-02-28", daysUntilExpiry: 39, quantity: 80, status: "warning" },
  { id: 4, drugName: "Omeprazole 20mg", batchNumber: "OME-2024-005", expiryDate: "2024-03-15", daysUntilExpiry: 54, quantity: 200, status: "info" },
  { id: 5, drugName: "Metformin 500mg", batchNumber: "MET-2024-001", expiryDate: "2024-04-01", daysUntilExpiry: 71, quantity: 150, status: "info" },
];

const mockLowStockAlerts = [
  { id: 1, drugName: "Amoxicillin 500mg", currentStock: 15, reorderLevel: 50, status: "critical" },
  { id: 2, drugName: "Paracetamol 500mg", currentStock: 28, reorderLevel: 100, status: "warning" },
  { id: 3, drugName: "Ibuprofen 400mg", currentStock: 42, reorderLevel: 75, status: "warning" },
  { id: 4, drugName: "Cetirizine 10mg", currentStock: 35, reorderLevel: 60, status: "info" },
];

const mockExpiredItems = [
  { id: 1, drugName: "Vitamin C 1000mg", batchNumber: "VIT-2023-012", expiryDate: "2024-01-15", quantity: 30, daysExpired: 5 },
  { id: 2, drugName: "Aspirin 100mg", batchNumber: "ASP-2023-008", expiryDate: "2024-01-10", quantity: 45, daysExpired: 10 },
];

export default function AlertsPage() {
  const [activeTab, setActiveTab] = useState("expiring");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedItem, setSelectedItem] = useState<typeof mockExpiryAlerts[0] | null>(null);
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "critical":
        return "bg-rose-100 text-rose-700 border-rose-200";
      case "warning":
        return "bg-amber-100 text-amber-700 border-amber-200";
      case "info":
        return "bg-sky-100 text-sky-700 border-sky-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "critical":
        return <XCircle className="h-4 w-4 text-rose-500" />;
      case "warning":
        return <AlertCircle className="h-4 w-4 text-amber-500" />;
      case "info":
        return <Clock className="h-4 w-4 text-sky-500" />;
      default:
        return <CheckCircle2 className="h-4 w-4 text-gray-500" />;
    }
  };

  const filteredExpiryAlerts = mockExpiryAlerts.filter(
    (alert) => filterStatus === "all" || alert.status === filterStatus
  );

  const filteredLowStockAlerts = mockLowStockAlerts.filter(
    (alert) => filterStatus === "all" || alert.status === filterStatus
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Inventory Alerts</h1>
          <p className="text-muted-foreground">
            Monitor expiring medications and low stock items
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[150px] rounded-xl border-primary/20 bg-white">
              <Filter className="mr-2 h-4 w-4 text-muted-foreground" />
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Alerts</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
              <SelectItem value="warning">Warning</SelectItem>
              <SelectItem value="info">Info</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="rounded-2xl border-0 bg-gradient-to-br from-rose-100 to-rose-50 shadow-soft">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-rose-700">Expired Items</p>
                <p className="text-2xl font-bold text-rose-900">{mockExpiredItems.length}</p>
                <p className="mt-1 text-xs text-rose-600">Requires immediate action</p>
              </div>
              <div className="rounded-xl bg-white/60 p-3">
                <XCircle className="h-6 w-6 text-rose-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-0 bg-gradient-to-br from-amber-100 to-amber-50 shadow-soft">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-amber-700">Expiring Soon</p>
                <p className="text-2xl font-bold text-amber-900">
                  {mockExpiryAlerts.filter((a) => a.status === "critical" || a.status === "warning").length}
                </p>
                <p className="mt-1 text-xs text-amber-600">Within 30 days</p>
              </div>
              <div className="rounded-xl bg-white/60 p-3">
                <Calendar className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-0 bg-gradient-to-br from-orange-100 to-orange-50 shadow-soft">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-700">Low Stock</p>
                <p className="text-2xl font-bold text-orange-900">{mockLowStockAlerts.length}</p>
                <p className="mt-1 text-xs text-orange-600">Below reorder level</p>
              </div>
              <div className="rounded-xl bg-white/60 p-3">
                <Package className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-0 bg-gradient-to-br from-sky-100 to-sky-50 shadow-soft">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-sky-700">Total Alerts</p>
                <p className="text-2xl font-bold text-sky-900">
                  {mockExpiryAlerts.length + mockLowStockAlerts.length + mockExpiredItems.length}
                </p>
                <p className="mt-1 text-xs text-sky-600">Active notifications</p>
              </div>
              <div className="rounded-xl bg-white/60 p-3">
                <Bell className="h-6 w-6 text-sky-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alert Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="inline-flex h-auto gap-2 rounded-2xl bg-primary/10 p-2">
          <TabsTrigger 
            value="expired" 
            className="rounded-xl px-4 py-2.5 data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            <XCircle className="mr-2 h-4 w-4" />
            Expired ({mockExpiredItems.length})
          </TabsTrigger>
          <TabsTrigger 
            value="expiring" 
            className="rounded-xl px-4 py-2.5 data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            <Calendar className="mr-2 h-4 w-4" />
            Expiring Soon ({mockExpiryAlerts.length})
          </TabsTrigger>
          <TabsTrigger 
            value="lowstock" 
            className="rounded-xl px-4 py-2.5 data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            <Package className="mr-2 h-4 w-4" />
            Low Stock ({mockLowStockAlerts.length})
          </TabsTrigger>
        </TabsList>

        {/* Expired Items */}
        <TabsContent value="expired" className="space-y-4">
          {mockExpiredItems.length === 0 ? (
            <EmptyState
              icon={CheckCircle2}
              title="No Expired Items"
              description="Great news! There are no expired items in your inventory."
            />
          ) : (
            <Card className="rounded-2xl border-0 bg-white/80 shadow-soft backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-rose-700">
                  <XCircle className="h-5 w-5" />
                  Expired Items - Immediate Action Required
                </CardTitle>
                <CardDescription>
                  These items have passed their expiry date and should be disposed of properly
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockExpiredItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between rounded-xl border border-rose-200 bg-rose-50/50 p-4"
                    >
                      <div className="flex items-center gap-4">
                        <div className="rounded-xl bg-rose-100 p-3">
                          <Pill className="h-5 w-5 text-rose-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-foreground">{item.drugName}</h4>
                          <p className="text-sm text-muted-foreground">
                            Batch: {item.batchNumber} | Qty: {item.quantity} units
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-medium text-rose-700">Expired {item.daysExpired} days ago</p>
                          <p className="text-sm text-muted-foreground">Expiry: {item.expiryDate}</p>
                        </div>
                        <Button
                          variant="outline"
                          className="rounded-xl border-rose-200 text-rose-600 hover:bg-rose-50"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Dispose
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Expiring Soon */}
        <TabsContent value="expiring" className="space-y-4">
          {filteredExpiryAlerts.length === 0 ? (
            <EmptyState
              icon={Calendar}
              title="No Expiring Items"
              description="No medications are expiring within the alert threshold."
            />
          ) : (
            <div className="grid gap-4">
              {filteredExpiryAlerts.map((alert) => (
                <Card
                  key={alert.id}
                  className={`rounded-2xl border-0 shadow-soft backdrop-blur-sm transition-all hover:shadow-md ${
                    alert.status === "critical"
                      ? "bg-rose-50/80"
                      : alert.status === "warning"
                      ? "bg-amber-50/80"
                      : "bg-white/80"
                  }`}
                >
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div
                          className={`rounded-xl p-3 ${
                            alert.status === "critical"
                              ? "bg-rose-100"
                              : alert.status === "warning"
                              ? "bg-amber-100"
                              : "bg-sky-100"
                          }`}
                        >
                          <Pill
                            className={`h-5 w-5 ${
                              alert.status === "critical"
                                ? "text-rose-600"
                                : alert.status === "warning"
                                ? "text-amber-600"
                                : "text-sky-600"
                            }`}
                          />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-foreground">{alert.drugName}</h4>
                            <Badge variant="outline" className={getStatusColor(alert.status)}>
                              {getStatusIcon(alert.status)}
                              <span className="ml-1">
                                {alert.status === "critical"
                                  ? "Critical"
                                  : alert.status === "warning"
                                  ? "Warning"
                                  : "Monitor"}
                              </span>
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Batch: {alert.batchNumber} | Quantity: {alert.quantity} units
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p
                            className={`font-semibold ${
                              alert.status === "critical"
                                ? "text-rose-700"
                                : alert.status === "warning"
                                ? "text-amber-700"
                                : "text-sky-700"
                            }`}
                          >
                            {alert.daysUntilExpiry} days remaining
                          </p>
                          <p className="text-sm text-muted-foreground">Expires: {alert.expiryDate}</p>
                        </div>
                        <Button
                          variant="outline"
                          className="rounded-xl"
                          onClick={() => {
                            setSelectedItem(alert);
                            setIsActionModalOpen(true);
                          }}
                        >
                          Take Action
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Low Stock */}
        <TabsContent value="lowstock" className="space-y-4">
          {filteredLowStockAlerts.length === 0 ? (
            <EmptyState
              icon={Package}
              title="Stock Levels Normal"
              description="All items are above their reorder levels."
            />
          ) : (
            <div className="grid gap-4">
              {filteredLowStockAlerts.map((alert) => {
                const stockPercentage = (alert.currentStock / alert.reorderLevel) * 100;
                return (
                  <Card
                    key={alert.id}
                    className={`rounded-2xl border-0 shadow-soft backdrop-blur-sm transition-all hover:shadow-md ${
                      alert.status === "critical"
                        ? "bg-rose-50/80"
                        : alert.status === "warning"
                        ? "bg-amber-50/80"
                        : "bg-white/80"
                    }`}
                  >
                    <CardContent className="p-5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div
                            className={`rounded-xl p-3 ${
                              alert.status === "critical"
                                ? "bg-rose-100"
                                : alert.status === "warning"
                                ? "bg-amber-100"
                                : "bg-sky-100"
                            }`}
                          >
                            <Package
                              className={`h-5 w-5 ${
                                alert.status === "critical"
                                  ? "text-rose-600"
                                  : alert.status === "warning"
                                  ? "text-amber-600"
                                  : "text-sky-600"
                              }`}
                            />
                          </div>
                          <div className="min-w-[200px]">
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold text-foreground">{alert.drugName}</h4>
                              <Badge variant="outline" className={getStatusColor(alert.status)}>
                                {getStatusIcon(alert.status)}
                                <span className="ml-1">
                                  {alert.status === "critical"
                                    ? "Critical"
                                    : alert.status === "warning"
                                    ? "Low"
                                    : "Monitor"}
                                </span>
                              </Badge>
                            </div>
                            <div className="mt-2">
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">
                                  {alert.currentStock} / {alert.reorderLevel} units
                                </span>
                                <span
                                  className={`font-medium ${
                                    alert.status === "critical"
                                      ? "text-rose-600"
                                      : alert.status === "warning"
                                      ? "text-amber-600"
                                      : "text-sky-600"
                                  }`}
                                >
                                  {stockPercentage.toFixed(0)}%
                                </span>
                              </div>
                              <Progress
                                value={stockPercentage}
                                className={`mt-1 h-2 ${
                                  alert.status === "critical"
                                    ? "[&>div]:bg-rose-500"
                                    : alert.status === "warning"
                                    ? "[&>div]:bg-amber-500"
                                    : "[&>div]:bg-sky-500"
                                }`}
                              />
                            </div>
                          </div>
                        </div>
                        <Button variant="outline" className="rounded-xl">
                          Create Order
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Action Modal */}
      <Dialog open={isActionModalOpen} onOpenChange={setIsActionModalOpen}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle>Take Action on Expiring Item</DialogTitle>
            <DialogDescription>
              Choose an action for {selectedItem?.drugName}
            </DialogDescription>
          </DialogHeader>

          {selectedItem && (
            <div className="space-y-4">
              <div className="rounded-xl bg-primary/5 p-4">
                <div className="flex items-center gap-3">
                  <Pill className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">{selectedItem.drugName}</p>
                    <p className="text-sm text-muted-foreground">
                      Batch: {selectedItem.batchNumber} | {selectedItem.quantity} units
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid gap-3">
                <Button variant="outline" className="justify-start rounded-xl">
                  <ArrowRight className="mr-2 h-4 w-4" />
                  Transfer to another department
                </Button>
                <Button variant="outline" className="justify-start rounded-xl">
                  <AlertTriangle className="mr-2 h-4 w-4" />
                  Mark for priority dispensing
                </Button>
                <Button variant="outline" className="justify-start rounded-xl text-amber-600 hover:bg-amber-50">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Schedule for disposal
                </Button>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              className="rounded-xl"
              onClick={() => setIsActionModalOpen(false)}
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
