import type { VercelRequest, VercelResponse } from '@vercel/node';
import { readFileSync } from 'fs';
import { join } from 'path';
import Papa from 'papaparse';

/**
 * GET /api/dashboard-data
 *
 * Returns the full dataset from sample_data.csv as structured JSON.
 * Power BI can connect to this endpoint via Get Data → Web.
 *
 * Query parameters:
 *   ?format=records  (default) — array of row objects
 *   ?format=table    — columnar format with separate arrays per column
 *   ?region=North    — filter by region
 *   ?product=Widget+A — filter by product
 */
export default function handler(req: VercelRequest, res: VercelResponse) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed. Use GET.' });
  }

  try {
    // Read the CSV file from the public directory
    const csvPath = join(process.cwd(), 'public', 'sample_data.csv');
    const csvContent = readFileSync(csvPath, 'utf-8');

    // Parse CSV to JSON
    const parsed = Papa.parse(csvContent, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true, // auto-casts numbers and booleans
    });

    if (parsed.errors.length > 0) {
      return res.status(500).json({
        error: 'CSV parsing failed',
        details: parsed.errors.slice(0, 5),
      });
    }

    let data = parsed.data as Record<string, any>[];

    // Apply optional filters
    const { region, product, format } = req.query;

    if (region && typeof region === 'string') {
      data = data.filter(
        (row) => String(row.Region).toLowerCase() === region.toLowerCase()
      );
    }

    if (product && typeof product === 'string') {
      data = data.filter(
        (row) => String(row.Product).toLowerCase() === product.toLowerCase()
      );
    }

    // Determine response format
    const columns = parsed.meta.fields || Object.keys(data[0] || {});

    if (format === 'table') {
      // Columnar format — useful for certain Power BI scenarios
      const tableData: Record<string, any[]> = {};
      for (const col of columns) {
        tableData[col] = data.map((row) => row[col]);
      }

      return res.status(200).json({
        dataset: 'enterprise-analytics',
        timestamp: new Date().toISOString(),
        recordCount: data.length,
        format: 'table',
        columns,
        data: tableData,
      });
    }

    // Default: records format (array of objects)
    return res.status(200).json({
      dataset: 'heal-sense-nexus',
      timestamp: new Date().toISOString(),
      recordCount: data.length,
      format: 'records',
      columns,
      data,
    });
  } catch (err: any) {
    console.error('Error in /api/dashboard-data:', err);
    return res.status(500).json({
      error: 'Internal server error',
      message: err.message || 'Failed to load dataset',
    });
  }
}
