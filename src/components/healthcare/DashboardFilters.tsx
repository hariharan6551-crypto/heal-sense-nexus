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

  const TIME_RANGES = [
    { label: 'All Time', value: '__all__' },
    { label: 'Today', value: 'today' },
    { label: 'Last Week', value: 'last_week' },
    { label: 'Last Month', value: 'last_month' },
    { label: 'This Year', value: 'year' },
  ];

  const handleFilterChange = (col: string, val: string) => {
    // Audit log (Phase 16 & 17)
    if (val !== '__all__') {
      console.log(`[AUDIT] User applied filter: ${col} = ${val}`);
    }
    onFilterChange(col, val);
  };

  return (
    <div className="apple-card p-4 transition-all duration-300">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
            <Filter className="h-3 w-3 text-blue-600" />
          </div>
          <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Filters & Date Range</span>
          {activeFilterCount > 0 && (
            <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-[#007AFF] text-white shadow-sm">
              {activeFilterCount} active
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setShowSaveModal(!showSaveModal)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold text-slate-600 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors"
          >
            <Bookmark className="h-3 w-3" />
            Save View
          </button>
          {savedViews.map((view, i) => (
            <button
              key={i}
              onClick={() => loadView(view)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold text-white bg-[#007AFF] rounded-full hover:bg-blue-600 transition-colors shadow-sm shadow-blue-500/20 group"
              title={`Load "${view.name}"`}
            >
              <BookmarkCheck className="h-3 w-3" />
              {view.name}
              <X
                className="h-3 w-3 text-white/70 hover:text-white transition-opacity hidden group-hover:block ml-1"
                onClick={(e) => { e.stopPropagation(); deleteView(i); }}
              />
            </button>
          ))}
        </div>
      </div>

      {showSaveModal && (
        <div className="mb-3 flex items-center gap-2 p-2.5 bg-slate-50 rounded-xl border border-slate-200 animate-fade-up">
          <input
            type="text"
            value={viewName}
            onChange={e => setViewName(e.target.value)}
            placeholder="Name your view..."
            className="flex-1 text-xs px-3 py-1.5 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#007AFF]"
            onKeyDown={e => e.key === 'Enter' && saveView()}
          />
          <button onClick={saveView} className="px-3 py-1.5 text-xs font-bold bg-[#34C759] text-white rounded-lg shadow-sm hover:bg-green-600 transition-colors">Save</button>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2.5">
        {/* Phase 18: Advanced Time Global Filters */}
        <div className="relative">
          <select
            value={filters['__time_range__'] || '__all__'}
            onChange={e => handleFilterChange('__time_range__', e.target.value)}
            className={`text-xs px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#007AFF] transition-all font-medium min-w-[130px] appearance-none cursor-pointer ${
              filters['__time_range__'] && filters['__time_range__'] !== '__all__'
                ? 'border-[#007AFF] bg-blue-50 text-[#007AFF]'
                : 'border-slate-200 bg-white text-slate-700'
            }`}
          >
            {TIME_RANGES.map(tr => (
              <option key={tr.value} value={tr.value}>🕒 Range: {tr.label}</option>
            ))}
          </select>
        </div>

        <div className="relative">
          <select
            value={filters['__filter_year__'] || '__all__'}
            onChange={e => handleFilterChange('__filter_year__', e.target.value)}
            className={`text-xs px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#007AFF] transition-all font-medium appearance-none cursor-pointer ${
              filters['__filter_year__'] && filters['__filter_year__'] !== '__all__'
                ? 'border-[#007AFF] bg-blue-50 text-[#007AFF]'
                : 'border-slate-200 bg-white text-slate-700'
            }`}
          >
            <option value="__all__">📅 Year: All</option>
            <option value="2026">2026</option>
            <option value="2025">2025</option>
            <option value="2024">2024</option>
          </select>
        </div>

        <div className="relative">
          <select
            value={filters['__filter_month__'] || '__all__'}
            onChange={e => handleFilterChange('__filter_month__', e.target.value)}
            className={`text-xs px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#007AFF] transition-all font-medium appearance-none cursor-pointer ${
              filters['__filter_month__'] && filters['__filter_month__'] !== '__all__'
                ? 'border-[#007AFF] bg-blue-50 text-[#007AFF]'
                : 'border-slate-200 bg-white text-slate-700'
            }`}
          >
            <option value="__all__">🗓 Month: All</option>
            {Array.from({length: 12}, (_, i) => (
              <option key={i+1} value={(i+1).toString()}>Month {i+1}</option>
            ))}
          </select>
        </div>

        <div className="w-[1px] h-6 bg-slate-200 mx-1 hidden sm:block" />

        {/* Dynamic Categorical Filters */}
        {filterColumns.map(col => (
          <div key={col} className="relative">
            <select
              value={filters[col] || '__all__'}
              onChange={e => handleFilterChange(col, e.target.value)}
              className={`text-xs px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#007AFF] max-w-[160px] transition-all font-medium appearance-none cursor-pointer ${
                filters[col] && filters[col] !== '__all__'
                  ? 'border-[#007AFF] bg-blue-50 text-[#007AFF]'
                  : 'border-slate-200 bg-white text-slate-700'
              }`}
            >
              <option value="__all__">{col.replace(/([A-Z])/g, ' $1').replace(/[_-]/g, ' ').trim()}: All</option>
              {(uniqueValues[col] || []).map(v => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
          </div>
        ))}

        {activeFilterCount > 0 && (
          <button
            onClick={resetAllFilters}
            className="flex items-center gap-1.5 text-xs px-3 py-2 bg-[#FF3B30]/10 text-[#FF3B30] rounded-xl hover:bg-[#FF3B30]/20 transition-colors font-bold ml-auto"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset ({activeFilterCount})
          </button>
        )}
      </div>

      {/* Active Filter Pills (Phase 21 Personalization & Global Sync) */}
      {activeFilterCount > 0 && (
        <div className="mt-3 flex flex-wrap gap-2 animate-fade-in border-t border-slate-100 pt-3">
          {Object.entries(filters).map(([k, v]) => {
            if (v === '__all__') return null;
            let label = k;
            if (k === '__time_range__') label = 'Range';
            else if (k === '__filter_year__') label = 'Year';
            else if (k === '__filter_month__') label = 'Month';
            else label = k.replace(/([A-Z])/g, ' $1').replace(/[_-]/g, ' ').trim();
            
            return (
              <div key={k} className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 border border-blue-100 rounded-full text-[10px] font-bold text-blue-700 shadow-sm">
                <span className="opacity-60">{label}:</span> {v.replace('_', ' ')}
                <X 
                  className="h-3 w-3 cursor-pointer hover:text-red-500 transition-colors ml-0.5" 
                  onClick={() => handleFilterChange(k, '__all__')}
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
