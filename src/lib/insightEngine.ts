import type { DatasetInfo } from "./parseData";
import type { DataAnalysis } from "./analyzeData";

export type InsightType = "trend" | "correlation" | "anomaly" | "quality" | "distribution" | "top_performer";

export interface Insight {
  id: string;
  type: InsightType;
  title: string;
  description: string;
  severity: "info" | "warning" | "critical";
}

export function generateInsights(dataset: DatasetInfo, analysis: DataAnalysis): Insight[] {
  const insights: Insight[] = [];
  const { data, numericColumns, categoricalColumns, datetimeColumns } = dataset;
  const { columnStats, strongCorrelations, topOutlierColumns } = analysis;

  // 1. Data quality insights
  const missingPct = ((dataset.missingValueCount / (dataset.totalRows * dataset.totalColumns)) * 100);
  if (missingPct > 0) {
    insights.push({
      id: "quality-missing",
      type: "quality",
      title: "Missing Values Detected",
      description: `${dataset.missingValueCount.toLocaleString()} missing values found across the dataset (${missingPct.toFixed(1)}% of all cells).${missingPct > 10 ? " Consider data cleaning before analysis." : ""}`,
      severity: missingPct > 20 ? "critical" : missingPct > 5 ? "warning" : "info",
    });
  }

  if (dataset.duplicateRowCount > 0) {
    const dupPct = ((dataset.duplicateRowCount / dataset.totalRows) * 100).toFixed(1);
    insights.push({
      id: "quality-duplicates",
      type: "quality",
      title: "Duplicate Records Found",
      description: `${dataset.duplicateRowCount.toLocaleString()} duplicate rows detected (${dupPct}% of dataset).`,
      severity: dataset.duplicateRowCount > dataset.totalRows * 0.1 ? "warning" : "info",
    });
  }

  // 2. Correlation insights
  for (const corr of strongCorrelations.slice(0, 3)) {
    const strength = Math.abs(corr.value) > 0.8 ? "strong" : "moderate";
    const direction = corr.value > 0 ? "positive" : "negative";
    insights.push({
      id: `corr-${corr.col1}-${corr.col2}`,
      type: "correlation",
      title: `${strength.charAt(0).toUpperCase() + strength.slice(1)} Correlation Found`,
      description: `"${corr.col1}" and "${corr.col2}" show a ${strength} ${direction} correlation (r = ${corr.value.toFixed(2)}). ${direction === "positive" ? "They tend to increase together." : "As one increases, the other tends to decrease."}`,
      severity: Math.abs(corr.value) > 0.8 ? "warning" : "info",
    });
  }

  // 3. Outlier insights
  for (const col of topOutlierColumns.slice(0, 2)) {
    const stat = columnStats.find(s => s.column === col);
    if (stat) {
      insights.push({
        id: `outlier-${col}`,
        type: "anomaly",
        title: `Outliers in "${col}"`,
        description: `${stat.outlierCount} outlier values detected in "${col}" (range: ${stat.min.toLocaleString()} – ${stat.max.toLocaleString()}, IQR: ${stat.iqr.toFixed(2)}). These may indicate anomalies worth investigating.`,
        severity: stat.outlierCount > data.length * 0.05 ? "warning" : "info",
      });
    }
  }

  // 4. Distribution insights (skewness)
  for (const stat of columnStats.slice(0, 5)) {
    if (Math.abs(stat.skewness) > 1.5) {
      const direction = stat.skewness > 0 ? "right (positively)" : "left (negatively)";
      insights.push({
        id: `skew-${stat.column}`,
        type: "distribution",
        title: `Skewed Distribution: "${stat.column}"`,
        description: `"${stat.column}" has a skewness of ${stat.skewness.toFixed(2)}, indicating a ${direction} skewed distribution. The median (${stat.median.toLocaleString()}) differs significantly from the mean (${stat.mean.toLocaleString()}).`,
        severity: "info",
      });
    }
  }

  // 5. Top performing categories
  if (categoricalColumns.length > 0 && numericColumns.length > 0) {
    const catCol = categoricalColumns[0];
    const numCol = numericColumns[0];

    const grouped: Record<string, { sum: number; count: number }> = {};
    for (const row of data) {
      const key = String(row[catCol] || "Unknown");
      if (!grouped[key]) grouped[key] = { sum: 0, count: 0 };
      grouped[key].sum += Number(row[numCol]) || 0;
      grouped[key].count++;
    }

    const sorted = Object.entries(grouped)
      .map(([name, { sum, count }]) => ({ name, avg: sum / count }))
      .sort((a, b) => b.avg - a.avg);

    if (sorted.length >= 2) {
      const top = sorted[0];
      const bottom = sorted[sorted.length - 1];
      insights.push({
        id: "top-cat",
        type: "top_performer",
        title: "Top Performing Category",
        description: `For "${numCol}" grouped by "${catCol}": "${top.name}" leads with an average of ${top.avg.toFixed(2)}, while "${bottom.name}" is lowest at ${bottom.avg.toFixed(2)}.`,
        severity: "info",
      });
    }
  }

  // 6. Time trend insights
  if (datetimeColumns.length > 0 && numericColumns.length > 0) {
    const dateCol = datetimeColumns[0];
    const numCol = numericColumns[0];

    const validRows = data
      .filter(r => r[dateCol] && r[numCol] !== null)
      .map(r => ({ date: new Date(String(r[dateCol])), value: Number(r[numCol]) || 0 }))
      .filter(r => !isNaN(r.date.getTime()))
      .sort((a, b) => a.date.getTime() - b.date.getTime());

    if (validRows.length >= 4) {
      const firstHalf = validRows.slice(0, Math.floor(validRows.length / 2));
      const secondHalf = validRows.slice(Math.floor(validRows.length / 2));
      const avgFirst = firstHalf.reduce((s, r) => s + r.value, 0) / firstHalf.length;
      const avgSecond = secondHalf.reduce((s, r) => s + r.value, 0) / secondHalf.length;

      const changePct = avgFirst !== 0 ? ((avgSecond - avgFirst) / Math.abs(avgFirst)) * 100 : 0;
      if (Math.abs(changePct) > 5) {
        const direction = changePct > 0 ? "upward" : "downward";
        insights.push({
          id: "trend-time",
          type: "trend",
          title: `${direction.charAt(0).toUpperCase() + direction.slice(1)} Trend Detected`,
          description: `"${numCol}" shows an ${direction} trend over time (${changePct > 0 ? "+" : ""}${changePct.toFixed(1)}% change from first half to second half of the dataset).`,
          severity: Math.abs(changePct) > 25 ? "warning" : "info",
        });
      }
    }
  }

  // 7. High cardinality warning
  for (const meta of dataset.columnMeta) {
    if (meta.type === "categorical" && meta.uniqueCount > 50) {
      insights.push({
        id: `high-cardinality-${meta.name}`,
        type: "quality",
        title: `High Cardinality: "${meta.name}"`,
        description: `"${meta.name}" has ${meta.uniqueCount} unique values, which may be too many for meaningful categorical analysis. Consider grouping or filtering.`,
        severity: "info",
      });
    }
  }

  return insights;
}
