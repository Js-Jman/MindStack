/**
 * @fileoverview Progress Service - Business Logic Layer
 * 
 * This service contains business logic for tracking student progress across courses.
 * It orchestrates operations between:
 * - enrollmentRepository: managing course enrollments
 * - progressRepository: tracking lesson and course progress
 * 
 * The service handles:
 * - Validating progress inputs
 * - Coordinating multi-step progress updates
 * - Error handling and logging
 */

import * as enrollmentRepository from "@/repositories/enrollment.repository";
import * as progressRepository from "@/repositories/progress.repository";

/**
 * Mark a lesson as completed or incomplete for a student
 * 
 * Business logic:
 * 1. Validate lessonId and done status
 * 2. Delegate to progressRepository.markLessonDone() which:
 *    - Updates lesson progress
 *    - Recalculates course completion percentage
 *    - Updates course enrollment status based on completion
 * 3. Return progress metrics
 * 
 * @param studentId - ID of the student
 * @param lessonId - ID of the lesson
 * @param done - Whether to mark as done (true) or in progress (false)
 * @returns Progress result with course metrics
 * @throws Error if lesson not found or user not enrolled
 */
export async function markLessonDone(
  studentId: number,
  lessonId: number,
  done: boolean
) {
  if (!Number.isFinite(lessonId)) {
    throw new Error("Invalid lessonId");
  }
  if (done === null || done === undefined) {
    throw new Error("Invalid done value");
  }

  // Delegate all progress tracking to repository (which handles Prisma transaction)
  return await progressRepository.markLessonDone(studentId, lessonId, done);
}

/**
 * Get course progress for a specific enrollment
 * 
 * @param studentId - ID of the student
 * @param courseId - ID of the course
 * @returns Progress metrics or error if not enrolled
 * @throws Error if enrollment not found
 */
export async function getProgress(
  studentId: number,
  courseId: number
) {
  const progress = await progressRepository.getProgressByStudentAndCourse(
    studentId,
    courseId
  );

  if (!progress) {
    throw new Error("Enrollment not found");
  }

  return progress;
}

/**
 * Get all course progress for a student
 * 
 * Returns progress across all enrolled courses
 * 
 * @param studentId - ID of the student
 * @returns Array of course progress records
 */
export async function getStudentProgress(studentId: number) {
  return await progressRepository.getProgressByStudent(studentId);
}

/**
 * Update course progress percentage (manual progress override)
 * 
 * @param studentId - ID of the student
 * @param courseId - ID of the course
 * @param progress - Progress percentage (0-100)
 * @throws Error if progress is out of range
 */
export async function updateLessonProgress(
  studentId: number,
  courseId: number,
  progress: number
) {
  if (progress < 0 || progress > 100) {
    throw new Error("Progress must be between 0 and 100");
  }

  // Use enrollmentRepository for direct progress updates
  return await enrollmentRepository.updateEnrollmentProgress(
    studentId,
    courseId,
    progress
  );
};
