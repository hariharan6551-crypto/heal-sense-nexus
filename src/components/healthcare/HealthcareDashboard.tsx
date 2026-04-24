import { useState, startTransition, memo } from 'react';
import { Shield, Stethoscope, HeartHandshake, Brain, Activity, BarChart3, TrendingUp } from 'lucide-react';
import type { MLPipelineResult } from '@/lib/healthcareML';
import RiskOverview from './RiskOverview';
import ClinicalPanel from './ClinicalPanel';
import SocialSupportPanel from './SocialSupportPanel';
import ModelResults from './ModelResults';
import ReadmissionPatterns from './ReadmissionPatterns';
import RecoveryTrends from './RecoveryTrends';
import GlassCard from '@/components/core/GlassCard';

const TABS = [
  { id: 'risk', label: 'Risk Overview', icon: Shield, color: '#3B82F6' },
  { id: 'clinical', label: 'Clinical Indicators', icon: Stethoscope, color: '#8B5CF6' },
  { id: 'readmission', label: 'Readmission Patterns', icon: BarChart3, color: '#EF4444' },
  { id: 'social', label: 'Social & Recovery', icon: HeartHandshake, color: '#10B981' },
  { id: 'recovery', label: 'Recovery Trends', icon: TrendingUp, color: '#14B8A6' },
  { id: 'model', label: 'AI Model Results', icon: Brain, color: '#EC4899' },
] as const;

type TabId = typeof TABS[number]['id'];

/* ── Skeleton Loader — shown instantly while ML pipeline runs ──────── */
function SkeletonLoader() {
  return (
    <div className="space-y-5 animate-pulse">
      {/* KPI skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <GlassCard key={i} className="p-5">
            <div className="h-3 w-24 bg-slate-200 rounded-full mb-3" />
            <div className="h-8 w-20 bg-slate-200 rounded-lg mb-2" />
            <div className="h-2 w-16 bg-slate-100 rounded-full" />
          </GlassCard>
        ))}
      </div>
      {/* Chart skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <GlassCard className="p-5">
          <div className="h-4 w-32 bg-slate-200 rounded-full mb-4" />
          <div className="h-[200px] bg-slate-100 rounded-xl flex items-center justify-center">
            <div className="w-32 h-32 rounded-full border-[12px] border-slate-200" />
          </div>
        </GlassCard>
        <GlassCard className="p-5 lg:col-span-2">
          <div className="h-4 w-48 bg-slate-200 rounded-full mb-4" />
          <div className="h-[200px] bg-slate-100 rounded-xl flex items-end gap-2 p-4">
            {[40, 65, 50, 80, 55, 70, 45, 90, 60, 75, 50, 85].map((h, i) => (
              <div key={i} className="flex-1 bg-slate-200 rounded-t-lg" style={{ height: `${h}%` }} />
            ))}
          </div>
        </GlassCard>
      </div>
      {/* Table skeleton */}
      <GlassCard className="p-5">
        <div className="h-4 w-56 bg-slate-200 rounded-full mb-4" />
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="flex gap-4">
              <div className="h-3 w-20 bg-slate-100 rounded-full" />
              <div className="h-3 w-16 bg-slate-100 rounded-full" />
              <div className="h-3 w-12 bg-slate-200 rounded-full" />
              <div className="h-3 flex-1 bg-slate-100 rounded-full" />
            </div>
          ))}
        </div>
      </GlassCard>
      <div className="flex items-center justify-center gap-3 py-4">
        <Activity className="w-5 h-5 text-blue-500 animate-spin" />
        <p className="text-sm font-bold text-slate-500">Running ML pipeline — computing risk scores...</p>
      </div>
    </div>
  );
}

export default memo(function HealthcareDashboard({ mlResult }: { mlResult: MLPipelineResult | null }) {
  const [activeTab, setActiveTab] = useState<TabId>('risk');

  // Use startTransition so internal tab switches never block
  const handleTabSwitch = (id: TabId) => {
    startTransition(() => setActiveTab(id));
  };

  if (!mlResult) {
    return <SkeletonLoader />;
  }

  return (
    <div className="space-y-4">
      {/* Tab Navigation */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
        {TABS.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabSwitch(tab.id)}
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

      {/* Tab Content — no framer-motion key remount, just CSS visibility */}
      <div>
        <div style={{ display: activeTab === 'risk' ? 'block' : 'none' }}>
          <RiskOverview result={mlResult} />
        </div>
        <div style={{ display: activeTab === 'clinical' ? 'block' : 'none' }}>
          <ClinicalPanel result={mlResult} />
        </div>
        <div style={{ display: activeTab === 'readmission' ? 'block' : 'none' }}>
          <ReadmissionPatterns result={mlResult} />
        </div>
        <div style={{ display: activeTab === 'social' ? 'block' : 'none' }}>
          <SocialSupportPanel result={mlResult} />
        </div>
        <div style={{ display: activeTab === 'recovery' ? 'block' : 'none' }}>
          <RecoveryTrends result={mlResult} />
        </div>
        <div style={{ display: activeTab === 'model' ? 'block' : 'none' }}>
          <ModelResults result={mlResult} />
        </div>
      </div>
    </div>
  );
});
