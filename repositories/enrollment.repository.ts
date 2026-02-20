import { prisma } from "@/lib/db";
import { EnrollmentStatus, ProgressStatus } from "@prisma/client";

const instructorSelect = {
  id: true,
  name: true,
  email: true,
};

export async function enrollStudent(studentId: number, courseId: number) {
  try {
    const enrollment = await prisma.courseEnrollment.create({
      data: {
        userId: studentId,
        courseId,
        status: EnrollmentStatus.ACTIVE,
      },
      include: {
        course: {
          include: {
            instructor: { select: instructorSelect },
            sections: { include: { lessons: { select: { id: true } } } },
          },
        },
      },
    });

    await prisma.courseProgress.create({
      data: {
        userId: studentId,
        courseId,
        status: ProgressStatus.IN_PROGRESS,
        completionPercentage: 0,
      },
    });

    return enrollment;
  } catch (error: any) {
    if (error.code === "P2002") {
      throw new Error("Student is already enrolled in this course");
    }
    throw error;
  }
}

export async function getEnrollmentByStudentAndCourse(
  studentId: number,
  courseId: number
) {
  return await prisma.courseEnrollment.findUnique({
    where: {
      courseId_userId: {
        courseId,
        userId: studentId,
      },
    },
  });
}

export async function getStudentEnrollments(studentId: number) {
  return await prisma.courseEnrollment.findMany({
    where: { userId: studentId },
    include: {
      course: {
        include: {
          instructor: { select: instructorSelect },
          sections: { include: { lessons: { select: { id: true } } } },
          courseProgress: {
            where: { userId: studentId },
            select: { completionPercentage: true, status: true },
          },
        },
      },
    },
    orderBy: { enrolledAt: "desc" },
  });
}

export async function updateEnrollmentProgress(
  studentId: number,
  courseId: number,
  progress: number
) {
  const status = progress === 100 ? ProgressStatus.COMPLETED : ProgressStatus.IN_PROGRESS;
  const enrollmentStatus =
    progress === 100 ? EnrollmentStatus.COMPLETED : EnrollmentStatus.ACTIVE;

  await prisma.courseEnrollment.update({
    where: {
      courseId_userId: {
        courseId,
        userId: studentId,
      },
    },
    data: {
      status: enrollmentStatus,
      completedAt: progress === 100 ? new Date() : null,
    },
  });

  return await prisma.courseProgress.update({
    where: {
      courseId_userId: {
        courseId,
        userId: studentId,
      },
    },
    data: {
      status,
      completionPercentage: progress,
    },
  });
}

export async function getStudentStats(studentId: number) {
  const enrollments = await prisma.courseEnrollment.findMany({
    where: { userId: studentId },
  });

  const progressRows = await prisma.courseProgress.findMany({
    where: { userId: studentId },
  });

  const totalEnrollments = enrollments.length;
  const completedCourses = enrollments.filter(
    (e) => e.status === EnrollmentStatus.COMPLETED
  ).length;
  const inProgressCourses = enrollments.filter(
    (e) => e.status === EnrollmentStatus.ACTIVE
  ).length;
  const totalProgress = progressRows.reduce(
    (sum, p) => sum + Number(p.completionPercentage),
    0
  );
  const averageProgress =
    totalEnrollments > 0 ? totalProgress / totalEnrollments : 0;

  return {
    totalEnrollments,
    completedCourses,
    inProgressCourses,
    averageProgress: Math.round(averageProgress),
  };
}
