import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import type { DatasetInfo } from "@/lib/parseData";

const COLORS = [
  "hsl(173, 58%, 39%)",
  "hsl(199, 89%, 48%)",
  "hsl(262, 52%, 47%)",
  "hsl(25, 95%, 53%)",
  "hsl(338, 68%, 51%)",
  "hsl(152, 60%, 45%)",
];

const SupportDistribution = ({ dataset }: { dataset: DatasetInfo }) => {
  const { data, categoricalColumns } = dataset;
  if (categoricalColumns.length < 2) return null;

  const col = categoricalColumns[1];
  const counts: Record<string, number> = {};
  for (const row of data) {
    const key = String(row[col] || "Unknown");
    counts[key] = (counts[key] || 0) + 1;
  }

  const chartData = Object.entries(counts)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);

  return (
    <div className="card-healthcare rounded-xl p-6 animate-fade-up">
      <h3 className="text-lg font-semibold text-foreground mb-1">Social Support Distribution</h3>
      <p className="text-sm text-muted-foreground mb-4">Distribution of {col}</p>
      <ResponsiveContainer width="100%" height={320}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={70}
            outerRadius={110}
            paddingAngle={3}
            dataKey="value"
          >
            {chartData.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              borderRadius: "12px",
              border: "none",
              boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
              fontSize: 13,
            }}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SupportDistribution;
