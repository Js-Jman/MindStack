type UserSummary = {
  id: number;
  name: string;
  email: string;
};

type CourseAssignment = {
  id: number;
  title?: string;
  description?: string | null;
  dueDate?: Date | null;
};

type CourseEnrollment = {
  id: number;
  userId: number;
  courseId: number;
  status: "ACTIVE" | "COMPLETED" | "DROPPED";
  enrolledAt: Date;
  completedAt?: Date | null;
};

type CourseProgress = {
  id: number;
  userId: number;
  courseId: number;
  status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
  completionPercentage: number | { toString(): string };
  updatedAt?: Date;
};

type LessonProgress = {
  id?: number;
  status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
  completedAt?: Date | null;
};

type Lesson = {
  id: number;
  title?: string;
  lessonOrder?: number;
};

type CourseSection = {
  id: number;
  title: string;
  sectionOrder: number;
  courseId: number;
};

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
  price?: number | null;
  introVideoUrl?: string | null;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;

  instructor?: Pick<UserSummary, "name">;
  sections: SectionWithLessons[]; 
  courseProgress: CourseProgress[];
  assignments?: CourseAssignment[];
  enrollments?: (CourseEnrollment & {
    user?: Pick<UserSummary, "id" | "name" | "email">;
  })[];


  lessonCount?: number;
};

export type Instructor = {
  id: number;
  name: string;
  email: string;
};


export type CreateCourseInput = {
  instructorId: number;
  title: string;
  description: string;
  thumbnailUrl?: string | null;
  introVideoUrl?: string | null;
  price?: number | null;
  isPublished?: boolean;
};

export type UpdateCourseInput = Partial<CreateCourseInput>;
