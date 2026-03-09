"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, Plus, Trash2, GripVertical, CheckCircle } from "lucide-react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

interface LessonData {
  id: string;
  title: string;
  content: string;
  order: number;
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

interface QuizzesTabProps {
  quizzes: QuizData[];
  lessons: LessonData[];
  onChange: (quizzes: QuizData[]) => void;
  onBack: () => void;
}

export function QuizzesTab({ quizzes, lessons, onChange, onBack }: QuizzesTabProps) {
  const [expandedQuiz, setExpandedQuiz] = useState<string | null>(null);
  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null);

  const addQuiz = () => {
    const newQuiz: QuizData = {
      id: `quiz-${Date.now()}`,
      title: "",
      questions: [],
      order: quizzes.length + 1,
    };
    onChange([...quizzes, newQuiz]);
    setExpandedQuiz(newQuiz.id);
  };

  const updateQuiz = (id: string, updates: Partial<QuizData>) => {
    const updatedQuizzes = quizzes.map(quiz =>
      quiz.id === id ? { ...quiz, ...updates } : quiz
    );
    onChange(updatedQuizzes);
  };

  const deleteQuiz = (id: string) => {
    const filteredQuizzes = quizzes.filter(quiz => quiz.id !== id);
    const reorderedQuizzes = filteredQuizzes.map((quiz, index) => ({
      ...quiz,
      order: index + 1,
    }));
    onChange(reorderedQuizzes);
    if (expandedQuiz === id) {
      setExpandedQuiz(null);
    }
  };

  const addQuestion = (quizId: string) => {
    const quiz = quizzes.find(q => q.id === quizId);
    if (!quiz) return;

    const newQuestion: QuestionData = {
      id: `question-${Date.now()}`,
      question: "",
      options: [
        { id: `option-${Date.now()}-1`, text: "", order: 1 },
        { id: `option-${Date.now()}-2`, text: "", order: 2 },
      ],
      correctOptionId: "",
      order: quiz.questions.length + 1,
    };

    updateQuiz(quizId, {
      questions: [...quiz.questions, newQuestion]
    });
    setExpandedQuestion(newQuestion.id);
  };

  const updateQuestion = (quizId: string, questionId: string, updates: Partial<QuestionData>) => {
    const updatedQuizzes = quizzes.map(quiz => {
      if (quiz.id === quizId) {
        const updatedQuestions = quiz.questions.map(question =>
          question.id === questionId ? { ...question, ...updates } : question
        );
        return { ...quiz, questions: updatedQuestions };
      }
      return quiz;
    });
    onChange(updatedQuizzes);
  };

  const deleteQuestion = (quizId: string, questionId: string) => {
    const updatedQuizzes = quizzes.map(quiz => {
      if (quiz.id === quizId) {
        const filteredQuestions = quiz.questions.filter(q => q.id !== questionId);
        const reorderedQuestions = filteredQuestions.map((question, index) => ({
          ...question,
          order: index + 1,
        }));
        return { ...quiz, questions: reorderedQuestions };
      }
      return quiz;
    });
    onChange(updatedQuizzes);
    if (expandedQuestion === questionId) {
      setExpandedQuestion(null);
    }
  };

  const addOption = (quizId: string, questionId: string) => {
    const quiz = quizzes.find(q => q.id === quizId);
    const question = quiz?.questions.find(q => q.id === questionId);
    if (!question) return;

    const newOption: OptionData = {
      id: `option-${Date.now()}`,
      text: "",
      order: question.options.length + 1,
    };

    updateQuestion(quizId, questionId, {
      options: [...question.options, newOption]
    });
  };

  const updateOption = (quizId: string, questionId: string, optionId: string, text: string) => {
    const updatedQuizzes = quizzes.map(quiz => {
      if (quiz.id === quizId) {
        const updatedQuestions = quiz.questions.map(question => {
          if (question.id === questionId) {
            const updatedOptions = question.options.map(option =>
              option.id === optionId ? { ...option, text } : option
            );
            return { ...question, options: updatedOptions };
          }
          return question;
        });
        return { ...quiz, questions: updatedQuestions };
      }
      return quiz;
    });
    onChange(updatedQuizzes);
  };

  const deleteOption = (quizId: string, questionId: string, optionId: string) => {
    const updatedQuizzes = quizzes.map(quiz => {
      if (quiz.id === quizId) {
        const updatedQuestions = quiz.questions.map(question => {
          if (question.id === questionId) {
            const filteredOptions = question.options.filter(o => o.id !== optionId);
            const reorderedOptions = filteredOptions.map((option, index) => ({
              ...option,
              order: index + 1,
            }));

            // Reset correct option if it was deleted
            let correctOptionId = question.correctOptionId;
            if (correctOptionId === optionId) {
              correctOptionId = reorderedOptions.length > 0 ? reorderedOptions[0].id : "";
            }

            return {
              ...question,
              options: reorderedOptions,
              correctOptionId
            };
          }
          return question;
        });
        return { ...quiz, questions: updatedQuestions };
      }
      return quiz;
    });
    onChange(updatedQuizzes);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleQuizDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(quizzes);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    const reorderedQuizzes = items.map((quiz, index) => ({
      ...quiz,
      order: index + 1,
    }));

    onChange(reorderedQuizzes);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleQuestionDragEnd = (quizId: string, result: any) => {
    if (!result.destination) return;

    const quiz = quizzes.find(q => q.id === quizId);
    if (!quiz) return;

    const items = Array.from(quiz.questions);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    const reorderedQuestions = items.map((question, index) => ({
      ...question,
      order: index + 1,
    }));

    updateQuiz(quizId, { questions: reorderedQuestions });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Course Quizzes</h2>
          <p className="text-slate-600">Create quizzes to test student knowledge.</p>
        </div>
        <Button onClick={addQuiz} className="flex items-center gap-2">
          <Plus size={16} />
          Add Quiz
        </Button>
      </div>

      {quizzes.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                <Plus size={24} className="text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900">No quizzes yet</h3>
                <p className="text-slate-600">Add quizzes to assess student learning</p>
              </div>
              <Button onClick={addQuiz} className="flex items-center gap-2">
                <Plus size={16} />
                Add First Quiz
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <DragDropContext onDragEnd={handleQuizDragEnd}>
          <Droppable droppableId="quizzes">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-6">
                {quizzes.map((quiz, quizIndex) => (
                  <Draggable key={quiz.id} draggableId={quiz.id} index={quizIndex}>
                    {(provided, snapshot) => (
                      <Card
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={`transition-shadow ${snapshot.isDragging ? 'shadow-lg' : ''}`}
                      >
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div {...provided.dragHandleProps} className="cursor-grab">
                                <GripVertical size={16} className="text-slate-400" />
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-slate-500">
                                  Quiz {quiz.order}
                                </span>
                                <CardTitle className="text-lg">
                                  {quiz.title || "Untitled Quiz"}
                                </CardTitle>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setExpandedQuiz(
                                  expandedQuiz === quiz.id ? null : quiz.id
                                )}
                              >
                                {expandedQuiz === quiz.id ? "Collapse" : "Edit"}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteQuiz(quiz.id)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 size={16} />
                              </Button>
                            </div>
                          </div>
                        </CardHeader>

                        {expandedQuiz === quiz.id && (
                          <CardContent className="space-y-6">
                            <div className="space-y-2">
                              <Label htmlFor={`quiz-title-${quiz.id}`}>Quiz Title</Label>
                              <Input
                                id={`quiz-title-${quiz.id}`}
                                placeholder="Enter quiz title"
                                value={quiz.title}
                                onChange={(e) => updateQuiz(quiz.id, { title: e.target.value })}
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor={`quiz-lesson-${quiz.id}`}>Associated Lesson (Optional)</Label>
                              <Select
                                value={quiz.lessonId || "none"}
                                onValueChange={(value) => updateQuiz(quiz.id, { lessonId: value === "none" ? undefined : value })}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a lesson" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="none">No associated lesson</SelectItem>
                                  {lessons.map((lesson) => (
                                    <SelectItem key={lesson.id} value={lesson.id}>
                                      Lesson {lesson.order}: {lesson.title}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="space-y-4">
                              <div className="flex items-center justify-between">
                                <h4 className="text-lg font-semibold">Questions</h4>
                                <Button
                                  onClick={() => addQuestion(quiz.id)}
                                  size="sm"
                                  className="flex items-center gap-2"
                                >
                                  <Plus size={14} />
                                  Add Question
                                </Button>
                              </div>

                              {quiz.questions.length === 0 ? (
                                <Card>
                                  <CardContent className="flex flex-col items-center justify-center py-8">
                                    <p className="text-slate-600">No questions yet</p>
                                    <Button
                                      onClick={() => addQuestion(quiz.id)}
                                      variant="outline"
                                      size="sm"
                                      className="mt-2"
                                    >
                                      Add First Question
                                    </Button>
                                  </CardContent>
                                </Card>
                              ) : (
                                <DragDropContext onDragEnd={(result) => handleQuestionDragEnd(quiz.id, result)}>
                                  <Droppable droppableId={`questions-${quiz.id}`}>
                                    {(provided) => (
                                      <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
                                        {quiz.questions.map((question, questionIndex) => (
                                          <Draggable key={question.id} draggableId={question.id} index={questionIndex}>
                                            {(provided, snapshot) => (
                                              <Card
                                                ref={provided.innerRef}
                                                {...provided.draggableProps}
                                                className={`transition-shadow ${snapshot.isDragging ? 'shadow-lg' : ''}`}
                                              >
                                                <CardHeader className="pb-3">
                                                  <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                      <div {...provided.dragHandleProps} className="cursor-grab">
                                                        <GripVertical size={14} className="text-slate-400" />
                                                      </div>
                                                      <span className="text-sm font-medium text-slate-500">
                                                        Q{question.order}
                                                      </span>
                                                      <span className="font-medium">
                                                        {question.question || "Untitled Question"}
                                                      </span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                      <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => setExpandedQuestion(
                                                          expandedQuestion === question.id ? null : question.id
                                                        )}
                                                      >
                                                        {expandedQuestion === question.id ? "Collapse" : "Edit"}
                                                      </Button>
                                                      <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => deleteQuestion(quiz.id, question.id)}
                                                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                      >
                                                        <Trash2 size={14} />
                                                      </Button>
                                                    </div>
                                                  </div>
                                                </CardHeader>

                                                {expandedQuestion === question.id && (
                                                  <CardContent className="space-y-4">
                                                    <div className="space-y-2">
                                                      <Label htmlFor={`question-${question.id}`}>Question</Label>
                                                      <Input
                                                        id={`question-${question.id}`}
                                                        placeholder="Enter question"
                                                        value={question.question}
                                                        onChange={(e) => updateQuestion(quiz.id, question.id, { question: e.target.value })}
                                                      />
                                                    </div>

                                                    <div className="space-y-3">
                                                      <div className="flex items-center justify-between">
                                                        <Label>Options</Label>
                                                        <Button
                                                          onClick={() => addOption(quiz.id, question.id)}
                                                          size="sm"
                                                          variant="outline"
                                                        >
                                                          <Plus size={14} />
                                                        </Button>
                                                      </div>

                                                      {question.options.map((option) => (
                                                        <div key={option.id} className="flex items-center gap-3">
                                                          <button
                                                            onClick={() => updateQuestion(quiz.id, question.id, { correctOptionId: option.id })}
                                                            className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                                                              question.correctOptionId === option.id
                                                                ? 'bg-green-500 border-green-500 text-white'
                                                                : 'border-slate-300 hover:border-green-400'
                                                            }`}
                                                          >
                                                            {question.correctOptionId === option.id && (
                                                              <CheckCircle size={14} />
                                                            )}
                                                          </button>
                                                          <Input
                                                            placeholder={`Option ${option.order}`}
                                                            value={option.text}
                                                            onChange={(e) => updateOption(quiz.id, question.id, option.id, e.target.value)}
                                                            className="flex-1"
                                                          />
                                                          <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => deleteOption(quiz.id, question.id, option.id)}
                                                            disabled={question.options.length <= 2}
                                                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                          >
                                                            <Trash2 size={14} />
                                                          </Button>
                                                        </div>
                                                      ))}
                                                    </div>
                                                  </CardContent>
                                                )}
                                              </Card>
                                            )}
                                          </Draggable>
                                        ))}
                                        {provided.placeholder}
                                      </div>
                                    )}
                                  </Droppable>
                                </DragDropContext>
                              )}
                            </div>
                          </CardContent>
                        )}
                      </Card>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      )}

      <div className="flex justify-start pt-6 border-t">
        <Button variant="outline" onClick={onBack} className="flex items-center gap-2">
          <ChevronLeft size={16} />
          Back to Lessons
        </Button>
      </div>
    </div>
  );
}