import { useMemo } from 'react';
import {
  Users, Clock, Heart, AlertTriangle, Stethoscope, UserCheck,
  TrendingUp, BarChart3, Hash, DollarSign, Activity, Percent,
} from 'lucide-react';
import type { DatasetInfo } from '@/lib/parseData';
import type { ColumnStats } from '@/lib/analyzeData';

interface Props {
  dataset: DatasetInfo;
  columnStats: ColumnStats[];
}

const ICON_MAP: Record<string, any> = {
  patient: Users, age: Clock, support: Heart, readmission: AlertTriangle,
  visit: Stethoscope, doctor: UserCheck, risk: AlertTriangle,
  recovery: TrendingUp, score: Activity, count: Hash,
  price: DollarSign, amount: DollarSign, rate: Percent, revenue: DollarSign,
  cost: DollarSign, sales: BarChart3, total: Hash, quantity: Hash,
};

const COLORS = ['#2563eb', '#0891b2', '#10b981', '#ef4444', '#8b5cf6', '#f59e0b', '#ec4899', '#14b8a6'];

function pickIcon(colName: string) {
  const lower = colName.toLowerCase();
  for (const [key, Icon] of Object.entries(ICON_MAP)) {
    if (lower.includes(key)) return Icon;
  }
  return BarChart3;
}

function formatVal(v: number): string {
  if (v >= 1e6) return (v / 1e6).toFixed(1) + 'M';
  if (v >= 1e3) return (v / 1e3).toFixed(1) + 'K';
  if (Number.isInteger(v)) return v.toLocaleString();
  return v.toFixed(2);
}

export default function DynamicKPIs({ dataset, columnStats }: Props) {
  const kpis = useMemo(() => {
    const stats = columnStats.slice(0, 6);
    return stats.map((s, i) => {
      const Icon = pickIcon(s.column);
      const progressPct = s.max > 0 ? Math.min(100, (s.mean / s.max) * 100) : 50;
      return {
        label: s.column.replace(/([A-Z])/g, ' $1').replace(/[_-]/g, ' ').trim(),
        value: formatVal(s.mean),
        suffix: s.max > 100 ? '' : s.max <= 10 ? `/ ${s.max}` : '',
        Icon,
        color: COLORS[i % COLORS.length],
        progress: progressPct,
      };
    });
  }, [columnStats]);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {kpis.map((k, i) => (
        <div
          key={i}
          className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 animate-fade-up"
          style={{ animationDelay: `${i * 80}ms` }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide truncate pr-2">
              {k.label}
            </span>
            <k.Icon className="h-4 w-4 flex-shrink-0" style={{ color: k.color }} />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-slate-800">{k.value}</span>
            {k.suffix && <span className="text-sm text-slate-500">{k.suffix}</span>}
          </div>
          <div className="mt-2 h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${k.progress}%`, backgroundColor: k.color }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
