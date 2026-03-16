import { useRef } from 'react';
import {
  LayoutDashboard, Database, Bot, FileText, Settings,
  Building2, Sparkles, Upload
} from 'lucide-react';
import { parseFile } from '@/lib/parseData';
import type { DatasetInfo } from '@/lib/parseData';

interface Props {
  onDatasetLoaded: (ds: DatasetInfo) => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: 'Dashboard' },
  { icon: Database, label: 'Dataset' },
  { icon: Bot, label: 'AI Assistant' },
  { icon: FileText, label: 'Reports' },
  { icon: Settings, label: 'Settings' },
];



export default function DashboardNav({ onDatasetLoaded, activeTab, onTabChange }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const ds = await parseFile(file);
      onDatasetLoaded(ds);
    } catch (err) {
      console.error('Parse error', err);
    }
    e.target.value = '';
  };

  return (
    <header className="bg-gradient-to-r from-[#312e81] via-[#1e3a8a] to-[#0e7490] text-white shadow-xl sticky top-0 z-50">
      <div className="max-w-[1600px] mx-auto flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/15 rounded-xl flex items-center justify-center backdrop-blur-md border border-white/10">
            <Sparkles className="h-5 w-5 text-cyan-300" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight">Analytics Studio</h1>
            <p className="text-[10px] text-blue-200/80 uppercase tracking-widest">
              Data Insights Platform
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <nav className="hidden md:flex items-center gap-0.5 mr-2">
            {NAV_ITEMS.map(item => (
              <button
                key={item.label}
                onClick={() => onTabChange(item.label)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                  activeTab === item.label
                    ? 'bg-white/20 text-white shadow-inner'
                    : 'text-blue-100/80 hover:bg-white/10 hover:text-white'
                }`}
              >
                <item.icon className="h-3.5 w-3.5" />
                {item.label}
              </button>
            ))}
          </nav>

          <input ref={fileRef} type="file" className="hidden" accept=".csv,.xlsx,.xls,.json" onChange={handleFile} />
          <button
            onClick={() => fileRef.current?.click()}
            className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg text-xs font-bold hover:from-cyan-400 hover:to-blue-400 transition-all duration-200 shadow-lg shadow-cyan-500/20 border border-white/10"
          >
            <Upload className="h-3.5 w-3.5" />
            Upload Dataset
          </button>
        </div>
      </div>
    </header>
  );
}
