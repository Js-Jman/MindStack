import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { Role } from "@prisma/client";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Verify user is an instructor
    const user = await prisma.user.findUnique({
      where: { id: Number(session.userId) },
      select: { role: true, deletedAt: true },
    });

    if (!user || user.deletedAt || user.role !== Role.INSTRUCTOR) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    const { id } = await params;
    const lessonId = Number(id);
    if (isNaN(lessonId)) {
      return NextResponse.json({ error: "Invalid lesson ID" }, { status: 400 });
    }

    const body = await request.json();
    const { title, content } = body;

    if (!title || content === undefined) {
      return NextResponse.json(
        { error: "Title and content are required" },
        { status: 400 }
      );
    }

    // Verify the lesson belongs to this instructor
    const lesson = await prisma.lesson.findFirst({
      where: {
        id: lessonId,
        deletedAt: null,
      },
      include: {
        section: {
          include: {
            course: true,
          },
        },
      },
    });

    if (!lesson || lesson.section.course.instructorId !== Number(session.userId)) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    // Update lesson
    await prisma.lesson.update({
      where: { id: lessonId },
      data: { title },
    });

    // Update or create content
    const existingContent = await prisma.lessonContent.findFirst({
      where: { lessonId },
    });

    if (existingContent) {
      await prisma.lessonContent.update({
        where: { id: existingContent.id },
        data: { contentBody: content },
      });
    } else {
      await prisma.lessonContent.create({
        data: {
          lessonId,
          contentBody: content,
          contentType: "TEXT",
          contentOrder: 1,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error("PUT /api/lessons/[id]:", err);
    return NextResponse.json({ error: "Failed to update lesson" }, { status: 500 });
  }
}