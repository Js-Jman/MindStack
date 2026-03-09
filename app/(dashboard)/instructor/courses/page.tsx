"use client";

import { useEffect, useState } from "react";
import { CoursesTable } from "@/components/instructor/CoursesTable";

interface CourseData {
  id: number;
  title: string;
  description: string;
  price: number;
  isPublished: boolean;
  isFree: boolean;
  enrollmentsCount: number;
  lessonsCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export default function InstructorCoursesPage() {
  const [courses, setCourses] = useState<CourseData[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch("/api/instructor/courses/all");
        if (!response.ok) {
          throw new Error("Failed to fetch courses");
        }
        const data = await response.json();
        setCourses(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      }
    };

    fetchCourses();
  }, []);

  if (error) {
    return (
      <div className="space-y-6 max-w mx-auto">
        <div className="px-4">
          <h2 className="text-2xl font-bold text-slate-900">Course Management</h2>
          <p className="text-sm text-slate-500">Manage your courses and monitor student engagement.</p>
        </div>
        <div className="p-6 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-red-600">Error loading courses: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w mx-auto">
      <div className="px-4">
        <h2 className="text-2xl font-bold text-slate-900">Course Management</h2>
        <p className="text-sm text-slate-500">Manage your courses and monitor student engagement.</p>
      </div>

      <CoursesTable data={courses} />
    </div>
  );
}