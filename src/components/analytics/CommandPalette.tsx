import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  Search, LayoutDashboard, Database, Bot, FileText, Settings, BarChart3,
  ArrowRight, Command, X,
} from 'lucide-react';
import GlassCard from '@/components/core/GlassCard';

interface CommandItem {
  id: string;
  label: string;
  icon: any;
  action: () => void;
  category: string;
}

interface Props {
  onTabChange: (tab: string) => void;
  onAction?: (action: string) => void;
}

export default function CommandPalette({ onTabChange, onAction }: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const items: CommandItem[] = useMemo(() => [
    { id: 'dash', label: 'Initialize Main HUD', icon: LayoutDashboard, action: () => onTabChange('Dashboard'), category: 'System Navigation' },
    { id: 'data', label: 'Access Data Matrix', icon: Database, action: () => onTabChange('Dataset'), category: 'System Navigation' },
    { id: 'ai', label: 'Engage AI Copilot', icon: Bot, action: () => onTabChange('AI Assistant'), category: 'System Navigation' },
    { id: 'reports', label: 'Generate Telemetry Reports', icon: FileText, action: () => onTabChange('Reports'), category: 'System Navigation' },
    { id: 'settings', label: 'Configure System Parameters', icon: Settings, action: () => onTabChange('Settings'), category: 'System Navigation' },
    { id: 'export', label: 'Extract Matrix to CSV', icon: BarChart3, action: () => onAction?.('exportCSV'), category: 'Executable Actions' },
  ], [onTabChange, onAction]);

  const filtered = useMemo(() => {
    if (!query) return items;
    const q = query.toLowerCase();
    return items.filter(i => i.label.toLowerCase().includes(q) || i.category.toLowerCase().includes(q));
  }, [items, query]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setOpen(prev => !prev);
        setQuery('');
        setSelected(0);
      }
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
  }, [open]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setSelected(s => Math.min(s + 1, filtered.length - 1)); }
    if (e.key === 'ArrowUp') { e.preventDefault(); setSelected(s => Math.max(s - 1, 0)); }
    if (e.key === 'Enter' && filtered[selected]) {
      filtered[selected].action();
      setOpen(false);
    }
  }, [filtered, selected]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]" onClick={() => setOpen(false)}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-md animate-fade-in" />

      {/* Palette */}
      <div
        className="relative z-10 w-full max-w-xl bg-white/95 backdrop-blur-xl border border-slate-200 rounded-2xl shadow-2xl overflow-hidden animate-scale-in"
        onClick={e => e.stopPropagation()}
      >
        {/* Search Input */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 bg-white">
          <Command className="h-5 w-5 text-blue-500 flex-shrink-0 animate-pulse" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Awaiting command input..."
            value={query}
            onChange={e => { setQuery(e.target.value); setSelected(0); }}
            onKeyDown={handleKeyDown}
            className="flex-1 text-base font-mono font-medium text-slate-800 placeholder-slate-400 outline-none bg-transparent"
          />
          <kbd className="hidden sm:inline-flex items-center px-2 py-0.5 text-[10px] font-bold font-mono text-slate-500 bg-slate-100 rounded border border-slate-200 shadow-sm">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div className="max-h-[350px] overflow-y-auto p-3 custom-scrollbar">
          {filtered.length === 0 ? (
            <p className="text-center text-sm font-mono text-pink-500 font-bold py-10 opacity-70">ERR: Unknown command sequence</p>
          ) : (
            <>
              {['System Navigation', 'Executable Actions'].map(cat => {
                const catItems = filtered.filter(i => i.category === cat);
                if (catItems.length === 0) return null;
                return (
                  <div key={cat} className="mb-2">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-3 py-2">{cat}</p>
                    {catItems.map((item) => {
                      const idx = filtered.indexOf(item);
                      return (
                        <button
                          key={item.id}
                          onClick={() => { item.action(); setOpen(false); }}
                          onMouseEnter={() => setSelected(idx)}
                          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200 ${
                            idx === selected ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-sm' : 'text-slate-600 hover:bg-slate-50 border border-transparent cursor-pointer'
                          }`}
                        >
                          <item.icon className={`h-4 w-4 flex-shrink-0 ${idx === selected ? 'text-blue-600' : 'text-slate-400'}`} />
                          <span className={`text-xs font-mono flex-1 ${idx === selected ? 'font-black' : 'font-semibold'}`}>{item.label}</span>
                          {idx === selected && <ArrowRight className="h-4 w-4 text-blue-500" />}
                        </button>
                      );
                    })}
                  </div>
                );
              })}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 bg-slate-50">
          <div className="flex items-center gap-3 text-[10px] text-slate-500 font-mono font-medium">
            <div className="flex items-center gap-1.5">
              <kbd className="px-1.5 py-0.5 bg-white rounded border border-slate-200 shadow-sm">↑↓</kbd>
              <span>Navigate</span>
            </div>
            <div className="flex items-center gap-1.5">
              <kbd className="px-1.5 py-0.5 bg-white rounded border border-slate-200 shadow-sm">↵</kbd>
              <span>Execute</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-mono font-bold">
            <Command className="h-3 w-3 inline-block" /> + K <span className="opacity-50 font-normal">to close</span>
          </div>
        </div>
      </div>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.02);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(59, 130, 246, 0.2);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(59, 130, 246, 0.4);
        }
      `}</style>
    </div>
  );
}
