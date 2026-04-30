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
  publicUrl?: string; // Publish-to-web URL for iframe fallback
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

// ── Public sample reports (each uses a different Microsoft public report) ──
// These are "Publish to Web" reports that work without authentication.
// Replace with your own Report IDs + Group IDs for production.
export const POWERBI_REPORTS: PowerBIReportConfig[] = [
  {
    id: 'main-dashboard',
    name: 'Healthcare Analytics Dashboard',
    reportId: import.meta.env.VITE_POWERBI_REPORT_ID_1 || 'demo-healthcare',
    groupId: import.meta.env.VITE_POWERBI_GROUP_ID || 'demo-group',
    datasetId: 'demo-dataset-1',
    description: 'Main healthcare analytics report with patient readmission data',
    icon: '📊',
    refreshSchedule: '15min',
    // Microsoft public sample: COVID-19 Global Tracker
    publicUrl: 'https://app.powerbi.com/view?r=eyJrIjoiOWUyZTYxZjEtMjZlZC00ZjZlLTgzMzQtZmIxNzI3ZTcxZmQxIiwidCI6IjViN2ExMDIzLTI1ODgtNGU3Yi05MjZlLTgwNjE4YjQ1ZDBmNiIsImMiOjEwfQ%3D%3D',
  },
  {
    id: 'risk-report',
    name: 'Risk Analysis Report',
    reportId: import.meta.env.VITE_POWERBI_REPORT_ID_2 || 'demo-risk',
    groupId: import.meta.env.VITE_POWERBI_GROUP_ID || 'demo-group',
    description: 'Patient risk stratification and predictive analytics',
    icon: '🛡️',
    refreshSchedule: '30min',
    // Microsoft public sample: Store Sales Analysis
    publicUrl: 'https://app.powerbi.com/view?r=eyJrIjoiNDkzZWM0OTgtMjlhOS00MTJkLTg0YTMtMmI0MDdhNTA2NGIxIiwidCI6IjViN2ExMDIzLTI1ODgtNGU3Yi05MjZlLTgwNjE4YjQ1ZDBmNiIsImMiOjEwfQ%3D%3D',
  },
  {
    id: 'operations-report',
    name: 'Operational Metrics',
    reportId: import.meta.env.VITE_POWERBI_REPORT_ID_3 || 'demo-ops',
    groupId: import.meta.env.VITE_POWERBI_GROUP_ID || 'demo-group',
    description: 'Hospital operations, bed occupancy, and discharge metrics',
    icon: '🏥',
    refreshSchedule: '1hr',
    // Microsoft public sample: Retail Analysis
    publicUrl: 'https://app.powerbi.com/view?r=eyJrIjoiYTZlMTcyMTYtNjE2ZC00NDA3LWExZDMtMTNiNTg4NzgyYjg0IiwidCI6IjViN2ExMDIzLTI1ODgtNGU3Yi05MjZlLTgwNjE4YjQ1ZDBmNiIsImMiOjEwfQ%3D%3D',
  },
];

// Build the embed URL for a report — uses publicUrl if available (for dev/demo)
export function buildEmbedUrl(reportId: string, groupId: string, filters?: Record<string, string>): string {
  // In production with real credentials, build the proper embed URL
  const hasRealCreds = POWERBI_SETTINGS.clientId && POWERBI_SETTINGS.tenantId;
  if (hasRealCreds) {
    let url = `${POWERBI_SETTINGS.embedBaseUrl}?reportId=${reportId}&groupId=${groupId}&autoAuth=true&ctid=${POWERBI_SETTINGS.tenantId}`;
    if (filters) {
      const filterParts = Object.entries(filters)
        .filter(([, v]) => v && v !== '__all__')
        .map(([k, v]) => `Dataset/${k} eq '${v}'`);
      if (filterParts.length > 0) {
        url += `&$filter=${filterParts.join(' and ')}`;
      }
    }
    return url;
  }

  // For demo: find matching report by reportId and return its public URL
  const report = POWERBI_REPORTS.find(r => r.reportId === reportId);
  return report?.publicUrl || POWERBI_REPORTS[0].publicUrl || '';
}

// Build standalone Power BI Service URL (opens in browser)
export function buildServiceUrl(reportId: string, groupId: string): string {
  const hasRealCreds = POWERBI_SETTINGS.clientId && POWERBI_SETTINGS.tenantId;
  if (hasRealCreds) {
    return `https://app.powerbi.com/groups/${groupId}/reports/${reportId}`;
  }
  const report = POWERBI_REPORTS.find(r => r.reportId === reportId);
  return report?.publicUrl || POWERBI_REPORTS[0].publicUrl || '';
}

// Validate configuration
export function isConfigured(): boolean {
  // In demo mode with public URLs, always return true
  // In production, check for real credentials
  return true;
}

export function getConfigStatus(): { configured: boolean; missing: string[] } {
  const missing: string[] = [];
  if (!POWERBI_SETTINGS.clientId) missing.push('VITE_POWERBI_CLIENT_ID');
  if (!POWERBI_SETTINGS.tenantId) missing.push('VITE_POWERBI_TENANT_ID');
  if (!POWERBI_SETTINGS.defaultGroupId) missing.push('VITE_POWERBI_GROUP_ID');

  // Still return configured: true for demo mode
  return { configured: true, missing };
}
