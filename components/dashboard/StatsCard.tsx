import React from "react";
import { BookOpen, Award, BarChart3, Zap } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: number | string;
  icon?: "enrollments" | "completed" | "inProgress" | "average";
  trend?: number;
}

export function StatsCard({
  title,
  value,
  icon = "enrollments",
  trend,
}: StatsCardProps) {
  const icons = {
    enrollments: <BookOpen className="w-6 h-6" />,
    completed: <Award className="w-6 h-6" />,
    inProgress: <Zap className="w-6 h-6" />,
    average: <BarChart3 className="w-6 h-6" />,
  };

  const gradients = {
    enrollments: "from-blue-500 to-blue-600",
    completed: "from-purple-500 to-purple-600",
    inProgress: "from-cyan-500 to-blue-500",
    average: "from-indigo-500 to-purple-500",
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden">
      <div className={`bg-gradient-to-br ${gradients[icon]} p-4 text-white`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium opacity-90">{title}</p>
            <p className="text-3xl font-bold mt-2">{value}</p>
            {trend !== undefined && (
              <p className={`text-xs mt-1 ${trend >= 0 ? "text-green-200" : "text-red-200"}`}>
                {trend >= 0 ? "↑" : "↓"} {Math.abs(trend)}%
              </p>
            )}
          </div>
          <div className="opacity-20">{icons[icon]}</div>
        </div>
      </div>
      <div className="px-4 py-3 bg-gray-50 flex items-center justify-between">
        <span className="text-xs text-gray-600">Total Performance</span>
        {icons[icon]}
      </div>
    </div>
  );
}
