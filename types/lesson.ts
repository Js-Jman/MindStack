import { Prisma } from "@prisma/client";

export const lessonWithCourseInclude = (userId: number) =>
  Prisma.validator<Prisma.LessonInclude>()({
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
  });

export type FullLessonData = Prisma.LessonGetPayload<{
  include: ReturnType<typeof lessonWithCourseInclude>;
}>;
