import { useNexusStore } from '@/stores/nexusStore';
import { Target, Brain, SlidersHorizontal, Filter, Crosshair, Shield, ClipboardList, Plug } from 'lucide-react';

export default function SecondaryRibbon() {
  const {
    predictionPanelOpen, togglePredictionPanel,
    insightsPanelOpen, toggleInsightsPanel,
    whatIfPanelOpen, toggleWhatIfPanel,
    filterBuilderOpen, toggleFilterBuilder,
    drillDownOpen, toggleDrillDown,
    rbacPanelOpen, toggleRBACPanel,
    auditPanelOpen, toggleAuditPanel,
    apiPanelOpen, toggleAPIPanel,
  } = useNexusStore();

  const tools = [
    { label: 'Predictions', icon: Target, action: togglePredictionPanel, active: predictionPanelOpen, color: 'text-purple-600', bg: 'bg-purple-100', glow: 'border-purple-300' },
    { label: 'Insights', icon: Brain, action: toggleInsightsPanel, active: insightsPanelOpen, color: 'text-cyan-600', bg: 'bg-cyan-100', glow: 'border-cyan-300' },
    { label: 'What-If Analysis', icon: SlidersHorizontal, action: toggleWhatIfPanel, active: whatIfPanelOpen, color: 'text-amber-600', bg: 'bg-amber-100', glow: 'border-amber-300' },
    { sep: true },
    { label: 'Filters', icon: Filter, action: toggleFilterBuilder, active: filterBuilderOpen, color: 'text-blue-600', bg: 'bg-blue-100', glow: 'border-blue-300' },
    { label: 'Drill-Down', icon: Crosshair, action: toggleDrillDown, active: drillDownOpen, color: 'text-teal-600', bg: 'bg-teal-100', glow: 'border-teal-300' },
    { sep: true },
    { label: 'RBAC', icon: Shield, action: toggleRBACPanel, active: rbacPanelOpen, color: 'text-rose-600', bg: 'bg-rose-100', glow: 'border-rose-300' },
    { label: 'Audit', icon: ClipboardList, action: toggleAuditPanel, active: auditPanelOpen, color: 'text-indigo-600', bg: 'bg-indigo-100', glow: 'border-indigo-300' },
    { label: 'API', icon: Plug, action: toggleAPIPanel, active: apiPanelOpen, color: 'text-emerald-600', bg: 'bg-emerald-100', glow: 'border-emerald-300' },
  ];

  return (
    <div className="w-full bg-white border-b border-slate-200 shadow-sm z-30 sticky top-[64px] overflow-x-auto scrollbar-thin">
      <div className="max-w-[1600px] mx-auto flex items-center gap-1.5 px-4 py-2 min-w-max">
        {tools.map((tool, idx) => {
          if (tool.sep) {
            return <div key={`sep-${idx}`} className="w-px h-6 bg-slate-200 mx-2" />;
          }

          const isActive = tool.active;

          return (
            <button
              key={tool.label}
              onClick={tool.action}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-semibold transition-all duration-200 border border-transparent ${
                isActive 
                  ? `${tool.bg} ${tool.color} shadow-sm ${tool.glow} scale-[1.02]` 
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
              }`}
            >
              <tool.icon className={`w-3.5 h-3.5 ${isActive ? tool.color : 'text-slate-500'}`} />
              {tool.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
