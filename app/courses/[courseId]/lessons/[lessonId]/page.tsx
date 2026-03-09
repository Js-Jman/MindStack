import React from "react";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import MarkDoneButton from "@/components/markAsDone";
import { getLessonById } from "@/services/lesson.service";
import { getSession } from "@/lib/auth";
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  PlayCircle,
  FileText,
  Layout,
  HelpCircle,
} from "lucide-react";

type Props = {
  params: Promise<{ courseId: string; lessonId: string }>;
};

export default async function LessonPage({ params }: Props) {
  const { courseId, lessonId } = await params;

  const courseIdNum = Number(courseId);
  const lessonIdNum = Number(lessonId);

  if (isNaN(courseIdNum) || isNaN(lessonIdNum)) {
    return notFound();
  }

  const session = await getSession();
  if (!session?.userId) {
    redirect("/signin");
  }

  const currentUserId = Number(session.userId);

  const lessonRecord = await getLessonById(
    lessonIdNum,
    courseIdNum,
    currentUserId,
  );

  if (!lessonRecord) return notFound();

  const course = lessonRecord.section.course;
  const flatLessons = course.sections.flatMap((s) => s.lessons);
  const currentIndex = flatLessons.findIndex((l) => l.id === lessonRecord.id);

  const prevLesson = currentIndex > 0 ? flatLessons[currentIndex - 1] : null;
  const nextLesson =
    currentIndex < flatLessons.length - 1
      ? flatLessons[currentIndex + 1]
      : null;

  const videoContent = lessonRecord.contents.find(
    (c) => c.contentType === "VIDEO",
  );
  const textContent = lessonRecord.contents.find(
    (c) => c.contentType === "TEXT",
  );

  const progressData = course.courseProgress?.[0];
  const currentPercentage = progressData
    ? Math.round(Number(progressData.completionPercentage))
    : 0;

  const totalLessonsCount = flatLessons.length;
  const completedLessonsCount = flatLessons.filter(
    (l) =>
      l.progress &&
      l.progress.length > 0 &&
      l.progress[0].status === "COMPLETED",
  ).length;

  // Check if this specific lesson is already done
  const isCurrentLessonDone =
    lessonRecord.progress &&
    lessonRecord.progress.length > 0 &&
    lessonRecord.progress[0].status === "COMPLETED";

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 relative overflow-hidden">
      <Navbar />

      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-purple-200/20 to-blue-200/20 rounded-full blur-3xl -z-0" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-blue-200/20 to-purple-200/20 rounded-full blur-3xl -z-0" />

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl shadow-lg">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-purple-600 uppercase tracking-wider">
                {course.title}
              </p>
              <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
                {lessonRecord.title}
              </h1>
            </div>
          </div>

          <div className="bg-white/60 backdrop-blur-md border border-white/40 p-4 rounded-2xl shadow-sm min-w-[200px]">
            <div className="flex justify-between text-sm mb-2">
              <span className="font-semibold text-gray-600">
                Course Progress
              </span>
              <span className="font-bold text-purple-600">
                {currentPercentage}%
              </span>
            </div>
            <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-700 ease-out"
                style={{ width: `${currentPercentage}%` }}
              />
            </div>
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold bg-white text-purple-700 shadow-sm border border-purple-100 whitespace-nowrap">
            <PlayCircle size={18} /> Content
          </button>
          <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-gray-500 hover:bg-white/50 hover:text-purple-600 transition-all whitespace-nowrap">
            <Layout size={18} /> Overview
          </button>
          <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-gray-500 hover:bg-white/50 hover:text-purple-600 transition-all whitespace-nowrap">
            <HelpCircle size={18} /> Quiz
          </button>
          <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-gray-500 hover:bg-white/50 hover:text-purple-600 transition-all whitespace-nowrap">
            <FileText size={18} /> Assignments
          </button>
        </div>

        <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 md:p-10 border border-white/40 shadow-xl space-y-10">
          {videoContent && (
            <div className="rounded-2xl overflow-hidden shadow-2xl bg-black aspect-video ring-4 ring-white">
              <video
                key={videoContent.contentBody}
                controls
                className="w-full h-full object-cover"
              >
                <source src={videoContent.contentBody} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
          )}

          {textContent && (
            <div
              className="prose prose-lg prose-purple max-w-none text-gray-800 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: textContent.contentBody }}
            />
          )}

          <div className="flex flex-col items-center gap-6 pt-10 border-t border-gray-100">
            <MarkDoneButton
              lessonId={lessonIdNum}
              userId={currentUserId}
              initialDone={isCurrentLessonDone ?? false}
              initialPercentage={currentPercentage}
              totalCount={totalLessonsCount}
              initialCompleted={completedLessonsCount}
            />

            <div className="flex justify-between w-full items-center pt-6">
              {prevLesson ? (
                <Link
                  href={`/courses/${course.id}/lessons/${prevLesson.id}`}
                  className="group flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-600 font-semibold hover:border-purple-300 hover:text-purple-600 transition-all active:scale-95 shadow-sm"
                >
                  <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                  Previous
                </Link>
              ) : (
                <div />
              )}

              {nextLesson ? (
                <Link
                  href={`/courses/${course.id}/lessons/${nextLesson.id}`}
                  className="group flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold shadow-md hover:shadow-lg transition-all active:scale-95"
                >
                  Next Lesson
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              ) : (
                <div className="flex items-center gap-2 text-sm font-bold text-green-600 bg-green-50 px-4 py-2 rounded-lg border border-green-100 shadow-sm">
                  <span>Course Completed! 🎉</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
