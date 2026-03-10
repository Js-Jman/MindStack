/**
 * @file GET /api/courses - Fetch all or search courses
 *      POST /api/courses - Create a new course
 * 
 * This route handler orchestrates HTTP requests for course operations.
 * 
 * Responsibilities (API Layer):
 * 1. Extract and validate HTTP request data (query params, body)
 * 2. Authenticate/authorize the user
 * 3. Call service layer with validated inputs
 * 4. Format responses according to API contract
 * 5. Map business logic errors to HTTP status codes
 */

import { NextResponse } from "next/server";
import {
  searchCourses,
  getAllCourses,
  createCourse,
} from "@/services/course.service";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

/**
 * Resolve instructor ID from session for course creation
 * Only instructors can create courses
 */
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

/**
 * GET /api/courses?q=search_term
 * 
 * Fetches published courses, optionally filtered by search query.
 * Enriches response with current user's enrollment and progress data.
 * 
 * Query Parameters:
 * - q (optional): Search query for title/description filtering
 * 
 * Response:
 * - Array of course objects with:
 *   - Course info (id, title, description, price)
 *   - Instructor details
 *   - Course structure (lessons count, sections)
 *   - User enrollment status (isEnrolled)
 *   - User progress (progress %, progressStatus)
 * 
 * @param request - Next.js request object
 * @returns JSON array of courses
 */
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
          (acc: number, s: { lessons: unknown[] }) => acc + s.lessons.length,
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
      { status: 500 }
    );
  }
}

/**
 * POST /api/courses
 * 
 * Creates a new course. Requires instructor/admin authentication.
 * 
 * Request Body:
 * {
 *   "title": "Course Title",
 *   "description": "Course description",
 *   "instructorId": 1,
 *   "price": 99.99,
 *   "isPublished": false
 * }
 * 
 * Response:
 * - 201: Created course object
 * - 400: Validation error (missing required fields)
 * - 401: Unauthorized
 * - 500: Server error
 * 
 * @param request - Next.js request object
 * @returns JSON of created course
 */
export async function POST(request: Request) {
  try {
    // Authenticate and get instructor ID
    const instructorId = await resolveInstructorIdFromSession();
    if (!instructorId) {
      return NextResponse.json(
        { error: "Not authenticated or not an instructor" },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Add instructor ID to course data
    const courseData = {
      ...body,
      instructorId,
    };

    // Service layer handles validation
    // (title and description required)
    const course = await createCourse(courseData);

    return NextResponse.json(course, { status: 201 });
  } catch (error: unknown) {
    console.error("Error creating course:", error);
    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: 400 }
    );
  }
}
