import { memo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';
import { Stethoscope, Clock, Users, Activity } from 'lucide-react';
import type { MLPipelineResult } from '@/lib/healthcareML';
import GlassCard from '@/components/core/GlassCard';

const COLORS = ['#3B82F6', '#8B5CF6', '#14B8A6', '#EC4899', '#F59E0B', '#10B981', '#6366F1', '#06B6D4'];

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

export default memo(function ClinicalPanel({ result }: { result: MLPipelineResult }) {
  const { diagnosisRisk, ageGroupRisk, genderDistribution, losDistribution } = result;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Diagnosis Category Risk */}
        <GlassCard className="p-5">
          <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Stethoscope className="w-4 h-4 text-blue-500" /> Readmission by Diagnosis
          </h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={diagnosisRisk} layout="vertical" margin={{ left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 10, fill: '#64748b' }} unit="%" />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} width={100} />
              <Tooltip content={<Tip />} />
              <Bar dataKey="rate" name="Readmission %" radius={[0, 6, 6, 0]} barSize={20}>
                {diagnosisRisk.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </GlassCard>

        {/* Age Group Distribution */}
        <GlassCard className="p-5">
          <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Users className="w-4 h-4 text-violet-500" /> Risk by Age Group
          </h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={ageGroupRisk}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} />
              <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
              <Tooltip content={<Tip />} />
              <Bar dataKey="count" name="Patients" fill="#3B82F6" radius={[4, 4, 0, 0]} barSize={30} />
              <Bar dataKey="rate" name="Risk %" fill="#EF4444" radius={[4, 4, 0, 0]} barSize={30} />
            </BarChart>
          </ResponsiveContainer>
        </GlassCard>

        {/* Gender Distribution */}
        <GlassCard className="p-5">
          <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4 text-pink-500" /> Gender Distribution
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={genderDistribution} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={75} innerRadius={40} paddingAngle={4}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={{ stroke: '#94a3b8' }} style={{ fontSize: 11, fontWeight: 600 }}>
                {genderDistribution.map((_, i) => <Cell key={i} fill={i === 0 ? '#3B82F6' : '#EC4899'} stroke="#fff" strokeWidth={2} />)}
              </Pie>
              <Tooltip content={<Tip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-6 mt-2">
            {genderDistribution.map((g, i) => (
              <div key={g.name} className="text-center">
                <p className="text-xs text-slate-500">{g.name}</p>
                <p className="text-sm font-bold" style={{ color: i === 0 ? '#3B82F6' : '#EC4899' }}>{g.riskRate}% risk</p>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Length of Stay */}
        <GlassCard className="p-5">
          <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4 text-teal-500" /> Length of Stay vs Risk
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={losDistribution}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis dataKey="range" tick={{ fontSize: 10, fill: '#64748b' }} />
              <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
              <Tooltip content={<Tip />} />
              <Bar dataKey="count" name="Patients" fill="#14B8A6" radius={[4, 4, 0, 0]} barSize={30} />
              <Bar dataKey="riskRate" name="Risk %" fill="#F59E0B" radius={[4, 4, 0, 0]} barSize={30} />
            </BarChart>
          </ResponsiveContainer>
        </GlassCard>
      </div>
    </div>
  );
});
