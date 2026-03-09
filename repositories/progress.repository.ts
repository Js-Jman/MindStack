/**
 * @fileoverview Progress Repository - Database Layer
 * 
 * This repository handles all database operations related to lesson progress and course progress.
 * It encapsulates Prisma queries for:
 * - Tracking student progress in lessons
 * - Computing course completion percentages
 * - Managing enrollment status based on progress
 * 
 * All operations use Prisma transactions to ensure data consistency.
 */

import { prisma } from "@/lib/db";
import { ProgressStatus, EnrollmentStatus } from "@prisma/client";

/**
 * Type definition for the result of marking a lesson as done
 * Includes progress metrics and course completion information
 */
export type MarkLessonDoneResult = {
  done: boolean;                  // Whether lesson is marked as complete
  completionPercentage: number;   // Course completion percentage (0-100, rounded to 2 decimals)
  status: ProgressStatus;         // Course status: NOT_STARTED | IN_PROGRESS | COMPLETED
  completedCount: number;         // Number of completed lessons in the course
  totalCount: number;             // Total lessons in the course
  courseId: number;               // ID of the course being tracked
};

/**
 * Mark a single lesson as done or incomplete for a student
 * 
 * This is a complex operation that:
 * 1. Validates the lesson exists and belongs to a valid course
 * 2. Ensures the student is enrolled in the course
 * 3. Updates lesson progress status
 * 4. Recalculates course completion percentage
 * 5. Updates course status based on completion
 * 6. Updates enrollment status if course is completed/uncompleted
 * 
 * Uses Prisma transaction to ensure atomicity
 * 
 * @param studentId - ID of the student marking the lesson
 * @param lessonId - ID of the lesson
 * @param done - Whether to mark as done (true) or in progress (false)
 * @returns Progress update result with course metrics
 * @throws Error if lesson/section/course not found or user not enrolled
 */
export async function markLessonDone(
  studentId: number,
  lessonId: number,
  done: boolean,
): Promise<MarkLessonDoneResult> {
  const now = new Date();

  return prisma.$transaction(async (tx) => {
    // Step 1: Fetch lesson with its section and course (validate existence)
    // Exclude soft-deleted records
    const lesson = await tx.lesson.findUnique({
      where: { id: lessonId },
      include: { section: { include: { course: true } } },
    });

    if (!lesson || lesson.deletedAt) {
      throw new Error("Lesson not found");
    }
    if (!lesson.section || lesson.section.deletedAt) {
      throw new Error("Section not found");
    }
    const course = lesson.section.course;
    if (!course || course.deletedAt) {
      throw new Error("Course not found");
    }
    const courseId = course.id;

    // Step 2: Ensure student is enrolled in this course (auto-create enrollment if missing)
    // This handles cases where progress is tracked before/without explicit enrollment
    const enrollment = await tx.courseEnrollment.upsert({
      where: { courseId_userId: { courseId, userId: studentId } },
      create: {
        courseId,
        userId: studentId,
        status: EnrollmentStatus.ACTIVE,
      },
      update: {}, // Don't change existing enrollment status
    });

    // Prevent marking progress on dropped enrollments
    if (enrollment.status === EnrollmentStatus.DROPPED) {
      throw new Error("User not enrolled in this course");
    }

    // Step 3: Create or update the lesson progress record (idempotent)
    const lessonStatus = done
      ? ProgressStatus.COMPLETED
      : ProgressStatus.IN_PROGRESS;

    await tx.lessonProgress.upsert({
      where: { lessonId_userId: { lessonId, userId: studentId } },
      update: {
        status: lessonStatus,
        lastAccessedAt: now,
        ...(done && { completedAt: now }),
      },
      create: {
        lessonId,
        userId: studentId,
        status: lessonStatus,
        lastAccessedAt: now,
        completedAt: done ? now : undefined,
      },
    });

    // Step 4: Count total lessons in course (excluding soft-deleted)
    const totalCount = await tx.lesson.count({
      where: {
        deletedAt: null,
        section: {
          deletedAt: null,
          courseId,
          course: { deletedAt: null },
        },
      },
    });

    // Handle case with no lessons in course
    if (totalCount === 0) {
      const cp = await tx.courseProgress.upsert({
        where: { courseId_userId: { courseId, userId: studentId } },
        update: {
          completionPercentage: 0,
          status: ProgressStatus.NOT_STARTED,
        },
        create: {
          courseId,
          userId: studentId,
          completionPercentage: 0,
          status: ProgressStatus.NOT_STARTED,
        },
      });

      return {
        done,
        completionPercentage: Number(cp.completionPercentage),
        status: cp.status,
        completedCount: 0,
        totalCount,
        courseId,
      };
    }

    // Step 5: Count completed lessons for student in this course
    const completedCount = await tx.lessonProgress.count({
      where: {
        userId: studentId,
        status: ProgressStatus.COMPLETED,
        lesson: {
          deletedAt: null,
          section: {
            deletedAt: null,
            courseId,
            course: { deletedAt: null },
          },
        },
      },
    });

    // Step 6: Calculate course completion percentage (rounded to 2 decimals)
    const rawPct = (completedCount / totalCount) * 100;
    const completionPercentage = Math.round(rawPct * 100) / 100;

    // Derive course status from completion percentage
    const courseStatus =
      completionPercentage >= 100
        ? ProgressStatus.COMPLETED
        : completedCount > 0
          ? ProgressStatus.IN_PROGRESS
          : ProgressStatus.NOT_STARTED;

    // Step 7: Update or create course progress cache record
    const cp = await tx.courseProgress.upsert({
      where: { courseId_userId: { courseId, userId: studentId } },
      update: { completionPercentage, status: courseStatus },
      create: {
        courseId,
        userId: studentId,
        completionPercentage,
        status: courseStatus,
      },
    });

    // Step 8: Update enrollment status based on course completion
    // Mark enrollment as COMPLETED when course reaches 100%
    // Mark enrollment as ACTIVE if regressing from 100%
    if (
      courseStatus === ProgressStatus.COMPLETED &&
      enrollment.status !== EnrollmentStatus.COMPLETED
    ) {
      await tx.courseEnrollment.update({
        where: { courseId_userId: { courseId, userId: studentId } },
        data: { status: EnrollmentStatus.COMPLETED, completedAt: now },
      });
    } else if (
      courseStatus !== ProgressStatus.COMPLETED &&
      enrollment.status === EnrollmentStatus.COMPLETED
    ) {
      await tx.courseEnrollment.update({
        where: { courseId_userId: { courseId, userId: studentId } },
        data: { status: EnrollmentStatus.ACTIVE, completedAt: null },
      });
    }

    return {
      done,
      completionPercentage: Number(cp.completionPercentage),
      status: cp.status,
      completedCount,
      totalCount,
      courseId,
    };
  });
}

/**
 * Get progress summary for a specific course enrollment
 * 
 * Retrieves course progress metrics including completion percentage and status,
 * along with enrollment information
 * 
 * @param studentId - ID of the student
 * @param courseId - ID of the course
 * @returns Progress metrics or null if not enrolled
 */
export async function getProgressByStudentAndCourse(
  studentId: number,
  courseId: number
) {
  const enrollment = await prisma.courseEnrollment.findUnique({
    where: { courseId_userId: { courseId, userId: studentId } },
  });

  if (!enrollment) {
    return null;
  }

  const courseProgress = await prisma.courseProgress.findUnique({
    where: { courseId_userId: { courseId, userId: studentId } },
  });

  return {
    progress: Number(courseProgress?.completionPercentage ?? 0),
    status: courseProgress?.status ?? ProgressStatus.NOT_STARTED,
    enrolledAt: enrollment.enrolledAt,
    completedAt: enrollment.completedAt,
  };
}

/**
 * Get all course progress records for a student
 * 
 * Retrieves progress across all enrolled courses with enrollment and progress details
 * 
 * @param studentId - ID of the student
 * @returns Array of course progress records
 */
export async function getProgressByStudent(studentId: number) {
  const enrollments = await prisma.courseEnrollment.findMany({
    where: { userId: studentId },
    include: {
      course: {
        select: { id: true, title: true },
      },
    },
  });

  const progressData = await prisma.courseProgress.findMany({
    where: { userId: studentId },
  });

  const progressMap = new Map<number, (typeof progressData)[number]>();
  progressData.forEach((p) => {
    progressMap.set(p.courseId, p);
  });

  return enrollments.map((e) => {
    const cp = progressMap.get(e.courseId);
    return {
      courseId: e.courseId,
      courseTitle: e.course.title,
      progress: Number(cp?.completionPercentage ?? 0),
      status: cp?.status ?? ProgressStatus.NOT_STARTED,
      enrolledAt: e.enrolledAt,
      completedAt: e.completedAt,
    };
  });
}

/**
 * Get lesson progress details for a student
 * 
 * @param studentId - ID of the student
 * @param lessonId - ID of the lesson
 * @returns Lesson progress record or null if not started
 */
export async function getLessonProgressByStudentAndLesson(
  studentId: number,
  lessonId: number
) {
  return await prisma.lessonProgress.findUnique({
    where: { lessonId_userId: { lessonId, userId: studentId } },
  });
}

/**
 * Get all lesson progress for a student in a course
 * 
 * @param studentId - ID of the student
 * @param courseId - ID of the course
 * @returns Array of lesson progress records
 */
export async function getLessonProgressByStudentAndCourse(
  studentId: number,
  courseId: number
) {
  return await prisma.lessonProgress.findMany({
    where: {
      userId: studentId,
      lesson: {
        section: { courseId },
      },
    },
    include: {
      lesson: true,
    },
  });
}
