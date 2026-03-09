import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session?.userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const courseId = Number(req.nextUrl.searchParams.get("courseId"));
  const lessonIdParam = req.nextUrl.searchParams.get("lessonId");
  const lessonId = lessonIdParam ? Number(lessonIdParam) : null;

  if (!Number.isInteger(courseId)) {
    return NextResponse.json({ error: "courseId is required" }, { status: 400 });
  }

  const quizzes = await prisma.quiz.findMany({
    where: {
      lesson: {
        section: { courseId },
      },
      ...(lessonId ? { lessonId } : {}),
    },
    orderBy: [{ lessonId: "asc" }, { id: "asc" }],
    include: {
      lesson: { select: { id: true, title: true } },
      questions: {
        orderBy: { id: "asc" },
        include: {
          options: {
            orderBy: { id: "asc" },
            select: { id: true, optionText: true },
          },
        },
      },
    },
  });

  return NextResponse.json(
    quizzes.map((quiz) => ({
      id: quiz.id,
      title: quiz.title,
      lessonId: quiz.lesson.id,
      lessonTitle: quiz.lesson.title,
      questions: quiz.questions.map((q) => ({
        id: q.id,
        questionText: q.questionText,
        options: q.options,
      })),
    })),
  );
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session?.userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await req.json();
  const quizId = Number(body?.quizId);
  const answers = Array.isArray(body?.answers) ? body.answers : [];

  if (!Number.isInteger(quizId)) {
    return NextResponse.json({ error: "quizId is required" }, { status: 400 });
  }

  const questions = await prisma.quizQuestion.findMany({
    where: { quizId },
    select: {
      id: true,
      questionText: true,
      options: {
        select: { id: true, optionText: true, isCorrect: true },
      },
    },
  });

  if (questions.length === 0) {
    return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
  }

  const answerMap = new Map<number, number>();
  for (const item of answers) {
    const qid = Number(item?.questionId);
    const oid = Number(item?.optionId);
    if (Number.isInteger(qid) && Number.isInteger(oid)) {
      answerMap.set(qid, oid);
    }
  }

  let correct = 0;
  const review = [] as Array<{
    questionId: number;
    questionText: string;
    selectedOptionId: number | null;
    selectedOptionText: string | null;
    correctOptionId: number;
    correctOptionText: string;
    isCorrect: boolean;
  }>;

  for (const q of questions) {
    const selectedOptionId = answerMap.get(q.id) ?? null;
    const correctOption = q.options.find((o) => o.isCorrect);

    if (!correctOption) {
      continue;
    }

    const selectedOption = selectedOptionId
      ? q.options.find((o) => o.id === selectedOptionId)
      : null;
    const isCorrect = selectedOptionId === correctOption.id;

    if (isCorrect) {
      correct += 1;
    }

    review.push({
      questionId: q.id,
      questionText: q.questionText,
      selectedOptionId,
      selectedOptionText: selectedOption?.optionText ?? null,
      correctOptionId: correctOption.id,
      correctOptionText: correctOption.optionText,
      isCorrect,
    });
  }

  const total = questions.length;
  const scorePercent = Math.round((correct / total) * 100);

  return NextResponse.json({
    quizId,
    total,
    correct,
    scorePercent,
    review,
  });
}
