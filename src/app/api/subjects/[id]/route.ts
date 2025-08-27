import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/database";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: "Invalid subject ID" },
        { status: 400 }
      );
    }

    const subject = await prisma.subject.findUnique({
      where: { id },
      include: {
        class: {
          select: {
            id: true,
            name: true,
            section: true
          }
        },
        exams: true
      }
    });

    if (!subject) {
      return NextResponse.json(
        { success: false, error: "Subject not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      subject
    });
  } catch (error) {
    console.error("Error fetching subject:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch subject" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: "Invalid subject ID" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { name, code, classId, description } = body;

    // Validate required fields
    if (!name || !classId) {
      return NextResponse.json(
        { success: false, error: "Subject name and class are required" },
        { status: 400 }
      );
    }

    // Check if subject exists
    const existingSubject = await prisma.subject.findUnique({
      where: { id }
    });

    if (!existingSubject) {
      return NextResponse.json(
        { success: false, error: "Subject not found" },
        { status: 404 }
      );
    }

    // Check if class exists
    const classExists = await prisma.class.findUnique({
      where: { id: classId }
    });

    if (!classExists) {
      return NextResponse.json(
        { success: false, error: "Selected class does not exist" },
        { status: 400 }
      );
    }

    // Check if subject code is unique (if provided and different from current)
    if (code && code !== existingSubject.code) {
      const codeExists = await prisma.subject.findUnique({
        where: { code }
      });

      if (codeExists) {
        return NextResponse.json(
          { success: false, error: "Subject code already exists" },
          { status: 400 }
        );
      }
    }

    const subject = await prisma.subject.update({
      where: { id },
      data: {
        name,
        code: code || null,
        classId,
        description: description || null
      },
      include: {
        class: {
          select: {
            id: true,
            name: true,
            section: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      subject,
      message: "Subject updated successfully"
    });
  } catch (error) {
    console.error("Error updating subject:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update subject" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: "Invalid subject ID" },
        { status: 400 }
      );
    }

    // Check if subject exists
    const existingSubject = await prisma.subject.findUnique({
      where: { id },
      include: {
        exams: true
      }
    });

    if (!existingSubject) {
      return NextResponse.json(
        { success: false, error: "Subject not found" },
        { status: 404 }
      );
    }

    // Check if subject has associated exams
    if (existingSubject.exams.length > 0) {
      return NextResponse.json(
        { success: false, error: "Cannot delete subject with existing exam records" },
        { status: 400 }
      );
    }

    await prisma.subject.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: "Subject deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting subject:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete subject" },
      { status: 500 }
    );
  }
}
