import { useAdvancedStore } from '@/stores/advancedStore';
import { Target, Brain, SlidersHorizontal, Filter, Crosshair, Shield, ClipboardList, Plug, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

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
    { label: 'Predictions', icon: Target, action: togglePredictionPanel, active: predictionPanelOpen, color: '#8B5CF6', bg: 'rgba(139,92,246,0.08)', activeBg: 'rgba(139,92,246,0.12)' },
    { label: 'Insights', icon: Brain, action: toggleInsightsPanel, active: insightsPanelOpen, color: '#06B6D4', bg: 'rgba(6,182,212,0.08)', activeBg: 'rgba(6,182,212,0.12)' },
    { label: 'What-If Analysis', icon: SlidersHorizontal, action: toggleWhatIfPanel, active: whatIfPanelOpen, color: '#EAB308', bg: 'rgba(234,179,8,0.08)', activeBg: 'rgba(234,179,8,0.12)' },
    { sep: true },
    { label: 'Filters', icon: Filter, action: toggleFilterBuilder, active: filterBuilderOpen, color: '#3B82F6', bg: 'rgba(59,130,246,0.08)', activeBg: 'rgba(59,130,246,0.12)' },
    { label: 'Drill-Down', icon: Crosshair, action: toggleDrillDown, active: drillDownOpen, color: '#14B8A6', bg: 'rgba(20,184,166,0.08)', activeBg: 'rgba(20,184,166,0.12)' },
    { sep: true },
    { label: 'RBAC', icon: Shield, action: toggleRBACPanel, active: rbacPanelOpen, color: '#EF4444', bg: 'rgba(239,68,68,0.08)', activeBg: 'rgba(239,68,68,0.12)' },
    { label: 'Audit', icon: ClipboardList, action: toggleAuditPanel, active: auditPanelOpen, color: '#6366F1', bg: 'rgba(99,102,241,0.08)', activeBg: 'rgba(99,102,241,0.12)' },
    { label: 'API', icon: Plug, action: toggleAPIPanel, active: apiPanelOpen, color: '#22C55E', bg: 'rgba(34,197,94,0.08)', activeBg: 'rgba(34,197,94,0.12)' },
  ];

  const activeCount = tools.filter(t => !t.sep && t.active).length;

  return (
    <div className="fixed top-[67px] left-0 right-0 w-full z-[90]" id="secondary-ribbon">
      <div
        className="h-full overflow-x-auto"
        style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)',
          scrollbarWidth: 'none',
        }}
      >
        <div className="max-w-[1800px] mx-auto flex items-center gap-1.5 px-4 lg:px-6 py-1.5 min-w-max">
          {/* Ribbon label */}
          <div className="hidden md:flex items-center gap-2 pr-4 mr-2 border-r" style={{ borderColor: 'rgba(0,0,0,0.06)' }}>
            <Zap className="w-3.5 h-3.5 text-blue-500" />
            <span className="text-[10px] font-black text-blue-600/70 tracking-widest uppercase">Telemetry Tools</span>
            {activeCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-4 h-4 rounded-full text-white text-[9px] font-bold flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)', boxShadow: '0 2px 8px rgba(59,130,246,0.3)' }}
              >
                {activeCount}
              </motion.span>
            )}
          </div>

          {tools.map((tool, idx) => {
            if (tool.sep) {
              return <div key={`sep-${idx}`} className="w-px h-5 mx-1.5" style={{ background: 'rgba(0,0,0,0.06)' }} />;
            }

            const isActive = tool.active;

            return (
              <motion.button
                key={tool.label}
                id={`ribbon-${tool.label?.toLowerCase().replace(/[\s-]+/g, '-')}`}
                onClick={tool.action}
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.96 }}
                className="relative px-3 py-1.5 rounded-lg flex items-center gap-2 text-xs font-bold transition-all duration-200"
                style={{
                  background: isActive ? tool.activeBg : 'transparent',
                  color: isActive ? tool.color : '#64748b',
                  border: isActive ? `1px solid ${tool.color}20` : '1px solid transparent',
                  boxShadow: isActive ? `0 2px 8px ${tool.color}15` : 'none',
                }}
              >
                {isActive && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-0 right-0 w-1.5 h-1.5 rounded-full transform translate-x-1/4 -translate-y-1/4"
                    style={{ background: tool.color, boxShadow: `0 0 6px ${tool.color}60` }}
                  />
                )}
                <tool.icon className="w-3.5 h-3.5" style={{ color: isActive ? tool.color : undefined }} />
                <span className="hidden sm:inline tracking-wide">{tool.label}</span>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
