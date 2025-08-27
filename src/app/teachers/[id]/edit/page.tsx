"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { redirect, useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
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
  qualification?: string;
  specialization?: string;
  subjects?: string;
  dateOfBirth?: string;
  gender?: string;
  contactNumber?: string;
  email?: string;
  presentAddress?: string;
  permanentAddress?: string;
  joiningDate?: string;
  salary?: number;
  isActive: boolean;
}

export default function EditTeacherPage() {
  const { data: session, status } = useSession();
  const params = useParams();
  const router = useRouter();
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState("");

  // Form state
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
    if (session && params.id) {
      fetchTeacher();
    }
  }, [session, params.id]);

  const fetchTeacher = async () => {
    try {
      const response = await fetch(`/api/teachers/${params.id}`);
      const result = await response.json();

      if (result.success) {
        const teacherData = result.data;
        setTeacher(teacherData);
        
        // Populate form with existing data
        setFormData({
          name: teacherData.name || "",
          employeeId: teacherData.employeeId || "",
          designation: teacherData.designation || "",
          specialization: teacherData.specialization || "",
          subjects: teacherData.subjects || "",
          dateOfBirth: teacherData.dateOfBirth ? teacherData.dateOfBirth.split('T')[0] : "",
          gender: teacherData.gender || "",
          contactNumber: teacherData.contactNumber || "",
          email: teacherData.email || "",
          presentAddress: teacherData.presentAddress || "",
          permanentAddress: teacherData.permanentAddress || "",
          qualification: teacherData.qualification || "",
          joiningDate: teacherData.joiningDate ? teacherData.joiningDate.split('T')[0] : "",
          salary: teacherData.salary?.toString() || "",
          isActive: teacherData.isActive,
        });
      } else {
        setError(result.error || "Failed to load teacher details");
      }
    } catch (err) {
      setError("Failed to load teacher details");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);

    try {
      const response = await fetch(`/api/teachers/${params.id}`, {
        method: "PUT",
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
        toast.success("Teacher updated successfully!");
        router.push(`/teachers/${params.id}`);
      } else {
        toast.error(result.error || "Failed to update teacher");
      }
    } catch (err) {
      toast.error("Failed to update teacher");
    } finally {
      setFormLoading(false);
    }
  };

  if (status === "loading" || loading) {
    return <EditTeacherSkeleton />;
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

  if (!teacher) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Alert className="max-w-md">
          <AlertDescription>Teacher not found</AlertDescription>
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
              <h1 className="text-3xl font-bold text-gray-900">Edit Teacher</h1>
              <p className="text-sm text-gray-600 mt-1">Update {teacher.name}'s information</p>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" asChild>
                <Link href={`/teachers/${teacher.id}`}>Cancel</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Teacher Information</CardTitle>
            <CardDescription>Update the teacher's details below</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
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
                <Button type="button" variant="outline" asChild>
                  <Link href={`/teachers/${teacher.id}`}>Cancel</Link>
                </Button>
                <Button type="submit" disabled={formLoading}>
                  {formLoading ? "Updating..." : "Update Teacher"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

function EditTeacherSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32 mb-2" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="space-y-4">
                  <Skeleton className="h-6 w-32" />
                  <div className="grid grid-cols-2 gap-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
