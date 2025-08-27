"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import Link from "next/link";

interface Teacher {
  id: number;
  name: string;
  employeeId: string;
  designation?: string;
  specialization?: string;
  subjects?: string;
  contactNumber?: string;
  email?: string;
  isActive: boolean;
}

export default function TeachersPage() {
  const { data: session, status } = useSession();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [filteredTeachers, setFilteredTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  // Form state for adding new teacher
  const [formData, setFormData] = useState({
    name: "",
    employeeId: "",
    designation: "",
    specialization: "",
    subjects: "",
    dateOfBirth: "",
    gender: "",
    contactNumber: "",
    email: "",
    presentAddress: "",
    permanentAddress: "",
    qualification: "",
    joiningDate: "",
    salary: "",
    isActive: true,
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      redirect("/auth/signin");
    }
  }, [status]);

  useEffect(() => {
    if (session) {
      fetchTeachers();
    }
  }, [session]);

  useEffect(() => {
    // Filter teachers based on search term
    if (searchTerm.trim() === "") {
      setFilteredTeachers(teachers || []);
    } else {
      const filtered = (teachers || []).filter(
        (teacher) =>
          teacher?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          teacher?.employeeId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          teacher?.designation?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          teacher?.subjects?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredTeachers(filtered);
    }
  }, [searchTerm, teachers]);

  const fetchTeachers = async () => {
    try {
      const response = await fetch("/api/teachers");
      const result = await response.json();

      if (result.success && result.data) {
        const teachersData = Array.isArray(result.data) ? result.data : [];
        setTeachers(teachersData);
        setFilteredTeachers(teachersData);
      } else {
        setError(result.error || "Failed to load teachers");
      }
    } catch (err) {
      setError("Failed to load teachers");
    } finally {
      setLoading(false);
    }
  };

  const handleAddTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);

    try {
      const response = await fetch("/api/teachers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          salary: formData.salary ? parseFloat(formData.salary) : null,
          joiningDate: formData.joiningDate || null,
          dateOfBirth: formData.dateOfBirth || null,
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success("Teacher added successfully!");
        setIsAddDialogOpen(false);
        setFormData({
          name: "",
          employeeId: "",
          designation: "",
          specialization: "",
          subjects: "",
          dateOfBirth: "",
          gender: "",
          contactNumber: "",
          email: "",
          presentAddress: "",
          permanentAddress: "",
          qualification: "",
          joiningDate: "",
          salary: "",
          isActive: true,
        });
        fetchTeachers();
      } else {
        toast.error(result.error || "Failed to add teacher");
      }
    } catch (err) {
      toast.error("Failed to add teacher");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteTeacher = async (id: number, name: string) => {
    if (!confirm(`Are you sure you want to delete ${name}? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/teachers/${id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (result.success) {
        toast.success("Teacher deleted successfully!");
        fetchTeachers();
      } else {
        toast.error(result.error || "Failed to delete teacher");
      }
    } catch (err) {
      toast.error("Failed to delete teacher");
    }
  };

  const clearSearch = () => {
    setSearchTerm("");
  };

  if (status === "loading" || loading) {
    return <TeachersPageSkeleton />;
  }

  if (!session) {
    return null;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Alert className="max-w-md">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Teachers Management</h1>
              <p className="text-sm text-gray-600 mt-1">Manage teacher records and information</p>
            </div>
            <div className="flex items-center space-x-4">
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button>Add New Teacher</Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Add New Teacher</DialogTitle>
                    <DialogDescription>
                      Enter the teacher's information below to add them to the system.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleAddTeacher} className="space-y-6">
                    {/* Basic Information */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Basic Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Full Name *</Label>
                          <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="Enter teacher's full name"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="employeeId">Employee ID *</Label>
                          <Input
                            id="employeeId"
                            value={formData.employeeId}
                            onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                            placeholder="Enter employee ID"
                            required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="designation">Designation</Label>
                          <Select value={formData.designation} onValueChange={(value) => setFormData({ ...formData, designation: value })}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select designation" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="প্রধান শিক্ষক">প্রধান শিক্ষক (Principal)</SelectItem>
                              <SelectItem value="সহকারী প্রধান শিক্ষক">সহকারী প্রধান শিক্ষক (Assistant Principal)</SelectItem>
                              <SelectItem value="সিনিয়র শিক্ষক">সিনিয়র শিক্ষক (Senior Teacher)</SelectItem>
                              <SelectItem value="জুনিয়র শিক্ষক">জুনিয়র শিক্ষক (Junior Teacher)</SelectItem>
                              <SelectItem value="হিফজ শিক্ষক">হিফজ শিক্ষক (Hifz Teacher)</SelectItem>
                              <SelectItem value="কিতাব শিক্ষক">কিতাব শিক্ষক (Kitab Teacher)</SelectItem>
                              <SelectItem value="আরবি শিক্ষক">আরবি শিক্ষক (Arabic Teacher)</SelectItem>
                              <SelectItem value="ইংরেজি শিক্ষক">ইংরেজি শিক্ষক (English Teacher)</SelectItem>
                              <SelectItem value="গণিত শিক্ষক">গণিত শিক্ষক (Math Teacher)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="specialization">Specialization</Label>
                          <Input
                            id="specialization"
                            value={formData.specialization}
                            onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                            placeholder="e.g., Quran, Hadith, Fiqh"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="dateOfBirth">Date of Birth</Label>
                          <Input
                            id="dateOfBirth"
                            type="date"
                            value={formData.dateOfBirth}
                            onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="gender">Gender</Label>
                          <Select value={formData.gender} onValueChange={(value) => setFormData({ ...formData, gender: value })}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select gender" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="male">Male</SelectItem>
                              <SelectItem value="female">Female</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    {/* Academic Information */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Academic Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="subjects">Subjects Taught</Label>
                          <Textarea
                            id="subjects"
                            value={formData.subjects}
                            onChange={(e) => setFormData({ ...formData, subjects: e.target.value })}
                            placeholder="Enter subjects separated by commas"
                            rows={3}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="qualification">Educational Qualifications</Label>
                          <Textarea
                            id="qualification"
                            value={formData.qualification}
                            onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                            placeholder="Enter educational qualifications"
                            rows={3}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Contact Information */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Contact Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="contactNumber">Contact Number</Label>
                          <Input
                            id="contactNumber"
                            value={formData.contactNumber}
                            onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                            placeholder="Enter contact number"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            placeholder="Enter email address"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="presentAddress">Present Address</Label>
                          <Textarea
                            id="presentAddress"
                            value={formData.presentAddress}
                            onChange={(e) => setFormData({ ...formData, presentAddress: e.target.value })}
                            placeholder="Enter present address"
                            rows={3}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="permanentAddress">Permanent Address</Label>
                          <Textarea
                            id="permanentAddress"
                            value={formData.permanentAddress}
                            onChange={(e) => setFormData({ ...formData, permanentAddress: e.target.value })}
                            placeholder="Enter permanent address"
                            rows={3}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Employment Information */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Employment Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="joiningDate">Joining Date</Label>
                          <Input
                            id="joiningDate"
                            type="date"
                            value={formData.joiningDate}
                            onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="salary">Monthly Salary (BDT)</Label>
                          <Input
                            id="salary"
                            type="number"
                            value={formData.salary}
                            onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                            placeholder="Enter monthly salary"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Status */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Status</h3>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="isActive"
                          checked={formData.isActive}
                          onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                        />
                        <Label htmlFor="isActive">Active Teacher</Label>
                      </div>
                    </div>

                    {/* Submit Buttons */}
                    <div className="flex justify-end space-x-2 pt-6">
                      <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={formLoading}>
                        {formLoading ? "Adding..." : "Add Teacher"}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
              <Button variant="outline" asChild>
                <Link href="/dashboard">Back to Dashboard</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Search Teachers</CardTitle>
            <CardDescription>Find teachers by name, employee ID, designation, or subjects</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Input
                placeholder="Search teachers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1"
              />
              <Button variant="outline" onClick={clearSearch}>
                Clear
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Teachers List */}
        <Card>
          <CardHeader>
            <CardTitle>Teachers List ({filteredTeachers.length})</CardTitle>
            <CardDescription>All registered teachers in the madrasha</CardDescription>
          </CardHeader>
          <CardContent>
            {filteredTeachers.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No teachers found.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-4 font-medium">Employee ID</th>
                      <th className="text-left p-4 font-medium">Name</th>
                      <th className="text-left p-4 font-medium">Designation</th>
                      <th className="text-left p-4 font-medium">Subjects</th>
                      <th className="text-left p-4 font-medium">Contact</th>
                      <th className="text-left p-4 font-medium">Status</th>
                      <th className="text-left p-4 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTeachers.map((teacher) => (
                      <tr key={teacher.id} className="border-b hover:bg-gray-50">
                        <td className="p-4 font-mono text-sm">{teacher.employeeId}</td>
                        <td className="p-4">
                          <div>
                            <div className="font-medium">{teacher.name}</div>
                            {teacher.email && (
                              <div className="text-sm text-gray-500">{teacher.email}</div>
                            )}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="text-sm">
                            {teacher.designation || "Not specified"}
                          </div>
                          {teacher.specialization && (
                            <div className="text-xs text-gray-500">{teacher.specialization}</div>
                          )}
                        </td>
                        <td className="p-4">
                          <div className="text-sm">
                            {teacher.subjects ? (
                              teacher.subjects.length > 50 ? 
                                `${teacher.subjects.substring(0, 50)}...` : 
                                teacher.subjects
                            ) : "Not specified"}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="text-sm">
                            {teacher.contactNumber || "Not provided"}
                          </div>
                        </td>
                        <td className="p-4">
                          <Badge variant={teacher.isActive ? "default" : "secondary"}>
                            {teacher.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <div className="flex space-x-2">
                            <Button size="sm" variant="outline" asChild>
                              <Link href={`/teachers/${teacher.id}`}>View</Link>
                            </Button>
                            <Button size="sm" variant="outline" asChild>
                              <Link href={`/teachers/${teacher.id}/edit`}>Edit</Link>
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDeleteTeacher(teacher.id, teacher.name)}
                            >
                              Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

function TeachersPageSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="mb-8">
          <CardHeader>
            <Skeleton className="h-6 w-32 mb-2" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32 mb-2" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
