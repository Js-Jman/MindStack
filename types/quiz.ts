export type QuizOption = {
  id: number;
  optionText: string;
  isCorrect: boolean;
};

export type QuizQuestion = {
  id: number;
  quizId: number;
  questionText: string;
  createdAt?: Date;
  updatedAt?: Date;
};

export type Quiz = {
  id: number;
  lessonId: number;
  title: string;
  createdAt?: Date;
  updatedAt?: Date;
};

// payload when fetching a quiz with its questions and options
export type FullQuiz = Quiz & {
  questions: Array<QuizQuestion & { options: QuizOption[] }>;
};

// simplified quiz list item
export type QuizListItem = Pick<
  Quiz,
  "id" | "lessonId" | "title" | "createdAt" | "updatedAt"
>;

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
