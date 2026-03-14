import { useRef } from 'react';
import {
  LayoutDashboard, Database, Bot, FileText, Settings,
  Building2, Upload,
} from 'lucide-react';
import { parseFile } from '@/lib/parseData';
import type { DatasetInfo } from '@/lib/parseData';

interface Props {
  onDatasetLoaded: (ds: DatasetInfo) => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
  datasetName: string;
}

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: 'Dashboard' },
  { icon: Database, label: 'Dataset' },
  { icon: Bot, label: 'AI Assistant' },
  { icon: FileText, label: 'Reports' },
  { icon: Settings, label: 'Settings' },
];

export default function DashboardNav({ onDatasetLoaded, activeTab, onTabChange, datasetName }: Props) {
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
    <header className="bg-gradient-to-r from-[#1e3a5f] to-[#2563eb] text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-[1600px] mx-auto flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
            <Building2 className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight">Post-Discharge Social Support & Recovery Tracker</h1>
            <p className="text-[10px] text-blue-200 uppercase tracking-widest">
              Monitor & Analyze Patient Recovery Data
              {datasetName !== 'Healthcare Patient Dataset' && (
                <span className="ml-2 text-cyan-300">• {datasetName}</span>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <nav className="hidden md:flex items-center gap-1 mr-2">
            {NAV_ITEMS.map(item => (
              <button
                key={item.label}
                onClick={() => onTabChange(item.label)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  activeTab === item.label
                    ? 'bg-white/20 text-white'
                    : 'text-blue-100 hover:bg-white/10'
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
            className="flex items-center gap-1.5 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg text-xs font-semibold hover:bg-white/30 transition-colors border border-white/20"
          >
            <Upload className="h-3.5 w-3.5" />
            Upload New Dataset
          </button>
        </div>
      </div>
    </header>
  );
}
