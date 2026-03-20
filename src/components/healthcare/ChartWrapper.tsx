import { useState, useMemo, useRef, useCallback } from 'react';
import {
  Download, BarChart3, TrendingUp, PieChart as PieIcon,
  Table, ChevronDown, Image, FileSpreadsheet, X,
} from 'lucide-react';
import type { ChartRecommendation } from '@/lib/chartRecommender';

interface Props {
  chart: ChartRecommendation;
  children: React.ReactNode;
  data: Record<string, any>[];
  onDrilldown?: (chartId: string) => void;
}

const VIEW_OPTIONS = [
  { key: 'default', label: 'Default', icon: BarChart3 },
  { key: 'table', label: 'Table', icon: Table },
];

export default function ChartWrapper({ chart, children, data, onDrilldown }: Props) {
  const [showExport, setShowExport] = useState(false);
  const chartRef = useRef<HTMLDivElement>(null);

  const exportCSV = useCallback(() => {
    if (!data.length) return;
    const cols = Object.keys(data[0]);
    const csvContent = [
      cols.join(','),
      ...data.map(row => cols.map(c => {
        const val = String(row[c] ?? '');
        return val.includes(',') ? `"${val}"` : val;
      }).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${chart.title.replace(/\s+/g, '_')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setShowExport(false);
  }, [data, chart.title]);

  const exportPNG = useCallback(async () => {
    if (!chartRef.current) return;
    try {
      const svg = chartRef.current.querySelector('svg');
      if (!svg) return;
      
      const svgData = new XMLSerializer().serializeToString(svg);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new window.Image();
      
      img.onload = () => {
        canvas.width = img.width * 2;
        canvas.height = img.height * 2;
        ctx!.fillStyle = '#ffffff';
        ctx!.fillRect(0, 0, canvas.width, canvas.height);
        ctx!.scale(2, 2);
        ctx!.drawImage(img, 0, 0);
        
        const a = document.createElement('a');
        a.download = `${chart.title.replace(/\s+/g, '_')}.png`;
        a.href = canvas.toDataURL('image/png');
        a.click();
      };
      
      img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
    } catch (err) {
      console.error('Export failed', err);
    }
    setShowExport(false);
  }, [chart.title]);

  return (
    <div className="relative group" ref={chartRef}>
      {/* Action bar that appears on hover */}
      <div className="absolute top-2 right-2 z-20 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        {/* Drilldown */}
        {onDrilldown && (
          <button
            onClick={() => onDrilldown(chart.id)}
            className="p-1.5 bg-white/90 backdrop-blur-sm rounded-lg border border-slate-200 shadow-sm hover:bg-indigo-50 hover:border-indigo-200 transition-all"
            title="Drill Down"
          >
            <TrendingUp className="h-3 w-3 text-indigo-600" />
          </button>
        )}

        {/* Export */}
        <div className="relative">
          <button
            onClick={() => setShowExport(!showExport)}
            className="p-1.5 bg-white/90 backdrop-blur-sm rounded-lg border border-slate-200 shadow-sm hover:bg-blue-50 hover:border-blue-200 transition-all"
            title="Export"
          >
            <Download className="h-3 w-3 text-blue-600" />
          </button>
          {showExport && (
            <div className="absolute right-0 top-full mt-1 bg-white rounded-xl border border-slate-200 shadow-xl p-1 min-w-[120px] z-30">
              <button
                onClick={exportPNG}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-700 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <Image className="h-3 w-3" />
                Export PNG
              </button>
              <button
                onClick={exportCSV}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-700 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <FileSpreadsheet className="h-3 w-3" />
                Export CSV
              </button>
            </div>
          )}
        </div>
      </div>

      {children}
    </div>
  );
}
