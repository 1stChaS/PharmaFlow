"use client";

import { useState } from "react";
import { 
  BarChart3, 
  TrendingUp, 
  Package, 
  FileText, 
  Download, 
  Calendar,
  Pill,
  AlertTriangle,
  DollarSign,
  ClipboardList,
  ArrowUpRight,
  ArrowDownRight,
  Filter
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart,
  Legend
} from "recharts";

// Mock data for reports
const inventoryByCategory = [
  { name: "Antibiotics", count: 45, value: 12500 },
  { name: "Analgesics", count: 32, value: 8400 },
  { name: "Cardiovascular", count: 28, value: 15600 },
  { name: "Respiratory", count: 22, value: 6800 },
  { name: "Vitamins", count: 38, value: 4200 },
  { name: "Gastrointestinal", count: 18, value: 5100 },
];

const stockTrend = [
  { month: "Jan", inStock: 180, lowStock: 12, outOfStock: 3 },
  { month: "Feb", inStock: 185, lowStock: 10, outOfStock: 2 },
  { month: "Mar", inStock: 175, lowStock: 15, outOfStock: 5 },
  { month: "Apr", inStock: 190, lowStock: 8, outOfStock: 2 },
  { month: "May", inStock: 195, lowStock: 6, outOfStock: 1 },
  { month: "Jun", inStock: 188, lowStock: 10, outOfStock: 4 },
];

const requestsByDepartment = [
  { department: "Emergency", requests: 145, fulfilled: 138 },
  { department: "ICU", requests: 98, fulfilled: 92 },
  { department: "Surgery", requests: 76, fulfilled: 71 },
  { department: "Pediatrics", requests: 64, fulfilled: 60 },
  { department: "Oncology", requests: 52, fulfilled: 48 },
  { department: "General Ward", requests: 89, fulfilled: 85 },
];

const requestsTrend = [
  { date: "Week 1", pending: 12, approved: 45, rejected: 3 },
  { date: "Week 2", pending: 8, approved: 52, rejected: 2 },
  { date: "Week 3", pending: 15, approved: 48, rejected: 5 },
  { date: "Week 4", pending: 10, approved: 55, rejected: 4 },
];

const topDrugs = [
  { name: "Paracetamol 500mg", quantity: 1250, value: 625 },
  { name: "Amoxicillin 500mg", quantity: 980, value: 2450 },
  { name: "Omeprazole 20mg", quantity: 850, value: 1700 },
  { name: "Metformin 500mg", quantity: 720, value: 1080 },
  { name: "Amlodipine 5mg", quantity: 650, value: 975 },
];

const expiryData = [
  { status: "Expired", count: 3, color: "#ef4444" },
  { status: "This Month", count: 8, color: "#f97316" },
  { status: "Next 3 Months", count: 15, color: "#eab308" },
  { status: "6+ Months", count: 174, color: "#22c55e" },
];

const COLORS = ["#93c5fd", "#a5b4fc", "#c4b5fd", "#f0abfc", "#fda4af", "#fcd34d"];

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState("inventory");
  const [dateRange, setDateRange] = useState("this_month");
  const [isLoading, setIsLoading] = useState(false);

  const handleExport = (format: "csv" | "pdf") => {
    // In production, this would call the API
    console.log(`Exporting ${activeTab} report as ${format}`);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Reports & Analytics</h1>
          <p className="text-muted-foreground">
            Comprehensive insights into pharmacy operations
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[180px] rounded-xl border-primary/20 bg-white/80">
              <Calendar className="mr-2 h-4 w-4 text-primary" />
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="this_week">This Week</SelectItem>
              <SelectItem value="this_month">This Month</SelectItem>
              <SelectItem value="last_month">Last Month</SelectItem>
              <SelectItem value="this_quarter">This Quarter</SelectItem>
              <SelectItem value="this_year">This Year</SelectItem>
              <SelectItem value="custom">Custom Range</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            variant="outline" 
            className="rounded-xl border-primary/20"
            onClick={() => handleExport("csv")}
          >
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
          <Button 
            className="rounded-xl bg-primary hover:bg-primary/90"
            onClick={() => handleExport("pdf")}
          >
            <FileText className="mr-2 h-4 w-4" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* Report Type Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="inline-flex h-auto gap-2 rounded-2xl bg-primary/10 p-2">
          <TabsTrigger 
            value="inventory" 
            className="rounded-xl px-4 py-2.5 data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            <Package className="mr-2 h-4 w-4" />
            Inventory
          </TabsTrigger>
          <TabsTrigger 
            value="requests" 
            className="rounded-xl px-4 py-2.5 data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            <ClipboardList className="mr-2 h-4 w-4" />
            Requests
          </TabsTrigger>
          <TabsTrigger 
            value="usage" 
            className="rounded-xl px-4 py-2.5 data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            <TrendingUp className="mr-2 h-4 w-4" />
            Usage
          </TabsTrigger>
          <TabsTrigger 
            value="expiry" 
            className="rounded-xl px-4 py-2.5 data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            <AlertTriangle className="mr-2 h-4 w-4" />
            Expiry
          </TabsTrigger>
          <TabsTrigger 
            value="financial" 
            className="rounded-xl px-4 py-2.5 data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            <DollarSign className="mr-2 h-4 w-4" />
            Financial
          </TabsTrigger>
        </TabsList>

        {/* Inventory Report */}
        <TabsContent value="inventory" className="space-y-6">
          {/* Summary Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card className="rounded-2xl border-0 bg-gradient-to-br from-sky-100 to-sky-50 shadow-soft">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-sky-700">Total Items</p>
                    <p className="text-2xl font-bold text-sky-900">1,245</p>
                    <p className="mt-1 flex items-center text-xs text-sky-600">
                      <ArrowUpRight className="mr-1 h-3 w-3" />
                      +12% from last month
                    </p>
                  </div>
                  <div className="rounded-xl bg-white/60 p-3">
                    <Package className="h-6 w-6 text-sky-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="rounded-2xl border-0 bg-gradient-to-br from-emerald-100 to-emerald-50 shadow-soft">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-emerald-700">Total Value</p>
                    <p className="text-2xl font-bold text-emerald-900">$52,600</p>
                    <p className="mt-1 flex items-center text-xs text-emerald-600">
                      <ArrowUpRight className="mr-1 h-3 w-3" />
                      +8% from last month
                    </p>
                  </div>
                  <div className="rounded-xl bg-white/60 p-3">
                    <DollarSign className="h-6 w-6 text-emerald-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="rounded-2xl border-0 bg-gradient-to-br from-amber-100 to-amber-50 shadow-soft">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-amber-700">Low Stock</p>
                    <p className="text-2xl font-bold text-amber-900">23</p>
                    <p className="mt-1 flex items-center text-xs text-amber-600">
                      <ArrowDownRight className="mr-1 h-3 w-3" />
                      -5 from last week
                    </p>
                  </div>
                  <div className="rounded-xl bg-white/60 p-3">
                    <AlertTriangle className="h-6 w-6 text-amber-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="rounded-2xl border-0 bg-gradient-to-br from-rose-100 to-rose-50 shadow-soft">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-rose-700">Out of Stock</p>
                    <p className="text-2xl font-bold text-rose-900">5</p>
                    <p className="mt-1 flex items-center text-xs text-rose-600">
                      <ArrowDownRight className="mr-1 h-3 w-3" />
                      -2 from last week
                    </p>
                  </div>
                  <div className="rounded-xl bg-white/60 p-3">
                    <Pill className="h-6 w-6 text-rose-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="rounded-2xl border-0 bg-white/80 shadow-soft backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg">Inventory by Category</CardTitle>
                <CardDescription>Distribution of drugs across categories</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={inventoryByCategory} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis type="number" stroke="#94a3b8" />
                      <YAxis dataKey="name" type="category" width={100} stroke="#94a3b8" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: "white", 
                          borderRadius: "12px",
                          border: "none",
                          boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)"
                        }} 
                      />
                      <Bar dataKey="count" fill="#93c5fd" radius={[0, 6, 6, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-0 bg-white/80 shadow-soft backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg">Stock Level Trend</CardTitle>
                <CardDescription>6-month stock status overview</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={stockTrend}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="month" stroke="#94a3b8" />
                      <YAxis stroke="#94a3b8" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: "white", 
                          borderRadius: "12px",
                          border: "none",
                          boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)"
                        }} 
                      />
                      <Legend />
                      <Area type="monotone" dataKey="inStock" stackId="1" stroke="#22c55e" fill="#bbf7d0" name="In Stock" />
                      <Area type="monotone" dataKey="lowStock" stackId="1" stroke="#eab308" fill="#fef08a" name="Low Stock" />
                      <Area type="monotone" dataKey="outOfStock" stackId="1" stroke="#ef4444" fill="#fecaca" name="Out of Stock" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Category Value Table */}
          <Card className="rounded-2xl border-0 bg-white/80 shadow-soft backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg">Category Value Summary</CardTitle>
              <CardDescription>Inventory value distribution by category</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {inventoryByCategory.map((cat, index) => (
                  <div key={cat.name} className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ backgroundColor: `${COLORS[index]}40` }}>
                      <Pill className="h-5 w-5" style={{ color: COLORS[index].replace("40", "") }} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium">{cat.name}</span>
                        <span className="text-sm text-muted-foreground">${cat.value.toLocaleString()}</span>
                      </div>
                      <Progress value={(cat.value / 15600) * 100} className="h-2" />
                    </div>
                    <Badge variant="secondary" className="rounded-full">
                      {cat.count} items
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Requests Report */}
        <TabsContent value="requests" className="space-y-6">
          {/* Summary Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card className="rounded-2xl border-0 bg-gradient-to-br from-sky-100 to-sky-50 shadow-soft">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-sky-700">Total Requests</p>
                    <p className="text-2xl font-bold text-sky-900">524</p>
                  </div>
                  <div className="rounded-xl bg-white/60 p-3">
                    <ClipboardList className="h-6 w-6 text-sky-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="rounded-2xl border-0 bg-gradient-to-br from-amber-100 to-amber-50 shadow-soft">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-amber-700">Pending</p>
                    <p className="text-2xl font-bold text-amber-900">18</p>
                  </div>
                  <div className="rounded-xl bg-white/60 p-3">
                    <Filter className="h-6 w-6 text-amber-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="rounded-2xl border-0 bg-gradient-to-br from-emerald-100 to-emerald-50 shadow-soft">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-emerald-700">Fulfilled</p>
                    <p className="text-2xl font-bold text-emerald-900">494</p>
                  </div>
                  <div className="rounded-xl bg-white/60 p-3">
                    <Package className="h-6 w-6 text-emerald-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="rounded-2xl border-0 bg-gradient-to-br from-violet-100 to-violet-50 shadow-soft">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-violet-700">Fulfillment Rate</p>
                    <p className="text-2xl font-bold text-violet-900">94.3%</p>
                  </div>
                  <div className="rounded-xl bg-white/60 p-3">
                    <TrendingUp className="h-6 w-6 text-violet-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="rounded-2xl border-0 bg-white/80 shadow-soft backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg">Requests by Department</CardTitle>
                <CardDescription>Request volume across departments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={requestsByDepartment}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="department" stroke="#94a3b8" />
                      <YAxis stroke="#94a3b8" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: "white", 
                          borderRadius: "12px",
                          border: "none",
                          boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)"
                        }} 
                      />
                      <Legend />
                      <Bar dataKey="requests" fill="#93c5fd" name="Requests" radius={[6, 6, 0, 0]} />
                      <Bar dataKey="fulfilled" fill="#86efac" name="Fulfilled" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-0 bg-white/80 shadow-soft backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg">Weekly Request Trend</CardTitle>
                <CardDescription>Request status distribution over weeks</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={requestsTrend}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="date" stroke="#94a3b8" />
                      <YAxis stroke="#94a3b8" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: "white", 
                          borderRadius: "12px",
                          border: "none",
                          boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)"
                        }} 
                      />
                      <Legend />
                      <Line type="monotone" dataKey="approved" stroke="#22c55e" strokeWidth={2} name="Approved" />
                      <Line type="monotone" dataKey="pending" stroke="#eab308" strokeWidth={2} name="Pending" />
                      <Line type="monotone" dataKey="rejected" stroke="#ef4444" strokeWidth={2} name="Rejected" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Usage Report */}
        <TabsContent value="usage" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="rounded-2xl border-0 bg-white/80 shadow-soft backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg">Top Dispensed Drugs</CardTitle>
                <CardDescription>Most frequently dispensed medications</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topDrugs.map((drug, index) => (
                    <div key={drug.name} className="flex items-center gap-4">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{drug.name}</p>
                        <p className="text-sm text-muted-foreground">{drug.quantity} units</p>
                      </div>
                      <Badge className="rounded-full bg-primary/10 text-primary">
                        ${drug.value}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-0 bg-white/80 shadow-soft backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg">Usage by Department</CardTitle>
                <CardDescription>Drug consumption per department</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={requestsByDepartment}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        fill="#8884d8"
                        paddingAngle={2}
                        dataKey="fulfilled"
                        nameKey="department"
                        label={({ department }) => department}
                      >
                        {requestsByDepartment.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: "white", 
                          borderRadius: "12px",
                          border: "none",
                          boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)"
                        }} 
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Expiry Report */}
        <TabsContent value="expiry" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-4">
            {expiryData.map((item) => (
              <Card 
                key={item.status} 
                className="rounded-2xl border-0 shadow-soft"
                style={{ backgroundColor: `${item.color}15` }}
              >
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium" style={{ color: item.color }}>
                        {item.status}
                      </p>
                      <p className="text-2xl font-bold" style={{ color: item.color }}>
                        {item.count}
                      </p>
                    </div>
                    <div 
                      className="rounded-xl p-3"
                      style={{ backgroundColor: `${item.color}20` }}
                    >
                      <AlertTriangle className="h-6 w-6" style={{ color: item.color }} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="rounded-2xl border-0 bg-white/80 shadow-soft backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg">Expiry Distribution</CardTitle>
              <CardDescription>Batch expiry timeline overview</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={expiryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={110}
                      fill="#8884d8"
                      paddingAngle={3}
                      dataKey="count"
                      nameKey="status"
                      label={({ status, count }) => `${status}: ${count}`}
                    >
                      {expiryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: "white", 
                        borderRadius: "12px",
                        border: "none",
                        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)"
                      }} 
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Expiring Items List */}
          <Card className="rounded-2xl border-0 bg-white/80 shadow-soft backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg">Items Requiring Attention</CardTitle>
              <CardDescription>Drugs expiring within 90 days</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4">
                <div className="space-y-3">
                  {[
                    { name: "Insulin Glargine", batch: "INS-2024-001", expiry: "2024-02-15", qty: 50 },
                    { name: "Clopidogrel 75mg", batch: "CLO-2024-003", expiry: "2024-02-28", qty: 120 },
                    { name: "Azithromycin 500mg", batch: "AZI-2024-002", expiry: "2024-03-10", qty: 80 },
                  ].map((item) => (
                    <div 
                      key={item.batch}
                      className="flex items-center justify-between rounded-xl bg-white p-3 shadow-sm"
                    >
                      <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-amber-100 p-2">
                          <Pill className="h-4 w-4 text-amber-600" />
                        </div>
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-muted-foreground">Batch: {item.batch}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline" className="mb-1 border-amber-300 bg-amber-50 text-amber-700">
                          Expires: {item.expiry}
                        </Badge>
                        <p className="text-sm text-muted-foreground">{item.qty} units</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Financial Report */}
        <TabsContent value="financial" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-4">
            <Card className="rounded-2xl border-0 bg-gradient-to-br from-emerald-100 to-emerald-50 shadow-soft">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-emerald-700">Total Inventory Value</p>
                    <p className="text-2xl font-bold text-emerald-900">$52,600</p>
                    <p className="mt-1 flex items-center text-xs text-emerald-600">
                      <ArrowUpRight className="mr-1 h-3 w-3" />
                      +8.2% from last month
                    </p>
                  </div>
                  <div className="rounded-xl bg-white/60 p-3">
                    <DollarSign className="h-6 w-6 text-emerald-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="rounded-2xl border-0 bg-gradient-to-br from-sky-100 to-sky-50 shadow-soft">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-sky-700">Monthly Dispensed</p>
                    <p className="text-2xl font-bold text-sky-900">$12,450</p>
                    <p className="mt-1 flex items-center text-xs text-sky-600">
                      <ArrowUpRight className="mr-1 h-3 w-3" />
                      +5.4% from last month
                    </p>
                  </div>
                  <div className="rounded-xl bg-white/60 p-3">
                    <TrendingUp className="h-6 w-6 text-sky-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="rounded-2xl border-0 bg-gradient-to-br from-violet-100 to-violet-50 shadow-soft">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-violet-700">Avg Order Value</p>
                    <p className="text-2xl font-bold text-violet-900">$245</p>
                    <p className="mt-1 flex items-center text-xs text-violet-600">
                      <ArrowDownRight className="mr-1 h-3 w-3" />
                      -2.1% from last month
                    </p>
                  </div>
                  <div className="rounded-xl bg-white/60 p-3">
                    <BarChart3 className="h-6 w-6 text-violet-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="rounded-2xl border-0 bg-gradient-to-br from-rose-100 to-rose-50 shadow-soft">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-rose-700">Expired Loss</p>
                    <p className="text-2xl font-bold text-rose-900">$890</p>
                    <p className="mt-1 flex items-center text-xs text-rose-600">
                      <ArrowDownRight className="mr-1 h-3 w-3" />
                      -15% from last month
                    </p>
                  </div>
                  <div className="rounded-xl bg-white/60 p-3">
                    <AlertTriangle className="h-6 w-6 text-rose-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="rounded-2xl border-0 bg-white/80 shadow-soft backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg">Value by Category</CardTitle>
              <CardDescription>Inventory value distribution</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={inventoryByCategory}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="name" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: "white", 
                        borderRadius: "12px",
                        border: "none",
                        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)"
                      }}
                      formatter={(value) => [`$${value}`, "Value"]}
                    />
                    <Bar dataKey="value" fill="#93c5fd" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
