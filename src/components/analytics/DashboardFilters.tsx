import { useState, useMemo, useCallback } from 'react';
import { Filter, X, Bookmark, BookmarkCheck, RotateCcw } from 'lucide-react';
import type { DatasetInfo } from '@/lib/parseData';
import GlassCard from '@/components/core/GlassCard';

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
    onFilterChange('__time_range__', '__all__');
    onFilterChange('__filter_year__', '__all__');
    onFilterChange('__filter_month__', '__all__');
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
    onFilterChange('__time_range__', '__all__');
    onFilterChange('__filter_year__', '__all__');
    onFilterChange('__filter_month__', '__all__');
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
    if (val !== '__all__') {
      console.log(`[AUDIT] User applied filter: ${col} = ${val}`);
    }
    onFilterChange(col, val);
  };

  return (
    <GlassCard className="p-4 transition-all duration-300 bg-white">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center">
            <Filter className="h-3.5 w-3.5 text-blue-600" />
          </div>
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Global Filters</span>
          {activeFilterCount > 0 && (
            <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-blue-100 text-blue-700 border border-blue-200 shadow-sm">
              {activeFilterCount} ACTIVE
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setShowSaveModal(!showSaveModal)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold text-slate-600 bg-white border border-slate-200 rounded-full hover:bg-slate-50 transition-colors shadow-sm"
          >
            <Bookmark className="h-3 w-3 text-violet-500" />
            Save Preset
          </button>
          {savedViews.map((view, i) => (
            <button
              key={i}
              onClick={() => loadView(view)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-full hover:bg-blue-100 transition-colors shadow-sm group"
              title={`Load "${view.name}"`}
            >
              <BookmarkCheck className="h-3 w-3 text-blue-600" />
              {view.name}
              <X
                className="h-3 w-3 text-slate-400 hover:text-slate-600 transition-opacity hidden group-hover:block ml-1"
                onClick={(e) => { e.stopPropagation(); deleteView(i); }}
              />
            </button>
          ))}
        </div>
      </div>

      {showSaveModal && (
        <div className="mb-4 flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200 animate-fade-up">
          <input
            type="text"
            value={viewName}
            onChange={e => setViewName(e.target.value)}
            placeholder="Name your matrix preset..."
            className="flex-1 text-xs px-3 py-2 border border-slate-200 rounded-lg bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder-slate-400"
            onKeyDown={e => e.key === 'Enter' && saveView()}
          />
          <button onClick={saveView} className="px-4 py-2 text-xs font-bold bg-teal-50 border border-teal-200 text-teal-700 rounded-lg shadow-sm hover:bg-teal-100 transition-colors">Capture</button>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative">
          <select
            value={filters['__time_range__'] || '__all__'}
            onChange={e => handleFilterChange('__time_range__', e.target.value)}
            className={`text-xs px-3 py-2 border rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all font-medium min-w-[130px] appearance-none cursor-pointer ${
              filters['__time_range__'] && filters['__time_range__'] !== '__all__'
                ? 'border-blue-200 bg-blue-50 text-blue-700 shadow-sm'
                : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
            }`}
          >
            {TIME_RANGES.map(tr => (
              <option key={tr.value} value={tr.value} className="bg-white text-slate-800">🕒 Range: {tr.label}</option>
            ))}
          </select>
        </div>

        <div className="relative">
          <select
            value={filters['__filter_year__'] || '__all__'}
            onChange={e => handleFilterChange('__filter_year__', e.target.value)}
            className={`text-xs px-3 py-2 border rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all font-medium appearance-none cursor-pointer ${
              filters['__filter_year__'] && filters['__filter_year__'] !== '__all__'
                ? 'border-blue-200 bg-blue-50 text-blue-700 shadow-sm'
                : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
            }`}
          >
            <option value="__all__" className="bg-white text-slate-800">📅 Year: All</option>
            <option value="2026" className="bg-white text-slate-800">2026</option>
            <option value="2025" className="bg-white text-slate-800">2025</option>
            <option value="2024" className="bg-white text-slate-800">2024</option>
          </select>
        </div>

        <div className="relative">
          <select
            value={filters['__filter_month__'] || '__all__'}
            onChange={e => handleFilterChange('__filter_month__', e.target.value)}
            className={`text-xs px-3 py-2 border rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all font-medium appearance-none cursor-pointer ${
              filters['__filter_month__'] && filters['__filter_month__'] !== '__all__'
                ? 'border-blue-200 bg-blue-50 text-blue-700 shadow-sm'
                : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
            }`}
          >
            <option value="__all__" className="bg-white text-slate-800">🗓 Month: All</option>
            {Array.from({length: 12}, (_, i) => (
              <option key={i+1} value={(i+1).toString()} className="bg-white text-slate-800">Month {i+1}</option>
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
              className={`text-xs px-3 py-2 border rounded-xl focus:outline-none focus:ring-1 focus:ring-violet-500 max-w-[160px] transition-all font-medium appearance-none cursor-pointer ${
                filters[col] && filters[col] !== '__all__'
                  ? 'border-violet-200 bg-violet-50 text-violet-700 shadow-sm'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              <option value="__all__" className="bg-white text-slate-800">{col.replace(/([A-Z])/g, ' $1').replace(/[_-]/g, ' ').trim()}: All</option>
              {(uniqueValues[col] || []).map(v => (
                <option key={v} value={v} className="bg-white text-slate-800">{v}</option>
              ))}
            </select>
          </div>
        ))}

        {activeFilterCount > 0 && (
          <button
            onClick={resetAllFilters}
            className="flex items-center gap-1.5 text-xs px-3 py-2 bg-pink-50 border border-pink-200 text-pink-700 rounded-xl hover:bg-pink-100 transition-colors font-bold ml-auto shadow-sm"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Purge Filters
          </button>
        )}
      </div>

      {/* Active Filter Pills */}
      {activeFilterCount > 0 && (
        <div className="mt-4 flex flex-wrap gap-2 animate-fade-in border-t border-slate-100 pt-4">
          {Object.entries(filters).map(([k, v]) => {
            if (v === '__all__') return null;
            let label = k;
            if (k === '__time_range__') label = 'Range';
            else if (k === '__filter_year__') label = 'Year';
            else if (k === '__filter_month__') label = 'Month';
            else label = k.replace(/([A-Z])/g, ' $1').replace(/[_-]/g, ' ').trim();
            
            return (
              <div key={k} className="flex items-center gap-1.5 px-2.5 py-1 bg-cyan-50 border border-cyan-200 rounded-full text-[10px] font-bold text-cyan-800 shadow-sm">
                <span className="opacity-60">{label}:</span> {v.replace('_', ' ')}
                <X 
                  className="h-3 w-3 cursor-pointer hover:text-cyan-900 transition-colors ml-0.5" 
                  onClick={() => handleFilterChange(k, '__all__')}
                />
              </div>
            );
          })}
        </div>
      )}
    </GlassCard>
  );
}
