import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { getStorageService } from "@/lib/storage"

const storage = getStorageService()

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const folder = formData.get('folder') as string || 'documents'

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file provided" },
        { status: 400 }
      )
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: "File size too large. Maximum 5MB allowed." },
        { status: 400 }
      )
    }

    // Validate file type
    const allowedTypes = [
      'image/jpeg',
      'image/jpg', 
      'image/png',
      'image/gif',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ]

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: "Invalid file type. Only images, PDF, and Word documents are allowed." },
        { status: 400 }
      )
    }

    const filePath = await storage.uploadFile(file, folder)
    const fileUrl = storage.getFileUrl(filePath)

    return NextResponse.json({
      success: true,
      data: {
        filePath,
        fileUrl,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type
      },
      message: "File uploaded successfully"
    })

  } catch (error) {
    console.error("Error uploading file:", error)
    return NextResponse.json(
      { success: false, error: "Failed to upload file" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const filePath = searchParams.get('path')

    if (!filePath) {
      return NextResponse.json(
        { success: false, error: "File path is required" },
        { status: 400 }
      )
    }

    const deleted = await storage.deleteFile(filePath)

    if (deleted) {
      return NextResponse.json({
        success: true,
        message: "File deleted successfully"
      })
    } else {
      return NextResponse.json(
        { success: false, error: "File not found or already deleted" },
        { status: 404 }
      )
    }

  } catch (error) {
    console.error("Error deleting file:", error)
    return NextResponse.json(
      { success: false, error: "Failed to delete file" },
      { status: 500 }
    )
  }
}
