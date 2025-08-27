import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/database";

export async function GET() {
  try {
    const subjects = await prisma.subject.findMany({
      include: {
        class: {
          select: {
            id: true,
            name: true,
            section: true
          }
        }
      },
      orderBy: [
        { class: { name: 'asc' } },
        { name: 'asc' }
      ]
    });

    return NextResponse.json({ 
      success: true, 
      subjects 
    });
  } catch (error) {
    console.error("Error fetching subjects:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch subjects" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
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

    // Check if subject code is unique (if provided)
    if (code) {
      const existingSubject = await prisma.subject.findUnique({
        where: { code }
      });

      if (existingSubject) {
        return NextResponse.json(
          { success: false, error: "Subject code already exists" },
          { status: 400 }
        );
      }
    }

    const subject = await prisma.subject.create({
      data: {
        name,
        code: code || null,
        classId,
        description: description || null,
        isActive: true
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
      message: "Subject created successfully"
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating subject:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create subject" },
      { status: 500 }
    );
  }
}
