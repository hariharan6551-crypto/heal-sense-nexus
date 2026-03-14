import { useEffect, useRef, useState } from "react";
import { Rows3, Columns3, AlertTriangle, Copy } from "lucide-react";
import type { DatasetInfo } from "@/lib/parseData";

interface KPICardsProps {
  dataset: DatasetInfo;
}

function AnimatedNumber({ value, duration = 1200 }: { value: number; duration?: number }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef<number | null>(null);

  useEffect(() => {
    const start = performance.now();
    const from = 0;
    const to = value;

    const animate = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setDisplay(Math.round(from + (to - from) * eased));
      if (progress < 1) {
        ref.current = requestAnimationFrame(animate);
      }
    };

    ref.current = requestAnimationFrame(animate);
    return () => {
      if (ref.current) cancelAnimationFrame(ref.current);
    };
  }, [value, duration]);

  return <>{display.toLocaleString()}</>;
}

const KPICards = ({ dataset }: KPICardsProps) => {
  const missingPct = dataset.totalRows > 0 && dataset.totalColumns > 0
    ? ((dataset.missingValueCount / (dataset.totalRows * dataset.totalColumns)) * 100)
    : 0;

  const kpis = [
    {
      label: "Total Rows",
      value: dataset.totalRows,
      icon: Rows3,
      gradient: "from-emerald-500 to-teal-600",
      bg: "bg-emerald-500/10",
      text: "text-emerald-600",
    },
    {
      label: "Total Columns",
      value: dataset.totalColumns,
      icon: Columns3,
      gradient: "from-blue-500 to-indigo-600",
      bg: "bg-blue-500/10",
      text: "text-blue-600",
    },
    {
      label: "Missing Values",
      value: dataset.missingValueCount,
      subtitle: `${missingPct.toFixed(1)}%`,
      icon: AlertTriangle,
      gradient: "from-amber-500 to-orange-600",
      bg: "bg-amber-500/10",
      text: "text-amber-600",
    },
    {
      label: "Duplicates",
      value: dataset.duplicateRowCount,
      icon: Copy,
      gradient: "from-rose-500 to-pink-600",
      bg: "bg-rose-500/10",
      text: "text-rose-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {kpis.map((kpi, i) => (
        <div
          key={kpi.label}
          className="group relative overflow-hidden rounded-xl border border-border bg-card p-5 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 animate-fade-up"
          style={{ animationDelay: `${i * 100}ms` }}
        >
          {/* Top gradient bar */}
          <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${kpi.gradient} opacity-80`} />

          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {kpi.label}
            </span>
            <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${kpi.bg} transition-transform group-hover:scale-110`}>
              <kpi.icon className={`h-4.5 w-4.5 ${kpi.text}`} />
            </div>
          </div>

          <p className="text-3xl font-bold text-foreground tracking-tight">
            <AnimatedNumber value={kpi.value} />
          </p>

          {kpi.subtitle && (
            <p className={`text-sm font-medium ${kpi.text} mt-1`}>{kpi.subtitle}</p>
          )}

          {/* Hover glow */}
          <div className={`absolute -bottom-4 -right-4 h-20 w-20 rounded-full bg-gradient-to-r ${kpi.gradient} opacity-0 group-hover:opacity-10 blur-xl transition-opacity duration-500`} />
        </div>
      ))}
    </div>
  );
};

export default KPICards;
