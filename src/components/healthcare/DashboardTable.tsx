import { useState, useMemo, useCallback } from 'react';
import { Search, ChevronLeft, ChevronRight, Database, Eye, EyeOff, User, AlertTriangle } from 'lucide-react';
import type { DatasetInfo } from '@/lib/parseData';

interface Props {
  dataset: DatasetInfo;
  filters: Record<string, string>;
  onPatientClick?: (patient: Record<string, any>) => void;
}

function applyFilters(data: Record<string, any>[], filters: Record<string, string>): Record<string, any>[] {
  let f = data;
  for (const [col, val] of Object.entries(filters)) {
    if (val && val !== '__all__') f = f.filter(r => String(r[col]) === val);
  }
  return f;
}

// Conditional highlighting rules
function getCellHighlight(col: string, val: any, dataset: DatasetInfo): string | null {
  if (typeof val !== 'number') return null;
  const colLower = col.toLowerCase();

  // discharge > 400 → red
  if ((colLower.includes('discharge') || colLower.includes('count')) && val > 400) {
    return 'bg-red-100 text-red-700 border-red-200';
  }
  // length_of_stay > 12 → amber
  if ((colLower.includes('stay') || colLower.includes('los') || colLower.includes('length')) && val > 12) {
    return 'bg-amber-100 text-amber-700 border-amber-200';
  }
  // home_care_visits = 0 → warning
  if ((colLower.includes('home') || colLower.includes('visit') || colLower.includes('care')) && val === 0) {
    return 'bg-orange-100 text-orange-700 border-orange-200';
  }
  // readmission risk > 70 → red
  if ((colLower.includes('risk') || colLower.includes('readmission')) && val > 70) {
    return 'bg-red-100 text-red-800 border-red-200';
  }
  if ((colLower.includes('risk') || colLower.includes('readmission')) && val > 40) {
    return 'bg-amber-100 text-amber-700 border-amber-200';
  }
  return null;
}

export default function DashboardTable({ dataset, filters, onPatientClick }: Props) {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [sortCol, setSortCol] = useState('');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [hiddenCols, setHiddenCols] = useState<Set<string>>(new Set());
  const [showColToggle, setShowColToggle] = useState(false);
  const pageSize = 15;

  const allCols = dataset.columns.slice(0, 12);
  const displayCols = allCols.filter(c => !hiddenCols.has(c));

  const rows = useMemo(() => {
    let data = applyFilters(dataset.data, filters);
    if (search) {
      const q = search.toLowerCase();
      data = data.filter(r => displayCols.some(c => String(r[c] ?? '').toLowerCase().includes(q)));
    }
    if (sortCol) {
      data = [...data].sort((a, b) => {
        const av = a[sortCol], bv = b[sortCol];
        if (typeof av === 'number' && typeof bv === 'number') return sortDir === 'asc' ? av - bv : bv - av;
        return sortDir === 'asc' ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av));
      });
    }
    return data;
  }, [dataset.data, filters, search, sortCol, sortDir, displayCols]);

  const totalPages = Math.ceil(rows.length / pageSize);
  const paged = rows.slice(page * pageSize, (page + 1) * pageSize);

  const handleSort = (col: string) => {
    if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortCol(col); setSortDir('desc'); }
  };

  const isNumeric = (col: string) => dataset.numericColumns.includes(col);

  const toggleColumn = useCallback((col: string) => {
    setHiddenCols(prev => {
      const next = new Set(prev);
      if (next.has(col)) next.delete(col);
      else next.add(col);
      return next;
    });
  }, []);

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden hover-glow">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
        <div className="flex items-center gap-2">
          <Database className="h-4 w-4 text-blue-600" />
          <h3 className="text-sm font-bold text-slate-700">Dataset Explorer</h3>
          <span className="px-2 py-0.5 text-[9px] font-bold rounded-full bg-blue-100 text-blue-600">{rows.length} records</span>
        </div>
        <div className="relative">
          <button
            onClick={() => setShowColToggle(!showColToggle)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-[10px] font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
          >
            <Eye className="h-3 w-3" />
            Columns
          </button>
          {showColToggle && (
            <div className="absolute right-0 top-full mt-1 bg-white rounded-xl border border-slate-200 shadow-xl p-2 z-30 min-w-[160px] max-h-[250px] overflow-y-auto">
              {allCols.map(col => (
                <label key={col} className="flex items-center gap-2 px-2 py-1.5 text-[10px] text-slate-600 hover:bg-slate-50 rounded-lg cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!hiddenCols.has(col)}
                    onChange={() => toggleColumn(col)}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="truncate">{col.replace(/([A-Z])/g, ' $1').replace(/[_-]/g, ' ').trim()}</span>
                </label>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text" placeholder="Search data..."
              value={search} onChange={e => { setSearch(e.target.value); setPage(0); }}
              className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto rounded-lg border border-slate-100">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-slate-50">
                {onPatientClick && (
                  <th className="px-2 py-2 text-center font-semibold text-slate-400 w-8"></th>
                )}
                {displayCols.map(col => (
                  <th
                    key={col} onClick={() => handleSort(col)}
                    className="px-3 py-2 text-left font-semibold text-slate-600 cursor-pointer hover:bg-slate-100 whitespace-nowrap transition-colors"
                  >
                    {col.replace(/([A-Z])/g, ' $1').replace(/[_-]/g, ' ').trim()}
                    {sortCol === col ? (sortDir === 'asc' ? ' ↑' : ' ↓') : ''}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paged.map((row, ri) => (
                <tr
                  key={ri}
                  className={`border-t border-slate-100 hover:bg-blue-50/50 transition-colors ${ri % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}
                >
                  {onPatientClick && (
                    <td className="px-2 py-2 text-center">
                      <button
                        onClick={() => onPatientClick(row)}
                        className="p-1 rounded hover:bg-indigo-100 transition-colors"
                        title="View patient details"
                      >
                        <User className="h-3 w-3 text-indigo-500" />
                      </button>
                    </td>
                  )}
                  {displayCols.map(col => {
                    const val = row[col];
                    const num = isNumeric(col) && typeof val === 'number';
                    const highlight = num ? getCellHighlight(col, val, dataset) : null;
                    return (
                      <td key={col} className="px-3 py-2 whitespace-nowrap">
                        {num ? (
                          <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${
                            highlight || (val > 70 ? 'bg-red-100 text-red-700 border-red-200' : val > 40 ? 'bg-amber-100 text-amber-700 border-amber-200' : 'bg-green-100 text-green-700 border-green-200')
                          }`}>
                            {typeof val === 'number' ? (Number.isInteger(val) ? val : val.toFixed(2)) : val}
                            {highlight && highlight.includes('red') && <AlertTriangle className="inline h-2.5 w-2.5 ml-1" />}
                          </span>
                        ) : (
                          <span className="text-slate-700">{String(val ?? '')}</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
          <p className="text-[10px] text-slate-500">
            Showing {page * pageSize + 1}–{Math.min((page + 1) * pageSize, rows.length)} of {rows.length}
          </p>
          <div className="flex gap-1">
            <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
              className="p-1 rounded border border-slate-200 hover:bg-slate-100 disabled:opacity-30">
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pg = page < 3 ? i : page + i - 2;
              if (pg >= totalPages || pg < 0) return null;
              return (
                <button key={pg} onClick={() => setPage(pg)}
                  className={`w-6 h-6 rounded text-[10px] font-medium transition-colors ${pg === page ? 'bg-blue-600 text-white' : 'border border-slate-200 hover:bg-slate-100'}`}>
                  {pg + 1}
                </button>
              );
            })}
            <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}
              className="p-1 rounded border border-slate-200 hover:bg-slate-100 disabled:opacity-30">
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
