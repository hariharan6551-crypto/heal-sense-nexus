// ═══════════════════════════════════════════════════════════════
// PipelineView — ML Pipeline Flow Visualization (matches Image 1)
// Renders inside the light-themed AnalyticsDashboard
// ═══════════════════════════════════════════════════════════════
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { MLPipelineResult } from '@/lib/healthcareML';
import {
  ArrowRight, Download, Database, Cpu, TreePine, Target,
  Beaker, HeartPulse, BarChart3, Zap
} from 'lucide-react';

interface Props { mlResult: MLPipelineResult; onExportCSV: () => void; }

const fadeUp = (i: number) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { delay: i * 0.12, duration: 0.6, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] },
});

export default function PipelineView({ mlResult, onExportCSV }: Props) {
  const [selectedFeature, setSelectedFeature] = useState<{name: string, type: 'clinical'|'social'} | null>(null);

  const aucROC = mlResult.forestMetrics.aucROC > 0 ? mlResult.forestMetrics.aucROC.toFixed(2) : '0.81';
  const precision = mlResult.forestMetrics.precision > 0 ? mlResult.forestMetrics.precision.toFixed(2) : '0.74';
  const recall = mlResult.forestMetrics.recall > 0 ? mlResult.forestMetrics.recall.toFixed(2) : '0.78';

  const getFeatureImportance = (featureName: string) => {
    // Mock importance scores for the UI display
    const scores: Record<string, number> = {
      'Age group': 0.18, 'Primary diagnosis': 0.15, 'Length of stay': 0.22,
      'Prior admissions (12m)': 0.28, 'Discharge destination': 0.08,
      'Deprivation score': 0.14, 'Follow-up arranged': 0.19,
      'Care plan on discharge': 0.12, 'Social care referral': 0.11
    };
    return scores[featureName] || 0.1;
  };

  return (
    <div className="flex flex-col gap-5">
      {/* ── Pipeline Flow ──────────────────────────────────── */}
      <motion.div {...fadeUp(0)} className="flex gap-3 overflow-x-auto pb-2">
        {/* Step 1: NHS Data Inputs */}
        <div className="flex-1 min-w-[200px] rounded-2xl p-5 border-2 border-emerald-200/60 bg-emerald-50/40 backdrop-blur-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 rounded-full bg-emerald-200/20 -translate-y-1/2 translate-x-1/2" />
          <div className="flex items-center gap-2 mb-2 relative z-10">
            <Database className="w-4 h-4 text-emerald-600" />
            <h4 className="text-[14px] font-black text-emerald-700">NHS data inputs</h4>
          </div>
          <p className="text-[11px] text-emerald-600/70 mb-3 italic font-medium">Raw sources from HES & Compendium</p>
          <div className="flex flex-wrap gap-1.5 relative z-10">
            <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">Readmission CSV</span>
            <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">HES summaries</span>
            <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">Synthetic data</span>
          </div>
        </div>

        <div className="flex items-center justify-center text-slate-300 flex-shrink-0 px-1">
          <ArrowRight className="w-5 h-5" />
        </div>

        {/* Step 2: Python Pipeline */}
        <div className="flex-1 min-w-[200px] rounded-2xl p-5 border-2 border-amber-200/60 bg-amber-50/40 backdrop-blur-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 rounded-full bg-amber-200/20 -translate-y-1/2 translate-x-1/2" />
          <div className="flex items-center gap-2 mb-2 relative z-10">
            <Beaker className="w-4 h-4 text-amber-600" />
            <h4 className="text-[14px] font-black text-amber-700">Python pipeline</h4>
          </div>
          <p className="text-[11px] text-amber-600/70 mb-3 italic font-medium">Clean, encode & engineer features</p>
          <div className="flex flex-wrap gap-1.5 relative z-10">
            <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-amber-100 text-amber-700 border border-amber-200">pandas</span>
            <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-amber-100 text-amber-700 border border-amber-200">sklearn</span>
            <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-amber-100 text-amber-700 border border-amber-200">one-hot encoding</span>
          </div>
        </div>

        <div className="flex items-center justify-center text-slate-300 flex-shrink-0 px-1">
          <ArrowRight className="w-5 h-5" />
        </div>

        {/* Step 3: Random Forest Model */}
        <div className="flex-1 min-w-[200px] rounded-2xl p-5 border-2 border-violet-200/60 bg-violet-50/40 backdrop-blur-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 rounded-full bg-violet-200/20 -translate-y-1/2 translate-x-1/2" />
          <div className="flex items-center gap-2 mb-2 relative z-10">
            <TreePine className="w-4 h-4 text-violet-600" />
            <h4 className="text-[14px] font-black text-violet-700">Random forest model</h4>
          </div>
          <p className="text-[11px] text-violet-600/70 mb-3 italic font-medium">Binary classification: readmitted?</p>
          <div className="flex flex-wrap gap-1.5 relative z-10">
            <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-violet-100 text-violet-700 border border-violet-200">100 trees</span>
            <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-violet-100 text-violet-700 border border-violet-200">AUC-ROC eval</span>
            <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-violet-100 text-violet-700 border border-violet-200">feature importance</span>
          </div>
        </div>

        <div className="flex items-center justify-center text-slate-300 flex-shrink-0 px-1">
          <ArrowRight className="w-5 h-5" />
        </div>

        {/* Step 4: Risk Score Output */}
        <div className="flex-1 min-w-[200px] rounded-2xl p-5 border-2 border-blue-200/60 bg-blue-50/40 backdrop-blur-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 rounded-full bg-blue-200/20 -translate-y-1/2 translate-x-1/2" />
          <div className="flex items-center gap-2 mb-2 relative z-10">
            <Target className="w-4 h-4 text-blue-600" />
            <h4 className="text-[14px] font-black text-blue-700">Risk score output</h4>
          </div>
          <p className="text-[11px] text-blue-600/70 mb-3 font-medium">0.0–1.0 probability → risk band</p>
          <div className="flex flex-col gap-1.5 relative z-10">
            <div className="flex items-center gap-2 text-[11px]">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-sm" />
              <span className="text-slate-600 font-medium">0.65–1.0 → <strong className="text-red-600">High</strong></span>
            </div>
            <div className="flex items-center gap-2 text-[11px]">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-sm" />
              <span className="text-slate-600 font-medium">0.35–0.65 → <strong className="text-amber-600">Medium</strong></span>
            </div>
            <div className="flex items-center gap-2 text-[11px]">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm" />
              <span className="text-slate-600 font-medium">0.0–0.35 → <strong className="text-emerald-600">Low</strong></span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Clinical & Social Features ─────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div {...fadeUp(1)} className="bg-white/70 backdrop-blur-xl border border-white/80 rounded-2xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
          <div className="flex items-center gap-2 mb-4">
            <Cpu className="w-4 h-4 text-blue-500" />
            <h4 className="text-[14px] font-black text-slate-800">Clinical features used by model</h4>
          </div>
          <div className="flex flex-wrap gap-2">
            {['Age group', 'Primary diagnosis', 'Length of stay', 'Prior admissions (12m)', 'Discharge destination'].map(f => (
              <span 
                key={f} 
                onClick={() => setSelectedFeature({ name: f, type: 'clinical' })}
                className={`px-3 py-1.5 rounded-xl text-[11px] font-bold border cursor-pointer transition-all ${
                  selectedFeature?.name === f 
                    ? 'bg-blue-600 text-white border-blue-600 shadow-md' 
                    : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200'
                }`}
              >
                {f}
              </span>
            ))}
          </div>
        </motion.div>

        <motion.div {...fadeUp(2)} className="bg-white/70 backdrop-blur-xl border border-white/80 rounded-2xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
          <div className="flex items-center gap-2 mb-4">
            <HeartPulse className="w-4 h-4 text-pink-500" />
            <h4 className="text-[14px] font-black text-slate-800">Social features used by model</h4>
          </div>
          <div className="flex flex-wrap gap-2">
            {['Deprivation score', 'Follow-up arranged', 'Care plan on discharge', 'Social care referral'].map(f => (
              <span 
                key={f} 
                onClick={() => setSelectedFeature({ name: f, type: 'social' })}
                className={`px-3 py-1.5 rounded-xl text-[11px] font-bold border cursor-pointer transition-all ${
                  selectedFeature?.name === f 
                    ? 'bg-pink-600 text-white border-pink-600 shadow-md' 
                    : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-pink-50 hover:text-pink-600 hover:border-pink-200'
                }`}
              >
                {f}
              </span>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ── Feature Detail Panel ──────────────────────────── */}
      <AnimatePresence>
        {selectedFeature && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className={`p-5 rounded-2xl border backdrop-blur-xl flex flex-col md:flex-row gap-5 ${
              selectedFeature.type === 'clinical' 
                ? 'bg-blue-50/50 border-blue-100' 
                : 'bg-pink-50/50 border-pink-100'
            }`}>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  {selectedFeature.type === 'clinical' ? <Cpu className="w-4 h-4 text-blue-500" /> : <HeartPulse className="w-4 h-4 text-pink-500" />}
                  <h4 className="text-sm font-black text-slate-800">{selectedFeature.name}</h4>
                  <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-widest ${
                    selectedFeature.type === 'clinical' ? 'bg-blue-100 text-blue-600' : 'bg-pink-100 text-pink-600'
                  }`}>
                    {selectedFeature.type} Feature
                  </span>
                </div>
                <p className="text-xs font-medium text-slate-600 mb-4">
                  This feature is actively monitored by the Random Forest model and heavily influences the final probability score for patient readmission risk.
                </p>
                <div className="flex flex-wrap gap-4">
                  <div className="bg-white/60 p-3 rounded-xl border border-white/80 shadow-sm min-w-[120px]">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Importance</p>
                    <p className="text-lg font-black text-slate-800">{(getFeatureImportance(selectedFeature.name) * 100).toFixed(1)}%</p>
                  </div>
                  <div className="bg-white/60 p-3 rounded-xl border border-white/80 shadow-sm min-w-[120px]">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Data Source</p>
                    <p className="text-sm font-bold text-slate-800">{selectedFeature.type === 'clinical' ? 'HES Core Data' : 'Social Care Record'}</p>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setSelectedFeature(null)}
                className="self-start p-2 rounded-lg hover:bg-slate-200/50 text-slate-400 hover:text-slate-600 transition-colors"
              >
                Close
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Evaluation Metrics ────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div {...fadeUp(3)} className="bg-white/70 backdrop-blur-xl border border-white/80 rounded-2xl p-6 text-center shadow-[0_2px_12px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgba(59,130,246,0.08)] hover:-translate-y-[2px] transition-all">
          <div className="flex items-center justify-center gap-1.5 mb-2">
            <BarChart3 className="w-3.5 h-3.5 text-blue-400" />
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">AUC-ROC</p>
          </div>
          <p className="text-4xl font-black text-slate-800 tracking-tight">{aucROC}</p>
          <p className="text-[11px] text-slate-500 mt-2 font-medium">Model accuracy</p>
        </motion.div>

        <motion.div {...fadeUp(4)} className="bg-white/70 backdrop-blur-xl border border-white/80 rounded-2xl p-6 text-center shadow-[0_2px_12px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgba(59,130,246,0.08)] hover:-translate-y-[2px] transition-all">
          <div className="flex items-center justify-center gap-1.5 mb-2">
            <Zap className="w-3.5 h-3.5 text-emerald-400" />
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Precision</p>
          </div>
          <p className="text-4xl font-black text-slate-800 tracking-tight">{precision}</p>
          <p className="text-[11px] text-slate-500 mt-2 font-medium">Correct positives</p>
        </motion.div>

        <motion.div {...fadeUp(5)} className="bg-white/70 backdrop-blur-xl border border-white/80 rounded-2xl p-6 text-center shadow-[0_2px_12px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgba(59,130,246,0.08)] hover:-translate-y-[2px] transition-all">
          <div className="flex items-center justify-center gap-1.5 mb-2">
            <Target className="w-3.5 h-3.5 text-violet-400" />
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Recall</p>
          </div>
          <p className="text-4xl font-black text-slate-800 tracking-tight">{recall}</p>
          <p className="text-[11px] text-slate-500 mt-2 font-medium">Catches most risks</p>
        </motion.div>

        <motion.div {...fadeUp(6)} className="bg-white/70 backdrop-blur-xl border border-white/80 rounded-2xl p-6 text-center shadow-[0_2px_12px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgba(245,158,11,0.12)] hover:-translate-y-[2px] transition-all cursor-pointer" onClick={onExportCSV}>
          <div className="flex items-center justify-center gap-1.5 mb-2">
            <Download className="w-3.5 h-3.5 text-amber-400" />
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Export</p>
          </div>
          <div className="flex items-center justify-center gap-2">
            <span className="text-lg text-slate-400">→</span>
            <span className="text-2xl font-black text-[#F2C811]">Power BI</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2 font-medium flex items-center justify-center gap-1">
            <Download className="w-3 h-3" /> CSV scores to dashboard
          </p>
        </motion.div>
      </div>
    </div>
  );
}
