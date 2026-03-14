import { useState, useMemo } from "react";
import { Settings2 } from "lucide-react";
import type { DatasetInfo } from "@/lib/parseData";
import type { ChartType } from "@/lib/chartRecommender";
import DynamicChart from "./DynamicChart";

interface ChartControlsProps {
  dataset: DatasetInfo;
  filteredData: Record<string, any>[];
}

const CHART_TYPES: { value: ChartType; label: string }[] = [
  { value: "bar", label: "Bar Chart" },
  { value: "line", label: "Line Chart" },
  { value: "scatter", label: "Scatter Plot" },
  { value: "histogram", label: "Histogram" },
  { value: "pie", label: "Pie Chart" },
  { value: "donut", label: "Donut Chart" },
  { value: "area", label: "Area Chart" },
];

const ChartControls = ({ dataset, filteredData }: ChartControlsProps) => {
  const allColumns = dataset.columns;
  const [xCol, setXCol] = useState(allColumns[0] || "");
  const [yCol, setYCol] = useState(dataset.numericColumns[0] || allColumns[1] || "");
  const [chartType, setChartType] = useState<ChartType>("bar");

  const recommendation = useMemo(() => ({
    id: `custom-${chartType}-${xCol}-${yCol}`,
    type: chartType,
    title: `${yCol || xCol} ${yCol ? `by ${xCol}` : ""}`.trim(),
    description: "Custom chart — explore your data interactively",
    xColumn: xCol,
    yColumn: yCol || undefined,
    priority: 0,
  }), [chartType, xCol, yCol]);

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden animate-fade-up">
      <div className="px-5 py-3.5 border-b border-border flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/10">
          <Settings2 className="h-4 w-4 text-cyan-500" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-foreground">Chart Explorer</h3>
          <p className="text-xs text-muted-foreground">Build custom visualizations</p>
        </div>
      </div>

      <div className="p-5">
        {/* Controls */}
        <div className="flex flex-wrap gap-3 mb-5">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Chart Type</label>
            <select
              value={chartType}
              onChange={e => setChartType(e.target.value as ChartType)}
              className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {CHART_TYPES.map(ct => (
                <option key={ct.value} value={ct.value}>{ct.label}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">X-Axis</label>
            <select
              value={xCol}
              onChange={e => setXCol(e.target.value)}
              className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {allColumns.map(col => (
                <option key={col} value={col}>{col}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Y-Axis</label>
            <select
              value={yCol}
              onChange={e => setYCol(e.target.value)}
              className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">None</option>
              {allColumns.map(col => (
                <option key={col} value={col}>{col}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Chart */}
        <DynamicChart
          recommendation={recommendation}
          dataset={dataset}
          filteredData={filteredData}
        />
      </div>
    </div>
  );
};

export default ChartControls;
