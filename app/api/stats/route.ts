/**
 * @file GET /api/stats - Get student learning statistics
 * 
 * This route handler orchestrates HTTP requests for student statistics.
 * 
 * Responsibilities (API Layer):
 * 1. Extract and validate HTTP request data (query params)
 * 2. Authenticate/authorize the user
 * 3. Call service layer with validated inputs
 * 4. Format responses according to API contract
 * 5. Map business logic errors to HTTP status codes
 */

import { NextResponse } from "next/server";
import { getStudentStats } from "@/services/enrollment.service";

/**
 * GET /api/stats?studentId=1
 * 
 * Retrieves aggregated learning statistics for a student.
 * 
 * Query Parameters:
 * - studentId (required): ID of the student
 * 
 * Response:
 * {
 *   "totalEnrollments": 5,        // Total courses enrolled
 *   "completedCourses": 2,        // Courses with 100% completion
 *   "inProgressCourses": 3,       // Courses being taken (0-99% completion)
 *   "averageProgress": 65         // Average completion % across all courses
 * }
 * 
 * @param req - Next.js request object
 * @returns JSON statistics object
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const studentIdParam = searchParams.get("studentId");
    const studentId = Number(studentIdParam);

    // Validate input
    if (!Number.isInteger(studentId) || studentId <= 0) {
      return NextResponse.json({ error: "Invalid studentId" }, { status: 400 });
    }

    // Service call - returns aggregated statistics
    // Repository handles efficient queries for all metrics
    const stats = await getStudentStats(studentId);

    return NextResponse.json(stats);
  } catch (error: unknown) {
    console.error("Error fetching stats:", error);
    const message =
      error instanceof Error ? error.message : "Failed to fetch statistics";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
