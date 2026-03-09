import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { enrollStudentInCourse } from "@/services/enrollment.service";
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

  const enrollments = await prisma.courseEnrollment.findMany({
    where: { userId: studentId },
    include: {
      course: {
        include: {
          instructor: { select: { name: true, email: true } },
          sections: { include: { lessons: { select: { id: true } } } },
          courseProgress: {
            where: { userId: studentId },
            select: { completionPercentage: true },
          },
        },
      },
    },
    orderBy: { enrolledAt: "desc" },
  });

  const payload = enrollments.map((e) => {
    const lessonsCount = e.course.sections.reduce(
      (acc, s) => acc + s.lessons.length,
      0,
    );
    const progress = e.course.courseProgress[0]
      ? Number(e.course.courseProgress[0].completionPercentage)
      : 0;

    return {
      id: e.courseId,
      title: e.course.title,
      description: e.course.description,
      image: e.course.thumbnailUrl,
      instructor: {
        name: e.course.instructor?.name,
        email: e.course.instructor?.email ?? "",
      },
      level: undefined, // not in schema
      duration: undefined, // not in schema
      lessonCount: lessonsCount,
      rating: undefined, // not in schema
      progress,
      status: e.status,
    };
  });

  return NextResponse.json(payload);
}

export async function POST(request: Request) {
  try {
    const studentId = await resolveStudentIdFromSession();
    if (!studentId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await request.json();
    const { courseId: courseIdRaw } = body;
    const courseId = Number(courseIdRaw);

    if (!courseIdRaw || Number.isNaN(courseId)) {
      return NextResponse.json(
        { error: "courseId is required" },
        { status: 400 }
      );
    }
    await enrollStudentInCourse(studentId, courseId);
    return NextResponse.json({
      status: 201,
      message: "User enrolled",
      data: { studentId, courseId },
    });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("Error creating enrollment:", error);
    return NextResponse.json(
      { error: error.message || "Failed to enroll in course" },
      { status: 400 }
    );
  }
}