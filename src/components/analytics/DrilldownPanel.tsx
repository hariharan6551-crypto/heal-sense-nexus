import { useState, useEffect, useMemo } from 'react';
import {
  X, BarChart3, TrendingUp, TrendingDown, Minus,
  Users, ArrowRight, ChevronRight,
} from 'lucide-react';
import type { DatasetInfo } from '@/lib/parseData';
import type { DataAnalysis } from '@/lib/analyzeData';
import type { ChartRecommendation } from '@/lib/chartRecommender';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  chartId: string | null;
  dataset: DatasetInfo;
  analysis: DataAnalysis;
  charts: ChartRecommendation[];
  filters: Record<string, string>;
}

export default function DrilldownPanel({ isOpen, onClose, chartId, dataset, analysis, charts, filters }: Props) {
  const chart = useMemo(() => charts.find(c => c.id === chartId), [charts, chartId]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  const segmentInsights = useMemo(() => {
    if (!chart || !chart.xColumn) return [];
    const col = chart.xColumn;
    const yCol = chart.yColumn || dataset.numericColumns[0];
    if (!yCol) return [];

    const groups: Record<string, { sum: number; count: number }> = {};
    let filteredData = dataset.data;
    for (const [c, v] of Object.entries(filters)) {
      if (v && v !== '__all__') filteredData = filteredData.filter(r => String(r[c]) === v);
    }

    for (const r of filteredData) {
      const k = String(r[col] ?? '?');
      const v = Number(r[yCol]);
      if (isNaN(v)) continue;
      if (!groups[k]) groups[k] = { sum: 0, count: 0 };
      groups[k].sum += v;
      groups[k].count++;
    }

    return Object.entries(groups)
      .map(([name, { sum, count }]) => ({
        name,
        avg: +(sum / count).toFixed(2),
        count,
        total: +(sum).toFixed(2),
      }))
      .sort((a, b) => b.avg - a.avg)
      .slice(0, 15);
  }, [chart, dataset, filters]);

  const kpis = useMemo(() => {
    if (!segmentInsights.length) return null;
    const totalCount = segmentInsights.reduce((s, i) => s + i.count, 0);
    const totalSum = segmentInsights.reduce((s, i) => s + i.total, 0);
    const avgOverall = totalSum / totalCount;
    const highest = segmentInsights[0];
    const lowest = segmentInsights[segmentInsights.length - 1];
    return { totalCount, avgOverall: +avgOverall.toFixed(2), highest, lowest };
  }, [segmentInsights]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="fixed right-0 top-0 bottom-0 z-[70] w-full max-w-md bg-slate-900/90 backdrop-blur-xl shadow-[0_0_50px_rgba(0,0,0,0.8)] border-l border-white/10 overflow-y-auto animate-slide-in-right custom-scrollbar">
        {/* Header */}
        <div className="sticky top-0 bg-black/40 backdrop-blur-md text-white px-6 py-5 z-10 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-500/50 flex items-center justify-center">
                <BarChart3 className="h-4 w-4 text-blue-400 drop-shadow-[0_0_5px_currentColor]" />
              </div>
              <h2 className="text-sm font-black tracking-widest text-white drop-shadow-[0_0_5px_rgba(255,255,255,0.3)]">Deep Dive Analysis</h2>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
              <X className="h-4 w-4 text-slate-400 hover:text-white" />
            </button>
          </div>
          {chart && (
            <p className="text-blue-300 text-xs mt-3 font-mono border-l-2 border-blue-500 pl-2">{chart.title}</p>
          )}
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* KPI Summary */}
          {kpis && (
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-black/40 rounded-xl p-4 border border-white/10 shadow-[inset_0_0_15px_rgba(0,0,0,0.5)]">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Nodes</p>
                <p className="text-2xl font-black text-blue-100 drop-shadow-[0_0_5px_rgba(191,219,254,0.5)] font-mono">{kpis.totalCount.toLocaleString()}</p>
              </div>
              <div className="bg-black/40 rounded-xl p-4 border border-white/10 shadow-[inset_0_0_15px_rgba(0,0,0,0.5)]">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Global Avg</p>
                <p className="text-2xl font-black text-violet-100 drop-shadow-[0_0_5px_rgba(221,214,254,0.5)] font-mono">{kpis.avgOverall.toLocaleString()}</p>
              </div>
              {kpis.highest && (
                <div className="bg-teal-500/10 rounded-xl p-4 border border-teal-500/30 shadow-[0_0_15px_rgba(20,184,166,0.1)]">
                  <p className="text-[9px] font-bold text-teal-400 uppercase tracking-widest mb-1">Peak Segment</p>
                  <p className="text-sm font-black text-teal-100 truncate">{kpis.highest.name}</p>
                  <p className="text-xs font-mono text-teal-300 mt-1">{kpis.highest.avg.toLocaleString()}</p>
                </div>
              )}
              {kpis.lowest && (
                <div className="bg-pink-500/10 rounded-xl p-4 border border-pink-500/30 shadow-[0_0_15px_rgba(236,72,153,0.1)]">
                  <p className="text-[9px] font-bold text-pink-400 uppercase tracking-widest mb-1">Trough Segment</p>
                  <p className="text-sm font-black text-pink-100 truncate">{kpis.lowest.name}</p>
                  <p className="text-xs font-mono text-pink-300 mt-1">{kpis.lowest.avg.toLocaleString()}</p>
                </div>
              )}
            </div>
          )}

          {/* Segment Table */}
          <div className="bg-black/40 rounded-xl border border-white/10 overflow-hidden shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]">
            <div className="px-5 py-3 bg-white/5 border-b border-white/10">
              <h3 className="text-xs font-bold text-white tracking-widest uppercase">Segment Breakdown</h3>
            </div>
            <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-slate-400 border-b border-white/10 bg-black/50 font-mono text-[10px]">
                    <th className="px-5 py-3 text-left font-bold uppercase tracking-wider">Segment</th>
                    <th className="px-5 py-3 text-right font-bold uppercase tracking-wider">Count</th>
                    <th className="px-5 py-3 text-right font-bold uppercase tracking-wider">Avg</th>
                    <th className="px-5 py-3 text-right font-bold uppercase tracking-wider">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {segmentInsights.map((seg, i) => (
                    <tr key={i} className="hover:bg-white/5 transition-colors group">
                      <td className="px-5 py-3 font-medium text-slate-300 group-hover:text-white transition-colors">{seg.name}</td>
                      <td className="px-5 py-3 text-right text-slate-400 font-mono">{seg.count.toLocaleString()}</td>
                      <td className="px-5 py-3 text-right">
                        <span className="inline-block px-2.5 py-0.5 rounded border border-blue-500/30 text-[10px] font-bold bg-blue-500/10 text-blue-300 font-mono shadow-[0_0_10px_rgba(59,130,246,0.15)]">
                          {seg.avg.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right text-slate-400 font-mono">{seg.total.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Chart Info */}
          {chart && (
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-5 border border-white/10">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest mb-3">Chart Matrix Details</h3>
              <div className="space-y-2 text-[11px] text-slate-400 font-mono">
                <p>Type: <span className="font-bold text-blue-300 capitalize">{chart.type.replace('_', ' ')}</span></p>
                {chart.xColumn && <p>X-Axis: <span className="font-bold text-violet-300">{chart.xColumn}</span></p>}
                {chart.yColumn && <p>Y-Axis: <span className="font-bold text-teal-300">{chart.yColumn}</span></p>}
                <p className="mt-2 text-slate-500 leading-relaxed border-t border-white/5 pt-2">{chart.description}</p>
              </div>
            </div>
          )}
        </div>
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
    </>
  );
}
