"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ChevronLeft, ChevronRight, Plus, Trash2, GripVertical } from "lucide-react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

interface LessonData {
  id: string;
  title: string;
  content: string;
  order: number;
}

interface LessonsTabProps {
  lessons: LessonData[];
  onChange: (lessons: LessonData[]) => void;
  onNext: () => void;
  onBack: () => void;
  canProceed: boolean;
}

export function LessonsTab({ lessons, onChange, onNext, onBack, canProceed }: LessonsTabProps) {
  const [expandedLesson, setExpandedLesson] = useState<string | null>(null);

  const addLesson = () => {
    const newLesson: LessonData = {
      id: `lesson-${Date.now()}`,
      title: "",
      content: "",
      order: lessons.length + 1,
    };
    onChange([...lessons, newLesson]);
    setExpandedLesson(newLesson.id);
  };

  const updateLesson = (id: string, updates: Partial<LessonData>) => {
    const updatedLessons = lessons.map(lesson =>
      lesson.id === id ? { ...lesson, ...updates } : lesson
    );
    onChange(updatedLessons);
  };

  const deleteLesson = (id: string) => {
    const filteredLessons = lessons.filter(lesson => lesson.id !== id);
    const reorderedLessons = filteredLessons.map((lesson, index) => ({
      ...lesson,
      order: index + 1,
    }));
    onChange(reorderedLessons);
    if (expandedLesson === id) {
      setExpandedLesson(null);
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(lessons);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    const reorderedLessons = items.map((lesson, index) => ({
      ...lesson,
      order: index + 1,
    }));

    onChange(reorderedLessons);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Course Lessons</h2>
          <p className="text-slate-600">Create and organize the lessons for your course.</p>
        </div>
        <Button onClick={addLesson} className="flex items-center gap-2">
          <Plus size={16} />
          Add Lesson
        </Button>
      </div>

      {lessons.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                <Plus size={24} className="text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900">No lessons yet</h3>
                <p className="text-slate-600">Add your first lesson to get started</p>
              </div>
              <Button onClick={addLesson} className="flex items-center gap-2">
                <Plus size={16} />
                Add First Lesson
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="lessons">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
                {lessons.map((lesson, index) => (
                  <Draggable key={lesson.id} draggableId={lesson.id} index={index}>
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
                                  Lesson {lesson.order}
                                </span>
                                <CardTitle className="text-lg">
                                  {lesson.title || "Untitled Lesson"}
                                </CardTitle>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setExpandedLesson(
                                  expandedLesson === lesson.id ? null : lesson.id
                                )}
                              >
                                {expandedLesson === lesson.id ? "Collapse" : "Edit"}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteLesson(lesson.id)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 size={16} />
                              </Button>
                            </div>
                          </div>
                        </CardHeader>

                        {expandedLesson === lesson.id && (
                          <CardContent className="space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor={`title-${lesson.id}`}>Lesson Title</Label>
                              <Input
                                id={`title-${lesson.id}`}
                                placeholder="Enter lesson title"
                                value={lesson.title}
                                onChange={(e) => updateLesson(lesson.id, { title: e.target.value })}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor={`content-${lesson.id}`}>Lesson Content</Label>
                              <Textarea
                                id={`content-${lesson.id}`}
                                placeholder="Enter lesson content (supports markdown)"
                                value={lesson.content}
                                onChange={(e) => updateLesson(lesson.id, { content: e.target.value })}
                                rows={6}
                              />
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

      <div className="flex justify-between pt-6 border-t">
        <Button variant="outline" onClick={onBack} className="flex items-center gap-2">
          <ChevronLeft size={16} />
          Back to Basic Details
        </Button>
        <Button
          onClick={onNext}
          disabled={!canProceed}
          className="flex items-center gap-2"
        >
          Continue to Quizzes
          <ChevronRight size={16} />
        </Button>
      </div>
    </div>
  );
}