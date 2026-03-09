import { prisma } from "@/lib/db";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import { notFound } from "next/navigation";

type Params = { courseId: string };

export default async function CoursePage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { courseId } = await params;
  const courseIdNum = Number(courseId);
  if (!Number.isInteger(courseIdNum)) return notFound();

  const currentUserId = 1;

  const course = await prisma.course.findUnique({
    where: { id: courseIdNum },
    include: {
      sections: {
        include: {
          lessons: {
            orderBy: { lessonOrder: "asc" },
            include: { progress: { where: { userId: currentUserId } } },
          },
        },
        orderBy: { sectionOrder: "asc" },
      },
      instructor: { select: { name: true } },
      courseProgress: {
        where: { userId: currentUserId },
        select: { completionPercentage: true, status: true },
      },
    },
  });

  if (!course) return notFound();

  const totalLessons = course.sections.reduce(
    (acc, s) => acc + s.lessons.length,
    0,
  );

  const progress = course.courseProgress[0]
    ? Number(course.courseProgress[0].completionPercentage)
    : 0;

  const flatLessons = course.sections.flatMap((s) => s.lessons);
  const firstLesson = flatLessons[0];

  return (
    <div className="min-h-screen bg-[#f7f8fc]">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 py-10 space-y-10">
        {/* Gradient Header */}
        <div className="rounded-2xl p-8 bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-xl">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-extrabold">{course.title}</h1>
              <p className="text-white/80 mt-2 max-w-2xl">
                {course.description}
              </p>

              <p className="mt-3 text-sm text-white/90">
                Instructor:{" "}
                <span className="font-semibold">{course.instructor?.name}</span>
              </p>
            </div>

            {/* Progress */}
            <div className="w-48">
              <div className="text-sm font-semibold mb-1">
                {progress}% Complete
              </div>
              <div className="h-2 w-full bg-white/30 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white rounded-full"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>

          {/* Navigation buttons */}
          <div className="mt-8 flex gap-3 flex-wrap">
            <button className="px-4 py-2 rounded-full bg-white text-purple-700 font-semibold shadow">
              Overview
            </button>
            <button className="px-4 py-2 rounded-full bg-white/20 hover:bg-white/25 text-white border border-white/30">
              Assignments
            </button>
            <button className="px-4 py-2 rounded-full bg-white/20 hover:bg-white/25 text-white border border-white/30">
              Quizzes
            </button>
            <button className="px-4 py-2 rounded-full bg-white/20 hover:bg-white/25 text-white border border-white/30">
              Resources
            </button>
          </div>
        </div>

        {/* Course Content – Curriculum */}
        <div className="bg-white rounded-2xl p-6 shadow border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Course Curriculum
          </h2>

          {course.sections.map((section) => (
            <div key={section.id} className="mb-6">
              <h3 className="font-semibold text-lg text-purple-700 mb-2">
                {section.title}
              </h3>
              <ul className="space-y-2">
                {section.lessons.map((lesson) => (
                  <li
                    key={lesson.id}
                    className="p-3 rounded-lg border bg-gray-50 hover:border-purple-300 flex justify-between items-center"
                  >
                    <span className="font-medium text-gray-800">
                      {lesson.title}
                    </span>
                    <Link
                      href={`/courses/${course.id}/lessons/${lesson.id}`}
                      className="px-4 py-1.5 rounded-full bg-purple-600 text-white text-sm hover:bg-purple-700 transition"
                    >
                      Start
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
