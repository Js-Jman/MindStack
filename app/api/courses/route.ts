import { NextResponse } from "next/server";
import {
  getAllCourses,
  createCourse,
  searchCourses,
} from "@/services/course.service";
import { prisma } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");

    // mock user
    const currentUserId = 1;

    const rawCourses = query
      ? await searchCourses(query)
      : await getAllCourses();

    // Enrich data using Prisma relations
    const courses = await Promise.all(
      rawCourses.map(async (c: any) => {
        const sections = await prisma.courseSection.findMany({
          where: { courseId: c.id },
          include: { lessons: true },
        });

        const instructor = await prisma.user.findUnique({
          where: { id: c.instructorId },
          select: { name: true },
        });

        const enrollment = await prisma.courseEnrollment.findUnique({
          where: {
            courseId_userId: { courseId: c.id, userId: currentUserId },
          },
        });

        const cp = await prisma.courseProgress.findUnique({
          where: {
            courseId_userId: { courseId: c.id, userId: currentUserId },
          },
        });

        const lessonsCount = sections.reduce(
          (acc, s) => acc + s.lessons.length,
          0,
        );

        return {
          id: c.id,
          title: c.title,
          description: c.description,
          image: c.thumbnailUrl ?? null,

          instructorName: instructor?.name ?? "Unknown",

          lessonsCount,
          isEnrolled: !!enrollment,
          progress: cp ? Number(cp.completionPercentage) : 0,
          progressStatus: cp?.status ?? "NOT_STARTED",

          price: c.price ? Number(c.price) : 0,
          isFree: !c.price || Number(c.price) === 0,
        };
      }),
    );

    return NextResponse.json(courses);
  } catch (error: any) {
    console.error("Error fetching courses:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch courses" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const course = await createCourse(body);
    return NextResponse.json(course, { status: 201 });
  } catch (error: any) {
    console.error("Error creating course:", error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
