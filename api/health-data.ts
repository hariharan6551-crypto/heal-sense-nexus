import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * GET /api/health-data
 *
 * Example expected API format for Power BI or other BI Tools
 * providing top-level KPI metrics around patients, recovery_rate, critical_cases, etc.
 */
export default function handler(req: VercelRequest, res: VercelResponse) {
  // CORS Handling for external tools (e.g., Power BI Web API connect)
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed. Use GET.' });
  }

  // Set permissive security headers to allow IFRAME embedding
  res.setHeader('X-Frame-Options', 'ALLOWALL'); // Deprecated but helpful explicit allow
  res.setHeader('Access-Control-Allow-Origin', '*');

  try {
    // In a real database configuration, this would execute a Prisma/SQL query
    // Example: const stats = await prisma.patientData.aggregate(...)
    
    // Returning the required structured JSON format
    const responseData = {
      patients: 1200,
      recovery_rate: 82,
      critical_cases: 45,
      admissions_trend: [
        { month: 'Jan', admissions: 120 },
        { month: 'Feb', admissions: 145 },
        { month: 'Mar', admissions: 132 },
        { month: 'Apr', admissions: 156 },
        { month: 'May', admissions: 110 }
      ]
    };

    return res.status(200).json(responseData);
  } catch (err: any) {
    console.error('Error serving health-data API:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
