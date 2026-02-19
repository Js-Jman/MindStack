import React, { useState, useEffect } from "react";
import { X, AlertCircle } from "lucide-react";
import { AvailableCourseCard } from "./AvailableCourseCard";

interface Course {
  id: number;
  title: string;
  description: string;
  image?: string;
  instructor?: {
    name?: string;
  };
  level?: string;
  duration?: number;
  lessonCount?: number;
  rating?: number;
}

interface EnrollCoursesDialogProps {
  isOpen: boolean;
  onClose: () => void;
  studentId: number;
  enrolledCourseIds?: number[];
  onEnrollSuccess?: () => void;
}

export function EnrollCoursesDialog({
  isOpen,
  onClose,
  studentId,
  enrolledCourseIds = [],
  onEnrollSuccess,
}: EnrollCoursesDialogProps) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [enrollingCourseId, setEnrollingCourseId] = useState<number | null>(
    null
  );
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (isOpen) {
      fetchAvailableCourses();
    }
  }, [isOpen]);

  useEffect(() => {
    const filtered = courses.filter(
      (course) =>
        course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredCourses(filtered);
  }, [courses, searchQuery]);

  const fetchAvailableCourses = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch("/api/courses");
      if (!response.ok) throw new Error("Failed to fetch courses");
      const data = await response.json();
      setCourses(data);
      setFilteredCourses(data);
    } catch (err) {
      setError("Failed to load available courses");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEnroll = async (courseId: number) => {
    try {
      setEnrollingCourseId(courseId);
      const response = await fetch("/api/enrollments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId,
          courseId,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to enroll");
      }

      // Update the enrolled course IDs
      enrolledCourseIds.push(courseId);

      if (onEnrollSuccess) {
        onEnrollSuccess();
      }
    } catch (err) {
      setError((err as Error).message || "Failed to enroll in course");
      console.error(err);
    } finally {
      setEnrollingCourseId(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center">
      <div
        className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-4xl max-h-[90vh] sm:max-h-[90vh] overflow-hidden flex flex-col shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-blue-50">
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Browse Available Courses
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Explore and enroll in new courses to expand your skills
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="px-6 py-4 border-b border-gray-200 bg-white">
          <input
            type="text"
            placeholder="Search courses by title or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
          />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-700">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-3" />
                <p className="text-gray-600">Loading courses...</p>
              </div>
            </div>
          ) : filteredCourses.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">
                {searchQuery
                  ? "No courses match your search"
                  : "No courses available"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses.map((course) => (
                <AvailableCourseCard
                  key={course.id}
                  id={course.id}
                  title={course.title}
                  description={course.description}
                  image={course.image}
                  instructorName={course.instructor?.name || "Unknown"}
                  level={course.level}
                  duration={course.duration}
                  lessonCount={course.lessonCount}
                  rating={course.rating}
                  isEnrolled={enrolledCourseIds.includes(course.id)}
                  isLoading={enrollingCourseId === course.id}
                  onEnroll={() => handleEnroll(course.id)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-100 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
