"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";

// Mark a lesson as COMPLETED and recompute CourseProgress for the user.
export async function toggleLessonProgress(lessonId: number, userId: number) {
  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: { section: { select: { courseId: true } } },
  });
  if (!lesson) throw new Error("Lesson not found");

  const courseId = lesson.section.courseId;

  // Ensure the user is enrolled
  const enrollment = await prisma.courseEnrollment.findUnique({
    where: { courseId_userId: { courseId, userId } },
  });
  if (!enrollment) throw new Error("User is not enrolled in this course");

  // Upsert LessonProgress
  await prisma.lessonProgress.upsert({
    where: { lessonId_userId: { lessonId, userId } },
    create: { lessonId, userId, status: "COMPLETED", completedAt: new Date() },
    update: { status: "COMPLETED", completedAt: new Date() },
  });

  // Recompute course progress
  const [totalLessons, completedLessons] = await Promise.all([
    prisma.lesson.count({ where: { section: { courseId } } }),
    prisma.lessonProgress.count({
      where: { userId, status: "COMPLETED", lesson: { section: { courseId } } },
    }),
  ]);

  const pct =
    totalLessons === 0
      ? 0
      : Math.round((completedLessons / totalLessons) * 100);
  const status =
    pct >= 100 ? "COMPLETED" : pct > 0 ? "IN_PROGRESS" : "NOT_STARTED";

  await prisma.courseProgress.upsert({
    where: { courseId_userId: { courseId, userId } },
    create: {
      courseId,
      userId,
      status,
      completionPercentage: new Prisma.Decimal(pct),
    },
    update: {
      status,
      completionPercentage: new Prisma.Decimal(pct),
    },
  });

  // Optionally mark CourseEnrollment completed when 100%
  if (pct === 100 && enrollment.status !== "COMPLETED") {
    await prisma.courseEnrollment.update({
      where: { courseId_userId: { courseId, userId } },
      data: { status: "COMPLETED", completedAt: new Date() },
    });
  }

  // Revalidate the relevant pages
  revalidatePath(`/courses/${courseId}/lessons/${lessonId}`);
  revalidatePath(`/courses/${courseId}`);
  revalidatePath(`/courses`);
}
