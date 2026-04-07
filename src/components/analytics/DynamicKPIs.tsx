import { useMemo, useEffect, useState, useRef } from 'react';
import {
  Users, Clock, Heart, AlertTriangle, Stethoscope, UserCheck,
  TrendingUp, TrendingDown, Minus, BarChart3, Hash, DollarSign, Activity, Percent,
  ShoppingCart, Package, Star, Zap, Globe, Calendar, Sparkles,
} from 'lucide-react';
import { motion } from 'framer-motion';
import type { DatasetInfo } from '@/lib/parseData';
import type { ColumnStats } from '@/lib/analyzeData';
import { GlassCard } from '../ui/GlassCard';

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
  const animatedValue = useAnimatedValue(k.rawValue, 1200);

  // Cinematic Neon Colors
  const NEON_COLORS = [
    { text: 'text-blue-400', glow: 'blue', border: 'border-blue-500/30', bg: 'bg-blue-500/10' },
    { text: 'text-violet-400', glow: 'violet', border: 'border-violet-500/30', bg: 'bg-violet-500/10' },
    { text: 'text-teal-400', glow: 'teal', border: 'border-teal-500/30', bg: 'bg-teal-500/10' },
    { text: 'text-pink-400', glow: 'pink', border: 'border-pink-500/30', bg: 'bg-pink-500/10' },
    { text: 'text-amber-400', glow: 'none', border: 'border-amber-500/30', bg: 'bg-amber-500/10' },
    { text: 'text-emerald-400', glow: 'none', border: 'border-emerald-500/30', bg: 'bg-emerald-500/10' },
  ];
  const color = NEON_COLORS[i % NEON_COLORS.length];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: i * 0.1, ease: 'easeOut' }}
    >
      <GlassCard 
        glowColor={color.glow as 'blue'|'violet'|'teal'|'pink'|'none'} 
        interactive 
        className="p-5 flex flex-col justify-between h-[150px] relative overflow-hidden group"
      >
        {/* Decorative Grid Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none opacity-20" />
        
        <div className="flex items-start justify-between mb-3 relative z-10">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate pr-2">
            {k.label}
          </span>
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center border ${color.border} ${color.bg} ${color.text} shadow-[0_0_15px_currentColor] group-hover:scale-110 transition-all duration-300`}>
            <k.Icon className="h-4 w-4" strokeWidth={2.5} />
          </div>
        </div>

        <div className="relative z-10">
          <div className="flex items-baseline gap-1.5 mb-2">
            <span className={`text-3xl font-black ${color.text} tracking-tight tabular-nums drop-shadow-[0_0_10px_currentColor]`}>
              {formatVal(animatedValue)}
            </span>
          </div>

          <div className="flex items-center justify-between text-[10px] font-medium w-full">
            <span className="text-slate-500">Min: <span className="text-slate-300">{k.min}</span></span>
            <span className="text-slate-500">Max: <span className="text-slate-300">{k.max}</span></span>
          </div>
          
          {/* Animated Progress Bar */}
          <div className="w-full h-1 bg-[rgba(255,255,255,0.05)] rounded-full mt-3 overflow-hidden">
            <motion.div 
              className={`h-full ${color.bg.replace('/10', '/80')} shadow-[0_0_8px_currentColor]`}
              initial={{ width: 0 }}
              animate={{ width: `${k.progress}%` }}
              transition={{ duration: 1.5, delay: 0.5, ease: 'easeOut' }}
            />
          </div>
        </div>

        {/* AI insight badge - Jarvis Style Pill */}
        {k.insight && (
          <div className="absolute top-2 right-2 border border-amber-500/30 bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded-full text-[9px] font-bold flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-20 backdrop-blur-md shadow-[0_0_10px_rgba(245,158,11,0.2)]">
            <Sparkles className="h-3 w-3" />
            {k.insight}
          </div>
        )}
      </GlassCard>
    </motion.div>
  );
}

export default function DynamicKPIs({ dataset, columnStats }: Props) {
  const kpis = useMemo(() => {
    return columnStats.slice(0, 6).map((s, i) => {
      const Icon = pickIcon(s.column);
      const progress = s.max > 0 ? Math.min(100, Math.max(5, (s.mean / s.max) * 100)) : 50;

      // AI insight badge
      let insight = '';
      if (s.outlierCount > 5) insight = `${s.outlierCount} anomalies`;
      else if (Math.abs(s.skewness) > 1.5) insight = 'Irregular pattern';

      return {
        label: s.column.replace(/([A-Z])/g, ' $1').replace(/[_-]/g, ' ').trim(),
        value: formatVal(s.mean),
        rawValue: s.mean,
        total: formatVal(dataset.totalRows),
        Icon,
        progress,
        min: formatVal(s.min),
        max: formatVal(s.max),
        insight,
      };
    });
  }, [columnStats, dataset]);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-4 page-transition">
      {kpis.map((k, i) => (
        <AnimatedKPICard key={i} k={k} i={i} />
      ))}
    </div>
  );
}

