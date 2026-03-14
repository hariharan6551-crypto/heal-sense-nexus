import { useMemo } from 'react';
import { Filter } from 'lucide-react';
import type { DatasetInfo } from '@/lib/parseData';

interface Props {
  dataset: DatasetInfo;
  filters: Record<string, string>;
  onFilterChange: (col: string, value: string) => void;
}

export default function DashboardFilters({ dataset, filters, onFilterChange }: Props) {
  const filterColumns = useMemo(() => {
    return dataset.categoricalColumns
      .filter(col => {
        const meta = dataset.columnMeta.find(m => m.name === col);
        return meta && meta.uniqueCount <= 30 && meta.uniqueCount > 1;
      })
      .slice(0, 5);
  }, [dataset]);

  const uniqueValues = useMemo(() => {
    const map: Record<string, string[]> = {};
    for (const col of filterColumns) {
      const vals = new Set(dataset.data.map(r => String(r[col] ?? '')).filter(Boolean));
      map[col] = Array.from(vals).sort();
    }
    return map;
  }, [dataset, filterColumns]);

  if (filterColumns.length === 0) return null;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-3">
      <div className="flex items-center gap-2 mb-2">
        <Filter className="h-3.5 w-3.5 text-blue-600" />
        <span className="text-xs font-bold text-slate-700">Filters</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {filterColumns.map(col => (
          <select
            key={col}
            value={filters[col] || '__all__'}
            onChange={e => onFilterChange(col, e.target.value)}
            className="text-[11px] px-2 py-1.5 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 max-w-[160px]"
          >
            <option value="__all__">{col.replace(/([A-Z])/g, ' $1').replace(/[_-]/g, ' ').trim()}: All</option>
            {(uniqueValues[col] || []).map(v => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>
        ))}
        {Object.values(filters).some(v => v && v !== '__all__') && (
          <button
            onClick={() => filterColumns.forEach(c => onFilterChange(c, '__all__'))}
            className="text-[11px] px-3 py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors font-medium"
          >
            Clear All
          </button>
        )}
      </div>
    </div>
  );
}
