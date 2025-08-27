import { PrismaClient } from '@prisma/client'

// Global database instance (singleton pattern)
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Database service abstraction for easy switching
export class DatabaseService {
  private static instance: DatabaseService
  private client: PrismaClient

  private constructor() {
    this.client = prisma
  }

  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService()
    }
    return DatabaseService.instance
  }

  // User operations
  async createUser(data: any) {
    return this.client.user.create({ data })
  }

  async findUserByEmail(email: string) {
    return this.client.user.findUnique({ where: { email } })
  }

  async findUserById(id: number) {
    return this.client.user.findUnique({ where: { id } })
  }

  // Student operations
  async createStudent(data: any) {
    return this.client.student.create({ data })
  }

  async findAllStudents() {
    return this.client.student.findMany({
      include: {
        class: true,
        user: true
      }
    })
  }

  async findStudentById(id: number) {
    return this.client.student.findUnique({
      where: { id },
      include: {
        class: true,
        user: true,
        fees: true,
        attendances: true,
        exams: true
      }
    })
  }

  async updateStudent(id: number, data: any) {
    return this.client.student.update({
      where: { id },
      data
    })
  }

  async deleteStudent(id: number) {
    return this.client.student.delete({ where: { id } })
  }

  // Teacher operations
  async createTeacher(data: any) {
    return this.client.teacher.create({ data })
  }

  async findAllTeachers() {
    return this.client.teacher.findMany({
      include: {
        user: true,
        classes: true
      }
    })
  }

  async findTeacherById(id: number) {
    return this.client.teacher.findUnique({
      where: { id },
      include: {
        user: true,
        classes: true
      }
    })
  }

  async updateTeacher(id: number, data: any) {
    return this.client.teacher.update({
      where: { id },
      data
    })
  }

  async deleteTeacher(id: number) {
    return this.client.teacher.delete({ where: { id } })
  }

  // Class operations
  async createClass(data: any) {
    return this.client.class.create({ data })
  }

  async findAllClasses() {
    return this.client.class.findMany({
      include: {
        teacher: true,
        students: true,
        subjects: true
      }
    })
  }

  async findClassById(id: number) {
    return this.client.class.findUnique({
      where: { id },
      include: {
        teacher: true,
        students: true,
        subjects: true
      }
    })
  }

  async updateClass(id: number, data: any) {
    return this.client.class.update({
      where: { id },
      data
    })
  }

  async deleteClass(id: number) {
    return this.client.class.delete({ where: { id } })
  }

  // Fee operations
  async createFee(data: any) {
    return this.client.fee.create({ data })
  }

  async findAllFees() {
    return this.client.fee.findMany({
      include: {
        student: true
      }
    })
  }

  async findFeesByStudentId(studentId: number) {
    return this.client.fee.findMany({
      where: { studentId },
      include: {
        student: true
      }
    })
  }

  async updateFee(id: number, data: any) {
    return this.client.fee.update({
      where: { id },
      data
    })
  }

  // Attendance operations
  async createAttendance(data: any) {
    return this.client.attendance.create({ data })
  }

  async findAttendanceByDate(date: Date) {
    return this.client.attendance.findMany({
      where: { date },
      include: {
        student: true
      }
    })
  }

  async findAttendanceByStudentId(studentId: number) {
    return this.client.attendance.findMany({
      where: { studentId },
      include: {
        student: true
      }
    })
  }

  // Exam operations
  async createExam(data: any) {
    return this.client.exam.create({ data })
  }

  async findExamsByStudentId(studentId: number) {
    return this.client.exam.findMany({
      where: { studentId },
      include: {
        student: true,
        subject: true
      }
    })
  }

  // Dashboard statistics
  async getDashboardStats() {
    const [studentsCount, teachersCount, classesCount, totalFees] = await Promise.all([
      this.client.student.count({ where: { isActive: true } }),
      this.client.teacher.count({ where: { isActive: true } }),
      this.client.class.count({ where: { isActive: true } }),
      this.client.fee.aggregate({
        _sum: { amount: true },
        where: { status: 'paid' }
      })
    ])

    return {
      studentsCount,
      teachersCount,
      classesCount,
      totalRevenue: totalFees._sum.amount || 0
    }
  }

  // Generic disconnect method
  async disconnect() {
    await this.client.$disconnect()
  }
}

export default DatabaseService.getInstance()
