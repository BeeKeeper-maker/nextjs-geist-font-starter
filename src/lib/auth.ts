import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"

export async function getSession() {
  return await getServerSession()
}

export async function requireAuth(allowedRoles?: string[]) {
  const session = await getSession()
  
  if (!session?.user) {
    redirect("/auth/signin")
  }

  if (allowedRoles && !allowedRoles.includes(session.user.role)) {
    redirect("/unauthorized")
  }

  return session
}

export function hasPermission(userRole: string, requiredRoles: readonly string[]): boolean {
  return requiredRoles.includes(userRole)
}

export const ROLES = {
  ADMIN: 'admin',
  TEACHER: 'teacher', 
  STUDENT: 'student',
  PARENT: 'parent'
} as const

export const PERMISSIONS = {
  // Student Management
  VIEW_STUDENTS: ['admin', 'teacher'] as const,
  MANAGE_STUDENTS: ['admin'] as const,
  VIEW_OWN_PROFILE: ['admin', 'teacher', 'student', 'parent'] as const,
  
  // Teacher Management
  VIEW_TEACHERS: ['admin'] as const,
  MANAGE_TEACHERS: ['admin'] as const,
  
  // Class Management
  VIEW_CLASSES: ['admin', 'teacher'] as const,
  MANAGE_CLASSES: ['admin'] as const,
  
  // Fee Management
  VIEW_FEES: ['admin', 'teacher'] as const,
  MANAGE_FEES: ['admin'] as const,
  VIEW_OWN_FEES: ['student', 'parent'] as const,
  
  // Attendance
  VIEW_ATTENDANCE: ['admin', 'teacher'] as const,
  MANAGE_ATTENDANCE: ['admin', 'teacher'] as const,
  VIEW_OWN_ATTENDANCE: ['student', 'parent'] as const,
  
  // Exams
  VIEW_EXAMS: ['admin', 'teacher'] as const,
  MANAGE_EXAMS: ['admin', 'teacher'] as const,
  VIEW_OWN_EXAMS: ['student', 'parent'] as const,
  
  // Dashboard
  VIEW_FULL_DASHBOARD: ['admin'] as const,
  VIEW_LIMITED_DASHBOARD: ['teacher', 'student', 'parent'] as const
} as const
