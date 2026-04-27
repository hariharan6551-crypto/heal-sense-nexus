// ============================================================================
// Power BI Token Endpoint — Vercel Serverless Function
// Handles Azure AD client_credentials flow + Power BI embed token generation
// ============================================================================
import type { VercelRequest, VercelResponse } from '@vercel/node';

// Azure AD + Power BI config (server-side only, not exposed to client)
const AZURE_CONFIG = {
  clientId: process.env.VITE_POWERBI_CLIENT_ID || process.env.POWERBI_CLIENT_ID || '',
  clientSecret: process.env.POWERBI_CLIENT_SECRET || '',
  tenantId: process.env.VITE_POWERBI_TENANT_ID || process.env.POWERBI_TENANT_ID || '',
  authority: `https://login.microsoftonline.com/${process.env.VITE_POWERBI_TENANT_ID || process.env.POWERBI_TENANT_ID || 'common'}`,
  scope: 'https://analysis.windows.net/powerbi/api/.default',
};

/**
 * Step 1: Acquire Azure AD access token via client_credentials grant
 */
async function acquireAzureADToken(): Promise<string> {
  const tokenUrl = `${AZURE_CONFIG.authority}/oauth2/v2.0/token`;

  const body = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: AZURE_CONFIG.clientId,
    client_secret: AZURE_CONFIG.clientSecret,
    scope: AZURE_CONFIG.scope,
  });

  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Azure AD token error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  return data.access_token;
}

/**
 * Step 2: Generate Power BI embed token via REST API
 */
async function generateEmbedToken(
  azureToken: string,
  reportId: string,
  groupId: string,
  datasetId?: string
): Promise<{
  token: string;
  tokenId: string;
  expiration: string;
  embedUrl: string;
}> {
  // First, get the report's embed URL
  const reportUrl = `https://api.powerbi.com/v1.0/myorg/groups/${groupId}/reports/${reportId}`;

  const reportResponse = await fetch(reportUrl, {
    headers: { Authorization: `Bearer ${azureToken}` },
  });

  if (!reportResponse.ok) {
    const errorText = await reportResponse.text();
    throw new Error(`Power BI report fetch error (${reportResponse.status}): ${errorText}`);
  }

  const reportData = await reportResponse.json();
  const embedUrl = reportData.embedUrl;

  // Generate embed token
  const tokenUrl = `https://api.powerbi.com/v1.0/myorg/groups/${groupId}/reports/${reportId}/GenerateToken`;

  const tokenBody: any = {
    accessLevel: 'View',
    allowSaveAs: false,
  };

  // If dataset ID provided, include it for row-level security
  if (datasetId) {
    tokenBody.datasetId = datasetId;
  }

  const tokenResponse = await fetch(tokenUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${azureToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(tokenBody),
  });

  if (!tokenResponse.ok) {
    const errorText = await tokenResponse.text();
    throw new Error(`Embed token generation error (${tokenResponse.status}): ${errorText}`);
  }

  const tokenData = await tokenResponse.json();

  return {
    token: tokenData.token,
    tokenId: tokenData.tokenId,
    expiration: tokenData.expiration,
    embedUrl,
  };
}

/**
 * Main API handler
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Validate server-side config
  if (!AZURE_CONFIG.clientId || !AZURE_CONFIG.clientSecret || !AZURE_CONFIG.tenantId) {
    return res.status(500).json({
      error: 'Server configuration incomplete',
      details: 'Missing Azure AD credentials. Set POWERBI_CLIENT_ID, POWERBI_CLIENT_SECRET, and POWERBI_TENANT_ID environment variables.',
    });
  }

  try {
    const { reportId, groupId, datasetId } = req.body || {};

    if (!reportId || !groupId) {
      return res.status(400).json({ error: 'Missing required fields: reportId, groupId' });
    }

    // Step 1: Get Azure AD token
    const azureToken = await acquireAzureADToken();

    // Step 2: Generate embed token
    const embedToken = await generateEmbedToken(azureToken, reportId, groupId, datasetId);

    // Return embed config to frontend
    return res.status(200).json({
      reportId,
      embedUrl: embedToken.embedUrl,
      accessToken: embedToken.token,
      tokenType: 'Embed',
      expiration: embedToken.expiration,
      tokenId: embedToken.tokenId,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[PowerBI Token API] Error:', message);

    return res.status(500).json({
      error: 'Token generation failed',
      details: message,
    });
  }
}
