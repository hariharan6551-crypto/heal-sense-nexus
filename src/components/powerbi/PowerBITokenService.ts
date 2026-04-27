// ============================================================================
// Power BI Token Service — Frontend token acquisition & caching
// Handles Azure AD token lifecycle with automatic refresh
// ============================================================================

import { POWERBI_SETTINGS } from './PowerBIConfig';

export interface EmbedToken {
  token: string;
  tokenId: string;
  expiration: string;
}

export interface EmbedConfig {
  reportId: string;
  embedUrl: string;
  accessToken: string;
  tokenType: 'Aad' | 'Embed';
  expiry: number;
}

// In-memory token cache
let cachedToken: EmbedConfig | null = null;
let tokenRefreshTimer: ReturnType<typeof setTimeout> | null = null;

/**
 * Acquire an embed token from the backend token service.
 * The backend handles Azure AD authentication (client_credentials flow)
 * and calls the Power BI REST API to generate an embed token.
 */
export async function acquireEmbedToken(
  reportId: string,
  groupId: string,
  datasetId?: string
): Promise<EmbedConfig> {
  // Check cache first — reuse if not expired (5-min buffer)
  if (cachedToken && cachedToken.reportId === reportId) {
    const bufferMs = 5 * 60 * 1000;
    if (cachedToken.expiry - Date.now() > bufferMs) {
      return cachedToken;
    }
  }

  const endpoint = POWERBI_SETTINGS.tokenEndpoint;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      reportId,
      groupId,
      datasetId,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Token acquisition failed (${response.status}): ${errorText}`);
  }

  const data = await response.json();

  const embedConfig: EmbedConfig = {
    reportId: data.reportId || reportId,
    embedUrl: data.embedUrl,
    accessToken: data.accessToken,
    tokenType: data.tokenType || 'Embed',
    expiry: new Date(data.expiration).getTime(),
  };

  // Cache the token
  cachedToken = embedConfig;

  // Schedule auto-refresh 5 minutes before expiry
  scheduleTokenRefresh(embedConfig, reportId, groupId, datasetId);

  return embedConfig;
}

/**
 * Schedule automatic token refresh before expiration.
 */
function scheduleTokenRefresh(
  config: EmbedConfig,
  reportId: string,
  groupId: string,
  datasetId?: string
) {
  if (tokenRefreshTimer) {
    clearTimeout(tokenRefreshTimer);
  }

  const refreshTime = config.expiry - Date.now() - 5 * 60 * 1000; // 5 min before expiry
  if (refreshTime > 0) {
    tokenRefreshTimer = setTimeout(async () => {
      try {
        console.log('[PowerBI] Auto-refreshing embed token...');
        await acquireEmbedToken(reportId, groupId, datasetId);
        console.log('[PowerBI] Token refreshed successfully');
      } catch (err) {
        console.error('[PowerBI] Token auto-refresh failed:', err);
      }
    }, refreshTime);
  }
}

/**
 * Clear cached token and cancel refresh timer.
 */
export function clearTokenCache(): void {
  cachedToken = null;
  if (tokenRefreshTimer) {
    clearTimeout(tokenRefreshTimer);
    tokenRefreshTimer = null;
  }
}

/**
 * Trigger a manual dataset refresh via Power BI REST API (through backend proxy).
 */
export async function triggerDatasetRefresh(
  groupId: string,
  datasetId: string
): Promise<{ success: boolean; message: string }> {
  try {
    const response = await fetch(`${POWERBI_SETTINGS.tokenEndpoint}/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ groupId, datasetId }),
    });

    if (!response.ok) {
      const text = await response.text();
      return { success: false, message: `Refresh failed: ${text}` };
    }

    return { success: true, message: 'Dataset refresh triggered successfully' };
  } catch (err) {
    return { success: false, message: `Refresh error: ${(err as Error).message}` };
  }
}

/**
 * Get the current token status for diagnostics.
 */
export function getTokenStatus(): {
  hasToken: boolean;
  expiresIn: string;
  tokenType: string;
} {
  if (!cachedToken) {
    return { hasToken: false, expiresIn: 'N/A', tokenType: 'N/A' };
  }

  const remaining = cachedToken.expiry - Date.now();
  const minutes = Math.floor(remaining / 60000);
  const seconds = Math.floor((remaining % 60000) / 1000);

  return {
    hasToken: true,
    expiresIn: remaining > 0 ? `${minutes}m ${seconds}s` : 'Expired',
    tokenType: cachedToken.tokenType,
  };
}
