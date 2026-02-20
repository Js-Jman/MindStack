export type Course = {
  id: number;
  instructorId: number;
  title: string;
  description: string;
  thumbnailUrl?: string | null;
  price?: number | null;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
  instructor?: Instructor;
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

