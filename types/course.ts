import {
  Prisma,
  User,
  CourseAssignment,
  CourseEnrollment,
  CourseSection,
  CourseProgress,
  Lesson,
  LessonProgress,
} from "@prisma/client";

export type LessonWithProgress = Lesson & {
  progress: LessonProgress[];
};


export type SectionWithLessons = CourseSection & {
  lessons: LessonWithProgress[];
};

export type Course = {
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

  instructor?: Pick<User, "name">;
  sections: SectionWithLessons[]; 
  courseProgress: CourseProgress[];
  assignments?: CourseAssignment[];
  enrollments?: (CourseEnrollment & {
    user?: Pick<User, "id" | "name" | "email">;
  })[];


  lessonCount?: number;
  rating?: number;
  duration?: number;
  level?: string;
  category?: string;
};

export type Instructor = {
  id: number;
  name: string;
  email: string;
};

export type CourseWithInstructor = Course & {
  instructor: Instructor;
};

export type CreateCourseInput = {
  instructorId: number;
  title: string;
  description: string;
  thumbnailUrl?: string | null;
  price?: number | null;
  isPublished?: boolean;
};

export type UpdateCourseInput = Partial<CreateCourseInput>;
