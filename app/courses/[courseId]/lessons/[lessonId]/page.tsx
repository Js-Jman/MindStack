import { prisma } from "@/lib/db";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import { notFound } from "next/navigation";
import { toggleLessonProgress } from "@/app/actions/progress";

type Params = { courseId: string; lessonId: string };

export default async function LessonPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { courseId, lessonId } = await params;

  const courseIdNum = Number(courseId);
  const lessonIdNum = Number(lessonId);

  if (!Number.isInteger(courseIdNum) || !Number.isInteger(lessonIdNum))
    return notFound();

  // Fake logged‑in user
  const currentUserId = 1;

  // Fetch lesson with everything needed (FULL LMS structure)
  const lesson = await prisma.lesson.findFirst({
    where: { id: lessonIdNum, section: { courseId: courseIdNum } },
    include: {
      contents: { orderBy: { contentOrder: "asc" } },
      progress: { where: { userId: currentUserId } },
      quizzes: true,
      section: {
        include: {
          course: {
            include: {
              sections: {
                include: {
                  lessons: {
                    orderBy: { lessonOrder: "asc" },
                    include: {
                      progress: { where: { userId: currentUserId } },
                    },
                  },
                },
                orderBy: { sectionOrder: "asc" },
              },
            },
          },
        },
      },
    },
  });

  if (!lesson) return notFound();

  const course = lesson.section.course;

  // Flatten all lessons for next/prev navigation
  const flatLessons = course.sections.flatMap((s) => s.lessons);
  const currentIndex = flatLessons.findIndex((l) => l.id === lesson.id);

  const prevLesson = currentIndex > 0 ? flatLessons[currentIndex - 1] : null;
  const nextLesson =
    currentIndex < flatLessons.length - 1
      ? flatLessons[currentIndex + 1]
      : null;

  // Status checks
  const isCompleted = lesson.progress?.[0]?.status === "COMPLETED";

  // Course Progress
  const totalLessons = flatLessons.length;
  const completedLessons = flatLessons.filter(
    (l) => l.progress?.[0]?.status === "COMPLETED",
  ).length;

  const progress = Math.round((completedLessons / totalLessons) * 100);

  // Content selections
  const videoContent = lesson.contents.find((c) => c.contentType === "VIDEO");
  const textContent = lesson.contents.find((c) => c.contentType === "TEXT");

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-blue-50 to-white">
      {/* Navbar */}
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 py-10 space-y-10">
        {/* Header */}
        <div className="rounded-2xl p-8 bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg">
          <h1 className="text-3xl font-extrabold">{lesson.title}</h1>

          {/* Course Progress */}
          <div className="mt-4">
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

          {/* Tabs */}
          <div className="mt-6 flex gap-3 flex-wrap">
            <button className="px-4 py-2 bg-white text-purple-700 font-semibold rounded-full shadow">
              Content
            </button>
            <button className="px-4 py-2 bg-white/20 text-white border border-white/40 rounded-full">
              Overview
            </button>
            <button className="px-4 py-2 bg-white/20 text-white border border-white/40 rounded-full">
              Quiz
            </button>
            <button className="px-4 py-2 bg-white/20 text-white border border-white/40 rounded-full">
              Assignments
            </button>
          </div>
        </div>

        {/* LESSON CONTENT */}
        <div className="bg-white rounded-2xl p-8 border shadow space-y-12">
          {/* Video */}
          {videoContent && (
            <div className="rounded-xl overflow-hidden shadow-xl bg-black aspect-video">
              <video controls className="w-full h-full object-cover">
                <source src={videoContent.contentBody} />
              </video>
            </div>
          )}

          {/* TEXT */}
          {textContent && (
            <div
              className="prose prose-lg prose-purple max-w-none text-gray-800 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: textContent.contentBody }}
            />
          )}

          {/* QUIZ
          {lesson.quizzes.length > 0 && (
            <div className="pt-8 border-t">
              <h2 className="text-2xl font-bold text-purple-700 mb-4">Quiz</h2>

              {lesson.quizzes.map((q) => (
                <div
                  key={q.id}
                  className="p-4 bg-blue-50 rounded-xl border border-blue-100 shadow-sm mb-3"
                >
                  {/* <p className="font-semibold text-gray-900">{q.question}</p> */}
                {/* </div>
              ))}
            </div>
          )} */} 

          {/* MARK AS DONE */}
          <div className="flex justify-center pt-8 border-t">
            <form
              action={async () => {
                "use server";
                await toggleLessonProgress(lesson.id, currentUserId);
              }}
            >
              <button
                className={`px-10 py-3 rounded-full text-lg font-semibold shadow transition 
                ${
                  isCompleted
                    ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                    : "bg-purple-600 text-white hover:bg-purple-700"
                }`}
                disabled={isCompleted}
              >
                {isCompleted ? "Completed" : "Mark as Done"}
              </button>
            </form>
          </div>

          {/* Lesson Navigation */}
          <div className="flex justify-between pt-6 border-t">
            {prevLesson ? (
              <Link
                href={`/courses/${course.id}/lessons/${prevLesson.id}`}
                className="px-4 py-2 rounded-full bg-gray-100 hover:bg-gray-200 transition"
              >
                ← Previous Lesson
              </Link>
            ) : (
              <span />
            )}

            {nextLesson ? (
              <Link
                href={`/courses/${course.id}/lessons/${nextLesson.id}`}
                className="px-4 py-2 rounded-full bg-purple-600 text-white hover:bg-purple-700 transition"
              >
                Next Lesson →
              </Link>
            ) : (
              <span />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
