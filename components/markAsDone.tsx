"use client";

import { useState } from "react";
import { CheckCircle2, Loader2, CircleDot } from "lucide-react";

type Props = {
  lessonId: number;
  initialDone: boolean;
  initialCompleted: number;
  totalCount: number;
  initialPercentage: number;
  userId?: number; 
};

export default function MarkDoneButton({
  lessonId,
  initialDone,
  initialCompleted,
  totalCount,
  initialPercentage,
  userId,
}: Props) {
  const [done, setDone] = useState(initialDone);
  const [completed, setCompleted] = useState(initialCompleted);
  const [percentage, setPercentage] = useState(initialPercentage);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const baseButtonClasses =
    "inline-flex items-center justify-center gap-2.5 px-8 py-3.5 font-semibold rounded-xl transition-all duration-300 ease-in-out active:scale-95 shadow-md";
  const loadingClasses = "disabled:opacity-70 disabled:cursor-not-allowed";

  function clamp(n: number, min: number, max: number) {
    return Math.max(min, Math.min(max, n));
  }

  async function toggleDone() {
    setErr(null);
    const newDone = !done;

    const prev = { done, completed, percentage };
    const optimisticCompleted = clamp(
      newDone ? completed + 1 : completed - 1,
      0,
      totalCount,
    );
    const optimisticPercentage = Number(
      ((optimisticCompleted / totalCount) * 100).toFixed(2),
    );

    setDone(newDone);
    setCompleted(optimisticCompleted);
    setPercentage(optimisticPercentage);
    setLoading(true);

    try {
      const res = await fetch("/api/progress/mark-done", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
       
        body: JSON.stringify({ userId, lessonId, done: newDone }),
      });

      if (!res.ok) throw new Error("Failed to update progress");

      const data = await res.json();
      
      setDone(data.done);
      setCompleted(data.completedCount);
      setPercentage(data.completionPercentage);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      
      setDone(prev.done);
      setCompleted(prev.completed);
      setPercentage(prev.percentage);
      setErr(error?.message ?? "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full flex flex-col items-center gap-4">
    
      <button
        onClick={toggleDone}
        disabled={loading}
        aria-pressed={done}
        className={`
          ${baseButtonClasses}
          ${loading ? loadingClasses : ""}
          ${
            done
              ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-purple-200 hover:shadow-lg hover:shadow-purple-300"
              : "bg-white border-2 border-gray-200 text-gray-700 hover:border-purple-300 hover:text-purple-700 hover:bg-purple-50"
          }
          ${loading ? "bg-gray-100 text-gray-400 border-gray-100 pointer-events-none" : ""}
        `}
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Updating…</span>
          </>
        ) : done ? (
          <>
            <CheckCircle2 className="w-5 h-5" />
            <span>Lesson Completed (Undo)</span>
          </>
        ) : (
          <>
            <CircleDot className="w-5 h-5" />
            <span>Mark as Complete</span>
          </>
        )}
      </button>

    
      <div className="text-center">
        <p className="text-sm font-medium text-gray-500">
          Lesson progress:{" "}
          <span className="font-bold text-gray-800">{percentage}%</span>{" "}
          complete
        </p>
        <p className="text-xs text-gray-400 mt-1">
          ({completed}/{totalCount} lessons in this course)
        </p>
      </div>


      {err && (
        <div className="mt-2 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm font-medium animate-pulse">
          ⚠️ {err} (Your progress was rolled back)
        </div>
      )}
    </div>
  );
}
