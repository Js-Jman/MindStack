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
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { getStudentStats } from "@/services/enrollment.service";

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
  try {
    const studentId = await resolveStudentIdFromSession();
    if (!studentId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
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
