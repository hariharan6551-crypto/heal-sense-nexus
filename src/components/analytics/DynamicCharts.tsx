import { useMemo, useState } from 'react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  ScatterChart as RechartsScatter, Scatter,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  ComposedChart, Area, AreaChart,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  Treemap,
  FunnelChart, Funnel, LabelList,
} from 'recharts';
import {
  TrendingUp, Activity, PieChart as PieIcon, BarChart3,
  Layers, GitBranch, Target, Grid3X3, Gauge, Boxes,
} from 'lucide-react';
import { motion } from 'framer-motion';
import ChartWrapper from './ChartWrapper';
import type { DatasetInfo } from '@/lib/parseData';
import type { ChartRecommendation } from '@/lib/chartRecommender';
import type { DataAnalysis } from '@/lib/analyzeData';
import { GlassCard } from '../ui/GlassCard';
import { GlowBadge } from '../ui/GlowBadge';

// ═══════════════════════════════════════════════════════════════════════
// Premium Color Palettes for Dark Cinematic HUD
// ═══════════════════════════════════════════════════════════════════════
const VIBRANT = ['#3B82F6', '#8B5CF6', '#14B8A6', '#EC4899', '#F59E0B', '#10B981', '#6366F1', '#D946EF', '#F97316', '#06B6D4'];
const GRADIENT_PAIRS = [
  ['#3B82F6', '#60A5FA'], ['#8B5CF6', '#A78BFA'], ['#14B8A6', '#5EEAD4'],
  ['#EC4899', '#F472B6'], ['#F59E0B', '#FCD34D'], ['#10B981', '#6EE7B7'],
  ['#6366F1', '#818CF8'], ['#06B6D4', '#22D3EE'],
];

const CHART_ICON_MAP: Record<string, any> = {
  bar: BarChart3, stacked_bar: Layers, line: TrendingUp, area: Activity,
  scatter: Target, pie: PieIcon, donut: PieIcon, funnel: GitBranch,
  radar: Gauge, treemap: Grid3X3, histogram: BarChart3,
  heatmap: Grid3X3, boxplot: Boxes, bubble: Target,
};

interface Props {
  dataset: DatasetInfo;
  charts: ChartRecommendation[];
  analysis: DataAnalysis;
  filters: Record<string, string>;
  onDrilldown?: (chartId: string) => void;
}

// ═══════════════════════════════════════════════════════════════════════
// Section Card (Cinematic Edition)
// ═══════════════════════════════════════════════════════════════════════
function SectionCard({ title, icon: Icon, badge, children, index = 0 }: {
  title: string; icon?: any; badge?: string; children: React.ReactNode; index?: number;
}) {
  const [showTooltip, setShowTooltip] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: index * 0.1, ease: 'easeOut' }}
      className="h-full"
    >
      <GlassCard className="h-full flex flex-col group relative overflow-visible" glowColor={(index % 2 === 0 ? "blue" : "violet") as any}>
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent z-0 pointer-events-none" />
        <div className="flex items-center justify-between px-4 py-3 border-b border-[rgba(255,255,255,0.08)] bg-[rgba(0,0,0,0.2)] relative z-10">
          <div className="flex items-center gap-2 min-w-0 flex-1 relative">
            {Icon && <Icon className="h-4 w-4 text-blue-400 flex-shrink-0" />}
            <h3
              className="text-sm font-bold text-white line-clamp-2 leading-tight cursor-default tracking-wide drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]"
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
            >
              {title}
            </h3>
            {showTooltip && title.length > 30 && (
              <div className="absolute left-0 top-full mt-2 z-50 px-3 py-2 bg-slate-900/90 text-blue-200 text-xs rounded-xl border border-blue-500/30 shadow-[0_0_20px_rgba(59,130,246,0.5)] backdrop-blur-md max-w-[250px] whitespace-normal">
                {title}
              </div>
            )}
          </div>
          {badge && (
            <GlowBadge color={(index % 2 === 0 ? "blue" : "violet") as any} className="ml-2 flex-shrink-0">
              {badge}
            </GlowBadge>
          )}
        </div>
        <div className="p-4 flex-1 relative z-10">{children}</div>
      </GlassCard>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// Data Helpers
// ═══════════════════════════════════════════════════════════════════════
function aggregate(data: Record<string, any>[], xCol: string, yCol: string) {
  const g: Record<string, { s: number; n: number }> = {};
  for (const r of data) {
    const k = String(r[xCol] ?? '?');
    const v = Number(r[yCol]);
    if (isNaN(v)) continue;
    if (!g[k]) g[k] = { s: 0, n: 0 };
    g[k].s += v; g[k].n++;
  }
  return Object.entries(g)
    .map(([name, { s, n }]) => ({ name, value: +(s / n).toFixed(2) }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 20);
}

function histogram(data: Record<string, any>[], col: string) {
  const vals = data.map(r => Number(r[col])).filter(v => !isNaN(v));
  if (!vals.length) return [];
  const mn = Math.min(...vals), mx = Math.max(...vals);
  const bc = Math.min(15, Math.ceil(Math.sqrt(vals.length)));
  const bs = (mx - mn) / bc || 1;
  const bins = new Array(bc).fill(0);
  for (const v of vals) bins[Math.min(bc - 1, Math.floor((v - mn) / bs))]++;
  return bins.map((c, i) => ({ range: `${(mn + i * bs).toFixed(1)}`, count: c }));
}

function filterData(data: Record<string, any>[], filters: Record<string, string>) {
  let f = data;
  for (const [c, v] of Object.entries(filters))
    if (v && v !== '__all__') f = f.filter(r => String(r[c]) === v);
  return f;
}

// Custom tooltip (Glassmorphism)
const ChartTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#0A0F1C]/80 backdrop-blur-md border border-[rgba(255,255,255,0.15)] text-white px-5 py-4 rounded-xl shadow-[0_0_20px_rgba(59,130,246,0.3)] text-xs">
      <p className="font-bold mb-2 text-blue-200 border-b border-[rgba(255,255,255,0.1)] pb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color || '#60A5FA' }} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ background: p.color || '#60A5FA' }} />
          <span>{p.name}:</span>
          <span className="font-extrabold ml-auto text-white drop-shadow-[0_0_4px_currentColor]">
            {typeof p.value === 'number' ? p.value.toLocaleString() : p.value}
          </span>
        </p>
      ))}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════
// Chart Renderer
// ═══════════════════════════════════════════════════════════════════════
function RenderChart({ chart, data, analysis }: {
  chart: ChartRecommendation; data: Record<string, any>[]; analysis: DataAnalysis;
}) {
  const { type, xColumn, yColumn, columns, sizeColumn } = chart;

  // ─── BAR ────────────────────────────────────────────────────────
  if (type === 'bar' && xColumn && yColumn) {
    const agg = aggregate(data, xColumn, yColumn);
    return (
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={agg} margin={{ bottom: 30 }}>
          <defs>
            {agg.map((_, i) => (
              <linearGradient key={i} id={`barGrad${i}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={GRADIENT_PAIRS[i % GRADIENT_PAIRS.length][0]} />
                <stop offset="100%" stopColor={GRADIENT_PAIRS[i % GRADIENT_PAIRS.length][1]} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#64748b' }} interval={0} angle={-25} textAnchor="end" height={55} />
          <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
          <Tooltip content={<ChartTooltip />} />
          <Bar dataKey="value" name={yColumn} radius={[6, 6, 0, 0]} animationDuration={800}>
            {agg.map((_, i) => <Cell key={i} fill={`url(#barGrad${i})`} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    );
  }

  // ─── STACKED BAR ────────────────────────────────────────────────
  if (type === 'stacked_bar' && xColumn && yColumn && sizeColumn) {
    const subCats = [...new Set(data.map(r => String(r[sizeColumn] ?? '')))].slice(0, 6);
    const groups: Record<string, Record<string, number>> = {};
    for (const r of data) {
      const x = String(r[xColumn] ?? '?');
      const sub = String(r[sizeColumn] ?? '?');
      const v = Number(r[yColumn]);
      if (isNaN(v)) continue;
      if (!groups[x]) groups[x] = {};
      groups[x][sub] = (groups[x][sub] || 0) + v;
    }
    const stackData = Object.entries(groups).map(([name, vals]) => ({ name, ...vals })).slice(0, 15);
    return (
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={stackData} margin={{ bottom: 30 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#64748b' }} interval={0} angle={-25} textAnchor="end" height={55} />
          <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
          <Tooltip content={<ChartTooltip />} />
          <Legend wrapperStyle={{ fontSize: 10 }} />
          {subCats.map((sub, i) => (
            <Bar key={sub} dataKey={sub} stackId="a" fill={VIBRANT[i % VIBRANT.length]} radius={i === subCats.length - 1 ? [4, 4, 0, 0] : undefined} animationDuration={800} />
          ))}
        </BarChart>
      </ResponsiveContainer>
    );
  }

  // ─── LINE ───────────────────────────────────────────────────────
  if (type === 'line' && xColumn && yColumn) {
    const sorted = [...data].filter(r => r[xColumn] && r[yColumn] !== null)
      .sort((a, b) => new Date(String(a[xColumn])).getTime() - new Date(String(b[xColumn])).getTime()).slice(0, 150);
    return (
      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={sorted}>
          <defs>
            <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#06b6d4" />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey={xColumn} tick={{ fontSize: 9, fill: '#64748b' }} />
          <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
          <Tooltip content={<ChartTooltip />} />
          <Line type="monotone" dataKey={yColumn} stroke="url(#lineGrad)" strokeWidth={3} dot={false} animationDuration={1000} />
        </LineChart>
      </ResponsiveContainer>
    );
  }

  // ─── AREA ───────────────────────────────────────────────────────
  if (type === 'area' && xColumn && yColumn) {
    const sorted = [...data].filter(r => r[xColumn] && r[yColumn] !== null)
      .sort((a, b) => new Date(String(a[xColumn])).getTime() - new Date(String(b[xColumn])).getTime()).slice(0, 150);
    return (
      <ResponsiveContainer width="100%" height={240}>
        <AreaChart data={sorted}>
          <defs>
            <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366f1" stopOpacity={0.4} />
              <stop offset="100%" stopColor="#6366f1" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey={xColumn} tick={{ fontSize: 9, fill: '#64748b' }} />
          <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
          <Tooltip content={<ChartTooltip />} />
          <Area type="monotone" dataKey={yColumn} stroke="#6366f1" strokeWidth={2} fill="url(#areaGrad)" animationDuration={1000} />
        </AreaChart>
      </ResponsiveContainer>
    );
  }

  // ─── SCATTER ────────────────────────────────────────────────────
  if (type === 'scatter' && xColumn && yColumn) {
    const pts = data.slice(0, 300).map(r => ({
      x: Number(r[xColumn]), y: Number(r[yColumn]),
    })).filter(p => !isNaN(p.x) && !isNaN(p.y));
    return (
      <ResponsiveContainer width="100%" height={240}>
        <RechartsScatter data={pts}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="x" name={xColumn} tick={{ fontSize: 10, fill: '#64748b' }} />
          <YAxis dataKey="y" name={yColumn} tick={{ fontSize: 10, fill: '#64748b' }} />
          <Tooltip content={<ChartTooltip />} cursor={{ strokeDasharray: '3 3' }} />
          <Scatter name="Data" fill="#6366f1" fillOpacity={0.6} r={4} animationDuration={800} />
        </RechartsScatter>
      </ResponsiveContainer>
    );
  }

  // ─── BUBBLE ─────────────────────────────────────────────────────
  if (type === 'bubble' && xColumn && yColumn && sizeColumn) {
    const pts = data.slice(0, 200).map(r => {
      const x = Number(r[xColumn]), y = Number(r[yColumn]), z = Number(r[sizeColumn]);
      return { x, y, z: isNaN(z) ? 5 : z };
    }).filter(p => !isNaN(p.x) && !isNaN(p.y));
    const maxZ = Math.max(...pts.map(p => p.z), 1);
    return (
      <ResponsiveContainer width="100%" height={240}>
        <RechartsScatter data={pts}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="x" name={xColumn} tick={{ fontSize: 10, fill: '#64748b' }} />
          <YAxis dataKey="y" name={yColumn} tick={{ fontSize: 10, fill: '#64748b' }} />
          <Tooltip content={<ChartTooltip />} />
          <Scatter name="Bubble">
            {pts.map((p, i) => (
              <Cell key={i} fill={VIBRANT[i % VIBRANT.length]} r={Math.max(3, (p.z / maxZ) * 20)} fillOpacity={0.6} />
            ))}
          </Scatter>
        </RechartsScatter>
      </ResponsiveContainer>
    );
  }

  // ─── DONUT CHART (with center label) ─────────────────────────────
  if (type === 'donut' && xColumn) {
    const counts: Record<string, number> = {};
    for (const r of data) counts[String(r[xColumn] ?? '?')] = (counts[String(r[xColumn] ?? '?')] || 0) + 1;
    const donutData = Object.entries(counts).map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value).slice(0, 10);
    const total = donutData.reduce((s, p) => s + p.value, 0);
    const gradId = `donutGrad-${chart.id}`;
    return (
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <defs>
            {donutData.map((_, i) => (
              <linearGradient key={i} id={`${gradId}-${i}`} x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor={GRADIENT_PAIRS[i % GRADIENT_PAIRS.length][0]} />
                <stop offset="100%" stopColor={GRADIENT_PAIRS[i % GRADIENT_PAIRS.length][1]} />
              </linearGradient>
            ))}
          </defs>
          <Pie data={donutData} dataKey="value" nameKey="name" cx="50%" cy="45%"
            outerRadius={90} innerRadius={52} paddingAngle={3}
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            labelLine={{ stroke: '#94a3b8', strokeWidth: 1 }}
            style={{ fontSize: 9, fontWeight: 600 }}
            animationDuration={1000} animationBegin={100}
          >
            {donutData.map((_, i) => (
              <Cell key={i} fill={`url(#${gradId}-${i})`} stroke="#fff" strokeWidth={3}
                className="hover:opacity-80 transition-opacity cursor-pointer" />
            ))}
          </Pie>
          {/* Center label */}
          <text x="50%" y="42%" textAnchor="middle" dominantBaseline="central" className="fill-slate-800" style={{ fontSize: 22, fontWeight: 800 }}>
            {total.toLocaleString()}
          </text>
          <text x="50%" y="50%" textAnchor="middle" dominantBaseline="central" className="fill-slate-400" style={{ fontSize: 10, fontWeight: 500 }}>
            Total Records
          </text>
          <Tooltip content={<ChartTooltip />} />
          <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 10, paddingTop: 8 }} />
        </PieChart>
      </ResponsiveContainer>
    );
  }

  // ─── PIE CHART (with percentage labels) ────────────────────────
  if (type === 'pie' && xColumn) {
    const counts: Record<string, number> = {};
    for (const r of data) counts[String(r[xColumn] ?? '?')] = (counts[String(r[xColumn] ?? '?')] || 0) + 1;
    const pieData = Object.entries(counts).map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value).slice(0, 8);
    const total = pieData.reduce((s, p) => s + p.value, 0);
    const gradId = `pieGrad-${chart.id}`;
    const renderLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }: any) => {
      const RADIAN = Math.PI / 180;
      const radius = outerRadius + 22;
      const x = cx + radius * Math.cos(-midAngle * RADIAN);
      const y = cy + radius * Math.sin(-midAngle * RADIAN);
      if (percent < 0.04) return null;
      return (
        <text x={x} y={y} fill="#334155" textAnchor={x > cx ? 'start' : 'end'}
          dominantBaseline="central" style={{ fontSize: 10, fontWeight: 600 }}>
          {name} ({(percent * 100).toFixed(1)}%)
        </text>
      );
    };
    return (
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <defs>
            {pieData.map((_, i) => (
              <linearGradient key={i} id={`${gradId}-${i}`} x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor={GRADIENT_PAIRS[i % GRADIENT_PAIRS.length][0]} />
                <stop offset="100%" stopColor={GRADIENT_PAIRS[i % GRADIENT_PAIRS.length][1]} />
              </linearGradient>
            ))}
          </defs>
          <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="45%"
            outerRadius={85} innerRadius={0} paddingAngle={2}
            label={renderLabel}
            labelLine={{ stroke: '#94a3b8', strokeWidth: 1 }}
            animationDuration={1000} animationBegin={100}
          >
            {pieData.map((_, i) => (
              <Cell key={i} fill={`url(#${gradId}-${i})`} stroke="#fff" strokeWidth={2}
                className="hover:opacity-80 transition-opacity cursor-pointer" />
            ))}
          </Pie>
          <Tooltip content={<ChartTooltip />} />
          <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 10, paddingTop: 8 }} />
        </PieChart>
      </ResponsiveContainer>
    );
  }

  // ─── FUNNEL ─────────────────────────────────────────────────────
  if (type === 'funnel' && xColumn && yColumn) {
    const agg = aggregate(data, xColumn, yColumn).slice(0, 6);
    const funnelData = agg.map((d, i) => ({
      ...d, fill: VIBRANT[i % VIBRANT.length],
    }));
    return (
      <ResponsiveContainer width="100%" height={240}>
        <FunnelChart>
          <Tooltip content={<ChartTooltip />} />
          <Funnel dataKey="value" data={funnelData} isAnimationActive animationDuration={800}>
            <LabelList position="right" fill="#334155" style={{ fontSize: 10, fontWeight: 600 }} dataKey="name" />
            <LabelList position="center" fill="#fff" style={{ fontSize: 11, fontWeight: 700 }} dataKey="value" />
          </Funnel>
        </FunnelChart>
      </ResponsiveContainer>
    );
  }

  // ─── RADAR ──────────────────────────────────────────────────────
  if (type === 'radar' && xColumn && columns && columns.length >= 3) {
    const cats = [...new Set(data.map(r => String(r[xColumn] ?? '')))].slice(0, 4);
    const radarData = columns.map(col => {
      const entry: Record<string, any> = { metric: col };
      for (const cat of cats) {
        const rows = data.filter(r => String(r[xColumn]) === cat);
        const avg = rows.reduce((s, r) => s + (Number(r[col]) || 0), 0) / (rows.length || 1);
        entry[cat] = +avg.toFixed(2);
      }
      return entry;
    });
    return (
      <ResponsiveContainer width="100%" height={260}>
        <RadarChart data={radarData}>
          <PolarGrid stroke="#e2e8f0" />
          <PolarAngleAxis dataKey="metric" tick={{ fontSize: 9, fill: '#64748b' }} />
          <PolarRadiusAxis tick={{ fontSize: 8, fill: '#94a3b8' }} />
          {cats.map((cat, i) => (
            <Radar key={cat} name={cat} dataKey={cat} stroke={VIBRANT[i]} fill={VIBRANT[i]}
              fillOpacity={0.15} strokeWidth={2} animationDuration={800} />
          ))}
          <Legend wrapperStyle={{ fontSize: 10 }} />
          <Tooltip content={<ChartTooltip />} />
        </RadarChart>
      </ResponsiveContainer>
    );
  }

  // ─── TREEMAP ────────────────────────────────────────────────────
  if (type === 'treemap' && xColumn && yColumn) {
    const agg = aggregate(data, xColumn, yColumn);
    const treeData = agg.map((d, i) => ({
      name: d.name, size: Math.abs(d.value), fill: VIBRANT[i % VIBRANT.length],
    }));
    const CustomContent = ({ x, y, width, height, name, fill }: any) => {
      if (width < 30 || height < 25) return null;
      return (
        <g>
          <rect x={x} y={y} width={width} height={height} fill={fill} rx={4} stroke="#fff" strokeWidth={2} style={{ opacity: 0.85 }} />
          <text x={x + width / 2} y={y + height / 2} textAnchor="middle" dominantBaseline="central"
            style={{ fontSize: Math.min(12, width / 6), fill: '#fff', fontWeight: 600 }}>
            {name}
          </text>
        </g>
      );
    };
    return (
      <ResponsiveContainer width="100%" height={240}>
        <Treemap data={treeData} dataKey="size" nameKey="name" content={<CustomContent />}
          animationDuration={800} />
      </ResponsiveContainer>
    );
  }

  // ─── HISTOGRAM ──────────────────────────────────────────────────
  if (type === 'histogram' && xColumn) {
    const bins = histogram(data, xColumn);
    return (
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={bins}>
          <defs>
            <linearGradient id="histGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8b5cf6" />
              <stop offset="100%" stopColor="#c4b5fd" />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="range" tick={{ fontSize: 9, fill: '#64748b' }} />
          <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
          <Tooltip content={<ChartTooltip />} />
          <Bar dataKey="count" fill="url(#histGrad)" radius={[4, 4, 0, 0]} animationDuration={800} />
        </BarChart>
      </ResponsiveContainer>
    );
  }

  // ─── HEATMAP ────────────────────────────────────────────────────
  if (type === 'heatmap' && columns && columns.length >= 2) {
    const { correlationMatrix } = analysis;
    const cols = columns.slice(0, 8);
    return (
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-[9px] border-collapse font-mono">
          <thead>
            <tr><th className="p-1.5 bg-black/40 border-b border-white/5"></th>
              {cols.map(c => <th key={c} className="p-1.5 text-blue-300/70 truncate max-w-[70px] bg-black/40 border-b border-white/5 font-black uppercase tracking-wider">{c}</th>)}
            </tr>
          </thead>
          <tbody>
            {cols.map(row => (
              <tr key={row}>
                <td className="p-1.5 font-bold text-violet-300/80 truncate max-w-[85px] bg-black/40 border-r border-white/5 text-right">{row}</td>
                {cols.map(col => {
                  const e = correlationMatrix.find(e => e.col1 === row && e.col2 === col);
                  const v = e?.value ?? 0;
                  const a = Math.abs(v);
                  const bg = v > 0 ? `rgba(59,130,246,${a * 0.75})` : `rgba(236,72,153,${a * 0.75})`;
                  return (
                    <td key={col} className="p-1.5 text-center font-bold transition-all duration-300"
                      style={{ background: bg, color: a > 0.4 ? '#fff' : 'rgba(255,255,255,0.4)', borderRadius: 2 }}>
                      {v.toFixed(2)}
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

  // ─── BOXPLOT (approximated) ─────────────────────────────────────
  if (type === 'boxplot' && columns) {
    const boxData = columns.slice(0, 5).map(col => {
      const s = analysis.columnStats.find(st => st.column === col);
      if (!s) return null;
      return { name: col, min: s.min, q1: s.q1, median: s.median, q3: s.q3, max: s.max, range: s.max - s.min };
    }).filter(Boolean) as any[];
    return (
      <ResponsiveContainer width="100%" height={240}>
        <ComposedChart data={boxData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#64748b' }} />
          <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
          <Tooltip content={<ChartTooltip />} />
          <Bar dataKey="q1" stackId="box" fill="#ddd6fe" name="Q1" radius={[0, 0, 0, 0]} animationDuration={600} />
          <Bar dataKey="median" stackId="box" fill="#6366f1" name="Median" animationDuration={600} />
          <Bar dataKey="q3" stackId="box" fill="#a78bfa" name="Q3" radius={[4, 4, 0, 0]} animationDuration={600} />
          <Legend wrapperStyle={{ fontSize: 10 }} />
        </ComposedChart>
      </ResponsiveContainer>
    );
  }

  return <p className="text-xs text-slate-400 italic py-8 text-center">Visualization pending...</p>;
}

// ═══════════════════════════════════════════════════════════════════════
// Main Export
// ═══════════════════════════════════════════════════════════════════════
export default function DynamicCharts({ dataset, charts, analysis, filters, onDrilldown }: Props) {
  const filteredData = useMemo(() => filterData(dataset.data, filters), [dataset.data, filters]);
  const displayCharts = charts.slice(0, 9); // Show up to 9 charts in 3x3

  const rows = [];
  for (let i = 0; i < displayCharts.length; i += 3) {
    rows.push(displayCharts.slice(i, i + 3));
  }

  return (
    <div className="space-y-4">
      {rows.map((row, ri) => (
        <div key={ri} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {row.map((chart, ci) => {
            const Icon = CHART_ICON_MAP[chart.type] || Activity;
            return (
              <SectionCard key={chart.id} title={chart.title} icon={Icon} badge={chart.type.replace('_', ' ')} index={ri * 3 + ci}>
                <ChartWrapper chart={chart} data={filteredData} onDrilldown={onDrilldown}>
                  <RenderChart chart={chart} data={filteredData} analysis={analysis} />
                </ChartWrapper>
              </SectionCard>
            );
          })}
        </div>
      ))}
    </div>
  );
}
