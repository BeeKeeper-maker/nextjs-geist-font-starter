import { NextResponse } from "next/server"
import { DatabaseService, prisma } from "@/lib/database"
import { getServerSession } from "next-auth"

const db = DatabaseService.getInstance()

export async function GET() {
  try {
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      )
    }

    const stats = await db.getDashboardStats()
    
    // Get additional statistics
    const [pendingFees, todayAttendance, recentExams] = await Promise.all([
      // Pending fees count
      prisma.fee.count({
        where: { status: 'pending' }
      }),
      // Today's attendance count
      prisma.attendance.count({
        where: {
          date: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
            lt: new Date(new Date().setHours(23, 59, 59, 999))
          }
        }
      }),
      // Recent exams (last 7 days)
      prisma.exam.count({
        where: {
          examDate: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          }
        }
      })
    ])

    const dashboardData = {
      ...stats,
      pendingFeesCount: pendingFees,
      todayAttendanceCount: todayAttendance,
      recentExamsCount: recentExams,
    }

    return NextResponse.json({
      success: true,
      data: dashboardData
    })

  } catch (error) {
    console.error("Error fetching dashboard stats:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch dashboard statistics" },
      { status: 500 }
    )
  }
}
