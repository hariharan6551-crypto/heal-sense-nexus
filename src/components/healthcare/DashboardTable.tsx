import { useState, useMemo, useCallback, useEffect } from 'react';
import { Search, ChevronLeft, ChevronRight, Database, Eye, User, AlertTriangle, ShieldAlert } from 'lucide-react';
import type { DatasetInfo } from '@/lib/parseData';

interface Props {
  dataset: DatasetInfo;
  filters: Record<string, string>;
  onPatientClick?: (patient: Record<string, any>) => void;
}

// Global filter logic to handle regular columns + skip time_range
function applyFilters(data: Record<string, any>[], filters: Record<string, string>): Record<string, any>[] {
  let f = data;
  for (const [col, val] of Object.entries(filters)) {
    // __time_range__ is handled at the dashboard level or skipped here
    if (col === '__time_range__') continue; 
    if (val && val !== '__all__') f = f.filter(r => String(r[col]) === val);
  }
  return f;
}

// Conditional highlighting rules
function getCellHighlight(col: string, val: any): string | null {
  if (typeof val !== 'number') return null;
  const colLower = col.toLowerCase();

  if ((colLower.includes('discharge') || colLower.includes('count')) && val > 400) {
    return 'bg-red-50 text-red-600 border-red-200';
  }
  if ((colLower.includes('stay') || colLower.includes('los') || colLower.includes('length')) && val > 12) {
    return 'bg-amber-50 text-amber-700 border-amber-200';
  }
  if ((colLower.includes('home') || colLower.includes('visit') || colLower.includes('care')) && val === 0) {
    return 'bg-orange-50 text-orange-700 border-orange-200';
  }
  if ((colLower.includes('risk') || colLower.includes('readmission')) && val > 70) {
    return 'bg-red-50 text-red-700 border-red-200';
  }
  if ((colLower.includes('risk') || colLower.includes('readmission')) && val > 40) {
    return 'bg-amber-50 text-amber-700 border-amber-200';
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
  
  // Phase 16: Role-based masking
  const [userRole, setUserRole] = useState('Viewer');
  useEffect(() => {
    setUserRole(localStorage.getItem('dashboard-role') || 'Viewer');
  }, []);

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

  // Phase 16 Masking Helper format
  const formatCellValue = (col: string, val: any) => {
    if (userRole !== 'Admin') {
      const lower = col.toLowerCase();
      if (lower.includes('patient') || lower.includes('id') || lower.includes('name')) {
        return '***MASKED***';
      }
    }
    return String(val ?? '');
  };

  return (
    <div className="apple-card overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center">
            <Database className="h-4 w-4 text-indigo-600" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-slate-800 tracking-tight">Dataset Explorer</h3>
            <p className="text-[10px] text-slate-500 font-medium">{rows.length} total records filtered</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {userRole !== 'Admin' && (
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-[10px] font-bold border border-amber-200">
              <ShieldAlert className="h-3 w-3" />
              PHI Masked (Role: {userRole})
            </div>
          )}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text" placeholder="Search records..."
              value={search} onChange={e => { setSearch(e.target.value); setPage(0); }}
              className="w-full pl-9 pr-3 py-1.5 text-xs font-medium border border-slate-200 rounded-full focus:outline-none focus:ring-2 focus:ring-[#007AFF] transition-all bg-slate-50 focus:bg-white min-w-[200px]"
            />
          </div>
          <div className="relative">
            <button
              onClick={() => setShowColToggle(!showColToggle)}
              className="flex items-center gap-1.5 p-2 text-slate-500 hover:text-indigo-600 bg-slate-50 hover:bg-indigo-50 rounded-full transition-colors"
              title="Toggle Columns"
            >
              <Eye className="h-4 w-4" />
            </button>
            {showColToggle && (
              <div className="absolute right-0 top-full mt-2 bg-white rounded-2xl border border-slate-200 shadow-xl p-3 z-30 min-w-[200px] max-h-[300px] overflow-y-auto animate-fade-up">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 px-1">Visible Columns</h4>
                {allCols.map(col => (
                  <label key={col} className="flex items-center gap-3 px-2 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 rounded-xl cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      checked={!hiddenCols.has(col)}
                      onChange={() => toggleColumn(col)}
                      className="rounded border-slate-300 text-[#007AFF] focus:ring-[#007AFF] w-4 h-4 cursor-pointer"
                    />
                    <span className="truncate">{col.replace(/([A-Z])/g, ' $1').replace(/[_-]/g, ' ').trim()}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-slate-50/50">
              {onPatientClick && (
                <th className="px-4 py-3 text-center font-bold text-slate-400 w-10 border-b border-slate-200">#</th>
              )}
              {displayCols.map(col => (
                <th
                  key={col} onClick={() => handleSort(col)}
                  className="px-4 py-3 text-left font-bold text-slate-500 uppercase tracking-wider text-[10px] cursor-pointer hover:bg-slate-100 whitespace-nowrap transition-colors border-b border-slate-200"
                >
                  <div className="flex items-center gap-1">
                    {col.replace(/([A-Z])/g, ' $1').replace(/[_-]/g, ' ').trim()}
                    {sortCol === col && (
                      <span className="text-[#007AFF]">{sortDir === 'asc' ? ' ↑' : ' ↓'}</span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paged.map((row, ri) => (
              <tr
                key={ri}
                className="border-b border-slate-50 hover:bg-blue-50/30 transition-colors group bg-white"
              >
                {onPatientClick && (
                  <td className="px-4 py-2.5 text-center">
                    <button
                      onClick={() => onPatientClick(row)}
                      className="p-1.5 rounded-full hover:bg-indigo-100 hover:text-indigo-600 text-slate-400 transition-colors opacity-0 group-hover:opacity-100"
                      title="View patient details"
                    >
                      <User className="h-3.5 w-3.5" />
                    </button>
                  </td>
                )}
                {displayCols.map(col => {
                  const val = row[col];
                  const num = isNumeric(col) && typeof val === 'number';
                  const highlight = num ? getCellHighlight(col, val) : null;
                  
                  return (
                    <td key={col} className="px-4 py-2.5 whitespace-nowrap font-medium text-slate-600">
                      {num ? (
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold border ${
                          highlight || (val > 70 ? 'bg-red-50 text-red-600 border-red-200' : val > 40 ? 'bg-amber-50 text-amber-600 border-amber-200' : 'bg-slate-50 text-slate-600 border-slate-200')
                        }`}>
                          {typeof val === 'number' ? (Number.isInteger(val) ? val : val.toFixed(2)) : val}
                          {highlight && highlight.includes('red') && <AlertTriangle className="h-2.5 w-2.5" />}
                        </span>
                      ) : (
                        <span className={formatCellValue(col, val) === '***MASKED***' ? 'text-slate-400 italic' : ''}>
                          {formatCellValue(col, val)}
                        </span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between px-6 py-4 bg-white border-t border-slate-100">
        <p className="text-[11px] font-medium text-slate-500">
          Viewing <strong className="text-slate-700">{page * pageSize + 1}–{Math.min((page + 1) * pageSize, rows.length)}</strong> of <strong className="text-slate-700">{rows.length}</strong>
        </p>
        <div className="flex items-center gap-1.5">
          <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
            className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors text-slate-600">
            <ChevronLeft className="h-4 w-4" />
          </button>
          
          <div className="hidden md:flex items-center gap-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pg = page < 3 ? i : page + i - 2;
              if (pg >= totalPages || pg < 0) return null;
              return (
                <button key={pg} onClick={() => setPage(pg)}
                  className={`w-8 h-8 rounded-full text-xs font-bold transition-all ${
                    pg === page 
                      ? 'bg-[#007AFF] text-white shadow-md shadow-blue-500/20' 
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}>
                  {pg + 1}
                </button>
              );
            })}
          </div>

          <button onClick={() => setPage(p => Math.max(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}
            className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors text-slate-600">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
