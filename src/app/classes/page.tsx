"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import Link from "next/link";

interface Class {
  id: number;
  name: string;
  section?: string;
  teacherId?: number;
  capacity?: number;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  teacher?: {
    name: string;
    employeeId: string;
  };
  _count?: {
    students: number;
    subjects: number;
  };
}

interface Subject {
  id: number;
  name: string;
  code?: string;
  classId: number;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  class: {
    name: string;
  };
}

export default function ClassesPage() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [subjectSearchTerm, setSubjectSearchTerm] = useState("");
  
  // Class form states
  const [isClassDialogOpen, setIsClassDialogOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<Class | null>(null);
  const [classForm, setClassForm] = useState({
    name: "",
    section: "",
    teacherId: "",
    capacity: "",
    description: ""
  });

  // Subject form states
  const [isSubjectDialogOpen, setIsSubjectDialogOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [subjectForm, setSubjectForm] = useState({
    name: "",
    code: "",
    classId: "",
    description: ""
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [classesRes, subjectsRes, teachersRes] = await Promise.all([
        fetch("/api/classes"),
        fetch("/api/subjects"),
        fetch("/api/teachers")
      ]);

      if (classesRes.ok) {
        const classesData = await classesRes.json();
        setClasses(classesData.classes || []);
      }

      if (subjectsRes.ok) {
        const subjectsData = await subjectsRes.json();
        setSubjects(subjectsData.subjects || []);
      }

      if (teachersRes.ok) {
        const teachersData = await teachersRes.json();
        setTeachers(teachersData.teachers || []);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleClassSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingClass ? `/api/classes/${editingClass.id}` : "/api/classes";
      const method = editingClass ? "PUT" : "POST";
      
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...classForm,
          teacherId: classForm.teacherId ? parseInt(classForm.teacherId) : null,
          capacity: classForm.capacity ? parseInt(classForm.capacity) : null
        })
      });

      if (response.ok) {
        toast.success(editingClass ? "Class updated successfully" : "Class created successfully");
        setIsClassDialogOpen(false);
        resetClassForm();
        fetchData();
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to save class");
      }
    } catch (error) {
      console.error("Error saving class:", error);
      toast.error("Failed to save class");
    }
  };

  const handleSubjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingSubject ? `/api/subjects/${editingSubject.id}` : "/api/subjects";
      const method = editingSubject ? "PUT" : "POST";
      
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...subjectForm,
          classId: parseInt(subjectForm.classId)
        })
      });

      if (response.ok) {
        toast.success(editingSubject ? "Subject updated successfully" : "Subject created successfully");
        setIsSubjectDialogOpen(false);
        resetSubjectForm();
        fetchData();
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to save subject");
      }
    } catch (error) {
      console.error("Error saving subject:", error);
      toast.error("Failed to save subject");
    }
  };

  const handleDeleteClass = async (id: number) => {
    if (!confirm("Are you sure you want to delete this class? This will also delete all associated subjects.")) {
      return;
    }

    try {
      const response = await fetch(`/api/classes/${id}`, { method: "DELETE" });
      if (response.ok) {
        toast.success("Class deleted successfully");
        fetchData();
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to delete class");
      }
    } catch (error) {
      console.error("Error deleting class:", error);
      toast.error("Failed to delete class");
    }
  };

  const handleDeleteSubject = async (id: number) => {
    if (!confirm("Are you sure you want to delete this subject?")) {
      return;
    }

    try {
      const response = await fetch(`/api/subjects/${id}`, { method: "DELETE" });
      if (response.ok) {
        toast.success("Subject deleted successfully");
        fetchData();
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to delete subject");
      }
    } catch (error) {
      console.error("Error deleting subject:", error);
      toast.error("Failed to delete subject");
    }
  };

  const resetClassForm = () => {
    setClassForm({ name: "", section: "", teacherId: "", capacity: "", description: "" });
    setEditingClass(null);
  };

  const resetSubjectForm = () => {
    setSubjectForm({ name: "", code: "", classId: "", description: "" });
    setEditingSubject(null);
  };

  const openEditClass = (classItem: Class) => {
    setEditingClass(classItem);
    setClassForm({
      name: classItem.name,
      section: classItem.section || "",
      teacherId: classItem.teacherId?.toString() || "",
      capacity: classItem.capacity?.toString() || "",
      description: classItem.description || ""
    });
    setIsClassDialogOpen(true);
  };

  const openEditSubject = (subject: Subject) => {
    setEditingSubject(subject);
    setSubjectForm({
      name: subject.name,
      code: subject.code || "",
      classId: subject.classId.toString(),
      description: subject.description || ""
    });
    setIsSubjectDialogOpen(true);
  };

  const filteredClasses = classes.filter(cls =>
    cls.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cls.section?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cls.teacher?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredSubjects = subjects.filter(subject =>
    subject.name.toLowerCase().includes(subjectSearchTerm.toLowerCase()) ||
    subject.code?.toLowerCase().includes(subjectSearchTerm.toLowerCase()) ||
    subject.class.name.toLowerCase().includes(subjectSearchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Classes & Subjects Management</h1>
          <p className="text-muted-foreground">Manage classes and their associated subjects</p>
        </div>
        <Link href="/dashboard">
          <Button variant="outline">Back to Dashboard</Button>
        </Link>
      </div>

      <Tabs defaultValue="classes" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="classes">Classes Management</TabsTrigger>
          <TabsTrigger value="subjects">Subjects Management</TabsTrigger>
        </TabsList>

        {/* Classes Tab */}
        <TabsContent value="classes" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Classes</CardTitle>
                  <CardDescription>Manage academic classes and their details</CardDescription>
                </div>
                <Dialog open={isClassDialogOpen} onOpenChange={setIsClassDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={resetClassForm}>Add New Class</Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <form onSubmit={handleClassSubmit}>
                      <DialogHeader>
                        <DialogTitle>{editingClass ? "Edit Class" : "Add New Class"}</DialogTitle>
                        <DialogDescription>
                          {editingClass ? "Update class information" : "Create a new academic class"}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                          <Label htmlFor="className">Class Name *</Label>
                          <Input
                            id="className"
                            value={classForm.name}
                            onChange={(e) => setClassForm({ ...classForm, name: e.target.value })}
                            placeholder="e.g., হিফজ বিভাগ - ১ম বর্ষ"
                            required
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="section">Section</Label>
                          <Input
                            id="section"
                            value={classForm.section}
                            onChange={(e) => setClassForm({ ...classForm, section: e.target.value })}
                            placeholder="e.g., A, B, C"
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="teacher">Class Teacher</Label>
                          <Select value={classForm.teacherId} onValueChange={(value) => setClassForm({ ...classForm, teacherId: value })}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a teacher" />
                            </SelectTrigger>
                            <SelectContent>
                              {teachers.map((teacher) => (
                                <SelectItem key={teacher.id} value={teacher.id.toString()}>
                                  {teacher.name} ({teacher.employeeId})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="capacity">Capacity</Label>
                          <Input
                            id="capacity"
                            type="number"
                            value={classForm.capacity}
                            onChange={(e) => setClassForm({ ...classForm, capacity: e.target.value })}
                            placeholder="Maximum number of students"
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="description">Description</Label>
                          <Input
                            id="description"
                            value={classForm.description}
                            onChange={(e) => setClassForm({ ...classForm, description: e.target.value })}
                            placeholder="Class description"
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setIsClassDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button type="submit">
                          {editingClass ? "Update Class" : "Create Class"}
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Input
                    placeholder="Search classes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-sm"
                  />
                  <Button variant="outline" onClick={() => setSearchTerm("")}>
                    Clear
                  </Button>
                </div>

                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Class Name</TableHead>
                        <TableHead>Section</TableHead>
                        <TableHead>Teacher</TableHead>
                        <TableHead>Students</TableHead>
                        <TableHead>Subjects</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredClasses.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8">
                            No classes found
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredClasses.map((classItem) => (
                          <TableRow key={classItem.id}>
                            <TableCell className="font-medium">{classItem.name}</TableCell>
                            <TableCell>{classItem.section || "-"}</TableCell>
                            <TableCell>
                              {classItem.teacher ? (
                                <div>
                                  <div>{classItem.teacher.name}</div>
                                  <div className="text-sm text-muted-foreground">
                                    {classItem.teacher.employeeId}
                                  </div>
                                </div>
                              ) : (
                                "-"
                              )}
                            </TableCell>
                            <TableCell>{classItem._count?.students || 0}</TableCell>
                            <TableCell>{classItem._count?.subjects || 0}</TableCell>
                            <TableCell>
                              <Badge variant={classItem.isActive ? "default" : "secondary"}>
                                {classItem.isActive ? "Active" : "Inactive"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => openEditClass(classItem)}
                                >
                                  Edit
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => handleDeleteClass(classItem.id)}
                                >
                                  Delete
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Subjects Tab */}
        <TabsContent value="subjects" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Subjects</CardTitle>
                  <CardDescription>Manage subjects and assign them to classes</CardDescription>
                </div>
                <Dialog open={isSubjectDialogOpen} onOpenChange={setIsSubjectDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={resetSubjectForm}>Add New Subject</Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <form onSubmit={handleSubjectSubmit}>
                      <DialogHeader>
                        <DialogTitle>{editingSubject ? "Edit Subject" : "Add New Subject"}</DialogTitle>
                        <DialogDescription>
                          {editingSubject ? "Update subject information" : "Create a new subject and assign to a class"}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                          <Label htmlFor="subjectName">Subject Name *</Label>
                          <Input
                            id="subjectName"
                            value={subjectForm.name}
                            onChange={(e) => setSubjectForm({ ...subjectForm, name: e.target.value })}
                            placeholder="e.g., কুরআন, হাদিস, তাজবীদ"
                            required
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="subjectCode">Subject Code</Label>
                          <Input
                            id="subjectCode"
                            value={subjectForm.code}
                            onChange={(e) => setSubjectForm({ ...subjectForm, code: e.target.value })}
                            placeholder="e.g., QUR101, HAD201"
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="class">Class *</Label>
                          <Select value={subjectForm.classId} onValueChange={(value) => setSubjectForm({ ...subjectForm, classId: value })} required>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a class" />
                            </SelectTrigger>
                            <SelectContent>
                              {classes.map((classItem) => (
                                <SelectItem key={classItem.id} value={classItem.id.toString()}>
                                  {classItem.name} {classItem.section && `- ${classItem.section}`}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="subjectDescription">Description</Label>
                          <Input
                            id="subjectDescription"
                            value={subjectForm.description}
                            onChange={(e) => setSubjectForm({ ...subjectForm, description: e.target.value })}
                            placeholder="Subject description"
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setIsSubjectDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button type="submit">
                          {editingSubject ? "Update Subject" : "Create Subject"}
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Input
                    placeholder="Search subjects..."
                    value={subjectSearchTerm}
                    onChange={(e) => setSubjectSearchTerm(e.target.value)}
                    className="max-w-sm"
                  />
                  <Button variant="outline" onClick={() => setSubjectSearchTerm("")}>
                    Clear
                  </Button>
                </div>

                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Subject Name</TableHead>
                        <TableHead>Code</TableHead>
                        <TableHead>Class</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredSubjects.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8">
                            No subjects found
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredSubjects.map((subject) => (
                          <TableRow key={subject.id}>
                            <TableCell className="font-medium">{subject.name}</TableCell>
                            <TableCell>{subject.code || "-"}</TableCell>
                            <TableCell>{subject.class.name}</TableCell>
                            <TableCell>{subject.description || "-"}</TableCell>
                            <TableCell>
                              <Badge variant={subject.isActive ? "default" : "secondary"}>
                                {subject.isActive ? "Active" : "Inactive"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => openEditSubject(subject)}
                                >
                                  Edit
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => handleDeleteSubject(subject.id)}
                                >
                                  Delete
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
