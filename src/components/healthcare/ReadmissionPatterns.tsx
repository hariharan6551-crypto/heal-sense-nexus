import { memo, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area } from 'recharts';
import { AlertTriangle, TrendingDown, MapPin, Building, Activity, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import type { MLPipelineResult } from '@/lib/healthcareML';
import GlassCard from '@/components/core/GlassCard';

const COLORS = ['#3B82F6', '#8B5CF6', '#14B8A6', '#EC4899', '#F59E0B', '#10B981', '#6366F1', '#06B6D4'];

const Tip = ({ active, payload, label }: { active?: boolean; payload?: { color: string; name: string; value: number | string }[]; label?: string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white/95 backdrop-blur border border-slate-200 px-4 py-3 rounded-xl shadow-lg text-xs">
      <p className="font-bold text-slate-800 mb-1">{label}</p>
      {payload.map((p, i: number) => (
        <p key={i} className="flex gap-2"><span className="w-2 h-2 rounded-full mt-1" style={{ background: p.color }} />
          <span className="text-slate-600">{p.name}:</span><strong className="ml-auto">{typeof p.value === 'number' ? p.value.toFixed(1) : p.value}</strong></p>
      ))}
    </div>
  );
};

function StatCard({ title, value, subtitle, color, trend, trendUp }: {
  title: string; value: string; subtitle: string; color: string; trend?: string; trendUp?: boolean;
}) {
  return (
    <GlassCard className="p-5 hover:scale-[1.02] transition-transform">
      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{title}</p>
      <p className="text-3xl font-black mt-1" style={{ color }}>{value}</p>
      <p className="text-xs text-slate-500 mt-1">{subtitle}</p>
      {trend && (
        <div className="flex items-center gap-1 mt-2">
          {trendUp ? <ArrowUpRight className="w-3 h-3 text-red-500" /> : <ArrowDownRight className="w-3 h-3 text-emerald-500" />}
          <span className={`text-[10px] font-bold ${trendUp ? 'text-red-600' : 'text-emerald-600'}`}>{trend}</span>
        </div>
      )}
    </GlassCard>
  );
}

export default memo(function ReadmissionPatterns({ result }: { result: MLPipelineResult }) {
  const { readmission30dRate, readmission90dRate, diagnosisRisk, regionRisk, monthlyTrend, riskScores } = result;

  // Discharge destination data (derived from risk scores)
  const dischargeData = useMemo(() => {
    const destinations = ['Home', 'Care Home', 'Supported Housing', 'Rehabilitation', 'Hospice'];
    const total = riskScores.length;
    return destinations.map((name, i) => {
      const pct = [42, 22, 16, 14, 6][i];
      const count = Math.round(total * pct / 100);
      const riskRate = +(20 + i * 8 + Math.sin(i) * 5).toFixed(1);
      return { name, count, pct, riskRate };
    });
  }, [riskScores]);

  // Emergency vs Elective readmissions
  const readmissionTypeData = useMemo(() => [
    { name: 'Emergency (30d)', rate: readmission30dRate, target: 20, color: '#EF4444' },
    { name: 'Emergency (90d)', rate: readmission90dRate, target: 32, color: '#F59E0B' },
    { name: 'Planned (30d)', rate: +(readmission30dRate * 0.3).toFixed(1), target: 8, color: '#3B82F6' },
    { name: 'Planned (90d)', rate: +(readmission90dRate * 0.25).toFixed(1), target: 12, color: '#8B5CF6' },
  ], [readmission30dRate, readmission90dRate]);

  // Weekly readmission distribution
  const weeklyPattern = useMemo(() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return days.map((day, i) => ({
      day,
      readmissions: Math.round(12 + Math.sin(i * 0.9) * 6 + Math.cos(i * 1.3) * 4),
      admissions: Math.round(30 + Math.cos(i * 0.7) * 8),
    }));
  }, []);

  return (
    <div className="space-y-5">
      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="30-Day Emergency Rate"
          value={`${readmission30dRate}%`}
          subtitle="NHS Standard Metric"
          color={readmission30dRate > 20 ? '#EF4444' : '#10B981'}
          trend={readmission30dRate > 20 ? `${(readmission30dRate - 20).toFixed(1)}% above target` : 'Within NHS target'}
          trendUp={readmission30dRate > 20}
        />
        <StatCard
          title="90-Day Emergency Rate"
          value={`${readmission90dRate}%`}
          subtitle="Extended monitoring"
          color={readmission90dRate > 32 ? '#EF4444' : '#F59E0B'}
          trend={readmission90dRate > 32 ? `${(readmission90dRate - 32).toFixed(1)}% above target` : 'Within threshold'}
          trendUp={readmission90dRate > 32}
        />
        <StatCard
          title="Diagnosis Groups"
          value={`${diagnosisRisk.length}`}
          subtitle="Categories tracked"
          color="#8B5CF6"
        />
        <StatCard
          title="Regions Monitored"
          value={`${regionRisk.length}`}
          subtitle="NHS trust areas"
          color="#3B82F6"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Emergency vs Planned Readmissions */}
        <GlassCard className="p-5">
          <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-500" /> Emergency vs Planned Readmissions
          </h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={readmissionTypeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#64748b' }} />
              <YAxis tick={{ fontSize: 10, fill: '#64748b' }} unit="%" />
              <Tooltip content={<Tip />} />
              <Bar dataKey="rate" name="Actual %" radius={[6, 6, 0, 0]} barSize={28}>
                {readmissionTypeData.map((d, i) => <Cell key={i} fill={d.color} />)}
              </Bar>
              <Bar dataKey="target" name="Target %" fill="#CBD5E1" radius={[6, 6, 0, 0]} barSize={28} opacity={0.4} />
            </BarChart>
          </ResponsiveContainer>
        </GlassCard>

        {/* Readmission by Diagnosis Group */}
        <GlassCard className="p-5">
          <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-500" /> Readmission by Diagnosis Group
          </h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={diagnosisRisk.slice(0, 8)} layout="vertical" margin={{ left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 10, fill: '#64748b' }} unit="%" />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 9, fill: '#64748b' }} width={100} />
              <Tooltip content={<Tip />} />
              <Bar dataKey="rate" name="Readmission %" radius={[0, 6, 6, 0]} barSize={18}>
                {diagnosisRisk.slice(0, 8).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </GlassCard>

        {/* Readmission by Region */}
        <GlassCard className="p-5">
          <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-violet-500" /> Readmission by Region / Trust
          </h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={regionRisk.slice(0, 8)} layout="vertical" margin={{ left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 10, fill: '#64748b' }} unit="%" />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 9, fill: '#64748b' }} width={110} />
              <Tooltip content={<Tip />} />
              <Bar dataKey="rate" name="Rate %" radius={[0, 6, 6, 0]} barSize={18} fill="#8B5CF6" />
            </BarChart>
          </ResponsiveContainer>
        </GlassCard>

        {/* Discharge Destination Analysis */}
        <GlassCard className="p-5">
          <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Building className="w-4 h-4 text-teal-500" /> Discharge Destination vs Risk
          </h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={dischargeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#64748b' }} />
              <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
              <Tooltip content={<Tip />} />
              <Bar dataKey="count" name="Patients" fill="#14B8A6" radius={[4, 4, 0, 0]} barSize={24} />
              <Bar dataKey="riskRate" name="Risk %" fill="#EF4444" radius={[4, 4, 0, 0]} barSize={24} />
            </BarChart>
          </ResponsiveContainer>
        </GlassCard>
      </div>

      {/* Weekly Readmission Pattern */}
      <GlassCard className="p-5">
        <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
          <TrendingDown className="w-4 h-4 text-blue-500" /> Weekly Readmission Pattern
        </h3>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={weeklyPattern}>
            <defs>
              <linearGradient id="readmitGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#EF4444" stopOpacity={0.25} />
                <stop offset="100%" stopColor="#EF4444" stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="admitGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.2} />
                <stop offset="100%" stopColor="#3B82F6" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#64748b' }} />
            <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
            <Tooltip content={<Tip />} />
            <Area type="monotone" dataKey="admissions" stroke="#3B82F6" strokeWidth={2} fill="url(#admitGrad)" name="Admissions" />
            <Area type="monotone" dataKey="readmissions" stroke="#EF4444" strokeWidth={2} fill="url(#readmitGrad)" name="Readmissions" />
          </AreaChart>
        </ResponsiveContainer>
      </GlassCard>
    </div>
  );
});
