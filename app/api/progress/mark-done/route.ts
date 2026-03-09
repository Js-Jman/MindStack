/**
 * @file POST /api/progress/mark-done - Mark lesson as complete/incomplete
 * 
 * This route handler orchestrates HTTP requests for lesson progress tracking.
 * 
 * Responsibilities (API Layer):
 * 1. Extract and validate HTTP request data (lessonId, done status)
 * 2. Authenticate/authorize the user
 * 3. Call service layer for progress tracking
 * 4. Return progress metrics and completion details
 * 5. Map business logic errors to HTTP status codes
 */

import { NextRequest, NextResponse } from "next/server";
import { markLessonDone } from "@/services/progress.service";
import { getSessionFromRequest } from "@/lib/auth";

/**
 * POST /api/progress/mark-done
 * 
 * Marks a lesson as done or incomplete for the authenticated student.
 * 
 * This operation:
 * 1. Updates lesson progress status (COMPLETED or IN_PROGRESS)
 * 2. Recalculates course completion percentage
 * 3. Updates course progress status
 * 4. Updates enrollment status if course reaches 100%
 * 
 * Uses Prisma transaction to ensure atomicity of multi-step operation.
 * 
 * Request Body:
 * {
 *   "lessonId": 123,
 *   "done": true  // or false to mark as in-progress
 * }
 * 
 * Response (Success - 200):
 * {
 *   "done": true,                    // Lesson completion state
 *   "completionPercentage": 65.5,    // Course completion % (rounded to 2 decimals)
 *   "status": "IN_PROGRESS",         // Course status: NOT_STARTED | IN_PROGRESS | COMPLETED
 *   "completedCount": 13,            // Number of completed lessons in course
 *   "totalCount": 20,                // Total lessons in course
 *   "courseId": 5                    // ID of the course
 * }
 * 
 * Request Body (Alternative boolean values):
 * - done: true, "true", 1, "1" → marked as done
 * - done: false, "false", 0, "0" → marked as in-progress
 * 
 * Status Codes:
 * - 200: Progress updated successfully
 * - 400: Validation error (invalid lesson or done value)
 * - 401: User not authenticated
 * - 500: Server error (lesson not found, user not enrolled, etc.)
 * 
 * @param req - Next.js request object
 * @returns JSON with progress metrics or error
 */
export async function POST(req: NextRequest) {
  try {
    // Step 1: Authenticate user
    const session = await getSessionFromRequest(req);
    if (!session?.userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const studentId = Number(session.userId);

    // Step 2: Extract and parse request body
    const body = await req.json();
    console.log("DEBUG INPUT:", body);
    console.log("SESSION USER ID:", studentId);

    // Step 3: Validate and parse lessonId
    const lessonId = Number(body?.lessonId);
    const doneValue = body?.done;

    if (!Number.isFinite(lessonId)) {
      return NextResponse.json(
        { error: "Invalid lessonId", received: body.lessonId },
        { status: 400 }
      );
    }

    // Step 4: Parse and validate done status (flexible format support)
    // Accepts: true, "true", 1, "1" → true
    //        false, "false", 0, "0" → false
    // Everything else → error
    const done =
      doneValue === true ||
      doneValue === "true" ||
      doneValue === 1 ||
      doneValue === "1"
        ? true
        : doneValue === false ||
            doneValue === "false" ||
            doneValue === 0 ||
            doneValue === "0"
          ? false
          : null;

    if (done === null) {
      return NextResponse.json(
        { error: "Invalid done value", received: body.done },
        { status: 400 }
      );
    }

    // Step 5: Call service layer to update progress
    // Service delegates to progressRepository.markLessonDone which:
    // - Validates lesson exists and is not soft-deleted
    // - Ensures student is enrolled in the course
    // - Updates lesson progress status
    // - Recalculates course completion percentage
    // - Updates enrollment status based on completion
    // - Uses Prisma transaction for atomicity
    const data = await markLessonDone(studentId, lessonId, done);

    // Step 6: Return progress metrics
    return NextResponse.json(data);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: undefined | any) {
    console.error("API ERROR:", e);
    return NextResponse.json(
      { error: e?.message ?? "Server error" },
      { status: 500 }
    );
  }
}
