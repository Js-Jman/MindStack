import * as enrollmentRepository from "@/repositories/enrollment.repository";

export async function enrollStudentInCourse(
  studentId: number,
  courseId: number
) {
  const enrollment = await enrollmentRepository.enrollStudent(
    studentId,
    courseId
  );
  return enrollment;
}

export async function getStudentEnrollments(studentId: number) {
  return await enrollmentRepository.getStudentEnrollments(studentId);
}

export async function updateProgress(
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

export async function getStudentStats(studentId: number) {
  return await enrollmentRepository.getStudentStats(studentId);
}

export async function isStudentEnrolled(studentId: number, courseId: number) {
  const enrollment =
    await enrollmentRepository.getEnrollmentByStudentAndCourse(
      studentId,
      courseId
    );
  return !!enrollment;
}
