import { useState, useMemo, useCallback, useEffect } from 'react';
import { Search, ChevronLeft, ChevronRight, Database, Eye, User, AlertTriangle, ShieldAlert } from 'lucide-react';
import type { DatasetInfo } from '@/lib/parseData';
import GlassCard from '@/components/core/GlassCard';

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
    return 'bg-pink-100 text-pink-700 border-pink-200';
  }
  if ((colLower.includes('stay') || colLower.includes('los') || colLower.includes('length')) && val > 12) {
    return 'bg-amber-100 text-amber-700 border-amber-200';
  }
  if ((colLower.includes('home') || colLower.includes('visit') || colLower.includes('care')) && val === 0) {
    return 'bg-teal-100 text-teal-700 border-teal-200';
  }
  if ((colLower.includes('risk') || colLower.includes('readmission')) && val > 70) {
    return 'bg-pink-100 text-pink-700 border-pink-200';
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
  
  // Phase 16: Role-based masking with real-time sync
  const [userRole, setUserRole] = useState(() => localStorage.getItem('dashboard-role') || 'Viewer');
  useEffect(() => {
    const updateRole = () => setUserRole(localStorage.getItem('dashboard-role') || 'Viewer');
    window.addEventListener('dashboard-role-changed', updateRole);
    return () => window.removeEventListener('dashboard-role-changed', updateRole);
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
    <GlassCard className="overflow-visible flex flex-col h-full shadow-sm bg-white">
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-8 h-8 rounded-lg bg-blue-100 border border-blue-200 flex items-center justify-center">
            <Database className="h-4 w-4 text-blue-600" />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-800 tracking-wide">Dataset Matrix</h3>
            <p className="text-[10px] text-slate-500 font-mono font-medium">{rows.length} total nodes resolved</p>
          </div>
        </div>
        <div className="flex items-center gap-4 relative z-10">
          {userRole !== 'Admin' && (
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-[10px] font-bold border border-amber-200">
              <ShieldAlert className="h-3 w-3" />
              PHI Masked (Role: {userRole})
            </div>
          )}
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-blue-500" />
            <input
              type="text" placeholder="Search matrix..."
              value={search} onChange={e => { setSearch(e.target.value); setPage(0); }}
              className="w-full pl-9 pr-3 py-1.5 text-xs font-mono border border-slate-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-all bg-white text-slate-700 placeholder-slate-400 min-w-[200px] shadow-sm group-hover:bg-slate-50"
            />
          </div>
          <div className="relative">
            <button
              onClick={() => setShowColToggle(!showColToggle)}
              className="flex items-center gap-1.5 p-2 text-slate-500 hover:text-blue-600 bg-white hover:bg-slate-50 border border-slate-200 rounded-full transition-colors backdrop-blur-md shadow-sm"
              title="Toggle Columns"
            >
              <Eye className="h-4 w-4" />
            </button>
            {showColToggle && (
              <div className="absolute right-0 top-full mt-2 bg-white rounded-2xl border border-slate-100 shadow-xl p-3 z-50 min-w-[220px] max-h-[300px] overflow-y-auto animate-fade-up">
                <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 px-1">Visible Dimensions</h4>
                <div className="space-y-1">
                  {allCols.map(col => (
                    <label key={col} className="flex items-center gap-3 px-2 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-50 rounded-xl cursor-pointer transition-colors">
                      <input
                        type="checkbox"
                        checked={!hiddenCols.has(col)}
                        onChange={() => toggleColumn(col)}
                        className="rounded bg-white border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                      />
                      <span className="truncate">{col.replace(/([A-Z])/g, ' $1').replace(/[_-]/g, ' ').trim()}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="overflow-x-auto flex-1 custom-scrollbar">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              {onPatientClick && (
                <th className="px-4 py-3 text-center font-bold text-slate-500 w-10">#</th>
              )}
              {displayCols.map(col => (
                <th
                  key={col} onClick={() => handleSort(col)}
                  className="px-4 py-3 text-left font-bold text-slate-500 uppercase tracking-widest text-[10px] cursor-pointer hover:bg-slate-100 hover:text-slate-700 whitespace-nowrap transition-colors"
                >
                  <div className="flex items-center gap-1">
                    {col.replace(/([A-Z])/g, ' $1').replace(/[_-]/g, ' ').trim()}
                    {sortCol === col && (
                      <span className="text-blue-500 ml-1">{sortDir === 'asc' ? ' ↑' : ' ↓'}</span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {paged.map((row, ri) => (
              <tr
                key={ri}
                className="hover:bg-blue-50/50 transition-colors group"
              >
                {onPatientClick && (
                  <td className="px-4 py-2.5 text-center bg-slate-50/50 group-hover:bg-transparent transition-colors border-r border-slate-100">
                    <button
                      onClick={() => onPatientClick(row)}
                      className="p-1.5 rounded-full hover:bg-blue-100 text-blue-500 transition-colors opacity-0 group-hover:opacity-100"
                      title="Inspect Node Data"
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
                    <td key={col} className="px-4 py-2.5 whitespace-nowrap font-medium text-slate-600 font-mono text-[11px] group-hover:text-slate-800 transition-colors">
                      {num ? (
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border ${
                          highlight || (val > 70 ? 'bg-pink-100 text-pink-700 border-pink-200' : val > 40 ? 'bg-amber-100 text-amber-700 border-amber-200' : 'bg-slate-50 text-slate-600 border-slate-200')
                        }`}>
                          {typeof val === 'number' ? (Number.isInteger(val) ? val : val.toFixed(2)) : val}
                          {highlight && highlight.includes('pink') && <AlertTriangle className="h-2.5 w-2.5" />}
                        </span>
                      ) : (
                        <span className={formatCellValue(col, val) === '***MASKED***' ? 'text-slate-400 italic flex items-center gap-1' : ''}>
                           {formatCellValue(col, val) === '***MASKED***' && <ShieldAlert className="h-2.5 w-2.5 text-amber-500" />}
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

      <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-t border-slate-100 mt-auto">
        <p className="text-[10px] font-mono text-slate-500 font-medium">
          Viewing <strong className="text-blue-600">{page * pageSize + 1}–{Math.min((page + 1) * pageSize, rows.length)}</strong> of <strong className="text-blue-600">{rows.length}</strong> nodes
        </p>
        <div className="flex items-center gap-1.5">
          <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
            className="flex items-center justify-center w-8 h-8 rounded-full bg-white border border-slate-200 hover:bg-slate-100 disabled:opacity-50 disabled:hover:bg-white transition-colors text-slate-500">
            <ChevronLeft className="h-4 w-4" />
          </button>
          
          <div className="hidden md:flex items-center gap-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pg = page < 3 ? i : page + i - 2;
              if (pg >= totalPages || pg < 0) return null;
              return (
                <button key={pg} onClick={() => setPage(pg)}
                  className={`w-8 h-8 rounded-full text-xs font-mono font-bold transition-all ${
                    pg === page 
                      ? 'bg-blue-600 text-white shadow-sm' 
                      : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100 border border-transparent'
                  }`}>
                  {pg + 1}
                </button>
              );
            })}
          </div>

          <button onClick={() => setPage(p => Math.max(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}
            className="flex items-center justify-center w-8 h-8 rounded-full bg-white border border-slate-200 hover:bg-slate-100 disabled:opacity-50 disabled:hover:bg-white transition-colors text-slate-500">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </GlassCard>
  );
}
