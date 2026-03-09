"use client";

import { useState, useEffect, useMemo } from "react";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import { SearchBar } from "@/components/dashboard/SearchBar";
import Link from "next/link";
import Image from "next/image";

type CourseVM = {
  id: number;
  title: string;
  description: string;
  image: string | null;
  instructorName: string;
  lessonsCount: number;
  isEnrolled: boolean;
  progress: number;
  progressStatus: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
  price: number;
  isFree: boolean;
};

type FilterKey =
  | "ALL"
  | "ENROLLED"
  | "COMPLETED"
  | "IN_PROGRESS"
  | "NOT_STARTED"
  | "FREE";

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "ALL", label: "All" },
  { key: "ENROLLED", label: "Enrolled" },
  { key: "COMPLETED", label: "Completed" },
  { key: "IN_PROGRESS", label: "In Progress" },
  { key: "NOT_STARTED", label: "Not Started" },
  { key: "FREE", label: "Free" },
];

export default function CoursesPage() {
  const [courses, setCourses] = useState<CourseVM[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<FilterKey>("ALL");

  const [query, setQuery] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      const res = await fetch("/api/courses", { cache: "no-store" });
      const data = await res.json();
      setCourses(data);
      setLoading(false);
    }
    load();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    return courses.filter((c) => {
      // Filter pills
      const pass =
        activeFilter === "ALL" ||
        (activeFilter === "ENROLLED" && c.isEnrolled) ||
        (activeFilter === "COMPLETED" && c.progressStatus === "COMPLETED") ||
        (activeFilter === "IN_PROGRESS" &&
          c.progressStatus === "IN_PROGRESS") ||
        (activeFilter === "NOT_STARTED" &&
          c.progressStatus === "NOT_STARTED") ||
        (activeFilter === "FREE" && c.isFree);

      if (!pass) return false;

      // Search
      if (!q) return true;
      return (
        c.title.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        (c.instructorName ?? "").toLowerCase().includes(q)
      );
    });
  }, [query, activeFilter, courses]);

  return (
    <div className="min-h-screen bg-[#f7f8fc]">
      <Navbar />

      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 py-6 flex gap-6">
        <div className="hidden md:block w-64 shrink-0">
          <Sidebar />
        </div>

        <div className="flex-1 space-y-10">
          {/* Header gradient card */}
          <div className="rounded-2xl p-8 bg-gradient-to-r from-[#6a5ae0] via-[#5d8dee] to-[#6a5ae0] text-white shadow-xl">
            <h1 className="text-3xl font-extrabold">Course Catalog</h1>
            <p className="text-white/90 mt-1">
              Explore curated courses tailored for modern learners.
            </p>

            <div className="mt-6 max-w-lg">
              <SearchBar onSearch={setQuery} />
            </div>

            {/* Filter Chips */}
            <div className="mt-4 flex flex-wrap gap-2">
              {FILTERS.map((f) => {
                const active = activeFilter === f.key;
                return (
                  <button
                    key={f.key}
                    onClick={() => setActiveFilter(f.key)}
                    className={[
                      "px-3 py-1.5 rounded-full text-sm font-semibold transition",
                      active
                        ? "bg-white text-[#5c59d4] shadow"
                        : "bg-white/15 text-white hover:bg-white/25",
                    ].join(" ")}
                  >
                    {f.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Course Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="h-80 bg-white rounded-2xl border border-purple-100 shadow-sm animate-pulse"
                />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-gray-600 text-center p-10 bg-white rounded-2xl shadow">
              No courses found
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {filtered.map((c) => (
                <div
                  key={c.id}
                  className="group relative bg-white rounded-2xl border border-purple-100 shadow hover:shadow-lg hover:-translate-y-0.5 transition-all overflow-hidden"
                >
                  {/* Whole card clickable */}
                  <Link
                    href={`/courses/${c.id}`}
                    className="absolute inset-0 z-[1]"
                  />

                  {/* Image */}
                  {c.image && (
                    <div className="w-full h-40 bg-gray-100 overflow-hidden">
                      <Image
                        src={c.image}
                        alt={c.title}
                        width={640}
                        height={320}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}

                  <div className="p-5 relative z-[2] flex flex-col h-full">
                    {/* Title + Instructor */}
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 bg-purple-50 border border-purple-100 rounded-lg flex items-center justify-center text-purple-600">
                        📘
                      </div>

                      <div>
                        <h3 className="text-base font-bold text-gray-900">
                          {c.title}
                        </h3>
                        <p className="text-xs text-gray-500 line-clamp-1">
                          {c.instructorName}
                        </p>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-gray-600 mt-3 line-clamp-2">
                      {c.description}
                    </p>

                    {/* Badges */}
                    <div className="flex items-center gap-2 flex-wrap mt-3">
                      <span className="text-[11px] font-semibold text-purple-700 bg-purple-50 border border-purple-100 px-2.5 py-1 rounded-full">
                        {c.lessonsCount} lessons
                      </span>

                      {c.isFree ? (
                        <span className="text-[11px] text-green-700 bg-green-50 px-2.5 py-1 rounded-full border border-green-100">
                          Free
                        </span>
                      ) : (
                        <span className="text-[11px] text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100">
                          ₹{c.price}
                        </span>
                      )}

                      {c.isEnrolled && (
                        <span className="text-[11px] text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-100">
                          Enrolled
                        </span>
                      )}
                    </div>

                    {/* Progress */}
                    {c.isEnrolled && c.progress > 0 && (
                      <div className="mt-4">
                        <div className="w-full h-2 rounded bg-gray-100 overflow-hidden">
                          <div
                            className="h-2 bg-gradient-to-r from-purple-500 to-blue-500"
                            style={{ width: `${c.progress}%` }}
                          />
                        </div>
                        <div className="mt-1 text-[11px] text-gray-600">
                          {c.progress}% complete
                        </div>
                      </div>
                    )}

                    {/* CTA */}
                    <div className="mt-5">
                      <span className="inline-flex items-center justify-center w-full px-4 py-2.5 rounded-full text-sm font-semibold text-white bg-[#5b57d1] group-hover:bg-[#4f4bc3] transition">
                        {c.isEnrolled ? "Continue Learning" : "View Course"}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
