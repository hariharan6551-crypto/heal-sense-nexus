import { useNexusStore } from '@/stores/nexusStore';
import { Target, Brain, SlidersHorizontal, Filter, Crosshair, Shield, ClipboardList, Plug, Zap } from 'lucide-react';

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
    { label: 'Predictions', icon: Target, action: togglePredictionPanel, active: predictionPanelOpen, gradient: 'from-purple-500 to-indigo-500', hoverBg: 'hover:bg-purple-50', activeBg: 'bg-purple-50', activeText: 'text-purple-700', activeBorder: 'border-purple-200', dotColor: 'bg-purple-500' },
    { label: 'Insights', icon: Brain, action: toggleInsightsPanel, active: insightsPanelOpen, gradient: 'from-cyan-500 to-sky-500', hoverBg: 'hover:bg-cyan-50', activeBg: 'bg-cyan-50', activeText: 'text-cyan-700', activeBorder: 'border-cyan-200', dotColor: 'bg-cyan-500' },
    { label: 'What-If Analysis', icon: SlidersHorizontal, action: toggleWhatIfPanel, active: whatIfPanelOpen, gradient: 'from-amber-500 to-orange-500', hoverBg: 'hover:bg-amber-50', activeBg: 'bg-amber-50', activeText: 'text-amber-700', activeBorder: 'border-amber-200', dotColor: 'bg-amber-500' },
    { sep: true },
    { label: 'Filters', icon: Filter, action: toggleFilterBuilder, active: filterBuilderOpen, gradient: 'from-blue-500 to-indigo-500', hoverBg: 'hover:bg-blue-50', activeBg: 'bg-blue-50', activeText: 'text-blue-700', activeBorder: 'border-blue-200', dotColor: 'bg-blue-500' },
    { label: 'Drill-Down', icon: Crosshair, action: toggleDrillDown, active: drillDownOpen, gradient: 'from-teal-500 to-emerald-500', hoverBg: 'hover:bg-teal-50', activeBg: 'bg-teal-50', activeText: 'text-teal-700', activeBorder: 'border-teal-200', dotColor: 'bg-teal-500' },
    { sep: true },
    { label: 'RBAC', icon: Shield, action: toggleRBACPanel, active: rbacPanelOpen, gradient: 'from-rose-500 to-pink-500', hoverBg: 'hover:bg-rose-50', activeBg: 'bg-rose-50', activeText: 'text-rose-700', activeBorder: 'border-rose-200', dotColor: 'bg-rose-500' },
    { label: 'Audit', icon: ClipboardList, action: toggleAuditPanel, active: auditPanelOpen, gradient: 'from-indigo-500 to-violet-500', hoverBg: 'hover:bg-indigo-50', activeBg: 'bg-indigo-50', activeText: 'text-indigo-700', activeBorder: 'border-indigo-200', dotColor: 'bg-indigo-500' },
    { label: 'API', icon: Plug, action: toggleAPIPanel, active: apiPanelOpen, gradient: 'from-emerald-500 to-green-500', hoverBg: 'hover:bg-emerald-50', activeBg: 'bg-emerald-50', activeText: 'text-emerald-700', activeBorder: 'border-emerald-200', dotColor: 'bg-emerald-500' },
  ];

  const activeCount = tools.filter(t => !t.sep && t.active).length;

  return (
    <div className="fixed top-[63px] left-0 right-0 w-full z-[90]" id="secondary-ribbon">
      <div className="secondary-ribbon-glass">
        <div className="max-w-[1800px] mx-auto flex items-center gap-1 px-4 lg:px-6 py-1.5 min-w-max">
          {/* Ribbon label */}
          <div className="hidden md:flex items-center gap-1.5 pr-3 mr-1 border-r border-slate-200/60">
            <Zap className="w-3 h-3 text-indigo-500" />
            <span className="text-[10px] font-bold text-slate-500 tracking-wider uppercase">AI Tools</span>
            {activeCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-indigo-500 text-white text-[9px] font-bold flex items-center justify-center animate-pulse">
                {activeCount}
              </span>
            )}
          </div>

          {tools.map((tool, idx) => {
            if (tool.sep) {
              return <div key={`sep-${idx}`} className="w-px h-5 bg-slate-200/60 mx-1" />;
            }

            const isActive = tool.active;

            return (
              <button
                key={tool.label}
                id={`ribbon-${tool.label?.toLowerCase().replace(/[\s-]+/g, '-')}`}
                onClick={tool.action}
                className={`secondary-ribbon-btn group ${
                  isActive
                    ? `${tool.activeBg} ${tool.activeText} ${tool.activeBorder} border shadow-sm`
                    : `text-slate-500 ${tool.hoverBg} hover:text-slate-700 border border-transparent`
                }`}
              >
                {isActive && (
                  <span className={`absolute top-1 right-1 w-1.5 h-1.5 rounded-full ${tool.dotColor} animate-pulse`} />
                )}
                <tool.icon className={`w-3.5 h-3.5 transition-transform duration-200 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                <span className="hidden sm:inline">{tool.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
