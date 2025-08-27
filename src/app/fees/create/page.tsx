"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Student {
  id: number;
  name: string;
  rollNumber: string;
  class: {
    id: number;
    name: string;
  };
}

export default function CreateFeePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    studentId: "",
    feeType: "",
    amount: "",
    dueDate: "",
    remarks: ""
  });

  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.push("/auth/signin");
      return;
    }
    fetchStudents();
  }, [session, status, router]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/students");
      const result = await response.json();

      if (result.success) {
        setStudents(Array.isArray(result.data) ? result.data : []);
      } else {
        setError("Failed to load students");
      }
    } catch (err) {
      setError("Failed to load students");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.studentId || !formData.feeType || !formData.amount || !formData.dueDate) {
      setError("Please fill in all required fields");
      return;
    }

    try {
      setCreating(true);
      setError("");
      
      const response = await fetch("/api/fees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      const result = await response.json();
      
      if (result.success) {
        setSuccess("Fee invoice created successfully!");
        setTimeout(() => {
          router.push("/fees");
        }, 2000);
      } else {
        setError(result.error || "Failed to create fee invoice");
      }
    } catch (err) {
      setError("Failed to create fee invoice");
    } finally {
      setCreating(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError("");
  };

  if (status === "loading" || loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
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
          <h1 className="text-3xl font-bold">Create Fee Invoice</h1>
          <p className="text-gray-600">Create a new fee invoice for a student</p>
        </div>
        <Button variant="outline" onClick={() => router.push("/fees")}>
          Back to Fees
        </Button>
      </div>

      {error && (
        <Alert>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert>
          <AlertDescription className="text-green-600">{success}</AlertDescription>
        </Alert>
      )}

      {/* Form */}
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Fee Invoice Details</CardTitle>
          <CardDescription>Fill in the details for the new fee invoice</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Student Selection */}
            <div className="space-y-2">
              <Label htmlFor="student">Student *</Label>
              <Select value={formData.studentId} onValueChange={(value) => handleInputChange("studentId", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a student" />
                </SelectTrigger>
                <SelectContent>
                  {students.map((student) => (
                    <SelectItem key={student.id} value={student.id.toString()}>
                      {student.name} ({student.rollNumber}) - {student.class?.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Fee Type */}
            <div className="space-y-2">
              <Label htmlFor="feeType">Fee Type *</Label>
              <Select value={formData.feeType} onValueChange={(value) => handleInputChange("feeType", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select fee type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Monthly Tuition Fee">Monthly Tuition Fee</SelectItem>
                  <SelectItem value="Admission Fee">Admission Fee</SelectItem>
                  <SelectItem value="Exam Fee">Exam Fee</SelectItem>
                  <SelectItem value="Transport Fee">Transport Fee</SelectItem>
                  <SelectItem value="Library Fee">Library Fee</SelectItem>
                  <SelectItem value="Sports Fee">Sports Fee</SelectItem>
                  <SelectItem value="Development Fee">Development Fee</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Custom Fee Type Input */}
            {formData.feeType === "Other" && (
              <div className="space-y-2">
                <Label htmlFor="customFeeType">Custom Fee Type *</Label>
                <Input
                  id="customFeeType"
                  placeholder="Enter custom fee type"
                  value={formData.feeType === "Other" ? "" : formData.feeType}
                  onChange={(e) => handleInputChange("feeType", e.target.value)}
                />
              </div>
            )}

            {/* Amount */}
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (৳) *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                placeholder="Enter amount"
                value={formData.amount}
                onChange={(e) => handleInputChange("amount", e.target.value)}
              />
            </div>

            {/* Due Date */}
            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date *</Label>
              <Input
                id="dueDate"
                type="date"
                value={formData.dueDate}
                onChange={(e) => handleInputChange("dueDate", e.target.value)}
              />
            </div>

            {/* Remarks */}
            <div className="space-y-2">
              <Label htmlFor="remarks">Remarks (Optional)</Label>
              <Textarea
                id="remarks"
                placeholder="Enter any additional notes or remarks"
                value={formData.remarks}
                onChange={(e) => handleInputChange("remarks", e.target.value)}
                rows={3}
              />
            </div>

            {/* Submit Button */}
            <div className="flex gap-4">
              <Button type="submit" disabled={creating}>
                {creating ? "Creating..." : "Create Fee Invoice"}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.push("/fees")}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
