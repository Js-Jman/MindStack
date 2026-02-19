import { NextResponse } from "next/server";
import { getStudentEnrollments, enrollStudentInCourse } from "@/services/enrollment.service";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const studentIdParam = searchParams.get("studentId");
    const studentId = studentIdParam ? Number(studentIdParam) : NaN;

    if (!studentIdParam || Number.isNaN(studentId)) {
      return NextResponse.json(
        { error: "studentId is required" },
        { status: 400 }
      );
    }

    const enrollments = await getStudentEnrollments(studentId);

    // Map to Course shape expected by the student dashboard
    const courses = enrollments.map((enrollment: any) => {
      const course = enrollment.course;
      const progress = course.courseProgress?.[0];
      const lessonCount = course.sections?.reduce(
        (sum: number, s: any) => sum + (s.lessons?.length ?? 0),
        0
      ) ?? 0;
      return {
        id: course.id,
        title: course.title,
        description: course.description,
        image: course.thumbnailUrl ?? undefined,
        instructor: course.instructor
          ? { name: course.instructor.name, email: course.instructor.email }
          : undefined,
        lessonCount,
        progress: progress ? Number(progress.completionPercentage) : 0,
        status: enrollment.status,
      };
    });

    return NextResponse.json(courses);
  } catch (error: any) {
    console.error("Error fetching enrollments:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch enrollments" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { studentId: studentIdRaw, courseId: courseIdRaw } = body;
    const studentId = Number(studentIdRaw);
    const courseId = Number(courseIdRaw);

    if (!studentIdRaw || !courseIdRaw || Number.isNaN(studentId) || Number.isNaN(courseId)) {
      return NextResponse.json(
        { error: "studentId and courseId are required" },
        { status: 400 }
      );
    }

    const enrollment = await enrollStudentInCourse(studentId, courseId);
    return NextResponse.json(enrollment, { status: 201 });
  } catch (error: any) {
    console.error("Error creating enrollment:", error);
    return NextResponse.json(
      { error: error.message || "Failed to enroll in course" },
      { status: 400 }
    );
  }
}
