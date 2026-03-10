/**
 * @file GET /api/instructor/courses/all - Get all courses for instructor
 *
 * This route handler provides all courses data for instructor courses management.
 *
 * Responsibilities (API Layer):
 * 1. Authenticate instructor user
 * 2. Call service layer for all courses
 * 3. Format responses according to API contract
 * 4. Map business logic errors to HTTP status codes
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

async function resolveInstructorIdFromSession() {
  const session = await getSession();
  if (!session?.userId) return null;

  const user = await prisma.user.findUnique({
    where: { id: Number(session.userId) },
    select: { id: true, role: true, deletedAt: true },
  });

  // Check if user exists, is not deleted, and is an instructor
  if (user && !user.deletedAt && user.role === "INSTRUCTOR") {
    return user.id;
  }

  return null;
}

export async function GET() {
  try {
    const instructorId = await resolveInstructorIdFromSession();
    if (!instructorId) {
      return NextResponse.json(
        { error: "Not authenticated or not an instructor" },
        { status: 401 }
      );
    }

    // Fetch all courses for this instructor
    const courses = await prisma.course.findMany({
      where: {
        instructorId,
        deletedAt: null,
      },
      include: {
        _count: {
          select: { enrollments: true },
        },
        sections: {
          include: {
            _count: {
              select: { lessons: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Format the response
    const formattedCourses = courses.map((course: (typeof courses)[number]) => ({
      id: course.id,
      title: course.title,
      description: course.description,
      price: course.price ? Number(course.price) : 0,
      isPublished: course.isPublished,
      isFree: !course.price || Number(course.price) === 0,
      enrollmentsCount: course._count.enrollments,
      lessonsCount: course.sections.reduce(
        (sum: number, section: (typeof course.sections)[number]) => sum + section._count.lessons,
        0,
      ),
      createdAt: course.createdAt,
      updatedAt: course.updatedAt,
    }));

    return NextResponse.json(formattedCourses);
  } catch (error: unknown) {
    console.error("Error fetching instructor courses:", error);
    const message =
      error instanceof Error ? error.message : "Failed to fetch instructor courses";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}