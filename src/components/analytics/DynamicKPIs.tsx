import { useMemo, useEffect, useState, useRef } from 'react';
import {
  Users, Clock, Heart, AlertTriangle, Stethoscope, UserCheck,
  TrendingUp, TrendingDown, Minus, BarChart3, Hash, DollarSign, Activity, Percent,
  ShoppingCart, Package, Star, Zap, Globe, Calendar, Sparkles,
} from 'lucide-react';
import { motion } from 'framer-motion';
import type { DatasetInfo } from '@/lib/parseData';
import type { ColumnStats } from '@/lib/analyzeData';
import GlassCard from '@/components/core/GlassCard';
import ParallaxLayer from '@/components/core/ParallaxLayer';

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

/* Vibrant color palette: Red, Yellow, Blue, Green, Purple, Pink */
const VIBRANT_COLORS = [
  { gradient: 'linear-gradient(135deg, #EF4444, #F97316)', text: '#DC2626', bg: 'rgba(239,68,68,0.04)', border: 'rgba(239,68,68,0.1)', shadow: 'rgba(239,68,68,0.12)', fill: '#EF4444' },
  { gradient: 'linear-gradient(135deg, #3B82F6, #6366F1)', text: '#2563EB', bg: 'rgba(59,130,246,0.04)', border: 'rgba(59,130,246,0.1)', shadow: 'rgba(59,130,246,0.12)', fill: '#3B82F6' },
  { gradient: 'linear-gradient(135deg, #22C55E, #10B981)', text: '#16A34A', bg: 'rgba(34,197,94,0.04)', border: 'rgba(34,197,94,0.1)', shadow: 'rgba(34,197,94,0.12)', fill: '#22C55E' },
  { gradient: 'linear-gradient(135deg, #EAB308, #F59E0B)', text: '#CA8A04', bg: 'rgba(234,179,8,0.04)', border: 'rgba(234,179,8,0.1)', shadow: 'rgba(234,179,8,0.12)', fill: '#EAB308' },
  { gradient: 'linear-gradient(135deg, #8B5CF6, #A855F7)', text: '#7C3AED', bg: 'rgba(139,92,246,0.04)', border: 'rgba(139,92,246,0.1)', shadow: 'rgba(139,92,246,0.12)', fill: '#8B5CF6' },
  { gradient: 'linear-gradient(135deg, #EC4899, #F43F5E)', text: '#DB2777', bg: 'rgba(236,72,153,0.04)', border: 'rgba(236,72,153,0.1)', shadow: 'rgba(236,72,153,0.12)', fill: '#EC4899' },
];

function AnimatedKPICard({ k, i }: { k: any; i: number }) {
  const animatedValue = useAnimatedValue(k.rawValue, 1200);
  const color = VIBRANT_COLORS[i % VIBRANT_COLORS.length];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: i * 0.1, ease: 'easeOut' }}
      whileHover={{ y: -4 }}
    >
      <ParallaxLayer intensity={8}>
        <GlassCard
          className="p-5 flex flex-col justify-between h-[150px] relative overflow-hidden group"
          style={{
            border: `1px solid ${color.border}`,
            boxShadow: `0 2px 12px ${color.shadow}`,
          }}
          interactive={true}
        >
          {/* Corner accent gradient */}
          <div
            className="absolute top-0 right-0 w-20 h-20 rounded-bl-full opacity-20 group-hover:opacity-40 transition-opacity duration-500"
            style={{ background: color.gradient }}
          />

          <div className="flex items-start justify-between mb-3 relative z-10">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate pr-2">
              {k.label}
            </span>
            <motion.div
              whileHover={{ scale: 1.15, rotate: 5 }}
              className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{
                background: color.gradient,
                boxShadow: `0 4px 10px ${color.shadow}`,
              }}
            >
              <k.Icon className="h-4 w-4 text-white" strokeWidth={2.5} />
            </motion.div>
          </div>

          <div className="relative z-10">
            <div className="flex items-baseline gap-1.5 mb-2">
              <span className="text-3xl font-black tracking-tight tabular-nums" style={{ color: color.text }}>
                {formatVal(animatedValue)}
              </span>
            </div>

            <div className="flex items-center justify-between text-[10px] font-medium w-full">
              <span className="text-slate-400">Min: <span className="text-slate-600">{k.min}</span></span>
              <span className="text-slate-400">Max: <span className="text-slate-600">{k.max}</span></span>
            </div>
            
            {/* Animated Progress Bar */}
            <div className="w-full h-1.5 bg-slate-100 rounded-full mt-3 overflow-hidden">
              <motion.div 
                className="h-full rounded-full"
                style={{ background: color.gradient }}
                initial={{ width: 0 }}
                animate={{ width: `${k.progress}%` }}
                transition={{ duration: 1.5, delay: 0.5, ease: 'easeOut' }}
              />
            </div>
          </div>

          {/* AI insight badge */}
          {k.insight && (
            <div
              className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[9px] font-bold flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-20"
              style={{
                background: 'rgba(234,179,8,0.06)',
                border: '1px solid rgba(234,179,8,0.15)',
                color: '#CA8A04',
              }}
            >
              <Sparkles className="h-3 w-3" />
              {k.insight}
            </div>
          )}
        </GlassCard>
      </ParallaxLayer>
    </motion.div>
  );
}

export default function DynamicKPIs({ dataset, columnStats }: Props) {
  const kpis = useMemo(() => {
    return columnStats.slice(0, 6).map((s, i) => {
      const Icon = pickIcon(s.column);
      const progress = s.max > 0 ? Math.min(100, Math.max(5, (s.mean / s.max) * 100)) : 50;

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
