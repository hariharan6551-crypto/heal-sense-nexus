import { useState, useMemo, useCallback } from 'react';
import { Filter, X, Bookmark, BookmarkCheck, RotateCcw } from 'lucide-react';
import type { DatasetInfo } from '@/lib/parseData';
import { GlassCard } from '../ui/GlassCard';

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
    <GlassCard className="p-4 transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-blue-500/20 border border-blue-500/50 flex items-center justify-center">
            <Filter className="h-3.5 w-3.5 text-blue-400 drop-shadow-[0_0_5px_currentColor]" />
          </div>
          <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">Filters & Matrix Range</span>
          {activeFilterCount > 0 && (
            <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-blue-500/30 text-blue-300 border border-blue-500/50 shadow-[0_0_10px_rgba(59,130,246,0.2)]">
              {activeFilterCount} ACTIVE
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setShowSaveModal(!showSaveModal)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold text-slate-300 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 transition-colors"
          >
            <Bookmark className="h-3 w-3 text-violet-400" />
            Save Preset
          </button>
          {savedViews.map((view, i) => (
            <button
              key={i}
              onClick={() => loadView(view)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold text-white bg-blue-500/20 border border-blue-500/50 rounded-full hover:bg-blue-500/40 transition-colors shadow-[0_0_10px_rgba(59,130,246,0.2)] group"
              title={`Load "${view.name}"`}
            >
              <BookmarkCheck className="h-3 w-3 text-blue-300" />
              {view.name}
              <X
                className="h-3 w-3 text-white/50 hover:text-white transition-opacity hidden group-hover:block ml-1"
                onClick={(e) => { e.stopPropagation(); deleteView(i); }}
              />
            </button>
          ))}
        </div>
      </div>

      {showSaveModal && (
        <div className="mb-4 flex items-center gap-2 p-3 bg-white/5 backdrop-blur-md rounded-xl border border-white/10 animate-fade-up">
          <input
            type="text"
            value={viewName}
            onChange={e => setViewName(e.target.value)}
            placeholder="Name your matrix preset..."
            className="flex-1 text-xs px-3 py-2 border border-white/10 rounded-lg bg-black/40 text-blue-100 focus:outline-none focus:ring-1 focus:ring-blue-500/50 placeholder-slate-500"
            onKeyDown={e => e.key === 'Enter' && saveView()}
          />
          <button onClick={saveView} className="px-4 py-2 text-xs font-bold bg-teal-500/20 border border-teal-500/50 text-teal-300 rounded-lg shadow-[0_0_10px_rgba(20,184,166,0.2)] hover:bg-teal-500/40 transition-colors">Capture</button>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative">
          <select
            value={filters['__time_range__'] || '__all__'}
            onChange={e => handleFilterChange('__time_range__', e.target.value)}
            className={`text-xs px-3 py-2 border rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all font-medium min-w-[130px] appearance-none cursor-pointer ${
              filters['__time_range__'] && filters['__time_range__'] !== '__all__'
                ? 'border-blue-500/50 bg-blue-500/10 text-blue-300 shadow-[0_0_10px_rgba(59,130,246,0.15)]'
                : 'border-white/10 bg-black/30 text-slate-300 hover:bg-white/5'
            }`}
          >
            {TIME_RANGES.map(tr => (
              <option key={tr.value} value={tr.value} className="bg-slate-900 text-white">🕒 Range: {tr.label}</option>
            ))}
          </select>
        </div>

        <div className="relative">
          <select
            value={filters['__filter_year__'] || '__all__'}
            onChange={e => handleFilterChange('__filter_year__', e.target.value)}
            className={`text-xs px-3 py-2 border rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all font-medium appearance-none cursor-pointer ${
              filters['__filter_year__'] && filters['__filter_year__'] !== '__all__'
                ? 'border-blue-500/50 bg-blue-500/10 text-blue-300 shadow-[0_0_10px_rgba(59,130,246,0.15)]'
                : 'border-white/10 bg-black/30 text-slate-300 hover:bg-white/5'
            }`}
          >
            <option value="__all__" className="bg-slate-900 text-white">📅 Year: All</option>
            <option value="2026" className="bg-slate-900 text-white">2026</option>
            <option value="2025" className="bg-slate-900 text-white">2025</option>
            <option value="2024" className="bg-slate-900 text-white">2024</option>
          </select>
        </div>

        <div className="relative">
          <select
            value={filters['__filter_month__'] || '__all__'}
            onChange={e => handleFilterChange('__filter_month__', e.target.value)}
            className={`text-xs px-3 py-2 border rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all font-medium appearance-none cursor-pointer ${
              filters['__filter_month__'] && filters['__filter_month__'] !== '__all__'
                ? 'border-blue-500/50 bg-blue-500/10 text-blue-300 shadow-[0_0_10px_rgba(59,130,246,0.15)]'
                : 'border-white/10 bg-black/30 text-slate-300 hover:bg-white/5'
            }`}
          >
            <option value="__all__" className="bg-slate-900 text-white">🗓 Month: All</option>
            {Array.from({length: 12}, (_, i) => (
              <option key={i+1} value={(i+1).toString()} className="bg-slate-900 text-white">Month {i+1}</option>
            ))}
          </select>
        </div>

        <div className="w-[1px] h-6 bg-white/10 mx-1 hidden sm:block" />

        {/* Dynamic Categorical Filters */}
        {filterColumns.map(col => (
          <div key={col} className="relative">
            <select
              value={filters[col] || '__all__'}
              onChange={e => handleFilterChange(col, e.target.value)}
              className={`text-xs px-3 py-2 border rounded-xl focus:outline-none focus:ring-1 focus:ring-violet-500 max-w-[160px] transition-all font-medium appearance-none cursor-pointer ${
                filters[col] && filters[col] !== '__all__'
                  ? 'border-violet-500/50 bg-violet-500/10 text-violet-300 shadow-[0_0_10px_rgba(139,92,246,0.15)]'
                  : 'border-white/10 bg-black/30 text-slate-300 hover:bg-white/5'
              }`}
            >
              <option value="__all__" className="bg-slate-900 text-white">{col.replace(/([A-Z])/g, ' $1').replace(/[_-]/g, ' ').trim()}: All</option>
              {(uniqueValues[col] || []).map(v => (
                <option key={v} value={v} className="bg-slate-900 text-white">{v}</option>
              ))}
            </select>
          </div>
        ))}

        {activeFilterCount > 0 && (
          <button
            onClick={resetAllFilters}
            className="flex items-center gap-1.5 text-xs px-3 py-2 bg-pink-500/10 border border-pink-500/30 text-pink-400 rounded-xl hover:bg-pink-500/20 transition-colors font-bold ml-auto shadow-[0_0_10px_rgba(236,72,153,0.15)]"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Purge Filters
          </button>
        )}
      </div>

      {/* Active Filter Pills */}
      {activeFilterCount > 0 && (
        <div className="mt-4 flex flex-wrap gap-2 animate-fade-in border-t border-white/10 pt-4">
          {Object.entries(filters).map(([k, v]) => {
            if (v === '__all__') return null;
            let label = k;
            if (k === '__time_range__') label = 'Range';
            else if (k === '__filter_year__') label = 'Year';
            else if (k === '__filter_month__') label = 'Month';
            else label = k.replace(/([A-Z])/g, ' $1').replace(/[_-]/g, ' ').trim();
            
            return (
              <div key={k} className="flex items-center gap-1.5 px-2.5 py-1 bg-cyan-500/10 border border-cyan-500/30 rounded-full text-[10px] font-bold text-cyan-300 shadow-[0_0_5px_rgba(6,182,212,0.2)]">
                <span className="opacity-60">{label}:</span> {v.replace('_', ' ')}
                <X 
                  className="h-3 w-3 cursor-pointer hover:text-white transition-colors ml-0.5" 
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
