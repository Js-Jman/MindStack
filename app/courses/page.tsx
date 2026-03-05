import { prisma } from "@/lib/db";
import Link from "next/link";

export default async function CoursesPage() {
  const courses = await prisma.course.findMany({
    where: { isPublished: true }, 
  });

  return (
    <div className="grid gap-4 p-6">
      {courses.map((course) => (
        <Link
          key={course.id}
          href={`/courses/${course.id}`}
          className="block border p-4 rounded hover:shadow transition"
        >
          <h2 className="text-lg font-semibold">{course.title}</h2>
          <p className="text-sm text-gray-500">{course.description}</p>
        </Link>
      ))}
    </div>
  );
}
