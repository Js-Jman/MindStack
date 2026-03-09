import { WelcomeBanner } from "@/components/admin/WelcomeBanner";
import { StatsCard } from "@/components/admin/StatsCard";
import { RecentActivity } from "@/components/admin/RecentActivity";
import { Users, GraduationCap, DollarSign, MessageSquare } from "lucide-react";

export default function AdminDashboardPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-10">
      {/* This section now sits closer to the Navbar */}
      <WelcomeBanner />

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard 
          title="Total Students" 
          value="2,543" 
          icon={<Users className="text-purple-600" size={20} />}
          description="Enrolled this year"
        />
        <StatsCard 
          title="Instructors" 
          value="48" 
          icon={<GraduationCap className="text-blue-600" size={20} />}
          description="5 pending verification"
        />
        <StatsCard 
          title="Revenue" 
          value="$12,234" 
          icon={<DollarSign className="text-emerald-600" size={20} />}
          description="+12.5% from last month"
        />
        <StatsCard 
          title="Support" 
          value="14" 
          icon={<MessageSquare className="text-orange-500" size={20} />}
          description="Open tickets"
        />
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
        <div className="lg:col-span-2 bg-white/40 backdrop-blur-md p-6 rounded-[2rem] border border-white min-h-[400px]">
          <h3 className="text-xl font-bold text-slate-800 mb-6 px-2">Performance Analytics</h3>
          {/* Chart logic goes here */}
          <div className="h-full w-full flex items-center justify-center border-2 border-dashed border-slate-200 rounded-2xl text-slate-400">
            Chart Visualization Area
          </div>
        </div>
        
        <div className="lg:col-span-1">
          <RecentActivity />
        </div>
      </div>
    </div>
  );
}