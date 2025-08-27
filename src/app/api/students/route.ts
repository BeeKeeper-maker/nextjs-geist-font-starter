import { NextRequest, NextResponse } from "next/server"
import { DatabaseService } from "@/lib/database"
import { getServerSession } from "next-auth"

const db = DatabaseService.getInstance()

export async function GET() {
  try {
    const students = await db.findAllStudents()
    return NextResponse.json({ 
      success: true, 
      data: students 
    })
  } catch (error) {
    console.error("Error fetching students:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch students" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      )
    }

    const data = await request.json()
    
    // Validate required fields
    if (!data.name || !data.rollNumber || !data.classId) {
      return NextResponse.json(
        { success: false, error: "Name, roll number, and class are required" },
        { status: 400 }
      )
    }

    const student = await db.createStudent({
      name: data.name,
      rollNumber: data.rollNumber,
      classId: parseInt(data.classId),
      fatherName: data.fatherName || null,
      motherName: data.motherName || null,
      dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
      gender: data.gender || null,
      bloodGroup: data.bloodGroup || null,
      religion: data.religion || "Islam",
      nationality: data.nationality || "Bangladeshi",
      contactNumber: data.contactNumber || null,
      email: data.email || null,
      presentAddress: data.presentAddress || null,
      permanentAddress: data.permanentAddress || null,
      guardianName: data.guardianName || null,
      guardianPhone: data.guardianPhone || null,
      guardianRelation: data.guardianRelation || null,
    })

    return NextResponse.json({
      success: true,
      data: student,
      message: "Student created successfully"
    }, { status: 201 })

  } catch (error: any) {
    console.error("Error creating student:", error)
    
    if (error.code === 'P2002') {
      return NextResponse.json(
        { success: false, error: "Roll number already exists" },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { success: false, error: "Failed to create student" },
      { status: 500 }
    )
  }
}
