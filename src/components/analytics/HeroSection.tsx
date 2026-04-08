import { useMemo, useEffect, useState, useRef } from 'react';
import { Users, Activity, HeartPulse, ShieldAlert, Zap, Database, TrendingUp } from 'lucide-react';
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

/* Vibrant color palette for KPI cards */
const CARD_STYLES = [
  {
    gradient: 'linear-gradient(135deg, #EF4444, #F97316)',
    iconBg: '#EF4444',
    textColor: '#DC2626',
    lightBg: 'rgba(239,68,68,0.04)',
    borderColor: 'rgba(239,68,68,0.1)',
    shadowColor: 'rgba(239,68,68,0.12)',
    progressColor: '#EF4444',
  },
  {
    gradient: 'linear-gradient(135deg, #22C55E, #10B981)',
    iconBg: '#22C55E',
    textColor: '#16A34A',
    lightBg: 'rgba(34,197,94,0.04)',
    borderColor: 'rgba(34,197,94,0.1)',
    shadowColor: 'rgba(34,197,94,0.12)',
    progressColor: '#22C55E',
  },
  {
    gradient: 'linear-gradient(135deg, #3B82F6, #6366F1)',
    iconBg: '#3B82F6',
    textColor: '#2563EB',
    lightBg: 'rgba(59,130,246,0.04)',
    borderColor: 'rgba(59,130,246,0.1)',
    shadowColor: 'rgba(59,130,246,0.12)',
    progressColor: '#3B82F6',
  },
  {
    gradient: 'linear-gradient(135deg, #EAB308, #F59E0B)',
    iconBg: '#EAB308',
    textColor: '#CA8A04',
    lightBg: 'rgba(234,179,8,0.04)',
    borderColor: 'rgba(234,179,8,0.1)',
    shadowColor: 'rgba(234,179,8,0.12)',
    progressColor: '#EAB308',
  },
];

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
      hint: 'Based on current dataset',
    },
    ...(stats.avgRisk !== null ? [(() => {
      const displayRisk = stats.avgRisk <= 1 ? +(stats.avgRisk * 100).toFixed(1) : Math.round(stats.avgRisk);
      return {
        label: 'Avg Risk Score',
        value: displayRisk,
        suffix: '%',
        icon: ShieldAlert,
      };
    })()] : []),
    ...(stats.avgRecovery !== null ? [(() => {
      const displayRecovery = stats.avgRecovery < 1 ? +(stats.avgRecovery * 100).toFixed(1) : Math.round(stats.avgRecovery);
      return {
        label: 'Avg Recovery',
        value: displayRecovery,
        suffix: stats.avgRecovery < 1 ? '%' : 'd',
        icon: HeartPulse,
      };
    })()] : []),
    ...(stats.avgSupport !== null ? [{
      label: 'Support Score',
      value: +(stats.avgSupport).toFixed(1),
      suffix: '/10',
      icon: Activity,
    }] : []),
  ].slice(0, 4);

  const GENDER_COLORS = ['#3B82F6', '#EF4444', '#EAB308', '#22C55E'];
  const CATEGORY_GRADIENT = 'linear-gradient(90deg, #3B82F6, #22C55E)';

  return (
    <div className="mb-8 space-y-6">
      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 px-1 relative z-10">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className="text-3xl md:text-4xl font-black text-slate-800 tracking-tight">
            {dashboardTitle}
          </h1>
          <p className="text-slate-400 font-medium mt-2 flex items-center gap-2 text-sm">
            Enterprise Analytics Suite • Real-time Population Overview
          </p>
        </motion.div>
        
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="hidden md:flex items-center gap-3">
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold"
            style={{ background: 'rgba(34,197,94,0.06)', color: '#16a34a', border: '1px solid rgba(34,197,94,0.15)' }}
          >
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#22C55E', boxShadow: '0 0 6px rgba(34,197,94,0.4)' }} />
            Live Data
          </span>
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold"
            style={{ background: 'rgba(59,130,246,0.05)', color: '#2563eb', border: '1px solid rgba(59,130,246,0.12)' }}
          >
            <Database className="w-3 h-3" />
            {dataset.name}
          </span>
        </motion.div>
      </div>

      {/* Hero KPI Cards — Vibrant colored icons */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pb-2">
        {heroCards.map((card, i) => {
          const style = CARD_STYLES[i % CARD_STYLES.length];
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              whileHover={{ y: -4, boxShadow: `0 12px 40px ${style.shadowColor}` }}
            >
              <div
                className="rounded-2xl p-5 transition-all duration-300 group relative overflow-hidden"
                style={{
                  background: '#fff',
                  border: `1px solid ${style.borderColor}`,
                  boxShadow: `0 2px 12px ${style.shadowColor}`,
                }}
              >
                {/* Subtle gradient accent in corner */}
                <div
                  className="absolute top-0 right-0 w-24 h-24 rounded-bl-full opacity-30 group-hover:opacity-50 transition-opacity"
                  style={{ background: style.gradient }}
                />

                <div className="flex items-start justify-between mb-4 relative z-10">
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm"
                    style={{ background: style.gradient, boxShadow: `0 4px 12px ${style.shadowColor}` }}
                  >
                    <card.icon className="h-5 w-5 text-white" strokeWidth={2.5} />
                  </motion.div>
                </div>
                <div className="space-y-1 relative z-10">
                  <h3 className="text-[11px] font-bold text-slate-400 tracking-widest uppercase">{card.label}</h3>
                  <div className="text-3xl font-black tracking-tight" style={{ color: style.textColor }}>
                    <AnimatedCounter target={card.value} suffix={card.suffix} duration={1500} />
                  </div>
                  {(card as any).hint && (
                    <p className="text-[9px] text-slate-400 font-medium tracking-wide mt-1">{(card as any).hint}</p>
                  )}
                </div>

                {/* Animated bottom progress bar */}
                <motion.div
                  className="absolute bottom-0 left-0 h-[3px]"
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 2, delay: i * 0.2, ease: 'easeOut' }}
                  style={{ background: style.gradient, borderRadius: '0 0 16px 16px' }}
                />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Bottom Row — Gender + Diagnosis Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Gender Distribution */}
        {stats.genderData.length > 0 && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 }}>
            <div className="bg-white rounded-2xl p-5 h-full shadow-sm hover:shadow-md transition-shadow duration-300"
              style={{ border: '1px solid rgba(0,0,0,0.04)' }}
            >
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
            <div className="bg-white rounded-2xl p-5 h-full shadow-sm hover:shadow-md transition-shadow duration-300"
              style={{ border: '1px solid rgba(0,0,0,0.04)' }}
            >
              <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-5 flex items-center gap-2">
                <TrendingUp className="w-3.5 h-3.5 text-green-500" /> 
                Top {stats.diagCol?.replace(/([A-Z])/g, ' $1').replace(/[_-]/g, ' ').trim() || 'Categories'}
              </h3>
              <div className="space-y-4">
                {stats.diagData.slice(0, 3).map((d, i) => {
                  const barColors = ['#3B82F6', '#22C55E', '#EAB308'];
                  return (
                    <div key={i} className="flex items-center gap-3">
                      <div className="flex-1">
                        <div className="flex items-end justify-between mb-1.5">
                          <span className="text-xs font-semibold text-slate-700 truncate pr-2">{d.name}</span>
                          <span className="text-xs font-bold" style={{ color: barColors[i] }}>{d.count.toLocaleString()}</span>
                        </div>
                        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${d.pct}%` }}
                            transition={{ duration: 1.5, delay: 0.6 }}
                            className="h-full rounded-full"
                            style={{ background: barColors[i] }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* High Risk Alert — Vibrant Red */}
      {stats.highRiskCount > 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
          <div
            className="flex items-center gap-4 p-4 rounded-2xl relative overflow-hidden group"
            style={{
              background: 'rgba(239,68,68,0.04)',
              border: '1px solid rgba(239,68,68,0.12)',
            }}
          >
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{
                background: 'linear-gradient(135deg, #EF4444, #F97316)',
                boxShadow: '0 4px 12px rgba(239,68,68,0.25)',
              }}
            >
              <ShieldAlert className="h-5 w-5 text-white" strokeWidth={2.5} />
            </motion.div>
            <span className="text-sm text-slate-700 relative z-10">
              <strong>{stats.highRiskCount}</strong> records flagged as <span className="font-bold" style={{ color: '#EF4444' }}>HIGH RISK</span> in current dataset view.
            </span>
          </div>
        </motion.div>
      )}
    </div>
  );
}
