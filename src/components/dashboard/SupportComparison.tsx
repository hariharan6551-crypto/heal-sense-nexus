import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import type { DatasetInfo } from "@/lib/parseData";

const COLORS = [
  "hsl(199, 89%, 48%)",
  "hsl(173, 58%, 39%)",
  "hsl(262, 52%, 47%)",
  "hsl(25, 95%, 53%)",
  "hsl(338, 68%, 51%)",
];

const SupportComparison = ({ dataset }: { dataset: DatasetInfo }) => {
  const { data, numericColumns, categoricalColumns } = dataset;
  if (categoricalColumns.length < 2 || numericColumns.length === 0) return null;

  const catCol = categoricalColumns[1];
  const numCol = numericColumns[0];

  // Box-plot-like: show min, q1, median, q3, max per category
  const grouped: Record<string, number[]> = {};
  for (const row of data) {
    const key = String(row[catCol] || "Unknown");
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(Number(row[numCol]) || 0);
  }

  const chartData = Object.entries(grouped)
    .slice(0, 10)
    .map(([name, values]) => {
      values.sort((a, b) => a - b);
      const mid = Math.floor(values.length / 2);
      return {
        name,
        min: values[0],
        median: values.length % 2 ? values[mid] : (values[mid - 1] + values[mid]) / 2,
        max: values[values.length - 1],
        avg: +(values.reduce((a, b) => a + b, 0) / values.length).toFixed(2),
      };
    });

  return (
    <div className="card-healthcare rounded-xl p-6 animate-fade-up">
      <h3 className="text-lg font-semibold text-foreground mb-1">Support Comparison</h3>
      <p className="text-sm text-muted-foreground mb-4">{numCol} by {catCol} (average)</p>
      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(210, 20%, 90%)" />
          <XAxis dataKey="name" tick={{ fontSize: 12, fill: "hsl(210, 15%, 47%)" }} />
          <YAxis tick={{ fontSize: 12, fill: "hsl(210, 15%, 47%)" }} />
          <Tooltip
            contentStyle={{
              borderRadius: "12px",
              border: "none",
              boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
              fontSize: 13,
            }}
          />
          <Bar dataKey="avg" radius={[6, 6, 0, 0]}>
            {chartData.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SupportComparison;
