/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, BookOpen, FileText, HelpCircle, Save, ChevronRight, Edit, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BasicDetailsTab } from "@/components/instructor/course-wizard/BasicDetailsTab";
import { LessonsTab } from "@/components/instructor/course-wizard/LessonsTab";
import { QuizzesTab } from "@/components/instructor/course-wizard/QuizzesTab";

interface CourseData {
  title: string;
  description: string;
  price: number;
  thumbnailUrl?: string;
  introVideoUrl?: string;
  isPublished: boolean;
}

interface LessonData {
  id: string;
  title: string;
  content: string;
  order: number;
  contentId?: number;
}

interface QuizData {
  id: string;
  title: string;
  lessonId?: string;
  questions: QuestionData[];
  order: number;
}

interface QuestionData {
  id: string;
  question: string;
  options: OptionData[];
  correctOptionId: string;
  order: number;
}

interface OptionData {
  id: string;
  text: string;
  order: number;
}

interface CourseWizardProps {
  courseId?: string;
}

export function CourseWizard({ courseId }: CourseWizardProps) {
  const router = useRouter();
  const isEdit = !!courseId;

  const [activeTab, setActiveTab] = useState("basic");
  const [courseData, setCourseData] = useState<CourseData>({
    title: "",
    description: "",
    price: 0,
    isPublished: false,
  });
  const [lessons, setLessons] = useState<LessonData[]>([]);
  const [quizzes, setQuizzes] = useState<QuizData[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // fetch existing course data when editing
  useEffect(() => {
    if (isEdit && courseId) {
      (async () => {
        try {
          const res = await fetch(`/api/courses/${courseId}`);
          if (res.ok) {
            const existing = await res.json();
            setCourseData({
              title: existing.title,
              description: existing.description,
              price: existing.price || 0,
              thumbnailUrl: existing.thumbnailUrl || "",
              introVideoUrl: existing.introVideoUrl || "",
              isPublished: existing.isPublished,
            });

            // build lessons state from sections
            const lessonList: LessonData[] = [];

            existing.sections?.forEach((s: any) => {
              s.lessons?.forEach((l: any, idx: number) => {
                lessonList.push({
                  id: `lesson-${l.id}`,
                  title: l.title,
                  content: l.contents?.[0]?.contentBody || "",
                  order: idx + 1,
                  contentId: l.contents?.[0]?.id,
                });
              });
            });
            setLessons(lessonList);

            // fetch quizzes
            const qres = await fetch(`/api/quizzes?courseId=${courseId}`);
            if (qres.ok) {
              const quizData = await qres.json();
              const quizList: QuizData[] = quizData.map((q: any, qi: number) => ({
                id: `quiz-${q.id}`,
                title: q.title,
                questions: q.questions.map((qq: any, qqi: number) => ({
                  id: `question-${qq.id}`,
                  question: qq.questionText,
                  options: qq.options.map((opt: any, oi: number) => ({
                    id: `option-${opt.id}`,
                    text: opt.optionText,
                    order: oi + 1,
                  })),
                  correctOptionId: qq.correctOptionId ? `option-${qq.correctOptionId}` : "",
                  order: qqi + 1,
                })),
                order: qi + 1,
              }));
              setQuizzes(quizList);
            }
          }
        } catch (e) {
          console.error("Failed to load existing course", e);
        }
      })();
    }
  }, [isEdit, courseId]);


  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      // Save course (create or update)
      const method = isEdit ? "PATCH" : "POST";
      const url = isEdit && courseId ? `/api/courses/${courseId}` : "/api/courses";
      const courseResponse = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(courseData),
      });

      if (!courseResponse.ok) {
        const errText = await courseResponse.text();
        throw new Error(errText || "Failed to save course");
      }

      const course = await courseResponse.json();

      // when editing we don't recreate lessons/quizzes; only create new ones for simplicity
      if (isEdit) {
        // optionally handle additional lesson/quiz creation here
      }

      // Create or update lessons
      for (const lesson of lessons) {
        // Only update existing lessons when in edit mode
        if (isEdit && lesson.id.startsWith('lesson-')) {
          const lessonIdMatch = parseInt(lesson.id.replace('lesson-', ''));
          if (!isNaN(lessonIdMatch) && lessonIdMatch > 0) {
            // existing lesson - update it
            const res = await fetch(`/api/lessons/${lessonIdMatch}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                title: lesson.title,
                content: lesson.content,
              }),
            });
            if (!res.ok) {
              const txt = await res.text();
              throw new Error(`Failed to update lesson: ${txt}`);
            }
            continue;
          }
        }
        
        // Create new lesson
        const res = await fetch("/api/lessons", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            courseId: course.id,
            title: lesson.title,
            content: lesson.content,
            order: lesson.order,
          }),
        });
        if (!res.ok) {
          const txt = await res.text();
          throw new Error(`Failed to create lesson: ${txt}`);
        }
      }

      // Create only new quizzes (skip existing ones when editing)
      for (const quiz of quizzes) {
        // Skip existing quizzes when in edit mode
        if (isEdit && quiz.id.startsWith('quiz-')) {
          const quizIdMatch = parseInt(quiz.id.replace('quiz-', ''));
          if (!isNaN(quizIdMatch) && quizIdMatch > 0) {
            // This is an existing quiz, skip it
            continue;
          }
        }

        const quizResponse = await fetch("/api/quizzes/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            courseId: course.id,
            title: quiz.title,
            order: quiz.order,
          }),
        });

        if (!quizResponse.ok) {
          await quizResponse.text();
          continue;
        }

        const createdQuiz = await quizResponse.json();

        // Create questions for this quiz
        for (const question of quiz.questions) {
          const questionResponse = await fetch("/api/quizzes/questions", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              quizId: createdQuiz.id,
              question: question.question,
              options: question.options,
              correctOptionId: question.correctOptionId,
              order: question.order,
            }),
          });
          if (!questionResponse.ok) {
            await questionResponse.text();
          }
        }
      }

      router.push("/instructor/courses");
    } catch (error) {
      console.error("Error creating course:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const canProceedToLessons = !!(courseData.title.trim() && courseData.description.trim());
  const canProceedToQuizzes = lessons.length > 0;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/instructor/courses")}
            className="flex items-center gap-2"
          >
            <ArrowLeft size={16} />
            Back to Courses
          </Button>
          <div className="flex items-center gap-2">
            {isEdit ? <Edit size={24} /> : <PlusCircle size={24} />}
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                {isEdit ? "Edit Course" : "Create New Course"}
              </h1>
              <p className="text-slate-600">
                {isEdit ? "Modify your course details" : "Build your course step by step"}
              </p>
            </div>
          </div>
        </div>
        <Button
          onClick={handleSave}
          disabled={isSubmitting || !canProceedToLessons}
          className="flex items-center gap-2"
        >
          <Save size={16} />
          {isSubmitting
            ? isEdit
              ? "Saving..."
              : "Creating..."
            : isEdit
            ? "Save Changes"
            : "Create Course"}
        </Button>
      </div>

      {/* Progress Indicator */}
      <div className="flex items-center justify-center">
        <div className="flex items-center space-x-4">
          <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
            activeTab === "basic" ? "bg-purple-600 text-white" :
            canProceedToLessons ? "bg-green-500 text-white" : "bg-gray-200 text-gray-500"
          }`}>
            <BookOpen size={20} />
          </div>
          <ChevronRight size={16} className="text-gray-400" />
          <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
            activeTab === "lessons" ? "bg-purple-600 text-white" :
            canProceedToLessons ? "bg-purple-600 text-white" :
            "bg-gray-200 text-gray-500"
          }`}>
            <FileText size={20} />
          </div>
          <ChevronRight size={16} className="text-gray-400" />
          <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
            activeTab === "quizzes" ? "bg-purple-600 text-white" :
            canProceedToQuizzes ? "bg-purple-600 text-white" :
            "bg-gray-200 text-gray-500"
          }`}>
            <HelpCircle size={20} />
          </div>
        </div>
      </div>

      {/* Wizard Tabs */}
      <Card>
        <CardContent className="p-0">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic" className="flex items-center gap-2">
                <BookOpen size={16} />
                Basic Details
              </TabsTrigger>
              <TabsTrigger
                value="lessons"
                disabled={!canProceedToLessons}
                className="flex items-center gap-2"
              >
                <FileText size={16} />
                Lessons
              </TabsTrigger>
              <TabsTrigger
                value="quizzes"
                disabled={!canProceedToQuizzes}
                className="flex items-center gap-2"
              >
                <HelpCircle size={16} />
                Quizzes
              </TabsTrigger>
            </TabsList>

            <div className="p-6">
              <TabsContent value="basic">
                <BasicDetailsTab
                  data={courseData}
                  onChange={setCourseData}
                  onNext={() => setActiveTab("lessons")}
                  canProceed={canProceedToLessons}
                />
              </TabsContent>

              <TabsContent value="lessons">
                <LessonsTab
                  lessons={lessons}
                  onChange={setLessons}
                  onNext={() => setActiveTab("quizzes")}
                  onBack={() => setActiveTab("basic")}
                  canProceed={canProceedToQuizzes}
                />
              </TabsContent>

              <TabsContent value="quizzes">
                <QuizzesTab
                  quizzes={quizzes}
                  lessons={lessons}
                  onChange={setQuizzes}
                  onBack={() => setActiveTab("lessons")}
                />
              </TabsContent>
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
