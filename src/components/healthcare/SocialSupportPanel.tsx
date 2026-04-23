import { memo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area } from 'recharts';
import { HeartHandshake, Clock, UserCheck, MapPin } from 'lucide-react';
import type { MLPipelineResult } from '@/lib/healthcareML';
import GlassCard from '@/components/core/GlassCard';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
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

export default memo(function SocialSupportPanel({ result }: { result: MLPipelineResult }) {
  const { followUpStats, socialSupportCorrelation, regionRisk, recoveryTrends } = result;

  return (
    <div className="space-y-5">
      {/* Follow-up KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <GlassCard className="p-5 text-center">
          <UserCheck className="w-8 h-8 mx-auto mb-2 text-emerald-500" />
          <p className="text-2xl font-black text-emerald-600">{followUpStats.rate}%</p>
          <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider mt-1">Follow-up Rate</p>
        </GlassCard>
        <GlassCard className="p-5 text-center">
          <HeartHandshake className="w-8 h-8 mx-auto mb-2 text-blue-500" />
          <p className="text-2xl font-black text-blue-600">{followUpStats.completed}</p>
          <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider mt-1">Follow-ups Done</p>
        </GlassCard>
        <GlassCard className="p-5 text-center">
          <Clock className="w-8 h-8 mx-auto mb-2 text-amber-500" />
          <p className="text-2xl font-black text-amber-600">{followUpStats.missed}</p>
          <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider mt-1">Missed Follow-ups</p>
        </GlassCard>
        <GlassCard className="p-5 text-center">
          <MapPin className="w-8 h-8 mx-auto mb-2 text-violet-500" />
          <p className="text-2xl font-black text-violet-600">{regionRisk.length}</p>
          <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider mt-1">Regions Covered</p>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Social Support vs Risk */}
        <GlassCard className="p-5">
          <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
            <HeartHandshake className="w-4 h-4 text-blue-500" /> Social Support Score vs Readmission Risk
          </h3>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={socialSupportCorrelation}>
              <defs>
                <linearGradient id="ssGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#EF4444" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#EF4444" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="score" tick={{ fontSize: 10, fill: '#64748b' }} label={{ value: 'Support Score', position: 'insideBottom', offset: -5, fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10, fill: '#64748b' }} unit="%" />
              <Tooltip content={<Tip />} />
              <Area type="monotone" dataKey="riskRate" stroke="#EF4444" strokeWidth={2} fill="url(#ssGrad)" name="Readmission Risk %" />
            </AreaChart>
          </ResponsiveContainer>
          <p className="text-[10px] text-slate-500 mt-2 text-center italic">Higher social support score correlates with lower readmission risk</p>
        </GlassCard>

        {/* Region Risk */}
        <GlassCard className="p-5">
          <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-violet-500" /> Readmission Rate by Region
          </h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={regionRisk} layout="vertical" margin={{ left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 10, fill: '#64748b' }} unit="%" />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 9, fill: '#64748b' }} width={110} />
              <Tooltip content={<Tip />} />
              <Bar dataKey="rate" name="Risk %" radius={[0, 6, 6, 0]} barSize={18} fill="#8B5CF6" />
            </BarChart>
          </ResponsiveContainer>
        </GlassCard>

        {/* Recovery Trends */}
        <GlassCard className="p-5 lg:col-span-2">
          <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4 text-teal-500" /> Recovery vs Readmission Over Time
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={recoveryTrends}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="week" tick={{ fontSize: 10, fill: '#64748b' }} label={{ value: 'Week', position: 'insideBottom', offset: -5, fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10, fill: '#64748b' }} unit="%" />
              <Tooltip content={<Tip />} />
              <Line type="monotone" dataKey="recoveryRate" stroke="#10B981" strokeWidth={3} name="Recovery %" dot={{ r: 4, fill: '#10B981' }} />
              <Line type="monotone" dataKey="readmissionRate" stroke="#EF4444" strokeWidth={3} name="Readmission %" dot={{ r: 4, fill: '#EF4444' }} />
            </LineChart>
          </ResponsiveContainer>
        </GlassCard>
      </div>
    </div>
  );
});
