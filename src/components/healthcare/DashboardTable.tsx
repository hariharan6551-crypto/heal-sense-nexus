import { useState, useMemo } from 'react';
import { Search, ChevronLeft, ChevronRight, Database } from 'lucide-react';
import type { DatasetInfo } from '@/lib/parseData';

interface Props {
  dataset: DatasetInfo;
  filters: Record<string, string>;
}

function applyFilters(data: Record<string, any>[], filters: Record<string, string>): Record<string, any>[] {
  let f = data;
  for (const [col, val] of Object.entries(filters)) {
    if (val && val !== '__all__') f = f.filter(r => String(r[col]) === val);
  }
  return f;
}

export default function DashboardTable({ dataset, filters }: Props) {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [sortCol, setSortCol] = useState('');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const pageSize = 10;

  const displayCols = dataset.columns.slice(0, 10);

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

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
        <Database className="h-4 w-4 text-blue-600" />
        <h3 className="text-sm font-bold text-slate-700">Dataset Explorer</h3>
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
          <span className="text-[10px] text-slate-500">{rows.length} records</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-slate-50">
                {displayCols.map(col => (
                  <th
                    key={col} onClick={() => handleSort(col)}
                    className="px-3 py-2 text-left font-semibold text-slate-600 cursor-pointer hover:bg-slate-100 whitespace-nowrap"
                  >
                    {col.replace(/([A-Z])/g, ' $1').replace(/[_-]/g, ' ').trim()}
                    {sortCol === col ? (sortDir === 'asc' ? ' ↑' : ' ↓') : ''}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paged.map((row, ri) => (
                <tr key={ri} className={`border-t border-slate-100 hover:bg-blue-50/50 ${ri % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}>
                  {displayCols.map(col => {
                    const val = row[col];
                    const num = isNumeric(col) && typeof val === 'number';
                    return (
                      <td key={col} className="px-3 py-2 whitespace-nowrap">
                        {num ? (
                          <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                            val > 70 ? 'bg-red-100 text-red-700' : val > 40 ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'
                          }`}>
                            {typeof val === 'number' ? (Number.isInteger(val) ? val : val.toFixed(2)) : val}
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
                  className={`w-6 h-6 rounded text-[10px] font-medium ${pg === page ? 'bg-blue-600 text-white' : 'border border-slate-200 hover:bg-slate-100'}`}>
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
