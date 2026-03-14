import type { DatasetInfo } from "./parseData";

export type ChartType = "bar" | "line" | "scatter" | "pie" | "donut" | "histogram" | "heatmap" | "boxplot" | "area";

export interface ChartRecommendation {
  id: string;
  type: ChartType;
  title: string;
  description: string;
  xColumn?: string;
  yColumn?: string;
  columns?: string[];
  priority: number;
}

export function recommendCharts(dataset: DatasetInfo): ChartRecommendation[] {
  const { numericColumns, categoricalColumns, datetimeColumns, data } = dataset;
  const recs: ChartRecommendation[] = [];

  // 1. Category vs Numeric → Bar Chart
  if (categoricalColumns.length > 0 && numericColumns.length > 0) {
    const cat = categoricalColumns[0];
    const num = numericColumns[0];
    recs.push({
      id: `bar-${cat}-${num}`,
      type: "bar",
      title: `${num} by ${cat}`,
      description: `Average ${num} across ${cat} categories`,
      xColumn: cat,
      yColumn: num,
      priority: 10,
    });

    // Category Distribution → Donut Chart
    const uniqueValues = new Set(data.map(r => String(r[cat] || ""))).size;
    if (uniqueValues <= 10) {
      recs.push({
        id: `donut-${cat}`,
        type: "donut",
        title: `${cat} Distribution`,
        description: `Distribution of records across ${cat} categories`,
        xColumn: cat,
        priority: 8,
      });
    }
  }

  // 2. Date vs Numeric → Line Chart
  if (datetimeColumns.length > 0 && numericColumns.length > 0) {
    const dateCol = datetimeColumns[0];
    const numCol = numericColumns[0];
    recs.push({
      id: `line-${dateCol}-${numCol}`,
      type: "line",
      title: `${numCol} Over Time`,
      description: `Trend of ${numCol} across ${dateCol}`,
      xColumn: dateCol,
      yColumn: numCol,
      priority: 9,
    });
  }

  // 3. Numeric vs Numeric → Scatter Plot
  if (numericColumns.length >= 2) {
    recs.push({
      id: `scatter-${numericColumns[0]}-${numericColumns[1]}`,
      type: "scatter",
      title: `${numericColumns[0]} vs ${numericColumns[1]}`,
      description: `Relationship between ${numericColumns[0]} and ${numericColumns[1]}`,
      xColumn: numericColumns[0],
      yColumn: numericColumns[1],
      priority: 7,
    });
  }

  // 4. Numeric Distribution → Histogram
  if (numericColumns.length > 0) {
    const col = numericColumns[0];
    recs.push({
      id: `histogram-${col}`,
      type: "histogram",
      title: `Distribution of ${col}`,
      description: `Frequency distribution of ${col} values`,
      xColumn: col,
      priority: 6,
    });
  }

  // 5. Multiple Numeric → Correlation Heatmap
  if (numericColumns.length >= 3) {
    recs.push({
      id: "heatmap-correlation",
      type: "heatmap",
      title: "Correlation Heatmap",
      description: `Pearson correlations between ${numericColumns.length} numeric columns`,
      columns: numericColumns.slice(0, 10),
      priority: 5,
    });
  }

  // 6. Outlier Detection → Box Plot
  if (numericColumns.length > 0) {
    recs.push({
      id: "boxplot-outliers",
      type: "boxplot",
      title: "Outlier Analysis",
      description: `Box plot showing quartiles and outliers for numeric columns`,
      columns: numericColumns.slice(0, 6),
      priority: 4,
    });
  }

  // 7. Second bar chart with different columns if available
  if (categoricalColumns.length > 0 && numericColumns.length >= 2) {
    const cat = categoricalColumns[0];
    const num = numericColumns[1];
    recs.push({
      id: `bar-${cat}-${num}`,
      type: "bar",
      title: `${num} by ${cat}`,
      description: `Average ${num} across ${cat} categories`,
      xColumn: cat,
      yColumn: num,
      priority: 3,
    });
  }

  // 8. Area chart for date + second numeric
  if (datetimeColumns.length > 0 && numericColumns.length >= 2) {
    recs.push({
      id: `area-${datetimeColumns[0]}-${numericColumns[1]}`,
      type: "area",
      title: `${numericColumns[1]} Trend`,
      description: `Area trend of ${numericColumns[1]} over time`,
      xColumn: datetimeColumns[0],
      yColumn: numericColumns[1],
      priority: 2,
    });
  }

  return recs.sort((a, b) => b.priority - a.priority);
}
