import type { DatasetInfo } from "./parseData";

export interface ColumnStats {
  column: string;
  mean: number;
  median: number;
  min: number;
  max: number;
  stdDev: number;
  q1: number;
  q3: number;
  iqr: number;
  skewness: number;
  outlierCount: number;
  outliers: number[];
}

export interface CorrelationEntry {
  col1: string;
  col2: string;
  value: number;
}

export interface DataAnalysis {
  columnStats: ColumnStats[];
  correlationMatrix: CorrelationEntry[];
  strongCorrelations: CorrelationEntry[];
  topOutlierColumns: string[];
}

function getNumericValues(data: Record<string, any>[], col: string): number[] {
  return data
    .map(r => r[col])
    .filter(v => v !== null && v !== undefined && !isNaN(Number(v)))
    .map(Number);
}

function median(sorted: number[]): number {
  const n = sorted.length;
  if (n === 0) return 0;
  const mid = Math.floor(n / 2);
  return n % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

function quartile(sorted: number[], q: number): number {
  if (sorted.length === 0) return 0;
  const pos = (sorted.length - 1) * q;
  const base = Math.floor(pos);
  const rest = pos - base;
  if (sorted[base + 1] !== undefined) {
    return sorted[base] + rest * (sorted[base + 1] - sorted[base]);
  }
  return sorted[base];
}

function stdDev(values: number[], mean: number): number {
  if (values.length <= 1) return 0;
  const squaredDiffs = values.map(v => (v - mean) ** 2);
  return Math.sqrt(squaredDiffs.reduce((a, b) => a + b, 0) / (values.length - 1));
}

function skewness(values: number[], mean: number, sd: number): number {
  if (sd === 0 || values.length < 3) return 0;
  const n = values.length;
  const sum = values.reduce((s, v) => s + ((v - mean) / sd) ** 3, 0);
  return (n / ((n - 1) * (n - 2))) * sum;
}

function pearsonCorrelation(x: number[], y: number[]): number {
  const n = Math.min(x.length, y.length);
  if (n < 3) return 0;

  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0, sumY2 = 0;
  for (let i = 0; i < n; i++) {
    sumX += x[i];
    sumY += y[i];
    sumXY += x[i] * y[i];
    sumX2 += x[i] * x[i];
    sumY2 += y[i] * y[i];
  }

  const denom = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
  if (denom === 0) return 0;
  return (n * sumXY - sumX * sumY) / denom;
}

export function computeColumnStats(data: Record<string, any>[], col: string): ColumnStats {
  const values = getNumericValues(data, col);
  if (values.length === 0) {
    return { column: col, mean: 0, median: 0, min: 0, max: 0, stdDev: 0, q1: 0, q3: 0, iqr: 0, skewness: 0, outlierCount: 0, outliers: [] };
  }

  const sorted = [...values].sort((a, b) => a - b);
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const med = median(sorted);
  const q1Val = quartile(sorted, 0.25);
  const q3Val = quartile(sorted, 0.75);
  const iqr = q3Val - q1Val;
  const sd = stdDev(values, mean);
  const skew = skewness(values, mean, sd);

  const lowerBound = q1Val - 1.5 * iqr;
  const upperBound = q3Val + 1.5 * iqr;
  const outliers = values.filter(v => v < lowerBound || v > upperBound);

  return {
    column: col,
    mean: +mean.toFixed(4),
    median: +med.toFixed(4),
    min: sorted[0],
    max: sorted[sorted.length - 1],
    stdDev: +sd.toFixed(4),
    q1: +q1Val.toFixed(4),
    q3: +q3Val.toFixed(4),
    iqr: +iqr.toFixed(4),
    skewness: +skew.toFixed(4),
    outlierCount: outliers.length,
    outliers: outliers.slice(0, 20), // cap for display
  };
}

export function analyzeDataset(dataset: DatasetInfo): DataAnalysis {
  const { data, numericColumns } = dataset;

  // Column statistics
  const columnStats = numericColumns.map(col => computeColumnStats(data, col));

  // Correlation matrix
  const correlationMatrix: CorrelationEntry[] = [];
  const numericVectors: Record<string, number[]> = {};

  for (const col of numericColumns) {
    numericVectors[col] = getNumericValues(data, col);
  }

  for (let i = 0; i < numericColumns.length; i++) {
    for (let j = i; j < numericColumns.length; j++) {
      const val = i === j ? 1 : pearsonCorrelation(numericVectors[numericColumns[i]], numericVectors[numericColumns[j]]);
      correlationMatrix.push({
        col1: numericColumns[i],
        col2: numericColumns[j],
        value: +val.toFixed(4),
      });
      if (i !== j) {
        correlationMatrix.push({
          col1: numericColumns[j],
          col2: numericColumns[i],
          value: +val.toFixed(4),
        });
      }
    }
  }

  // Strong correlations (|r| > 0.5, excluding self)
  const strongCorrelations = correlationMatrix
    .filter(e => e.col1 !== e.col2 && Math.abs(e.value) > 0.5)
    .filter((e, i, arr) => arr.findIndex(x => 
      (x.col1 === e.col2 && x.col2 === e.col1)
    ) >= i) // deduplicate pairs
    .sort((a, b) => Math.abs(b.value) - Math.abs(a.value));

  // Columns with most outliers
  const topOutlierColumns = columnStats
    .filter(s => s.outlierCount > 0)
    .sort((a, b) => b.outlierCount - a.outlierCount)
    .slice(0, 5)
    .map(s => s.column);

  return {
    columnStats,
    correlationMatrix,
    strongCorrelations,
    topOutlierColumns,
  };
}
