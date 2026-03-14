import { useMemo } from "react";
import type { ColumnStats } from "@/lib/analyzeData";

interface BoxPlotChartProps {
  stats: ColumnStats[];
}

const COLORS = [
  "hsl(173, 58%, 39%)", "hsl(199, 89%, 48%)", "hsl(262, 52%, 47%)",
  "hsl(25, 95%, 53%)", "hsl(338, 68%, 51%)", "hsl(152, 60%, 45%)",
];

const BoxPlotChart = ({ stats }: BoxPlotChartProps) => {
  const filteredStats = stats.filter(s => s.max !== s.min).slice(0, 6);

  if (filteredStats.length === 0) return null;

  const boxWidth = 60;
  const gap = 30;
  const plotLeft = 80;
  const plotTop = 30;
  const plotHeight = 260;
  const svgWidth = plotLeft + filteredStats.length * (boxWidth + gap) + 40;
  const svgHeight = plotTop + plotHeight + 60;

  return (
    <div className="rounded-xl border border-border bg-card p-5 animate-fade-up hover:shadow-md transition-shadow duration-300">
      <h3 className="text-sm font-semibold text-foreground mb-0.5">Outlier Analysis (Box Plot)</h3>
      <p className="text-xs text-muted-foreground mb-4">Quartiles, median, and outlier detection per column</p>

      <div className="overflow-x-auto">
        <svg width={svgWidth} height={svgHeight} className="mx-auto">
          {filteredStats.map((stat, i) => {
            const x = plotLeft + i * (boxWidth + gap);
            const color = COLORS[i % COLORS.length];

            // Scale values to plot coordinates
            const range = stat.max - stat.min;
            const scale = (v: number) => plotTop + plotHeight - ((v - stat.min) / range) * plotHeight;

            const yMin = scale(stat.min);
            const yMax = scale(stat.max);
            const yQ1 = scale(stat.q1);
            const yQ3 = scale(stat.q3);
            const yMedian = scale(stat.median);

            return (
              <g key={stat.column} style={{ animation: `fadeIn 0.5s ease-out ${i * 100}ms both` }}>
                {/* Whisker line */}
                <line
                  x1={x + boxWidth / 2} y1={yMax} x2={x + boxWidth / 2} y2={yMin}
                  stroke={color} strokeWidth={1.5} strokeDasharray="4 2" opacity={0.5}
                />

                {/* Min whisker cap */}
                <line x1={x + 15} y1={yMin} x2={x + boxWidth - 15} y2={yMin}
                  stroke={color} strokeWidth={2}
                />

                {/* Max whisker cap */}
                <line x1={x + 15} y1={yMax} x2={x + boxWidth - 15} y2={yMax}
                  stroke={color} strokeWidth={2}
                />

                {/* Box (Q1 to Q3) */}
                <rect
                  x={x + 5} y={yQ3}
                  width={boxWidth - 10}
                  height={Math.max(yQ1 - yQ3, 2)}
                  rx={4}
                  fill={color}
                  fillOpacity={0.15}
                  stroke={color}
                  strokeWidth={2}
                />

                {/* Median line */}
                <line
                  x1={x + 5} y1={yMedian} x2={x + boxWidth - 5} y2={yMedian}
                  stroke={color} strokeWidth={3} strokeLinecap="round"
                />

                {/* Outlier dots */}
                {stat.outliers.slice(0, 10).map((o, oi) => (
                  <circle
                    key={oi}
                    cx={x + boxWidth / 2 + (Math.random() - 0.5) * 20}
                    cy={scale(o)}
                    r={3}
                    fill={color}
                    fillOpacity={0.6}
                  >
                    <title>Outlier: {o.toLocaleString()}</title>
                  </circle>
                ))}

                {/* Values */}
                <text x={x + boxWidth / 2} y={yMax - 6} textAnchor="middle" fontSize={9} fill="hsl(210,15%,47%)">
                  {stat.max.toFixed(1)}
                </text>
                <text x={x + boxWidth / 2} y={yMin + 14} textAnchor="middle" fontSize={9} fill="hsl(210,15%,47%)">
                  {stat.min.toFixed(1)}
                </text>

                {/* Column name */}
                <text
                  x={x + boxWidth / 2}
                  y={svgHeight - 10}
                  textAnchor="middle"
                  fontSize={10}
                  fill="hsl(210,15%,47%)"
                  fontWeight={500}
                >
                  {stat.column.length > 10 ? stat.column.slice(0, 9) + "…" : stat.column}
                </text>

                {/* Outlier count badge */}
                {stat.outlierCount > 0 && (
                  <g>
                    <rect x={x + boxWidth - 8} y={plotTop - 5} width={24} height={16} rx={8} fill="hsl(25, 95%, 53%)" />
                    <text x={x + boxWidth + 4} y={plotTop + 7} textAnchor="middle" fontSize={8} fill="white" fontWeight={700}>
                      {stat.outlierCount}
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
};

export default BoxPlotChart;
