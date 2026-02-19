export type Course = {
  id: string;
  title: string;
  description: string;
  instructorId: string;
  createdAt: Date;
  updatedAt: Date;
};

export type CreateCourseInput = {
  title: string;
  description: string;
  instructorId: string;
};

export type UpdateCourseInput = Partial<CreateCourseInput>;
