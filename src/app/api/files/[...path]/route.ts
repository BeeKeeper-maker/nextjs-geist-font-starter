import { NextRequest, NextResponse } from "next/server"
import { readFile } from "fs/promises"
import path from "path"
import { existsSync } from "fs"

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const filePath = params.path.join('/')
    const uploadDir = process.env.UPLOAD_DIR || './uploads'
    const fullPath = path.join(process.cwd(), uploadDir, filePath)

    // Security check: ensure the file is within the upload directory
    const normalizedPath = path.normalize(fullPath)
    const normalizedUploadDir = path.normalize(path.join(process.cwd(), uploadDir))
    
    if (!normalizedPath.startsWith(normalizedUploadDir)) {
      return NextResponse.json(
        { error: "Access denied" },
        { status: 403 }
      )
    }

    // Check if file exists
    if (!existsSync(normalizedPath)) {
      return NextResponse.json(
        { error: "File not found" },
        { status: 404 }
      )
    }

    // Read the file
    const fileBuffer = await readFile(normalizedPath)
    
    // Determine content type based on file extension
    const ext = path.extname(normalizedPath).toLowerCase()
    let contentType = 'application/octet-stream'
    
    switch (ext) {
      case '.jpg':
      case '.jpeg':
        contentType = 'image/jpeg'
        break
      case '.png':
        contentType = 'image/png'
        break
      case '.gif':
        contentType = 'image/gif'
        break
      case '.pdf':
        contentType = 'application/pdf'
        break
      case '.doc':
        contentType = 'application/msword'
        break
      case '.docx':
        contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        break
    }

    // Return the file with appropriate headers
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000', // Cache for 1 year
      },
    })

  } catch (error) {
    console.error("Error serving file:", error)
    return NextResponse.json(
      { error: "Failed to serve file" },
      { status: 500 }
    )
  }
}
