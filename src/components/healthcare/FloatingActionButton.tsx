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
    { icon: Sparkles, label: 'AI Assistant', color: 'bg-violet-500 hover:bg-violet-600', onClick: onOpenAI },
    { icon: FileSpreadsheet, label: 'Export CSV', color: 'bg-emerald-500 hover:bg-emerald-600', onClick: onExportCSV },
    { icon: BarChart3, label: 'Scroll to Top', color: 'bg-blue-500 hover:bg-blue-600', onClick: onScrollTop },
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
      {/* Action buttons */}
      {expanded && (
        <div className="flex flex-col gap-2 mb-1 animate-fade-up">
          {actions.map((action, i) => (
            <button
              key={i}
              onClick={() => { action.onClick?.(); setExpanded(false); }}
              className={`flex items-center gap-2 px-3 py-2 rounded-full text-white text-xs font-medium shadow-lg transition-all duration-200 ${action.color}`}
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <action.icon className="h-3.5 w-3.5" />
              {action.label}
            </button>
          ))}
        </div>
      )}

      {/* Main FAB */}
      <button
        onClick={() => setExpanded(!expanded)}
        className={`w-12 h-12 rounded-full bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center justify-center ${
          expanded ? 'rotate-45' : ''
        }`}
      >
        {expanded ? <X className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
      </button>
    </div>
  );
}
