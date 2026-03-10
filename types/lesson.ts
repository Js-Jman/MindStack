export const lessonWithCourseInclude = (userId: number) =>
  ({
    contents: { orderBy: { contentOrder: "asc" } },
    progress: { where: { userId } },
    section: {
      include: {
        course: {
          include: {
            sections: {
              include: {
                lessons: {
                  orderBy: { lessonOrder: "asc" },
                  include: {
                    progress: { where: { userId } },
                  },
                },
              },
              orderBy: { sectionOrder: "asc" },
            },
            courseProgress: { where: { userId } },
          },
        },
      },
    },
  } as const);

export type LessonProgressRecord = {
  status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
  completedAt?: Date | null;
};

export type LessonContentRecord = {
  contentType: "TEXT" | "IMAGE" | "VIDEO";
  contentBody: string;
  contentOrder?: number;
};

export type CourseLessonRecord = {
  id: number;
  title: string;
  lessonOrder: number;
  progress: LessonProgressRecord[];
};

export type CourseSectionRecord = {
  id: number;
  title: string;
  sectionOrder: number;
  lessons: CourseLessonRecord[];
};

export type CourseProgressRecord = {
  completionPercentage: number | { toString(): string };
  status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
};

export type FullLessonData = {
  id: number;
  title: string;
  contents: LessonContentRecord[];
  progress: LessonProgressRecord[];
  section: {
    course: {
      id: number;
      title: string;
      sections: CourseSectionRecord[];
      courseProgress: CourseProgressRecord[];
    };
  };
};
