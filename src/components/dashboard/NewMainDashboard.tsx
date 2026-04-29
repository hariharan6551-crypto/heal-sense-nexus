// ═══════════════════════════════════════════════════════════════
// NewMainDashboard — Premium Patient Readmission Risk Dashboard
// Replaces the old AdvancedEnhancedDashboard with a clean,
// dark-mode-first design matching the user's reference images.
// ═══════════════════════════════════════════════════════════════
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { parseFile } from '@/lib/parseData';
import type { DatasetInfo } from '@/lib/parseData';
import { runMLPipeline, type MLPipelineResult } from '@/lib/healthcareML';
import { useTheme } from '@/contexts/ThemeContext';
import DashboardPreview from './DashboardPreview';
import PipelineView from './PipelineView';
import RiskAnalysisView from './RiskAnalysisView';
import DynamicCharts from '../analytics/DynamicCharts';
import HealthcareDashboard from '../healthcare/HealthcareDashboard';
import AIResearchLab from '../analytics/AIResearchLab';
import PowerBIReportPanel from '../powerbi/PowerBIReportPanel';
import { analyzeDataset } from '@/lib/analyzeData';
import { recommendCharts } from '@/lib/chartRecommender';
import {
  LayoutDashboard, GitBranch, Sun, Moon, LogOut,
  ChevronDown, Activity, Sparkles, Database, Bot, FileBarChart, UploadCloud, PieChart
} from 'lucide-react';
import './dashboard-theme.css';

const TABS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'pipeline', label: 'ML Pipeline', icon: GitBranch },
  { id: 'riskanalysis', label: 'Risk Analysis', icon: Activity },
  { id: 'ai', label: 'AI Assistant', icon: Bot },
  { id: 'reports', label: 'Reports & Power BI', icon: FileBarChart },
] as const;

type TabId = typeof TABS[number]['id'];

/* ── Skeleton Loader ───────────────────────────────────────── */
function DashboardSkeleton() {
  return (
    <div className="risk-dashboard" style={{ padding: '88px 24px 40px' }}>
      <div style={{ maxWidth: 1400, margin: '0 auto' }}>
        <div className="animate-pulse" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="rd-card" style={{ height: 120 }}>
                <div style={{ height: 12, width: 100, background: 'var(--border-color)', borderRadius: 6, marginBottom: 12 }} />
                <div style={{ height: 32, width: 80, background: 'var(--border-color)', borderRadius: 8 }} />
              </div>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {[1, 2].map(i => (
              <div key={i} className="rd-card" style={{ height: 200 }}>
                <div style={{ height: 14, width: 140, background: 'var(--border-color)', borderRadius: 6, marginBottom: 20 }} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {[1, 2, 3].map(j => (
                    <div key={j} style={{ height: 10, background: 'var(--border-color)', borderRadius: 999, width: `${60 + j * 10}%` }} />
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, padding: 24 }}>
            <Activity style={{ width: 20, height: 20, color: 'var(--text-accent)', animation: 'spin 1s linear infinite' }} />
            <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)' }}>Running ML pipeline — computing risk scores...</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Main Dashboard ────────────────────────────────────────── */
export default function NewMainDashboard() {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');
  const [dataset, setDataset] = useState<DatasetInfo | null>(null);
  const [mlResult, setMlResult] = useState<MLPipelineResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [profileOpen, setProfileOpen] = useState(false);
  const mlDataRef = useRef<unknown[] | null>(null);

  const analysis = useMemo(() => dataset ? analyzeDataset(dataset) : null, [dataset]);
  const charts = useMemo(() => dataset ? recommendCharts(dataset) : [], [dataset]);

  const username = localStorage.getItem('dashboard-username') || 'Admin';

  // ── Load default dataset ────────────────────────────────
  useEffect(() => {
    const loadData = async () => {
      try {
        const savedStr = sessionStorage.getItem('dashboard-dataset');
        if (savedStr) {
          const parsed = JSON.parse(savedStr);
          if (parsed?.data?.columns) { setDataset(parsed); setIsLoading(false); return; }
        }
      } catch { sessionStorage.removeItem('dashboard-dataset'); }

      try {
        setIsLoading(true);
        const response = await fetch('/hospital_readmission_dataset.csv');
        if (!response.ok) throw new Error('Could not fetch dataset');
        const blob = await response.blob();
        const file = new File([blob], 'hospital_readmission_dataset.csv', { type: 'text/csv' });
        const ds = await parseFile(file);
        sessionStorage.setItem('dashboard-dataset', JSON.stringify(ds));
        setDataset(ds);
      } catch (e) { console.error('Auto-load failed', e); }
      finally { setIsLoading(false); }
    };
    loadData();
  }, []);

  // ── Run ML Pipeline async ───────────────────────────────
  useEffect(() => {
    if (!dataset?.data?.length) { setMlResult(null); mlDataRef.current = null; return; }
    if (mlDataRef.current === dataset.data) return;

    let cancelled = false;
    setMlResult(null);
    const timerId = setTimeout(() => {
      if (cancelled) return;
      try {
        const result = runMLPipeline(dataset.data);
        if (!cancelled) { mlDataRef.current = dataset.data; setMlResult(result); }
      } catch (e) { console.error('ML Pipeline error:', e); }
    }, 0);
    return () => { cancelled = true; clearTimeout(timerId); };
  }, [dataset]);

  // ── Export CSV ──────────────────────────────────────────
  const handleExportCSV = useCallback(() => {
    if (!mlResult) return;
    const rows = mlResult.riskScores.map(r => `${r.patientId},${r.probability},${r.riskScore},${r.riskCategory}`);
    const csv = ['patient_id,probability,risk_score,risk_category', ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'risk_predictions_export.csv'; a.click();
    URL.revokeObjectURL(url);
  }, [mlResult]);

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    sessionStorage.removeItem('isAuthenticated');
    sessionStorage.removeItem('dashboard-dataset');
    navigate('/login');
  };

  const totalPatients = dataset?.totalRows || 0;

  // ── Render ──────────────────────────────────────────────
  if (isLoading || !mlResult) return <DashboardSkeleton />;

  return (
    <div className="risk-dashboard">
      {/* ── Navigation Bar ─────────────────────────────── */}
      <header className="rd-nav">
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <motion.div
            whileHover={{ scale: 1.08, rotate: 5 }}
            style={{ width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(56,189,248,0.1)', border: '1px solid rgba(56,189,248,0.2)' }}
          >
            <Sparkles style={{ width: 18, height: 18, color: 'var(--text-accent)' }} />
          </motion.div>
        </div>

        {/* Tabs */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: 4, marginLeft: 32 }}>
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`rd-nav-tab ${activeTab === tab.id ? 'active' : ''}`}
              style={{ display: 'flex', alignItems: 'center', gap: 8 }}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </nav>

        {/* Right Side */}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* Upload Dataset Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => alert("Upload Dataset feature coming soon...")}
            style={{ 
              display: 'flex', alignItems: 'center', gap: 6, 
              padding: '6px 12px', borderRadius: 8, 
              background: 'rgba(56,189,248,0.1)', 
              border: '1px solid rgba(56,189,248,0.2)',
              color: 'var(--text-accent)', fontSize: 12, fontWeight: 700, cursor: 'pointer' 
            }}
          >
            <UploadCloud size={14} />
            Upload Dataset
          </motion.button>

          {/* Theme Toggle */}
          <motion.button
            onClick={toggleTheme}
            className="rd-theme-toggle"
            whileTap={{ scale: 0.9 }}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            <div className="rd-theme-toggle-knob" />
            <Sun size={10} style={{ position: 'absolute', left: 5, top: 7, color: '#fbbf24', opacity: theme === 'light' ? 1 : 0.3 }} />
            <Moon size={10} style={{ position: 'absolute', right: 5, top: 7, color: '#94a3b8', opacity: theme === 'dark' ? 1 : 0.3 }} />
          </motion.button>

          {/* Profile */}
          <div style={{ position: 'relative' }}>
            <motion.button
              onClick={() => setProfileOpen(!profileOpen)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 4px 4px 12px', borderRadius: 999, background: 'var(--border-color)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', cursor: 'pointer' }}
            >
              <span style={{ fontSize: 13, fontWeight: 800 }}>{username.charAt(0).toUpperCase()}</span>
              <div style={{ width: 30, height: 30, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-cyan))', color: '#fff' }}>
                <ChevronDown size={14} />
              </div>
            </motion.button>

            <AnimatePresence>
              {profileOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.95 }}
                  style={{ position: 'absolute', right: 0, top: '100%', marginTop: 8, width: 200, background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 16, overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.3)', zIndex: 50 }}
                >
                  <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border-light)' }}>
                    <p style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)' }}>{username}</p>
                    <p style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-accent)', textTransform: 'uppercase', letterSpacing: 1 }}>Enterprise Admin</p>
                  </div>
                  <button onClick={handleLogout} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px', fontSize: 13, color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }}>
                    <LogOut size={16} /> Sign Out
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      {/* Click-away overlay for profile */}
      {profileOpen && <div style={{ position: 'fixed', inset: 0, zIndex: 99 }} onClick={() => setProfileOpen(false)} />}

      {/* ── Main Content ───────────────────────────────── */}
      <main style={{ maxWidth: 1400, margin: '0 auto', padding: '88px 24px 40px' }}>
        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && (
            <motion.div key="dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="space-y-8">
              <DashboardPreview mlResult={mlResult} totalPatients={totalPatients} />
              
              {dataset && analysis && (
                <div className="mt-8 pt-8 border-t border-[var(--border-light)]">
                  <DynamicCharts dataset={dataset} charts={charts} analysis={analysis} filters={{}} />
                </div>
              )}
            </motion.div>
          )}
          {activeTab === 'pipeline' && (
            <motion.div key="pipeline" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
              <PipelineView mlResult={mlResult} onExportCSV={handleExportCSV} />
            </motion.div>
          )}
          {activeTab === 'riskanalysis' && (
            <motion.div key="riskanalysis" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
              <HealthcareDashboard mlResult={mlResult} />
            </motion.div>
          )}
          {activeTab === 'ai' && (
            <motion.div key="ai" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} style={{ height: '75vh' }}>
              <AIResearchLab />
            </motion.div>
          )}
          {activeTab === 'reports' && dataset && (
            <motion.div key="reports" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
              <PowerBIReportPanel dataset={dataset} filters={{}} onExportCSV={handleExportCSV} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer style={{ textAlign: 'center', padding: '24px 0', fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', borderTop: '1px solid var(--border-light)' }}>
      </footer>
    </div>
  );
}
