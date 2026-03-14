import { useState } from "react";
import { TableProperties, ChevronDown, ChevronUp, BarChart3 } from "lucide-react";
import type { DatasetInfo } from "@/lib/parseData";
import type { ColumnStats } from "@/lib/analyzeData";

interface DataProfilePanelProps {
  dataset: DatasetInfo;
  columnStats: ColumnStats[];
}

const TYPE_BADGES: Record<string, { label: string; className: string }> = {
  numeric: { label: "Numeric", className: "bg-blue-500/10 text-blue-600" },
  categorical: { label: "Categorical", className: "bg-purple-500/10 text-purple-600" },
  datetime: { label: "Datetime", className: "bg-teal-500/10 text-teal-600" },
  text: { label: "Text", className: "bg-gray-500/10 text-gray-600" },
};

const DataProfilePanel = ({ dataset, columnStats }: DataProfilePanelProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [tab, setTab] = useState<"schema" | "stats">("schema");

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden animate-fade-up">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10">
            <TableProperties className="h-4 w-4 text-indigo-500" />
          </div>
          <span className="text-sm font-semibold text-foreground">Data Profile</span>
          <span className="text-xs text-muted-foreground">({dataset.totalColumns} columns)</span>
        </div>
        {isExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
      </button>

      {isExpanded && (
        <div className="border-t border-border">
          {/* Tabs */}
          <div className="flex border-b border-border bg-muted/30">
            <button
              onClick={() => setTab("schema")}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold transition-colors border-b-2 ${
                tab === "schema" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <TableProperties className="h-3.5 w-3.5" /> Schema
            </button>
            <button
              onClick={() => setTab("stats")}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold transition-colors border-b-2 ${
                tab === "stats" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <BarChart3 className="h-3.5 w-3.5" /> Statistics
            </button>
          </div>

          {/* Schema tab */}
          {tab === "schema" && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Column</th>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Type</th>
                    <th className="px-4 py-2.5 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">Non-Null</th>
                    <th className="px-4 py-2.5 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">Missing</th>
                    <th className="px-4 py-2.5 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">Unique</th>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Completeness</th>
                  </tr>
                </thead>
                <tbody>
                  {dataset.columnMeta.map((meta, i) => {
                    const completeness = dataset.totalRows > 0 ? (meta.nonNullCount / dataset.totalRows) * 100 : 0;
                    const badge = TYPE_BADGES[meta.type] || TYPE_BADGES.text;
                    return (
                      <tr key={meta.name} className="border-t border-border hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-2.5 font-medium text-foreground">{meta.name}</td>
                        <td className="px-4 py-2.5">
                          <span className={`inline-block rounded-md px-2 py-0.5 text-[11px] font-semibold ${badge.className}`}>
                            {badge.label}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 text-right text-muted-foreground">{meta.nonNullCount.toLocaleString()}</td>
                        <td className="px-4 py-2.5 text-right">
                          <span className={meta.missingCount > 0 ? "text-amber-600 font-medium" : "text-muted-foreground"}>
                            {meta.missingCount.toLocaleString()}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 text-right text-muted-foreground">{meta.uniqueCount.toLocaleString()}</td>
                        <td className="px-4 py-2.5">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden max-w-[100px]">
                              <div
                                className={`h-full rounded-full transition-all duration-700 ${
                                  completeness > 90 ? "bg-emerald-500" : completeness > 70 ? "bg-amber-500" : "bg-rose-500"
                                }`}
                                style={{ width: `${completeness}%`, animationDelay: `${i * 50}ms` }}
                              />
                            </div>
                            <span className="text-xs text-muted-foreground">{completeness.toFixed(0)}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Statistics tab */}
          {tab === "stats" && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Column</th>
                    <th className="px-4 py-2.5 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">Mean</th>
                    <th className="px-4 py-2.5 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">Median</th>
                    <th className="px-4 py-2.5 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">Min</th>
                    <th className="px-4 py-2.5 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">Max</th>
                    <th className="px-4 py-2.5 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">Std Dev</th>
                    <th className="px-4 py-2.5 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">Outliers</th>
                  </tr>
                </thead>
                <tbody>
                  {columnStats.map(stat => (
                    <tr key={stat.column} className="border-t border-border hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-2.5 font-medium text-foreground">{stat.column}</td>
                      <td className="px-4 py-2.5 text-right text-muted-foreground">{stat.mean.toLocaleString()}</td>
                      <td className="px-4 py-2.5 text-right text-muted-foreground">{stat.median.toLocaleString()}</td>
                      <td className="px-4 py-2.5 text-right text-muted-foreground">{stat.min.toLocaleString()}</td>
                      <td className="px-4 py-2.5 text-right text-muted-foreground">{stat.max.toLocaleString()}</td>
                      <td className="px-4 py-2.5 text-right text-muted-foreground">{stat.stdDev.toLocaleString()}</td>
                      <td className="px-4 py-2.5 text-right">
                        <span className={stat.outlierCount > 0 ? "text-amber-600 font-medium" : "text-muted-foreground"}>
                          {stat.outlierCount}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {columnStats.length === 0 && (
                    <tr><td colSpan={7} className="px-4 py-6 text-center text-muted-foreground">No numeric columns found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DataProfilePanel;
