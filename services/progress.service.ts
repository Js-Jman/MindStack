import * as enrollmentRepository from "@/repositories/enrollment.repository";

export async function updateLessonProgress(
  studentId: number,
  courseId: number,
  progress: number
) {
  if (progress < 0 || progress > 100) {
    throw new Error("Progress must be between 0 and 100");
  }

  return await enrollmentRepository.updateEnrollmentProgress(
    studentId,
    courseId,
    progress
  );
}

export async function getProgress(studentId: number, courseId: number) {
  const enrollment =
    await enrollmentRepository.getEnrollmentByStudentAndCourse(
      studentId,
      courseId
    );

  if (!enrollment) {
    throw new Error("Enrollment not found");
  }

  return {
    progress: enrollment.progress,
    status: enrollment.status,
    enrolledAt: enrollment.enrolledAt,
    completedAt: enrollment.completedAt,
  };
}

export async function getStudentProgress(studentId: number) {
  const enrollments = await enrollmentRepository.getStudentEnrollments(
    studentId
  );

  return enrollments.map((e) => ({
    courseId: e.courseId,
    courseTitle: e.course.title,
    progress: e.progress,
    status: e.status,
    enrolledAt: e.enrolledAt,
    completedAt: e.completedAt,
  }));
}
