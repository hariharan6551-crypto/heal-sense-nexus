import { useAdvancedStore } from '@/stores/advancedStore';
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
  } = useAdvancedStore();

  const tools = [
    { label: 'Predictions', icon: Target, action: togglePredictionPanel, active: predictionPanelOpen, hoverBg: 'hover:bg-purple-500/20', activeBg: 'bg-purple-500/20', activeText: 'text-purple-300 drop-shadow-[0_0_5px_currentColor]', activeBorder: 'border-purple-500/50 shadow-[0_0_10px_rgba(168,85,247,0.3)]', dotColor: 'bg-purple-400 shadow-[0_0_5px_rgba(168,85,247,0.8)]' },
    { label: 'Insights', icon: Brain, action: toggleInsightsPanel, active: insightsPanelOpen, hoverBg: 'hover:bg-cyan-500/20', activeBg: 'bg-cyan-500/20', activeText: 'text-cyan-300 drop-shadow-[0_0_5px_currentColor]', activeBorder: 'border-cyan-500/50 shadow-[0_0_10px_rgba(6,182,212,0.3)]', dotColor: 'bg-cyan-400 shadow-[0_0_5px_rgba(6,182,212,0.8)]' },
    { label: 'What-If Analysis', icon: SlidersHorizontal, action: toggleWhatIfPanel, active: whatIfPanelOpen, hoverBg: 'hover:bg-amber-500/20', activeBg: 'bg-amber-500/20', activeText: 'text-amber-300 drop-shadow-[0_0_5px_currentColor]', activeBorder: 'border-amber-500/50 shadow-[0_0_10px_rgba(245,158,11,0.3)]', dotColor: 'bg-amber-400 shadow-[0_0_5px_rgba(245,158,11,0.8)]' },
    { sep: true },
    { label: 'Filters', icon: Filter, action: toggleFilterBuilder, active: filterBuilderOpen, hoverBg: 'hover:bg-blue-500/20', activeBg: 'bg-blue-500/20', activeText: 'text-blue-300 drop-shadow-[0_0_5px_currentColor]', activeBorder: 'border-blue-500/50 shadow-[0_0_10px_rgba(59,130,246,0.3)]', dotColor: 'bg-blue-400 shadow-[0_0_5px_rgba(59,130,246,0.8)]' },
    { label: 'Drill-Down', icon: Crosshair, action: toggleDrillDown, active: drillDownOpen, hoverBg: 'hover:bg-teal-500/20', activeBg: 'bg-teal-500/20', activeText: 'text-teal-300 drop-shadow-[0_0_5px_currentColor]', activeBorder: 'border-teal-500/50 shadow-[0_0_10px_rgba(20,184,166,0.3)]', dotColor: 'bg-teal-400 shadow-[0_0_5px_rgba(20,184,166,0.8)]' },
    { sep: true },
    { label: 'RBAC', icon: Shield, action: toggleRBACPanel, active: rbacPanelOpen, hoverBg: 'hover:bg-rose-500/20', activeBg: 'bg-rose-500/20', activeText: 'text-rose-300 drop-shadow-[0_0_5px_currentColor]', activeBorder: 'border-rose-500/50 shadow-[0_0_10px_rgba(244,63,94,0.3)]', dotColor: 'bg-rose-400 shadow-[0_0_5px_rgba(244,63,94,0.8)]' },
    { label: 'Audit', icon: ClipboardList, action: toggleAuditPanel, active: auditPanelOpen, hoverBg: 'hover:bg-indigo-500/20', activeBg: 'bg-indigo-500/20', activeText: 'text-indigo-300 drop-shadow-[0_0_5px_currentColor]', activeBorder: 'border-indigo-500/50 shadow-[0_0_10px_rgba(99,102,241,0.3)]', dotColor: 'bg-indigo-400 shadow-[0_0_5px_rgba(99,102,241,0.8)]' },
    { label: 'API', icon: Plug, action: toggleAPIPanel, active: apiPanelOpen, hoverBg: 'hover:bg-emerald-500/20', activeBg: 'bg-emerald-500/20', activeText: 'text-emerald-300 drop-shadow-[0_0_5px_currentColor]', activeBorder: 'border-emerald-500/50 shadow-[0_0_10px_rgba(16,185,129,0.3)]', dotColor: 'bg-emerald-400 shadow-[0_0_5px_rgba(16,185,129,0.8)]' },
  ];

  const activeCount = tools.filter(t => !t.sep && t.active).length;

  return (
    <div className="fixed top-[63px] left-0 right-0 w-full z-[90]" id="secondary-ribbon">
      <div className="bg-black/60 backdrop-blur-xl border-b border-white/5 shadow-[0_5px_15px_rgba(0,0,0,0.5)] h-full overflow-x-auto custom-scrollbar">
        <div className="max-w-[1800px] mx-auto flex items-center gap-1.5 px-4 lg:px-6 py-1.5 min-w-max">
          {/* Ribbon label */}
          <div className="hidden md:flex items-center gap-2 pr-4 mr-2 border-r border-white/10">
            <Zap className="w-3.5 h-3.5 text-blue-400 drop-shadow-[0_0_5px_rgba(59,130,246,0.8)]" />
            <span className="text-[10px] font-black text-blue-300/70 tracking-widest uppercase font-mono">Telemetry Tools</span>
            {activeCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-blue-500 border border-blue-400 text-white text-[9px] font-bold flex items-center justify-center animate-pulse shadow-[0_0_10px_rgba(59,130,246,0.8)] ml-1">
                {activeCount}
              </span>
            )}
          </div>

          {tools.map((tool, idx) => {
            if (tool.sep) {
              return <div key={`sep-${idx}`} className="w-px h-5 bg-white/10 mx-1.5" />;
            }

            const isActive = tool.active;

            return (
              <button
                key={tool.label}
                id={`ribbon-${tool.label?.toLowerCase().replace(/[\s-]+/g, '-')}`}
                onClick={tool.action}
                className={`relative px-3 py-1.5 rounded-full flex items-center gap-2 text-xs font-bold font-mono transition-all duration-300 group ${
                  isActive
                    ? `${tool.activeBg} ${tool.activeText} ${tool.activeBorder} border`
                    : `text-slate-400 ${tool.hoverBg} hover:text-white border border-transparent`
                }`}
              >
                {isActive && (
                  <span className={`absolute top-0 right-0 w-1.5 h-1.5 rounded-full ${tool.dotColor} animate-pulse transform translate-x-1/4 -translate-y-1/4`} />
                )}
                <tool.icon className={`w-3.5 h-3.5 transition-transform duration-200 ${isActive ? 'scale-110 drop-shadow-[0_0_5px_currentColor]' : 'group-hover:scale-110'}`} />
                <span className="hidden sm:inline tracking-wider">{tool.label}</span>
              </button>
            );
          })}
        </div>
      </div>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          height: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.2);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </div>
  );
}
