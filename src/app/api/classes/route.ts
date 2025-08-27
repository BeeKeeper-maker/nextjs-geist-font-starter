import { NextRequest, NextResponse } from "next/server"
import { DatabaseService } from "@/lib/database"
import { getServerSession } from "next-auth"

const db = DatabaseService.getInstance()

export async function GET() {
  try {
    const classes = await db.findAllClasses()
    return NextResponse.json({ 
      success: true, 
      classes: classes 
    })
  } catch (error) {
    console.error("Error fetching classes:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch classes" },
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
    if (!data.name) {
      return NextResponse.json(
        { success: false, error: "Class name is required" },
        { status: 400 }
      )
    }

    const classData = await db.createClass({
      name: data.name,
      section: data.section || null,
      teacherId: data.teacherId ? parseInt(data.teacherId) : null,
      capacity: data.capacity ? parseInt(data.capacity) : null,
      description: data.description || null,
    })

    return NextResponse.json({
      success: true,
      data: classData,
      message: "Class created successfully"
    }, { status: 201 })

  } catch (error: any) {
    console.error("Error creating class:", error)
    
    if (error.code === 'P2002') {
      return NextResponse.json(
        { success: false, error: "Class name already exists" },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { success: false, error: "Failed to create class" },
      { status: 500 }
    )
  }
}
