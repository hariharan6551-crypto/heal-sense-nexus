import { memo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line } from 'recharts';
import { Shield, AlertTriangle, CheckCircle, TrendingUp, Users, Activity, Heart } from 'lucide-react';
import type { MLPipelineResult } from '@/lib/healthcareML';
import GlassCard from '@/components/core/GlassCard';

const RISK_COLORS = { LOW: '#10B981', MEDIUM: '#F59E0B', HIGH: '#EF4444' };

function KPICard({ title, value, subtitle, icon: Icon, color, trend }: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  title: string; value: string | number; subtitle: string; icon: any; color: string; trend?: string;
}) {
  return (
    <GlassCard className="p-5 hover:scale-[1.02] transition-transform">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{title}</p>
          <p className="text-3xl font-black mt-1" style={{ color }}>{value}</p>
          <p className="text-xs text-slate-500 mt-1">{subtitle}</p>
        </div>
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: `${color}15` }}>
          <Icon className="w-6 h-6" style={{ color }} />
        </div>
      </div>
      {trend && <p className="text-[10px] font-bold mt-3 px-2 py-1 rounded-full inline-block" style={{ background: `${color}15`, color }}>{trend}</p>}
    </GlassCard>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ChartTooltip = ({ active, payload, label }: { active?: boolean; payload?: { color: string; name: string; value: number | string }[]; label?: string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white/95 backdrop-blur-md border border-slate-200 px-4 py-3 rounded-xl shadow-lg text-xs">
      <p className="font-bold text-slate-800 mb-1">{label}</p>
      {payload.map((p, i: number) => (
        <p key={i} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-slate-600">{p.name}:</span>
          <span className="font-bold text-slate-900 ml-auto">{typeof p.value === 'number' ? p.value.toFixed(1) : p.value}</span>
        </p>
      ))}
    </div>
  );
};

export default memo(function RiskOverview({ result }: { result: MLPipelineResult }) {
  const { riskDistribution, avgRiskScore, readmission30dRate, readmission90dRate, riskScores, monthlyTrend } = result;
  const total = riskScores.length;
  const pieData = [
    { name: 'Low Risk', value: riskDistribution.LOW, color: RISK_COLORS.LOW },
    { name: 'Medium Risk', value: riskDistribution.MEDIUM, color: RISK_COLORS.MEDIUM },
    { name: 'High Risk', value: riskDistribution.HIGH, color: RISK_COLORS.HIGH },
  ];
  const highRiskPatients = riskScores.filter(r => r.riskCategory === 'HIGH').slice(0, 8);

  return (
    <div className="space-y-5">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Total Patients" value={total.toLocaleString()} subtitle="In current dataset" icon={Users} color="#3B82F6" />
        <KPICard title="30-Day Readmission" value={`${readmission30dRate}%`} subtitle="Readmission rate" icon={Activity} color="#EF4444" trend={readmission30dRate > 20 ? '⚠ Above target' : '✓ Within target'} />
        <KPICard title="Avg Risk Score" value={avgRiskScore} subtitle="Out of 100" icon={Heart} color={avgRiskScore > 50 ? '#EF4444' : '#F59E0B'} />
        <KPICard title="High Risk Patients" value={riskDistribution.HIGH} subtitle={`${((riskDistribution.HIGH / total) * 100).toFixed(1)}% of total`} icon={AlertTriangle} color="#EF4444" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Risk Distribution Pie */}
        <GlassCard className="p-5">
          <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Shield className="w-4 h-4 text-blue-500" /> Risk Distribution
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={pieData} dataKey="value" cx="50%" cy="50%" outerRadius={80} innerRadius={45} paddingAngle={3}>
                {pieData.map((d, i) => <Cell key={i} fill={d.color} stroke="#fff" strokeWidth={2} />)}
              </Pie>
              <text x="50%" y="47%" textAnchor="middle" style={{ fontSize: 20, fontWeight: 800, fill: '#1e293b' }}>{total}</text>
              <text x="50%" y="55%" textAnchor="middle" style={{ fontSize: 9, fill: '#94a3b8' }}>Patients</text>
              <Tooltip content={<ChartTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-4 mt-2">
            {pieData.map(d => (
              <div key={d.name} className="flex items-center gap-1.5 text-xs">
                <span className="w-3 h-3 rounded-full" style={{ background: d.color }} />
                <span className="text-slate-600">{d.name}: <strong>{d.value}</strong></span>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Monthly Trend */}
        <GlassCard className="p-5 lg:col-span-2">
          <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-500" /> Monthly Readmission Trend
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={monthlyTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#64748b' }} />
              <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
              <Tooltip content={<ChartTooltip />} />
              <Line type="monotone" dataKey="admissions" stroke="#3B82F6" strokeWidth={2} name="Admissions" dot={{ r: 3 }} />
              <Line type="monotone" dataKey="readmissions" stroke="#EF4444" strokeWidth={2} name="Readmissions" dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </GlassCard>
      </div>

      {/* High Risk Patients Table */}
      <GlassCard className="p-5">
        <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-500" /> High Risk Patients — Immediate Attention Required
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-2 px-3 font-bold text-slate-600">Patient ID</th>
                <th className="text-left py-2 px-3 font-bold text-slate-600">Risk Score</th>
                <th className="text-left py-2 px-3 font-bold text-slate-600">Category</th>
                <th className="text-left py-2 px-3 font-bold text-slate-600">Top Risk Factors</th>
              </tr>
            </thead>
            <tbody>
              {highRiskPatients.map(p => (
                <tr key={p.patientId} className="border-b border-slate-100 hover:bg-red-50/30 transition-colors">
                  <td className="py-2.5 px-3 font-bold text-slate-800">{p.patientId}</td>
                  <td className="py-2.5 px-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${p.riskScore}%`, background: p.riskColor }} />
                      </div>
                      <span className="font-bold" style={{ color: p.riskColor }}>{p.riskScore}%</span>
                    </div>
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="px-2 py-1 rounded-full text-[10px] font-bold text-white" style={{ background: p.riskColor }}>{p.riskCategory}</span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-600">{p.topFeatures.map(f => f.name).join(', ')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
});
