import { prisma } from "@/lib/db";
import { Course, CreateCourseInput, UpdateCourseInput } from "@/types/course";

const instructorSelect = {
  id: true,
  name: true,
  email: true,
};

type CourseLikeWithSections = {
  sections?: Array<{ lessons?: Array<{ id: number; title: string }> }>;
};

function withLessonCount<T extends CourseLikeWithSections>(course: T) {
  const lessonCount = course.sections?.reduce(
    (sum, section) => sum + (section.lessons?.length || 0),
    0,
  );

  return {
    ...course,
    lessonCount,
  };
}

export async function findAll(): Promise<Course[]> {
  const courses = await prisma.course.findMany({
    where: { isPublished: true },
    include: {
      instructor: { select: instructorSelect },
      sections: { include: { lessons: { select: { id: true, title: true } } } },
      assignments: true,
      enrollments: true,
      courseProgress: true,
    },
  });

  return courses.map(withLessonCount);
}

export async function findById(id: number): Promise<Course | null> {
  const course = await prisma.course.findUnique({
    where: { id },
    include: {
      instructor: { select: instructorSelect },
      sections: { include: { lessons: { select: { id: true, title: true } } } },
      assignments: true,
      enrollments: {
        include: {
          user: { select: { id: true, name: true, email: true } },
        },
      },
      courseProgress: true,
    },
  });

  return course ? withLessonCount(course) : null;
}

export async function findEnrolledCoursesByStudent(
  studentId: number,
): Promise<Course[]> {
  const enrollments = await prisma.courseEnrollment.findMany({
    where: { userId: studentId },
    include: {
      course: {
        include: {
          instructor: { select: instructorSelect },
          sections: {
            include: { lessons: { select: { id: true, title: true } } },
          },
          assignments: true,
          courseProgress: {
            where: { userId: studentId },
            select: { completionPercentage: true, status: true },
          },
        },
      },
    },
    orderBy: { enrolledAt: "desc" },
  });

  return enrollments.map((e) => {
    const progress = e.course.courseProgress[0];

    return {
      ...withLessonCount(e.course),
      progress: progress ? Number(progress.completionPercentage) : 0,
      status: progress?.status ?? "NOT_STARTED",
    } as Course & { progress?: number; status?: string };
  });
}

export async function create(data: CreateCourseInput): Promise<Course> {
  const course = await prisma.course.create({
    data: {
      ...data,
      isPublished: data.isPublished ?? false,
    },
    include: {
      instructor: { select: instructorSelect },
      sections: { include: { lessons: { select: { id: true, title: true } } } },
      assignments: true,
      enrollments: true,
      courseProgress: true,
    },
  });

  return withLessonCount(course);
}

export async function update(
  id: number,
  data: UpdateCourseInput,
): Promise<Course | null> {
  const course = await prisma.course.update({
    where: { id },
    data,
    include: {
      instructor: { select: instructorSelect },
      sections: { include: { lessons: { select: { id: true, title: true } } } },
      assignments: true,
      enrollments: true,
      courseProgress: true,
    },
  });

  return withLessonCount(course);
}

export async function remove(id: number): Promise<boolean> {
  try {
    await prisma.course.delete({
      where: { id },
    });
    return true;
  } catch {
    return false;
  }
}

export async function searchCourses(query: string): Promise<Course[]> {
  const courses = await prisma.course.findMany({
    where: {
      isPublished: true,
      OR: [
        { title: { contains: query } },
        { description: { contains: query } },
      ],
    },
    include: {
      instructor: { select: instructorSelect },
      sections: { include: { lessons: { select: { id: true, title: true } } } },
      assignments: true,
      enrollments: true,
      courseProgress: true,
    },
  });

  return courses.map(withLessonCount);
}
