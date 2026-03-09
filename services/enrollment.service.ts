/**
 * @fileoverview Enrollment Service - Business Logic Layer
 * 
 * This service contains business logic for enrollment operations.
 * It orchestrates between:
 * - enrollmentRepository: database layer for enrollment and progress data
 * 
 * Responsibilities:
 * - Input validation for enrollment operations
 * - Authorization checks (e.g., can user enroll in course)
 * - Orchestrating multi-step operations
 * - Error handling and logging
 */

import * as enrollmentRepository from "@/repositories/enrollment.repository";
import { CourseEnrollment, StudentStats } from "@/types/progress";

export type EnrolledCourseResponse = {
  id: number;
  title: string;
  description: string;
  image: string | null;
  instructor: { name?: string; email: string };
  lessonCount: number;
  progress: number;
  status: "ACTIVE" | "COMPLETED" | "DROPPED";
  enrolledAt: Date;
  completedAt: Date | null;
};

/**
 * Enroll a student in a course
 * 
 * Creates both CourseEnrollment and initial CourseProgress records.
 * Prevents duplicate enrollments.
 * 
 * @param studentId - ID of the student
 * @param courseId - ID of the course
 * @returns Created enrollment with course details
 * @throws Error if student already enrolled or invalid inputs
 */
export async function enrollStudentInCourse(
  studentId: number,
  courseId: number
): Promise<CourseEnrollment> {
  const enrollment = await enrollmentRepository.enrollStudent(
    studentId,
    courseId
  );
  return enrollment;
}

/**
 * Get all courses a student is enrolled in with progress
 * 
 * Returns formatted enrollment data including:
 * - Course information
 * - Instructor details
 * - Current progress percentage
 * - Enrollment status
 * 
 * Results ordered by most recent enrollment first
 * 
 * @param studentId - ID of the student
 * @returns Array of enrollment records with course details
 */
export async function getStudentEnrollments(
  studentId: number
): Promise<CourseEnrollment[]> {
  return await enrollmentRepository.getStudentEnrollments(studentId);
}

/**
 * Get all courses a student is enrolled in, formatted for API response
 * 
 * Transforms enrollment data into the format expected by frontend:
 * - Calculates lesson counts
 * - Formats progress information
 * - Includes instructor and course metadata
 * 
 * @param studentId - ID of the student
 * @returns Array of formatted enrollment objects
 */
export async function getStudentEnrollmentsFormatted(
  studentId: number
): Promise<EnrolledCourseResponse[]> {
  const enrollments = await enrollmentRepository.getStudentEnrollments(
    studentId
  );

  return enrollments.map((e): EnrolledCourseResponse => {
    // Sum lessons across all sections
    const lessonsCount = e.course.sections.reduce(
      (acc, s) => acc + s.lessons.length,
      0
    );

    // Get progress from courseProgress array (should only have 1 entry)
    const progress = e.course.courseProgress[0]
      ? Number(e.course.courseProgress[0].completionPercentage)
      : 0;

    return {
      id: e.courseId,
      title: e.course.title,
      description: e.course.description,
      image: e.course.thumbnailUrl,
      instructor: {
        name: e.course.instructor?.name,
        email: e.course.instructor?.email ?? "",
      },
      lessonCount: lessonsCount,
      progress,
      status: e.status,
      enrolledAt: e.enrolledAt,
      completedAt: e.completedAt,
    };
  });
}

/**
 * Update progress for a course enrollment
 * 
 * Manually sets progress percentage and updates enrollment/course status accordingly.
 * If progress reaches 100%, marks enrollment as COMPLETED.
 * 
 * @param studentId - ID of the student
 * @param courseId - ID of the course
 * @param progress - Progress percentage (0-100)
 * @throws Error if progress out of range
 */
export async function updateProgress(
  studentId: number,
  courseId: number,
  progress: number
): Promise<void> {
  if (progress < 0 || progress > 100) {
    throw new Error("Progress must be between 0 and 100");
  }

  await enrollmentRepository.updateEnrollmentProgress(
    studentId,
    courseId,
    progress
  );
}

/**
 * Get learning statistics for a student
 * 
 * Calculates aggregate metrics across all enrollments:
 * - Total enrollments
 * - Completed courses
 * - In-progress courses
 * - Average progress percentage
 * 
 * @param studentId - ID of the student
 * @returns Statistics object
 */
export async function getStudentStats(studentId: number): Promise<StudentStats> {
  return await enrollmentRepository.getStudentStats(studentId);
}

/**
 * Check if student is enrolled in a course
 * 
 * @param studentId - ID of the student
 * @param courseId - ID of the course
 * @returns True if enrolled, false otherwise
 */
export async function isStudentEnrolled(
  studentId: number,
  courseId: number
): Promise<boolean> {
  const enrollment =
    await enrollmentRepository.getEnrollmentByStudentAndCourse(
      studentId,
      courseId
    );
  return !!enrollment;
}

/**
 * Drop (unenroll) a student from a course
 * 
 * @param studentId - ID of the student
 * @param courseId - ID of the course
 * @returns Updated enrollment record
 * @throws Error if not enrolled
 */
export async function dropEnrollment(
  studentId: number,
  courseId: number
): Promise<CourseEnrollment> {
  return await enrollmentRepository.dropEnrollment(studentId, courseId);
}
