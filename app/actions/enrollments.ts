"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";

// Enroll the user in a course and ensure a CourseProgress row exists.
export async function enrollInCourse(courseId: number, userId: number) {
  await prisma.courseEnrollment.upsert({
    where: { courseId_userId: { courseId, userId } },
    update: { status: "ACTIVE" },
    create: { courseId, userId, status: "ACTIVE" },
  });

  await prisma.courseProgress.upsert({
    where: { courseId_userId: { courseId, userId } },
    update: {}, // keep existing progress if present
    create: {
      courseId,
      userId,
      status: "IN_PROGRESS",
      completionPercentage: new Prisma.Decimal(0),
    },
  });

  revalidatePath(`/courses/${courseId}`);
  revalidatePath(`/courses`);
}

// Unenroll and clear progress rows (optional: also clear lesson progress)
export async function unenrollFromCourse(courseId: number, userId: number) {
  await prisma.courseEnrollment.delete({
    where: { courseId_userId: { courseId, userId } },
  });

  await prisma.courseProgress.deleteMany({
    where: { courseId, userId },
  });

  // Optional: clear lesson progress for this course
  // await prisma.lessonProgress.deleteMany({
  //   where: { userId, lesson: { section: { courseId } } },
  // });

  revalidatePath(`/courses/${courseId}`);
  revalidatePath(`/courses`);
}
