import { useMemo, useEffect, useState, useRef } from 'react';
import {
  Users, Clock, Heart, AlertTriangle, Stethoscope, UserCheck,
  TrendingUp, TrendingDown, Minus, BarChart3, Hash, DollarSign, Activity, Percent,
  ShoppingCart, Package, Star, Zap, Globe, Calendar, Sparkles,
} from 'lucide-react';
import type { DatasetInfo } from '@/lib/parseData';
import type { ColumnStats } from '@/lib/analyzeData';

interface Props {
  dataset: DatasetInfo;
  columnStats: ColumnStats[];
}

const ICON_MAP: Record<string, any> = {
  patient: Users, age: Clock, support: Heart, readmission: AlertTriangle,
  visit: Stethoscope, doctor: UserCheck, risk: AlertTriangle,
  recovery: TrendingUp, score: Activity, count: Hash,
  price: DollarSign, amount: DollarSign, rate: Percent, revenue: DollarSign,
  cost: DollarSign, sales: ShoppingCart, total: Hash, quantity: Package,
  rating: Star, vote: Star, energy: Zap, population: Globe, date: Calendar,
};

const GRADIENTS = [
  'from-indigo-500 to-blue-600',
  'from-cyan-500 to-teal-600',
  'from-emerald-500 to-green-600',
  'from-rose-500 to-pink-600',
  'from-violet-500 to-purple-600',
  'from-amber-500 to-orange-600',
  'from-sky-500 to-indigo-600',
  'from-fuchsia-500 to-rose-600',
];

function pickIcon(colName: string) {
  const lower = colName.toLowerCase();
  for (const [key, Icon] of Object.entries(ICON_MAP)) {
    if (lower.includes(key)) return Icon;
  }
  return BarChart3;
}

function formatVal(v: number): string {
  if (Math.abs(v) >= 1e9) return (v / 1e9).toFixed(1) + 'B';
  if (Math.abs(v) >= 1e6) return (v / 1e6).toFixed(1) + 'M';
  if (Math.abs(v) >= 1e3) return (v / 1e3).toFixed(1) + 'K';
  if (Number.isInteger(v)) return v.toLocaleString();
  return v.toFixed(2);
}

// Animated counter hook
function useAnimatedValue(target: number, duration: number = 700) {
  const [value, setValue] = useState(0);
  const prevTarget = useRef(0);

  useEffect(() => {
    const start = prevTarget.current;
    prevTarget.current = target;
    const startTime = performance.now();
    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(start + (target - start) * eased);
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [target, duration]);

  return value;
}

function AnimatedKPICard({ k, i }: { k: any; i: number }) {
  const animatedValue = useAnimatedValue(k.rawValue, 700);

  return (
    <div
      className="relative bg-white rounded-xl border border-slate-200/80 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 hover:border-indigo-200 animate-fade-up overflow-hidden group hover-glow"
      style={{ animationDelay: `${i * 80}ms` }}
    >
      {/* Top gradient accent with animation */}
      <div className={`h-1 bg-gradient-to-r ${k.gradient} animate-gradient`} />

      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider truncate pr-2 leading-tight">
            {k.label}
          </span>
          <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${k.gradient} flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-300`}>
            <k.Icon className="h-4 w-4 text-white" />
          </div>
        </div>

        <div className="flex items-baseline gap-1.5 mb-1">
          <span className="text-2xl font-extrabold text-slate-800 tracking-tight tabular-nums">
            {formatVal(animatedValue)}
          </span>
          <span className="text-[10px] text-slate-400 font-medium">avg</span>
          {/* Trend indicator */}
          {k.trend !== 0 && (
            <span className={`flex items-center gap-0.5 text-[9px] font-bold ml-1 ${
              k.trend > 0 ? 'text-emerald-600' : 'text-red-500'
            }`}>
              {k.trend > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 text-[9px] text-slate-400 mb-2">
          <span>Min: {k.min}</span>
          <span>•</span>
          <span>Max: {k.max}</span>
        </div>

        {/* Sparkline minibar */}
        <div className="flex items-end gap-[2px] h-5 mb-2">
          {k.sparkline.map((v: number, j: number) => (
            <div
              key={j}
              className={`flex-1 rounded-t bg-gradient-to-t ${k.gradient} opacity-40 group-hover:opacity-70 transition-all duration-500`}
              style={{
                height: `${v}%`,
                transitionDelay: `${j * 30}ms`,
              }}
            />
          ))}
        </div>

        {/* Progress bar */}
        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full bg-gradient-to-r ${k.gradient} transition-all duration-1000 ease-out`}
            style={{ width: `${k.progress}%` }}
          />
        </div>

        {/* AI insight badge */}
        {k.insight && (
          <div className="mt-2 flex items-center gap-1 text-[8px] text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded-full w-fit">
            <Sparkles className="h-2.5 w-2.5" />
            {k.insight}
          </div>
        )}
      </div>
    </div>
  );
}

export default function DynamicKPIs({ dataset, columnStats }: Props) {
  const kpis = useMemo(() => {
    return columnStats.slice(0, 6).map((s, i) => {
      const Icon = pickIcon(s.column);
      const progress = s.max > 0 ? Math.min(100, (s.mean / s.max) * 100) : 50;

      // Generate a simple sparkline from the data
      const colVals = dataset.data
        .map(r => Number(r[s.column]))
        .filter(v => !isNaN(v))
        .slice(0, 20);
      const sparkMax = Math.max(...colVals, 1);
      const sparkline = colVals.length > 0
        ? colVals.map(v => Math.max(5, (v / sparkMax) * 100))
        : Array(8).fill(50);

      // Determine trend
      const trend = s.skewness > 0.5 ? 1 : s.skewness < -0.5 ? -1 : 0;

      // AI insight badge
      let insight = '';
      if (s.outlierCount > 5) insight = `${s.outlierCount} outliers`;
      else if (Math.abs(s.skewness) > 1.5) insight = 'Skewed distribution';

      return {
        label: s.column.replace(/([A-Z])/g, ' $1').replace(/[_-]/g, ' ').trim(),
        value: formatVal(s.mean),
        rawValue: s.mean,
        total: formatVal(dataset.totalRows),
        Icon,
        gradient: GRADIENTS[i % GRADIENTS.length],
        progress,
        min: formatVal(s.min),
        max: formatVal(s.max),
        sparkline: sparkline.slice(0, 12),
        trend,
        insight,
      };
    });
  }, [columnStats, dataset]);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {kpis.map((k, i) => (
        <AnimatedKPICard key={i} k={k} i={i} />
      ))}
    </div>
  );
}

