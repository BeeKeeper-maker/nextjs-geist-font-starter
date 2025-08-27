import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { DatabaseService } from "@/lib/database";

const db = DatabaseService.getInstance();

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const feeId = parseInt(params.id);
    const body = await request.json();
    const { status, paidAmount, paidDate, remarks } = body;

    // Validate fee exists
    const existingFee = await db.findAllFees();
    const fee = existingFee.find(f => f.id === feeId);
    
    if (!fee) {
      return NextResponse.json(
        { success: false, error: "Fee not found" },
        { status: 404 }
      );
    }

    // Prepare update data
    const updateData: any = {};
    
    if (status) {
      updateData.status = status;
    }
    
    if (paidAmount !== undefined) {
      updateData.paidAmount = parseFloat(paidAmount);
    }
    
    if (paidDate) {
      updateData.paidDate = new Date(paidDate);
    } else if (status === "paid" && !fee.paidDate) {
      updateData.paidDate = new Date();
    }
    
    if (remarks !== undefined) {
      updateData.remarks = remarks;
    }

    // Update fee
    const updatedFee = await db.updateFee(feeId, updateData);

    // Get updated fee with student information
    const feesWithStudent = await db.findAllFees();
    const feeWithStudent = feesWithStudent.find(f => f.id === feeId);

    return NextResponse.json({
      success: true,
      data: feeWithStudent,
      message: "Fee updated successfully"
    });
  } catch (error) {
    console.error("Error updating fee:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update fee" },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const feeId = parseInt(params.id);
    
    // Get all fees and find the specific one
    const fees = await db.findAllFees();
    const fee = fees.find(f => f.id === feeId);
    
    if (!fee) {
      return NextResponse.json(
        { success: false, error: "Fee not found" },
        { status: 404 }
      );
    }

    // Get detailed student information
    if (fee.student) {
      const studentWithClass = await db.findStudentById(fee.student.id);
      const feeWithDetails = {
        ...fee,
        student: studentWithClass
      };
      
      return NextResponse.json({
        success: true,
        data: feeWithDetails
      });
    }

    return NextResponse.json({
      success: true,
      data: fee
    });
  } catch (error) {
    console.error("Error fetching fee:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch fee" },
      { status: 500 }
    );
  }
}
