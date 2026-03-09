import { Prisma, Quiz, QuizQuestion, QuizOption } from "@prisma/client";

// payload when fetching a quiz with its questions and options
export type FullQuiz = Prisma.QuizGetPayload<{
  include: {
    questions: {
      include: { options: true };
      orderBy: { id: "asc" };
    };
  };
}>;

// simplified quiz list item
export type QuizListItem = Pick<Quiz, "id" | "lessonId" | "title" | "createdAt" | "updatedAt">;

// DTOs for creating quizzes and questions
export type CreateQuizInput = {
  lessonId: number;
  title: string;
};

export type CreateQuestionInput = {
  quizId: number;
  questionText: string;
};

export type CreateOptionInput = {
  questionId: number;
  optionText: string;
  isCorrect: boolean;
};



export type QuizQuestionWithOptions = QuizQuestion & { options: QuizOption[] };
