// ============================================================================
// NexusCommandBar — Floating AI toolbar with quick access to ALL panels
// ADD-ON MODULE: Non-destructive overlay bar (LIGHT MODE)
// ============================================================================
import { motion } from 'framer-motion';
import { useNexusStore } from '@/stores/nexusStore';
import ThemeSwitcher from './ThemeSwitcher';
import NotificationCenter from '../notifications/NotificationCenter';
import {
  Target, Brain, SlidersHorizontal, Maximize2, Minimize2,
  Sparkles, Layers, Shield, ClipboardList, Plug, Filter,
  Crosshair
} from 'lucide-react';

export default function NexusCommandBar() {
  const {
    togglePredictionPanel, toggleInsightsPanel, toggleWhatIfPanel,
    toggleRBACPanel, toggleAuditPanel, toggleAPIPanel,
    toggleFilterBuilder, toggleDrillDown,
    commandCenterMode, toggleCommandCenter,
    particlesEnabled, toggleParticles,
  } = useNexusStore();

  const aiTools = [
    { icon: Target, label: 'Predictions', action: togglePredictionPanel, color: 'hover:text-purple-600 hover:bg-purple-50' },
    { icon: Brain, label: 'Insights', action: toggleInsightsPanel, color: 'hover:text-cyan-600 hover:bg-cyan-50' },
    { icon: SlidersHorizontal, label: 'What-If', action: toggleWhatIfPanel, color: 'hover:text-amber-600 hover:bg-amber-50' },
  ];

  const dataTools = [
    { icon: Filter, label: 'Filters', action: toggleFilterBuilder, color: 'hover:text-blue-600 hover:bg-blue-50' },
    { icon: Crosshair, label: 'Drill-Down', action: toggleDrillDown, color: 'hover:text-teal-600 hover:bg-teal-50' },
  ];

  const enterpriseTools = [
    { icon: Shield, label: 'RBAC', action: toggleRBACPanel, color: 'hover:text-rose-600 hover:bg-rose-50' },
    { icon: ClipboardList, label: 'Audit', action: toggleAuditPanel, color: 'hover:text-indigo-600 hover:bg-indigo-50' },
    { icon: Plug, label: 'API Hub', action: toggleAPIPanel, color: 'hover:text-emerald-600 hover:bg-emerald-50' },
  ];

  const renderToolGroup = (tools: typeof aiTools) => (
    <>
      {tools.map((tool) => (
        <button
          key={tool.label}
          onClick={tool.action}
          className={`nexus-toolbar-btn ${tool.color}`}
          title={tool.label}
        >
          <tool.icon className="w-3.5 h-3.5" />
          <span className="hidden 2xl:inline">{tool.label}</span>
        </button>
      ))}
    </>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="nexus-command-bar"
    >
      <div className="flex items-center gap-1.5">
        {/* Logo */}
        <div className="flex items-center gap-1.5 pr-2 border-r border-slate-200 mr-0.5">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-[10px] font-bold text-slate-600 hidden lg:inline">NEXUS AI</span>
        </div>

        {/* AI Tools */}
        {renderToolGroup(aiTools)}

        <div className="w-px h-5 bg-slate-200 mx-0.5" />

        {/* Data Tools */}
        {renderToolGroup(dataTools)}

        <div className="w-px h-5 bg-slate-200 mx-0.5" />

        {/* Enterprise Tools */}
        {renderToolGroup(enterpriseTools)}

        <div className="w-px h-5 bg-slate-200 mx-0.5" />

        {/* Toggles */}
        <button
          onClick={toggleParticles}
          className={`nexus-toolbar-btn ${particlesEnabled ? 'text-cyan-600 bg-cyan-50' : ''}`}
          title="Toggle particles"
        >
          <Layers className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={toggleCommandCenter}
          className={`nexus-toolbar-btn ${commandCenterMode ? 'text-emerald-600 bg-emerald-50' : ''}`}
          title="Command Center Mode"
        >
          {commandCenterMode ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
        </button>

        <div className="w-px h-5 bg-slate-200 mx-0.5" />

        {/* Theme */}
        <ThemeSwitcher />

        {/* Notifications */}
        <NotificationCenter />
      </div>
    </motion.div>
  );
}
