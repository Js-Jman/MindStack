/**
 * @fileoverview Lesson Repository - Database Layer
 * 
 * This repository handles all database operations related to lessons.
 * It encapsulates Prisma queries for:
 * - Fetching lessons with sections and course information
 * - Searching and filtering lessons by course/section
 * - Creating, updating, and soft-deleting lessons
 */

import { prisma } from "@/lib/db";

/**
 * Fetch all lessons in a course with their sections
 * 
 * @param courseId - ID of the course
 * @returns Array of lessons with section details
 */
export async function getLessonsByCourse(courseId: number) {
  return await prisma.lesson.findMany({
    where: {
      deletedAt: null,
      section: {
        deletedAt: null,
        courseId,
      },
    },
    include: {
      section: true,
    },
    orderBy: { createdAt: "asc" },
  });
}

/**
 * Fetch all lessons in a specific section
 * 
 * @param sectionId - ID of the section
 * @returns Array of lessons
 */
export async function getLessonsBySection(sectionId: number) {
  return await prisma.lesson.findMany({
    where: {
      deletedAt: null,
      sectionId,
      section: {
        deletedAt: null,
      },
    },
    orderBy: { createdAt: "asc" },
  });
}

/**
 * Fetch a single lesson by ID with full details
 * 
 * Includes section and course information for context
 * 
 * @param lessonId - ID of the lesson
 * @returns Lesson with section/course details or null if not found
 */
export async function getLessonById(lessonId: number) {
  return await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: {
      section: {
        include: {
          course: true,
        },
      },
    },
  });
}

/**
 * Create a new lesson in a section
 * 
 * @param data - Lesson data (title, description, content, etc.)
 * @returns Created lesson record
 */
export async function createLesson(data: {
  title: string;
  content: string;
  sectionId: number;
  order?: number;
}) {
  return await prisma.lesson.create({
    data: {
      title: data.title,
      contents: {
        create: {
          contentType: "TEXT",
          contentBody: data.content,
          contentOrder: 1,
        },
      },
      sectionId: data.sectionId,
      lessonOrder: data.order ?? 1,
    },
    include: {
      section: true,
      contents: true,
    },
  });
}

/**
 * Update lesson details
 * 
 * @param lessonId - ID of the lesson to update
 * @param data - Partial lesson data to update
 * @returns Updated lesson record or null if not found
 */
export async function updateLesson(
  lessonId: number,
  data: Partial<{
    title: string;
    description: string;
    content: string;
    order: number;
  }>
) {
  return await prisma.lesson.update({
    where: { id: lessonId },
    data,
    include: {
      section: true,
    },
  });
}

/**
 * Soft delete a lesson (set deletedAt timestamp)
 * 
 * Soft deletes preserve data for auditing while hiding from queries
 * 
 * @param lessonId - ID of the lesson to delete
 * @returns Deletion success boolean
 */
export async function deleteLesson(lessonId: number) {
  try {
    await prisma.lesson.update({
      where: { id: lessonId },
      data: { deletedAt: new Date() },
    });
    return true;
  } catch {
    return false;
  }
}

/**
 * Count total lessons in a course (excluding soft-deleted)
 * 
 * Used for calculating course completion percentages
 * 
 * @param courseId - ID of the course
 * @returns Total lesson count
 */
export async function countLessonsByOnCourse(courseId: number) {
  return await prisma.lesson.count({
    where: {
      deletedAt: null,
      section: {
        deletedAt: null,
        courseId,
        course: { deletedAt: null },
      },
    },
  });
}

/**
 * Count total lessons in a section
 * 
 * @param sectionId - ID of the section
 * @returns Total lesson count
 */
export async function countLessonsBySection(sectionId: number) {
  return await prisma.lesson.count({
    where: {
      deletedAt: null,
      sectionId,
    },
  });
}
