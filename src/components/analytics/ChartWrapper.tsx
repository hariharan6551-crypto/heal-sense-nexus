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
        ctx!.fillStyle = '#0f172a'; // Match dark background
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
    <div className="relative group h-full w-full" ref={chartRef}>
      {/* Action bar that appears on hover */}
      <div className="absolute top-2 right-2 z-20 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        {/* Drilldown */}
        {onDrilldown && (
          <button
            onClick={() => onDrilldown(chart.id)}
            className="p-1.5 bg-black/40 backdrop-blur-md rounded-lg border border-blue-500/30 shadow-[0_0_10px_rgba(59,130,246,0.2)] hover:bg-blue-500/20 hover:border-blue-500/50 transition-all"
            title="Drill Down Matrix"
          >
            <TrendingUp className="h-3.5 w-3.5 text-blue-400 drop-shadow-[0_0_5px_currentColor]" />
          </button>
        )}

        {/* Export */}
        <div className="relative">
          <button
            onClick={() => setShowExport(!showExport)}
            className={`p-1.5 rounded-lg border transition-all shadow-[0_0_10px_rgba(6,182,212,0.2)] ${showExport ? 'bg-cyan-500/20 border-cyan-500/50' : 'bg-black/40 backdrop-blur-md border-cyan-500/30 hover:bg-cyan-500/20 hover:border-cyan-500/50'}`}
            title="Export Data"
          >
            <Download className="h-3.5 w-3.5 text-cyan-400 drop-shadow-[0_0_5px_currentColor]" />
          </button>
          {showExport && (
            <div className="absolute right-0 top-full mt-2 bg-slate-900/90 backdrop-blur-xl rounded-xl border border-cyan-500/30 shadow-[0_0_20px_rgba(0,0,0,0.8)] p-1.5 min-w-[140px] z-30 animate-scale-in">
              <button
                onClick={exportPNG}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-slate-300 hover:text-white hover:bg-cyan-500/20 font-mono rounded-lg transition-colors group"
              >
                <Image className="h-3.5 w-3.5 text-cyan-500 group-hover:text-cyan-400" />
                Export PNG
              </button>
              <button
                onClick={exportCSV}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-slate-300 hover:text-white hover:bg-cyan-500/20 font-mono rounded-lg transition-colors group"
              >
                <FileSpreadsheet className="h-3.5 w-3.5 text-cyan-500 group-hover:text-cyan-400" />
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
