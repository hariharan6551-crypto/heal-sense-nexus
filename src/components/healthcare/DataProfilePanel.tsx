import { useState } from 'react';
import { TableProperties, BarChart3, ChevronDown, ChevronUp } from 'lucide-react';
import type { DatasetInfo } from '@/lib/parseData';
import type { DataAnalysis } from '@/lib/analyzeData';

interface Props {
  dataset: DatasetInfo;
  analysis: DataAnalysis;
}

const TYPE_BADGES: Record<string, { label: string; cls: string }> = {
  numeric: { label: 'Numeric', cls: 'bg-blue-100 text-blue-700' },
  categorical: { label: 'Categorical', cls: 'bg-purple-100 text-purple-700' },
  datetime: { label: 'Datetime', cls: 'bg-teal-100 text-teal-700' },
  text: { label: 'Text', cls: 'bg-gray-100 text-gray-600' },
};

export default function DataProfilePanel({ dataset, analysis }: Props) {
  const [tab, setTab] = useState<'schema' | 'stats'>('schema');

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
        <TableProperties className="h-4 w-4 text-blue-600" />
        <h3 className="text-sm font-bold text-slate-700">Data Profile</h3>
        <span className="text-xs text-slate-400">({dataset.totalColumns} columns, {dataset.totalRows.toLocaleString()} rows)</span>
      </div>

      <div className="flex border-b border-slate-100 bg-slate-50/50">
        <button onClick={() => setTab('schema')}
          className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
            tab === 'schema' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
          <TableProperties className="h-3.5 w-3.5" /> Schema
        </button>
        <button onClick={() => setTab('stats')}
          className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
            tab === 'stats' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
          <BarChart3 className="h-3.5 w-3.5" /> Statistics
        </button>
      </div>

      <div className="overflow-x-auto">
        {tab === 'schema' ? (
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-slate-50">
                <th className="px-4 py-2 text-left font-semibold text-slate-600">Column</th>
                <th className="px-4 py-2 text-left font-semibold text-slate-600">Type</th>
                <th className="px-4 py-2 text-right font-semibold text-slate-600">Non-Null</th>
                <th className="px-4 py-2 text-right font-semibold text-slate-600">Missing</th>
                <th className="px-4 py-2 text-right font-semibold text-slate-600">Unique</th>
                <th className="px-4 py-2 text-left font-semibold text-slate-600">Completeness</th>
              </tr>
            </thead>
            <tbody>
              {dataset.columnMeta.map((meta, i) => {
                const pct = dataset.totalRows > 0 ? (meta.nonNullCount / dataset.totalRows) * 100 : 0;
                const badge = TYPE_BADGES[meta.type] || TYPE_BADGES.text;
                return (
                  <tr key={meta.name} className="border-t border-slate-100 hover:bg-blue-50/30">
                    <td className="px-4 py-2 font-medium text-slate-700">{meta.name}</td>
                    <td className="px-4 py-2">
                      <span className={`inline-block rounded px-2 py-0.5 text-[10px] font-bold ${badge.cls}`}>{badge.label}</span>
                    </td>
                    <td className="px-4 py-2 text-right text-slate-500">{meta.nonNullCount.toLocaleString()}</td>
                    <td className="px-4 py-2 text-right">
                      <span className={meta.missingCount > 0 ? 'text-amber-600 font-medium' : 'text-slate-500'}>{meta.missingCount}</span>
                    </td>
                    <td className="px-4 py-2 text-right text-slate-500">{meta.uniqueCount.toLocaleString()}</td>
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden max-w-[80px]">
                          <div className={`h-full rounded-full ${pct > 90 ? 'bg-green-500' : pct > 70 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-[10px] text-slate-500">{pct.toFixed(0)}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-slate-50">
                <th className="px-4 py-2 text-left font-semibold text-slate-600">Column</th>
                <th className="px-4 py-2 text-right font-semibold text-slate-600">Mean</th>
                <th className="px-4 py-2 text-right font-semibold text-slate-600">Median</th>
                <th className="px-4 py-2 text-right font-semibold text-slate-600">Min</th>
                <th className="px-4 py-2 text-right font-semibold text-slate-600">Max</th>
                <th className="px-4 py-2 text-right font-semibold text-slate-600">Std Dev</th>
                <th className="px-4 py-2 text-right font-semibold text-slate-600">Outliers</th>
              </tr>
            </thead>
            <tbody>
              {analysis.columnStats.map(s => (
                <tr key={s.column} className="border-t border-slate-100 hover:bg-blue-50/30">
                  <td className="px-4 py-2 font-medium text-slate-700">{s.column}</td>
                  <td className="px-4 py-2 text-right text-slate-500">{s.mean.toLocaleString()}</td>
                  <td className="px-4 py-2 text-right text-slate-500">{s.median.toLocaleString()}</td>
                  <td className="px-4 py-2 text-right text-slate-500">{s.min.toLocaleString()}</td>
                  <td className="px-4 py-2 text-right text-slate-500">{s.max.toLocaleString()}</td>
                  <td className="px-4 py-2 text-right text-slate-500">{s.stdDev.toFixed(2)}</td>
                  <td className="px-4 py-2 text-right">
                    <span className={s.outlierCount > 0 ? 'text-amber-600 font-medium' : 'text-slate-500'}>{s.outlierCount}</span>
                  </td>
                </tr>
              ))}
              {analysis.columnStats.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-6 text-center text-slate-400">No numeric columns found</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
