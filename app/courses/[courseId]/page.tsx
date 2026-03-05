import { getCourseById } from "@/services/course.service";
import { notFound } from "next/navigation";

export default async function CoursePage({
  params,
}: {
  params: { courseId: string };
}) {
  const courseId = parseInt(params.courseId, 10);
  if (isNaN(courseId)) notFound();

  const course = await getCourseById(courseId);
  if (!course) notFound();

  return (
    <div>
      <h1 className="text-2xl font-bold">{course.title}</h1>
      <p className="mt-2 text-gray-600">{course.description}</p>

      <div className="mt-6">
        <p>Total Lessons: {course.lessonCount}</p>
      </div>

      <div className="mt-8">
        <video controls className="w-full rounded" src={course.introVideoUrl} />
      </div>
    </div>
  );
}
