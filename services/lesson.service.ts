import { prisma } from "@/lib/db";
import { lessonWithCourseInclude, FullLessonData } from "@/types/lesson";

export async function getLessonById(
  lessonId: number,
  courseId: number,
  userId: number,
): Promise<FullLessonData | null> {
  const lesson = await prisma.lesson.findFirst({
    where: {
      id: lessonId,
      section: { courseId: courseId },
      deletedAt: null,
    },
    include: lessonWithCourseInclude(userId),
  });

  return lesson as FullLessonData | null;
}
