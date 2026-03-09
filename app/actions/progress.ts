/**
 * @fileoverview Progress Server Actions - Business Logic Layer
 * 
 * Server actions for lesson progress tracking that can be called directly from React components.
 * All operations delegate to the progress service (which uses repositories for DB access).
 * 
 * Uses Next.js revalidatePath to maintain cache consistency and update UI.
 */

"use server";

import { markLessonDone } from "@/services/progress.service";
import { revalidatePath } from "next/cache";

/**
 * Toggle lesson completion status (Server Action)
 * 
 * Marks a lesson as completed or incomplete, triggering course progress recalculation.
 * 
 * This operation:
 * 1. Updates lesson progress status
 * 2. Ensures user is enrolled in the course
 * 3. Recalculates course completion percentage
 * 4. Updates course status based on completion
 * 5. Updates enrollment status if course reaches 100%
 * 
 * Uses Prisma transaction for atomicity
 * 
 * Revalidates paths to update UI after progress update
 * 
 * @param lessonId - ID of the lesson
 * @param userId - ID of the student
 * @throws Error if lesson not found or user not enrolled
 */
export async function toggleLessonProgress(lessonId: number, userId: number) {
  try {
    // Delegate to progress service
    // Service delegates to progress repository which:
    // - Validates lesson exists and is not soft-deleted
    // - Ensures user is enrolled in the course
    // - Marks lesson as COMPLETED (always marks as done, toggle logic handled elsewhere)
    // - Recalculates course completion percentage
    // - Updates course and enrollment status based on completion
    // - Uses Prisma transaction for atomicity

    // NOTE: Currently always marks as COMPLETED, doesn't toggle based on current state
    // To implement true toggle, would need to:
    // 1. Query existing lesson progress status
    // 2. Toggle to opposite status
    // For now, calling markLessonDone with done=true
    await markLessonDone(userId, lessonId, true);

    // Revalidate relevant pages to trigger re-render
    revalidatePath(`/courses/${lessonId}/lessons/${lessonId}`);
    revalidatePath(`/courses`);
    revalidatePath(`/dashboard/student`);
  } catch (error) {
    console.error("Error toggling lesson progress:", error);
    throw error;
  }
}
