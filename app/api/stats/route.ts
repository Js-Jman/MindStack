import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const studentIdParam = searchParams.get("studentId");
  const studentId = Number(studentIdParam);

  if (!Number.isInteger(studentId)) {
    return NextResponse.json({ error: "Invalid studentId" }, { status: 400 });
  }

  const [enrollments, progressRows] = await Promise.all([
    prisma.courseEnrollment.findMany({ where: { userId: studentId } }),
    prisma.courseProgress.findMany({ where: { userId: studentId } }),
  ]);

  const totalEnrollments = enrollments.length;
  const completedCourses = enrollments.filter(
    (e) => e.status === "COMPLETED",
  ).length;
  const inProgressCourses = enrollments.filter(
    (e) => e.status === "ACTIVE",
  ).length;
  const avg =
    progressRows.length === 0
      ? 0
      : Math.round(
          progressRows.reduce(
            (acc, r) => acc + Number(r.completionPercentage),
            0,
          ) / progressRows.length,
        );

  return NextResponse.json({
    totalEnrollments,
    completedCourses,
    inProgressCourses,
    averageProgress: avg,
  });
}
