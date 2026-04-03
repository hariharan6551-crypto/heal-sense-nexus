import { useRef, useState, useEffect } from 'react';
import {
  LayoutDashboard, Database, Bot, FileText, Settings,
  Building2, Sparkles, Upload, Command, Clock
} from 'lucide-react';
import { parseFile } from '@/lib/parseData';
import type { DatasetInfo } from '@/lib/parseData';

interface Props {
  onDatasetLoaded: (ds: DatasetInfo) => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
  dashboardTitle?: string;
  datasetName?: string;
}

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: 'Dashboard' },
  { icon: Database, label: 'Dataset' },
  { icon: Bot, label: 'AI Assistant' },
  { icon: FileText, label: 'Reports' },
  { icon: Settings, label: 'Settings' },
];



export default function DashboardNav({ onDatasetLoaded, activeTab, onTabChange, dashboardTitle, datasetName }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

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
    <header className="fixed top-0 left-0 right-0 h-16 bg-gradient-to-r from-[#312e81] via-[#1e3a8a] to-[#0e7490] text-white shadow-xl z-[100]">
      <div className="w-full h-full max-w-[1600px] mx-auto flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/15 rounded-xl flex items-center justify-center backdrop-blur-md border border-white/10">
            <Sparkles className="h-5 w-5 text-cyan-300" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight">
              {dashboardTitle || 'Analytics Studio'}
            </h1>
            <p className="text-[10px] text-blue-200/90 tracking-wider flex items-center gap-1.5 leading-none mt-0.5">
              <span>Data Insights Platform</span>
              {datasetName && (
                <>
                  <span className="opacity-50">•</span>
                  <span className="px-1.5 py-0.5 rounded-md bg-white/10 border border-white/10 text-[9px] font-semibold text-cyan-100 flex items-center gap-1 shadow-sm">
                    <Database className="w-2.5 h-2.5" />
                    Last Viewed: {datasetName}
                  </span>
                </>
              )}
            </p>
          </div>
          <div className="hidden lg:flex items-center gap-1.5 text-[9px] text-blue-200/60 ml-4 border-l border-white/10 pl-4">
            <Clock className="h-3 w-3" />
            {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            <span className="mx-1">•</span>
            {time.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
          </div>
        </div>

        <div className="flex items-center gap-3 h-full">
          <nav className="hidden md:flex items-center gap-1 mr-2 h-full">
            {NAV_ITEMS.map(item => (
              <button
                key={item.label}
                onClick={() => onTabChange(item.label)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${
                  activeTab === item.label
                    ? 'bg-white/20 text-white shadow-inner scale-105'
                    : 'text-blue-100/80 hover:bg-white/15 hover:text-white'
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </button>
            ))}
          </nav>

          <input ref={fileRef} type="file" className="hidden" accept=".csv,.xlsx,.xls,.json" onChange={handleFile} />
          <button
            onClick={() => fileRef.current?.click()}
            className="flex items-center gap-1.5 px-5 py-2 bg-white text-[#1e3a8a] rounded-full text-xs font-extrabold hover:bg-slate-100 transition-all duration-200 shadow-lg shadow-white/10 border border-transparent hover:scale-105"
          >
            <Upload className="h-4 w-4" />
            Upload Dataset
          </button>
          <div className="hidden md:flex items-center gap-1 px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-[9px] text-blue-200/60 ml-1">
            <Command className="h-2.5 w-2.5" />
            <span>K</span>
          </div>
        </div>
      </div>
    </header>
  );
}
