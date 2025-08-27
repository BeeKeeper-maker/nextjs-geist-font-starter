"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Fee {
  id: number;
  feeType: string;
  amount: number;
  dueDate: string;
  paidDate?: string;
  status: string;
  remarks?: string;
  paidAmount: number;
  student: {
    id: number;
    name: string;
    rollNumber: string;
    class: {
      id: number;
      name: string;
    };
  };
}

export default function FeesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [fees, setFees] = useState<Fee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [classFilter, setClassFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.push("/auth/signin");
      return;
    }
    fetchFees();
  }, [session, status, router]);

  const fetchFees = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/fees?class=${classFilter}&status=${statusFilter}`);
      const result = await response.json();

      if (result.success) {
        setFees(Array.isArray(result.data) ? result.data : []);
      } else {
        setError(result.error || "Failed to load fees");
      }
    } catch (err) {
      setError("Failed to load fees");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session) {
      fetchFees();
    }
  }, [classFilter, statusFilter]);

  const handleUpdatePaymentStatus = async (feeId: number, status: string) => {
    try {
      const response = await fetch(`/api/fees/${feeId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          status,
          paidAmount: status === "paid" ? fees.find(f => f.id === feeId)?.amount : 0,
          paidDate: status === "paid" ? new Date().toISOString() : null
        })
      });

      const result = await response.json();
      if (result.success) {
        fetchFees();
        setError("");
      } else {
        setError(result.error || "Failed to update payment status");
      }
    } catch (err) {
      setError("Failed to update payment status");
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: { [key: string]: "default" | "secondary" | "destructive" | "outline" } = {
      paid: "default",
      pending: "secondary",
      overdue: "destructive"
    };
    return <Badge variant={variants[status] || "outline"}>{status.toUpperCase()}</Badge>;
  };

  const filteredFees = (fees || []).filter(fee => {
    const matchesSearch = 
      fee?.student?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fee?.student?.rollNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fee?.feeType?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  if (status === "loading" || loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Fee Management</h1>
          <p className="text-gray-600">Manage student fee invoices and payments</p>
        </div>
        <Button onClick={() => router.push("/fees/create")}>
          Create Fee Invoice
        </Button>
      </div>

      {error && (
        <Alert>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Search & Filter</CardTitle>
          <CardDescription>Find fees by student name, roll number, or fee type</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Input
                placeholder="Search fees..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Button variant="outline" onClick={() => {
                setSearchTerm("");
                setStatusFilter("all");
                setClassFilter("all");
              }}>
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Fees List */}
      <Card>
        <CardHeader>
          <CardTitle>Fee Records ({filteredFees.length})</CardTitle>
          <CardDescription>All fee invoices and payment records</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredFees.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No fee records found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Student</th>
                    <th className="text-left p-2">Class</th>
                    <th className="text-left p-2">Fee Type</th>
                    <th className="text-left p-2">Amount</th>
                    <th className="text-left p-2">Due Date</th>
                    <th className="text-left p-2">Status</th>
                    <th className="text-left p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredFees.map((fee) => (
                    <tr key={fee.id} className="border-b hover:bg-gray-50">
                      <td className="p-2">
                        <div>
                          <div className="font-medium">{fee.student?.name}</div>
                          <div className="text-sm text-gray-500">{fee.student?.rollNumber}</div>
                        </div>
                      </td>
                      <td className="p-2">{fee.student?.class?.name}</td>
                      <td className="p-2">{fee.feeType}</td>
                      <td className="p-2">৳{fee.amount}</td>
                      <td className="p-2">{new Date(fee.dueDate).toLocaleDateString()}</td>
                      <td className="p-2">{getStatusBadge(fee.status)}</td>
                      <td className="p-2">
                        <div className="flex gap-2">
                          {fee.status === "pending" && (
                            <Button
                              size="sm"
                              onClick={() => handleUpdatePaymentStatus(fee.id, "paid")}
                            >
                              Mark Paid
                            </Button>
                          )}
                          {fee.status === "paid" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleUpdatePaymentStatus(fee.id, "pending")}
                            >
                              Mark Unpaid
                            </Button>
                          )}
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
    </div>
  );
}
