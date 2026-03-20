import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  Search, LayoutDashboard, Database, Bot, FileText, Settings, BarChart3,
  X, ArrowRight, Command,
} from 'lucide-react';

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
    { id: 'dash', label: 'Go to Dashboard', icon: LayoutDashboard, action: () => onTabChange('Dashboard'), category: 'Navigation' },
    { id: 'data', label: 'View Dataset', icon: Database, action: () => onTabChange('Dataset'), category: 'Navigation' },
    { id: 'ai', label: 'Open AI Assistant', icon: Bot, action: () => onTabChange('AI Assistant'), category: 'Navigation' },
    { id: 'reports', label: 'View Reports', icon: FileText, action: () => onTabChange('Reports'), category: 'Navigation' },
    { id: 'settings', label: 'Open Settings', icon: Settings, action: () => onTabChange('Settings'), category: 'Navigation' },
    { id: 'export', label: 'Export Data as CSV', icon: BarChart3, action: () => onAction?.('exportCSV'), category: 'Actions' },
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
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm animate-fade-in" />

      {/* Palette */}
      <div
        className="relative z-10 w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-scale-in"
        onClick={e => e.stopPropagation()}
      >
        {/* Search Input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100">
          <Search className="h-4 w-4 text-slate-400 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command or search..."
            value={query}
            onChange={e => { setQuery(e.target.value); setSelected(0); }}
            onKeyDown={handleKeyDown}
            className="flex-1 text-sm text-slate-700 placeholder-slate-400 outline-none bg-transparent"
          />
          <kbd className="hidden sm:block px-1.5 py-0.5 text-[9px] font-medium text-slate-400 bg-slate-100 rounded border border-slate-200">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div className="max-h-[300px] overflow-y-auto p-2">
          {filtered.length === 0 ? (
            <p className="text-center text-xs text-slate-400 py-8">No results found</p>
          ) : (
            <>
              {['Navigation', 'Actions'].map(cat => {
                const catItems = filtered.filter(i => i.category === cat);
                if (catItems.length === 0) return null;
                return (
                  <div key={cat}>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1.5">{cat}</p>
                    {catItems.map((item) => {
                      const idx = filtered.indexOf(item);
                      return (
                        <button
                          key={item.id}
                          onClick={() => { item.action(); setOpen(false); }}
                          onMouseEnter={() => setSelected(idx)}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors ${
                            idx === selected ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          <item.icon className="h-4 w-4 flex-shrink-0" />
                          <span className="text-sm font-medium flex-1">{item.label}</span>
                          {idx === selected && <ArrowRight className="h-3.5 w-3.5 text-indigo-400" />}
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
        <div className="flex items-center justify-between px-4 py-2 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2 text-[9px] text-slate-400">
            <kbd className="px-1 py-0.5 bg-slate-100 rounded text-[8px] border border-slate-200">↑↓</kbd>
            Navigate
            <kbd className="px-1 py-0.5 bg-slate-100 rounded text-[8px] border border-slate-200 ml-1">↵</kbd>
            Select
          </div>
          <div className="flex items-center gap-1 text-[9px] text-slate-400">
            <Command className="h-3 w-3" /> + K
          </div>
        </div>
      </div>
    </div>
  );
}
