import { useMemo, useEffect, useState, useRef } from 'react';
import { Users, Activity, HeartPulse, ShieldAlert, Zap, Database } from 'lucide-react';
import { motion } from 'framer-motion';
import type { DatasetInfo } from '@/lib/parseData';
import type { DataAnalysis } from '@/lib/analyzeData';

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
      label: 'Total Records',
      value: stats.totalPatients,
      suffix: '',
      icon: Users,
      color: 'text-red-500',
      bgClass: 'bg-red-50',
      iconBg: 'bg-red-500',
      hint: 'Based on current dataset',
    },
    ...(stats.avgRisk !== null ? [(() => {
      const displayRisk = stats.avgRisk <= 1 ? +(stats.avgRisk * 100).toFixed(1) : Math.round(stats.avgRisk);
      return {
        label: 'Avg Risk Score',
        value: displayRisk,
        suffix: '%',
        icon: ShieldAlert,
        color: 'text-emerald-500',
        bgClass: 'bg-emerald-50',
        iconBg: 'bg-emerald-500',
      };
    })()] : []),
    ...(stats.avgRecovery !== null ? [(() => {
      const displayRecovery = stats.avgRecovery < 1 ? +(stats.avgRecovery * 100).toFixed(1) : Math.round(stats.avgRecovery);
      return {
        label: 'Avg Recovery',
        value: displayRecovery,
        suffix: stats.avgRecovery < 1 ? '%' : 'd',
        icon: HeartPulse,
        color: 'text-blue-500',
        bgClass: 'bg-blue-50',
        iconBg: 'bg-blue-500',
      };
    })()] : []),
    ...(stats.avgSupport !== null ? [{
      label: 'Support Score',
      value: +(stats.avgSupport).toFixed(1),
      suffix: '/10',
      icon: Activity,
      color: 'text-violet-500',
      bgClass: 'bg-violet-50',
      iconBg: 'bg-violet-500',
    }] : []),
  ].slice(0, 4);

  const GENDER_COLORS = ['#2563eb', '#ec4899', '#f59e0b', '#14b8a6'];

  return (
    <div className="mb-8 space-y-6">
      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 px-1 relative z-10">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className="text-3xl md:text-4xl font-black text-slate-800 tracking-tight">
            {dashboardTitle}
          </h1>
          <p className="text-slate-500 font-medium mt-2 flex items-center gap-2 text-sm">
            Enterprise Analytics Suite • Real-time Population Overview
          </p>
        </motion.div>
        
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="hidden md:flex items-center gap-3">
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-600 border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Live Data
          </span>
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200">
            <Database className="w-3 h-3" />
            {dataset.name}
          </span>
        </motion.div>
      </div>

      {/* Hero KPI Cards — Clean white cards with colored icons (matching reference) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pb-2">
        {heroCards.map((card, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1, duration: 0.5 }}>
            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 group">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${card.iconBg} shadow-sm`}>
                  <card.icon className="h-5 w-5 text-white" strokeWidth={2.5} />
                </div>
              </div>
              <div className="space-y-1">
                <h3 className="text-[11px] font-bold text-slate-400 tracking-widest uppercase">{card.label}</h3>
                <div className={`text-3xl font-black tracking-tight ${card.color}`}>
                  <AnimatedCounter target={card.value} suffix={card.suffix} duration={1500} />
                </div>
                {(card as any).hint && (
                  <p className="text-[9px] text-slate-400 font-medium tracking-wide mt-1">{(card as any).hint}</p>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Bottom Row — Gender + Diagnosis Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Gender Distribution */}
        {stats.genderData.length > 0 && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 }}>
            <div className="bg-white rounded-2xl p-5 h-full border border-slate-100 shadow-sm">
              <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-5 flex items-center gap-2">
                <Users className="w-3.5 h-3.5 text-blue-500" /> Population Breakdown
              </h3>
              <div className="flex items-center gap-6">
                {stats.genderData.map((g, i) => (
                  <div key={i} className="flex-1">
                    <div className="flex items-end justify-between mb-2">
                      <span className="text-sm font-semibold text-slate-700">{g.name}</span>
                      <span className="text-sm font-bold" style={{ color: GENDER_COLORS[i] }}>{g.pct}%</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${g.pct}%` }}
                        transition={{ duration: 1.5, delay: 0.5 }}
                        className="h-full rounded-full"
                        style={{ background: GENDER_COLORS[i] }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Top Categories */}
        {stats.diagData.length > 0 && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5 }}>
            <div className="bg-white rounded-2xl p-5 h-full border border-slate-100 shadow-sm">
              <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-5 flex items-center gap-2">
                <Activity className="w-3.5 h-3.5 text-teal-500" /> 
                Top {stats.diagCol?.replace(/([A-Z])/g, ' $1').replace(/[_-]/g, ' ').trim() || 'Categories'}
              </h3>
              <div className="space-y-4">
                {stats.diagData.slice(0, 3).map((d, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="flex-1">
                      <div className="flex items-end justify-between mb-1.5">
                        <span className="text-xs font-semibold text-slate-700 truncate pr-2">{d.name}</span>
                        <span className="text-xs font-bold text-teal-600">{d.count.toLocaleString()}</span>
                      </div>
                      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${d.pct}%` }}
                          transition={{ duration: 1.5, delay: 0.6 }}
                          className="h-full rounded-full bg-gradient-to-r from-teal-400 to-cyan-500"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* High Risk Alert */}
      {stats.highRiskCount > 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
          <div className="flex items-center gap-4 p-4 bg-red-50 border border-red-200 rounded-2xl relative overflow-hidden group">
            <div className="w-10 h-10 rounded-xl bg-red-500 flex items-center justify-center flex-shrink-0 shadow-sm">
              <ShieldAlert className="h-5 w-5 text-white" strokeWidth={2.5} />
            </div>
            <span className="text-sm text-slate-700 relative z-10">
              <strong>{stats.highRiskCount}</strong> records flagged as <span className="text-red-600 font-bold">HIGH RISK</span> in current dataset view.
            </span>
          </div>
        </motion.div>
      )}
    </div>
  );
}
