/**
 * Build-time script: Converts sample_data.csv → JSON files in public/data/
 * 
 * These JSON files are served as static assets by Vercel and can be consumed
 * by Power BI via "Get Data → Web".
 * 
 * Run automatically before every build via the "prebuild" npm script.
 */

import { readFileSync, writeFileSync, mkdirSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const CSV_PATH = join(ROOT, 'public', 'sample_data.csv');
const OUTPUT_DIR = join(ROOT, 'public', 'data');

// ── Parse CSV ────────────────────────────────────────────────────────────────

function parseCSV(csvText) {
  const lines = csvText.trim().split('\n');
  if (lines.length < 2) return { columns: [], data: [] };

  const columns = lines[0].split(',').map(h => h.trim());
  const data = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim());
    if (values.length !== columns.length) continue;

    const row = {};
    for (let j = 0; j < columns.length; j++) {
      const val = values[j];
      // Cast to number if it looks numeric
      const num = Number(val);
      row[columns[j]] = val !== '' && !isNaN(num) && !/^\d{4}-\d{2}-\d{2}/.test(val)
        ? num
        : val;
    }
    data.push(row);
  }

  return { columns, data };
}

// ── Classify column types ────────────────────────────────────────────────────

function classifyColumn(data, colName) {
  const values = data.map(r => r[colName]).filter(v => v !== null && v !== '' && v !== undefined);
  if (values.length === 0) return 'text';

  const numCount = values.filter(v => typeof v === 'number').length;
  if (numCount > values.length * 0.7) return 'numeric';

  const datePattern = /^\d{4}-\d{1,2}-\d{1,2}/;
  const dateCount = values.filter(v => datePattern.test(String(v))).length;
  if (dateCount > values.length * 0.7) return 'datetime';

  const unique = new Set(values.map(String));
  if (unique.size <= Math.max(20, values.length * 0.5)) return 'categorical';

  return 'text';
}

// ── Generate summary statistics ──────────────────────────────────────────────

function computeSummary(data, columns) {
  const summary = {};
  for (const col of columns) {
    const values = data.map(r => r[col]).filter(v => v !== null && v !== undefined && v !== '');
    const numValues = values.filter(v => typeof v === 'number');

    if (numValues.length > 0) {
      summary[col] = {
        min: Math.min(...numValues),
        max: Math.max(...numValues),
        mean: +(numValues.reduce((a, b) => a + b, 0) / numValues.length).toFixed(2),
        sum: +numValues.reduce((a, b) => a + b, 0).toFixed(2),
        count: numValues.length,
      };
    } else {
      const unique = [...new Set(values.map(String))];
      summary[col] = {
        uniqueValues: unique.length,
        topValues: unique.slice(0, 5),
        count: values.length,
      };
    }
  }
  return summary;
}

// ── Main ─────────────────────────────────────────────────────────────────────

try {
  console.log('📊 Generating Power BI API data files...');

  const csvContent = readFileSync(CSV_PATH, 'utf-8');
  const { columns, data } = parseCSV(csvContent);
  const fileStats = statSync(CSV_PATH);
  const timestamp = new Date().toISOString();

  mkdirSync(OUTPUT_DIR, { recursive: true });

  // 1. Dashboard data (main Power BI endpoint)
  const dashboardData = {
    dataset: 'heal-sense-nexus',
    timestamp,
    recordCount: data.length,
    format: 'records',
    columns,
    data,
  };
  writeFileSync(
    join(OUTPUT_DIR, 'dashboard-data.json'),
    JSON.stringify(dashboardData, null, 2)
  );
  console.log(`  ✅ dashboard-data.json — ${data.length} records`);

  // 2. Metadata
  const columnInfo = columns.map(col => {
    const type = classifyColumn(data, col);
    const values = data.map(r => r[col]).filter(v => v !== null && v !== undefined && String(v).trim() !== '');
    const unique = new Set(values.map(String));
    return {
      name: col,
      type,
      sampleValues: values.slice(0, 3),
      nullCount: data.length - values.length,
      uniqueCount: unique.size,
    };
  });

  const metadata = {
    dataset: 'heal-sense-nexus',
    fileName: 'sample_data.csv',
    fileSizeBytes: fileStats.size,
    lastModified: fileStats.mtime.toISOString(),
    generatedAt: timestamp,
    recordCount: data.length,
    columnCount: columns.length,
    columns: columnInfo,
    powerBI: {
      connectionUrl: 'https://heal-sense-nexus.vercel.app/data/dashboard-data.json',
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
  };
  writeFileSync(
    join(OUTPUT_DIR, 'metadata.json'),
    JSON.stringify(metadata, null, 2)
  );
  console.log('  ✅ metadata.json');

  // 3. Health / status
  const health = {
    status: 'ok',
    service: 'heal-sense-nexus-api',
    generatedAt: timestamp,
    endpoints: [
      { path: '/data/dashboard-data.json', description: 'Full dataset as JSON for Power BI' },
      { path: '/data/metadata.json', description: 'Dataset schema and column metadata' },
      { path: '/data/health.json', description: 'Health check (this file)' },
      { path: '/data/summary.json', description: 'Aggregated summary statistics' },
    ],
  };
  writeFileSync(
    join(OUTPUT_DIR, 'health.json'),
    JSON.stringify(health, null, 2)
  );
  console.log('  ✅ health.json');

  // 4. Summary / aggregated stats (useful for Power BI KPI cards)
  const summaryStats = {
    dataset: 'heal-sense-nexus',
    timestamp,
    recordCount: data.length,
    summary: computeSummary(data, columns),

    // Pre-computed aggregations for Power BI
    byRegion: Object.entries(
      data.reduce((acc, row) => {
        const region = row.Region || 'Unknown';
        if (!acc[region]) acc[region] = { totalRevenue: 0, totalUnits: 0, count: 0, avgRating: 0 };
        acc[region].totalRevenue += row.Revenue || 0;
        acc[region].totalUnits += row.Units_Sold || 0;
        acc[region].count += 1;
        acc[region].avgRating += row.Customer_Rating || 0;
        return acc;
      }, {})
    ).map(([region, stats]) => ({
      Region: region,
      TotalRevenue: +stats.totalRevenue.toFixed(2),
      TotalUnits: stats.totalUnits,
      RecordCount: stats.count,
      AvgCustomerRating: +(stats.avgRating / stats.count).toFixed(2),
    })),

    byProduct: Object.entries(
      data.reduce((acc, row) => {
        const product = row.Product || 'Unknown';
        if (!acc[product]) acc[product] = { totalRevenue: 0, totalUnits: 0, count: 0, avgMargin: 0 };
        acc[product].totalRevenue += row.Revenue || 0;
        acc[product].totalUnits += row.Units_Sold || 0;
        acc[product].count += 1;
        acc[product].avgMargin += row.Profit_Margin || 0;
        return acc;
      }, {})
    ).map(([product, stats]) => ({
      Product: product,
      TotalRevenue: +stats.totalRevenue.toFixed(2),
      TotalUnits: stats.totalUnits,
      RecordCount: stats.count,
      AvgProfitMargin: +(stats.avgMargin / stats.count).toFixed(2),
    })),
  };
  writeFileSync(
    join(OUTPUT_DIR, 'summary.json'),
    JSON.stringify(summaryStats, null, 2)
  );
  console.log('  ✅ summary.json');

  console.log('\n🎉 All Power BI data files generated in public/data/');
} catch (err) {
  console.error('❌ Failed to generate API data:', err.message);
  process.exit(1);
}
