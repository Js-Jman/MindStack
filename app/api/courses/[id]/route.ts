import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { updateCourse, deleteCourse } from "@/services/course.service";

// helper to extract numeric id from request URL
function getIdFromUrl(url: string): number | null {
  try {
    const parsed = new URL(url);
    const parts = parsed.pathname.split("/");
    const id = parts[parts.length - 1];
    const num = Number(id);
    return isNaN(num) ? null : num;
  } catch {
    return null;
  }
}

// GET /api/courses/:id - return course details (for editing)
export async function GET(request: Request) {
  const courseId = getIdFromUrl(request.url);
  if (courseId === null) {
    return NextResponse.json({ error: "Invalid course ID" }, { status: 400 });
  }

  // optional authorization: only instructor or admin
  const allowed = await authorizeInstructor(courseId);
  if (!allowed) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  try {
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        sections: {
          where: { deletedAt: null },
          include: { lessons: { include: { contents: true } } },
        },
      },
    });
    if (!course) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(course);
  } catch (err: unknown) {
    console.error("GET /api/courses/[id]:", err);
    return NextResponse.json({ error: "Failed to fetch course" }, { status: 500 });
  }
}

// ensure the current user is the instructor of the course or admin
async function authorizeInstructor(courseId: number) {
  const session = await getSession();
  if (!session?.userId) return false;

  const user = await prisma.user.findUnique({
    where: { id: Number(session.userId) },
    select: { id: true, role: true },
  });
  if (!user) return false;

  if (user.role === "ADMIN") return true;

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: { instructorId: true },
  });
  if (!course) return false;

  return course.instructorId === user.id;
}

export async function PATCH(request: Request) {
  const courseId = getIdFromUrl(request.url);
  if (courseId === null) {
    return NextResponse.json({ error: "Invalid course ID" }, { status: 400 });
  }

  const allowed = await authorizeInstructor(courseId);
  if (!allowed) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const updated = await updateCourse(courseId, body);
    return NextResponse.json(updated);
  } catch (err: unknown) {
    console.error("PATCH /api/courses/[id]:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to update course" },
      { status: 400 }
    );
  }
}

export async function DELETE(request: Request) {
  const courseId = getIdFromUrl(request.url);
  if (courseId === null) {
    return NextResponse.json({ error: "Invalid course ID" }, { status: 400 });
  }

  const allowed = await authorizeInstructor(courseId);
  if (!allowed) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  try {
    const res = await deleteCourse(courseId);
    return NextResponse.json(res);
  } catch (err: unknown) {
    console.error("DELETE /api/courses/[id]:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to delete course" },
      { status: 400 }
    );
  }
}