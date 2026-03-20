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

  // Apple Color Palette for KPI Icons
  const APPLE_COLORS = [
    { bg: 'bg-[#FF2D55]', text: 'text-[#FF2D55]', shadow: 'shadow-[#FF2D55]/30' }, // Pink
    { bg: 'bg-[#007AFF]', text: 'text-[#007AFF]', shadow: 'shadow-[#007AFF]/30' }, // Blue
    { bg: 'bg-[#34C759]', text: 'text-[#34C759]', shadow: 'shadow-[#34C759]/30' }, // Green
    { bg: 'bg-[#FF9500]', text: 'text-[#FF9500]', shadow: 'shadow-[#FF9500]/30' }, // Orange
    { bg: 'bg-[#AF52DE]', text: 'text-[#AF52DE]', shadow: 'shadow-[#AF52DE]/30' }, // Purple
    { bg: 'bg-[#FF3B30]', text: 'text-[#FF3B30]', shadow: 'shadow-[#FF3B30]/30' }, // Red
  ];
  const color = APPLE_COLORS[i % APPLE_COLORS.length];

  return (
    <div
      className="apple-card p-4 relative group animate-fade-up flex flex-col justify-between"
      style={{ animationDelay: `${i * 80}ms`, minHeight: '140px' }}
    >
      <div className="flex items-start justify-between mb-3">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest truncate pr-2">
          {k.label}
        </span>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${color.bg} shadow-md ${color.shadow} group-hover:scale-110 transition-transform duration-300`}>
          <k.Icon className="h-4 w-4" strokeWidth={2.5} />
        </div>
      </div>

      <div>
        <div className="flex items-baseline gap-1.5 mb-1">
          <span className="text-3xl font-black text-slate-900 tracking-tight tabular-nums">
            {formatVal(animatedValue)}
          </span>
          <span className="text-[10px] text-slate-400 font-semibold uppercase">avg</span>
        </div>

        <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium w-full">
          <span>Min: {k.min}</span>
          <span>Max: {k.max}</span>
        </div>
      </div>

      {/* AI insight badge - Apple Style Pill */}
      {k.insight && (
        <div className="absolute -top-2 -right-2 bg-white border border-slate-100 shadow-sm text-slate-600 px-2 py-0.5 rounded-full text-[9px] font-bold flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
          <Sparkles className="h-3 w-3 text-[#FF9500]" />
          {k.insight}
        </div>
      )}
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

