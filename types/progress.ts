export type CourseEnrollment = {
  id: number;
  userId: number;
  courseId: number;
  status: "ACTIVE" | "COMPLETED" | "DROPPED";
  enrolledAt: Date;
  completedAt?: Date | null;
};

export type CourseProgress = {
  id: number;
  userId: number;
  courseId: number;
  status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
  completionPercentage: number;
  updatedAt: Date;
};

export type StudentStats = {
  totalEnrollments: number;
  completedCourses: number;
  inProgressCourses: number;
  averageProgress: number;
};
