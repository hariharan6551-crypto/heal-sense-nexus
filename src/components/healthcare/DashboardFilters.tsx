import { useState, useMemo, useCallback } from 'react';
import { Filter, X, Bookmark, BookmarkCheck, RotateCcw } from 'lucide-react';
import type { DatasetInfo } from '@/lib/parseData';

interface Props {
  dataset: DatasetInfo;
  filters: Record<string, string>;
  onFilterChange: (col: string, value: string) => void;
}

interface SavedView {
  name: string;
  filters: Record<string, string>;
  timestamp: string;
}

export default function DashboardFilters({ dataset, filters, onFilterChange }: Props) {
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [viewName, setViewName] = useState('');
  const [savedViews, setSavedViews] = useState<SavedView[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('dashboard-saved-views') || '[]');
    } catch { return []; }
  });

  const filterColumns = useMemo(() => {
    return dataset.categoricalColumns
      .filter(col => {
        const meta = dataset.columnMeta.find(m => m.name === col);
        return meta && meta.uniqueCount <= 30 && meta.uniqueCount > 1;
      })
      .slice(0, 6);
  }, [dataset]);

  const uniqueValues = useMemo(() => {
    const map: Record<string, string[]> = {};
    for (const col of filterColumns) {
      const vals = new Set(dataset.data.map(r => String(r[col] ?? '')).filter(Boolean));
      map[col] = Array.from(vals).sort();
    }
    return map;
  }, [dataset, filterColumns]);

  const activeFilterCount = Object.values(filters).filter(v => v && v !== '__all__').length;

  const resetAllFilters = useCallback(() => {
    filterColumns.forEach(c => onFilterChange(c, '__all__'));
  }, [filterColumns, onFilterChange]);

  const saveView = useCallback(() => {
    if (!viewName.trim()) return;
    const view: SavedView = {
      name: viewName.trim(),
      filters: { ...filters },
      timestamp: new Date().toISOString(),
    };
    const updated = [...savedViews, view];
    setSavedViews(updated);
    localStorage.setItem('dashboard-saved-views', JSON.stringify(updated));
    setViewName('');
    setShowSaveModal(false);
  }, [viewName, filters, savedViews]);

  const loadView = useCallback((view: SavedView) => {
    filterColumns.forEach(c => onFilterChange(c, '__all__'));
    Object.entries(view.filters).forEach(([c, v]) => onFilterChange(c, v));
  }, [filterColumns, onFilterChange]);

  const deleteView = useCallback((index: number) => {
    const updated = savedViews.filter((_, i) => i !== index);
    setSavedViews(updated);
    localStorage.setItem('dashboard-saved-views', JSON.stringify(updated));
  }, [savedViews]);

  if (filterColumns.length === 0) return null;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-3 hover-glow">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Filter className="h-3.5 w-3.5 text-blue-600" />
          <span className="text-xs font-bold text-slate-700">Filters</span>
          {activeFilterCount > 0 && (
            <span className="px-1.5 py-0.5 text-[9px] font-bold rounded-full bg-indigo-100 text-indigo-600">
              {activeFilterCount} active
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          {/* Save View */}
          <button
            onClick={() => setShowSaveModal(!showSaveModal)}
            className="flex items-center gap-1 px-2 py-1 text-[10px] font-medium text-slate-500 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <Bookmark className="h-3 w-3" />
            Save
          </button>
          {/* Load saved views */}
          {savedViews.length > 0 && savedViews.map((view, i) => (
            <button
              key={i}
              onClick={() => loadView(view)}
              className="flex items-center gap-1 px-2 py-1 text-[10px] font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors group"
              title={`Load "${view.name}"`}
            >
              <BookmarkCheck className="h-3 w-3" />
              {view.name}
              <X
                className="h-2.5 w-2.5 text-indigo-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => { e.stopPropagation(); deleteView(i); }}
              />
            </button>
          ))}
        </div>
      </div>

      {/* Save Modal */}
      {showSaveModal && (
        <div className="mb-2 flex items-center gap-2 p-2 bg-blue-50 rounded-lg border border-blue-100 animate-fade-up">
          <input
            type="text"
            value={viewName}
            onChange={e => setViewName(e.target.value)}
            placeholder="View name..."
            className="flex-1 text-[11px] px-2 py-1 border border-blue-200 rounded bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            onKeyDown={e => e.key === 'Enter' && saveView()}
          />
          <button onClick={saveView} className="px-2 py-1 text-[10px] font-bold bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">Save</button>
          <button onClick={() => setShowSaveModal(false)} className="p-1 text-blue-400 hover:text-blue-600"><X className="h-3 w-3" /></button>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {filterColumns.map(col => (
          <div key={col} className="relative">
            <select
              value={filters[col] || '__all__'}
              onChange={e => onFilterChange(col, e.target.value)}
              className={`text-[11px] px-2.5 py-1.5 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 max-w-[160px] transition-colors ${
                filters[col] && filters[col] !== '__all__'
                  ? 'border-indigo-300 bg-indigo-50 text-indigo-700 font-medium'
                  : 'border-slate-200'
              }`}
            >
              <option value="__all__">{col.replace(/([A-Z])/g, ' $1').replace(/[_-]/g, ' ').trim()}: All</option>
              {(uniqueValues[col] || []).map(v => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
          </div>
        ))}

        {/* Active filter pills */}
        {Object.entries(filters)
          .filter(([, v]) => v && v !== '__all__')
          .map(([col, val]) => (
            <div
              key={col}
              className="flex items-center gap-1 px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full text-[10px] font-medium animate-scale-in"
            >
              <span className="truncate max-w-[100px]">{col}: {val}</span>
              <button onClick={() => onFilterChange(col, '__all__')} className="hover:text-red-600 transition-colors">
                <X className="h-2.5 w-2.5" />
              </button>
            </div>
          ))
        }

        {activeFilterCount > 0 && (
          <button
            onClick={resetAllFilters}
            className="flex items-center gap-1 text-[11px] px-3 py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors font-medium"
          >
            <RotateCcw className="h-3 w-3" />
            Reset ({activeFilterCount})
          </button>
        )}
      </div>
    </div>
  );
}
