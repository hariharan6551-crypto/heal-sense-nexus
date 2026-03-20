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
      <div className="fixed inset-0 z-[60] bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="fixed right-0 top-0 bottom-0 z-[70] w-full max-w-md bg-white shadow-2xl border-l border-slate-200 overflow-y-auto animate-slide-in-right">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-indigo-600 to-blue-600 text-white px-5 py-4 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              <h2 className="text-sm font-bold">Drilldown Analysis</h2>
            </div>
            <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-lg transition-colors">
              <X className="h-4 w-4" />
            </button>
          </div>
          {chart && (
            <p className="text-blue-100 text-xs mt-1">{chart.title}</p>
          )}
        </div>

        {/* Content */}
        <div className="p-5 space-y-5">
          {/* KPI Summary */}
          {kpis && (
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                <p className="text-[9px] font-medium text-slate-400 uppercase mb-1">Total Records</p>
                <p className="text-xl font-bold text-slate-800">{kpis.totalCount.toLocaleString()}</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                <p className="text-[9px] font-medium text-slate-400 uppercase mb-1">Overall Average</p>
                <p className="text-xl font-bold text-slate-800">{kpis.avgOverall.toLocaleString()}</p>
              </div>
              {kpis.highest && (
                <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-100">
                  <p className="text-[9px] font-medium text-emerald-600 uppercase mb-1">Highest</p>
                  <p className="text-sm font-bold text-emerald-800">{kpis.highest.name}</p>
                  <p className="text-xs text-emerald-600">{kpis.highest.avg.toLocaleString()}</p>
                </div>
              )}
              {kpis.lowest && (
                <div className="bg-rose-50 rounded-xl p-3 border border-rose-100">
                  <p className="text-[9px] font-medium text-rose-600 uppercase mb-1">Lowest</p>
                  <p className="text-sm font-bold text-rose-800">{kpis.lowest.name}</p>
                  <p className="text-xs text-rose-600">{kpis.lowest.avg.toLocaleString()}</p>
                </div>
              )}
            </div>
          )}

          {/* Segment Table */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-100">
              <h3 className="text-xs font-bold text-slate-600">Segment Breakdown</h3>
            </div>
            <div className="max-h-[300px] overflow-y-auto scrollbar-thin">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-slate-500 border-b border-slate-100">
                    <th className="px-4 py-2 text-left font-medium">Segment</th>
                    <th className="px-4 py-2 text-right font-medium">Count</th>
                    <th className="px-4 py-2 text-right font-medium">Avg</th>
                    <th className="px-4 py-2 text-right font-medium">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {segmentInsights.map((seg, i) => (
                    <tr key={i} className="border-b border-slate-50 hover:bg-blue-50/30 transition-colors">
                      <td className="px-4 py-2 font-medium text-slate-700">{seg.name}</td>
                      <td className="px-4 py-2 text-right text-slate-500">{seg.count.toLocaleString()}</td>
                      <td className="px-4 py-2 text-right">
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-700">
                          {seg.avg.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-right text-slate-500">{seg.total.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Chart Info */}
          {chart && (
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
              <h3 className="text-xs font-bold text-blue-800 mb-1">Chart Details</h3>
              <div className="space-y-1 text-[10px] text-blue-700">
                <p>Type: <span className="font-medium capitalize">{chart.type.replace('_', ' ')}</span></p>
                {chart.xColumn && <p>X-Axis: <span className="font-medium">{chart.xColumn}</span></p>}
                {chart.yColumn && <p>Y-Axis: <span className="font-medium">{chart.yColumn}</span></p>}
                <p>{chart.description}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
