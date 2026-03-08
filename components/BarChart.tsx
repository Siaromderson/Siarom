"use client";

interface BarChartProps {
  data: Array<{ day: string; count: number }>;
  height?: number;
  /** Rótulo do valor no tooltip (ex: "lead" → "3 leads", "USD" → "$12.50") */
  valueLabel?: string;
  /** Formato do eixo X: "day" = dia/mês, "month" = mês/ano */
  xFormat?: "day" | "month";
}

export function BarChart({ data, height = 120, valueLabel = "lead", xFormat = "day" }: BarChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-gray-400 text-sm">
        Sem dados
      </div>
    );
  }

  const max = Math.max(...data.map((d) => d.count), 1);
  const sliceCount = xFormat === "month" ? 12 : 14;
  const displayData = data.slice(-sliceCount);

  const formatLabel = (day: string) => {
    if (xFormat === "month" && day.match(/^\d{4}-\d{2}$/)) {
      return new Date(day + "-01").toLocaleDateString("pt-BR", { month: "short", year: "numeric" });
    }
    const d = new Date(day + "T00:00:00");
    return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
  };

  return (
    <div className="w-full" style={{ height: height + 32 }}>
      <div className="flex items-end gap-1 h-full" style={{ height }}>
        {displayData.map((d) => {
          const pct = max > 0 ? (d.count / max) * 100 : 0;
          return (
            <div
              key={d.day}
              className="flex flex-col items-center flex-1 h-full justify-end gap-1 group cursor-default"
            >
              <div className="relative w-full flex flex-col items-center justify-end h-full">
                {/* Tooltip */}
                <div className="absolute -top-7 left-1/2 -translate-x-1/2 hidden group-hover:flex items-center justify-center bg-gray-900 text-white text-xs rounded px-2 py-0.5 whitespace-nowrap z-10 pointer-events-none">
                  {valueLabel === "USD" ? `$${Number(d.count).toFixed(2)}` : `${d.count} ${valueLabel}${d.count !== 1 ? "s" : ""}`}
                </div>
                {/* Bar */}
                <div
                  className="w-full rounded-t-md bg-indigo-500 transition-all duration-300 group-hover:bg-indigo-400 min-h-[2px]"
                  style={{ height: `${Math.max(pct, 2)}%` }}
                />
              </div>
              <span className="text-[9px] text-gray-400 whitespace-nowrap">
                {formatLabel(d.day)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
