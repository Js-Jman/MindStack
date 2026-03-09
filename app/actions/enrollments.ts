/**
 * @fileoverview Enrollment Server Actions - Business Logic Layer
 * 
 * Server actions for enrollment operations that can be called directly from React components.
 * All operations delegate to the enrollment service (which uses repositories for DB access).
 * 
 * Uses Next.js revalidatePath to maintain cache consistency and update UI.
 */

"use server";

import {
  enrollStudentInCourse,
  dropEnrollment,
} from "@/services/enrollment.service";
import { revalidatePath } from "next/cache";

/**
 * Enroll a user in a course (Server Action)
 * 
 * Creates:
 * 1. CourseEnrollment record with ACTIVE status
 * 2. Initial CourseProgress record
 * 
 * Revalidates paths to update UI after enrollment
 * 
 * @param courseId - ID of the course
 * @param userId - ID of the student
 * @throws Error if already enrolled or invalid inputs
 */
export async function enrollInCourse(courseId: number, userId: number) {
  try {
    // Delegate to enrollment service
    // Service handles:
    // - Creating enrollment record
    // - Creating initial progress record
    // - Preventing duplicate enrollments
    await enrollStudentInCourse(userId, courseId);

    // Revalidate relevant pages to trigger re-render
    revalidatePath(`/courses/${courseId}`);
    revalidatePath(`/courses`);
    revalidatePath(`/dashboard/student`);
  } catch (error) {
    console.error("Error enrolling in course:", error);
    throw error;
  }
}

/**
 * Unenroll (drop) a user from a course (Server Action)
 * 
 * Updates enrollment status to DROPPED without hard delete
 * Preserves enrollment history for auditing
 * 
 * Does not delete lesson progress records, only marks enrollment as dropped
 * 
 * Revalidates paths to update UI after unenrollment
 * 
 * @param courseId - ID of the course
 * @param userId - ID of the student
 * @throws Error if not enrolled or failed to drop
 */
export async function unenrollFromCourse(courseId: number, userId: number) {
  try {
    // Delegate to enrollment service
    // Service handles:
    // - Updating enrollment status to DROPPED
    // - Error handling for not enrolled
    await dropEnrollment(userId, courseId);

    // Revalidate relevant pages to trigger re-render
    revalidatePath(`/courses/${courseId}`);
    revalidatePath(`/courses`);
    revalidatePath(`/dashboard/student`);
  } catch (error) {
    console.error("Error unenrolling from course:", error);
    throw error;
  }
}
