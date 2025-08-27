"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { PERMISSIONS, hasPermission } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import Link from "next/link";

interface Student {
  id: number;
  name: string;
  rollNumber: string;
  class: {
    id: number;
    name: string;
  };
  fatherName?: string;
  motherName?: string;
  contactNumber?: string;
  email?: string;
  presentAddress?: string;
  guardianName?: string;
  guardianPhone?: string;
  isActive: boolean;
  enrollmentDate: string;
}

interface Class {
  id: number;
  name: string;
}

export default function StudentsPage() {
  const { data: session, status } = useSession();
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    rollNumber: "",
    classId: "",
    fatherName: "",
    motherName: "",
    contactNumber: "",
    email: "",
    presentAddress: "",
    guardianName: "",
    guardianPhone: "",
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      redirect("/auth/signin");
    }
    if (session?.user && !hasPermission(session.user.role, PERMISSIONS.VIEW_STUDENTS)) {
      redirect("/unauthorized");
    }
  }, [status, session]);

  useEffect(() => {
    if (session) {
      fetchStudents();
      fetchClasses();
    }
  }, [session]);

  const fetchStudents = async () => {
    try {
      const response = await fetch("/api/students");
      const result = await response.json();

      if (result.success && result.data) {
        setStudents(Array.isArray(result.data) ? result.data : []);
      } else {
        setError(result.error || "Failed to load students");
      }
    } catch (err) {
      setError("Failed to load students");
    } finally {
      setLoading(false);
    }
  };

  const fetchClasses = async () => {
    try {
      const response = await fetch("/api/classes");
      const result = await response.json();

      if (result.success && result.data) {
        setClasses(Array.isArray(result.data) ? result.data : []);
      }
    } catch (err) {
      console.error("Failed to load classes");
    }
  };

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);

    try {
      const response = await fetch("/api/students", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          classId: parseInt(formData.classId),
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success("Student added successfully!");
        setShowAddDialog(false);
        resetForm();
        fetchStudents();
      } else {
        toast.error(result.error || "Failed to add student");
      }
    } catch (err) {
      toast.error("Failed to add student");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteStudent = async () => {
    if (!selectedStudent) return;
    setFormLoading(true);

    try {
      const response = await fetch(`/api/students/${selectedStudent.id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (result.success) {
        toast.success("Student deleted successfully!");
        setShowDeleteDialog(false);
        setSelectedStudent(null);
        fetchStudents();
      } else {
        toast.error(result.error || "Failed to delete student");
      }
    } catch (err) {
      toast.error("Failed to delete student");
    } finally {
      setFormLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      rollNumber: "",
      classId: "",
      fatherName: "",
      motherName: "",
      contactNumber: "",
      email: "",
      presentAddress: "",
      guardianName: "",
      guardianPhone: "",
    });
  };

  const filteredStudents = (students || []).filter(student =>
    student?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student?.rollNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student?.class?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (status === "loading" || loading) {
    return <StudentsSkeleton />;
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Students Management</h1>
              <p className="text-sm text-gray-600 mt-1">Manage student records and information</p>
            </div>
            <div className="flex items-center space-x-4">
              {hasPermission(session.user.role, PERMISSIONS.MANAGE_STUDENTS) && (
                <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                  <DialogTrigger asChild>
                    <Button>Add New Student</Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Add New Student</DialogTitle>
                      <DialogDescription>
                        Enter the student's information to register them in the madrasha.
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleAddStudent} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Full Name *</Label>
                          <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="Enter student's full name"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="rollNumber">Roll Number *</Label>
                          <Input
                            id="rollNumber"
                            value={formData.rollNumber}
                            onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })}
                            placeholder="Enter roll number"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="classId">Class *</Label>
                        <Select value={formData.classId} onValueChange={(value) => setFormData({ ...formData, classId: value })}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a class" />
                          </SelectTrigger>
                          <SelectContent>
                            {classes.map((cls) => (
                              <SelectItem key={cls.id} value={cls.id.toString()}>
                                {cls.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="fatherName">Father's Name</Label>
                          <Input
                            id="fatherName"
                            value={formData.fatherName}
                            onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })}
                            placeholder="Enter father's name"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="motherName">Mother's Name</Label>
                          <Input
                            id="motherName"
                            value={formData.motherName}
                            onChange={(e) => setFormData({ ...formData, motherName: e.target.value })}
                            placeholder="Enter mother's name"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
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

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="guardianName">Guardian Name</Label>
                          <Input
                            id="guardianName"
                            value={formData.guardianName}
                            onChange={(e) => setFormData({ ...formData, guardianName: e.target.value })}
                            placeholder="Enter guardian's name"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="guardianPhone">Guardian Phone</Label>
                          <Input
                            id="guardianPhone"
                            value={formData.guardianPhone}
                            onChange={(e) => setFormData({ ...formData, guardianPhone: e.target.value })}
                            placeholder="Enter guardian's phone"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end space-x-2 pt-4">
                        <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)}>
                          Cancel
                        </Button>
                        <Button type="submit" disabled={formLoading}>
                          {formLoading ? "Adding..." : "Add Student"}
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              )}
              <Button variant="outline" asChild>
                <Link href="/dashboard">Back to Dashboard</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <Alert className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Search and Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Search Students</CardTitle>
            <CardDescription>Find students by name, roll number, or class</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-4">
              <Input
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
              <Button variant="outline" onClick={() => setSearchTerm("")}>
                Clear
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Students Table */}
        <Card>
          <CardHeader>
            <CardTitle>Students List ({filteredStudents.length})</CardTitle>
            <CardDescription>All registered students in the madrasha</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Roll Number</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>Father's Name</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        {searchTerm ? "No students found matching your search." : "No students registered yet."}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredStudents.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell className="font-medium">{student.rollNumber}</TableCell>
                        <TableCell className="font-medium">{student.name}</TableCell>
                        <TableCell>{student.class.name}</TableCell>
                        <TableCell>{student.fatherName || "N/A"}</TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {student.contactNumber && <div>{student.contactNumber}</div>}
                            {student.email && <div className="text-gray-500">{student.email}</div>}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={student.isActive ? "default" : "secondary"}>
                            {student.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button asChild size="sm" variant="outline">
                              <Link href={`/students/${student.id}`}>View Details</Link>
                            </Button>
                            {hasPermission(session.user.role, PERMISSIONS.MANAGE_STUDENTS) && (
                              <>
                                <Button asChild size="sm" variant="outline">
                                  <Link href={`/students/${student.id}/edit`}>Edit</Link>
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="destructive"
                                  onClick={() => {
                                    setSelectedStudent(student);
                                    setShowDeleteDialog(true);
                                  }}
                                >
                                  Delete
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Student</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedStudent?.name}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteStudent} disabled={formLoading}>
              {formLoading ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function StudentsSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="mb-6">
          <CardHeader>
            <Skeleton className="h-6 w-32 mb-2" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-10 w-64" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32 mb-2" />
            <Skeleton className="h-4 w-48" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
