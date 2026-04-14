"use client";

import { useState } from "react";
import { 
  Users, 
  UserPlus, 
  Search, 
  MoreHorizontal,
  Shield,
  Stethoscope,
  Pill,
  HeartPulse,
  Mail,
  Phone,
  Building2,
  Edit,
  Trash2,
  UserCheck,
  UserX,
  Filter
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/lib/auth-context";
import { EmptyState } from "@/components/pharmacy/empty-state";

// Mock users data
const mockUsers = [
  {
    id: 1,
    username: "admin",
    fullName: "System Administrator",
    email: "admin@hospital.com",
    phone: "+1 (555) 100-0001",
    role: "administrator",
    department: "IT",
    isActive: true,
    createdAt: "2023-01-15",
    lastLogin: "2024-01-20 09:30",
  },
  {
    id: 2,
    username: "pharm_john",
    fullName: "John Smith",
    email: "john.smith@hospital.com",
    phone: "+1 (555) 100-0002",
    role: "pharmacist",
    department: "Pharmacy",
    isActive: true,
    createdAt: "2023-03-10",
    lastLogin: "2024-01-20 08:15",
  },
  {
    id: 3,
    username: "dr_sarah",
    fullName: "Dr. Sarah Johnson",
    email: "sarah.johnson@hospital.com",
    phone: "+1 (555) 100-0003",
    role: "doctor",
    department: "Emergency",
    isActive: true,
    createdAt: "2023-02-20",
    lastLogin: "2024-01-19 16:45",
  },
  {
    id: 4,
    username: "nurse_emily",
    fullName: "Emily Davis",
    email: "emily.davis@hospital.com",
    phone: "+1 (555) 100-0004",
    role: "nurse",
    department: "ICU",
    isActive: true,
    createdAt: "2023-04-05",
    lastLogin: "2024-01-20 07:00",
  },
  {
    id: 5,
    username: "dr_mike",
    fullName: "Dr. Michael Chen",
    email: "michael.chen@hospital.com",
    phone: "+1 (555) 100-0005",
    role: "doctor",
    department: "Surgery",
    isActive: false,
    createdAt: "2023-05-12",
    lastLogin: "2024-01-10 14:20",
  },
  {
    id: 6,
    username: "pharm_lisa",
    fullName: "Lisa Anderson",
    email: "lisa.anderson@hospital.com",
    phone: "+1 (555) 100-0006",
    role: "pharmacist",
    department: "Pharmacy",
    isActive: true,
    createdAt: "2023-06-18",
    lastLogin: "2024-01-20 10:00",
  },
];

const roleIcons = {
  administrator: Shield,
  pharmacist: Pill,
  doctor: Stethoscope,
  nurse: HeartPulse,
};

const roleColors = {
  administrator: "bg-violet-100 text-violet-700 border-violet-200",
  pharmacist: "bg-sky-100 text-sky-700 border-sky-200",
  doctor: "bg-emerald-100 text-emerald-700 border-emerald-200",
  nurse: "bg-rose-100 text-rose-700 border-rose-200",
};

const departments = [
  "Pharmacy",
  "Emergency",
  "ICU",
  "Surgery",
  "Pediatrics",
  "Oncology",
  "General Ward",
  "IT",
  "Administration",
];

export default function UsersPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState(mockUsers);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<typeof mockUsers[0] | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Only administrators can access this page
  if (user?.role !== "administrator") {
    return (
      <EmptyState
        icon={Shield}
        title="Access Restricted"
        description="You don&apos;t have permission to manage users. Only administrators can access this page."
      />
    );
  }

  const filteredUsers = users.filter((u) => {
    const matchesSearch = 
      u.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.username.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === "all" || u.role === roleFilter;
    const matchesStatus = statusFilter === "all" || 
      (statusFilter === "active" && u.isActive) ||
      (statusFilter === "inactive" && !u.isActive);
    return matchesSearch && matchesRole && matchesStatus;
  });

  const userCounts = {
    total: users.length,
    active: users.filter(u => u.isActive).length,
    administrators: users.filter(u => u.role === "administrator").length,
    pharmacists: users.filter(u => u.role === "pharmacist").length,
    doctors: users.filter(u => u.role === "doctor").length,
    nurses: users.filter(u => u.role === "nurse").length,
  };

  const handleToggleStatus = (userId: number) => {
    setUsers(users.map(u => 
      u.id === userId ? { ...u, isActive: !u.isActive } : u
    ));
  };

  const handleDeleteUser = () => {
    if (selectedUser) {
      setUsers(users.filter(u => u.id !== selectedUser.id));
      setSelectedUser(null);
      setIsDeleteModalOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">User Management</h1>
          <p className="text-muted-foreground">
            Manage system users and their access permissions
          </p>
        </div>
        <Button 
          className="rounded-xl bg-primary hover:bg-primary/90"
          onClick={() => setIsAddModalOpen(true)}
        >
          <UserPlus className="mr-2 h-4 w-4" />
          Add New User
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-6">
        <Card className="rounded-2xl border-0 bg-gradient-to-br from-sky-100 to-sky-50 shadow-soft">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-white/60 p-2.5">
                <Users className="h-5 w-5 text-sky-600" />
              </div>
              <div>
                <p className="text-xl font-bold text-sky-900">{userCounts.total}</p>
                <p className="text-xs text-sky-700">Total Users</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-0 bg-gradient-to-br from-emerald-100 to-emerald-50 shadow-soft">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-white/60 p-2.5">
                <UserCheck className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-xl font-bold text-emerald-900">{userCounts.active}</p>
                <p className="text-xs text-emerald-700">Active</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-0 bg-gradient-to-br from-violet-100 to-violet-50 shadow-soft">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-white/60 p-2.5">
                <Shield className="h-5 w-5 text-violet-600" />
              </div>
              <div>
                <p className="text-xl font-bold text-violet-900">{userCounts.administrators}</p>
                <p className="text-xs text-violet-700">Admins</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-0 bg-gradient-to-br from-cyan-100 to-cyan-50 shadow-soft">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-white/60 p-2.5">
                <Pill className="h-5 w-5 text-cyan-600" />
              </div>
              <div>
                <p className="text-xl font-bold text-cyan-900">{userCounts.pharmacists}</p>
                <p className="text-xs text-cyan-700">Pharmacists</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-0 bg-gradient-to-br from-teal-100 to-teal-50 shadow-soft">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-white/60 p-2.5">
                <Stethoscope className="h-5 w-5 text-teal-600" />
              </div>
              <div>
                <p className="text-xl font-bold text-teal-900">{userCounts.doctors}</p>
                <p className="text-xs text-teal-700">Doctors</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-0 bg-gradient-to-br from-rose-100 to-rose-50 shadow-soft">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-white/60 p-2.5">
                <HeartPulse className="h-5 w-5 text-rose-600" />
              </div>
              <div>
                <p className="text-xl font-bold text-rose-900">{userCounts.nurses}</p>
                <p className="text-xs text-rose-700">Nurses</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="rounded-2xl border-0 bg-white/80 shadow-soft backdrop-blur-sm">
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or username..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="rounded-xl border-primary/20 bg-white pl-10"
              />
            </div>
            <div className="flex gap-3">
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-[150px] rounded-xl border-primary/20 bg-white">
                  <Filter className="mr-2 h-4 w-4 text-muted-foreground" />
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="administrator">Administrator</SelectItem>
                  <SelectItem value="pharmacist">Pharmacist</SelectItem>
                  <SelectItem value="doctor">Doctor</SelectItem>
                  <SelectItem value="nurse">Nurse</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px] rounded-xl border-primary/20 bg-white">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Grid */}
      {filteredUsers.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No users found"
          description="Try adjusting your search or filters to find what you&apos;re looking for."
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredUsers.map((u) => {
            const RoleIcon = roleIcons[u.role as keyof typeof roleIcons];
            return (
              <Card 
                key={u.id} 
                className={`rounded-2xl border-0 bg-white/80 shadow-soft backdrop-blur-sm transition-all hover:shadow-md ${
                  !u.isActive ? "opacity-60" : ""
                }`}
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12 border-2 border-primary/20">
                        <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${u.fullName}`} />
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {u.fullName.split(" ").map(n => n[0]).join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold text-foreground">{u.fullName}</h3>
                        <p className="text-sm text-muted-foreground">@{u.username}</p>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="rounded-xl">
                        <DropdownMenuItem 
                          className="rounded-lg"
                          onClick={() => {
                            setSelectedUser(u);
                            setIsAddModalOpen(true);
                          }}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Edit User
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="rounded-lg"
                          onClick={() => handleToggleStatus(u.id)}
                        >
                          {u.isActive ? (
                            <>
                              <UserX className="mr-2 h-4 w-4" />
                              Deactivate
                            </>
                          ) : (
                            <>
                              <UserCheck className="mr-2 h-4 w-4" />
                              Activate
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="rounded-lg text-destructive focus:text-destructive"
                          onClick={() => {
                            setSelectedUser(u);
                            setIsDeleteModalOpen(true);
                          }}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete User
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="mt-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant="outline" 
                        className={`rounded-full ${roleColors[u.role as keyof typeof roleColors]}`}
                      >
                        <RoleIcon className="mr-1 h-3 w-3" />
                        {u.role.charAt(0).toUpperCase() + u.role.slice(1)}
                      </Badge>
                      {u.isActive ? (
                        <Badge className="rounded-full bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                          Active
                        </Badge>
                      ) : (
                        <Badge className="rounded-full bg-gray-100 text-gray-600 hover:bg-gray-100">
                          Inactive
                        </Badge>
                      )}
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Mail className="h-4 w-4" />
                        <span className="truncate">{u.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Building2 className="h-4 w-4" />
                        <span>{u.department}</span>
                      </div>
                      {u.phone && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Phone className="h-4 w-4" />
                          <span>{u.phone}</span>
                        </div>
                      )}
                    </div>

                    <div className="border-t border-primary/10 pt-3">
                      <p className="text-xs text-muted-foreground">
                        Last login: {u.lastLogin}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Add/Edit User Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={(open) => {
        setIsAddModalOpen(open);
        if (!open) setSelectedUser(null);
      }}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle>{selectedUser ? "Edit User" : "Add New User"}</DialogTitle>
            <DialogDescription>
              {selectedUser 
                ? "Update user information and permissions."
                : "Create a new user account with role-based access."}
            </DialogDescription>
          </DialogHeader>

          <form className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  placeholder="John Smith"
                  defaultValue={selectedUser?.fullName}
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  placeholder="john_smith"
                  defaultValue={selectedUser?.username}
                  className="rounded-xl"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="john@hospital.com"
                defaultValue={selectedUser?.email}
                className="rounded-xl"
              />
            </div>

            {!selectedUser && (
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter password"
                  className="rounded-xl"
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select defaultValue={selectedUser?.role || "nurse"}>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="administrator">Administrator</SelectItem>
                    <SelectItem value="pharmacist">Pharmacist</SelectItem>
                    <SelectItem value="doctor">Doctor</SelectItem>
                    <SelectItem value="nurse">Nurse</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Select defaultValue={selectedUser?.department || ""}>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                placeholder="+1 (555) 000-0000"
                defaultValue={selectedUser?.phone}
                className="rounded-xl"
              />
            </div>
          </form>

          <DialogFooter>
            <Button 
              variant="outline" 
              className="rounded-xl"
              onClick={() => {
                setIsAddModalOpen(false);
                setSelectedUser(null);
              }}
            >
              Cancel
            </Button>
            <Button className="rounded-xl bg-primary hover:bg-primary/90">
              {selectedUser ? "Save Changes" : "Create User"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="max-w-sm rounded-2xl">
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>{selectedUser?.fullName}</strong>? 
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              className="rounded-xl"
              onClick={() => {
                setIsDeleteModalOpen(false);
                setSelectedUser(null);
              }}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              className="rounded-xl"
              onClick={handleDeleteUser}
            >
              Delete User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
