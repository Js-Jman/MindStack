/**
 * @file POST /api/quizzes/questions - Create a quiz question with options
 *
 * This route handler creates a new quiz question with multiple choice options.
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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { quizId, question, options, correctOptionId, order } = body;

    if (!quizId || !question || !options || !correctOptionId) {
      return NextResponse.json(
        { error: "Quiz ID, question, options, and correct option ID are required" },
        { status: 400 }
      );
    }

    // Verify the quiz belongs to this instructor
    const quiz = await prisma.quiz.findFirst({
      where: {
        id: Number(quizId),
        lesson: {
          section: {
            course: {
              instructorId: Number(session.userId),
              deletedAt: null,
            },
          },
        },
        deletedAt: null,
      },
    });

    if (!quiz) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    // Create the question
    const questionRecord = await prisma.quizQuestion.create({
      data: {
        quizId: Number(quizId),
        questionText: question,
      },
    });

    // Create the options
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const optionsData = options.map((option: any) => ({
      questionId: questionRecord.id,
      optionText: option.text,
      isCorrect: option.id === correctOptionId,
    }));

    await prisma.quizOption.createMany({
      data: optionsData,
    });

    // Return the created question with options
    const createdQuestion = await prisma.quizQuestion.findUnique({
      where: { id: questionRecord.id },
      include: {
        options: {
          orderBy: { id: 'asc' },
        },
      },
    });

    return NextResponse.json(createdQuestion, { status: 201 });
  } catch (error: unknown) {
    console.error("Error creating quiz question:", error);
    const message = error instanceof Error ? error.message : "Failed to create quiz question";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}