import { useMemo } from "react";
import type { CorrelationEntry } from "@/lib/analyzeData";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface CorrelationHeatmapProps {
  correlations: CorrelationEntry[];
  columns: string[];
}

function getColor(value: number): string {
  // Blue (positive) to white (zero) to red (negative)
  if (value >= 0) {
    const intensity = Math.round(value * 200);
    return `rgb(${255 - intensity}, ${255 - intensity * 0.4}, 255)`;
  } else {
    const intensity = Math.round(Math.abs(value) * 200);
    return `rgb(255, ${255 - intensity * 0.4}, ${255 - intensity})`;
  }
}

function getTextColor(value: number): string {
  return Math.abs(value) > 0.6 ? "#fff" : "#374151";
}

const CorrelationHeatmap = ({ correlations, columns }: CorrelationHeatmapProps) => {
  const matrix = useMemo(() => {
    const m: Record<string, Record<string, number>> = {};
    for (const col of columns) {
      m[col] = {};
      for (const col2 of columns) {
        m[col][col2] = col === col2 ? 1 : 0;
      }
    }
    for (const entry of correlations) {
      if (m[entry.col1] && m[entry.col1][entry.col2] !== undefined) {
        m[entry.col1][entry.col2] = entry.value;
      }
    }
    return m;
  }, [correlations, columns]);

  if (columns.length < 2) return null;

  const cellSize = Math.min(60, 500 / columns.length);
  const labelWidth = 120;
  const svgWidth = labelWidth + columns.length * cellSize + 20;
  const svgHeight = labelWidth + columns.length * cellSize + 20;
  const truncate = (s: string, len: number) => s.length > len ? s.slice(0, len) + "…" : s;

  return (
    <div className="rounded-xl border border-border bg-card p-5 animate-fade-up hover:shadow-md transition-shadow duration-300">
      <h3 className="text-sm font-semibold text-foreground mb-0.5">Correlation Heatmap</h3>
      <p className="text-xs text-muted-foreground mb-4">Pearson correlation between numeric columns</p>

      <div className="overflow-x-auto">
        <svg width={svgWidth} height={svgHeight} className="mx-auto">
          {/* Column labels (top) */}
          {columns.map((col, i) => (
            <text
              key={`top-${col}`}
              x={labelWidth + i * cellSize + cellSize / 2}
              y={labelWidth - 8}
              textAnchor="end"
              fontSize={10}
              fill="hsl(210, 15%, 47%)"
              transform={`rotate(-45, ${labelWidth + i * cellSize + cellSize / 2}, ${labelWidth - 8})`}
            >
              {truncate(col, 12)}
            </text>
          ))}

          {/* Row labels + cells */}
          {columns.map((rowCol, ri) => (
            <g key={`row-${rowCol}`}>
              <text
                x={labelWidth - 8}
                y={labelWidth + ri * cellSize + cellSize / 2 + 4}
                textAnchor="end"
                fontSize={10}
                fill="hsl(210, 15%, 47%)"
              >
                {truncate(rowCol, 14)}
              </text>

              {columns.map((colCol, ci) => {
                const val = matrix[rowCol]?.[colCol] ?? 0;
                return (
                  <g key={`cell-${ri}-${ci}`}>
                    <rect
                      x={labelWidth + ci * cellSize}
                      y={labelWidth + ri * cellSize}
                      width={cellSize - 2}
                      height={cellSize - 2}
                      rx={4}
                      fill={getColor(val)}
                      className="transition-all duration-500"
                      style={{
                        opacity: 0,
                        animation: `fadeIn 0.4s ease-out ${(ri * columns.length + ci) * 20}ms forwards`,
                      }}
                    >
                      <title>{`${rowCol} × ${colCol}: ${val.toFixed(3)}`}</title>
                    </rect>
                    {cellSize >= 30 && (
                      <text
                        x={labelWidth + ci * cellSize + (cellSize - 2) / 2}
                        y={labelWidth + ri * cellSize + (cellSize - 2) / 2 + 4}
                        textAnchor="middle"
                        fontSize={cellSize >= 45 ? 10 : 8}
                        fill={getTextColor(val)}
                        fontWeight={Math.abs(val) > 0.5 ? 600 : 400}
                      >
                        {val.toFixed(2)}
                      </text>
                    )}
                  </g>
                );
              })}
            </g>
          ))}
        </svg>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-2 mt-3">
        <span className="text-[10px] text-muted-foreground">-1.0</span>
        <div className="flex h-3 w-40 rounded-full overflow-hidden">
          <div className="flex-1 bg-gradient-to-r from-red-400 via-white to-blue-400" />
        </div>
        <span className="text-[10px] text-muted-foreground">+1.0</span>
      </div>
    </div>
  );
};

export default CorrelationHeatmap;
