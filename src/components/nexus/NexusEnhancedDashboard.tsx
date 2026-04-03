// ============================================================================
// NexusEnhancedDashboard — Main Integration Wrapper (EXPANDED)
// Wraps the EXISTING HealthcareDashboard with ALL Nexus enhancements
// NON-DESTRUCTIVE: HealthcareDashboard renders completely untouched
// ============================================================================
import { useMemo, useState, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import HealthcareDashboard from '@/components/healthcare/HealthcareDashboard';
import UltraContainer from './wrappers/UltraContainer';
import NexusCommandBar from './controls/NexusCommandBar';

// AI Modules
import AIPredictionPanel from './ai/AIPredictionPanel';
import SmartInsightsEngine from './ai/SmartInsightsEngine';
import AICopilot from './ai/AICopilot';
import WhatIfSimulator from './ai/WhatIfSimulator';

// Enterprise Modules
import RBACPanel from './enterprise/RBACPanel';
import AuditLogPanel from './enterprise/AuditLogPanel';
import APIIntegrationPanel from './enterprise/APIIntegrationPanel';

// Data Modules
import AdvancedFilterBuilder from './data/AdvancedFilterBuilder';
import DrillDownPanel from './data/DrillDownPanel';

// Cinematic
import BootScreen from './cinematic/BootScreen';

import { useNexusStore } from '@/stores/nexusStore';
import '../nexus/nexus.css';

export default function NexusEnhancedDashboard() {
  const { commandCenterMode, bootComplete, setBootComplete } = useNexusStore();
  const [showBoot, setShowBoot] = useState(!bootComplete);

  // Try to read dataset info from sessionStorage for AI context
  const datasetCtx = useMemo(() => {
    try {
      const raw = sessionStorage.getItem('dashboard-dataset');
      if (raw) {
        const ds = JSON.parse(raw);
        return {
          name: ds.fileName || 'Dataset',
          rows: ds.totalRows || 0,
          columns: ds.columns || [],
          numericColumns: ds.numericColumns || [],
        };
      }
    } catch {}
    return { name: 'Dataset', rows: 0, columns: [], numericColumns: [] };
  }, []);

  const handleBootComplete = useCallback(() => {
    setShowBoot(false);
    setBootComplete(true);
  }, [setBootComplete]);

  // Show boot screen on first ever load
  if (showBoot) {
    return <BootScreen onComplete={handleBootComplete} />;
  }

  return (
    <UltraContainer>
      {/* Nexus AI Command Bar — floats above everything */}
      <NexusCommandBar />

      {/* Original Dashboard — rendered 100% untouched */}
      <div className={commandCenterMode ? 'nexus-command-center-mode' : ''}>
        <HealthcareDashboard />
      </div>

      {/* AI Enhancement Panels — slide-in overlays */}
      <AIPredictionPanel
        datasetSize={datasetCtx.rows}
        numericColumns={datasetCtx.numericColumns}
      />
      <SmartInsightsEngine
        datasetSize={datasetCtx.rows}
        columns={datasetCtx.columns}
      />
      <WhatIfSimulator
        numericColumns={datasetCtx.numericColumns}
        datasetSize={datasetCtx.rows}
      />

      {/* Enterprise Panels — slide-in overlays */}
      <RBACPanel />
      <AuditLogPanel />
      <APIIntegrationPanel />

      {/* Data Panels — slide-in overlays */}
      <AdvancedFilterBuilder />
      <DrillDownPanel />

      {/* AI Copilot — floating chat */}
      <AICopilot
        datasetName={datasetCtx.name}
        totalRows={datasetCtx.rows}
        columns={datasetCtx.columns}
      />
    </UltraContainer>
  );
}
