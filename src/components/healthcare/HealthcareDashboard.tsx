import { useState, useMemo, memo } from 'react';
import { motion } from 'framer-motion';
import { Shield, Stethoscope, HeartHandshake, Brain, Activity } from 'lucide-react';
import { runMLPipeline, type MLPipelineResult } from '@/lib/healthcareML';
import type { DatasetInfo } from '@/lib/parseData';
import RiskOverview from './RiskOverview';
import ClinicalPanel from './ClinicalPanel';
import SocialSupportPanel from './SocialSupportPanel';
import ModelResults from './ModelResults';
import GlassCard from '@/components/core/GlassCard';

const TABS = [
  { id: 'risk', label: 'Risk Overview', icon: Shield, color: '#3B82F6' },
  { id: 'clinical', label: 'Clinical Indicators', icon: Stethoscope, color: '#8B5CF6' },
  { id: 'social', label: 'Social & Recovery', icon: HeartHandshake, color: '#10B981' },
  { id: 'model', label: 'AI Model Results', icon: Brain, color: '#EC4899' },
] as const;

type TabId = typeof TABS[number]['id'];

export default memo(function HealthcareDashboard({ dataset }: { dataset: DatasetInfo }) {
  const [activeTab, setActiveTab] = useState<TabId>('risk');

  // Run ML pipeline (memoized - only runs when dataset changes)
  const mlResult = useMemo<MLPipelineResult | null>(() => {
    if (!dataset?.data?.length) return null;
    try {
      return runMLPipeline(dataset.data);
    } catch (e) {
      console.error('ML Pipeline error:', e);
      return null;
    }
  }, [dataset]);

  if (!mlResult) {
    return (
      <GlassCard className="p-8 text-center">
        <Activity className="w-12 h-12 mx-auto mb-4 text-blue-500 animate-pulse" />
        <p className="text-lg font-bold text-slate-800">Processing Healthcare Data...</p>
        <p className="text-sm text-slate-500 mt-2">Running ML models and generating risk scores</p>
      </GlassCard>
    );
  }

  return (
    <div className="space-y-4">
      {/* Tab Navigation */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {TABS.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                isActive
                  ? 'text-white shadow-lg scale-[1.02]'
                  : 'bg-white/80 text-slate-600 hover:bg-white border border-slate-200 hover:scale-[1.01]'
              }`}
              style={isActive ? { background: tab.color, boxShadow: `0 4px 15px ${tab.color}40` } : {}}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {activeTab === 'risk' && <RiskOverview result={mlResult} />}
        {activeTab === 'clinical' && <ClinicalPanel result={mlResult} />}
        {activeTab === 'social' && <SocialSupportPanel result={mlResult} />}
        {activeTab === 'model' && <ModelResults result={mlResult} />}
      </motion.div>
    </div>
  );
});
