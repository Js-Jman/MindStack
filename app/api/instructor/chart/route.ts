/**
 * @file GET /api/instructor/chart - Get enrollment chart data for instructor
 *
 * This route handler provides enrollment chart data for instructor dashboards.
 *
 * Responsibilities (API Layer):
 * 1. Authenticate instructor user
 * 2. Call service layer for chart data
 * 3. Format responses according to API contract
 * 4. Map business logic errors to HTTP status codes
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { getEnrollmentChartData } from "@/services/instructor.service";

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

    // Service call - returns enrollment chart data for instructor
    const chartData = await getEnrollmentChartData(instructorId);

    return NextResponse.json(chartData);
  } catch (error: unknown) {
    console.error("Error fetching instructor chart data:", error);
    const message =
      error instanceof Error ? error.message : "Failed to fetch instructor chart data";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}