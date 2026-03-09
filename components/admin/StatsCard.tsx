interface StatsCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  description: string;
}

export const StatsCard = ({ title, value, icon, description }: StatsCardProps) => {
  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm transition-all hover:shadow-md">
      <div className="flex flex-row items-center justify-between space-y-0 pb-2">
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <div className="p-2 bg-slate-100 rounded-md">
          {icon}
        </div>
      </div>
      <div>
        <div className="text-2xl font-bold text-slate-900">{value}</div>
        <p className="text-xs text-slate-500 mt-1">{description}</p>
      </div>
    </div>
  );
};