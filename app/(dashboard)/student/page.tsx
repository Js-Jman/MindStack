"use client";

import React, { useState, useEffect } from "react";
import { BookOpen, Plus } from "lucide-react";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { SearchBar } from "@/components/dashboard/SearchBar";
import { EnrolledCourseCard } from "@/components/dashboard/EnrolledCourseCard";
import { EnrollCoursesDialog } from "@/components/dashboard/EnrollCoursesDialog";

interface Course {
  id: number;
  title: string;
  description: string;
  image?: string;
  instructor?: {
    name?: string;
    email: string;
  };
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
  // Using a mock student ID - in a real app, this would come from auth
  const STUDENT_ID = 1;

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

  // Fetch enrolled courses
  useEffect(() => {
    const fetchEnrolledCourses = async () => {
      try {
        setIsLoadingCourses(true);
        const response = await fetch(
          `/api/enrollments?studentId=${STUDENT_ID}`
        );
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
  }, []);

  // Fetch stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoadingStats(true);
        const response = await fetch(`/api/stats?studentId=${STUDENT_ID}`);
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
  }, []);

  const handleSearch = (query: string) => {
    if (!query.trim()) {
      setFilteredCourses(enrolledCourses);
    } else {
      const results = enrolledCourses.filter(
        (course) =>
          course.title.toLowerCase().includes(query.toLowerCase()) ||
          course.description.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredCourses(results);
    }
  };

  const handleEnrollSuccess = () => {
    // Refresh enrollments and stats
    const fetchEnrolledCourses = async () => {
      try {
        const response = await fetch(
          `/api/enrollments?studentId=${STUDENT_ID}`
        );
        if (!response.ok) throw new Error("Failed to fetch courses");
        const data = await response.json();
        setEnrolledCourses(data);
        setFilteredCourses(data);
      } catch (err) {
        console.error(err);
      }
    };

    const fetchStats = async () => {
      try {
        const response = await fetch(`/api/stats?studentId=${STUDENT_ID}`);
        if (!response.ok) throw new Error("Failed to fetch stats");
        const data = await response.json();
        setStats(data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchEnrolledCourses();
    fetchStats();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Top Decoration */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-purple-200/20 to-blue-200/20 rounded-full blur-3xl -z-0" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-blue-200/20 to-purple-200/20 rounded-full blur-3xl -z-0" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
                Student Dashboard
              </h1>
              <p className="text-gray-600 mt-1">
                Welcome back! Continue your learning journey
              </p>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Your Stats</h2>
          {isLoadingStats ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-32 bg-white rounded-lg animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatsCard
                title="Total Enrollments"
                value={stats.totalEnrollments}
                icon="enrollments"
              />
              <StatsCard
                title="Completed Courses"
                value={stats.completedCourses}
                icon="completed"
              />
              <StatsCard
                title="In Progress"
                value={stats.inProgressCourses}
                icon="inProgress"
              />
              <StatsCard
                title="Average Progress"
                value={`${stats.averageProgress}%`}
                icon="average"
              />
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {/* Search and Action Section */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
            <div className="flex-1 min-w-0">
              <SearchBar onSearch={handleSearch} />
            </div>
            <button
              onClick={() => setIsDialogOpen(true)}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-purple-300 transition-all duration-200 active:scale-95 whitespace-nowrap"
            >
              <Plus className="w-5 h-5" />
              <span>Enroll Courses</span>
            </button>
          </div>
        </div>

        {/* Enrolled Courses Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-800">Your Courses</h2>
            {filteredCourses.length > 0 && (
              <span className="text-sm font-semibold text-purple-600 bg-purple-50 px-3 py-1 rounded-full">
                {filteredCourses.length} course{filteredCourses.length !== 1 ? "s" : ""}
              </span>
            )}
          </div>

          {isLoadingCourses ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-80 bg-white rounded-lg animate-pulse shadow-md"
                />
              ))}
            </div>
          ) : filteredCourses.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-purple-200 to-blue-200 rounded-full flex items-center justify-center">
                <BookOpen className="w-10 h-10 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                No Courses Yet
              </h3>
              <p className="text-gray-600 mb-6">
                Start your learning journey by enrolling in a course
              </p>
              <button
                onClick={() => setIsDialogOpen(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-purple-300 transition-all duration-200"
              >
                <Plus className="w-5 h-5" />
                Explore Courses
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
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Enroll Courses Dialog */}
      <EnrollCoursesDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        studentId={STUDENT_ID}
        enrolledCourseIds={enrolledCourses.map((c) => c.id)}
        onEnrollSuccess={handleEnrollSuccess}
      />
    </div>
  );
}
