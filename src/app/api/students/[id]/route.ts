import { NextRequest, NextResponse } from "next/server"
import { DatabaseService } from "@/lib/database"
import { getServerSession } from "next-auth"

const db = DatabaseService.getInstance()

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: "Invalid student ID" },
        { status: 400 }
      )
    }

    const student = await db.findStudentById(id)
    
    if (!student) {
      return NextResponse.json(
        { success: false, error: "Student not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: student
    })

  } catch (error) {
    console.error("Error fetching student:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch student" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      )
    }

    const id = parseInt(params.id)
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: "Invalid student ID" },
        { status: 400 }
      )
    }

    const data = await request.json()
    
    const updateData: any = {}
    
    // Only update provided fields
    if (data.name !== undefined) updateData.name = data.name
    if (data.rollNumber !== undefined) updateData.rollNumber = data.rollNumber
    if (data.classId !== undefined) updateData.classId = parseInt(data.classId)
    if (data.fatherName !== undefined) updateData.fatherName = data.fatherName
    if (data.motherName !== undefined) updateData.motherName = data.motherName
    if (data.dateOfBirth !== undefined) updateData.dateOfBirth = data.dateOfBirth ? new Date(data.dateOfBirth) : null
    if (data.gender !== undefined) updateData.gender = data.gender
    if (data.bloodGroup !== undefined) updateData.bloodGroup = data.bloodGroup
    if (data.religion !== undefined) updateData.religion = data.religion
    if (data.nationality !== undefined) updateData.nationality = data.nationality
    if (data.contactNumber !== undefined) updateData.contactNumber = data.contactNumber
    if (data.email !== undefined) updateData.email = data.email
    if (data.presentAddress !== undefined) updateData.presentAddress = data.presentAddress
    if (data.permanentAddress !== undefined) updateData.permanentAddress = data.permanentAddress
    if (data.guardianName !== undefined) updateData.guardianName = data.guardianName
    if (data.guardianPhone !== undefined) updateData.guardianPhone = data.guardianPhone
    if (data.guardianRelation !== undefined) updateData.guardianRelation = data.guardianRelation
    if (data.isActive !== undefined) updateData.isActive = data.isActive

    const student = await db.updateStudent(id, updateData)

    return NextResponse.json({
      success: true,
      data: student,
      message: "Student updated successfully"
    })

  } catch (error: any) {
    console.error("Error updating student:", error)
    
    if (error.code === 'P2002') {
      return NextResponse.json(
        { success: false, error: "Roll number already exists" },
        { status: 409 }
      )
    }

    if (error.code === 'P2025') {
      return NextResponse.json(
        { success: false, error: "Student not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { success: false, error: "Failed to update student" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      )
    }

    const id = parseInt(params.id)
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: "Invalid student ID" },
        { status: 400 }
      )
    }

    // Soft delete by setting isActive to false
    const student = await db.updateStudent(id, { isActive: false })

    return NextResponse.json({
      success: true,
      data: student,
      message: "Student deactivated successfully"
    })

  } catch (error: any) {
    console.error("Error deleting student:", error)
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { success: false, error: "Student not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { success: false, error: "Failed to delete student" },
      { status: 500 }
    )
  }
}
