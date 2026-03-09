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
import { prisma } from "@/lib/db";
import { enrollStudentInCourse, getStudentEnrollmentsFormatted } from "@/services/enrollment.service";
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

  try {
    const enrollments = await getStudentEnrollmentsFormatted(studentId);
    return NextResponse.json(enrollments);
  } catch (error: unknown) {
    console.error("Error fetching enrollments:", error);
    const message = error instanceof Error ? error.message : "Failed to fetch enrollments";
    return NextResponse.json({ error: message }, { status: 500 });
  }
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
        { error: "courseId is required and must be a valid number" },
        { status: 400 }
      );
    }

    // Service call - handles enrollment creation and initial progress tracking
    const enrollment = await enrollStudentInCourse(studentId, courseId);

    return NextResponse.json({
      message: "User enrolled successfully",
      data: enrollment,
    }, { status: 201 });
  } catch (error: unknown) {
    console.error("Error creating enrollment:", error);
    const message = error instanceof Error ? error.message : "Failed to enroll in course";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}