/**
 * @file POST /api/lessons - Create a new lesson
 *
 * This route handler creates a new lesson for a course.
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { Role } from "@prisma/client";

export async function POST(request: Request) {
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

    const body = await request.json();
    const { courseId, title, content, order } = body;

    if (!courseId || !title || !content) {
      return NextResponse.json(
        { error: "Course ID, title, and content are required" },
        { status: 400 }
      );
    }

    // Verify the course belongs to this instructor
    const course = await prisma.course.findFirst({
      where: {
        id: Number(courseId),
        instructorId: Number(session.userId),
        deletedAt: null,
      },
      include: {
        sections: {
          where: { deletedAt: null },
          orderBy: { sectionOrder: 'asc' },
        },
      },
    });

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // Get or create a default section for this course
    let sectionId: number;
    if (course.sections.length > 0) {
      sectionId = course.sections[0].id;
    } else {
      // Create a default section
      const section = await prisma.courseSection.create({
        data: {
          courseId: Number(courseId),
          title: "Course Content",
          sectionOrder: 1,
        },
      });
      sectionId = section.id;
    }

    // Create the lesson
    const lesson = await prisma.lesson.create({
      data: {
        sectionId,
        title,
        lessonOrder: order || 1,
        contents: {
          create: {
            contentType: "TEXT",
            contentBody: content,
            contentOrder: 1,
          },
        },
      },
      include: {
        contents: true,
        section: true,
      },
    });

    return NextResponse.json(lesson, { status: 201 });
  } catch (error: unknown) {
    console.error("Error creating lesson:", error);
    const message = error instanceof Error ? error.message : "Failed to create lesson";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}