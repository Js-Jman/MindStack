"use client";

import { useEffect, useState } from "react";
import { WelcomeBanner } from "@/components/admin/WelcomeBanner";
import { StatsCard } from "@/components/admin/StatsCard";
import { SummaryChart } from "@/components/admin/SummaryChart";
import { BookOpen, Users, DollarSign } from "lucide-react";

type InstructorStats = {
  totalCourses: number;
  totalEnrollments: number;
  totalRevenue: number;
}

type RecentCourse = {
  id: number;
  title: string;
  enrollmentsCount: number;
  createdAt: string;
}

type ChartData = {
  month: string;
  count: number;
}

export default function InstructorDashboardPage() {
  const [stats, setStats] = useState<InstructorStats | null>(null);
  const [recentCourses, setRecentCourses] = useState<RecentCourse[]>([]);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsRes, coursesRes, chartRes] = await Promise.all([
          fetch("/api/instructor/stats"),
          fetch("/api/instructor/courses"),
          fetch("/api/instructor/chart"),
        ]);

        if (!statsRes.ok || !coursesRes.ok || !chartRes.ok) {
          throw new Error("Failed to fetch dashboard data");
        }

        const [statsData, coursesData, chartDataRaw] = await Promise.all([
          statsRes.json(),
          coursesRes.json(),
          chartRes.json(),
        ]);

        setStats(statsData);
        setRecentCourses(coursesData);
        setChartData(chartDataRaw);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="max-w mx-auto space-y-6 pb-10">
        <div className="animate-pulse">
          <div className="h-32 bg-gray-200 rounded-[2rem] mb-6"></div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
          <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
            <div className="lg:col-span-2 h-96 bg-gray-200 rounded-[2rem]"></div>
            <div className="h-96 bg-gray-200 rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto space-y-6 pb-10">
        <div className="p-6 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-red-600">Error loading dashboard: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto space-y-6 pb-10">
      <div className="bg-white/60 backdrop-blur-xl p-8 rounded-[2rem] border border-white shadow-sm transition-all hover:shadow-md">
        <h1 className="text-3xl font-bold tracking-tight"> 
          {/* Changed from text-5xl to text-3xl and font-extrabold to font-bold */}
          <span className="bg-gradient-to-r from-purple-700 via-purple-600 to-blue-500 bg-clip-text text-transparent">
            Hello, INstructor!
          </span>
        </h1>
        <p className="text-slate-500 mt-2 text-base font-medium max-w-xl leading-relaxed">
          {/* Changed mt-4 to mt-2, text-lg to text-base, and max-w-2xl to max-w-xl */}
          Welcome back to the MindStack Panel. Monitor your courses&apos;s growth, manage courses all in one place.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <StatsCard
          title="Total Courses"
          value={stats?.totalCourses.toString() || "0"}
          icon={<BookOpen className="text-purple-600" size={20} />}
          description="Courses you've created"
        />
        <StatsCard
          title="Total Enrollments"
          value={stats?.totalEnrollments.toString() || "0"}
          icon={<Users className="text-blue-600" size={20} />}
          description="Students enrolled in your courses"
        />
        <StatsCard
          title="Total Revenue"
          value={`$${(stats?.totalRevenue ?? 0).toFixed(2)}`}
          icon={<DollarSign className="text-emerald-600" size={20} />}
          description="Revenue from course enrollments"
        />
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
        <div className="lg:col-span-2 bg-white/40 backdrop-blur-md p-6 rounded-[2rem] border border-white min-h-[400px]">
          <h3 className="text-xl font-bold text-slate-800 mb-6 px-2">Enrollment Analytics</h3>
          <SummaryChart
            title="Enrollments (Last 12 Months)"
            subtitle="Monthly enrollment trends for your courses"
            data={chartData.map(item => ({
              label: new Date(item.month + "-01").toLocaleString("en-US", { month: "short" }),
              value: item.count,
            }))}
          />
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-xl border shadow-sm h-full">
            <h3 className="font-semibold mb-6 text-slate-800">Recent Courses</h3>
            <div className="space-y-4">
              {recentCourses.length === 0 ? (
                <p className="text-sm text-slate-500">No courses created yet.</p>
              ) : (
                recentCourses.slice(0, 5).map((course) => (
                  <div key={course.id} className="flex items-center gap-x-3 p-3 bg-slate-50 rounded-lg">
                    <div className="p-2 rounded-full bg-purple-100 text-purple-600">
                      <BookOpen size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-700 truncate">
                        {course.title}
                      </p>
                      <p className="text-xs text-slate-500">
                        {course.enrollmentsCount} enrollment{course.enrollmentsCount !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}