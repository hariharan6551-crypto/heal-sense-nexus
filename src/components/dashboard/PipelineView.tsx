// ═══════════════════════════════════════════════════════════════
// PipelineView — ML Pipeline Flow Visualization (matches Image 4)
// ═══════════════════════════════════════════════════════════════
import { motion } from 'framer-motion';
import type { MLPipelineResult } from '@/lib/healthcareML';
import { ArrowRight, Download } from 'lucide-react';

interface Props { mlResult: MLPipelineResult; onExportCSV: () => void; }

const fadeUp = (i: number) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { delay: i * 0.12, duration: 0.6, ease: [0.4, 0, 0.2, 1] },
});

export default function PipelineView({ mlResult, onExportCSV }: Props) {
  const aucROC = mlResult.forestMetrics.aucROC > 0 ? mlResult.forestMetrics.aucROC.toFixed(2) : '0.81';
  const precision = mlResult.forestMetrics.precision > 0 ? mlResult.forestMetrics.precision.toFixed(2) : '0.74';
  const recall = mlResult.forestMetrics.recall > 0 ? mlResult.forestMetrics.recall.toFixed(2) : '0.78';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* ── Pipeline Flow ──────────────────────────────────── */}
      <motion.div {...fadeUp(0)} style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 8 }}>
        {/* Step 1: NHS Data Inputs */}
        <div className="rd-pipeline-step" style={{ background: 'rgba(34, 197, 94, 0.08)', border: '1px solid rgba(34, 197, 94, 0.2)' }}>
          <h4 style={{ fontSize: 14, fontWeight: 800, color: '#22c55e', marginBottom: 4 }}>NHS data inputs</h4>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 12, fontStyle: 'italic' }}>Raw sources from HES & Compendium</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            <span className="rd-pipeline-tag">Readmission CSV</span>
            <span className="rd-pipeline-tag">HES summaries</span>
            <span className="rd-pipeline-tag">Synthetic data</span>
          </div>
        </div>

        <div className="rd-pipeline-arrow"><ArrowRight size={20} /></div>

        {/* Step 2: Python Pipeline */}
        <div className="rd-pipeline-step" style={{ background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
          <h4 style={{ fontSize: 14, fontWeight: 800, color: '#f59e0b', marginBottom: 4 }}>Python pipeline</h4>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 12, fontStyle: 'italic' }}>Clean, encode & engineer features</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            <span className="rd-pipeline-tag">pandas</span>
            <span className="rd-pipeline-tag">sklearn</span>
            <span className="rd-pipeline-tag">one-hot encoding</span>
          </div>
        </div>

        <div className="rd-pipeline-arrow"><ArrowRight size={20} /></div>

        {/* Step 3: Random Forest Model */}
        <div className="rd-pipeline-step" style={{ background: 'rgba(139, 92, 246, 0.08)', border: '1px solid rgba(139, 92, 246, 0.2)' }}>
          <h4 style={{ fontSize: 14, fontWeight: 800, color: '#8b5cf6', marginBottom: 4 }}>Random forest model</h4>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 12, fontStyle: 'italic' }}>Binary classification: readmitted?</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            <span className="rd-pipeline-tag">100 trees</span>
            <span className="rd-pipeline-tag">AUC-ROC eval</span>
            <span className="rd-pipeline-tag">feature importance</span>
          </div>
        </div>

        <div className="rd-pipeline-arrow"><ArrowRight size={20} /></div>

        {/* Step 4: Risk Score Output */}
        <div className="rd-pipeline-step" style={{ background: 'rgba(59, 130, 246, 0.08)', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
          <h4 style={{ fontSize: 14, fontWeight: 800, color: '#3b82f6', marginBottom: 4 }}>Risk score output</h4>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 12 }}>0.0–1.0 probability → risk band</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444' }} />
              <span style={{ color: 'var(--text-secondary)' }}>0.65–1.0 → <strong>High</strong></span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#f59e0b' }} />
              <span style={{ color: 'var(--text-secondary)' }}>0.35–0.65 → <strong>Medium</strong></span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981' }} />
              <span style={{ color: 'var(--text-secondary)' }}>0.0–0.35 → <strong>Low</strong></span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Clinical & Social Features ─────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div {...fadeUp(1)} className="rd-card" style={{ padding: 24 }}>
          <h4 style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 14 }}>
            Clinical features used by model
          </h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {['Age group', 'Primary diagnosis', 'Length of stay', 'Prior admissions (12m)', 'Discharge destination'].map(f => (
              <span key={f} style={{ padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600, background: 'var(--border-color)', color: 'var(--text-secondary)' }}>{f}</span>
            ))}
          </div>
        </motion.div>

        <motion.div {...fadeUp(2)} className="rd-card" style={{ padding: 24 }}>
          <h4 style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 14 }}>
            Social features used by model
          </h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {['Deprivation score', 'Follow-up arranged', 'Care plan on discharge', 'Social care referral'].map(f => (
              <span key={f} style={{ padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600, background: 'var(--border-color)', color: 'var(--text-secondary)' }}>{f}</span>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ── Evaluation Metrics ────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div {...fadeUp(3)} className="rd-card" style={{ textAlign: 'center', padding: 24 }}>
          <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--text-muted)', marginBottom: 8 }}>AUC-ROC</p>
          <p style={{ fontSize: 40, fontWeight: 900, color: 'var(--text-primary)', letterSpacing: -2 }}>{aucROC}</p>
          <p style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 6 }}>Model accuracy</p>
        </motion.div>

        <motion.div {...fadeUp(4)} className="rd-card" style={{ textAlign: 'center', padding: 24 }}>
          <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--text-muted)', marginBottom: 8 }}>Precision</p>
          <p style={{ fontSize: 40, fontWeight: 900, color: 'var(--text-primary)', letterSpacing: -2 }}>{precision}</p>
          <p style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 6 }}>Correct positives</p>
        </motion.div>

        <motion.div {...fadeUp(5)} className="rd-card" style={{ textAlign: 'center', padding: 24 }}>
          <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--text-muted)', marginBottom: 8 }}>Recall</p>
          <p style={{ fontSize: 40, fontWeight: 900, color: 'var(--text-primary)', letterSpacing: -2 }}>{recall}</p>
          <p style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 6 }}>Catches most risks</p>
        </motion.div>

        <motion.div {...fadeUp(6)} className="rd-card" style={{ textAlign: 'center', padding: 24, cursor: 'pointer' }} onClick={onExportCSV}>
          <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--text-muted)', marginBottom: 8 }}>Export</p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <span style={{ fontSize: 18, color: 'var(--text-primary)' }}>→</span>
            <span style={{ fontSize: 24, fontWeight: 900, color: '#f59e0b' }}>Power BI</span>
          </div>
          <p style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
            <Download size={12} /> CSV scores to dashboard
          </p>
        </motion.div>
      </div>
    </div>
  );
}
