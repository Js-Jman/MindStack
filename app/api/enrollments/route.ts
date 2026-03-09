import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { enrollStudentInCourse } from "@/services/enrollment.service";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const studentIdParam = searchParams.get("studentId");
  const studentId = Number(studentIdParam);

  if (!Number.isInteger(studentId)) {
    return NextResponse.json({ error: "Invalid studentId" }, { status: 400 });
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
    const body = await request.json();
    const { studentId: studentIdRaw, courseId: courseIdRaw } = body;
    const studentId = Number(studentIdRaw);
    const courseId = Number(courseIdRaw);

    if (!studentIdRaw || !courseIdRaw || Number.isNaN(studentId) || Number.isNaN(courseId)) {
      return NextResponse.json(
        { error: "studentId and courseId are required" },
        { status: 400 }
      );
    }
    const enrollment = await enrollStudentInCourse(studentId, courseId);
    return NextResponse.json({
      status: 201,
      message: "User enrolled",
      data: body,
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