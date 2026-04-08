import { useState, useMemo, useRef, useCallback } from 'react';
import {
  Download, BarChart3, TrendingUp, PieChart as PieIcon,
  Table, ChevronDown, Image, FileSpreadsheet, X,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ChartRecommendation } from '@/lib/chartRecommender';

interface Props {
  chart: ChartRecommendation;
  children: React.ReactNode;
  data: Record<string, any>[];
  onDrilldown?: (chartId: string) => void;
}

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
    <div className="relative group h-full w-full" ref={chartRef}>
      {/* Action bar on hover */}
      <div className="absolute top-2 right-2 z-20 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        {/* Drilldown */}
        {onDrilldown && (
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onDrilldown(chart.id)}
            className="p-1.5 rounded-lg transition-all"
            style={{
              background: 'rgba(255,255,255,0.9)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(59,130,246,0.15)',
              boxShadow: '0 2px 8px rgba(59,130,246,0.1)',
            }}
            title="Drill Down Matrix"
          >
            <TrendingUp className="h-3.5 w-3.5 text-blue-500" />
          </motion.button>
        )}

        {/* Export */}
        <div className="relative">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowExport(!showExport)}
            className="p-1.5 rounded-lg transition-all"
            style={{
              background: showExport ? 'rgba(34,197,94,0.08)' : 'rgba(255,255,255,0.9)',
              backdropFilter: 'blur(8px)',
              border: `1px solid ${showExport ? 'rgba(34,197,94,0.2)' : 'rgba(34,197,94,0.15)'}`,
              boxShadow: '0 2px 8px rgba(34,197,94,0.1)',
            }}
            title="Export Data"
          >
            <Download className="h-3.5 w-3.5 text-green-500" />
          </motion.button>
          <AnimatePresence>
            {showExport && (
              <motion.div
                initial={{ opacity: 0, y: -4, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -4, scale: 0.95 }}
                className="absolute right-0 top-full mt-2 rounded-xl p-1.5 min-w-[140px] z-30"
                style={{
                  background: 'rgba(255,255,255,0.98)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(0,0,0,0.06)',
                  boxShadow: '0 12px 40px rgba(0,0,0,0.1), 0 2px 8px rgba(0,0,0,0.04)',
                }}
              >
                <button
                  onClick={exportPNG}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-slate-600 hover:text-slate-800 hover:bg-blue-50 font-semibold rounded-lg transition-colors"
                >
                  <Image className="h-3.5 w-3.5 text-blue-500" />
                  Export PNG
                </button>
                <button
                  onClick={exportCSV}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-slate-600 hover:text-slate-800 hover:bg-green-50 font-semibold rounded-lg transition-colors"
                >
                  <FileSpreadsheet className="h-3.5 w-3.5 text-green-500" />
                  Export CSV
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {children}
    </div>
  );
}
