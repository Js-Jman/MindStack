/**
 * @file POST /api/quizzes/create - Create a new quiz
 *
 * This route handler creates a new quiz for a course.
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

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

    if (!user || user.deletedAt || user.role !== "INSTRUCTOR") {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    const body = await request.json();
    const { courseId, title, lessonId } = body;

    if (!courseId || !title) {
      return NextResponse.json(
        { error: "Course ID and title are required" },
        { status: 400 }
      );
    }

    // parse lessonId into number if valid; ignore invalid values (e.g. "none")
    let lessonIdNum: number | undefined;
    if (lessonId !== undefined && lessonId !== null && lessonId !== "") {
      const num = Number(lessonId);
      if (!isNaN(num)) {
        lessonIdNum = num;
      }
    }

    // If lessonId is provided, verify it belongs to this instructor's course
    let targetLessonId: number | undefined;

    if (lessonIdNum) {
      const lesson = await prisma.lesson.findFirst({
        where: {
          id: lessonIdNum,
          section: {
            course: {
              id: Number(courseId),
              instructorId: Number(session.userId),
              deletedAt: null,
            },
          },
          deletedAt: null,
        },
      });

      if (!lesson) {
        return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
      }

      targetLessonId = lesson.id;
    } else {
      // Get the first lesson of the course (don't create a new one)
      const course = await prisma.course.findFirst({
        where: {
          id: Number(courseId),
          instructorId: Number(session.userId),
          deletedAt: null,
        },
        include: {
          sections: {
            where: { deletedAt: null },
            include: {
              lessons: {
                where: { deletedAt: null },
                orderBy: { lessonOrder: 'asc' },
                take: 1,
              },
            },
          },
        },
      });

      if (!course || !course.sections.length || !course.sections[0].lessons.length) {
        return NextResponse.json(
          { error: "No lessons found. Please create at least one lesson before adding a quiz." },
          { status: 400 }
        );
      }

      targetLessonId = course.sections[0].lessons[0].id;
    }

    // Create the quiz
    const quiz = await prisma.quiz.create({
      data: {
        lessonId: targetLessonId,
        title,
      },
      include: {
        lesson: {
          include: {
            section: {
              include: {
                course: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(quiz, { status: 201 });
  } catch (error: unknown) {
    console.error("Error creating quiz:", error);
    const message = error instanceof Error ? error.message : "Failed to create quiz";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}