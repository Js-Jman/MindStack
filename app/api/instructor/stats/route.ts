/**
 * @file GET /api/instructor/stats - Get instructor dashboard statistics
 *
 * This route handler provides statistics for instructor dashboards.
 *
 * Responsibilities (API Layer):
 * 1. Authenticate instructor user
 * 2. Call service layer for stats calculation
 * 3. Format responses according to API contract
 * 4. Map business logic errors to HTTP status codes
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { getInstructorStats } from "@/services/instructor.service";
import { Role } from "@prisma/client";

async function resolveInstructorIdFromSession() {
  const session = await getSession();
  if (!session?.userId) return null;

  const user = await prisma.user.findUnique({
    where: { id: Number(session.userId) },
    select: { id: true, role: true, deletedAt: true },
  });

  // Check if user exists, is not deleted, and is an instructor
  if (user && !user.deletedAt && user.role === Role.INSTRUCTOR) {
    return user.id;
  }

  return null;
}

export async function GET(req: Request) {
  try {
    const instructorId = await resolveInstructorIdFromSession();
    if (!instructorId) {
      return NextResponse.json(
        { error: "Not authenticated or not an instructor" },
        { status: 401 }
      );
    }

    // Service call - returns aggregated statistics for instructor
    const stats = await getInstructorStats(instructorId);

    return NextResponse.json(stats);
  } catch (error: unknown) {
    console.error("Error fetching instructor stats:", error);
    const message =
      error instanceof Error ? error.message : "Failed to fetch instructor statistics";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}