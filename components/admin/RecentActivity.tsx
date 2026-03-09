import { UserPlus, BookOpen, CheckCircle } from "lucide-react";

export const RecentActivity = () => {
  const activities = [
    { id: 1, icon: UserPlus, text: "New instructor application: Sarah J.", time: "2 hours ago", color: "text-blue-600" },
    { id: 2, icon: BookOpen, text: "Course 'Advanced React' updated", time: "4 hours ago", color: "text-purple-600" },
    { id: 3, icon: CheckCircle, text: "Ticket #1204 resolved", time: "1 day ago", color: "text-green-600" },
  ];


  
  return (
    <div className="bg-white p-6 rounded-xl border shadow-sm h-full">
      <h3 className="font-semibold mb-6 text-slate-800">Recent Activity</h3>
      <div className="space-y-6">
        {activities.map((activity) => (
          <div key={activity.id} className="flex gap-x-3">
            <div className={`p-2 rounded-full bg-slate-100 ${activity.color}`}>
              <activity.icon size={16} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-700">{activity.text}</p>
              <p className="text-xs text-slate-400">{activity.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};