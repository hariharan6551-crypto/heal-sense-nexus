import type { VercelRequest, VercelResponse } from '@vercel/node';
import { readFileSync, statSync } from 'fs';
import { join } from 'path';
import Papa from 'papaparse';

interface ColumnInfo {
  name: string;
  type: 'numeric' | 'categorical' | 'datetime' | 'text';
  sampleValues: any[];
  nullCount: number;
  uniqueCount: number;
}

/**
 * GET /api/metadata
 *
 * Returns schema metadata about the dataset — column names, types, sample values.
 * Useful for understanding the data structure before building Power BI reports.
 */
export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed. Use GET.' });
  }

  try {
    const csvPath = join(process.cwd(), 'public', 'sample_data.csv');
    const csvContent = readFileSync(csvPath, 'utf-8');
    const fileStats = statSync(csvPath);

    const parsed = Papa.parse(csvContent, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
    });

    const data = parsed.data as Record<string, any>[];
    const columns = parsed.meta.fields || [];

    const columnInfo: ColumnInfo[] = columns.map((col) => {
      const values = data.map((row) => row[col]);
      const nonNull = values.filter(
        (v) => v !== null && v !== undefined && String(v).trim() !== ''
      );
      const uniqueValues = new Set(nonNull.map((v) => String(v)));

      // Classify column type
      let type: ColumnInfo['type'] = 'text';
      if (nonNull.length > 0) {
        const numCount = nonNull.filter((v) => typeof v === 'number' || !isNaN(Number(v))).length;
        if (numCount > nonNull.length * 0.7) {
          type = 'numeric';
        } else {
          // Check for dates
          const datePattern = /^\d{4}[-/]\d{1,2}[-/]\d{1,2}/;
          const dateCount = nonNull.filter((v) => datePattern.test(String(v))).length;
          if (dateCount > nonNull.length * 0.7) {
            type = 'datetime';
          } else if (uniqueValues.size <= Math.max(20, nonNull.length * 0.5)) {
            type = 'categorical';
          }
        }
      }

      return {
        name: col,
        type,
        sampleValues: nonNull.slice(0, 3),
        nullCount: values.length - nonNull.length,
        uniqueCount: uniqueValues.size,
      };
    });

    return res.status(200).json({
      dataset: 'heal-sense-nexus',
      fileName: 'sample_data.csv',
      fileSizeBytes: fileStats.size,
      lastModified: fileStats.mtime.toISOString(),
      recordCount: data.length,
      columnCount: columns.length,
      columns: columnInfo,
      powerBI: {
        connectionUrl: 'https://heal-sense-nexus.vercel.app/api/dashboard-data',
        refreshSupported: true,
        instructions: [
          'Open Power BI Desktop',
          'Click Get Data → Web',
          'Enter the connectionUrl above',
          'Click OK → Power BI will load the JSON',
          'In Power Query Editor, click "Into Table" on the data list',
          'Expand all columns and set proper data types',
          'Click Close & Apply to load data into your report',
        ],
      },
    });
  } catch (err: any) {
    console.error('Error in /api/metadata:', err);
    return res.status(500).json({
      error: 'Internal server error',
      message: err.message || 'Failed to read dataset metadata',
    });
  }
}
