import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  Search, LayoutDashboard, Database, Bot, FileText, Settings, BarChart3,
  ArrowRight, Command, X,
} from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';

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
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md animate-fade-in" />

      {/* Palette */}
      <div
        className="relative z-10 w-full max-w-xl bg-slate-900/90 backdrop-blur-xl border border-blue-500/30 rounded-2xl shadow-[0_0_50px_rgba(59,130,246,0.3)] overflow-hidden animate-scale-in"
        onClick={e => e.stopPropagation()}
      >
        {/* Search Input */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-blue-500/30 bg-black/40">
          <Command className="h-5 w-5 text-blue-400 drop-shadow-[0_0_5px_currentColor] flex-shrink-0 animate-pulse" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Awaiting command input..."
            value={query}
            onChange={e => { setQuery(e.target.value); setSelected(0); }}
            onKeyDown={handleKeyDown}
            className="flex-1 text-base font-mono text-blue-100 placeholder-blue-300/40 outline-none bg-transparent"
          />
          <kbd className="hidden sm:inline-flex items-center px-2 py-0.5 text-[10px] font-bold font-mono text-blue-300 bg-blue-500/10 rounded border border-blue-500/30 shadow-[0_0_10px_rgba(59,130,246,0.2)]">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div className="max-h-[350px] overflow-y-auto p-3 custom-scrollbar">
          {filtered.length === 0 ? (
            <p className="text-center text-sm font-mono text-pink-400 py-10 opacity-70">ERR: Unknown command sequence</p>
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
                            idx === selected ? 'bg-blue-500/20 text-blue-200 border border-blue-500/50 shadow-[inset_0_0_20px_rgba(59,130,246,0.3)]' : 'text-slate-300 hover:bg-white/5 border border-transparent'
                          }`}
                        >
                          <item.icon className={`h-4 w-4 flex-shrink-0 ${idx === selected ? 'text-blue-400 drop-shadow-[0_0_5px_currentColor]' : 'text-slate-500'}`} />
                          <span className={`text-xs font-mono font-bold flex-1 ${idx === selected ? 'drop-shadow-[0_0_3px_currentColor]' : ''}`}>{item.label}</span>
                          {idx === selected && <ArrowRight className="h-4 w-4 text-blue-400 drop-shadow-[0_0_5px_currentColor]" />}
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
        <div className="flex items-center justify-between px-5 py-3 border-t border-blue-500/30 bg-black/60">
          <div className="flex items-center gap-3 text-[10px] text-blue-300/70 font-mono">
            <div className="flex items-center gap-1.5">
              <kbd className="px-1.5 py-0.5 bg-blue-500/10 rounded border border-blue-500/30">↑↓</kbd>
              <span>Navigate</span>
            </div>
            <div className="flex items-center gap-1.5">
              <kbd className="px-1.5 py-0.5 bg-blue-500/10 rounded border border-blue-500/30">↵</kbd>
              <span>Execute</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-blue-300/70 font-mono font-bold">
            <Command className="h-3 w-3 inline-block" /> + K <span className="opacity-50 font-normal">to close</span>
          </div>
        </div>
      </div>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.2);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(59, 130, 246, 0.4);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(59, 130, 246, 0.6);
        }
      `}</style>
    </div>
  );
}
