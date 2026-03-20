import { useMemo, useEffect, useState, useRef } from 'react';
import { Users, Activity, HeartPulse, ShieldAlert, TrendingUp, TrendingDown, Minus } from 'lucide-react';
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
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (hasAnimated.current) return;
    hasAnimated.current = true;
    const startTime = performance.now();
    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setCount(Math.round(target * eased));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
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

    // Try to find relevant columns
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

    // Gender distribution
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

    // Diagnosis/Category distribution
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

    // High risk count
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
      gradient: 'from-indigo-500 to-blue-600',
      bgGlow: 'bg-indigo-500/10',
    },
    ...(stats.avgRisk !== null ? [{
      label: 'Avg Risk Score',
      value: Math.round(stats.avgRisk),
      suffix: '%',
      icon: ShieldAlert,
      gradient: stats.avgRisk > 50 ? 'from-red-500 to-rose-600' : 'from-emerald-500 to-teal-600',
      bgGlow: stats.avgRisk > 50 ? 'bg-red-500/10' : 'bg-emerald-500/10',
    }] : []),
    ...(stats.avgRecovery !== null ? [{
      label: 'Avg Recovery',
      value: Math.round(stats.avgRecovery),
      suffix: ' days',
      icon: HeartPulse,
      gradient: 'from-cyan-500 to-teal-600',
      bgGlow: 'bg-cyan-500/10',
    }] : []),
    ...(stats.avgSupport !== null ? [{
      label: 'Support Score',
      value: +(stats.avgSupport).toFixed(1),
      suffix: '/10',
      icon: Activity,
      gradient: 'from-violet-500 to-purple-600',
      bgGlow: 'bg-violet-500/10',
    }] : []),
  ].slice(0, 4);

  return (
    <div className="relative overflow-hidden rounded-2xl mb-6">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-blue-900 to-teal-800" />
      <div className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(99,102,241,0.3) 0%, transparent 50%), radial-gradient(circle at 80% 50%, rgba(14,165,233,0.3) 0%, transparent 50%)',
        }} />
      {/* Dot pattern */}
      <div className="absolute inset-0 opacity-[0.04]"
        style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

      <div className="relative z-10 p-6 md:p-8">
        {/* Title Row */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight mb-1 animate-fade-up">
              {dashboardTitle}
            </h1>
            <p className="text-blue-200/70 text-xs md:text-sm">
              Enterprise AI Analytics Suite • Real-time Population Overview
            </p>
          </div>
          <div className="hidden md:flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 text-[10px] text-blue-200">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live Data
            </div>
            <div className="px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 text-[10px] text-blue-200">
              📊 {dataset.fileName}
            </div>
          </div>
        </div>

        {/* Hero KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {heroCards.map((card, i) => (
            <div
              key={i}
              className="relative bg-white/[0.08] backdrop-blur-md rounded-xl border border-white/10 p-4 hover:bg-white/[0.12] transition-all duration-300 group animate-fade-up overflow-hidden"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className={`absolute top-0 right-0 w-20 h-20 rounded-full ${card.bgGlow} blur-2xl opacity-60 group-hover:opacity-100 transition-opacity`} />
              <div className="relative">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-medium text-blue-200/80 uppercase tracking-wider">{card.label}</span>
                  <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${card.gradient} flex items-center justify-center shadow-lg`}>
                    <card.icon className="h-3.5 w-3.5 text-white" />
                  </div>
                </div>
                <div className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
                  <AnimatedCounter target={card.value} suffix={card.suffix} duration={1200} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Row — Gender + Diagnosis Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Gender Distribution */}
          {stats.genderData.length > 0 && (
            <div className="bg-white/[0.06] backdrop-blur-sm rounded-xl border border-white/10 p-4 animate-fade-up" style={{ animationDelay: '400ms' }}>
              <h3 className="text-[10px] font-semibold text-blue-200/80 uppercase tracking-wider mb-3">Population Breakdown</h3>
              <div className="flex items-center gap-3">
                {stats.genderData.map((g, i) => (
                  <div key={i} className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-white/90">{g.name}</span>
                      <span className="text-xs font-bold text-white">{g.pct}%</span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full bg-gradient-to-r ${i === 0 ? 'from-indigo-400 to-blue-400' : 'from-pink-400 to-rose-400'} transition-all duration-1000`}
                        style={{ width: `${g.pct}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Top Categories */}
          {stats.diagData.length > 0 && (
            <div className="bg-white/[0.06] backdrop-blur-sm rounded-xl border border-white/10 p-4 animate-fade-up" style={{ animationDelay: '500ms' }}>
              <h3 className="text-[10px] font-semibold text-blue-200/80 uppercase tracking-wider mb-3">
                Top {stats.diagCol?.replace(/([A-Z])/g, ' $1').replace(/[_-]/g, ' ').trim() || 'Categories'}
              </h3>
              <div className="space-y-1.5">
                {stats.diagData.slice(0, 4).map((d, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-[10px] text-white/80 truncate">{d.name}</span>
                        <span className="text-[10px] font-semibold text-white/90">{d.count}</span>
                      </div>
                      <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-teal-400 transition-all duration-1000"
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
          <div className="mt-3 flex items-center gap-2 px-3 py-2 bg-red-500/10 backdrop-blur-sm rounded-lg border border-red-500/20 animate-fade-up" style={{ animationDelay: '600ms' }}>
            <ShieldAlert className="h-3.5 w-3.5 text-red-400" />
            <span className="text-[10px] text-red-300">
              <strong>{stats.highRiskCount}</strong> patients flagged as high-risk (readmission risk &gt; 70%)
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
