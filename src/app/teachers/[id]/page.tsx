"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { redirect, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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
  createdAt: string;
  updatedAt: string;
}

export default function TeacherDetailPage() {
  const { data: session, status } = useSession();
  const params = useParams();
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
        setTeacher(result.data);
      } else {
        setError(result.error || "Failed to load teacher details");
      }
    } catch (err) {
      setError("Failed to load teacher details");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Not provided";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatCurrency = (amount?: number) => {
    if (!amount) return "Not specified";
    return new Intl.NumberFormat("en-BD", {
      style: "currency",
      currency: "BDT",
    }).format(amount);
  };

  if (status === "loading" || loading) {
    return <TeacherDetailSkeleton />;
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
              <h1 className="text-3xl font-bold text-gray-900">Teacher Details</h1>
              <p className="text-sm text-gray-600 mt-1">
                Complete information for {teacher.name}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Button asChild>
                <Link href={`/teachers/${teacher.id}/edit`}>Edit Teacher</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/teachers">Back to Teachers</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid gap-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl">{teacher.name}</CardTitle>
                  <CardDescription className="text-lg mt-1">
                    Employee ID: {teacher.employeeId}
                  </CardDescription>
                </div>
                <Badge variant={teacher.isActive ? "default" : "secondary"} className="text-sm">
                  {teacher.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Personal Information</h3>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm font-medium text-gray-500">Designation:</span>
                      <p className="text-sm text-gray-900">{teacher.designation || "Not specified"}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Specialization:</span>
                      <p className="text-sm text-gray-900">{teacher.specialization || "Not specified"}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Date of Birth:</span>
                      <p className="text-sm text-gray-900">{formatDate(teacher.dateOfBirth)}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Gender:</span>
                      <p className="text-sm text-gray-900 capitalize">{teacher.gender || "Not specified"}</p>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Employment Information</h3>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm font-medium text-gray-500">Joining Date:</span>
                      <p className="text-sm text-gray-900">{formatDate(teacher.joiningDate)}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Monthly Salary:</span>
                      <p className="text-sm text-gray-900">{formatCurrency(teacher.salary)}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Status:</span>
                      <p className="text-sm text-gray-900">{teacher.isActive ? "Active" : "Inactive"}</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Academic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Academic Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Subjects Taught</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-900 whitespace-pre-wrap">
                      {teacher.subjects || "No subjects specified"}
                    </p>
                  </div>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Educational Qualifications</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-900 whitespace-pre-wrap">
                      {teacher.qualification || "No qualifications specified"}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Contact Details</h3>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm font-medium text-gray-500">Phone Number:</span>
                      <p className="text-sm text-gray-900">{teacher.contactNumber || "Not provided"}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Email Address:</span>
                      <p className="text-sm text-gray-900">{teacher.email || "Not provided"}</p>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Address Information</h3>
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm font-medium text-gray-500">Present Address:</span>
                      <div className="bg-gray-50 p-3 rounded mt-1">
                        <p className="text-sm text-gray-900 whitespace-pre-wrap">
                          {teacher.presentAddress || "Not provided"}
                        </p>
                      </div>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Permanent Address:</span>
                      <div className="bg-gray-50 p-3 rounded mt-1">
                        <p className="text-sm text-gray-900 whitespace-pre-wrap">
                          {teacher.permanentAddress || "Not provided"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* System Information */}
          <Card>
            <CardHeader>
              <CardTitle>System Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <span className="text-sm font-medium text-gray-500">Record Created:</span>
                  <p className="text-sm text-gray-900">{formatDate(teacher.createdAt)}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Last Updated:</span>
                  <p className="text-sm text-gray-900">{formatDate(teacher.updatedAt)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

function TeacherDetailSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                  <div className="space-y-3">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
