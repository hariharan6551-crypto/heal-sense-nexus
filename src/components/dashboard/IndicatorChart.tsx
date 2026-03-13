import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import type { DatasetInfo } from "@/lib/parseData";

const COLORS = [
  "hsl(173, 58%, 39%)",
  "hsl(199, 89%, 48%)",
  "hsl(262, 52%, 47%)",
  "hsl(25, 95%, 53%)",
  "hsl(338, 68%, 51%)",
  "hsl(152, 60%, 45%)",
];

const IndicatorChart = ({ dataset }: { dataset: DatasetInfo }) => {
  const { data, numericColumns, categoricalColumns } = dataset;
  if (categoricalColumns.length === 0 || numericColumns.length === 0) return null;

  const catCol = categoricalColumns[0];
  const numCol = numericColumns[0];

  // Aggregate by category
  const grouped: Record<string, { sum: number; count: number }> = {};
  for (const row of data) {
    const key = String(row[catCol] || "Unknown");
    if (!grouped[key]) grouped[key] = { sum: 0, count: 0 };
    grouped[key].sum += Number(row[numCol]) || 0;
    grouped[key].count++;
  }

  const chartData = Object.entries(grouped)
    .map(([name, { sum, count }]) => ({ name, value: +(sum / count).toFixed(2) }))
    .slice(0, 12);

  return (
    <div className="card-healthcare rounded-xl p-6 animate-fade-up">
      <h3 className="text-lg font-semibold text-foreground mb-1">Indicator by Category</h3>
      <p className="text-sm text-muted-foreground mb-4">{numCol} grouped by {catCol}</p>
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
          <Bar dataKey="value" radius={[6, 6, 0, 0]}>
            {chartData.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default IndicatorChart;
