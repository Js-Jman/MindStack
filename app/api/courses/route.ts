import { NextResponse } from "next/server";
import {
  getAllCourses,
  createCourse,
  searchCourses,
} from "@/services/course.service";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

type RawCourse = {
  id: number;
  title: string;
  description: string;
  thumbnailUrl: string | null;
  instructorId: number;
  price: number | { toString(): string } | null;
};

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return "Unexpected error";
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");
    const session = await getSession();
    const currentUserId = session?.userId;

    const rawCourses = query
      ? await searchCourses(query)
      : await getAllCourses();

    // Enrich data using Prisma relations
    const courses = await Promise.all(
      rawCourses.map(async (c) => {
        const course = c as RawCourse;
        const sections = await prisma.courseSection.findMany({
          where: { courseId: course.id },
          include: { lessons: true },
        });

        const instructor = await prisma.user.findUnique({
          where: { id: course.instructorId },
          select: { name: true },
        });

        const enrollment = currentUserId
          ? await prisma.courseEnrollment.findUnique({
              where: {
                courseId_userId: { courseId: course.id, userId: currentUserId },
              },
            })
          : null;

        const cp = currentUserId
          ? await prisma.courseProgress.findUnique({
              where: {
                courseId_userId: { courseId: course.id, userId: currentUserId },
              },
            })
          : null;

        const lessonsCount = sections.reduce(
          (acc, s) => acc + s.lessons.length,
          0,
        );

        return {
          id: course.id,
          title: course.title,
          description: course.description,
          image: course.thumbnailUrl ?? null,

          instructorName: instructor?.name ?? "Unknown",

          lessonsCount,
          isEnrolled: !!enrollment,
          progress: cp ? Number(cp.completionPercentage) : 0,
          progressStatus: cp?.status ?? "NOT_STARTED",

          price: course.price ? Number(course.price) : 0,
          isFree: !course.price || Number(course.price) === 0,
        };
      }),
    );

    return NextResponse.json(courses);
  } catch (error: unknown) {
    console.error("Error fetching courses:", error);
    return NextResponse.json(
      { error: getErrorMessage(error) || "Failed to fetch courses" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const course = await createCourse(body);
    return NextResponse.json(course, { status: 201 });
  } catch (error: unknown) {
    console.error("Error creating course:", error);
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 400 });
  }
}
