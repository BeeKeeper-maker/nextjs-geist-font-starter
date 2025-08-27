import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { DatabaseService } from "@/lib/database";

const db = DatabaseService.getInstance();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const classFilter = searchParams.get("class");
    const statusFilter = searchParams.get("status");

    // Get all fees with student information
    const fees = await db.findAllFees();

    // Apply filters
    let filteredFees = fees;

    if (statusFilter && statusFilter !== "all") {
      filteredFees = filteredFees.filter(fee => fee.status === statusFilter);
    }

    if (classFilter && classFilter !== "all") {
      filteredFees = filteredFees.filter(fee => 
        fee.student && fee.student.classId === parseInt(classFilter)
      );
    }

    // Get additional class information for each fee
    const feesWithClassInfo = await Promise.all(
      filteredFees.map(async (fee) => {
        if (fee.student) {
          const studentWithClass = await db.findStudentById(fee.student.id);
          return {
            ...fee,
            student: studentWithClass
          };
        }
        return fee;
      })
    );

    return NextResponse.json({ success: true, data: feesWithClassInfo });
  } catch (error) {
    console.error("Error fetching fees:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch fees" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { studentId, feeType, amount, dueDate, remarks } = body;

    // Validate required fields
    if (!studentId || !feeType || !amount || !dueDate) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Verify student exists
    const student = await db.findStudentById(parseInt(studentId));
    if (!student) {
      return NextResponse.json(
        { success: false, error: "Student not found" },
        { status: 404 }
      );
    }

    // Create fee record
    const fee = await db.createFee({
      studentId: parseInt(studentId),
      feeType,
      amount: parseFloat(amount),
      dueDate: new Date(dueDate),
      status: "pending",
      remarks: remarks || null,
      paidAmount: 0
    });

    // Get the created fee with student information
    const feeWithStudent = await db.findAllFees();
    const createdFee = feeWithStudent.find(f => f.id === fee.id);

    return NextResponse.json({ 
      success: true, 
      data: createdFee,
      message: "Fee invoice created successfully"
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating fee:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create fee" },
      { status: 500 }
    );
  }
}
