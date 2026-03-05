interface StatsCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  icon: React.ReactNode;
  color: "indigo" | "emerald" | "amber" | "sky" | "violet" | "rose" | "blue";
  trend?: { value: number; label: string };
}

const colorMap = {
  indigo: {
    bg: "bg-indigo-50",
    icon: "bg-indigo-600",
    text: "text-indigo-700",
    value: "text-indigo-900",
    border: "border-indigo-100",
  },
  emerald: {
    bg: "bg-emerald-50",
    icon: "bg-emerald-600",
    text: "text-emerald-700",
    value: "text-emerald-900",
    border: "border-emerald-100",
  },
  amber: {
    bg: "bg-amber-50",
    icon: "bg-amber-500",
    text: "text-amber-700",
    value: "text-amber-900",
    border: "border-amber-100",
  },
  sky: {
    bg: "bg-sky-50",
    icon: "bg-sky-600",
    text: "text-sky-700",
    value: "text-sky-900",
    border: "border-sky-100",
  },
  violet: {
    bg: "bg-violet-50",
    icon: "bg-violet-600",
    text: "text-violet-700",
    value: "text-violet-900",
    border: "border-violet-100",
  },
  rose: {
    bg: "bg-rose-50",
    icon: "bg-rose-600",
    text: "text-rose-700",
    value: "text-rose-900",
    border: "border-rose-100",
  },
  blue: {
    bg: "bg-blue-50",
    icon: "bg-blue-600",
    text: "text-blue-700",
    value: "text-blue-900",
    border: "border-blue-100",
  },
};

export function StatsCard({ title, value, subtitle, icon, color, trend }: StatsCardProps) {
  const c = colorMap[color];
  return (
    <div className={`rounded-2xl border ${c.border} ${c.bg} p-5 flex flex-col gap-3`}>
      <div className="flex items-start justify-between">
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${c.icon} text-white shadow-sm`}>
          {icon}
        </div>
        {trend && (
          <span
            className={`text-xs font-medium px-2 py-0.5 rounded-full ${
              trend.value >= 0
                ? "bg-emerald-100 text-emerald-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {trend.value >= 0 ? "+" : ""}
            {trend.value}% {trend.label}
          </span>
        )}
      </div>
      <div>
        <p className={`text-3xl font-bold ${c.value} leading-none`}>{value}</p>
        <p className={`mt-1 text-sm font-medium ${c.text}`}>{title}</p>
        {subtitle && <p className="mt-0.5 text-xs text-gray-500">{subtitle}</p>}
      </div>
    </div>
  );
}
