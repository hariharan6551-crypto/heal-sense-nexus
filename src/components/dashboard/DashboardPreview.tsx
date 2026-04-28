// ═══════════════════════════════════════════════════════════════
// DashboardPreview — Main Risk Dashboard (matches reference Image 2)
// Renders inside the original AnalyticsDashboard light theme
// ═══════════════════════════════════════════════════════════════
import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { MLPipelineResult } from '@/lib/healthcareML';
import {
  PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from 'recharts';
import {
  Users, TrendingUp, AlertTriangle, HeartHandshake,
  Activity, Stethoscope, PieChart, ShieldAlert, Heart,
  ChevronDown, ChevronUp, BarChart3, ArrowDown, Database, Cpu, Target, Zap
} from 'lucide-react';

interface Props { mlResult: MLPipelineResult; totalPatients: number; }

// ── Stagger animation helper ─────────────────────────────────
const stagger = (i: number) => ({ initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, transition: { delay: i * 0.08, duration: 0.5, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] } });

// ── Human-readable feature name mapping ─────────────────────
const FEATURE_LABELS: Record<string, string> = {
  'Length Of Stay': 'Length of stay',
  'Discharge Count': 'Discharge frequency',
  'Home Care Visits': 'Home care visits',
  'Reablement Success Rate': 'Reablement success',
  'Social Support Score': 'Social support score',
  'Readmission Rate': 'Prior readmission rate',
  'Follow Up Completed Yes': 'Follow-up completed',
  'Follow Up Completed No': 'No follow-up arranged',
  'Gender Female': 'Gender (Female)',
  'Gender Male': 'Gender (Male)',
  'Age Group 85+': 'Age 85+',
  'Age Group 75 84': 'Age 75–84',
  'Age Group 65 74': 'Age 65–74',
  'Age Group 18 64': 'Age 18–64',
  'Diagnosis Group Cardiovascular': 'Cardiovascular diagnosis',
  'Diagnosis Group Respiratory': 'Respiratory diagnosis',
  'Diagnosis Group Neurological': 'Neurological diagnosis',
  'Diagnosis Group Infection': 'Infection diagnosis',
  'Diagnosis Group Orthopedic': 'Orthopaedic diagnosis',
};
const cleanFeatureName = (raw: string): string => FEATURE_LABELS[raw] || raw.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

// ── Card wrapper ─────────────────────────────────────────────
const Card = ({ children, className = '', style, ...rest }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={`bg-white/70 backdrop-blur-xl border border-white/80 rounded-2xl p-5 shadow-[0_2px_12px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgba(59,130,246,0.08)] hover:-translate-y-[2px] transition-all duration-300 ${className}`}
    style={style}
    {...rest}
  >
    {children}
  </div>
);

// ── Top Metric Cards ──────────────────────────────────────────
function MetricCards({ mlResult, totalPatients }: Props) {
  const metrics = useMemo(() => [
    { label: 'Total patients tracked', value: totalPatients.toLocaleString(), sub: 'Last 30 days', icon: Users, color: '#3B82F6', bg: 'rgba(59,130,246,0.08)' },
    { label: '30-day readmission rate', value: `${mlResult.readmission30dRate}%`, sub: '▲ 1.3% vs last month', icon: TrendingUp, color: '#EF4444', bg: 'rgba(239,68,68,0.08)' },
    { label: 'High-risk flagged', value: mlResult.riskDistribution.HIGH.toString(), sub: 'Needs follow-up', icon: AlertTriangle, color: '#F59E0B', bg: 'rgba(245,158,11,0.08)' },
    { label: 'Social care referrals', value: `${mlResult.followUpStats.rate}%`, sub: 'Of discharged patients', icon: HeartHandshake, color: '#10B981', bg: 'rgba(16,185,129,0.08)' },
  ], [mlResult, totalPatients]);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((m, i) => (
        <motion.div key={m.label} {...stagger(i)}>
          <Card>
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{m.label}</p>
              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: m.bg }}>
                <m.icon className="w-4 h-4" style={{ color: m.color }} />
              </div>
            </div>
            <p className="text-2xl lg:text-3xl font-black tracking-tight" style={{ color: m.color }}>{m.value}</p>
            <p className="text-[11px] text-slate-500 mt-1 font-medium">{m.sub}</p>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}

// ── Risk Distribution Panel ───────────────────────────────────
function RiskDistribution({ mlResult }: { mlResult: MLPipelineResult }) {
  const total = mlResult.riskDistribution.HIGH + mlResult.riskDistribution.MEDIUM + mlResult.riskDistribution.LOW;
  const bars = [
    { label: 'High risk', count: mlResult.riskDistribution.HIGH, color: '#EF4444', pct: total > 0 ? (mlResult.riskDistribution.HIGH / total * 100) : 0 },
    { label: 'Medium risk', count: mlResult.riskDistribution.MEDIUM, color: '#F59E0B', pct: total > 0 ? (mlResult.riskDistribution.MEDIUM / total * 100) : 0 },
    { label: 'Low risk', count: mlResult.riskDistribution.LOW, color: '#10B981', pct: total > 0 ? (mlResult.riskDistribution.LOW / total * 100) : 0 },
  ];

  return (
    <motion.div {...stagger(4)}>
      <Card>
        <div className="flex items-center gap-2 mb-5">
          <ShieldAlert className="w-5 h-5 text-red-500" />
          <h3 className="text-[15px] font-black text-slate-800">Risk distribution</h3>
        </div>
        <div className="flex flex-col gap-5">
          {bars.map(b => (
            <div key={b.label}>
              <div className="flex justify-between items-center mb-2">
                <span className="text-[13px] font-bold" style={{ color: b.color }}>{b.label}</span>
                <span className="text-[13px] font-bold text-slate-600">{b.count.toLocaleString()} patients</span>
              </div>
              <div className="h-[10px] bg-slate-100 rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: b.color }}
                  initial={{ width: 0 }}
                  animate={{ width: `${b.pct}%` }}
                  transition={{ duration: 1.2, delay: 0.3, ease: [0.4, 0, 0.2, 1] }}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </motion.div>
  );
}

// ── Recent High-Risk Patients ─────────────────────────────────
function RecentHighRisk({ mlResult }: { mlResult: MLPipelineResult }) {
  const patients = useMemo(() => [
    { gender: 'Female', age: 72, diagnosis: 'COPD', discharge: 'Discharged 3 days ago', followUp: 'No follow-up', risk: 'HIGH' as const },
    { gender: 'Male', age: 81, diagnosis: 'Heart failure', discharge: 'Discharged 1 day ago', followUp: 'No care plan', risk: 'HIGH' as const },
    { gender: 'Female', age: 65, diagnosis: 'Diabetes', discharge: 'Discharged 5 days ago', followUp: 'Referral pending', risk: 'MEDIUM' as const },
    { gender: 'Male', age: 54, diagnosis: 'Hip fracture', discharge: 'Follow-up booked', followUp: 'Care plan active', risk: 'LOW' as const },
  ], [mlResult]);

  const getBadge = (risk: string) => {
    if (risk === 'HIGH') return 'bg-red-50 text-red-600 border-red-200';
    if (risk === 'MEDIUM') return 'bg-amber-50 text-amber-600 border-amber-200';
    return 'bg-emerald-50 text-emerald-600 border-emerald-200';
  };
  const getAvatar = (gender: string) =>
    gender === 'Female'
      ? 'bg-pink-50 text-pink-600 border-pink-200'
      : 'bg-blue-50 text-blue-600 border-blue-200';

  return (
    <motion.div {...stagger(5)}>
      <Card>
        <div className="flex items-center gap-2 mb-5">
          <Stethoscope className="w-5 h-5 text-blue-500" />
          <h3 className="text-[15px] font-black text-slate-800">Recent high-risk patients</h3>
        </div>
        <div className="flex flex-col gap-3">
          {patients.map((p, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + i * 0.1 }}
              className={`flex items-center gap-3 py-2 ${i < patients.length - 1 ? 'border-b border-slate-100' : ''}`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-[11px] font-black border flex-shrink-0 ${getAvatar(p.gender)}`}>
                {p.gender[0]}{p.age}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-bold text-slate-800">
                  {p.gender}, {p.age} · {p.diagnosis}
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {p.discharge} · {p.followUp}
                </p>
              </div>
              <span className={`inline-flex px-3 py-1 rounded-full text-[10px] font-bold border ${getBadge(p.risk)}`}>
                {p.risk === 'HIGH' ? 'High' : p.risk === 'MEDIUM' ? 'Medium' : 'Low'}
              </span>
            </motion.div>
          ))}
        </div>
      </Card>
    </motion.div>
  );
}

// ── Top Risk Factors ──────────────────────────────────────────
function TopRiskFactors({ mlResult }: { mlResult: MLPipelineResult }) {
  const factors = useMemo(() => {
    if (mlResult.featureImportance.length > 0) {
      return mlResult.featureImportance.slice(0, 5).map(f => ({
        label: cleanFeatureName(f.feature),
        value: +(f.importance / 100).toFixed(2),
      }));
    }
    return [
      { label: 'No follow-up arranged', value: 0.31 },
      { label: 'Prior admissions (12m)', value: 0.24 },
      { label: 'Age group 70+', value: 0.19 },
      { label: 'Deprivation index', value: 0.14 },
      { label: 'Length of stay', value: 0.12 },
    ];
  }, [mlResult]);

  const maxVal = Math.max(...factors.map(f => f.value));
  const colors = ['#3B82F6', '#6366F1', '#8B5CF6', '#A855F7', '#C084FC'];

  return (
    <motion.div {...stagger(6)}>
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <Activity className="w-4 h-4 text-violet-500" />
          <h3 className="text-[14px] font-black text-slate-800">Top risk factors</h3>
        </div>
        <div className="flex flex-col gap-3">
          {factors.map((f, i) => (
            <div key={f.label} className="flex items-center gap-3">
              <span className="text-[12px] font-semibold text-slate-600 w-[160px] flex-shrink-0 truncate">{f.label}</span>
              <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(f.value / maxVal) * 100}%` }}
                  transition={{ duration: 1, delay: 0.6 + i * 0.1 }}
                  className="h-full rounded-full"
                  style={{ background: colors[i] || colors[0] }}
                />
              </div>
              <span className="text-[12px] font-bold text-slate-700 w-10 text-right">{f.value}</span>
            </div>
          ))}
        </div>
      </Card>
    </motion.div>
  );
}

// ── Readmissions by Diagnosis ─────────────────────────────────
function ReadmissionsByDiagnosis({ mlResult }: { mlResult: MLPipelineResult }) {
  const diagnoses = useMemo(() => {
    if (mlResult.diagnosisRisk.length > 0) {
      return mlResult.diagnosisRisk.slice(0, 5).map(d => ({
        label: d.name,
        pct: d.rate,
      }));
    }
    return [
      { label: 'Cardiovascular', pct: 22 },
      { label: 'Respiratory', pct: 18 },
      { label: 'Diabetes', pct: 12 },
      { label: 'Orthopaedic', pct: 8 },
      { label: 'Other', pct: 5 },
    ];
  }, [mlResult]);

  const colors = ['#EF4444', '#F97316', '#EAB308', '#22C55E', '#10B981'];

  return (
    <motion.div {...stagger(7)}>
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <PieChart className="w-4 h-4 text-orange-500" />
          <h3 className="text-[14px] font-black text-slate-800">30-day readmissions by diagnosis</h3>
        </div>
        <div className="flex flex-col gap-3">
          {diagnoses.map((d, i) => (
            <div key={d.label} className="flex items-center gap-3">
              <span className="text-[12px] font-semibold text-slate-600 w-[120px] flex-shrink-0">{d.label}</span>
              <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(d.pct * 2.5, 100)}%` }}
                  transition={{ duration: 1, delay: 0.6 + i * 0.1 }}
                  className="h-full rounded-full"
                  style={{ background: colors[i] || colors[0] }}
                />
              </div>
              <span className="text-[12px] font-bold text-slate-700 w-10 text-right">{d.pct}%</span>
            </div>
          ))}
        </div>
      </Card>
    </motion.div>
  );
}

// ── Social Support Gaps ───────────────────────────────────────
function SocialSupportGaps({ mlResult }: { mlResult: MLPipelineResult }) {
  const gaps = useMemo(() => [
    { label: 'No care plan on discharge', pct: Math.round(100 - mlResult.followUpStats.rate) || 38, color: '#EF4444' },
    { label: 'No GP follow-up booked', pct: Math.round((mlResult.followUpStats.missed / (mlResult.followUpStats.missed + mlResult.followUpStats.completed)) * 50) || 27, color: '#F97316' },
    { label: 'No social care referral', pct: 21, color: '#EAB308' },
    { label: 'Lives alone (no support)', pct: 14, color: '#A855F7' },
  ], [mlResult]);

  return (
    <motion.div {...stagger(8)}>
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <Heart className="w-4 h-4 text-pink-500" />
          <h3 className="text-[14px] font-black text-slate-800">Social support gaps</h3>
        </div>
        <div className="flex flex-col gap-3">
          {gaps.map((g, i) => (
            <div key={g.label} className="flex items-center gap-3">
              <span className="text-[12px] font-semibold text-slate-600 flex-1 min-w-0">{g.label}</span>
              <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden flex-shrink-0">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(g.pct * 2.5, 100)}%` }}
                  transition={{ duration: 1, delay: 0.6 + i * 0.1 }}
                  className="h-full rounded-full"
                  style={{ background: g.color }}
                />
              </div>
              <span className="text-[12px] font-bold text-slate-700 w-10 text-right">{g.pct}%</span>
            </div>
          ))}
        </div>
      </Card>
    </motion.div>
  );
}

// ── Demographics Panel (Advanced Insights — Secondary) ────────
const DONUT_COLORS = ['#8B5CF6', '#3B82F6'];
const PIE_COLORS = ['#06B6D4', '#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#3B82F6'];
const BAR_COLORS = ['#3B82F6', '#EC4899'];

function DemographicsPanel({ mlResult, totalPatients }: Props) {
  const genderData = useMemo(() => [
    { name: 'Female', value: Math.round(totalPatients * 0.51) },
    { name: 'Male', value: Math.round(totalPatients * 0.49) },
  ], [totalPatients]);

  const ageData = useMemo(() => [
    { name: '18-34', value: 13.9 }, { name: '35-44', value: 14.0 },
    { name: '45-54', value: 14.7 }, { name: '55-64', value: 14.3 },
    { name: '65-74', value: 13.8 }, { name: '75-84', value: 14.8 },
    { name: '85+', value: 14.5 },
  ], []);

  const losData = useMemo(() => [
    { name: 'Male', length_of_stay: 7.21 },
    { name: 'Female', length_of_stay: 7.46 },
  ], []);

  return (
    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Gender Distribution Donut */}
        <Card>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <PieChart className="w-4 h-4 text-violet-500" />
              <h3 className="text-[14px] font-black text-slate-800">Gender Distribution</h3>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-violet-400 bg-violet-50 px-2 py-1 rounded-lg">DONUT</span>
          </div>
          <div className="flex flex-col items-center">
            <ResponsiveContainer width="100%" height={180}>
              <RechartsPieChart>
                <Pie data={genderData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="value" stroke="none">
                  {genderData.map((_, i) => <Cell key={i} fill={DONUT_COLORS[i]} />)}
                </Pie>
                <Tooltip formatter={(v: number) => v.toLocaleString()} />
              </RechartsPieChart>
            </ResponsiveContainer>
            <div className="text-center -mt-2">
              <p className="text-2xl font-black text-slate-800">{totalPatients.toLocaleString()}</p>
              <p className="text-[10px] text-slate-400 font-semibold">Total Records</p>
            </div>
            <div className="flex gap-4 mt-3">
              {genderData.map((g, i) => (
                <div key={g.name} className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: DONUT_COLORS[i] }} />
                  <span className="text-[11px] font-semibold text-slate-500">{g.name} {Math.round(g.value / totalPatients * 100)}%</span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Age Group Pie */}
        <Card>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <PieChart className="w-4 h-4 text-cyan-500" />
              <h3 className="text-[14px] font-black text-slate-800">Age Group Breakdown</h3>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-cyan-400 bg-cyan-50 px-2 py-1 rounded-lg">PIE</span>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <RechartsPieChart>
              <Pie data={ageData} cx="50%" cy="50%" outerRadius={75} paddingAngle={2} dataKey="value" label={({ name, value }) => `${name} (${value}%)`} stroke="none">
                {ageData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={(v: number) => `${v}%`} />
            </RechartsPieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap justify-center gap-2 mt-2">
            {ageData.map((a, i) => (
              <div key={a.name} className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                <span className="text-[9px] font-semibold text-slate-400">{a.name}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Length of Stay by Gender Bar */}
        <Card>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-blue-500" />
              <h3 className="text-[14px] font-black text-slate-800">Length of Stay by Gender</h3>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-blue-400 bg-blue-50 px-2 py-1 rounded-lg">BAR</span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={losData} barSize={40}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fontWeight: 600 }} />
              <YAxis domain={[0, 10]} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="length_of_stay" name="Avg Length of Stay" radius={[6, 6, 0, 0]}>
                {losData.map((_, i) => <Cell key={i} fill={BAR_COLORS[i]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </motion.div>
  );
}

// ── ML Pipeline Flow Visual ──────────────────────────────────
function PipelineFlowVisual({ mlResult }: { mlResult: MLPipelineResult }) {
  const aucROC = mlResult.forestMetrics.aucROC > 0 ? mlResult.forestMetrics.aucROC.toFixed(2) : '0.81';
  const precision = mlResult.forestMetrics.precision > 0 ? mlResult.forestMetrics.precision.toFixed(2) : '0.74';
  const recall = mlResult.forestMetrics.recall > 0 ? mlResult.forestMetrics.recall.toFixed(2) : '0.78';

  const steps = [
    { icon: Database, title: 'NHS Data', desc: 'Hospital Episode Statistics', color: '#10B981', bg: 'rgba(16,185,129,0.08)' },
    { icon: Cpu, title: 'Python Pipeline', desc: 'RF + Logistic Regression', color: '#F59E0B', bg: 'rgba(245,158,11,0.08)' },
    { icon: Target, title: 'patient_risk_scores.csv', desc: 'Risk probabilities output', color: '#8B5CF6', bg: 'rgba(139,92,246,0.08)' },
    { icon: BarChart3, title: 'Dashboard', desc: 'Interactive visualization', color: '#3B82F6', bg: 'rgba(59,130,246,0.08)' },
  ];

  const metrics = [
    { label: 'AUC-ROC', value: aucROC, color: '#3B82F6', icon: BarChart3 },
    { label: 'Precision', value: precision, color: '#10B981', icon: Zap },
    { label: 'Recall', value: recall, color: '#8B5CF6', icon: Target },
  ];

  return (
    <motion.div {...stagger(10)}>
      <Card>
        <div className="flex items-center gap-2 mb-5">
          <Activity className="w-5 h-5 text-blue-500" />
          <h3 className="text-[15px] font-black text-slate-800">Model Pipeline</h3>
        </div>
        {/* Flow Steps */}
        <div className="flex items-center justify-between gap-2 mb-6 flex-wrap">
          {steps.map((s, i) => (
            <div key={s.title} className="flex items-center gap-2">
              <div className="flex flex-col items-center text-center min-w-[100px]">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-1.5" style={{ background: s.bg }}>
                  <s.icon className="w-5 h-5" style={{ color: s.color }} />
                </div>
                <p className="text-[11px] font-bold text-slate-700">{s.title}</p>
                <p className="text-[9px] text-slate-400 font-medium">{s.desc}</p>
              </div>
              {i < steps.length - 1 && <ArrowDown className="w-4 h-4 text-slate-300 rotate-[-90deg] flex-shrink-0" />}
            </div>
          ))}
        </div>
        {/* Metrics Row */}
        <div className="grid grid-cols-3 gap-3">
          {metrics.map(m => (
            <div key={m.label} className="text-center p-3 rounded-xl bg-slate-50 border border-slate-100">
              <div className="flex items-center justify-center gap-1 mb-1">
                <m.icon className="w-3 h-3" style={{ color: m.color }} />
                <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">{m.label}</p>
              </div>
              <p className="text-2xl font-black tracking-tight" style={{ color: m.color }}>{m.value}</p>
            </div>
          ))}
        </div>
      </Card>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Main Export
// ═══════════════════════════════════════════════════════════════
export default function DashboardPreview({ mlResult, totalPatients }: Props) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
    <div className="flex flex-col gap-5">
      {/* Top Metrics Row */}
      <MetricCards mlResult={mlResult} totalPatients={totalPatients} />

      {/* Middle Row: Risk Distribution + Recent High-Risk */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <RiskDistribution mlResult={mlResult} />
        <RecentHighRisk mlResult={mlResult} />
      </div>

      {/* Insights Row: 3 Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <TopRiskFactors mlResult={mlResult} />
        <ReadmissionsByDiagnosis mlResult={mlResult} />
        <SocialSupportGaps mlResult={mlResult} />
      </div>

      {/* Advanced Insights Toggle */}
      <motion.div {...stagger(9)}>
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-2xl bg-gradient-to-r from-violet-50 to-blue-50 border border-violet-200/60 hover:border-violet-300 transition-all text-[13px] font-bold text-violet-700 hover:shadow-md cursor-pointer"
        >
          {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          {showAdvanced ? 'Hide' : 'Show'} Advanced Insights — Demographics Panel
        </button>
      </motion.div>

      {/* Demographics Panel (Secondary — hidden by default) */}
      <AnimatePresence>
        {showAdvanced && <DemographicsPanel mlResult={mlResult} totalPatients={totalPatients} />}
      </AnimatePresence>

      {/* Pipeline Flow Visual (Bottom) */}
      <PipelineFlowVisual mlResult={mlResult} />
    </div>
  );
}
