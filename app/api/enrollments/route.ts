/**
 * @file GET /api/enrollments - Get student's enrolled courses
 *      POST /api/enrollments - Enroll student in a course
 * 
 * This route handler orchestrates HTTP requests for enrollment operations.
 * 
 * Responsibilities (API Layer):
 * 1. Extract and validate HTTP request data
 * 2. Authenticate/authorize the user
 * 3. Call service layer with validated inputs
 * 4. Format responses according to API contract
 * 5. Map business logic errors to HTTP status codes
 */

import { NextResponse } from "next/server";
import {
  enrollStudentInCourse,
  getStudentEnrollmentsFormatted,
  EnrolledCourseResponse,
} from "@/services/enrollment.service";
import { CourseEnrollment } from "@/types/progress";

type EnrollmentResponse = {
  status: number;
  message: string;
  data: CourseEnrollment;
};

/**
 * GET /api/enrollments?studentId=1
 * 
 * Retrieves all courses a student is enrolled in with progress tracking.
 * 
 * Query Parameters:
 * - studentId (required): ID of the student
 * 
 * Response:
 * - Array of course objects with:
 *   - Course information (id, title, description)
 *   - Instructor details
 *   - Course progress (progress percentage, enrollment status)
 *   - Lesson count
 *   - Thumbnail image
 * 
 * @param req - Next.js request object
 * @returns JSON array of enrolled courses
 */
export async function GET(
  req: Request
): Promise<NextResponse<EnrolledCourseResponse[] | { error: string }>> {
  try {
    const { searchParams } = new URL(req.url);
    const studentIdParam = searchParams.get("studentId");
    const studentId = Number(studentIdParam);

    // Validate input
    if (!Number.isInteger(studentId) || studentId <= 0) {
      return NextResponse.json({ error: "Invalid studentId" }, { status: 400 });
    }

    // Service call - returns formatted enrollments with course details
    // No additional Prisma calls needed; repository and service handle formatting
    const enrollments = await getStudentEnrollmentsFormatted(studentId);

    return NextResponse.json(enrollments);
  } catch (error: unknown) {
    console.error("Error fetching enrollments:", error);
    const message =
      error instanceof Error ? error.message : "Failed to fetch enrollments";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * POST /api/enrollments
 * 
 * Enrolls a student in a course. Creates:
 * - CourseEnrollment record
 * - Initial CourseProgress tracking record
 * 
 * Request Body:
 * {
 *   "studentId": 1,
 *   "courseId": 5
 * }
 * 
 * Response:
 * - 201: Enrollment successful
 * - 400: Validation error (missing/invalid IDs, already enrolled)
 * - 401: Unauthorized
 * - 500: Server error
 * 
 * @param request - Next.js request object
 * @returns JSON confirmation with enrollment data
 */
export async function POST(
  request: Request
): Promise<NextResponse<EnrollmentResponse | { error: string }>> {
  try {
    const body = await request.json();
    const { studentId: studentIdRaw, courseId: courseIdRaw } = body;
    const studentId = Number(studentIdRaw);
    const courseId = Number(courseIdRaw);

    // Validate input types and presence
    if (
      !studentIdRaw ||
      !courseIdRaw ||
      Number.isNaN(studentId) ||
      Number.isNaN(courseId)
    ) {
      return NextResponse.json(
        { error: "studentId and courseId are required and must be valid numbers" },
        { status: 400 }
      );
    }

    // Service call - handles enrollment creation and initial progress tracking
    const enrollment = await enrollStudentInCourse(studentId, courseId);

    const response: EnrollmentResponse = {
      status: 201,
      message: "User enrolled successfully",
      data: enrollment,
    };
    return NextResponse.json(response, { status: 201 });
  } catch (error: unknown) {
    console.error("Error creating enrollment:", error);
    const message =
      error instanceof Error ? error.message : "Failed to enroll in course";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}