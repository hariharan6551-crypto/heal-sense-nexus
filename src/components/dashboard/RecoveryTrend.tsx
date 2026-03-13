import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import type { DatasetInfo } from "@/lib/parseData";

const RecoveryTrend = ({ dataset }: { dataset: DatasetInfo }) => {
  const { data, numericColumns } = dataset;
  if (numericColumns.length === 0) return null;

  const trendData = data.slice(0, 100).map((row, i) => {
    const avg =
      numericColumns.reduce((s, col) => s + (Number(row[col]) || 0), 0) / numericColumns.length;
    return { index: i + 1, value: +avg.toFixed(2) };
  });

  return (
    <div className="card-healthcare rounded-xl p-6 animate-fade-up">
      <h3 className="text-lg font-semibold text-foreground mb-1">Recovery Trend</h3>
      <p className="text-sm text-muted-foreground mb-4">Average across numeric indicators per record</p>
      <ResponsiveContainer width="100%" height={320}>
        <LineChart data={trendData}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(210, 20%, 90%)" />
          <XAxis dataKey="index" tick={{ fontSize: 12, fill: "hsl(210, 15%, 47%)" }} />
          <YAxis tick={{ fontSize: 12, fill: "hsl(210, 15%, 47%)" }} />
          <Tooltip
            contentStyle={{
              borderRadius: "12px",
              border: "none",
              boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
              fontSize: 13,
            }}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke="hsl(173, 58%, 39%)"
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 5, fill: "hsl(173, 58%, 39%)" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RecoveryTrend;
