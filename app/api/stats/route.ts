import { NextResponse } from "next/server";
import { getStudentStats } from "@/services/enrollment.service";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const studentIdParam = searchParams.get("studentId");
    const studentId = studentIdParam ? Number(studentIdParam) : NaN;

    if (!studentIdParam || Number.isNaN(studentId)) {
      return NextResponse.json(
        { error: "studentId is required" },
        { status: 400 }
      );
    }

    const stats = await getStudentStats(studentId);
    return NextResponse.json(stats);
  } catch (error: any) {
    console.error("Error fetching stats:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
