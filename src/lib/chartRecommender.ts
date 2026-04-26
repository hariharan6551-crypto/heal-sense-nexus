import type { DatasetInfo } from "./parseData";

export type ChartType =
  | "bar" | "stacked_bar" | "line" | "area" | "scatter"
  | "pie" | "donut" | "funnel" | "radar" | "treemap"
  | "histogram" | "heatmap" | "boxplot" | "bubble";

export interface ChartRecommendation {
  id: string;
  type: ChartType;
  title: string;
  description: string;
  xColumn?: string;
  yColumn?: string;
  columns?: string[];
  sizeColumn?: string;
  priority: number;
}

/** Find the "best" categorical column with fewest unique values (≤ max) */
function bestCatColumn(
  data: Record<string, any>[],
  catCols: string[],
  max: number
): string | null {
  let best: string | null = null;
  let bestUnique = Infinity;
  for (const col of catCols) {
    const u = new Set(data.map(r => String(r[col] ?? ""))).size;
    if (u >= 2 && u <= max && u < bestUnique) {
      bestUnique = u;
      best = col;
    }
  }
  return best;
}

function uniqueCount(data: Record<string, any>[], col: string): number {
  return new Set(data.map(r => String(r[col] || ""))).size;
}

export function recommendCharts(dataset: DatasetInfo): ChartRecommendation[] {
  const { numericColumns, categoricalColumns, datetimeColumns, data } = dataset;
  const recs: ChartRecommendation[] = [];
  let priority = 200;

  // ─── Find ideal columns ──────────────────────────────────────────
  const bestDonutCol = bestCatColumn(data, categoricalColumns, 10);
  const bestPieCol = bestCatColumn(data, categoricalColumns, 8);
  const bestBarCol = bestCatColumn(data, categoricalColumns, 25) || categoricalColumns[0];
  const num = numericColumns[0];

  // ═══ DONUT CHART ═════════════════════════════════════════════════
  // Always show donut if any categorical column has ≤10 unique values
  if (bestDonutCol && numericColumns.length > 0) {
    recs.push({
      id: `donut-${bestDonutCol}`,
      type: "donut",
      title: `${bestDonutCol} Distribution`,
      description: `Proportional breakdown of ${bestDonutCol} categories`,
      xColumn: bestDonutCol,
      yColumn: num,
      priority: priority--,
    });
  }

  // ═══ PIE CHART ═══════════════════════════════════════════════════
  // Always show pie if any categorical column has ≤8 unique values
  if (bestPieCol) {
    // Use a different column than donut if possible
    let pieCol = bestPieCol;
    if (pieCol === bestDonutCol) {
      const alt = categoricalColumns.find(c => c !== bestDonutCol && uniqueCount(data, c) <= 8 && uniqueCount(data, c) >= 2);
      if (alt) pieCol = alt;
    }
    recs.push({
      id: `pie-${pieCol}`,
      type: "pie",
      title: `${pieCol} Breakdown`,
      description: `Percentage breakdown of ${pieCol} categories`,
      xColumn: pieCol,
      yColumn: numericColumns.length > 0 ? num : undefined,
      priority: priority--,
    });
  }

  // ═══ BAR CHARTS ══════════════════════════════════════════════════
  if (bestBarCol && numericColumns.length > 0) {
    recs.push({
      id: `bar-${bestBarCol}-${num}`,
      type: "bar",
      title: `${num} by ${bestBarCol}`,
      description: `Average ${num} across ${bestBarCol} categories`,
      xColumn: bestBarCol, yColumn: num,
      priority: priority--,
    });

    // Stacked bar with two categoricals
    // (Removed per task requirements)

    // Second bar with different numeric
    if (numericColumns.length >= 2) {
      recs.push({
        id: `bar-${bestBarCol}-${numericColumns[1]}`,
        type: "bar",
        title: `${numericColumns[1]} by ${bestBarCol}`,
        description: `Average ${numericColumns[1]} across ${bestBarCol}`,
        xColumn: bestBarCol, yColumn: numericColumns[1],
        priority: priority--,
      });
    }
  }

  // ═══ FUNNEL ══════════════════════════════════════════════════════
  // (Removed per task requirements)

  // ═══ RADAR ═══════════════════════════════════════════════════════
  // (Removed per task requirements)

  // ═══ TREEMAP ═════════════════════════════════════════════════════
  // (Removed per task requirements)

  // ═══ TIME SERIES ═════════════════════════════════════════════════
  if (datetimeColumns.length > 0 && numericColumns.length > 0) {
    const d = datetimeColumns[0];
    recs.push({
      id: `line-${d}-${num}`, type: "line",
      title: `${num} Over Time`, description: `Trend of ${num} across ${d}`,
      xColumn: d, yColumn: num, priority: priority--,
    });
    recs.push({
      id: `area-${d}-${num}`, type: "area",
      title: `${num} Area Trend`, description: `Area trend of ${num} over time`,
      xColumn: d, yColumn: num, priority: priority--,
    });
  }

  // ═══ SCATTER & BUBBLE ════════════════════════════════════════════
  // (Removed per task requirements)

  // ═══ HISTOGRAM ═══════════════════════════════════════════════════
  if (numericColumns.length > 0) {
    recs.push({
      id: `histogram-${num}`, type: "histogram",
      title: `Distribution of ${num}`,
      description: `Frequency distribution of ${num}`,
      xColumn: num, priority: priority--,
    });
  }

  // ═══ HEATMAP ═════════════════════════════════════════════════════
  if (numericColumns.length >= 3) {
    recs.push({
      id: "heatmap-corr", type: "heatmap",
      title: "Correlation Heatmap",
      description: `Pearson correlations between ${numericColumns.length} numeric columns`,
      columns: numericColumns.slice(0, 10), priority: priority--,
    });
  }

  // ═══ BOX PLOT ════════════════════════════════════════════════════
  if (numericColumns.length > 0) {
    recs.push({
      id: "boxplot-outliers", type: "boxplot",
      title: "Outlier Analysis",
      description: "Box plot showing quartiles and outliers",
      columns: numericColumns.slice(0, 6), priority: priority--,
    });
  }

  return recs.sort((a, b) => b.priority - a.priority);
}
