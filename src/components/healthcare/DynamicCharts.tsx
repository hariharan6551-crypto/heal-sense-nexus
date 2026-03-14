import { useMemo } from 'react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  ScatterChart as RechartsScatter, Scatter,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  ComposedChart, Area,
} from 'recharts';
import { TrendingUp, Activity } from 'lucide-react';
import type { DatasetInfo } from '@/lib/parseData';
import type { ChartRecommendation } from '@/lib/chartRecommender';
import type { DataAnalysis } from '@/lib/analyzeData';

const CHART_COLORS = ['#2563eb', '#0891b2', '#8b5cf6', '#f59e0b', '#ef4444', '#10b981', '#ec4899', '#14b8a6'];

interface Props {
  dataset: DatasetInfo;
  charts: ChartRecommendation[];
  analysis: DataAnalysis;
  filters: Record<string, string>;
}

function SectionCard({ title, icon: Icon, children, className = '' }: {
  title: string; icon?: any; children: React.ReactNode; className?: string;
}) {
  return (
    <div className={`bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden ${className}`}>
      <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
        {Icon && <Icon className="h-4 w-4 text-blue-600" />}
        <h3 className="text-sm font-bold text-slate-700">{title}</h3>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

function aggregateData(data: Record<string, any>[], xCol: string, yCol: string): { name: string; value: number }[] {
  const groups: Record<string, { sum: number; count: number }> = {};
  for (const row of data) {
    const key = String(row[xCol] ?? 'Unknown');
    const val = Number(row[yCol]);
    if (isNaN(val)) continue;
    if (!groups[key]) groups[key] = { sum: 0, count: 0 };
    groups[key].sum += val;
    groups[key].count++;
  }
  return Object.entries(groups)
    .map(([name, { sum, count }]) => ({ name, value: +(sum / count).toFixed(2) }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 20);
}

function buildHistogramData(data: Record<string, any>[], col: string): { bin: string; count: number }[] {
  const vals = data.map(r => Number(r[col])).filter(v => !isNaN(v));
  if (vals.length === 0) return [];
  const min = Math.min(...vals);
  const max = Math.max(...vals);
  const binCount = Math.min(15, Math.ceil(Math.sqrt(vals.length)));
  const binSize = (max - min) / binCount || 1;
  const bins: number[] = new Array(binCount).fill(0);
  for (const v of vals) {
    const idx = Math.min(binCount - 1, Math.floor((v - min) / binSize));
    bins[idx]++;
  }
  return bins.map((count, i) => ({
    bin: `${(min + i * binSize).toFixed(1)}`,
    count,
  }));
}

function applyFilters(data: Record<string, any>[], filters: Record<string, string>): Record<string, any>[] {
  let filtered = data;
  for (const [col, val] of Object.entries(filters)) {
    if (val && val !== '__all__') {
      filtered = filtered.filter(r => String(r[col]) === val);
    }
  }
  return filtered;
}

function RenderChart({ chart, data, analysis }: { chart: ChartRecommendation; data: Record<string, any>[]; analysis: DataAnalysis }) {
  const { type, xColumn, yColumn, columns } = chart;

  if (type === 'bar' && xColumn && yColumn) {
    const agg = aggregateData(data, xColumn, yColumn);
    return (
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={agg}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="name" tick={{ fontSize: 9 }} interval={0} angle={-20} textAnchor="end" height={50} />
          <YAxis tick={{ fontSize: 10 }} />
          <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
          <Bar dataKey="value" name={yColumn} radius={[4, 4, 0, 0]}>
            {agg.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    );
  }

  if (type === 'line' && xColumn && yColumn) {
    const sorted = [...data]
      .filter(r => r[xColumn] && r[yColumn] !== null)
      .sort((a, b) => new Date(String(a[xColumn])).getTime() - new Date(String(b[xColumn])).getTime())
      .slice(0, 100);
    return (
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={sorted}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey={xColumn} tick={{ fontSize: 9 }} />
          <YAxis tick={{ fontSize: 10 }} />
          <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
          <Line type="monotone" dataKey={yColumn} stroke="#2563eb" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    );
  }

  if (type === 'scatter' && xColumn && yColumn) {
    const pts = data.slice(0, 200).map(r => ({
      x: Number(r[xColumn]),
      y: Number(r[yColumn]),
    })).filter(p => !isNaN(p.x) && !isNaN(p.y));
    return (
      <ResponsiveContainer width="100%" height={220}>
        <RechartsScatter data={pts}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="x" name={xColumn} tick={{ fontSize: 10 }} />
          <YAxis dataKey="y" name={yColumn} tick={{ fontSize: 10 }} />
          <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} cursor={{ strokeDasharray: '3 3' }} />
          <Scatter name="Data" fill="#2563eb" fillOpacity={0.5} r={3} />
        </RechartsScatter>
      </ResponsiveContainer>
    );
  }

  if ((type === 'pie' || type === 'donut') && xColumn) {
    const counts: Record<string, number> = {};
    for (const r of data) {
      const k = String(r[xColumn] ?? 'Unknown');
      counts[k] = (counts[k] || 0) + 1;
    }
    const pieData = Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
    const total = pieData.reduce((s, p) => s + p.value, 0);
    return (
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={pieData} dataKey="value" nameKey="name"
            cx="50%" cy="50%" outerRadius={75} innerRadius={type === 'donut' ? 40 : 0}
            label={({ name, value }) => `${name} ${((value / total) * 100).toFixed(0)}%`}
            labelLine={false} style={{ fontSize: 9 }}
          >
            {pieData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
          </Pie>
          <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
          <Legend iconSize={8} wrapperStyle={{ fontSize: 10 }} />
        </PieChart>
      </ResponsiveContainer>
    );
  }

  if (type === 'histogram' && xColumn) {
    const bins = buildHistogramData(data, xColumn);
    return (
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={bins}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="bin" tick={{ fontSize: 9 }} />
          <YAxis tick={{ fontSize: 10 }} />
          <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
          <Bar dataKey="count" fill="#8b5cf6" radius={[3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    );
  }

  if (type === 'area' && xColumn && yColumn) {
    const sorted = [...data]
      .filter(r => r[xColumn] && r[yColumn] !== null)
      .sort((a, b) => new Date(String(a[xColumn])).getTime() - new Date(String(b[xColumn])).getTime())
      .slice(0, 100);
    return (
      <ResponsiveContainer width="100%" height={220}>
        <ComposedChart data={sorted}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey={xColumn} tick={{ fontSize: 9 }} />
          <YAxis tick={{ fontSize: 10 }} />
          <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
          <Area type="monotone" dataKey={yColumn} fill="#dbeafe" stroke="#2563eb" strokeWidth={2} />
        </ComposedChart>
      </ResponsiveContainer>
    );
  }

  if (type === 'heatmap' && columns && columns.length >= 2) {
    const { correlationMatrix } = analysis;
    const cols = columns.slice(0, 8);
    return (
      <div className="overflow-x-auto">
        <table className="w-full text-[9px]">
          <thead>
            <tr>
              <th className="p-1"></th>
              {cols.map(c => <th key={c} className="p-1 text-slate-600 truncate max-w-[60px]">{c}</th>)}
            </tr>
          </thead>
          <tbody>
            {cols.map(row => (
              <tr key={row}>
                <td className="p-1 font-medium text-slate-600 truncate max-w-[80px]">{row}</td>
                {cols.map(col => {
                  const entry = correlationMatrix.find(e => e.col1 === row && e.col2 === col);
                  const val = entry?.value ?? 0;
                  const abs = Math.abs(val);
                  const bg = val > 0
                    ? `rgba(37,99,235,${abs * 0.7})`
                    : `rgba(239,68,68,${abs * 0.7})`;
                  return (
                    <td key={col} className="p-1 text-center font-medium" style={{ background: bg, color: abs > 0.5 ? '#fff' : '#334155' }}>
                      {val.toFixed(2)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (type === 'boxplot' && columns) {
    const boxData = columns.slice(0, 5).map(col => {
      const stat = analysis.columnStats.find(s => s.column === col);
      if (!stat) return null;
      return { name: col, min: stat.min, q1: stat.q1, median: stat.median, q3: stat.q3, max: stat.max };
    }).filter(Boolean) as { name: string; min: number; q1: number; median: number; q3: number; max: number }[];
    return (
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={boxData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="name" tick={{ fontSize: 9 }} />
          <YAxis tick={{ fontSize: 10 }} />
          <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
          <Bar dataKey="q1" stackId="box" fill="#dbeafe" name="Q1" />
          <Bar dataKey="median" stackId="box" fill="#2563eb" name="Median" />
          <Bar dataKey="q3" stackId="box" fill="#93c5fd" name="Q3" />
        </BarChart>
      </ResponsiveContainer>
    );
  }

  return <p className="text-xs text-slate-400 italic">Chart type not yet supported</p>;
}

export default function DynamicCharts({ dataset, charts, analysis, filters }: Props) {
  const filteredData = useMemo(() => applyFilters(dataset.data, filters), [dataset.data, filters]);

  const displayCharts = charts.slice(0, 6);

  // Grid: first row = 3 charts, second row = 3 charts
  const rows = [displayCharts.slice(0, 3), displayCharts.slice(3, 6)];

  return (
    <div className="space-y-4">
      {rows.map((row, ri) => (
        <div key={ri} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {row.map(chart => (
            <SectionCard key={chart.id} title={chart.title} icon={ri === 0 ? TrendingUp : Activity}>
              <RenderChart chart={chart} data={filteredData} analysis={analysis} />
            </SectionCard>
          ))}
        </div>
      ))}
    </div>
  );
}
