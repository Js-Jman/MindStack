"use client";

import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import { SearchBar } from "@/components/dashboard/SearchBar";
import React, { useState, useEffect } from "react";

interface Course {
  id: number;
  title: string;
  description: string;
  image?: string;
  instructor?: {
    name?: string;
    email: string;
  };
}

const features = [
  {
    title: "Personalized Dashboard",
    description:
      "Track your progress, enrollments, and achievements in one place.",
    icon: "📊",
  },
  {
    title: "Course Search",
    description: "Find courses easily using our smart search bar.",
    icon: "🔍",
  },
  {
    title: "Assignments & Quizzes",
    description:
      "Engage with interactive assignments and quizzes to test your knowledge.",
    icon: "📝",
  },
  {
    title: "Progress Tracking",
    description:
      "Monitor your learning journey with detailed progress analytics.",
    icon: "⏳",
  },
  {
    title: "Instructor Support",
    description: "Get guidance and feedback from expert instructors.",
    icon: "👩‍🏫",
  },
  {
    title: "Community Support",
    description:
      "Connect with peers and get support from our active learning community.",
    icon: "👥",
  },
];

export default function Page() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoadingCourses, setIsLoadingCourses] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setIsLoadingCourses(true);
        const response = await fetch(`/api/courses`);
        if (!response.ok) throw new Error("Failed to fetch courses");
        const data = await response.json();
        setCourses(data);
        setFilteredCourses(data);
      } catch (err) {
        setError("Failed to load courses");
      } finally {
        setIsLoadingCourses(false);
      }
    };
    fetchCourses();
  }, []);

  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setFilteredCourses(courses);
      setShowSuggestions(false);
    } else {
      const results = courses.filter(
        (course) =>
          course.title.toLowerCase().includes(query.toLowerCase()) ||
          course.description.toLowerCase().includes(query.toLowerCase()),
      );
      setFilteredCourses(results);
      setShowSuggestions(true);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-blue-50 to-white">
      <Navbar />
      <div className="flex w-full max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 py-10 gap-10">
        {/* Sidebar */}
        <aside className="w-64 shrink-0 hidden md:block sticky top-8 h-[calc(100vh-4rem)]">
          <Sidebar />
        </aside>
        {/* Main Content */}
        <main className="flex-1 min-w-0 flex flex-col gap-10">
          {/* Search Bar */}
          <div className="mb-8">
            <section className="flex flex-col md:flex-row md:items-center gap-6 md:gap-8 mb-6">
              <div className="flex-1 min-w-0 relative">
                <SearchBar
                  onSearch={handleSearch}
                  placeholder="Search courses..."
                />
                {/* Suggestions Dropdown for course names */}
                {showSuggestions &&
                  searchQuery &&
                  filteredCourses.length > 0 && (
                    <div className="absolute left-0 right-0 z-30 bg-white border border-purple-100 rounded-lg shadow-lg mt-2 max-h-64 overflow-y-auto">
                      {filteredCourses.slice(0, 8).map((course) => (
                        <a
                          key={course.id}
                          href={`/courses/${course.id}`}
                          className="block px-4 py-3 hover:bg-purple-50 transition-colors border-b last:border-b-0 border-purple-50 cursor-pointer"
                          onClick={() => {
                            setShowSuggestions(false);
                            setSearchQuery("");
                          }}
                        >
                          <span className="font-semibold text-purple-700">
                            {course.title}
                          </span>
                        </a>
                      ))}
                    </div>
                  )}
              </div>
              <button
                onClick={() => setIsDialogOpen(true)}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-purple-300 transition-all duration-200 active:scale-95 whitespace-nowrap"
              >
                <span>Enroll Courses</span>
              </button>
            </section>
          </div>

          {/* Info Section */}
          <section className="bg-white rounded-2xl shadow-xl shadow-purple-200 border border-purple-100 p-10 flex flex-col items-center text-center">
            <h1 className="text-4xl font-extrabold text-purple-700 mb-4">
              Welcome to MindStack LMS
            </h1>
            <p className="text-lg text-blue-700 mb-2">
              Empowering learners and instructors with a modern, intuitive
              platform designed to make education accessible, engaging, and
              effective for everyone.
            </p>
            <p className="text-md text-gray-600 max-w-2xl">
              Discover a wide variety of courses, track your progress with
              detailed analytics, and unlock your potential with interactive
              learning tools. MindStack LMS brings together students,
              instructors, and a vibrant community to foster growth,
              collaboration, and lifelong learning. Whether you're looking to
              master a new skill, teach others, or simply explore new topics,
              our platform provides all the resources and support you need to
              succeed in your educational journey.
            </p>
          </section>

          {/* Features Section */}
          <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {features.map((feature, idx) => (
              <div
                key={feature.title}
                className="bg-gradient-to-br from-purple-50 via-blue-50 to-white border border-purple-200 rounded-xl shadow-lg p-6 flex flex-col items-center text-center hover:scale-105 transition-transform duration-200"
              >
                <span className="text-3xl mb-3">{feature.icon}</span>
                <h2 className="text-xl font-semibold text-purple-700 mb-2">
                  {feature.title}
                </h2>
                <p className="text-gray-700">{feature.description}</p>
              </div>
            ))}
          </section>

          {/* Courses Section */}
          <section className="mt-10">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Available Courses
            </h2>
            {isLoadingCourses ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-80 bg-white rounded-lg animate-pulse shadow-md"
                  />
                ))}
              </div>
            ) : filteredCourses.length === 0 ? (
              <div className="text-center py-16">
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
                  Explore Courses
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredCourses.map((course) => (
                  <div
                    key={course.id}
                    className="bg-white rounded-xl shadow p-8 flex flex-col"
                  >
                    <div className="font-bold text-lg text-purple-700 mb-2">
                      {course.title}
                    </div>
                    <div className="text-gray-600 mb-4">
                      {course.description}
                    </div>
                    <a
                      href={`/courses/${course.id}`}
                      className="mt-auto px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg font-semibold text-center hover:shadow-lg hover:shadow-purple-300 transition-all duration-200"
                    >
                      View Course
                    </a>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Enroll Courses Dialog (placeholder) */}
          {/* <EnrollCoursesDialog
            isOpen={isDialogOpen}
            onClose={() => setIsDialogOpen(false)}
            studentId={1}
            enrolledCourseIds={[]}
            onEnrollSuccess={() => {}}
          /> */}
        </main>
      </div>
    </div>
  );
}
