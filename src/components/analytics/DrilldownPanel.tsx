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
      <div className="fixed inset-0 z-[60] bg-slate-900/30 backdrop-blur-sm transition-opacity" onClick={onClose} />

      {/* Panel */}
      <div className="fixed right-0 top-0 bottom-0 z-[70] w-full max-w-md bg-white/95 backdrop-blur-xl shadow-2xl border-l border-slate-200 overflow-y-auto animate-slide-in-right custom-scrollbar">
        {/* Header */}
        <div className="sticky top-0 bg-white/80 backdrop-blur-md px-6 py-5 z-10 border-b border-slate-100 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center">
                <BarChart3 className="h-4 w-4 text-blue-600" />
              </div>
              <h2 className="text-sm font-black tracking-widest text-slate-800 uppercase">Deep Dive Analysis</h2>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
              <X className="h-4 w-4 text-slate-500 hover:text-slate-800" />
            </button>
          </div>
          {chart && (
            <p className="text-blue-700 text-xs mt-3 font-mono border-l-2 border-blue-500 pl-2 font-medium">{chart.title}</p>
          )}
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* KPI Summary */}
          {kpis && (
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 shadow-sm">
                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">Total Nodes</p>
                <p className="text-2xl font-black text-blue-700 font-mono">{kpis.totalCount.toLocaleString()}</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 shadow-sm">
                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">Global Avg</p>
                <p className="text-2xl font-black text-violet-700 font-mono">{kpis.avgOverall.toLocaleString()}</p>
              </div>
              {kpis.highest && (
                <div className="bg-teal-50 rounded-xl p-4 border border-teal-100 shadow-sm">
                  <p className="text-[9px] font-bold text-teal-600 uppercase tracking-widest mb-1">Peak Segment</p>
                  <p className="text-sm font-black text-teal-800 truncate">{kpis.highest.name}</p>
                  <p className="text-xs font-mono font-bold text-teal-700 mt-1">{kpis.highest.avg.toLocaleString()}</p>
                </div>
              )}
              {kpis.lowest && (
                <div className="bg-pink-50 rounded-xl p-4 border border-pink-100 shadow-sm">
                  <p className="text-[9px] font-bold text-pink-600 uppercase tracking-widest mb-1">Trough Segment</p>
                  <p className="text-sm font-black text-pink-800 truncate">{kpis.lowest.name}</p>
                  <p className="text-xs font-mono font-bold text-pink-700 mt-1">{kpis.lowest.avg.toLocaleString()}</p>
                </div>
              )}
            </div>
          )}

          {/* Segment Table */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="px-5 py-3 bg-slate-50 border-b border-slate-100">
              <h3 className="text-xs font-bold text-slate-800 tracking-widest uppercase">Segment Breakdown</h3>
            </div>
            <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-slate-500 border-b border-slate-100 bg-white font-mono text-[10px]">
                    <th className="px-5 py-3 text-left font-bold uppercase tracking-wider">Segment</th>
                    <th className="px-5 py-3 text-right font-bold uppercase tracking-wider">Count</th>
                    <th className="px-5 py-3 text-right font-bold uppercase tracking-wider">Avg</th>
                    <th className="px-5 py-3 text-right font-bold uppercase tracking-wider">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 border-t border-slate-100">
                  {segmentInsights.map((seg, i) => (
                    <tr key={i} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="px-5 py-3 font-bold text-slate-700 group-hover:text-slate-900 transition-colors">{seg.name}</td>
                      <td className="px-5 py-3 text-right text-slate-500 font-mono font-medium">{seg.count.toLocaleString()}</td>
                      <td className="px-5 py-3 text-right">
                        <span className="inline-block px-2.5 py-0.5 rounded border border-blue-200 text-[10px] font-bold bg-blue-50 text-blue-700 font-mono shadow-sm">
                          {seg.avg.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right text-slate-500 font-mono font-medium">{seg.total.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Chart Info */}
          {chart && (
            <div className="bg-slate-50 rounded-xl p-5 border border-slate-100 shadow-sm">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest mb-3">Chart Matrix Details</h3>
              <div className="space-y-2 text-[11px] text-slate-600 font-mono font-medium">
                <p>Type: <span className="font-bold text-blue-600 capitalize">{chart.type.replace('_', ' ')}</span></p>
                {chart.xColumn && <p>X-Axis: <span className="font-bold text-violet-600">{chart.xColumn}</span></p>}
                {chart.yColumn && <p>Y-Axis: <span className="font-bold text-teal-600">{chart.yColumn}</span></p>}
                <p className="mt-2 text-slate-500 leading-relaxed border-t border-slate-200 pt-2">{chart.description}</p>
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
    </>
  );
}
