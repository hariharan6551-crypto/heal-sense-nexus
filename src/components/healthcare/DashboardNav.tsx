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
      <header className="fixed top-0 left-0 right-0 z-[100]" id="primary-nav-ribbon">
        {/* Animated gradient border at top */}
        <div className="h-[3px] w-full nav-gradient-border" />

        {/* Main nav bar */}
        <div className="nav-glass-bg h-[60px]">
          <div className="w-full h-full max-w-[1800px] mx-auto flex items-center justify-between px-4 lg:px-6">

            {/* Logo + Title */}
            <div className="flex items-center gap-3 min-w-0">
              <div className="nav-logo-container">
                <Sparkles className="h-5 w-5 text-cyan-300 nav-logo-sparkle" />
              </div>
              <div className="min-w-0">
                <h1 className="text-sm lg:text-base font-bold text-white tracking-tight truncate leading-tight">
                  {dashboardTitle || 'Post Discharge Social Support and Recovery Tracker'}
                </h1>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[9px] text-blue-200/70 tracking-widest uppercase font-semibold">Enterprise AI Suite</span>
                  {datasetName && (
                    <>
                      <span className="text-blue-300/30">•</span>
                      <span className="nav-dataset-badge">
                        <Database className="w-2.5 h-2.5" />
                        {datasetName}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Desktop Nav Items */}
            <nav className="hidden lg:flex items-center gap-0.5 h-full" id="nav-tabs">
              {NAV_ITEMS.map(item => {
                const isActive = activeTab === item.label;
                return (
                  <button
                    key={item.label}
                    id={`nav-tab-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                    onClick={() => onTabChange(item.label)}
                    className={`nav-tab-btn ${isActive ? 'nav-tab-active' : 'nav-tab-inactive'}`}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.label}</span>
                    {isActive && <div className="nav-tab-indicator" />}
                  </button>
                );
              })}
            </nav>

            {/* Right Section */}
            <div className="flex items-center gap-2">
              {/* Live Clock */}
              <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[10px] text-blue-200/60 font-mono">
                <Clock className="h-3 w-3 text-cyan-400/70" />
                <span>{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
              </div>

              {/* Upload Dataset CTA */}
              <input ref={fileRef} type="file" className="hidden" accept=".csv,.xlsx,.xls,.json" onChange={handleFile} />
              <button
                id="upload-dataset-btn"
                onClick={() => fileRef.current?.click()}
                className="nav-upload-cta"
              >
                <Upload className="h-4 w-4" />
                <span className="hidden sm:inline">Upload Dataset</span>
                <div className="nav-cta-glow" />
              </button>

              {/* Profile */}
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-all text-white/80 hover:text-white"
                >
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-400 to-cyan-400 flex items-center justify-center text-[10px] font-bold text-white">
                    {username.charAt(0).toUpperCase()}
                  </div>
                  <ChevronDown className="h-3 w-3 hidden sm:block" />
                </button>
                {profileOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white/95 backdrop-blur-xl rounded-xl shadow-2xl border border-slate-200 overflow-hidden z-50 animate-fade-up">
                    <div className="px-4 py-3 border-b border-slate-100">
                      <p className="text-xs font-semibold text-slate-800">{username}</p>
                      <p className="text-[10px] text-slate-400">Enterprise Admin</p>
                    </div>
                    <button onClick={handleLogout} className="w-full flex items-center gap-2 px-4 py-2.5 text-xs text-red-500 hover:bg-red-50 transition-colors">
                      <LogOut className="h-3.5 w-3.5" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>

              {/* Mobile Menu Toggle */}
              <button
                className="lg:hidden flex items-center justify-center w-8 h-8 rounded-lg bg-white/10 text-white"
                onClick={() => setMobileOpen(!mobileOpen)}
              >
                {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile drawer */}
        {mobileOpen && (
          <div className="lg:hidden bg-slate-900/98 backdrop-blur-xl border-b border-white/10 animate-fade-up">
            <nav className="flex flex-col p-3 gap-1">
              {NAV_ITEMS.map(item => {
                const isActive = activeTab === item.label;
                return (
                  <button
                    key={item.label}
                    onClick={() => { onTabChange(item.label); setMobileOpen(false); }}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-white/15 text-white'
                        : 'text-blue-100/60 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </button>
                );
              })}
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
