import { useMemo, useEffect, useState, useRef } from 'react';
import { Users, Activity, HeartPulse, ShieldAlert } from 'lucide-react';
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
      label: 'Total Patients',
      value: stats.totalPatients,
      suffix: '',
      icon: Users,
      color: 'bg-[#FF2D55] text-white',
      shadowColor: 'rgba(255, 45, 85, 0.3)',
      textColor: 'text-slate-900',
    },
    ...(stats.avgRisk !== null ? [(() => {
      // Auto-detect decimal rates (0-1 range) vs percentage (0-100 range)
      const displayRisk = stats.avgRisk <= 1 ? +(stats.avgRisk * 100).toFixed(1) : Math.round(stats.avgRisk);
      return {
        label: 'Avg Risk Score',
        value: displayRisk,
        suffix: '%',
        icon: ShieldAlert,
        color: displayRisk > 50 ? 'bg-[#FF3B30] text-white' : 'bg-[#34C759] text-white',
        shadowColor: displayRisk > 50 ? 'rgba(255, 59, 48, 0.3)' : 'rgba(52, 199, 89, 0.3)',
        textColor: displayRisk > 50 ? 'text-[#FF3B30]' : 'text-[#34C759]',
      };
    })()] : []),
    ...(stats.avgRecovery !== null ? [(() => {
      const displayRecovery = stats.avgRecovery < 1 ? +(stats.avgRecovery * 100).toFixed(1) : Math.round(stats.avgRecovery);
      return {
        label: 'Avg Recovery',
        value: displayRecovery,
        suffix: stats.avgRecovery < 1 ? '%' : 'd',
        icon: HeartPulse,
        color: 'bg-[#007AFF] text-white',
        shadowColor: 'rgba(0, 122, 255, 0.3)',
        textColor: 'text-slate-900',
      };
    })()] : []),
    ...(stats.avgSupport !== null ? [{
      label: 'Support Score',
      value: +(stats.avgSupport).toFixed(1),
      suffix: '/10',
      icon: Activity,
      color: 'bg-[#AF52DE] text-white',
      shadowColor: 'rgba(175, 82, 222, 0.3)',
      textColor: 'text-slate-900',
    }] : []),
  ].slice(0, 4);

  return (
    <div className="mb-6 space-y-4">
      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 px-2">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight animate-fade-up">
            {dashboardTitle}
          </h1>
          <p className="text-slate-500 font-medium mt-1">
            Enterprise AI Analytics Suite • Real-time Population Overview
          </p>
        </div>
        <div className="hidden md:flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-slate-200 shadow-sm text-xs font-semibold text-slate-700">
            <div className="w-2 h-2 rounded-full bg-[#34C759] animate-pulse" />
            Live Data
          </div>
          <div className="px-3 py-1.5 rounded-full bg-white border border-slate-200 shadow-sm text-xs font-semibold text-slate-700">
            📊 {dataset.fileName}
          </div>
        </div>
      </div>

      {/* Hero KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {heroCards.map((card, i) => (
          <div
            key={i}
            className="apple-card p-5 animate-fade-up"
            style={{ animationDelay: `${i * 100}ms` }}
          >
            <div className="flex items-start justify-between mb-4">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${card.color}`}
                style={{ boxShadow: `0 4px 12px ${card.shadowColor}` }}
              >
                <card.icon className="h-5 w-5" strokeWidth={2.5} />
              </div>
            </div>
            <div className="space-y-1">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">{card.label}</h3>
              <div className={`text-4xl font-black tracking-tighter ${card.textColor}`}>
                <AnimatedCounter target={card.value} suffix={card.suffix} duration={1200} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Row — Gender + Diagnosis Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Gender Distribution */}
        {stats.genderData.length > 0 && (
          <div className="apple-card p-5 animate-fade-up" style={{ animationDelay: '400ms' }}>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Population Breakdown</h3>
            <div className="flex items-center gap-4">
              {stats.genderData.map((g, i) => (
                <div key={i} className="flex-1">
                  <div className="flex items-end justify-between mb-1.5">
                    <span className="text-sm font-semibold text-slate-700">{g.name}</span>
                    <span className="text-sm font-bold text-slate-900">{g.pct}%</span>
                  </div>
                  <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-1000"
                      style={{ 
                        width: `${g.pct}%`,
                        backgroundColor: i === 0 ? '#5856D6' : '#FF2D55' 
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Top Categories */}
        {stats.diagData.length > 0 && (
          <div className="apple-card p-5 animate-fade-up" style={{ animationDelay: '500ms' }}>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
              Top {stats.diagCol?.replace(/([A-Z])/g, ' $1').replace(/[_-]/g, ' ').trim() || 'Categories'}
            </h3>
            <div className="space-y-3">
              {stats.diagData.slice(0, 3).map((d, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="flex items-end justify-between mb-1">
                      <span className="text-sm font-semibold text-slate-700 truncate pr-2">{d.name}</span>
                      <span className="text-sm font-bold text-slate-900">{d.count}</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-1000 bg-[#34C759]"
                        style={{ width: `${d.pct}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* High Risk Alert */}
      {stats.highRiskCount > 0 && (
        <div className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-red-100 shadow-sm animate-fade-up" style={{ animationDelay: '600ms' }}>
          <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
            <ShieldAlert className="h-4 w-4 text-red-500" strokeWidth={2.5} />
          </div>
          <span className="text-sm text-slate-700">
            <strong>{stats.highRiskCount}</strong> patients are currently flagged as <span className="text-red-500 font-bold">high-risk</span> (readmission risk &gt; 70%)
          </span>
        </div>
      )}
    </div>
  );
}
