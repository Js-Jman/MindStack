import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import AssignmentSubmissionForm from "@/components/AssignmentSubmissionForm";

type Params = { courseId: string };

type SearchParams = {
  lessonId?: string;
};

export default async function AssignmentsPage({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<SearchParams>;
}) {
  const session = await getSession();
  if (!session?.userId) {
    redirect("/signin");
  }

  const { courseId } = await params;
  const { lessonId } = await searchParams;

  const courseIdNum = Number(courseId);
  const lessonIdNum = lessonId ? Number(lessonId) : null;

  if (!Number.isInteger(courseIdNum)) {
    return notFound();
  }

  const course = await prisma.course.findUnique({
    where: { id: courseIdNum },
    include: {
      sections: {
        orderBy: { sectionOrder: "asc" },
        include: {
          lessons: {
            orderBy: { lessonOrder: "asc" },
            select: { id: true, title: true },
          },
        },
      },
      assignments: {
        where: { deletedAt: null },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          title: true,
          description: true,
          dueDate: true,
          submissions: {
            where: { userId: session.userId },
            select: {
              id: true,
              submittedAt: true,
              grade: true,
            },
          },
        },
      },
    },
  });

  if (!course || course.deletedAt) {
    return notFound();
  }

  type CourseSection = (typeof course.sections)[number];
  type CourseLesson = CourseSection["lessons"][number];

  const allLessons: CourseLesson[] = course.sections.flatMap(
    (s: CourseSection) => s.lessons,
  );
  const selectedLesson = lessonIdNum
    ? allLessons.find((l: CourseLesson) => l.id === lessonIdNum)
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Assignments</h1>
          <Link
            href={selectedLesson ? `/courses/${course.id}/lessons/${selectedLesson.id}` : `/courses/${course.id}`}
            className="px-4 py-2 rounded-xl border border-purple-200 text-purple-700 font-semibold hover:bg-purple-50 transition-colors"
          >
            Back to {selectedLesson ? "Lesson" : "Course"}
          </Link>
        </div>

        <div className="bg-white rounded-2xl border border-purple-100 shadow p-6">
          <p className="text-sm text-purple-700 font-semibold">Course</p>
          <h2 className="text-xl font-bold text-gray-900 mt-1">{course.title}</h2>
          {selectedLesson && (
            <p className="mt-2 text-gray-600">
              Showing assignment practice for lesson: <span className="font-semibold">{selectedLesson.title}</span>
            </p>
          )}
        </div>

        {course.assignments.length > 0 && (
          <section className="space-y-4">
            <h3 className="text-lg font-bold text-gray-900">Course Assignments</h3>
            {course.assignments.map((assignment: (typeof course.assignments)[number]) => (
              <AssignmentSubmissionForm
                key={assignment.id}
                assignmentId={assignment.id}
                assignmentTitle={assignment.title}
                assignmentDescription={assignment.description}
                dueDate={assignment.dueDate?.toISOString() || null}
              />
            ))}
          </section>
        )}

        <section className="space-y-4">
          <h3 className="text-lg font-bold text-gray-900">Lesson Practice Tasks</h3>
          {(selectedLesson ? [selectedLesson] : allLessons).map((lesson, idx) => (
            <article
              key={lesson.id}
              className="bg-white rounded-2xl border border-gray-100 shadow p-5"
            >
              <div className="flex items-center justify-between gap-3">
                <h4 className="font-semibold text-gray-900">Task {idx + 1}: {lesson.title}</h4>
                <span className="text-xs px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                  Practice
                </span>
              </div>
              <ul className="mt-3 list-disc pl-5 text-sm text-gray-700 space-y-1">
                <li>Summarize the key concept from this lesson in 3-5 bullet points.</li>
                <li>Implement one practical example related to this lesson topic.</li>
                <li>Write one challenge you faced and how you solved it.</li>
              </ul>
            </article>
          ))}
        </section>
      </div>
    </div>
  );
}
