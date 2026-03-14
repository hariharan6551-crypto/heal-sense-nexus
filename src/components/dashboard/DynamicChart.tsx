import { useMemo } from "react";
import {
  BarChart, Bar, LineChart, Line, ScatterChart, Scatter,
  PieChart, Pie, Cell, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import type { ChartRecommendation } from "@/lib/chartRecommender";
import type { DatasetInfo } from "@/lib/parseData";

const COLORS = [
  "hsl(173, 58%, 39%)", "hsl(199, 89%, 48%)", "hsl(262, 52%, 47%)",
  "hsl(25, 95%, 53%)", "hsl(338, 68%, 51%)", "hsl(152, 60%, 45%)",
  "hsl(45, 90%, 48%)", "hsl(210, 75%, 55%)", "hsl(300, 50%, 50%)",
  "hsl(15, 80%, 55%)",
];

const TOOLTIP_STYLE = {
  borderRadius: "12px",
  border: "none",
  boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
  fontSize: 12,
  padding: "8px 12px",
};

interface DynamicChartProps {
  recommendation: ChartRecommendation;
  dataset: DatasetInfo;
  filteredData: Record<string, any>[];
}

function aggregateByCategory(data: Record<string, any>[], catCol: string, numCol: string) {
  const grouped: Record<string, { sum: number; count: number }> = {};
  for (const row of data) {
    const key = String(row[catCol] || "Unknown");
    if (!grouped[key]) grouped[key] = { sum: 0, count: 0 };
    grouped[key].sum += Number(row[numCol]) || 0;
    grouped[key].count++;
  }
  return Object.entries(grouped)
    .map(([name, { sum, count }]) => ({ name, value: +(sum / count).toFixed(2) }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 15);
}

function buildHistogramData(data: Record<string, any>[], col: string, bins = 15) {
  const values = data.map(r => Number(r[col])).filter(v => !isNaN(v));
  if (values.length === 0) return [];
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min;
  if (range === 0) return [{ bin: String(min), count: values.length }];
  const binWidth = range / bins;

  const buckets = new Array(bins).fill(0);
  for (const v of values) {
    const idx = Math.min(Math.floor((v - min) / binWidth), bins - 1);
    buckets[idx]++;
  }
  return buckets.map((count, i) => ({
    bin: (min + i * binWidth).toFixed(1),
    count,
  }));
}

function buildTimeSeriesData(data: Record<string, any>[], dateCol: string, numCol: string) {
  const valid = data
    .map(r => ({ date: new Date(String(r[dateCol])), value: Number(r[numCol]) || 0 }))
    .filter(r => !isNaN(r.date.getTime()))
    .sort((a, b) => a.date.getTime() - b.date.getTime());

  // Group by date for large datasets
  if (valid.length > 100) {
    const bucketCount = 50;
    const bucketSize = Math.ceil(valid.length / bucketCount);
    const buckets = [];
    for (let i = 0; i < valid.length; i += bucketSize) {
      const slice = valid.slice(i, i + bucketSize);
      const avg = slice.reduce((s, r) => s + r.value, 0) / slice.length;
      buckets.push({
        date: slice[0].date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        value: +avg.toFixed(2),
      });
    }
    return buckets;
  }

  return valid.map(r => ({
    date: r.date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    value: r.value,
  }));
}

function buildPieData(data: Record<string, any>[], catCol: string) {
  const counts: Record<string, number> = {};
  for (const row of data) {
    const key = String(row[catCol] || "Unknown");
    counts[key] = (counts[key] || 0) + 1;
  }
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([name, value]) => ({ name, value }));
}

const DynamicChart = ({ recommendation, dataset, filteredData }: DynamicChartProps) => {
  const { type, xColumn, yColumn, title, description } = recommendation;
  const data = filteredData;

  const chartData = useMemo(() => {
    if (type === "bar" && xColumn && yColumn) return aggregateByCategory(data, xColumn, yColumn);
    if (type === "histogram" && xColumn) return buildHistogramData(data, xColumn);
    if ((type === "line" || type === "area") && xColumn && yColumn) return buildTimeSeriesData(data, xColumn, yColumn);
    if ((type === "pie" || type === "donut") && xColumn) return buildPieData(data, xColumn);
    if (type === "scatter" && xColumn && yColumn) {
      return data.slice(0, 500).map(r => ({
        x: Number(r[xColumn]) || 0,
        y: Number(r[yColumn]) || 0,
      }));
    }
    return [];
  }, [type, xColumn, yColumn, data]);

  if (chartData.length === 0) return null;

  return (
    <div className="rounded-xl border border-border bg-card p-5 animate-fade-up hover:shadow-md transition-shadow duration-300">
      <h3 className="text-sm font-semibold text-foreground mb-0.5">{title}</h3>
      <p className="text-xs text-muted-foreground mb-4">{description}</p>

      <ResponsiveContainer width="100%" height={300}>
        {type === "bar" ? (
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(210, 20%, 90%)" />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: "hsl(210, 15%, 47%)" }} angle={-20} textAnchor="end" height={50} />
            <YAxis tick={{ fontSize: 11, fill: "hsl(210, 15%, 47%)" }} />
            <Tooltip contentStyle={TOOLTIP_STYLE} />
            <Bar dataKey="value" radius={[6, 6, 0, 0]} animationDuration={1200} animationEasing="ease-out">
              {chartData.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        ) : type === "histogram" ? (
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(210, 20%, 90%)" />
            <XAxis dataKey="bin" tick={{ fontSize: 10, fill: "hsl(210, 15%, 47%)" }} angle={-30} textAnchor="end" height={50} />
            <YAxis tick={{ fontSize: 11, fill: "hsl(210, 15%, 47%)" }} />
            <Tooltip contentStyle={TOOLTIP_STYLE} />
            <Bar dataKey="count" fill={COLORS[0]} radius={[4, 4, 0, 0]} animationDuration={1200} />
          </BarChart>
        ) : type === "line" ? (
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(210, 20%, 90%)" />
            <XAxis dataKey="date" tick={{ fontSize: 10, fill: "hsl(210, 15%, 47%)" }} angle={-20} textAnchor="end" height={50} />
            <YAxis tick={{ fontSize: 11, fill: "hsl(210, 15%, 47%)" }} />
            <Tooltip contentStyle={TOOLTIP_STYLE} />
            <Line type="monotone" dataKey="value" stroke={COLORS[0]} strokeWidth={2.5} dot={false} animationDuration={1500} />
          </LineChart>
        ) : type === "area" ? (
          <AreaChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(210, 20%, 90%)" />
            <XAxis dataKey="date" tick={{ fontSize: 10, fill: "hsl(210, 15%, 47%)" }} angle={-20} textAnchor="end" height={50} />
            <YAxis tick={{ fontSize: 11, fill: "hsl(210, 15%, 47%)" }} />
            <Tooltip contentStyle={TOOLTIP_STYLE} />
            <defs>
              <linearGradient id={`grad-${recommendation.id}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={COLORS[1]} stopOpacity={0.3} />
                <stop offset="95%" stopColor={COLORS[1]} stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area type="monotone" dataKey="value" stroke={COLORS[1]} strokeWidth={2} fill={`url(#grad-${recommendation.id})`} animationDuration={1500} />
          </AreaChart>
        ) : type === "scatter" ? (
          <ScatterChart>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(210, 20%, 90%)" />
            <XAxis type="number" dataKey="x" name={xColumn} tick={{ fontSize: 11, fill: "hsl(210, 15%, 47%)" }} />
            <YAxis type="number" dataKey="y" name={yColumn} tick={{ fontSize: 11, fill: "hsl(210, 15%, 47%)" }} />
            <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ strokeDasharray: "3 3" }} />
            <Scatter data={chartData} fill={COLORS[2]} animationDuration={1200}>
              {chartData.map((_, i) => (
                <Cell key={i} fill={COLORS[2]} fillOpacity={0.6} />
              ))}
            </Scatter>
          </ScatterChart>
        ) : (type === "pie" || type === "donut") ? (
          <PieChart>
            <Pie
              data={chartData}
              cx="50%" cy="50%"
              innerRadius={type === "donut" ? "45%" : 0}
              outerRadius="80%"
              dataKey="value"
              nameKey="name"
              animationDuration={1200}
              animationEasing="ease-out"
              label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
              labelLine={false}
            >
              {chartData.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip contentStyle={TOOLTIP_STYLE} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
          </PieChart>
        ) : (
          <BarChart data={chartData}>
            <Bar dataKey="value" fill={COLORS[0]} />
          </BarChart>
        )}
      </ResponsiveContainer>
    </div>
  );
};

export default DynamicChart;
