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

export function recommendCharts(dataset: DatasetInfo): ChartRecommendation[] {
  const { numericColumns, categoricalColumns, datetimeColumns, data } = dataset;
  const recs: ChartRecommendation[] = [];
  let priority = 100;

  // ── Categorical + Numeric combos ─────────────────────────────────
  if (categoricalColumns.length > 0 && numericColumns.length > 0) {
    const cat = categoricalColumns[0];
    const num = numericColumns[0];
    const uniqueValues = new Set(data.map(r => String(r[cat] || ""))).size;

    // Bar chart — always useful for category vs numeric
    recs.push({
      id: `bar-${cat}-${num}`,
      type: "bar",
      title: `${num} by ${cat}`,
      description: `Average ${num} across ${cat} categories`,
      xColumn: cat, yColumn: num,
      priority: priority--,
    });

    // Donut — great for distribution with ≤10 categories
    if (uniqueValues <= 10) {
      recs.push({
        id: `donut-${cat}`,
        type: "donut",
        title: `${cat} Distribution`,
        description: `Proportional breakdown of ${cat}`,
        xColumn: cat,
        priority: priority--,
      });
    }

    // Pie — good for ≤6 categories
    if (uniqueValues <= 6) {
      recs.push({
        id: `pie-${cat}`,
        type: "pie",
        title: `${cat} Breakdown`,
        description: `Pie chart showing ${cat} proportions`,
        xColumn: cat,
        priority: priority--,
      });
    }

    // Funnel — for process stages or ranked categories
    if (uniqueValues >= 3 && uniqueValues <= 8) {
      recs.push({
        id: `funnel-${cat}-${num}`,
        type: "funnel",
        title: `${cat} Funnel`,
        description: `Funnel view of ${num} across ${cat} stages`,
        xColumn: cat, yColumn: num,
        priority: priority--,
      });
    }

    // Radar — multi-metric comparison
    if (numericColumns.length >= 3 && uniqueValues <= 6) {
      recs.push({
        id: `radar-${cat}`,
        type: "radar",
        title: `${cat} Multi-Metric`,
        description: `Radar comparison across metrics for ${cat}`,
        xColumn: cat,
        columns: numericColumns.slice(0, 5),
        priority: priority--,
      });
    }

    // Treemap — hierarchical view
    if (uniqueValues >= 3 && uniqueValues <= 25) {
      recs.push({
        id: `treemap-${cat}-${num}`,
        type: "treemap",
        title: `${cat} Treemap`,
        description: `Size-mapped view of ${num} by ${cat}`,
        xColumn: cat, yColumn: num,
        priority: priority--,
      });
    }

    // Stacked bar — with second categorical or numeric
    if (categoricalColumns.length >= 2 && numericColumns.length >= 1) {
      recs.push({
        id: `stacked-${categoricalColumns[0]}-${categoricalColumns[1]}`,
        type: "stacked_bar",
        title: `${num} by ${categoricalColumns[0]} & ${categoricalColumns[1]}`,
        description: `Stacked comparison across two categories`,
        xColumn: categoricalColumns[0],
        yColumn: num,
        sizeColumn: categoricalColumns[1],
        priority: priority--,
      });
    }

    // Second bar chart with different columns
    if (numericColumns.length >= 2) {
      recs.push({
        id: `bar-${cat}-${numericColumns[1]}`,
        type: "bar",
        title: `${numericColumns[1]} by ${cat}`,
        description: `Average ${numericColumns[1]} across ${cat}`,
        xColumn: cat, yColumn: numericColumns[1],
        priority: priority--,
      });
    }
  }

  // ── Time series ──────────────────────────────────────────────────
  if (datetimeColumns.length > 0 && numericColumns.length > 0) {
    const dateCol = datetimeColumns[0];
    recs.push({
      id: `line-${dateCol}-${numericColumns[0]}`,
      type: "line",
      title: `${numericColumns[0]} Over Time`,
      description: `Trend of ${numericColumns[0]} across ${dateCol}`,
      xColumn: dateCol, yColumn: numericColumns[0],
      priority: priority--,
    });
    recs.push({
      id: `area-${dateCol}-${numericColumns[0]}`,
      type: "area",
      title: `${numericColumns[0]} Area Trend`,
      description: `Area trend of ${numericColumns[0]} over time`,
      xColumn: dateCol, yColumn: numericColumns[0],
      priority: priority--,
    });
  }

  // ── Numeric vs Numeric ───────────────────────────────────────────
  if (numericColumns.length >= 2) {
    recs.push({
      id: `scatter-${numericColumns[0]}-${numericColumns[1]}`,
      type: "scatter",
      title: `${numericColumns[0]} vs ${numericColumns[1]}`,
      description: `Relationship between ${numericColumns[0]} and ${numericColumns[1]}`,
      xColumn: numericColumns[0], yColumn: numericColumns[1],
      priority: priority--,
    });

    // Bubble chart with 3 numeric dimensions
    if (numericColumns.length >= 3) {
      recs.push({
        id: `bubble-${numericColumns[0]}-${numericColumns[1]}`,
        type: "bubble",
        title: `${numericColumns[0]} vs ${numericColumns[1]} (sized by ${numericColumns[2]})`,
        description: `Bubble chart with three numeric dimensions`,
        xColumn: numericColumns[0], yColumn: numericColumns[1],
        sizeColumn: numericColumns[2],
        priority: priority--,
      });
    }
  }

  // ── Distribution ─────────────────────────────────────────────────
  if (numericColumns.length > 0) {
    recs.push({
      id: `histogram-${numericColumns[0]}`,
      type: "histogram",
      title: `Distribution of ${numericColumns[0]}`,
      description: `Frequency distribution of ${numericColumns[0]} values`,
      xColumn: numericColumns[0],
      priority: priority--,
    });
  }

  // ── Correlation heatmap ──────────────────────────────────────────
  if (numericColumns.length >= 3) {
    recs.push({
      id: "heatmap-correlation",
      type: "heatmap",
      title: "Correlation Heatmap",
      description: `Pearson correlations between ${numericColumns.length} numeric columns`,
      columns: numericColumns.slice(0, 10),
      priority: priority--,
    });
  }

  // ── Box plot ─────────────────────────────────────────────────────
  if (numericColumns.length > 0) {
    recs.push({
      id: "boxplot-outliers",
      type: "boxplot",
      title: "Outlier Analysis",
      description: "Box plot showing quartiles and outliers",
      columns: numericColumns.slice(0, 6),
      priority: priority--,
    });
  }

  return recs.sort((a, b) => b.priority - a.priority);
}
