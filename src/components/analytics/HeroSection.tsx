import { useMemo, useEffect, useState, useRef } from 'react';
import { Users, Activity, HeartPulse, ShieldAlert, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import type { DatasetInfo } from '@/lib/parseData';
import type { DataAnalysis } from '@/lib/analyzeData';
import { GlassCard } from '../ui/GlassCard';
import { GlowBadge } from '../ui/GlowBadge';

interface Props {
  dataset: DatasetInfo;
  analysis: DataAnalysis;
  dashboardTitle: string;
}

function AnimatedCounter({ target, duration = 1200, suffix = '', prefix = '' }: {
  target: number; duration?: number; suffix?: string; prefix?: string;
}) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const prevTarget = useRef(0);

  useEffect(() => {
    const startValue = prevTarget.current;
    prevTarget.current = target;
    const startTime = performance.now();
    let animationId: number;
    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(startValue + (target - startValue) * eased));
      if (progress < 1) {
        animationId = requestAnimationFrame(animate);
      }
    };
    animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, [target, duration]);

  return (
    <span ref={ref}>
      {prefix}{count.toLocaleString()}{suffix}
    </span>
  );
}

export default function HeroSection({ dataset, analysis, dashboardTitle }: Props) {
  const stats = useMemo(() => {
    const totalPatients = dataset.totalRows;
    const numCols = dataset.numericColumns;

    const findCol = (keywords: string[]) =>
      numCols.find(c => keywords.some(k => c.toLowerCase().includes(k)));

    const riskCol = findCol(['risk', 'readmission']);
    const recoveryCol = findCol(['recovery', 'los', 'stay', 'length']);
    const supportCol = findCol(['support', 'score', 'satisfaction']);

    const avgVal = (col: string | undefined) => {
      if (!col) return null;
      const s = analysis.columnStats.find(st => st.column === col);
      return s ? s.mean : null;
    };

    const avgRisk = avgVal(riskCol);
    const avgRecovery = avgVal(recoveryCol);
    const avgSupport = avgVal(supportCol);

    const genderCol = dataset.categoricalColumns.find(c =>
      c.toLowerCase().includes('gender') || c.toLowerCase().includes('sex')
    );
    let genderData: { name: string; count: number; pct: number }[] = [];
    if (genderCol) {
      const counts: Record<string, number> = {};
      for (const r of dataset.data) {
        const v = String(r[genderCol] ?? '');
        counts[v] = (counts[v] || 0) + 1;
      }
      genderData = Object.entries(counts)
        .map(([name, count]) => ({ name, count, pct: Math.round((count / totalPatients) * 100) }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 4);
    }

    const diagCol = dataset.categoricalColumns.find(c =>
      c.toLowerCase().includes('diagnos') || c.toLowerCase().includes('category') || c.toLowerCase().includes('type')
    ) || dataset.categoricalColumns[0];
    let diagData: { name: string; count: number; pct: number }[] = [];
    if (diagCol) {
      const counts: Record<string, number> = {};
      for (const r of dataset.data) {
        const v = String(r[diagCol] ?? '');
        counts[v] = (counts[v] || 0) + 1;
      }
      diagData = Object.entries(counts)
        .map(([name, count]) => ({ name, count, pct: Math.round((count / totalPatients) * 100) }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);
    }

    let highRiskCount = 0;
    if (riskCol) {
      highRiskCount = dataset.data.filter(r => Number(r[riskCol]) > 70).length;
    }

    return {
      totalPatients, avgRisk, avgRecovery, avgSupport,
      genderData, diagData, highRiskCount,
      riskCol, recoveryCol, supportCol, diagCol,
    };
  }, [dataset, analysis]);

  const heroCards = [
    {
      label: 'Dataset Volume',
      value: stats.totalPatients,
      suffix: '',
      icon: Users,
      glow: 'blue',
      color: 'text-blue-400',
      bgClass: 'bg-blue-500/10 border-blue-500/30',
      hint: 'Based on current dataset',
    },
    ...(stats.avgRisk !== null ? [(() => {
      const displayRisk = stats.avgRisk <= 1 ? +(stats.avgRisk * 100).toFixed(1) : Math.round(stats.avgRisk);
      const isHigh = displayRisk > 50;
      return {
        label: 'Prediction Risk',
        value: displayRisk,
        suffix: '%',
        icon: ShieldAlert,
        glow: isHigh ? 'pink' : 'teal',
        color: isHigh ? 'text-pink-400' : 'text-teal-400',
        bgClass: isHigh ? 'bg-pink-500/10 border-pink-500/30' : 'bg-teal-500/10 border-teal-500/30',
      };
    })()] : []),
    ...(stats.avgRecovery !== null ? [(() => {
      const displayRecovery = stats.avgRecovery < 1 ? +(stats.avgRecovery * 100).toFixed(1) : Math.round(stats.avgRecovery);
      return {
        label: 'Est. Recovery Time',
        value: displayRecovery,
        suffix: stats.avgRecovery < 1 ? '%' : 'd',
        icon: HeartPulse,
        glow: 'violet',
        color: 'text-violet-400',
        bgClass: 'bg-violet-500/10 border-violet-500/30',
      };
    })()] : []),
    ...(stats.avgSupport !== null ? [{
      label: 'Efficacy Score',
      value: +(stats.avgSupport).toFixed(1),
      suffix: '/10',
      icon: Activity,
      glow: 'teal',
      color: 'text-teal-400',
      bgClass: 'bg-teal-500/10 border-teal-500/30',
    }] : []),
  ].slice(0, 4);

  return (
    <div className="mb-8 space-y-6">
      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 px-2 relative z-10">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-200 to-indigo-300 tracking-tight drop-shadow-[0_2px_10px_rgba(255,255,255,0.2)]">
            {dashboardTitle}
          </h1>
          <p className="text-blue-300/70 font-medium mt-2 flex items-center gap-2">
            <Zap className="h-4 w-4 text-cyan-400 animate-pulse" />
            ADVANCED OS • Real-Time Data Pipeline Active
          </p>
        </motion.div>
        
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="hidden md:flex items-center gap-3">
          <GlowBadge color="emerald" pulse>
            SYSTEM ONLINE
          </GlowBadge>
        </motion.div>
      </div>

      {/* Hero KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pb-2">
        {heroCards.map((card, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <GlassCard glowColor={card.glow as any} interactive className="p-5 overflow-visible group">
              <div className="flex items-start justify-between mb-4 relative z-10">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center border shadow-[0_0_15px_currentColor] transition-transform duration-300 group-hover:scale-110 ${card.bgClass} ${card.color}`}>
                  <card.icon className="h-5 w-5 drop-shadow-[0_0_5px_currentColor]" strokeWidth={2.5} />
                </div>
              </div>
              <div className="space-y-1 relative z-10">
                <h3 className="text-[11px] font-bold text-slate-400 tracking-widest uppercase">{card.label}</h3>
                <div className={`text-4xl font-black tracking-tighter drop-shadow-[0_0_12px_currentColor] ${card.color}`}>
                  <AnimatedCounter target={card.value} suffix={card.suffix} duration={1500} />
                </div>
                {(card as any).hint && (
                  <p className="text-[9px] text-slate-500 font-medium tracking-wide mt-1">{(card as any).hint}</p>
                )}
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      {/* Bottom Row — Gender + Diagnosis Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Gender Distribution */}
        {stats.genderData.length > 0 && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 }}>
            <GlassCard className="p-5 h-full">
              <h3 className="text-[11px] font-bold text-blue-300/70 uppercase tracking-widest mb-5 flex items-center gap-2">
                <Users className="w-3.5 h-3.5" /> Segmentation Metrics
              </h3>
              <div className="flex items-center gap-6">
                {stats.genderData.map((g, i) => (
                  <div key={i} className="flex-1">
                    <div className="flex items-end justify-between mb-2">
                      <span className="text-sm font-semibold text-slate-300">{g.name}</span>
                      <span className={`text-sm font-bold ${i === 0 ? 'text-blue-400' : 'text-violet-400'} drop-shadow-[0_0_5px_currentColor]`}>{g.pct}%</span>
                    </div>
                    <div className="h-1.5 bg-[rgba(255,255,255,0.05)] rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${g.pct}%` }}
                        transition={{ duration: 1.5, delay: 0.5 }}
                        className={`h-full rounded-full shadow-[0_0_10px_currentColor] ${i === 0 ? 'bg-blue-500' : 'bg-violet-500'}`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>
          </motion.div>
        )}

        {/* Top Categories */}
        {stats.diagData.length > 0 && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5 }}>
            <GlassCard className="p-5 h-full">
              <h3 className="text-[11px] font-bold text-blue-300/70 uppercase tracking-widest mb-5 flex items-center gap-2">
                <Activity className="w-3.5 h-3.5" /> 
                Dominant {stats.diagCol?.replace(/([A-Z])/g, ' $1').replace(/[_-]/g, ' ').trim() || 'Categories'}
              </h3>
              <div className="space-y-4">
                {stats.diagData.slice(0, 3).map((d, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="flex-1">
                      <div className="flex items-end justify-between mb-1.5">
                        <span className="text-xs font-semibold text-slate-300 truncate pr-2">{d.name}</span>
                        <span className="text-xs font-bold text-teal-400 drop-shadow-[0_0_3px_currentColor]">{d.count}</span>
                      </div>
                      <div className="h-1 bg-[rgba(255,255,255,0.05)] rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${d.pct}%` }}
                          transition={{ duration: 1.5, delay: 0.6 }}
                          className="h-full rounded-full bg-teal-400 shadow-[0_0_8px_currentColor]"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>
          </motion.div>
        )}
      </div>

      {/* High Risk Alert */}
      {stats.highRiskCount > 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
          <div className="flex items-center gap-4 p-4 bg-pink-500/10 border border-pink-500/30 rounded-2xl shadow-[0_0_20px_rgba(236,72,153,0.15)] relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-pink-500/10 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite]" />
            <div className="w-10 h-10 rounded-xl bg-pink-500/20 flex items-center justify-center flex-shrink-0 border border-pink-500/40">
              <ShieldAlert className="h-5 w-5 text-pink-400 drop-shadow-[0_0_8px_currentColor]" strokeWidth={2.5} />
            </div>
            <span className="text-sm text-slate-300 relative z-10">
              <strong>{stats.highRiskCount}</strong> records flagged as <span className="text-pink-400 font-bold drop-shadow-[0_0_5px_currentColor]">CRITICAL ANOMALY</span> in current dataset view.
            </span>
          </div>
        </motion.div>
      )}
    </div>
  );
}
