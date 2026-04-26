// ============================================================================
// AdvancedEnhancedDashboard — Main Integration Wrapper (EXPANDED)
// Wraps the EXISTING AnalyticsDashboard with ALL Advanced enhancements
// NON-DESTRUCTIVE: AnalyticsDashboard renders completely untouched
// ============================================================================
import { useMemo, lazy, Suspense } from 'react';
import AnalyticsDashboard from '@/components/analytics/AnalyticsDashboard';
import UltraContainer from './wrappers/UltraContainer';

// Lazy-load ALL overlay panels — they're only visible when toggled open
// This removes ~40KB from the initial bundle
const AIPredictionPanel = lazy(() => import('./ai/AIPredictionPanel'));
const SmartInsightsEngine = lazy(() => import('./ai/SmartInsightsEngine'));
const AICopilot = lazy(() => import('./ai/AICopilot'));
const WhatIfSimulator = lazy(() => import('./ai/WhatIfSimulator'));
const RBACPanel = lazy(() => import('./enterprise/RBACPanel'));
const AuditLogPanel = lazy(() => import('./enterprise/AuditLogPanel'));
const APIIntegrationPanel = lazy(() => import('./enterprise/APIIntegrationPanel'));
const AdvancedFilterBuilder = lazy(() => import('./data/AdvancedFilterBuilder'));
const DrillDownPanel = lazy(() => import('./data/DrillDownPanel'));

import { useAdvancedStore } from '@/stores/advancedStore';
import '../advanced/advanced.css';

// Lightweight fallback for lazy panels (no visual shift)
const PanelFallback = () => null;

export default function AdvancedEnhancedDashboard() {
  const {
    commandCenterMode,
    predictionPanelOpen,
    insightsPanelOpen,
    whatIfPanelOpen,
    rbacPanelOpen,
    auditPanelOpen,
    apiPanelOpen,
    filterBuilderOpen,
    drillDownOpen,
    copilotOpen,
  } = useAdvancedStore();

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

  return (
    <UltraContainer>
      {/* Original Dashboard — rendered 100% untouched */}
      <div className={commandCenterMode ? 'advanced-command-center-mode' : ''}>
        <AnalyticsDashboard />
      </div>

      {/* AI Enhancement Panels — only mount when opened (saves ~40KB initial) */}
      <Suspense fallback={<PanelFallback />}>
        {predictionPanelOpen && (
          <AIPredictionPanel
            datasetSize={datasetCtx.rows}
            numericColumns={datasetCtx.numericColumns}
          />
        )}
        {insightsPanelOpen && (
          <SmartInsightsEngine
            datasetSize={datasetCtx.rows}
            columns={datasetCtx.columns}
          />
        )}
        {whatIfPanelOpen && (
          <WhatIfSimulator
            numericColumns={datasetCtx.numericColumns}
            datasetSize={datasetCtx.rows}
          />
        )}

        {/* Enterprise Panels */}
        {rbacPanelOpen && <RBACPanel />}
        {auditPanelOpen && <AuditLogPanel />}
        {apiPanelOpen && <APIIntegrationPanel />}

        {/* Data Panels */}
        {filterBuilderOpen && <AdvancedFilterBuilder />}
        {drillDownOpen && <DrillDownPanel />}

        {/* AI Copilot — floating chat (handles its own minimized/open state) */}
        <AICopilot
          datasetName={datasetCtx.name}
          totalRows={datasetCtx.rows}
          columns={datasetCtx.columns}
        />
      </Suspense>
    </UltraContainer>
  );
}

