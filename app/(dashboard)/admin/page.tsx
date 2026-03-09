import { prisma } from "@/lib/db";
import { WelcomeBanner } from "@/components/admin/WelcomeBanner";
import { StatsCard } from "@/components/admin/StatsCard";
import { RecentActivity } from "../../../components/admin/RecentActivity";
import { SummaryChart } from "@/components/admin/SummaryChart";
import { Users, GraduationCap, BookOpen, UserPlus } from "lucide-react";

function getLastSixMonthBuckets() {
  const now = new Date();
  const buckets: { key: string; label: string; start: Date; end: Date }[] = [];

  for (let i = 5; i >= 0; i -= 1) {
    const start = new Date(now.getFullYear(), now.getMonth() - i, 1, 0, 0, 0, 0);
    const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1, 0, 0, 0, 0);
    const key = `${start.getFullYear()}-${start.getMonth() + 1}`;
    const label = start.toLocaleString("en-US", { month: "short" });
    buckets.push({ key, label, start, end });
  }

  return buckets;
}

export default async function AdminDashboardPage() {
  const [totalStudents, totalInstructors, totalPublishedCourses, totalEnrollments] =
    await Promise.all([
      prisma.user.count({ where: { role: "STUDENT" } }),
      prisma.user.count({ where: { role: "INSTRUCTOR" } }),
      prisma.course.count({ where: { isPublished: true } }),
      prisma.courseEnrollment.count(),
    ]);

  const sixMonthBuckets = getLastSixMonthBuckets();
  const rangeStart = sixMonthBuckets[0].start;
  const rangeEnd = sixMonthBuckets[sixMonthBuckets.length - 1].end;

  const enrollments = await prisma.courseEnrollment.findMany({
    where: {
      enrolledAt: {
        gte: rangeStart,
        lt: rangeEnd,
      },
    },
    select: { enrolledAt: true },
  });

  const chartMap = new Map<string, number>();
  for (const bucket of sixMonthBuckets) {
    chartMap.set(bucket.key, 0);
  }

  for (const enrollment of enrollments) {
    const key = `${enrollment.enrolledAt.getFullYear()}-${enrollment.enrolledAt.getMonth() + 1}`;
    chartMap.set(key, (chartMap.get(key) ?? 0) + 1);
  }

  const summarySeries = sixMonthBuckets.map((bucket) => ({
    label: bucket.label,
    value: chartMap.get(bucket.key) ?? 0,
  }));

  return (
    <div className="max-w mx-auto space-y-6 pb-10">
      <WelcomeBanner />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Students"
          value={String(totalStudents)}
          icon={<Users className="text-purple-600" size={20} />}
          description="Registered student accounts"
        />
        <StatsCard
          title="Instructors"
          value={String(totalInstructors)}
          icon={<GraduationCap className="text-blue-600" size={20} />}
          description="Active instructor accounts"
        />
        <StatsCard
          title="Published Courses"
          value={String(totalPublishedCourses)}
          icon={<BookOpen className="text-emerald-600" size={20} />}
          description="Live courses visible to learners"
        />
        <StatsCard
          title="Total Enrollments"
          value={String(totalEnrollments)}
          icon={<UserPlus className="text-orange-500" size={20} />}
          description="All-time enrollment records"
        />
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
        <div className="lg:col-span-2 bg-white/40 backdrop-blur-md p-6 rounded-[2rem] border border-white min-h-[400px]">
          <h3 className="text-xl font-bold text-slate-800 mb-6 px-2">Performance Analytics</h3>
          <SummaryChart
            title="Enrollments (Last 6 Months)"
            subtitle="Real monthly enrollment volume from course_enrollments"
            data={summarySeries}
          />
        </div>

        <div className="lg:col-span-1">
          <RecentActivity />
        </div>
      </div>
    </div>
  );
}