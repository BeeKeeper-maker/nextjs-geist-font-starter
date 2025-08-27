import fs from 'fs'
import path from 'path'
import { writeFile, mkdir } from 'fs/promises'

// Storage service interface for easy switching between local and cloud storage
export interface StorageService {
  uploadFile(file: File, folder: string): Promise<string>
  deleteFile(filePath: string): Promise<boolean>
  getFileUrl(filePath: string): string
}

// Local storage implementation
class LocalStorageService implements StorageService {
  private uploadDir: string

  constructor() {
    this.uploadDir = process.env.UPLOAD_DIR || './uploads'
    this.ensureUploadDir()
  }

  private async ensureUploadDir() {
    try {
      await mkdir(this.uploadDir, { recursive: true })
      await mkdir(path.join(this.uploadDir, 'students'), { recursive: true })
      await mkdir(path.join(this.uploadDir, 'teachers'), { recursive: true })
      await mkdir(path.join(this.uploadDir, 'documents'), { recursive: true })
    } catch (error) {
      console.error('Error creating upload directories:', error)
    }
  }

  async uploadFile(file: File, folder: string): Promise<string> {
    try {
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)

      // Generate unique filename
      const timestamp = Date.now()
      const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
      const filename = `${timestamp}_${originalName}`
      
      const folderPath = path.join(this.uploadDir, folder)
      await mkdir(folderPath, { recursive: true })
      
      const filePath = path.join(folderPath, filename)
      await writeFile(filePath, buffer)

      // Return relative path for database storage
      return path.join(folder, filename).replace(/\\/g, '/')
    } catch (error) {
      console.error('Error uploading file:', error)
      throw new Error('Failed to upload file')
    }
  }

  async deleteFile(filePath: string): Promise<boolean> {
    try {
      const fullPath = path.join(this.uploadDir, filePath)
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath)
        return true
      }
      return false
    } catch (error) {
      console.error('Error deleting file:', error)
      return false
    }
  }

  getFileUrl(filePath: string): string {
    if (!filePath) return ''
    // Return URL for serving static files
    return `/api/files/${filePath.replace(/\\/g, '/')}`
  }
}

// S3 storage implementation (for future use)
class S3StorageService implements StorageService {
  private bucketName: string
  private region: string
  private accessKeyId: string
  private secretAccessKey: string

  constructor() {
    this.bucketName = process.env.AWS_BUCKET_NAME || ''
    this.region = process.env.AWS_REGION || ''
    this.accessKeyId = process.env.AWS_ACCESS_KEY_ID || ''
    this.secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY || ''
  }

  async uploadFile(file: File, folder: string): Promise<string> {
    // TODO: Implement S3 upload when upgrading
    // This would use AWS SDK to upload to S3
    throw new Error('S3 storage not implemented yet')
  }

  async deleteFile(filePath: string): Promise<boolean> {
    // TODO: Implement S3 delete when upgrading
    throw new Error('S3 storage not implemented yet')
  }

  getFileUrl(filePath: string): string {
    // TODO: Return S3 URL when upgrading
    return `https://${this.bucketName}.s3.${this.region}.amazonaws.com/${filePath}`
  }
}

// Factory function to get the appropriate storage service
export function getStorageService(): StorageService {
  const provider = process.env.STORAGE_PROVIDER || 'local'
  
  switch (provider) {
    case 's3':
      return new S3StorageService()
    case 'local':
    default:
      return new LocalStorageService()
  }
}

// Export default instance
export default getStorageService()
