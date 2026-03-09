import { prisma } from "@/lib/db";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Course } from "@/types/course"; // Import your custom type
import { CheckCircle2, PlayCircle } from "lucide-react"; // Helpful icons
import { getSession } from "@/lib/auth";

type Params = { courseId: string };

export default async function CoursePage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { courseId } = await params;
  const courseIdNum = Number(courseId);
  if (!Number.isInteger(courseIdNum)) return notFound();

  const session = await getSession();
  if (!session?.userId) {
    redirect("/signin");
  }

  const currentUserId = Number(session.userId);

  const courseData = await prisma.course.findUnique({
    where: { id: courseIdNum },
    include: {
      sections: {
        orderBy: { sectionOrder: "asc" },
        include: {
          lessons: {
            orderBy: { lessonOrder: "asc" },
            include: {
              progress: { where: { userId: currentUserId } },
            },
          },
        },
      },
      instructor: { select: { name: true } },
      courseProgress: {
        where: { userId: currentUserId },
        select: { completionPercentage: true, status: true },
      },
    },
  });

  if (!courseData) return notFound();

  // Cast the Prisma result to your custom Course type
  const course = courseData as unknown as Course;

  // Safely calculate progress percentage
  const progress = course.courseProgress?.[0]
    ? Math.round(Number(course.courseProgress[0].completionPercentage))
    : 0;

  return (
    <div className="min-h-screen bg-[#f7f8fc]">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 py-10 space-y-10">
        {/* Course Hero Card */}
        <div className="rounded-2xl p-8 bg-gradient-to-r from-purple-600 to-indigo-700 text-white shadow-xl">
          <div className="flex justify-between items-start flex-wrap gap-4">
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

            {/* Progress Visualization */}
            <div className="w-full sm:w-48 bg-white/10 p-4 rounded-xl backdrop-blur-sm border border-white/20">
              <div className="text-sm font-bold mb-1 flex justify-between">
                <span>Progress</span>
                <span>{progress}%</span>
              </div>
              <div className="h-2 w-full bg-white/30 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Curriculum Section */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Course Curriculum
          </h2>

          {course.sections.map((section) => (
            <div key={section.id} className="mb-8 last:mb-0">
              <h3 className="font-bold text-lg text-purple-800 mb-3 flex items-center gap-2">
                <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-sm">
                  Section {section.sectionOrder}
                </span>
                {section.title}
              </h3>

              <ul className="grid gap-3">
                {section.lessons.map((lesson) => {
                  // Check if this specific lesson is done
                  const isDone = lesson.progress?.[0]?.status === "COMPLETED";

                  return (
                    <li
                      key={lesson.id}
                      className="group p-4 rounded-xl border bg-gray-50 hover:bg-white hover:border-purple-300 hover:shadow-md transition-all flex justify-between items-center"
                    >
                      <div className="flex items-center gap-3">
                        {isDone ? (
                          <CheckCircle2 className="text-green-500 w-5 h-5" />
                        ) : (
                          <PlayCircle className="text-gray-400 w-5 h-5 group-hover:text-purple-500" />
                        )}
                        <span
                          className={`font-medium ${isDone ? "text-gray-500 line-through" : "text-gray-800"}`}
                        >
                          {lesson.title}
                        </span>
                      </div>

                      <Link
                        href={`/courses/${course.id}/lessons/${lesson.id}`}
                        className={`px-5 py-2 rounded-full text-sm font-bold transition-colors ${
                          isDone
                            ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
                            : "bg-purple-600 text-white hover:bg-purple-700"
                        }`}
                      >
                        {isDone ? "Review" : "Start"}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
