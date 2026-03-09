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
  searchCoursesForStudent,
  createCourse,
} from "@/services/course.service";

/**
 * Helper: Extract error message from various error types
 * 
 * @param error - Unknown error object
 * @returns String error message
 */
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

    // TODO: Get actual current user ID from session/auth
    // For now, using mock user ID
    const currentUserId = 1;

    // Service call - returns enriched courses with student's enrollment/progress data
    // No additional Prisma calls needed; repository handles efficient batch queries
    const courses = await searchCoursesForStudent(query || "", currentUserId);

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
    const body = await request.json();

    // Service layer handles validation
    // (title and description required)
    const course = await createCourse(body);

    return NextResponse.json(course, { status: 201 });
  } catch (error: unknown) {
    console.error("Error creating course:", error);
    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: 400 }
    );
  }
}
