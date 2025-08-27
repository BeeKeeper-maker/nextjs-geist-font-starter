"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Link from "next/link";

interface DashboardStats {
  studentsCount: number;
  teachersCount: number;
  classesCount: number;
  totalRevenue: number;
  pendingFeesCount: number;
  todayAttendanceCount: number;
  recentExamsCount: number;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      redirect("/auth/signin");
    }
  }, [status]);

  useEffect(() => {
    if (session) {
      fetchDashboardStats();
    }
  }, [session]);

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch("/api/dashboard");
      const result = await response.json();

      if (result.success) {
        setStats(result.data);
      } else {
        setError(result.error || "Failed to load dashboard statistics");
      }
    } catch (err) {
      setError("Failed to load dashboard statistics");
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading" || loading) {
    return <DashboardSkeleton />;
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
              <h1 className="text-3xl font-bold text-gray-900">
                দারুল আবরার মডেল কামিল মাদ্রাসা
              </h1>
              <p className="text-sm text-gray-600 mt-1">Management System Dashboard</p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                Welcome, {session.user?.name}
              </span>
              <Button variant="outline" asChild>
                <Link href="/api/auth/signout">Sign Out</Link>
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

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Students"
            value={stats?.studentsCount || 0}
            description="Active students enrolled"
            href="/students"
          />
          <StatCard
            title="Total Teachers"
            value={stats?.teachersCount || 0}
            description="Active teaching staff"
            href="/teachers"
          />
          <StatCard
            title="Total Classes"
            value={stats?.classesCount || 0}
            description="Active classes running"
            href="/classes"
          />
          <StatCard
            title="Total Revenue"
            value={`৳${stats?.totalRevenue?.toLocaleString() || 0}`}
            description="Fees collected"
            href="/fees"
          />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common management tasks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button asChild className="w-full justify-start">
                <Link href="/students/new">Add New Student</Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start">
                <Link href="/teachers/new">Add New Teacher</Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start">
                <Link href="/classes/new">Create New Class</Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start">
                <Link href="/attendance">Mark Attendance</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest updates and notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Pending Fees</span>
                <span className="font-semibold">{stats?.pendingFeesCount || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Today's Attendance</span>
                <span className="font-semibold">{stats?.todayAttendanceCount || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Recent Exams</span>
                <span className="font-semibold">{stats?.recentExamsCount || 0}</span>
              </div>
              <Button asChild variant="outline" className="w-full mt-4">
                <Link href="/reports">View All Reports</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Navigation Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <NavCard title="Students" href="/students" description="Manage student records" />
          <NavCard title="Teachers" href="/teachers" description="Manage teaching staff" />
          <NavCard title="Classes" href="/classes" description="Manage classes & subjects" />
          <NavCard title="Fees" href="/fees" description="Fee management" />
          <NavCard title="Attendance" href="/attendance" description="Track attendance" />
          <NavCard title="Exams" href="/exams" description="Exam & results" />
          <NavCard title="Library" href="/library" description="Library management" />
          <NavCard title="Reports" href="/reports" description="Generate reports" />
        </div>
      </main>
    </div>
  );
}

function StatCard({ title, value, description, href }: {
  title: string;
  value: string | number;
  description: string;
  href: string;
}) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
        <Button asChild variant="link" className="p-0 h-auto mt-2">
          <Link href={href}>View Details →</Link>
        </Button>
      </CardContent>
    </Card>
  );
}

function NavCard({ title, href, description }: {
  title: string;
  href: string;
  description: string;
}) {
  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer">
      <Link href={href}>
        <CardHeader>
          <CardTitle className="text-lg">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
      </Link>
    </Card>
  );
}

function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Skeleton className="h-8 w-96 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-3 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
