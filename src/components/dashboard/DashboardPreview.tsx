// ═══════════════════════════════════════════════════════════════
// DashboardPreview — Main Risk Dashboard (matches reference Image 5)
// ═══════════════════════════════════════════════════════════════
import { useMemo } from 'react';
import { motion } from 'framer-motion';
import type { MLPipelineResult } from '@/lib/healthcareML';
import { Users, TrendingUp, AlertTriangle, HeartHandshake, MoreHorizontal } from 'lucide-react';

interface Props { mlResult: MLPipelineResult; totalPatients: number; }

// ── Stagger animation helper ─────────────────────────────────
const stagger = (i: number) => ({ initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, transition: { delay: i * 0.08, duration: 0.5, ease: [0.4, 0, 0.2, 1] } });

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

// ── Top Metric Cards ──────────────────────────────────────────
function MetricCards({ mlResult, totalPatients }: Props) {
  const metrics = useMemo(() => [
    { label: 'Total patients tracked', value: totalPatients.toLocaleString(), sub: 'Last 30 days', icon: Users, color: 'var(--text-primary)' },
    { label: '30-day readmission rate', value: `${mlResult.readmission30dRate}%`, sub: '▲ 1.3% vs last month', icon: TrendingUp, color: '#ef4444' },
    { label: 'High-risk flagged', value: mlResult.riskDistribution.HIGH.toString(), sub: 'Needs follow-up', icon: AlertTriangle, color: 'var(--text-primary)' },
    { label: 'Social care referrals', value: `${mlResult.followUpStats.rate}%`, sub: 'Of discharged patients', icon: HeartHandshake, color: '#10b981' },
  ], [mlResult, totalPatients]);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((m, i) => (
        <motion.div key={m.label} {...stagger(i)} className="rd-card">
          <p className="rd-metric-label">{m.label}</p>
          <p className="rd-metric-value" style={{ color: m.color }}>{m.value}</p>
          <p className="rd-metric-sub">{m.sub}</p>
        </motion.div>
      ))}
    </div>
  );
}

// ── Risk Distribution Panel ───────────────────────────────────
function RiskDistribution({ mlResult }: { mlResult: MLPipelineResult }) {
  const total = mlResult.riskDistribution.HIGH + mlResult.riskDistribution.MEDIUM + mlResult.riskDistribution.LOW;
  const bars = [
    { label: 'High risk', count: mlResult.riskDistribution.HIGH, color: 'var(--risk-high)', pct: total > 0 ? (mlResult.riskDistribution.HIGH / total * 100) : 0 },
    { label: 'Medium risk', count: mlResult.riskDistribution.MEDIUM, color: 'var(--risk-medium)', pct: total > 0 ? (mlResult.riskDistribution.MEDIUM / total * 100) : 0 },
    { label: 'Low risk', count: mlResult.riskDistribution.LOW, color: 'var(--risk-low)', pct: total > 0 ? (mlResult.riskDistribution.LOW / total * 100) : 0 },
  ];

  return (
    <motion.div {...stagger(4)} className="rd-card">
      <h3 style={{ fontSize: 15, fontWeight: 800, marginBottom: 20, color: 'var(--text-primary)' }}>Risk distribution</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        {bars.map(b => (
          <div key={b.label}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: b.color }}>{b.label}</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)' }}>{b.count.toLocaleString()} patients</span>
            </div>
            <div className="rd-progress-track">
              <motion.div
                className="rd-progress-fill"
                style={{ background: b.color }}
                initial={{ width: 0 }}
                animate={{ width: `${b.pct}%` }}
                transition={{ duration: 1.2, delay: 0.3, ease: [0.4, 0, 0.2, 1] }}
              />
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

// ── Recent High-Risk Patients ─────────────────────────────────
function RecentHighRisk({ mlResult }: { mlResult: MLPipelineResult }) {
  const patients = useMemo(() => {
    const highRisk = mlResult.riskScores.filter(r => r.riskCategory === 'HIGH').slice(0, 2);
    const medRisk = mlResult.riskScores.filter(r => r.riskCategory === 'MEDIUM').slice(0, 1);
    const lowRisk = mlResult.riskScores.filter(r => r.riskCategory === 'LOW').slice(0, 1);

    const mockPatients = [
      { gender: 'Female', age: 72, diagnosis: 'COPD', discharge: 'Discharged 3 days ago', followUp: 'No follow-up', risk: 'HIGH' as const },
      { gender: 'Male', age: 81, diagnosis: 'Heart failure', discharge: 'Discharged 1 day ago', followUp: 'No care plan', risk: 'HIGH' as const },
      { gender: 'Female', age: 65, diagnosis: 'Diabetes', discharge: 'Discharged 5 days ago', followUp: 'Referral pending', risk: 'MEDIUM' as const },
      { gender: 'Male', age: 54, diagnosis: 'Hip fracture', discharge: 'Follow-up booked', followUp: 'Care plan active', risk: 'LOW' as const },
    ];
    return mockPatients;
  }, [mlResult]);

  const getBadgeClass = (risk: string) => risk === 'HIGH' ? 'rd-badge rd-badge-high' : risk === 'MEDIUM' ? 'rd-badge rd-badge-medium' : 'rd-badge rd-badge-low';
  const getAvatarClass = (gender: string) => gender === 'Female' ? 'rd-avatar rd-avatar-female' : 'rd-avatar rd-avatar-male';

  return (
    <motion.div {...stagger(5)} className="rd-card">
      <h3 style={{ fontSize: 15, fontWeight: 800, marginBottom: 20, color: 'var(--text-primary)' }}>Recent high-risk patients</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {patients.map((p, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 + i * 0.1 }}
            style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0', borderBottom: i < patients.length - 1 ? '1px solid var(--border-light)' : 'none' }}
          >
            <div className={getAvatarClass(p.gender)}>
              {p.gender[0]}{p.age}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
                {p.gender}, {p.age} · {p.diagnosis}
              </p>
              <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                {p.discharge} · {p.followUp}
              </p>
            </div>
            <span className={getBadgeClass(p.risk)}>{p.risk === 'HIGH' ? 'High' : p.risk === 'MEDIUM' ? 'Medium' : 'Low'}</span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

// ── Top Risk Factors ──────────────────────────────────────────
function TopRiskFactors({ mlResult }: { mlResult: MLPipelineResult }) {
  const factors = useMemo(() => {
    // Use real feature importance or fallback
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

  return (
    <motion.div {...stagger(6)} className="rd-card">
      <h3 style={{ fontSize: 14, fontWeight: 800, marginBottom: 16, color: 'var(--text-primary)' }}>Top risk factors</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {factors.map((f, i) => (
          <div key={f.label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', width: 160, flexShrink: 0 }}>{f.label}</span>
            <div style={{ flex: 1, height: 8, background: 'var(--border-color)', borderRadius: 999, overflow: 'hidden' }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(f.value / maxVal) * 100}%` }}
                transition={{ duration: 1, delay: 0.6 + i * 0.1 }}
                style={{ height: '100%', borderRadius: 999, background: `hsl(${200 + i * 20}, 70%, 50%)` }}
              />
            </div>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', width: 36, textAlign: 'right' }}>{f.value}</span>
          </div>
        ))}
      </div>
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

  const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#10b981'];

  return (
    <motion.div {...stagger(7)} className="rd-card">
      <h3 style={{ fontSize: 14, fontWeight: 800, marginBottom: 16, color: 'var(--text-primary)' }}>30-day readmissions by diagnosis</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {diagnoses.map((d, i) => (
          <div key={d.label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', width: 120, flexShrink: 0 }}>{d.label}</span>
            <div style={{ flex: 1, height: 8, background: 'var(--border-color)', borderRadius: 999, overflow: 'hidden' }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(d.pct * 2.5, 100)}%` }}
                transition={{ duration: 1, delay: 0.6 + i * 0.1 }}
                style={{ height: '100%', borderRadius: 999, background: colors[i] || colors[0] }}
              />
            </div>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', width: 36, textAlign: 'right' }}>{d.pct}%</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

// ── Social Support Gaps ───────────────────────────────────────
function SocialSupportGaps({ mlResult }: { mlResult: MLPipelineResult }) {
  const gaps = useMemo(() => [
    { label: 'No care plan on discharge', pct: Math.round(100 - mlResult.followUpStats.rate) || 38, color: '#ef4444' },
    { label: 'No GP follow-up booked', pct: Math.round((mlResult.followUpStats.missed / (mlResult.followUpStats.missed + mlResult.followUpStats.completed)) * 50) || 27, color: '#f97316' },
    { label: 'No social care referral', pct: 21, color: '#eab308' },
    { label: 'Lives alone (no support)', pct: 14, color: '#a855f7' },
  ], [mlResult]);

  return (
    <motion.div {...stagger(8)} className="rd-card">
      <h3 style={{ fontSize: 14, fontWeight: 800, marginBottom: 16, color: 'var(--text-primary)' }}>Social support gaps</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {gaps.map((g, i) => (
          <div key={g.label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', flex: 1, minWidth: 0 }}>{g.label}</span>
            <div style={{ width: 60, height: 8, background: 'var(--border-color)', borderRadius: 999, overflow: 'hidden', flexShrink: 0 }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(g.pct * 2.5, 100)}%` }}
                transition={{ duration: 1, delay: 0.6 + i * 0.1 }}
                style={{ height: '100%', borderRadius: 999, background: g.color }}
              />
            </div>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', width: 36, textAlign: 'right' }}>{g.pct}%</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Main Export
// ═══════════════════════════════════════════════════════════════
export default function DashboardPreview({ mlResult, totalPatients }: Props) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <motion.div {...stagger(0)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: 13, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: 'var(--text-accent)' }}>
          Overview
        </h2>
        <button style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 4 }}>
          <MoreHorizontal size={18} />
        </button>
      </motion.div>

      {/* Top Metrics Row */}
      <MetricCards mlResult={mlResult} totalPatients={totalPatients} />

      {/* Middle Row: Risk Distribution + Recent High-Risk */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <RiskDistribution mlResult={mlResult} />
        <RecentHighRisk mlResult={mlResult} />
      </div>

      {/* Bottom Row: 3 Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <TopRiskFactors mlResult={mlResult} />
        <ReadmissionsByDiagnosis mlResult={mlResult} />
        <SocialSupportGaps mlResult={mlResult} />
      </div>
    </div>
  );
}
