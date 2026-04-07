import { useState, useMemo, useCallback, useEffect } from 'react';
import { Search, ChevronLeft, ChevronRight, Database, Eye, User, AlertTriangle, ShieldAlert } from 'lucide-react';
import type { DatasetInfo } from '@/lib/parseData';
import { GlassCard } from '../ui/GlassCard';

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
    return 'bg-pink-500/20 text-pink-400 border-pink-500/40 shadow-[0_0_10px_rgba(236,72,153,0.3)]';
  }
  if ((colLower.includes('stay') || colLower.includes('los') || colLower.includes('length')) && val > 12) {
    return 'bg-amber-500/20 text-amber-400 border-amber-500/40 shadow-[0_0_10px_rgba(245,158,11,0.3)]';
  }
  if ((colLower.includes('home') || colLower.includes('visit') || colLower.includes('care')) && val === 0) {
    return 'bg-teal-500/20 text-teal-400 border-teal-500/40 shadow-[0_0_10px_rgba(20,184,166,0.3)]';
  }
  if ((colLower.includes('risk') || colLower.includes('readmission')) && val > 70) {
    return 'bg-pink-500/20 text-pink-400 border-pink-500/40 shadow-[0_0_15px_rgba(236,72,153,0.4)]';
  }
  if ((colLower.includes('risk') || colLower.includes('readmission')) && val > 40) {
    return 'bg-amber-500/20 text-amber-400 border-amber-500/40 shadow-[0_0_10px_rgba(245,158,11,0.3)]';
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
    <GlassCard className="overflow-visible flex flex-col h-full shadow-[0_0_20px_rgba(0,0,0,0.5)]">
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[rgba(0,0,0,0.2)]">
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-500/50 flex items-center justify-center">
            <Database className="h-4 w-4 text-blue-400 drop-shadow-[0_0_5px_currentColor]" />
          </div>
          <div>
            <h3 className="text-sm font-black text-white tracking-wide drop-shadow-[0_0_5px_rgba(255,255,255,0.3)]">Dataset Matrix</h3>
            <p className="text-[10px] text-blue-300/70 font-mono">{rows.length} total nodes resolved</p>
          </div>
        </div>
        <div className="flex items-center gap-4 relative z-10">
          {userRole !== 'Admin' && (
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 text-amber-400 rounded-full text-[10px] font-bold border border-amber-500/30">
              <ShieldAlert className="h-3 w-3 drop-shadow-[0_0_5px_currentColor]" />
              PHI Masked (Role: {userRole})
            </div>
          )}
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-blue-400 drop-shadow-[0_0_5px_currentColor]" />
            <input
              type="text" placeholder="Search matrix..."
              value={search} onChange={e => { setSearch(e.target.value); setPage(0); }}
              className="w-full pl-9 pr-3 py-1.5 text-xs font-mono border border-blue-500/30 rounded-full focus:outline-none focus:ring-1 focus:ring-blue-400 transition-all bg-black/40 text-blue-100 placeholder-blue-300/40 min-w-[200px] shadow-[inset_0_0_10px_rgba(0,0,0,0.5)] group-hover:bg-black/60"
            />
          </div>
          <div className="relative">
            <button
              onClick={() => setShowColToggle(!showColToggle)}
              className="flex items-center gap-1.5 p-2 text-blue-300/70 hover:text-blue-300 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full transition-colors backdrop-blur-md shadow-[0_0_10px_rgba(59,130,246,0.1)]"
              title="Toggle Columns"
            >
              <Eye className="h-4 w-4" />
            </button>
            {showColToggle && (
              <div className="absolute right-0 top-full mt-2 bg-slate-900/90 backdrop-blur-xl rounded-2xl border border-white/10 shadow-[0_0_30px_rgba(0,0,0,0.8)] p-3 z-50 min-w-[220px] max-h-[300px] overflow-y-auto animate-fade-up">
                <h4 className="text-[10px] font-bold text-blue-300 uppercase tracking-widest mb-2 px-1">Visible Dimensions</h4>
                <div className="space-y-1">
                  {allCols.map(col => (
                    <label key={col} className="flex items-center gap-3 px-2 py-2 text-xs font-medium text-slate-300 hover:text-white hover:bg-white/5 rounded-xl cursor-pointer transition-colors">
                      <input
                        type="checkbox"
                        checked={!hiddenCols.has(col)}
                        onChange={() => toggleColumn(col)}
                        className="rounded bg-black/50 border-white/20 text-blue-500 focus:ring-blue-500/50 w-4 h-4 cursor-pointer"
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
            <tr className="bg-black/40 border-b border-white/10">
              {onPatientClick && (
                <th className="px-4 py-3 text-center font-bold text-blue-300 w-10">#</th>
              )}
              {displayCols.map(col => (
                <th
                  key={col} onClick={() => handleSort(col)}
                  className="px-4 py-3 text-left font-bold text-blue-200/70 uppercase tracking-widest text-[10px] cursor-pointer hover:bg-white/5 hover:text-white whitespace-nowrap transition-colors"
                >
                  <div className="flex items-center gap-1">
                    {col.replace(/([A-Z])/g, ' $1').replace(/[_-]/g, ' ').trim()}
                    {sortCol === col && (
                      <span className="text-blue-400 drop-shadow-[0_0_3px_currentColor] ml-1">{sortDir === 'asc' ? ' ↑' : ' ↓'}</span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {paged.map((row, ri) => (
              <tr
                key={ri}
                className="hover:bg-blue-500/10 transition-colors group"
              >
                {onPatientClick && (
                  <td className="px-4 py-2.5 text-center bg-black/20 group-hover:bg-transparent transition-colors border-r border-white/5">
                    <button
                      onClick={() => onPatientClick(row)}
                      className="p-1.5 rounded-full hover:bg-blue-500/20 text-blue-300 hover:text-blue-100 transition-colors opacity-0 group-hover:opacity-100 drop-shadow-[0_0_5px_currentColor]"
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
                    <td key={col} className="px-4 py-2.5 whitespace-nowrap font-medium text-slate-300 font-mono text-[11px] group-hover:text-blue-100 transition-colors">
                      {num ? (
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border ${
                          highlight || (val > 70 ? 'bg-pink-500/10 text-pink-400 border-pink-500/30' : val > 40 ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' : 'bg-black/30 text-slate-300 border-white/10')
                        }`}>
                          {typeof val === 'number' ? (Number.isInteger(val) ? val : val.toFixed(2)) : val}
                          {highlight && highlight.includes('pink') && <AlertTriangle className="h-2.5 w-2.5 drop-shadow-[0_0_5px_currentColor]" />}
                        </span>
                      ) : (
                        <span className={formatCellValue(col, val) === '***MASKED***' ? 'text-slate-500 italic flex items-center gap-1' : ''}>
                           {formatCellValue(col, val) === '***MASKED***' && <ShieldAlert className="h-2.5 w-2.5" />}
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

      <div className="flex items-center justify-between px-6 py-4 bg-black/40 border-t border-white/10 mt-auto">
        <p className="text-[10px] font-mono text-slate-400">
          Viewing <strong className="text-blue-300 drop-shadow-[0_0_3px_currentColor]">{page * pageSize + 1}–{Math.min((page + 1) * pageSize, rows.length)}</strong> of <strong className="text-blue-300 drop-shadow-[0_0_3px_currentColor]">{rows.length}</strong> nodes
        </p>
        <div className="flex items-center gap-1.5">
          <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
            className="flex items-center justify-center w-8 h-8 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-white/5 transition-colors text-slate-300">
            <ChevronLeft className="h-4 w-4" />
          </button>
          
          <div className="hidden md:flex items-center gap-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pg = page < 3 ? i : page + i - 2;
              if (pg >= totalPages || pg < 0) return null;
              return (
                <button key={pg} onClick={() => setPage(pg)}
                  className={`w-8 h-8 rounded-full text-xs font-mono transition-all ${
                    pg === page 
                      ? 'bg-blue-500/30 text-blue-200 border border-blue-500/50 shadow-[0_0_10px_rgba(59,130,246,0.3)]' 
                      : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
                  }`}>
                  {pg + 1}
                </button>
              );
            })}
          </div>

          <button onClick={() => setPage(p => Math.max(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}
            className="flex items-center justify-center w-8 h-8 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-white/5 transition-colors text-slate-300">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </GlassCard>
  );
}
