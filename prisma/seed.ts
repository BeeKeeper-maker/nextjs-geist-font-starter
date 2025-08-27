import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding...')

  // Create admin user
  const adminPassword = await hash('admin123', 12)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@darulabraar.edu.bd' },
    update: {},
    create: {
      email: 'admin@darulabraar.edu.bd',
      password: adminPassword,
      name: 'System Administrator',
      role: 'admin',
    },
  })
  console.log('✅ Admin user created:', admin.email)

  // Create sample teachers
  const teacher1Password = await hash('teacher123', 12)
  const teacher1User = await prisma.user.upsert({
    where: { email: 'teacher1@darulabraar.edu.bd' },
    update: {},
    create: {
      email: 'teacher1@darulabraar.edu.bd',
      password: teacher1Password,
      name: 'মাওলানা আব্দুল করিম',
      role: 'teacher',
    },
  })

  const teacher1 = await prisma.teacher.upsert({
    where: { employeeId: 'T001' },
    update: {},
    create: {
      userId: teacher1User.id,
      name: 'মাওলানা আব্দুল করিম',
      employeeId: 'T001',
      designation: 'প্রধান শিক্ষক',
      qualification: 'কামিল, এম.এ (ইসলামিক স্টাডিজ)',
      specialization: 'আরবি ও ইসলামিক স্টাডিজ',
      subjects: 'আরবি, ফিকহ, হাদিস',
      contactNumber: '01711111111',
      email: 'teacher1@darulabraar.edu.bd',
      salary: 25000,
    },
  })
  console.log('✅ Teacher 1 created:', teacher1.name)

  const teacher2Password = await hash('teacher123', 12)
  const teacher2User = await prisma.user.upsert({
    where: { email: 'teacher2@darulabraar.edu.bd' },
    update: {},
    create: {
      email: 'teacher2@darulabraar.edu.bd',
      password: teacher2Password,
      name: 'মাওলানা মোহাম্মদ রহিম',
      role: 'teacher',
    },
  })

  const teacher2 = await prisma.teacher.upsert({
    where: { employeeId: 'T002' },
    update: {},
    create: {
      userId: teacher2User.id,
      name: 'মাওলানা মোহাম্মদ রহিম',
      employeeId: 'T002',
      designation: 'সহকারী শিক্ষক',
      qualification: 'ফাজিল, বি.এ',
      specialization: 'কুরআন ও তাজবিদ',
      subjects: 'কুরআন, তাজবিদ, বাংলা',
      contactNumber: '01722222222',
      email: 'teacher2@darulabraar.edu.bd',
      salary: 20000,
    },
  })
  console.log('✅ Teacher 2 created:', teacher2.name)

  // Create sample classes
  const class1 = await prisma.class.upsert({
    where: { name: 'হিফজ বিভাগ - ১ম বর্ষ' },
    update: {},
    create: {
      name: 'হিফজ বিভাগ - ১ম বর্ষ',
      section: 'A',
      teacherId: teacher1.id,
      capacity: 30,
      description: 'কুরআন হিফজের প্রথম বর্ষ',
    },
  })

  const class2 = await prisma.class.upsert({
    where: { name: 'কিতাব বিভাগ - ৫ম শ্রেণি' },
    update: {},
    create: {
      name: 'কিতাব বিভাগ - ৫ম শ্রেণি',
      section: 'A',
      teacherId: teacher2.id,
      capacity: 25,
      description: 'কিতাব বিভাগের পঞ্চম শ্রেণি',
    },
  })
  console.log('✅ Classes created')

  // Create sample students
  const student1Password = await hash('student123', 12)
  const student1User = await prisma.user.upsert({
    where: { email: 'student1@darulabraar.edu.bd' },
    update: {},
    create: {
      email: 'student1@darulabraar.edu.bd',
      password: student1Password,
      name: 'মোহাম্মদ আব্দুল্লাহ',
      role: 'student',
    },
  })

  const student1 = await prisma.student.upsert({
    where: { rollNumber: 'H001' },
    update: {},
    create: {
      userId: student1User.id,
      name: 'মোহাম্মদ আব্দুল্লাহ',
      rollNumber: 'H001',
      classId: class1.id,
      fatherName: 'মোহাম্মদ আলী',
      motherName: 'ফাতিমা খাতুন',
      dateOfBirth: new Date('2010-05-15'),
      gender: 'male',
      bloodGroup: 'B+',
      contactNumber: '01733333333',
      email: 'student1@darulabraar.edu.bd',
      presentAddress: 'ঢাকা, বাংলাদেশ',
      permanentAddress: 'কুমিল্লা, বাংলাদেশ',
      guardianName: 'মোহাম্মদ আলী',
      guardianPhone: '01744444444',
      guardianRelation: 'father',
    },
  })

  const student2Password = await hash('student123', 12)
  const student2User = await prisma.user.upsert({
    where: { email: 'student2@darulabraar.edu.bd' },
    update: {},
    create: {
      email: 'student2@darulabraar.edu.bd',
      password: student2Password,
      name: 'মোহাম্মদ ইব্রাহিম',
      role: 'student',
    },
  })

  const student2 = await prisma.student.upsert({
    where: { rollNumber: 'K001' },
    update: {},
    create: {
      userId: student2User.id,
      name: 'মোহাম্মদ ইব্রাহিম',
      rollNumber: 'K001',
      classId: class2.id,
      fatherName: 'আব্দুর রহমান',
      motherName: 'আয়েশা বেগম',
      dateOfBirth: new Date('2012-08-20'),
      gender: 'male',
      bloodGroup: 'A+',
      contactNumber: '01755555555',
      email: 'student2@darulabraar.edu.bd',
      presentAddress: 'চট্টগ্রাম, বাংলাদেশ',
      permanentAddress: 'নোয়াখালী, বাংলাদেশ',
      guardianName: 'আব্দুর রহমান',
      guardianPhone: '01766666666',
      guardianRelation: 'father',
    },
  })
  console.log('✅ Students created')

  // Create sample subjects
  const subject1 = await prisma.subject.create({
    data: {
      name: 'কুরআন মজিদ',
      code: 'QUR101',
      classId: class1.id,
      description: 'কুরআন তিলাওয়াত ও হিফজ',
    },
  })

  const subject2 = await prisma.subject.create({
    data: {
      name: 'আরবি ব্যাকরণ',
      code: 'ARB201',
      classId: class2.id,
      description: 'আরবি ভাষার ব্যাকরণ',
    },
  })
  console.log('✅ Subjects created')

  // Create sample fees
  await prisma.fee.create({
    data: {
      studentId: student1.id,
      feeType: 'tuition',
      amount: 2000,
      dueDate: new Date('2024-02-01'),
      status: 'pending',
    },
  })

  await prisma.fee.create({
    data: {
      studentId: student2.id,
      feeType: 'tuition',
      amount: 1800,
      dueDate: new Date('2024-02-01'),
      paidDate: new Date('2024-01-25'),
      paidAmount: 1800,
      status: 'paid',
      receiptNo: 'RCP001',
    },
  })
  console.log('✅ Fees created')

  // Create sample attendance
  const today = new Date()
  await prisma.attendance.create({
    data: {
      studentId: student1.id,
      date: today,
      status: 'present',
    },
  })

  await prisma.attendance.create({
    data: {
      studentId: student2.id,
      date: today,
      status: 'present',
    },
  })
  console.log('✅ Attendance records created')

  // Create sample exams
  await prisma.exam.create({
    data: {
      studentId: student1.id,
      subjectId: subject1.id,
      examType: 'midterm',
      examDate: new Date('2024-01-15'),
      totalMarks: 100,
      obtainedMarks: 85,
      grade: 'A',
    },
  })

  await prisma.exam.create({
    data: {
      studentId: student2.id,
      subjectId: subject2.id,
      examType: 'midterm',
      examDate: new Date('2024-01-15'),
      totalMarks: 100,
      obtainedMarks: 78,
      grade: 'B+',
    },
  })
  console.log('✅ Exam records created')

  // Create sample announcements
  await prisma.announcement.create({
    data: {
      title: 'নতুন শিক্ষাবর্ষ শুরু',
      content: 'আগামী ১ জানুয়ারি থেকে নতুন শিক্ষাবর্ষ শুরু হবে। সকল ছাত্রদের নির্ধারিত সময়ে উপস্থিত থাকার জন্য অনুরোধ করা হচ্ছে।',
      targetRole: 'all',
    },
  })

  await prisma.announcement.create({
    data: {
      title: 'ফি পরিশোধের শেষ তারিখ',
      content: 'এই মাসের ফি পরিশোধের শেষ তারিখ ২৮ তারিখ। দেরিতে ফি পরিশোধের জন্য জরিমানা প্রযোজ্য হবে।',
      targetRole: 'student',
    },
  })
  console.log('✅ Announcements created')

  // Create academic year
  await prisma.academicYear.create({
    data: {
      year: '2024-2025',
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-12-31'),
      isActive: true,
    },
  })
  console.log('✅ Academic year created')

  console.log('🎉 Database seeding completed successfully!')
  console.log('\n📋 Login Credentials:')
  console.log('Admin: admin@darulabraar.edu.bd / admin123')
  console.log('Teacher 1: teacher1@darulabraar.edu.bd / teacher123')
  console.log('Teacher 2: teacher2@darulabraar.edu.bd / teacher123')
  console.log('Student 1: student1@darulabraar.edu.bd / student123')
  console.log('Student 2: student2@darulabraar.edu.bd / student123')
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
