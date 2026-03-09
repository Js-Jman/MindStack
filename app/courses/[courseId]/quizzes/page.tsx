"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";

type QuizOption = {
  id: number;
  optionText: string;
};

type QuizQuestion = {
  id: number;
  questionText: string;
  options: QuizOption[];
};

type QuizPayload = {
  id: number;
  title: string;
  lessonId: number;
  lessonTitle: string;
  questions: QuizQuestion[];
};

const QUIZ_DURATION_SECONDS = 120;

type QuizReviewItem = {
  questionId: number;
  questionText: string;
  selectedOptionId: number | null;
  selectedOptionText: string | null;
  correctOptionId: number;
  correctOptionText: string;
  isCorrect: boolean;
};

export default function Page() {
  const params = useParams<{ courseId: string }>();
  const search = useSearchParams();
  const lessonId = search.get("lessonId");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quizzes, setQuizzes] = useState<QuizPayload[]>([]);
  const [quizIndex, setQuizIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [secondsLeft, setSecondsLeft] = useState(QUIZ_DURATION_SECONDS);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{
    total: number;
    correct: number;
    scorePercent: number;
    review: QuizReviewItem[];
  } | null>(null);

  const activeQuiz = quizzes[quizIndex] ?? null;

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const courseId = Number(params.courseId);
        const url = new URL("/api/quizzes", window.location.origin);
        url.searchParams.set("courseId", String(courseId));
        if (lessonId) {
          url.searchParams.set("lessonId", lessonId);
        }

        const res = await fetch(url.toString(), { credentials: "include" });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || "Failed to load quizzes");
        }

        const data = (await res.json()) as QuizPayload[];
        setQuizzes(data);
        setQuizIndex(0);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load quizzes");
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, [params.courseId, lessonId]);

  useEffect(() => {
    if (!activeQuiz || result || loading) return;

    setSecondsLeft(QUIZ_DURATION_SECONDS);
    setAnswers({});

    const timer = window.setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          window.clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [activeQuiz?.id, loading, result]);

  const mmss = useMemo(() => {
    const mm = Math.floor(secondsLeft / 60)
      .toString()
      .padStart(2, "0");
    const ss = (secondsLeft % 60).toString().padStart(2, "0");
    return `${mm}:${ss}`;
  }, [secondsLeft]);

  async function submitQuiz() {
    if (!activeQuiz || submitting || result) return;

    setSubmitting(true);
    setError(null);
    try {
      const payload = {
        quizId: activeQuiz.id,
        answers: Object.entries(answers).map(([questionId, optionId]) => ({
          questionId: Number(questionId),
          optionId,
        })),
      };

      const res = await fetch("/api/quizzes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to submit quiz");
      }

      const data = await res.json();
      setResult({
        total: data.total,
        correct: data.correct,
        scorePercent: data.scorePercent,
        review: Array.isArray(data.review) ? data.review : [],
      });

      // Completing a quiz should advance course progress by marking this lesson complete.
      void fetch("/api/progress/mark-done", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ lessonId: activeQuiz.lessonId, done: true }),
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to submit quiz");
    } finally {
      setSubmitting(false);
    }
  }

  useEffect(() => {
    if (secondsLeft === 0 && activeQuiz && !result) {
      void submitQuiz();
    }
  }, [secondsLeft, activeQuiz, result]);

  function selectOption(questionId: number, optionId: number) {
    if (result) return;
    setAnswers((prev) => ({ ...prev, [questionId]: optionId }));
  }

  function goNextQuiz() {
    setResult(null);
    setAnswers({});
    setQuizIndex((prev) => prev + 1);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-6 flex items-center justify-end gap-4">
          <div className="px-4 py-2 rounded-xl bg-white border border-purple-100 text-purple-700 font-bold">
            Timer: {mmss}
          </div>
        </div>

        {loading ? (
          <div className="bg-white rounded-2xl p-8 shadow">Loading quiz...</div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl p-4">{error}</div>
        ) : !activeQuiz ? (
          <div className="bg-white rounded-2xl p-8 shadow">No quizzes available for this course yet.</div>
        ) : (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow border border-purple-100">
              <h1 className="text-2xl font-bold text-gray-900">{activeQuiz.title}</h1>
              <p className="text-sm text-gray-600 mt-1">Lesson: {activeQuiz.lessonTitle}</p>
            </div>

            {activeQuiz.questions.map((q, index) => (
              <div key={q.id} className="bg-white rounded-2xl p-6 shadow border border-gray-100">
                <p className="font-semibold text-gray-900 mb-4">
                  {index + 1}. {q.questionText}
                </p>
                <div className="space-y-3">
                  {q.options.map((opt) => {
                    const selected = answers[q.id] === opt.id;
                    return (
                      <button
                        key={opt.id}
                        onClick={() => selectOption(q.id, opt.id)}
                        className={`w-full text-left px-4 py-3 rounded-xl border transition-colors ${
                          selected
                            ? "border-purple-400 bg-purple-50 text-purple-900"
                            : "border-gray-200 hover:border-purple-300"
                        }`}
                      >
                        {opt.optionText}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            {result ? (
              <div className="bg-white rounded-2xl p-6 shadow border border-green-200">
                <h2 className="text-xl font-bold text-gray-900">Quiz Result</h2>
                <p className="mt-2 text-gray-700">
                  Score: <span className="font-bold">{result.scorePercent}%</span> ({result.correct}/{result.total})
                </p>

                <div className="mt-5 space-y-3">
                  <h3 className="text-lg font-semibold text-gray-900">Answer Review</h3>
                  {result.review.map((item, idx) => (
                    <div
                      key={item.questionId}
                      className={`rounded-xl border p-4 ${
                        item.isCorrect
                          ? "border-green-200 bg-green-50"
                          : "border-red-200 bg-red-50"
                      }`}
                    >
                      <p className="font-semibold text-gray-900 mb-2">
                        {idx + 1}. {item.questionText}
                      </p>
                      <p className="text-sm text-gray-700">
                        Your answer: {item.selectedOptionText ?? "Not answered"}
                      </p>
                      <p className="text-sm text-gray-700">
                        Correct answer: {item.correctOptionText}
                      </p>
                    </div>
                  ))}
                </div>

                {quizIndex < quizzes.length - 1 ? (
                  <div className="mt-5 flex flex-wrap gap-3">
                    <button
                      onClick={goNextQuiz}
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold"
                    >
                      Next Quiz
                    </button>
                    <Link
                      href={`/courses/${params.courseId}`}
                      className="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50"
                    >
                      Back to Course
                    </Link>
                  </div>
                ) : (
                  <div className="mt-5 space-y-3">
                    <div className="text-green-700 font-semibold">All quizzes completed for this course.</div>
                    <Link
                      href={`/courses/${params.courseId}`}
                      className="inline-flex px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold"
                    >
                      Back to Course
                    </Link>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => void submitQuiz()}
                disabled={submitting}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold disabled:opacity-60"
              >
                {submitting ? "Submitting..." : "Submit Quiz"}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
