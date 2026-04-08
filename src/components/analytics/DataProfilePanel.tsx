import { useState } from 'react';
import { TableProperties, BarChart3 } from 'lucide-react';
import type { DatasetInfo } from '@/lib/parseData';
import type { DataAnalysis } from '@/lib/analyzeData';
import { GlassCard } from '../ui/GlassCard';

interface Props {
  dataset: DatasetInfo;
  analysis: DataAnalysis;
}

const TYPE_BADGES: Record<string, { label: string; cls: string }> = {
  numeric: { label: 'Numeric', cls: 'bg-blue-100 text-blue-700 border border-blue-200' },
  categorical: { label: 'Categorical', cls: 'bg-violet-100 text-violet-700 border border-violet-200' },
  datetime: { label: 'Datetime', cls: 'bg-teal-100 text-teal-700 border border-teal-200' },
  text: { label: 'Text', cls: 'bg-slate-100 text-slate-700 border border-slate-200' },
};

export default function DataProfilePanel({ dataset, analysis }: Props) {
  const [tab, setTab] = useState<'schema' | 'stats'>('schema');

  return (
    <GlassCard className="overflow-hidden flex flex-col h-full shadow-sm">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-100 bg-slate-50/80">
        <TableProperties className="h-4 w-4 text-blue-500" />
        <h3 className="text-sm font-bold text-slate-800 tracking-wide">Data Matrix Profile</h3>
        <span className="text-xs text-slate-500 font-medium">({dataset.totalColumns} dimensions, {dataset.totalRows.toLocaleString()} nodes)</span>
      </div>

      <div className="flex border-b border-slate-100 bg-slate-50/50">
        <button onClick={() => setTab('schema')}
          className={`flex items-center gap-1.5 px-6 py-3 text-xs font-bold border-b-2 transition-all ${
            tab === 'schema' ? 'border-blue-500 text-blue-600 bg-white' : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/50'}`}>
          <TableProperties className="h-4 w-4" /> Schema Definition
        </button>
        <button onClick={() => setTab('stats')}
          className={`flex items-center gap-1.5 px-6 py-3 text-xs font-bold border-b-2 transition-all ${
            tab === 'stats' ? 'border-violet-500 text-violet-600 bg-white' : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/50'}`}>
          <BarChart3 className="h-4 w-4" /> Statistical Compute
        </button>
      </div>

      <div className="overflow-x-auto flex-1 custom-scrollbar bg-white">
        {tab === 'schema' ? (
          <table className="w-full text-xs text-left whitespace-nowrap">
            <thead>
              <tr className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] font-bold border-b border-slate-200">
                <th className="px-4 py-3 font-semibold">Column Identity</th>
                <th className="px-4 py-3 font-semibold">Data Type</th>
                <th className="px-4 py-3 font-semibold text-right">Non-Null</th>
                <th className="px-4 py-3 font-semibold text-right">Null Nodes</th>
                <th className="px-4 py-3 font-semibold text-right">Unique</th>
                <th className="px-4 py-3 font-semibold">Data Integrity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {dataset.columnMeta.map((meta, i) => {
                const pct = dataset.totalRows > 0 ? (meta.nonNullCount / dataset.totalRows) * 100 : 0;
                const badge = TYPE_BADGES[meta.type] || TYPE_BADGES.text;
                return (
                  <tr key={meta.name} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3 font-bold text-slate-700">{meta.name}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center rounded px-2 py-0.5 text-[10px] font-bold shadow-sm ${badge.cls}`}>
                        {badge.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-slate-600 font-mono font-medium">{meta.nonNullCount.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right font-mono font-medium">
                      <span className={meta.missingCount > 0 ? 'text-pink-600 font-bold' : 'text-slate-400'}>
                        {meta.missingCount}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-slate-600 font-mono font-medium">{meta.uniqueCount.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden min-w-[60px] border border-slate-200/50">
                          <div 
                            className={`h-full rounded-full transition-all duration-1000 shadow-sm ${
                              pct > 90 ? 'bg-teal-500' : 
                              pct > 70 ? 'bg-amber-400' : 
                              'bg-pink-500'
                            }`} 
                            style={{ width: `${pct}%` }} 
                          />
                        </div>
                        <span className="text-[10px] text-slate-500 font-bold font-mono w-8 text-right">{pct.toFixed(0)}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <table className="w-full text-xs text-left whitespace-nowrap">
            <thead>
              <tr className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] font-bold border-b border-slate-200">
                <th className="px-4 py-3 font-semibold">Column Identity</th>
                <th className="px-4 py-3 font-semibold text-right">Mean Avg</th>
                <th className="px-4 py-3 font-semibold text-right">Median</th>
                <th className="px-4 py-3 font-semibold text-right">Min Vol</th>
                <th className="px-4 py-3 font-semibold text-right">Max Vol</th>
                <th className="px-4 py-3 font-semibold text-right">Std Deviation</th>
                <th className="px-4 py-3 font-semibold text-right">Anomalies</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {analysis.columnStats.map(s => (
                <tr key={s.column} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 py-3 font-bold text-slate-700">{s.column}</td>
                  <td className="px-4 py-3 text-right text-slate-600 font-mono font-medium">{s.mean.toLocaleString(undefined, {maximumFractionDigits: 2})}</td>
                  <td className="px-4 py-3 text-right text-slate-600 font-mono font-medium">{s.median.toLocaleString(undefined, {maximumFractionDigits: 2})}</td>
                  <td className="px-4 py-3 text-right text-slate-500 font-mono">{s.min.toLocaleString(undefined, {maximumFractionDigits: 2})}</td>
                  <td className="px-4 py-3 text-right text-slate-600 font-mono font-medium">{s.max.toLocaleString(undefined, {maximumFractionDigits: 2})}</td>
                  <td className="px-4 py-3 text-right text-slate-500 font-mono">{s.stdDev.toFixed(2)}</td>
                  <td className="px-4 py-3 text-right font-mono font-medium">
                    <span className={s.outlierCount > 0 ? 'text-pink-600 font-bold' : 'text-slate-400'}>
                      {s.outlierCount}
                    </span>
                  </td>
                </tr>
              ))}
              {analysis.columnStats.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-slate-500 font-medium italic">No numeric tensor nodes found in dataset</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.02);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 0, 0, 0.2);
        }
      `}</style>
    </GlassCard>
  );
}
