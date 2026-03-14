import { useState } from "react";
import { Filter, ChevronDown, ChevronUp, X } from "lucide-react";
import type { DatasetInfo } from "@/lib/parseData";

export interface FilterState {
  categoryFilters: Record<string, string[]>;
  numericRanges: Record<string, [number, number]>;
}

interface FilterPanelProps {
  dataset: DatasetInfo;
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
}

const FilterPanel = ({ dataset, filters, onFiltersChange }: FilterPanelProps) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const { data, categoricalColumns, numericColumns } = dataset;

  // Get unique values for categorical columns (limit to columns with <50 unique values)
  const categoricalOptions: Record<string, string[]> = {};
  for (const col of categoricalColumns.slice(0, 5)) {
    const unique = [...new Set(data.map(r => String(r[col] || "")))].filter(Boolean).sort();
    if (unique.length <= 50) {
      categoricalOptions[col] = unique;
    }
  }

  // Get min/max for numeric columns
  const numericRanges: Record<string, [number, number]> = {};
  for (const col of numericColumns.slice(0, 4)) {
    const values = data.map(r => Number(r[col])).filter(v => !isNaN(v));
    if (values.length > 0) {
      numericRanges[col] = [Math.min(...values), Math.max(...values)];
    }
  }

  const handleCategoryToggle = (col: string, value: string) => {
    const current = filters.categoryFilters[col] || [];
    const updated = current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value];
    onFiltersChange({
      ...filters,
      categoryFilters: { ...filters.categoryFilters, [col]: updated },
    });
  };

  const handleNumericRange = (col: string, idx: 0 | 1, value: number) => {
    const range = numericRanges[col];
    if (!range) return;
    const current = filters.numericRanges[col] || range;
    const updated: [number, number] = [...current] as [number, number];
    updated[idx] = value;
    onFiltersChange({
      ...filters,
      numericRanges: { ...filters.numericRanges, [col]: updated },
    });
  };

  const clearAllFilters = () => {
    onFiltersChange({ categoryFilters: {}, numericRanges: {} });
  };

  const hasActiveFilters = Object.values(filters.categoryFilters).some(v => v.length > 0)
    || Object.keys(filters.numericRanges).length > 0;

  if (Object.keys(categoricalOptions).length === 0 && Object.keys(numericRanges).length === 0) {
    return null;
  }

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden animate-fade-up">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
            <Filter className="h-4 w-4 text-primary" />
          </div>
          <span className="text-sm font-semibold text-foreground">Filters</span>
          {hasActiveFilters && (
            <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-primary-foreground">
              Active
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <button
              onClick={(e) => { e.stopPropagation(); clearAllFilters(); }}
              className="flex items-center gap-1 rounded-md bg-destructive/10 px-2 py-1 text-xs text-destructive hover:bg-destructive/20 transition-colors"
            >
              <X className="h-3 w-3" /> Clear
            </button>
          )}
          {isExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
        </div>
      </button>

      {/* Filter body */}
      {isExpanded && (
        <div className="px-5 pb-5 pt-2 border-t border-border space-y-5">
          {/* Category Filters */}
          {Object.entries(categoricalOptions).map(([col, values]) => (
            <div key={col}>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">
                {col}
              </label>
              <div className="flex flex-wrap gap-1.5">
                {values.slice(0, 15).map(val => {
                  const isActive = (filters.categoryFilters[col] || []).includes(val);
                  return (
                    <button
                      key={val}
                      onClick={() => handleCategoryToggle(col, val)}
                      className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-all duration-200 border ${
                        isActive
                          ? "bg-primary text-primary-foreground border-primary shadow-sm"
                          : "bg-card text-muted-foreground border-border hover:border-primary/50 hover:text-foreground"
                      }`}
                    >
                      {val}
                    </button>
                  );
                })}
                {values.length > 15 && (
                  <span className="text-xs text-muted-foreground self-center">+{values.length - 15} more</span>
                )}
              </div>
            </div>
          ))}

          {/* Numeric Range Sliders */}
          {Object.entries(numericRanges).map(([col, [min, max]]) => {
            const currentRange = filters.numericRanges[col] || [min, max];
            const range = max - min;
            if (range === 0) return null;
            return (
              <div key={col}>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">
                  {col}
                </label>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground min-w-[3rem] text-right">
                    {currentRange[0].toFixed(range < 10 ? 2 : 0)}
                  </span>
                  <div className="flex-1 flex flex-col gap-1">
                    <input
                      type="range"
                      min={min}
                      max={max}
                      step={(max - min) / 100}
                      value={currentRange[0]}
                      onChange={e => handleNumericRange(col, 0, Number(e.target.value))}
                      className="w-full accent-primary h-1.5 rounded-full"
                    />
                    <input
                      type="range"
                      min={min}
                      max={max}
                      step={(max - min) / 100}
                      value={currentRange[1]}
                      onChange={e => handleNumericRange(col, 1, Number(e.target.value))}
                      className="w-full accent-primary h-1.5 rounded-full"
                    />
                  </div>
                  <span className="text-xs text-muted-foreground min-w-[3rem]">
                    {currentRange[1].toFixed(range < 10 ? 2 : 0)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default FilterPanel;
