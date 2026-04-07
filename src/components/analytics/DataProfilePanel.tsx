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
  numeric: { label: 'Numeric', cls: 'bg-blue-500/20 text-blue-300 border border-blue-500/30' },
  categorical: { label: 'Categorical', cls: 'bg-violet-500/20 text-violet-300 border border-violet-500/30' },
  datetime: { label: 'Datetime', cls: 'bg-teal-500/20 text-teal-300 border border-teal-500/30' },
  text: { label: 'Text', cls: 'bg-slate-500/20 text-slate-300 border border-slate-500/30' },
};

export default function DataProfilePanel({ dataset, analysis }: Props) {
  const [tab, setTab] = useState<'schema' | 'stats'>('schema');

  return (
    <GlassCard className="overflow-hidden flex flex-col h-full shadow-[0_0_20px_rgba(0,0,0,0.5)]">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10 bg-[rgba(0,0,0,0.2)]">
        <TableProperties className="h-4 w-4 text-blue-400 drop-shadow-[0_0_5px_currentColor]" />
        <h3 className="text-sm font-bold text-white drop-shadow-[0_0_5px_rgba(255,255,255,0.3)] tracking-wide">Data Matrix Profile</h3>
        <span className="text-xs text-blue-300/70">({dataset.totalColumns} dimensions, {dataset.totalRows.toLocaleString()} nodes)</span>
      </div>

      <div className="flex border-b border-white/10 bg-black/20">
        <button onClick={() => setTab('schema')}
          className={`flex items-center gap-1.5 px-6 py-3 text-xs font-semibold border-b-2 transition-all ${
            tab === 'schema' ? 'border-blue-500 text-blue-400 bg-blue-500/5' : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-white/5'}`}>
          <TableProperties className="h-4 w-4" /> Schema Definition
        </button>
        <button onClick={() => setTab('stats')}
          className={`flex items-center gap-1.5 px-6 py-3 text-xs font-semibold border-b-2 transition-all ${
            tab === 'stats' ? 'border-violet-500 text-violet-400 bg-violet-500/5' : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-white/5'}`}>
          <BarChart3 className="h-4 w-4" /> Statistical Compute
        </button>
      </div>

      <div className="overflow-x-auto flex-1 custom-scrollbar">
        {tab === 'schema' ? (
          <table className="w-full text-xs text-left whitespace-nowrap">
            <thead>
              <tr className="bg-black/40 text-blue-200/70 uppercase tracking-wider text-[10px] font-bold">
                <th className="px-4 py-3 font-semibold">Column Identity</th>
                <th className="px-4 py-3 font-semibold">Data Type</th>
                <th className="px-4 py-3 font-semibold text-right">Non-Null</th>
                <th className="px-4 py-3 font-semibold text-right">Null Nodes</th>
                <th className="px-4 py-3 font-semibold text-right">Unique</th>
                <th className="px-4 py-3 font-semibold">Data Integrity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {dataset.columnMeta.map((meta, i) => {
                const pct = dataset.totalRows > 0 ? (meta.nonNullCount / dataset.totalRows) * 100 : 0;
                const badge = TYPE_BADGES[meta.type] || TYPE_BADGES.text;
                return (
                  <tr key={meta.name} className="hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3 font-medium text-blue-100">{meta.name}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center rounded px-2 py-0.5 text-[10px] font-bold ${badge.cls}`}>
                        {badge.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-slate-300 font-mono">{meta.nonNullCount.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right font-mono">
                      <span className={meta.missingCount > 0 ? 'text-pink-400 font-bold drop-shadow-[0_0_5px_currentColor]' : 'text-slate-500'}>
                        {meta.missingCount}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-slate-300 font-mono">{meta.uniqueCount.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-1.5 rounded-full bg-black/50 overflow-hidden min-w-[60px] border border-white/5">
                          <div 
                            className={`h-full rounded-full transition-all duration-1000 ${
                              pct > 90 ? 'bg-teal-400 shadow-[0_0_8px_rgba(45,212,191,0.8)]' : 
                              pct > 70 ? 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]' : 
                              'bg-pink-500 shadow-[0_0_8px_rgba(236,72,153,0.8)]'
                            }`} 
                            style={{ width: `${pct}%` }} 
                          />
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono w-8 text-right">{pct.toFixed(0)}%</span>
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
              <tr className="bg-black/40 text-violet-200/70 uppercase tracking-wider text-[10px] font-bold">
                <th className="px-4 py-3 font-semibold">Column Identity</th>
                <th className="px-4 py-3 font-semibold text-right">Mean Avg</th>
                <th className="px-4 py-3 font-semibold text-right">Median</th>
                <th className="px-4 py-3 font-semibold text-right">Min Vol</th>
                <th className="px-4 py-3 font-semibold text-right">Max Vol</th>
                <th className="px-4 py-3 font-semibold text-right">Std Deviation</th>
                <th className="px-4 py-3 font-semibold text-right">Anomalies</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {analysis.columnStats.map(s => (
                <tr key={s.column} className="hover:bg-white/5 transition-colors">
                  <td className="px-4 py-3 font-medium text-violet-100">{s.column}</td>
                  <td className="px-4 py-3 text-right text-slate-300 font-mono">{s.mean.toLocaleString(undefined, {maximumFractionDigits: 2})}</td>
                  <td className="px-4 py-3 text-right text-slate-300 font-mono">{s.median.toLocaleString(undefined, {maximumFractionDigits: 2})}</td>
                  <td className="px-4 py-3 text-right text-slate-400 font-mono">{s.min.toLocaleString(undefined, {maximumFractionDigits: 2})}</td>
                  <td className="px-4 py-3 text-right text-slate-300 font-mono">{s.max.toLocaleString(undefined, {maximumFractionDigits: 2})}</td>
                  <td className="px-4 py-3 text-right text-slate-400 font-mono">{s.stdDev.toFixed(2)}</td>
                  <td className="px-4 py-3 text-right font-mono">
                    <span className={s.outlierCount > 0 ? 'text-pink-400 font-bold drop-shadow-[0_0_5px_currentColor]' : 'text-slate-500'}>
                      {s.outlierCount}
                    </span>
                  </td>
                </tr>
              ))}
              {analysis.columnStats.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-slate-500 italic">No numeric tensor nodes found in dataset</td></tr>
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
          background: rgba(0, 0, 0, 0.2);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </GlassCard>
  );
}
