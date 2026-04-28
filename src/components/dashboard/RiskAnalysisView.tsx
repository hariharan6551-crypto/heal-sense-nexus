// ═══════════════════════════════════════════════════════════════
// RiskAnalysisView — Full Risk Analysis Section
// Combines Dashboard Prototype (top) + Predictive Pipeline (bottom)
// ═══════════════════════════════════════════════════════════════
import type { MLPipelineResult } from '@/lib/healthcareML';
import RiskAnalysisTop from './RiskAnalysisTop';
import RiskAnalysisBottom from './RiskAnalysisBottom';

interface Props {
  mlResult: MLPipelineResult;
  totalPatients: number;
  onExportCSV: () => void;
}

export default function RiskAnalysisView({ mlResult, totalPatients, onExportCSV }: Props) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* ── TOP HALF: Dashboard Prototype ─────────────────── */}
      <RiskAnalysisTop mlResult={mlResult} totalPatients={totalPatients} />

      {/* ── Divider ──────────────────────────────────────── */}
      <div style={{
        height: 1, margin: '16px 0',
        background: 'linear-gradient(90deg, transparent, var(--border-color), transparent)',
      }} />

      {/* ── BOTTOM HALF: Predictive Model Pipeline ───────── */}
      <RiskAnalysisBottom mlResult={mlResult} onExportCSV={onExportCSV} />
    </div>
  );
}
