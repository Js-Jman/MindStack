"use client";

import React, { useState, useEffect } from "react";
import { BookOpen, Plus } from "lucide-react";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { SearchBar } from "@/components/dashboard/SearchBar";
import { EnrolledCourseCard } from "@/components/dashboard/EnrolledCourseCard";
import { EnrollCoursesDialog } from "@/components/dashboard/EnrollCoursesDialog";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";

interface Course {
  id: number;
  title: string;
  description: string;
  image?: string;
  instructor?: { name?: string; email: string };
  level?: string;
  duration?: number;
  lessonCount?: number;
  rating?: number;
  progress?: number;
  status?: string;
}

interface Stats {
  totalEnrollments: number;
  completedCourses: number;
  inProgressCourses: number;
  averageProgress: number;
}

export default function StudentDashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalEnrollments: 0,
    completedCourses: 0,
    inProgressCourses: 0,
    averageProgress: 0,
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoadingCourses, setIsLoadingCourses] = useState(true);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const studentId = user?.id;

  useEffect(() => {
    if (!studentId) return;

    const fetchEnrolledCourses = async () => {
      try {
        setIsLoadingCourses(true);
        const response = await fetch(`/api/enrollments`);
        if (!response.ok) throw new Error("Failed to fetch courses");
        const data = await response.json();
        setEnrolledCourses(data);
        setFilteredCourses(data);
      } catch (err) {
        setError("Failed to load your courses");
        console.error(err);
      } finally {
        setIsLoadingCourses(false);
      }
    };

    fetchEnrolledCourses();
  }, [studentId]);

  useEffect(() => {
    if (!studentId) return;

    const fetchStats = async () => {
      try {
        setIsLoadingStats(true);
        const response = await fetch(`/api/stats`);
        if (!response.ok) throw new Error("Failed to fetch stats");
        const data = await response.json();
        setStats(data);
      } catch (err) {
        console.error("Failed to load stats:", err);
      } finally {
        setIsLoadingStats(false);
      }
    };

    fetchStats();
  }, [studentId]);

  const handleSearch = (query: string) => {
    if (!query.trim()) {
      setFilteredCourses(enrolledCourses);
    } else {
      setFilteredCourses(
        enrolledCourses.filter(
          (course) =>
            course.title.toLowerCase().includes(query.toLowerCase()) ||
            course.description.toLowerCase().includes(query.toLowerCase())
        )
      );
    }
  };

  const handleEnrollSuccess = async () => {
    if (!studentId) return;
    try {
      const [cRes, sRes] = await Promise.all([
        fetch(`/api/enrollments`),
        fetch(`/api/stats`),
      ]);
      if (cRes.ok) {
        const d = await cRes.json();
        setEnrolledCourses(d);
        setFilteredCourses(d);
      }
      if (sRes.ok) setStats(await sRes.json());
    } catch (err) {
      console.error(err);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
                Student Dashboard
              </h1>
              <p className="text-gray-500 text-sm mt-0.5">
                Welcome back{user?.name ? `, ${user.name}` : ""}! Continue your learning journey.
              </p>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Your Stats</h2>
          {isLoadingStats ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-28 bg-white rounded-xl animate-pulse shadow" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatsCard title="Total Enrollments" value={stats.totalEnrollments} icon="enrollments" />
              <StatsCard title="Completed" value={stats.completedCourses} icon="completed" />
              <StatsCard title="In Progress" value={stats.inProgressCourses} icon="inProgress" />
              <StatsCard title="Avg Progress" value={`${stats.averageProgress}%`} icon="average" />
            </div>
          )}
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
            {error}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between mb-8">
          <div className="flex-1 min-w-0">
            <SearchBar onSearch={handleSearch} />
          </div>
          <button
            onClick={() => setIsDialogOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white font-semibold rounded-xl hover:opacity-90 transition-opacity whitespace-nowrap"
          >
            <Plus className="w-5 h-5" />
            Enroll Courses
          </button>
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800">Your Courses</h2>
            {filteredCourses.length > 0 && (
              <span className="text-sm font-semibold text-purple-600 bg-purple-50 px-3 py-1 rounded-full">
                {filteredCourses.length} course{filteredCourses.length !== 1 ? "s" : ""}
              </span>
            )}
          </div>

          {isLoadingCourses ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-72 bg-white rounded-xl animate-pulse shadow" />
              ))}
            </div>
          ) : filteredCourses.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 mx-auto mb-4 bg-purple-100 rounded-full flex items-center justify-center">
                <BookOpen className="w-10 h-10 text-purple-500" />
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">No courses yet</h3>
              <p className="text-gray-500 mb-6 text-sm">Start your learning journey by enrolling in a course.</p>
              <button
                onClick={() => setIsDialogOpen(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white font-semibold rounded-xl hover:opacity-90 transition-opacity"
              >
                <Plus className="w-5 h-5" /> Explore Courses
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses.map((course) => (
                <EnrolledCourseCard
                  key={course.id}
                  id={course.id}
                  title={course.title}
                  image={course.image}
                  instructorName={course.instructor?.name || "Unknown Instructor"}
                  progress={course.progress || 0}
                  lessonCount={course.lessonCount}
                  rating={course.rating}
                  onClick={() => router.push(`/courses/${course.id}`)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <EnrollCoursesDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        enrolledCourseIds={enrolledCourses.map((c) => c.id)}
        onEnrollSuccess={handleEnrollSuccess}
      />
    </div>
  );
}