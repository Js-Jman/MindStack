/**
 * @fileoverview Course Repository - Database Layer
 * 
 * This repository handles all database operations related to courses.
 * It encapsulates Prisma queries for:
 * - Fetching published courses with all related data
 * - Finding courses by ID with full course structure
 * - Searching courses by title/description
 * - Managing student enrollments and progress
 * - Creating, updating, removing courses
 * 
 * Key responsibility: Single source of database access for course-related data
 */

import { prisma } from "@/lib/db";
import { Prisma, CourseAssignment, CourseEnrollment, CourseProgress } from "@prisma/client";
import { CreateCourseInput, UpdateCourseInput } from "@/types/course";

/**
 * Standard fields to select for instructor information
 * Used across multiple course queries for consistency
 */
const instructorSelect = {
  id: true,
  name: true,
  email: true,
};

/**
 * Type for courses with sections that include lessons
 * Used for helper function to calculate lesson count
 */
type CourseLikeWithSections = {
  sections?: Array<{ lessons?: Array<{ id: number; title: string }> }>;
};

/**
 * Type for course repository responses - simplified version without full lesson details
 */

// ... earlier in file after imports, keep them


type CourseRepositoryResult = {
  id: number;
  instructorId: number;
  title: string;
  description: string;
  thumbnailUrl?: string | null;
  price?: number | null;
  introVideoUrl?: string | null;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
  instructor?: { id: number; name: string; email: string } | null;
  sections: Array<{
    id: number;
    title: string;
    sectionOrder: number;
    courseId: number;
    lessons: Array<{ id: number; title?: string }>;
  }>;
  assignments?: CourseAssignment[];
  enrollments?: CourseEnrollment[];
  courseProgress?: CourseProgress[];
  lessonCount?: number;
};

/**
 * Type for enrollment response that includes course progress
 */
type EnrollmentWithCourse = {
  courseId: number;
  userId: number;
  enrolledAt: Date;
  status: string;
  completedAt: Date | null;
  course: {
    id: number;
    instructorId: number;
    title: string;
    description: string;
    thumbnailUrl?: string | null;
    price?: number | Prisma.Decimal | null;
    introVideoUrl?: string | null;
    isPublished: boolean;
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date | null;
    instructor?: { id: number; name: string; email: string } | null;
    sections: Array<{
      id: number;
      title: string;
      sectionOrder: number;
      courseId: number;
      lessons: Array<{ id: number; title: string }>;
    }>;
    assignments?: CourseAssignment[];
    courseProgress?: CourseProgress[];
    lessonCount?: number;
  };
};

/**
 * Helper function: Adds lesson count to course object
 * Calculates total lessons across all sections
 * 
 * @param course - Course object with sections
 * @returns Course with added lessonCount property
 */
function withLessonCount<T extends CourseLikeWithSections>(course: T) {
  const lessonCount = course.sections?.reduce(
    (sum, section) => sum + (section.lessons?.length || 0),
    0,
  );

  return {
    ...course,
    lessonCount,
  };
}

/**
 * Get all published courses
 * 
 * Returns courses with:
 * - Instructor details
 * - Sections and lessons structure
 * - Assignments information
 * - Enrollment and progress data
 * 
 * @returns Array of all published courses with complete details
 */
export async function findAll(): Promise<CourseRepositoryResult[]> {
  const courses = await prisma.course.findMany({
    where: { isPublished: true },
    include: {
      instructor: { select: instructorSelect },
      sections: { include: { lessons: { select: { id: true, title: true } } } },
      assignments: true,
      enrollments: true,
      courseProgress: true,
    },
  });

  return courses.map(withLessonCount).map(course => ({
    ...course,
    price: course.price ? Number(course.price) : null,
  })) as CourseRepositoryResult[];
}

/**
 * Get all published courses enriched for a specific student view
 * 
 * Adds student-specific information to each course:
 * - Whether student is enrolled
 * - Student's progress percentage
 * - Student's progress status
 * 
 * This method avoids N+1 queries by fetching enrichment data efficiently
 * 
 * @param currentUserId - ID of the student viewing courses
 * @returns Array of courses with enrollment and progress information
 */
export async function findAllWithEnrichment(currentUserId: number): Promise<Array<CourseRepositoryResult & {
  instructorName: string;
  isEnrolled: boolean;
  progress: number;
  progressStatus: string;
  isFree: boolean;
}>> {
  // Step 1: Fetch all published courses (basic info + sections/lessons)
  const courses = await prisma.course.findMany({
    where: { isPublished: true },
    include: {
      instructor: { select: instructorSelect },
      sections: { include: { lessons: { select: { id: true } } } },
    },
  });

  // Step 2: Get this student's enrollment status for all courses (efficient batch query)
  const enrollmentMap = new Map<number, boolean>();
  const enrollments = await prisma.courseEnrollment.findMany({
    where: { userId: currentUserId },
    select: { courseId: true },
  });
  enrollments.forEach((e) => enrollmentMap.set(e.courseId, true));

  // Step 3: Get this student's progress in all courses (efficient batch query)
  const progressMap = new Map<number, { completionPercentage: number; status: string }>();
  const progressRecords = await prisma.courseProgress.findMany({
    where: { userId: currentUserId },
    select: { courseId: true, completionPercentage: true, status: true },
  });
  progressRecords.forEach((p) =>
    progressMap.set(p.courseId, {
      completionPercentage: Number(p.completionPercentage),
      status: p.status,
    })
  );

  // Step 4: Enrich courses with student-specific data
  return courses.map((course) => {
    const lessonCount = course.sections.reduce(
      (acc, s) => acc + s.lessons.length,
      0,
    );

    const progress = progressMap.get(course.id) || { completionPercentage: 0, status: "NOT_STARTED" };

    return {
      ...course,
      price: course.price ? Number(course.price) : null,
      lessonCount,
      instructorName: course.instructor?.name ?? "Unknown",
      isEnrolled: enrollmentMap.has(course.id),
      progress: progress.completionPercentage,
      progressStatus: progress.status,
      isFree: !course.price || Number(course.price) === 0,
    };
  });
}

/**
 * Fetch a single course by ID with full details
 * 
 * Includes:
 * - Complete course structure (sections, lessons, assignments)
 * - Instructor information
 * - All enrollments and their student details
 * - Course progress records
 * 
 * @param id - Course ID
 * @returns Course with full details or null if not found
 */
export async function findById(id: number): Promise<CourseRepositoryResult | null> {
  const course = await prisma.course.findUnique({
    where: { id },
    include: {
      instructor: { select: instructorSelect },
      sections: { include: { lessons: { select: { id: true, title: true } } } },
      assignments: true,
      enrollments: {
        include: {
          user: { select: { id: true, name: true, email: true } },
        },
      },
      courseProgress: true,
    },
  });

  return course ? { ...withLessonCount(course), price: course.price ? Number(course.price) : null } as CourseRepositoryResult : null;
}

/**
 * Fetch all courses a student is enrolled in
 * 
 * Returns courses with:
 * - Student's progress information
 * - Course structure and instructor details
 * - Ordered by most recent enrollment first
 * 
 * @param studentId - ID of the student
 * @returns Array of enrolled courses with progress
 */
export async function findEnrolledCoursesByStudent(
  studentId: number,
): Promise<CourseRepositoryResult[]> {
  const enrollments = (await prisma.courseEnrollment.findMany({
    where: { userId: studentId },
    include: {
      course: {
        include: {
          instructor: { select: instructorSelect },
          sections: {
            include: { lessons: { select: { id: true, title: true } } },
          },
          assignments: true,
          courseProgress: {
            where: { userId: studentId },
            select: {
              id: true,
              courseId: true,
              userId: true,
              status: true,
              completionPercentage: true,
              updatedAt: true,
            },
          },
        },
      },
    },
    orderBy: { enrolledAt: "desc" },
  })) as EnrollmentWithCourse[];

  return enrollments.map((e: EnrollmentWithCourse) => {
    const progress = e.course.courseProgress?.[0];

    return {
      ...withLessonCount(e.course),
      price: e.course.price ? Number(e.course.price) : null,
      progress: progress ? Number(progress.completionPercentage) : 0,
      status: progress?.status ?? "NOT_STARTED",
    } as CourseRepositoryResult & { progress?: number; status?: string };
  });
}

/**
 * Create a new course
 * 
 * Creates course with initial state (not published by default)
 * Returns course with all related data
 * 
 * @param data - Course creation input (title, description, instructorId, etc.)
 * @returns Created course with full details
 */
export async function create(data: CreateCourseInput): Promise<CourseRepositoryResult> {
  const course = await prisma.course.create({
    data: {
      ...data,
      isPublished: data.isPublished ?? false,
    },
    include: {
      instructor: { select: instructorSelect },
      sections: { include: { lessons: { select: { id: true, title: true } } } },
      assignments: true,
      enrollments: true,
      courseProgress: true,
    },
  });

  return { ...withLessonCount(course), price: course.price ? Number(course.price) : null } as CourseRepositoryResult;
}

/**
 * Update course details
 * 
 * @param id - Course ID
 * @param data - Partial course data to update
 * @returns Updated course with full details or null if not found
 */
export async function update(
  id: number,
  data: UpdateCourseInput,
): Promise<CourseRepositoryResult | null> {
  const course = await prisma.course.update({
    where: { id },
    data,
    include: {
      instructor: { select: instructorSelect },
      sections: { include: { lessons: { select: { id: true, title: true } } } },
      assignments: true,
      enrollments: true,
      courseProgress: true,
    },
  });

  return { ...withLessonCount(course), price: course.price ? Number(course.price) : null } as CourseRepositoryResult;
}

/**
 * Delete a course
 * 
 * @param id - Course ID
 * @returns Deletion success boolean
 */
export async function remove(id: number): Promise<boolean> {
  try {
    await prisma.course.delete({
      where: { id },
    });
    return true;
  } catch {
    return false;
  }
}

/**
 * Search published courses by title or description
 * 
 * Uses case-insensitive contains search
 * Returns courses with complete details
 * 
 * @param query - Search query string
 * @returns Array of matching courses
 */
export async function searchCourses(query: string): Promise<CourseRepositoryResult[]> {
  const courses = await prisma.course.findMany({
    where: {
      isPublished: true,
      OR: [
        { title: { contains: query } },
        { description: { contains: query } },
      ],
    },
    include: {
      instructor: { select: instructorSelect },
      sections: { include: { lessons: { select: { id: true, title: true } } } },
      assignments: true,
      enrollments: true,
      courseProgress: true,
    },
  });

  // convert Decimal price values to number and cast to repository result type
  return courses
    .map(withLessonCount)
    .map(c => ({ ...c, price: c.price ? Number(c.price) : null })) as CourseRepositoryResult[];
}

/**
 * Search published courses by title or description, enriched for a student view
 * 
 * Adds student-specific information (enrollment, progress)
 * 
 * @param query - Search query string
 * @param currentUserId - ID of the student viewing results
 * @returns Array of matching courses with enrichment data
 */
export async function searchCoursesWithEnrichment(
  query: string,
  currentUserId: number
): Promise<Array<CourseRepositoryResult & {
  instructorName: string;
  isEnrolled: boolean;
  progress: number;
  progressStatus: string;
  isFree: boolean;
  image: string | null;
}>> {
  // Step 1: Search courses
  const courses = query && query.trim()
    ? await prisma.course.findMany({
        where: {
          isPublished: true,
          OR: [
            { title: { contains: query } },
            { description: { contains: query } },
          ],
        },
        include: {
          instructor: { select: instructorSelect },
          sections: { include: { lessons: { select: { id: true } } } },
        },
      })
    : await prisma.course.findMany({
        where: { isPublished: true },
        include: {
          instructor: { select: instructorSelect },
          sections: { include: { lessons: { select: { id: true } } } },
        },
      });

  // Step 2: Get student's enrollments (batch query)
  const enrollmentMap = new Map<number, boolean>();
  const enrollments = await prisma.courseEnrollment.findMany({
    where: { userId: currentUserId },
    select: { courseId: true },
  });
  enrollments.forEach((e) => enrollmentMap.set(e.courseId, true));

  // Step 3: Get student's progress (batch query)
  const progressMap = new Map<number, { completionPercentage: number; status: string }>();
  const progressRecords = await prisma.courseProgress.findMany({
    where: { userId: currentUserId },
    select: { courseId: true, completionPercentage: true, status: true },
  });
  progressRecords.forEach((p) =>
    progressMap.set(p.courseId, {
      completionPercentage: Number(p.completionPercentage),
      status: p.status,
    })
  );

  // Step 4: Enrich results
  return courses.map((course) => {
    const lessonCount = course.sections.reduce(
      (acc, s) => acc + s.lessons.length,
      0,
    );

    const progress = progressMap.get(course.id) || { completionPercentage: 0, status: "NOT_STARTED" };

    // normalize price to number
    const priceValue = course.price ? Number(course.price) : null;

    return {
      ...course,
      price: priceValue,
      lessonCount,
      instructorName: course.instructor?.name ?? "Unknown",
      isEnrolled: enrollmentMap.has(course.id),
      progress: progress.completionPercentage,
      progressStatus: progress.status,
      isFree: !priceValue || priceValue === 0,
      image: course.thumbnailUrl,
    };
  });
}
