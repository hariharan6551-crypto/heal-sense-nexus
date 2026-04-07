import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * GET /api/health
 *
 * Simple health check endpoint.
 * Useful for monitoring and verifying the API is up before connecting Power BI.
 */
export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    return res.status(200).end();
  }

  return res.status(200).json({
    status: 'ok',
    service: 'enterprise-analytics-api',
    timestamp: new Date().toISOString(),
    endpoints: [
      { path: '/api/health', description: 'Health check (this endpoint)' },
      { path: '/api/dashboard-data', description: 'Full dataset as JSON for Power BI' },
      { path: '/api/metadata', description: 'Dataset schema and column metadata' },
    ],
  });
}
