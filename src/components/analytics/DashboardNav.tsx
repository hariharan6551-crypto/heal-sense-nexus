import { useRef, useState, useEffect } from 'react';
import {
  LayoutDashboard, Database, Bot, FileText, Settings,
  Sparkles, Upload, Clock, Bell, LogOut, ChevronDown, Menu, X
} from 'lucide-react';
import { parseFile } from '@/lib/parseData';
import type { DatasetInfo } from '@/lib/parseData';
import { useNavigate } from 'react-router-dom';

interface Props {
  onDatasetLoaded: (ds: DatasetInfo) => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
  dashboardTitle?: string;
  datasetName?: string;
}

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: 'Dashboard', color: '#6366f1' },
  { icon: Database, label: 'Dataset', color: '#06b6d4' },
  { icon: Bot, label: 'AI Assistant', color: '#8b5cf6' },
  { icon: FileText, label: 'Reports', color: '#f59e0b' },
  { icon: Settings, label: 'Settings', color: '#64748b' },
];

export default function DashboardNav({ onDatasetLoaded, activeTab, onTabChange, dashboardTitle, datasetName }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const [time, setTime] = useState(new Date());
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
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

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    sessionStorage.removeItem('isAuthenticated');
    sessionStorage.removeItem('dashboard-dataset');
    navigate('/login');
  };

  const username = localStorage.getItem('dashboard-username') || 'Admin';

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-[100] bg-white border-b border-slate-200 shadow-sm" id="primary-nav-ribbon">
        {/* Main nav bar */}
        <div className="h-[64px]">
          <div className="w-full h-full max-w-[1800px] mx-auto flex items-center justify-between px-4 lg:px-6">

            {/* Logo + Title */}
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0 shadow-sm">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <div className="min-w-0">
                <h1 className="text-sm lg:text-base font-bold text-slate-800 tracking-tight truncate leading-tight">
                  {dashboardTitle || 'Enterprise Analytics Platform'}
                </h1>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] text-slate-500 tracking-wide font-medium">Enterprise Suite</span>
                  {datasetName && (
                    <>
                      <span className="text-slate-300">•</span>
                      <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-[9px] font-bold text-slate-600 truncate max-w-[120px] sm:max-w-[200px]">
                        <Database className="w-2.5 h-2.5" />
                        {datasetName}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Desktop Nav Items */}
            <nav className="hidden lg:flex items-center gap-2 h-full ml-8" id="nav-tabs">
              {NAV_ITEMS.map(item => {
                const isActive = activeTab === item.label;
                return (
                  <button
                    key={item.label}
                    id={`nav-tab-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                    onClick={() => onTabChange(item.label)}
                    className={`relative px-4 h-[40px] flex items-center gap-2 rounded-full text-sm font-semibold transition-colors ${
                      isActive 
                      ? 'bg-slate-100 text-slate-900 border border-slate-200' 
                      : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                    }`}
                  >
                    <item.icon className={`h-4 w-4 ${isActive ? 'text-blue-600' : ''}`} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Right Section */}
            <div className="flex items-center gap-3 ml-auto">
              {/* Live Clock */}
              <div className="hidden xl:flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                <Clock className="h-3.5 w-3.5" />
                <span>{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
              </div>

              {/* Upload Dataset CTA */}
              <input ref={fileRef} type="file" className="hidden" accept=".csv,.xlsx,.xls,.json" onChange={handleFile} />
              <button
                id="upload-dataset-btn"
                onClick={() => fileRef.current?.click()}
                className="hidden sm:flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-full text-sm font-semibold transition-colors shadow-sm ml-2"
              >
                <Upload className="h-4 w-4" />
                <span>Upload Dataset</span>
              </button>

              {/* Profile */}
              <div className="relative ml-1">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 p-1 pl-2 rounded-full border border-slate-200 bg-white hover:bg-slate-50 transition-colors shadow-sm text-slate-700"
                >
                  <span className="text-xs font-bold pl-1">{username.charAt(0).toUpperCase()}</span>
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-xs font-bold text-white">
                    <ChevronDown className="h-3 w-3" />
                  </div>
                </button>
                {profileOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
                      <p className="text-sm font-bold text-slate-800">{username}</p>
                      <p className="text-[10px] text-slate-500 font-medium uppercase mt-0.5">Enterprise Admin</p>
                    </div>
                    <button onClick={handleLogout} className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors font-semibold group">
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>

              {/* Mobile Menu Toggle */}
              <button
                className="lg:hidden flex items-center justify-center w-9 h-9 rounded-lg border border-slate-200 text-slate-600"
                onClick={() => setMobileOpen(!mobileOpen)}
              >
                {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile drawer */}
        {mobileOpen && (
          <div className="lg:hidden bg-white border-t border-slate-100 animate-in slide-in-from-top-2">
            <nav className="flex flex-col p-4 gap-2">
              {NAV_ITEMS.map(item => {
                const isActive = activeTab === item.label;
                return (
                  <button
                    key={item.label}
                    onClick={() => { onTabChange(item.label); setMobileOpen(false); }}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${
                      isActive
                        ? 'bg-slate-100 text-slate-900'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <item.icon className={`h-5 w-5 ${isActive ? 'text-blue-600' : ''}`} />
                    {item.label}
                  </button>
                );
              })}
              <button
                onClick={() => { fileRef.current?.click(); setMobileOpen(false); }}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-white bg-slate-900 mt-2"
              >
                <Upload className="h-5 w-5" />
                Upload Dataset
              </button>
            </nav>
          </div>
        )}
      </header>

      {/* Click-outside handler for profile dropdown */}
      {profileOpen && (
        <div className="fixed inset-0 z-[99]" onClick={() => setProfileOpen(false)} />
      )}
    </>
  );
}
