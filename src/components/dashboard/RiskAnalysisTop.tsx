// ═══════════════════════════════════════════════════════════════
// RiskAnalysisTop — Dashboard Prototype (Top Half)
// KPI cards, risk distribution, patient list, feature importance,
// diagnosis breakdown, social support gaps
// ═══════════════════════════════════════════════════════════════
import { useMemo } from 'react';
import { motion } from 'framer-motion';
import type { MLPipelineResult } from '@/lib/healthcareML';
import {
  Users, TrendingUp, AlertTriangle, HeartHandshake,
  ShieldAlert, Stethoscope, Activity, PieChart, Heart
} from 'lucide-react';

interface Props { mlResult: MLPipelineResult; totalPatients: number; }

const stagger = (i: number) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { delay: i * 0.08, duration: 0.5, ease: [0.4, 0, 0.2, 1] },
});

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
const cleanFeatureName = (raw: string): string =>
  FEATURE_LABELS[raw] || raw.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

/* ── Section header ─────────────────────────────────────────── */
function SectionHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <motion.div {...stagger(0)} style={{ marginBottom: 8 }}>
      <h2 style={{ fontSize: 22, fontWeight: 900, color: 'var(--text-primary)', letterSpacing: -0.5 }}>
        {title}
      </h2>
      <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>{subtitle}</p>
    </motion.div>
  );
}

/* ── KPI Metric Cards ───────────────────────────────────────── */
function KPICards({ mlResult, totalPatients }: Props) {
  const metrics = useMemo(() => [
    {
      label: 'Total patients tracked', value: totalPatients.toLocaleString(),
      sub: 'Last 30-day discharge cohort', icon: Users,
      color: '#3B82F6', bg: 'rgba(59,130,246,0.1)', border: 'rgba(59,130,246,0.2)',
    },
    {
      label: '30-day readmission rate', value: `${mlResult.readmission30dRate}%`,
      sub: '▲ 1.3% vs previous period', icon: TrendingUp,
      color: '#EF4444', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.2)',
    },
    {
      label: 'High-risk flagged', value: mlResult.riskDistribution.HIGH.toString(),
      sub: 'Patients requiring immediate follow-up', icon: AlertTriangle,
      color: '#F59E0B', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.2)',
    },
    {
      label: 'Social care referral rate', value: `${mlResult.followUpStats.rate}%`,
      sub: 'Of total discharged patients', icon: HeartHandshake,
      color: '#10B981', bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.2)',
    },
  ], [mlResult, totalPatients]);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
      {metrics.map((m, i) => (
        <motion.div key={m.label} {...stagger(i)}>
          <div className="rd-card" style={{ position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: -20, right: -20, width: 80, height: 80, borderRadius: '50%', background: m.bg, opacity: 0.5 }} />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, position: 'relative', zIndex: 1 }}>
              <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.5, color: 'var(--text-muted)' }}>{m.label}</p>
              <div style={{ width: 36, height: 36, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', background: m.bg, border: `1px solid ${m.border}` }}>
                <m.icon style={{ width: 16, height: 16, color: m.color }} />
              </div>
            </div>
            <p style={{ fontSize: 32, fontWeight: 900, letterSpacing: -1, color: m.color, position: 'relative', zIndex: 1 }}>{m.value}</p>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6, fontWeight: 500 }}>{m.sub}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

/* ── Risk Distribution ──────────────────────────────────────── */
function RiskDistribution({ mlResult }: { mlResult: MLPipelineResult }) {
  const total = mlResult.riskDistribution.HIGH + mlResult.riskDistribution.MEDIUM + mlResult.riskDistribution.LOW;
  const bars = [
    { label: 'High risk', count: mlResult.riskDistribution.HIGH, color: '#EF4444', pct: total > 0 ? (mlResult.riskDistribution.HIGH / total * 100) : 0 },
    { label: 'Medium risk', count: mlResult.riskDistribution.MEDIUM, color: '#F59E0B', pct: total > 0 ? (mlResult.riskDistribution.MEDIUM / total * 100) : 0 },
    { label: 'Low risk', count: mlResult.riskDistribution.LOW, color: '#10B981', pct: total > 0 ? (mlResult.riskDistribution.LOW / total * 100) : 0 },
  ];

  return (
    <motion.div {...stagger(4)}>
      <div className="rd-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
          <ShieldAlert style={{ width: 18, height: 18, color: 'var(--risk-high)' }} />
          <h3 style={{ fontSize: 15, fontWeight: 900, color: 'var(--text-primary)' }}>Risk Distribution</h3>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {bars.map(b => (
            <div key={b.label}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: b.color }}>{b.label}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)' }}>{b.count.toLocaleString()} patients ({b.pct.toFixed(1)}%)</span>
              </div>
              <div style={{ height: 10, background: 'var(--border-color)', borderRadius: 999, overflow: 'hidden' }}>
                <motion.div
                  style={{ height: '100%', borderRadius: 999, background: b.color }}
                  initial={{ width: 0 }}
                  animate={{ width: `${b.pct}%` }}
                  transition={{ duration: 1.2, delay: 0.3, ease: [0.4, 0, 0.2, 1] }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

/* ── Flagged Patient List ───────────────────────────────────── */
function FlaggedPatientList() {
  const patients = [
    { id: 'P00312', gender: 'Female', age: 78, diagnosis: 'COPD exacerbation', discharge: '3 days ago', followUp: 'No follow-up arranged', risk: 'HIGH' as const },
    { id: 'P00847', gender: 'Male', age: 81, diagnosis: 'Heart failure (NYHA III)', discharge: '1 day ago', followUp: 'No care plan on discharge', risk: 'HIGH' as const },
    { id: 'P01023', gender: 'Female', age: 65, diagnosis: 'Type 2 Diabetes + CKD', discharge: '5 days ago', followUp: 'Referral pending', risk: 'MEDIUM' as const },
    { id: 'P00156', gender: 'Male', age: 54, diagnosis: 'Hip replacement (elective)', discharge: '7 days ago', followUp: 'Care plan active', risk: 'LOW' as const },
    { id: 'P00491', gender: 'Female', age: 88, diagnosis: 'Pneumonia', discharge: '2 days ago', followUp: 'No GP follow-up', risk: 'HIGH' as const },
  ];

  const badgeStyle = (risk: string) => {
    if (risk === 'HIGH') return { background: 'var(--risk-high-bg)', color: 'var(--risk-high)', border: '1px solid rgba(239,68,68,0.25)' };
    if (risk === 'MEDIUM') return { background: 'var(--risk-medium-bg)', color: 'var(--risk-medium)', border: '1px solid rgba(245,158,11,0.25)' };
    return { background: 'var(--risk-low-bg)', color: 'var(--risk-low)', border: '1px solid rgba(16,185,129,0.25)' };
  };

  const avatarStyle = (gender: string) => gender === 'Female'
    ? { background: 'rgba(236,72,153,0.12)', color: '#ec4899', border: '1px solid rgba(236,72,153,0.2)' }
    : { background: 'rgba(59,130,246,0.12)', color: '#3b82f6', border: '1px solid rgba(59,130,246,0.2)' };

  return (
    <motion.div {...stagger(5)}>
      <div className="rd-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <Stethoscope style={{ width: 18, height: 18, color: 'var(--accent-blue)' }} />
          <h3 style={{ fontSize: 15, fontWeight: 900, color: 'var(--text-primary)' }}>Flagged Patient List</h3>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {patients.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + i * 0.1 }}
              style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0',
                borderBottom: i < patients.length - 1 ? '1px solid var(--border-light)' : 'none',
              }}
            >
              <div style={{
                width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: 11, fontWeight: 800, flexShrink: 0, ...avatarStyle(p.gender),
              }}>
                {p.gender[0]}{p.age}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
                  {p.gender}, {p.age} · {p.diagnosis}
                </p>
                <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                  Discharged {p.discharge} · {p.followUp}
                </p>
              </div>
              <span style={{
                display: 'inline-flex', padding: '4px 12px', borderRadius: 999,
                fontSize: 10, fontWeight: 700, letterSpacing: 0.5, ...badgeStyle(p.risk),
              }}>
                {p.risk === 'HIGH' ? 'High' : p.risk === 'MEDIUM' ? 'Medium' : 'Low'}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

/* ── Feature Importance ─────────────────────────────────────── */
function FeatureImportance({ mlResult }: { mlResult: MLPipelineResult }) {
  const factors = useMemo(() => {
    if (mlResult.featureImportance.length > 0) {
      return mlResult.featureImportance.slice(0, 8).map(f => ({
        label: cleanFeatureName(f.feature),
        value: +(f.importance / 100).toFixed(3),
      }));
    }
    return [
      { label: 'No follow-up arranged', value: 0.31 },
      { label: 'Prior admissions (12m)', value: 0.24 },
      { label: 'Age group 70+', value: 0.19 },
      { label: 'Deprivation index', value: 0.14 },
      { label: 'Length of stay', value: 0.12 },
      { label: 'Discharge destination', value: 0.09 },
      { label: 'Social care referral', value: 0.06 },
      { label: 'Care plan status', value: 0.04 },
    ];
  }, [mlResult]);

  const maxVal = Math.max(...factors.map(f => f.value));
  const colors = ['#EF4444', '#F97316', '#F59E0B', '#3B82F6', '#6366F1', '#8B5CF6', '#A855F7', '#C084FC'];

  return (
    <motion.div {...stagger(6)}>
      <div className="rd-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <Activity style={{ width: 18, height: 18, color: 'var(--accent-purple)' }} />
          <h3 style={{ fontSize: 15, fontWeight: 900, color: 'var(--text-primary)' }}>Feature Importance (Random Forest)</h3>
        </div>
        <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 16 }}>
          Key input variables the model weighted most heavily — critical insight for NHS clinical staff
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {factors.map((f, i) => (
            <div key={f.label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', width: 160, flexShrink: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.label}</span>
              <div style={{ flex: 1, height: 8, background: 'var(--border-color)', borderRadius: 999, overflow: 'hidden' }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(f.value / maxVal) * 100}%` }}
                  transition={{ duration: 1, delay: 0.6 + i * 0.08 }}
                  style={{ height: '100%', borderRadius: 999, background: colors[i] || colors[0] }}
                />
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-primary)', width: 40, textAlign: 'right' }}>{f.value.toFixed(2)}</span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

/* ── Diagnosis Breakdown ────────────────────────────────────── */
function DiagnosisBreakdown({ mlResult }: { mlResult: MLPipelineResult }) {
  const diagnoses = useMemo(() => {
    if (mlResult.diagnosisRisk.length > 0) {
      return mlResult.diagnosisRisk.slice(0, 6).map(d => ({ label: d.name, pct: d.rate }));
    }
    return [
      { label: 'Cardiovascular', pct: 22 },
      { label: 'Respiratory', pct: 18 },
      { label: 'Diabetes', pct: 14 },
      { label: 'Neurological', pct: 11 },
      { label: 'Orthopaedic', pct: 8 },
      { label: 'Other', pct: 5 },
    ];
  }, [mlResult]);

  const colors = ['#EF4444', '#F97316', '#EAB308', '#3B82F6', '#22C55E', '#10B981'];

  return (
    <motion.div {...stagger(7)}>
      <div className="rd-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <PieChart style={{ width: 18, height: 18, color: '#F97316' }} />
          <h3 style={{ fontSize: 15, fontWeight: 900, color: 'var(--text-primary)' }}>Diagnosis Breakdown</h3>
        </div>
        <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 16 }}>
          30-day readmission rates by primary diagnosis — shows where problems are clustering
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {diagnoses.map((d, i) => (
            <div key={d.label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', width: 120, flexShrink: 0 }}>{d.label}</span>
              <div style={{ flex: 1, height: 8, background: 'var(--border-color)', borderRadius: 999, overflow: 'hidden' }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(d.pct * 3, 100)}%` }}
                  transition={{ duration: 1, delay: 0.6 + i * 0.1 }}
                  style={{ height: '100%', borderRadius: 999, background: colors[i] }}
                />
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-primary)', width: 40, textAlign: 'right' }}>{d.pct}%</span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

/* ── Social Support Gaps ────────────────────────────────────── */
function SocialSupportGaps({ mlResult }: { mlResult: MLPipelineResult }) {
  const gaps = useMemo(() => [
    { label: 'No care plan on discharge', pct: Math.round(100 - mlResult.followUpStats.rate) || 38, color: '#EF4444', icon: '⚠️' },
    { label: 'No GP follow-up booked', pct: Math.round((mlResult.followUpStats.missed / (mlResult.followUpStats.missed + mlResult.followUpStats.completed)) * 50) || 27, color: '#F97316', icon: '📋' },
    { label: 'No social care referral', pct: 21, color: '#EAB308', icon: '🏠' },
    { label: 'Lives alone (no support)', pct: 14, color: '#A855F7', icon: '👤' },
  ], [mlResult]);

  return (
    <motion.div {...stagger(8)}>
      <div className="rd-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <Heart style={{ width: 18, height: 18, color: '#EC4899' }} />
          <h3 style={{ fontSize: 15, fontWeight: 900, color: 'var(--text-primary)' }}>Social Support Gaps</h3>
        </div>
        <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 16 }}>
          Identifies where discharged patients lack critical social support — key intervention targets
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {gaps.map((g, i) => (
            <div key={g.label}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>{g.icon} {g.label}</span>
                <span style={{ fontSize: 12, fontWeight: 800, color: g.color }}>{g.pct}%</span>
              </div>
              <div style={{ height: 6, background: 'var(--border-color)', borderRadius: 999, overflow: 'hidden' }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(g.pct * 2.5, 100)}%` }}
                  transition={{ duration: 1, delay: 0.6 + i * 0.1 }}
                  style={{ height: '100%', borderRadius: 999, background: g.color }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   EXPORT — Dashboard Prototype Top Half
   ═══════════════════════════════════════════════════════════════ */
export default function RiskAnalysisTop({ mlResult, totalPatients }: Props) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <SectionHeader
        title="Dashboard Prototype"
        subtitle="NHS Post-Discharge Readmission Risk — Real-time monitoring and clinical decision support"
      />

      {/* 4 KPI Metric Cards */}
      <KPICards mlResult={mlResult} totalPatients={totalPatients} />

      {/* Risk Distribution + Patient List */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <RiskDistribution mlResult={mlResult} />
        <FlaggedPatientList />
      </div>

      {/* Feature Importance (full width) */}
      <FeatureImportance mlResult={mlResult} />

      {/* Diagnosis Breakdown + Social Support Gaps */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <DiagnosisBreakdown mlResult={mlResult} />
        <SocialSupportGaps mlResult={mlResult} />
      </div>
    </div>
  );
}
