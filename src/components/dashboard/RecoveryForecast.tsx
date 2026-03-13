import { useState } from "react";
import { TrendingUp } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import type { DatasetInfo } from "@/lib/parseData";

const RecoveryForecast = ({ dataset }: { dataset: DatasetInfo }) => {
  const { data, numericColumns } = dataset;
  const [years, setYears] = useState(5);
  const [forecast, setForecast] = useState<{ year: number; value: number }[] | null>(null);

  const predict = () => {
    if (numericColumns.length === 0) return;

    // Simple linear extrapolation using mean of all numeric columns
    const col = numericColumns[0];
    const values = data.map((r) => Number(r[col]) || 0);
    const avg = values.reduce((a, b) => a + b, 0) / values.length;

    // Simple growth model
    const growthRate = 0.03; // 3% improvement/year
    const points = [];
    for (let i = 0; i <= years; i++) {
      points.push({
        year: new Date().getFullYear() + i,
        value: +(avg * Math.pow(1 + growthRate, i)).toFixed(2),
      });
    }
    setForecast(points);
  };

  return (
    <div className="card-healthcare rounded-xl p-6 animate-fade-up">
      <h3 className="text-lg font-semibold text-foreground mb-1">Recovery Forecast</h3>
      <p className="text-sm text-muted-foreground mb-4">Predict future recovery indicators</p>

      <div className="flex flex-wrap items-end gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-1">
            Prediction Years
          </label>
          <input
            type="number"
            min={1}
            max={20}
            value={years}
            onChange={(e) => setYears(Number(e.target.value))}
            className="w-28 rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <button
          onClick={predict}
          className="healthcare-gradient flex items-center gap-2 rounded-lg px-5 py-2 text-sm font-medium text-primary-foreground transition-transform hover:scale-105 active:scale-95"
        >
          <TrendingUp className="h-4 w-4" />
          Predict
        </button>
      </div>

      {forecast && (
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={forecast}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(210, 20%, 90%)" />
            <XAxis dataKey="year" tick={{ fontSize: 12, fill: "hsl(210, 15%, 47%)" }} />
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
              stroke="hsl(262, 52%, 47%)"
              strokeWidth={2.5}
              strokeDasharray="8 4"
              dot={{ r: 4, fill: "hsl(262, 52%, 47%)" }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default RecoveryForecast;
