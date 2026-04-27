// ============================================================================
// Power BI Configuration — Centralized config for Power BI Embedded
// All values sourced from environment variables for security
// ============================================================================

export interface PowerBIReportConfig {
  id: string;
  name: string;
  reportId: string;
  groupId: string; // aka workspaceId
  datasetId?: string;
  embedUrl?: string;
  description?: string;
  icon?: string;
  refreshSchedule?: 'realtime' | '15min' | '30min' | '1hr' | 'daily';
}

export interface PowerBISettings {
  clientId: string;
  tenantId: string;
  authority: string;
  tokenEndpoint: string;
  embedBaseUrl: string;
  apiBaseUrl: string;
  defaultGroupId: string;
}

// Read from environment
export const POWERBI_SETTINGS: PowerBISettings = {
  clientId: import.meta.env.VITE_POWERBI_CLIENT_ID || '',
  tenantId: import.meta.env.VITE_POWERBI_TENANT_ID || '',
  authority: `https://login.microsoftonline.com/${import.meta.env.VITE_POWERBI_TENANT_ID || 'common'}`,
  tokenEndpoint: import.meta.env.VITE_POWERBI_TOKEN_ENDPOINT || '/api/powerbi-token',
  embedBaseUrl: 'https://app.powerbi.com/reportEmbed',
  apiBaseUrl: 'https://api.powerbi.com/v1.0/myorg',
  defaultGroupId: import.meta.env.VITE_POWERBI_GROUP_ID || '',
};

// Pre-configured reports — add your report IDs here
export const POWERBI_REPORTS: PowerBIReportConfig[] = [
  {
    id: 'main-dashboard',
    name: 'Healthcare Analytics Dashboard',
    reportId: import.meta.env.VITE_POWERBI_REPORT_ID || '',
    groupId: import.meta.env.VITE_POWERBI_GROUP_ID || '',
    datasetId: import.meta.env.VITE_POWERBI_DATASET_ID || '',
    description: 'Main healthcare analytics report with patient readmission data',
    icon: '📊',
    refreshSchedule: '15min',
  },
  {
    id: 'risk-report',
    name: 'Risk Analysis Report',
    reportId: import.meta.env.VITE_POWERBI_RISK_REPORT_ID || '',
    groupId: import.meta.env.VITE_POWERBI_GROUP_ID || '',
    description: 'Patient risk stratification and predictive analytics',
    icon: '🛡️',
    refreshSchedule: '30min',
  },
  {
    id: 'operations-report',
    name: 'Operational Metrics',
    reportId: import.meta.env.VITE_POWERBI_OPS_REPORT_ID || '',
    groupId: import.meta.env.VITE_POWERBI_GROUP_ID || '',
    description: 'Hospital operations, bed occupancy, and discharge metrics',
    icon: '🏥',
    refreshSchedule: '1hr',
  },
];

// Build the embed URL for a report
export function buildEmbedUrl(reportId: string, groupId: string, filters?: Record<string, string>): string {
  let url = `https://app.powerbi.com/reportEmbed?reportId=${reportId}&groupId=${groupId}&autoAuth=true&ctid=${POWERBI_SETTINGS.tenantId}`;
  
  // Append filters as URL params for Power BI filter pane sync
  if (filters) {
    const filterParts: string[] = [];
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== '__all__' && !key.startsWith('__')) {
        filterParts.push(`${encodeURIComponent(key)} eq '${encodeURIComponent(value)}'`);
      }
    });
    if (filterParts.length > 0) {
      url += `&filter=${filterParts.join(' and ')}`;
    }
  }
  
  return url;
}

// Build standalone Power BI Service URL (opens in browser)
export function buildServiceUrl(reportId: string, groupId: string): string {
  return `https://app.powerbi.com/groups/${groupId}/reports/${reportId}`;
}

// Validate configuration
export function isConfigured(): boolean {
  return !!(
    POWERBI_SETTINGS.clientId &&
    POWERBI_SETTINGS.tenantId &&
    POWERBI_REPORTS[0]?.reportId
  );
}

export function getConfigStatus(): { configured: boolean; missing: string[] } {
  const missing: string[] = [];
  if (!POWERBI_SETTINGS.clientId) missing.push('VITE_POWERBI_CLIENT_ID');
  if (!POWERBI_SETTINGS.tenantId) missing.push('VITE_POWERBI_TENANT_ID');
  if (!POWERBI_REPORTS[0]?.reportId) missing.push('VITE_POWERBI_REPORT_ID');
  if (!POWERBI_REPORTS[0]?.groupId) missing.push('VITE_POWERBI_GROUP_ID');
  return { configured: missing.length === 0, missing };
}
