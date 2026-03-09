interface SummaryPoint {
  label: string;
  value: number;
}

interface SummaryChartProps {
  title: string;
  subtitle?: string;
  data: SummaryPoint[];
}

export function SummaryChart({ title, subtitle, data }: SummaryChartProps) {
  const max = Math.max(...data.map((item) => item.value), 1);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 h-full">
      <div className="mb-4">
        <h4 className="text-sm font-semibold text-slate-800">{title}</h4>
        {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
      </div>

      <div className="h-[260px] flex items-end gap-3">
        {data.map((point) => {
          const heightPercent = Math.max((point.value / max) * 100, point.value > 0 ? 10 : 2);

          return (
            <div key={point.label} className="flex-1 flex flex-col items-center justify-end gap-2">
              <span className="text-[11px] font-semibold text-slate-700">{point.value}</span>
              <div className="w-full h-[210px] rounded-xl bg-slate-100 flex items-end p-1.5">
                <div
                  className="w-full rounded-lg bg-gradient-to-t from-indigo-600 to-cyan-500 transition-all duration-500"
                  style={{ height: `${heightPercent}%` }}
                />
              </div>
              <span className="text-[11px] font-medium text-slate-500">{point.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
