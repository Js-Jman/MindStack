import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

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
