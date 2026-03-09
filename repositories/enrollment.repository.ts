/**
 * @fileoverview Enrollment Repository - Database Layer
 * 
 * This repository handles all database operations related to course enrollments.
 * It encapsulates Prisma queries for:
 * - Creating and managing student-course enrollments
 * - Tracking enrollment status (ACTIVE, COMPLETED, DROPPED)
 * - Managing course progress for enrolled students
 * - Retrieving enrollment and progress statistics
 * 
 * Key responsibility: Acts as the single source of database access for enrollment data
 */

import { prisma } from "@/lib/db";
import { EnrollmentStatus, ProgressStatus, Prisma } from "@prisma/client";

/**
 * Standard fields to select for instructor information
 * Used across multiple enrollment queries for consistency
 */
const instructorSelect = {
  id: true,
  name: true,
  email: true,
};

/**
 * Enroll a student in a course
 * 
 * This operation:
 * 1. Creates a CourseEnrollment record (with unique constraint to prevent duplicates)
 * 2. Creates initial CourseProgress record (starts at 0% progress)
 * 3. Returns full enrollment with course details
 * 
 * @param studentId - ID of the student
 * @param courseId - ID of the course
 * @returns Created enrollment with course and instructor details
 * @throws Error if student already enrolled (P2002) or other database errors
 */
export async function enrollStudent(studentId: number, courseId: number) {
  try {
    // Create enrollment record
    const enrollment = await prisma.courseEnrollment.create({
      data: {
        userId: studentId,
        courseId,
        status: EnrollmentStatus.ACTIVE,
      },
      include: {
        course: {
          include: {
            instructor: { select: instructorSelect },
            sections: { include: { lessons: { select: { id: true } } } },
          },
        },
      },
    });

    // Initialize course progress tracking
    await prisma.courseProgress.create({
      data: {
        userId: studentId,
        courseId,
        status: ProgressStatus.IN_PROGRESS,
        completionPercentage: 0,
      },
    });

    return enrollment;
  } catch (error: unknown) {
    // Handle unique constraint violation (student already enrolled)
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      throw new Error("Student is already enrolled in this course");
    }
    throw error;
  }
}

/**
 * Get enrollment record for a specific student-course pair
 * 
 * Used to check if student is enrolled and verify enrollment status
 * 
 * @param studentId - ID of the student
 * @param courseId - ID of the course
 * @returns Enrollment record or null if not enrolled
 */
export async function getEnrollmentByStudentAndCourse(
  studentId: number,
  courseId: number
) {
  return await prisma.courseEnrollment.findUnique({
    where: {
      courseId_userId: {
        courseId,
        userId: studentId,
      },
    },
  });
}

/**
 * Get all courses a student is enrolled in
 * 
 * Returns complete enrollment details including:
 * - Course information and instructor details
 * - Course structure (sections, lessons count)
 * - Student's progress in each course
 * 
 * Results ordered by most recent enrollment first
 * 
 * @param studentId - ID of the student
 * @returns Array of enrollment records with full course details
 */
export async function getStudentEnrollments(studentId: number) {
  return await prisma.courseEnrollment.findMany({
    where: { userId: studentId },
    include: {
      course: {
        include: {
          instructor: { select: instructorSelect },
          sections: { include: { lessons: { select: { id: true } } } },
          // Get this specific student's progress in each course
          courseProgress: {
            where: { userId: studentId },
            select: { completionPercentage: true, status: true },
          },
        },
      },
    },
    orderBy: { enrolledAt: "desc" },
  });
}

/**
 * Get all enrolled students in a course (Instructor view)
 * 
 * Returns all student enrollments for a course with progress information
 * Useful for instructor course management dashboards
 * 
 * @param courseId - ID of the course
 * @returns Array of enrollment records with student details
 */
export async function getEnrollmentsByCourse(courseId: number) {
  return await prisma.courseEnrollment.findMany({
    where: { courseId },
    include: {
      user: {
        select: { id: true, name: true, email: true },
      },
      course: {
        select: { id: true, title: true },
      },
    },
    orderBy: { enrolledAt: "desc" },
  });
}

/**
 * Update progress for a student enrollment
 * 
 * Business logic:
 * - If progress reaches 100%, mark enrollment and course as COMPLETED
 * - Otherwise, mark as ACTIVE with IN_PROGRESS status
 * - Updates both CourseEnrollment and CourseProgress tables
 * 
 * @param studentId - ID of the student
 * @param courseId - ID of the course
 * @param progress - Progress percentage (0-100)
 * @returns Updated course progress record
 */
export async function updateEnrollmentProgress(
  studentId: number,
  courseId: number,
  progress: number
) {
  // Determine statuses based on completion
  const courseStatus = progress === 100 
    ? ProgressStatus.COMPLETED 
    : ProgressStatus.IN_PROGRESS;
    
  const enrollmentStatus = progress === 100 
    ? EnrollmentStatus.COMPLETED 
    : EnrollmentStatus.ACTIVE;

  // Update enrollment status
  await prisma.courseEnrollment.update({
    where: {
      courseId_userId: {
        courseId,
        userId: studentId,
      },
    },
    data: {
      status: enrollmentStatus,
      completedAt: progress === 100 ? new Date() : null,
    },
  });

  // Update course progress
  return await prisma.courseProgress.update({
    where: {
      courseId_userId: {
        courseId,
        userId: studentId,
      },
    },
    data: {
      status: courseStatus,
      completionPercentage: progress,
    },
  });
}

/**
 * Get student's learning statistics across all courses
 * 
 * Calculates:
 * - Total enrollments
 * - Completed courses count
 * - In-progress courses count
 * - Average progress percentage across all courses
 * 
 * @param studentId - ID of the student
 * @returns Statistics object with enrollment and progress metrics
 */
export async function getStudentStats(studentId: number) {
  // Fetch all enrollments for this student
  const enrollments = await prisma.courseEnrollment.findMany({
    where: { userId: studentId },
  });

  // Fetch progress records
  const progressRows = await prisma.courseProgress.findMany({
    where: { userId: studentId },
  });

  // Calculate statistics
  const totalEnrollments = enrollments.length;
  const completedCourses = enrollments.filter(
    (e) => e.status === EnrollmentStatus.COMPLETED
  ).length;
  const inProgressCourses = enrollments.filter(
    (e) => e.status === EnrollmentStatus.ACTIVE
  ).length;
  
  const totalProgress = progressRows.reduce(
    (sum, p) => sum + Number(p.completionPercentage),
    0
  );
  const averageProgress =
    totalEnrollments > 0 ? totalProgress / totalEnrollments : 0;

  return {
    totalEnrollments,
    completedCourses,
    inProgressCourses,
    averageProgress: Math.round(averageProgress),
  };
}

/**
 * Drop (unenroll) a student from a course
 * 
 * Soft action - updates enrollment status to DROPPED without deleting record
 * This preserves enrollment history for auditing purposes
 * 
 * @param studentId - ID of the student
 * @param courseId - ID of the course
 * @returns Updated enrollment record or null if not found
 */
export async function dropEnrollment(
  studentId: number,
  courseId: number
) {
  return await prisma.courseEnrollment.update({
    where: {
      courseId_userId: {
        courseId,
        userId: studentId,
      },
    },
    data: {
      status: EnrollmentStatus.DROPPED,
      completedAt: new Date(),
    },
  });
}

/**
 * Count total enrollments in a course
 * 
 * @param courseId - ID of the course
 * @returns Number of active enrollments
 */
export async function countEnrollmentsByCourse(courseId: number) {
  return await prisma.courseEnrollment.count({
    where: {
      courseId,
      status: { not: EnrollmentStatus.DROPPED },
    },
  });
}
