import { prisma } from "@/lib/db";
import * as enrollmentRepository from "@/repositories/enrollment.repository";
import { ProgressStatus, EnrollmentStatus } from "@prisma/client";


export async function updateLessonProgress(
  studentId: number,
  courseId: number,
  progress: number,
) {
  if (progress < 0 || progress > 100) {
    throw new Error("Progress must be between 0 and 100");
  }

  return await enrollmentRepository.updateEnrollmentProgress(
    studentId,
    courseId,
    progress,
  );
}


export async function getProgress(studentId: number, courseId: number) {
  const enrollment = await enrollmentRepository.getEnrollmentByStudentAndCourse(
    studentId,
    courseId,
  );

  if (!enrollment) {
    throw new Error("Enrollment not found");
  }

  const courseProgress = await prisma.courseProgress.findUnique({
    where: { courseId_userId: { courseId, userId: studentId } },
  });

  return {
    progress: Number(courseProgress?.completionPercentage ?? 0),
    status: courseProgress?.status ?? "NOT_STARTED",
    enrolledAt: enrollment.enrolledAt,
    completedAt: enrollment.completedAt,
  };
}


export async function getStudentProgress(studentId: number) {
  const enrollments =
    await enrollmentRepository.getStudentEnrollments(studentId);

  const progressData = await prisma.courseProgress.findMany({
    where: { userId: studentId },
  });

  const map = new Map<number, (typeof progressData)[number]>();
  progressData.forEach((p) => {
    map.set(p.courseId, p);
  });

  return enrollments.map((e) => {
    const cp = map.get(e.courseId);
    return {
      courseId: e.courseId,
      courseTitle: e.course.title,
      progress: Number(cp?.completionPercentage ?? 0),
      status: cp?.status ?? "NOT_STARTED",
      enrolledAt: e.enrolledAt,
      completedAt: e.completedAt,
    };
  });
}


export type MarkLessonDoneResult = {
  done: boolean;
  completionPercentage: number; // number (rounded to 2 decimals)
  status: ProgressStatus; // NOT_STARTED | IN_PROGRESS | COMPLETED
  completedCount: number; // how many lessons completed in this course after this update
  totalCount: number; // total lessons in course
  courseId: number; // owning course id
};


export async function markLessonDone(
  studentId: number,
  lessonId: number,
  done: boolean,
): Promise<MarkLessonDoneResult> {
  const now = new Date();

  return prisma.$transaction(async (tx) => {
    // 1) Load lesson -> section -> course (defensive: exclude soft-deleted)
    const lesson = await tx.lesson.findUnique({
      where: { id: lessonId },
      include: { section: { include: { course: true } } },
    });

    if (!lesson || lesson.deletedAt) {
      throw new Error("Lesson not found");
    }
    if (!lesson.section || lesson.section.deletedAt) {
      throw new Error("Section not found");
    }
    const course = lesson.section.course;
    if (!course || course.deletedAt) {
      throw new Error("Course not found");
    }
    const courseId = course.id;

    // 2) Ensure the user is enrolled in this course (auto-create if missing)
    const enrollment = await tx.courseEnrollment.upsert({
      where: { courseId_userId: { courseId, userId: studentId } },
      create: {
        courseId,
        userId: studentId,
        status: EnrollmentStatus.ACTIVE, // initial status
      },
      update: {}, // do not change an existing status here
    });

    // block if the enrollment was DROPPED
    if (enrollment.status === EnrollmentStatus.DROPPED) {
      throw new Error("User not enrolled in this course");
    }

    // 3) Upsert per-lesson progress (idempotent)
    const lessonStatus = done
      ? ProgressStatus.COMPLETED
      : ProgressStatus.IN_PROGRESS;

    await tx.lessonProgress.upsert({
      where: { lessonId_userId: { lessonId, userId: studentId } },
      update: {
        status: lessonStatus,
        lastAccessedAt: now,
        completedAt: done ? now : null,
      },
      create: {
        lessonId,
        userId: studentId,
        status: lessonStatus,
        lastAccessedAt: now,
        completedAt: done ? now : null,
      },
    });

    // 4) Compute total lessons in this course (exclude soft-deleted)
    const totalCount = await tx.lesson.count({
      where: {
        deletedAt: null,
        section: {
          deletedAt: null,
          courseId,
          course: { deletedAt: null },
        },
      },
    });

    if (totalCount === 0) {
      const cp = await tx.courseProgress.upsert({
        where: { courseId_userId: { courseId, userId: studentId } },
        update: {
          completionPercentage: 0,
          status: ProgressStatus.NOT_STARTED,
        },
        create: {
          courseId,
          userId: studentId,
          completionPercentage: 0,
          status: ProgressStatus.NOT_STARTED,
        },
      });

      return {
        done,
        completionPercentage: Number(cp.completionPercentage),
        status: cp.status,
        completedCount: 0,
        totalCount,
        courseId,
      };
    }

    // 5) Count completed lessons for this user in this course
    const completedCount = await tx.lessonProgress.count({
      where: {
        userId: studentId,
        status: ProgressStatus.COMPLETED,
        lesson: {
          deletedAt: null,
          section: {
            deletedAt: null,
            courseId,
            course: { deletedAt: null },
          },
        },
      },
    });

    // 6) Compute course progress % (2 decimals) and derive status
    const rawPct = (completedCount / totalCount) * 100;
    const completionPercentage = Math.round(rawPct * 100) / 100;

    const courseStatus =
      completionPercentage >= 100
        ? ProgressStatus.COMPLETED
        : completedCount > 0
          ? ProgressStatus.IN_PROGRESS
          : ProgressStatus.NOT_STARTED;

    // 7) Upsert CourseProgress cache
    const cp = await tx.courseProgress.upsert({
      where: { courseId_userId: { courseId, userId: studentId } },
      update: { completionPercentage, status: courseStatus },
      create: {
        courseId,
        userId: studentId,
        completionPercentage,
        status: courseStatus,
      },
    });

    // 8) CourseEnrollment.status when reaching/leaving 100%
    if (
      courseStatus === ProgressStatus.COMPLETED &&
      enrollment.status !== EnrollmentStatus.COMPLETED
    ) {
      await tx.courseEnrollment.update({
        where: { courseId_userId: { courseId, userId: studentId } },
        data: { status: EnrollmentStatus.COMPLETED, completedAt: now },
      });
    } else if (
      courseStatus !== ProgressStatus.COMPLETED &&
      enrollment.status === EnrollmentStatus.COMPLETED
    ) {
      

      await tx.courseEnrollment.update({
        where: { courseId_userId: { courseId, userId: studentId } },
        data: { status: EnrollmentStatus.ACTIVE, completedAt: null },
      });
    }

    return {
      done,
      completionPercentage: Number(cp.completionPercentage),
      status: cp.status,
      completedCount,
      totalCount,
      courseId,
    };
  });
}
``;
