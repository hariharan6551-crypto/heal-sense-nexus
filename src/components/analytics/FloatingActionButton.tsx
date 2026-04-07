import { useState, useCallback } from 'react';
import {
  Plus, X, Download, Sparkles, MessageSquare,
  BarChart3, FileSpreadsheet,
} from 'lucide-react';

interface Props {
  onExportCSV?: () => void;
  onOpenAI?: () => void;
  onScrollTop?: () => void;
}

export default function FloatingActionButton({ onExportCSV, onOpenAI, onScrollTop }: Props) {
  const [expanded, setExpanded] = useState(false);

  const actions = [
    { icon: Sparkles, label: 'Engage AI', color: 'bg-indigo-500/80 hover:bg-indigo-500 text-indigo-100 border border-indigo-400/50 shadow-[0_0_15px_rgba(99,102,241,0.5)]', onClick: onOpenAI },
    { icon: FileSpreadsheet, label: 'Extract Data', color: 'bg-emerald-500/80 hover:bg-emerald-500 text-emerald-100 border border-emerald-400/50 shadow-[0_0_15px_rgba(16,185,129,0.5)]', onClick: onExportCSV },
    { icon: BarChart3, label: 'Top Navigation', color: 'bg-blue-500/80 hover:bg-blue-500 text-blue-100 border border-blue-400/50 shadow-[0_0_15px_rgba(59,130,246,0.5)]', onClick: onScrollTop },
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {/* Action buttons */}
      {expanded && (
        <div className="flex flex-col gap-3 mb-2 animate-fade-up">
          {actions.map((action, i) => (
            <button
              key={i}
              onClick={() => { action.onClick?.(); setExpanded(false); }}
              className={`flex items-center gap-2.5 px-4 py-2.5 rounded-full backdrop-blur-md text-xs font-bold font-mono tracking-wide transition-all duration-300 hover:scale-105 ${action.color}`}
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <action.icon className="h-4 w-4 drop-shadow-[0_0_5px_currentColor]" />
              {action.label}
            </button>
          ))}
        </div>
      )}

      {/* Main FAB */}
      <button
        onClick={() => setExpanded(!expanded)}
        className={`w-14 h-14 rounded-full bg-slate-900/90 backdrop-blur-xl border-2 border-blue-500/50 text-white shadow-[0_0_30px_rgba(59,130,246,0.5)] hover:shadow-[0_0_40px_rgba(59,130,246,0.8)] hover:scale-105 hover:bg-black transition-all duration-300 flex items-center justify-center group ${
          expanded ? 'rotate-45 border-pink-500/50 shadow-[0_0_30px_rgba(236,72,153,0.5)] hover:shadow-[0_0_40px_rgba(236,72,153,0.8)]' : ''
        }`}
      >
        {expanded ? <X className="h-6 w-6 text-pink-400 drop-shadow-[0_0_8px_currentColor]" /> : <Plus className="h-6 w-6 text-blue-400 drop-shadow-[0_0_8px_currentColor] group-hover:scale-110 transition-transform" />}
      </button>
    </div>
  );
}
