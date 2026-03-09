import { prisma } from "@/lib/db";
import { UserPlus, BookOpen, CheckCircle } from "lucide-react";
import type { ActivityItem, ActivityType } from "@/types/admin";

type RecentUser = { id: number; name: string; role: "STUDENT" | "INSTRUCTOR" | "ADMIN"; createdAt: Date };
type RecentCourse = { id: number; title: string; createdAt: Date };
type RecentEnrollment = { id: number; enrolledAt: Date; user: { name: string }; course: { title: string } };

function formatRelativeTime(date: Date): string {
  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  if (diffMinutes < 1) return "just now";
  if (diffMinutes < 60) return `${diffMinutes} min ago`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;
}

function activityMeta(type: ActivityType) {
  if (type === "user") {
    return { icon: UserPlus, color: "text-blue-600" };
  }

  if (type === "course") {
    return { icon: BookOpen, color: "text-purple-600" };
  }

  return { icon: CheckCircle, color: "text-green-600" };
}

export async function RecentActivity() {
  const [latestUsers, latestCourses, latestEnrollments] = (await Promise.all([
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, name: true, role: true, createdAt: true },
    }),
    prisma.course.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, title: true, createdAt: true },
    }),
    prisma.courseEnrollment.findMany({
      orderBy: { enrolledAt: "desc" },
      take: 5,
      include: {
        user: { select: { name: true } },
        course: { select: { title: true } },
      },
    }),
  ])) as [RecentUser[], RecentCourse[], RecentEnrollment[]];

  const activities: ActivityItem[] = [
    ...latestUsers.map((user: RecentUser) => ({
      id: `u-${user.id}`,
      type: "user" as const,
      text: `${user.role === "INSTRUCTOR" ? "Instructor" : "User"} joined: ${user.name}`,
      time: formatRelativeTime(user.createdAt),
      timestamp: user.createdAt,
    })),
    ...latestCourses.map((course: RecentCourse) => ({
      id: `c-${course.id}`,
      type: "course" as const,
      text: `Course created: ${course.title}`,
      time: formatRelativeTime(course.createdAt),
      timestamp: course.createdAt,
    })),
    ...latestEnrollments.map((enrollment: RecentEnrollment) => ({
      id: `e-${enrollment.id}`,
      type: "enrollment" as const,
      text: `${enrollment.user.name} enrolled in ${enrollment.course.title}`,
      time: formatRelativeTime(enrollment.enrolledAt),
      timestamp: enrollment.enrolledAt,
    })),
  ]
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, 6);


  
  return (
    <div className="bg-white p-6 rounded-xl border shadow-sm h-full">
      <h3 className="font-semibold mb-6 text-slate-800">Recent Activity</h3>
      <div className="space-y-6">
        {activities.length === 0 ? (
          <p className="text-sm text-slate-500">No recent activity yet.</p>
        ) : (
          activities.map((activity) => {
            const meta = activityMeta(activity.type);

            return (
              <div key={activity.id} className="flex gap-x-3">
                <div className={`p-2 rounded-full bg-slate-100 ${meta.color}`}>
                  <meta.icon size={16} />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-700">{activity.text}</p>
                  <p className="text-xs text-slate-400">{activity.time}</p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
