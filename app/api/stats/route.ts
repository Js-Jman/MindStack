import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

async function resolveStudentIdFromSession() {
  const session = await getSession();
  if (!session?.userId) return null;

  const byId = await prisma.user.findUnique({
    where: { id: Number(session.userId) },
    select: { id: true, deletedAt: true },
  });
  if (byId && !byId.deletedAt) return byId.id;

  const byEmail = await prisma.user.findUnique({
    where: { email: session.email },
    select: { id: true, deletedAt: true },
  });
  if (byEmail && !byEmail.deletedAt) return byEmail.id;

  return null;
}

export async function GET(req: Request) {
  const studentId = await resolveStudentIdFromSession();
  if (!studentId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
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
