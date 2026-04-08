import { useRef, useState, useEffect } from 'react';
import {
  LayoutDashboard, Database, Bot, FileText, Settings,
  Sparkles, Upload, Clock, Bell, LogOut, ChevronDown, Menu, X,
  Zap, TrendingUp,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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
  { icon: LayoutDashboard, label: 'Dashboard', color: '#3B82F6', bgColor: 'rgba(59,130,246,0.08)' },
  { icon: Database, label: 'Dataset', color: '#22C55E', bgColor: 'rgba(34,197,94,0.08)' },
  { icon: Bot, label: 'AI Assistant', color: '#8B5CF6', bgColor: 'rgba(139,92,246,0.08)' },
  { icon: FileText, label: 'Reports', color: '#EAB308', bgColor: 'rgba(234,179,8,0.08)' },
  { icon: Settings, label: 'Settings', color: '#64748b', bgColor: 'rgba(100,116,139,0.08)' },
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
        {/* Animated rainbow gradient top border */}
        <div className="h-[3px] nav-gradient-border" />

        {/* Main nav bar */}
        <div
          className="h-[64px]"
          style={{
            background: 'rgba(255, 255, 255, 0.92)',
            backdropFilter: 'blur(24px) saturate(180%)',
            WebkitBackdropFilter: 'blur(24px) saturate(180%)',
            borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
            boxShadow: '0 4px 24px rgba(0, 0, 0, 0.04)',
          }}
        >
          <div className="w-full h-full max-w-[1800px] mx-auto flex items-center justify-between px-4 lg:px-6">
            {/* Logo + Title */}
            <div className="flex items-center gap-3 min-w-0">
              <motion.div
                whileHover={{ scale: 1.05, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{
                  background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)',
                  boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)',
                }}
              >
                <Sparkles className="h-4 w-4 text-white" />
              </motion.div>
              <div className="min-w-0">
                <h1 className="text-sm lg:text-base font-bold text-slate-800 tracking-tight truncate leading-tight">
                  {dashboardTitle || 'Enterprise Analytics Platform'}
                </h1>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] text-slate-400 tracking-wide font-medium">Enterprise Suite</span>
                  {datasetName && (
                    <>
                      <span className="text-slate-300">•</span>
                      <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-bold truncate max-w-[120px] sm:max-w-[200px]"
                        style={{
                          background: 'rgba(34,197,94,0.06)',
                          border: '1px solid rgba(34,197,94,0.12)',
                          color: '#16a34a',
                        }}
                      >
                        <Database className="w-2.5 h-2.5" />
                        {datasetName}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Desktop Nav Items */}
            <nav className="hidden lg:flex items-center gap-1.5 h-full ml-8" id="nav-tabs">
              {NAV_ITEMS.map(item => {
                const isActive = activeTab === item.label;
                return (
                  <motion.button
                    key={item.label}
                    id={`nav-tab-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                    onClick={() => onTabChange(item.label)}
                    whileHover={!isActive ? { y: -1 } : {}}
                    whileTap={{ scale: 0.97 }}
                    className="relative px-4 h-[40px] flex items-center gap-2 rounded-xl text-sm font-semibold transition-colors"
                    style={{
                      background: isActive ? item.bgColor : 'transparent',
                      color: isActive ? item.color : '#64748b',
                    }}
                  >
                    <item.icon className="h-4 w-4" style={{ color: isActive ? item.color : undefined }} />
                    <span>{item.label}</span>
                    {isActive && (
                      <motion.div
                        layoutId="nav-indicator"
                        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-[3px] rounded-full"
                        style={{ background: `linear-gradient(90deg, ${item.color}, ${item.color}80)` }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                      />
                    )}
                  </motion.button>
                );
              })}
            </nav>

            {/* Right Section */}
            <div className="flex items-center gap-3 ml-auto">
              {/* Live Clock */}
              <div className="hidden xl:flex items-center gap-1.5 text-xs text-slate-400 font-medium px-3 py-1.5 rounded-lg"
                style={{ background: 'rgba(0,0,0,0.02)', border: '1px solid rgba(0,0,0,0.04)' }}
              >
                <Clock className="h-3.5 w-3.5 text-blue-500" />
                <span className="text-slate-600 tabular-nums">{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
              </div>

              {/* Upload Dataset CTA */}
              <input ref={fileRef} type="file" className="hidden" accept=".csv,.xlsx,.xls,.json" onChange={handleFile} />
              <motion.button
                id="upload-dataset-btn"
                onClick={() => fileRef.current?.click()}
                whileHover={{ scale: 1.05, y: -1 }}
                whileTap={{ scale: 0.97 }}
                className="hidden sm:flex items-center gap-2 px-5 py-2.5 text-white rounded-full text-sm font-bold transition-all ml-2 relative overflow-hidden group"
                style={{
                  background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)',
                  boxShadow: '0 4px 16px rgba(59, 130, 246, 0.25)',
                }}
              >
                <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ background: 'linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.15) 50%, transparent 65%)' }}
                />
                <Upload className="h-4 w-4 relative z-10" />
                <span className="relative z-10">Upload Dataset</span>
              </motion.button>

              {/* Profile */}
              <div className="relative ml-1">
                <motion.button
                  onClick={() => setProfileOpen(!profileOpen)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center gap-2 p-1 pl-2 rounded-full bg-white hover:bg-slate-50 transition-colors text-slate-700"
                  style={{ border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
                >
                  <span className="text-xs font-bold pl-1">{username.charAt(0).toUpperCase()}</span>
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white"
                    style={{ background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)' }}
                  >
                    <ChevronDown className="h-3 w-3" />
                  </div>
                </motion.button>
                <AnimatePresence>
                  {profileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.95 }}
                      transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                      className="absolute right-0 top-full mt-2 w-48 bg-white rounded-2xl overflow-hidden z-50"
                      style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.12), 0 4px 12px rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.06)' }}
                    >
                      <div className="px-4 py-3 border-b border-slate-100" style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.03), rgba(139,92,246,0.03))' }}>
                        <p className="text-sm font-bold text-slate-800">{username}</p>
                        <p className="text-[10px] text-slate-400 font-medium uppercase mt-0.5">Enterprise Admin</p>
                      </div>
                      <button onClick={handleLogout} className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-red-500 hover:bg-red-50 transition-colors font-semibold group">
                        <LogOut className="h-4 w-4" />
                        Sign Out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Mobile Menu Toggle */}
              <button
                className="lg:hidden flex items-center justify-center w-9 h-9 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
                onClick={() => setMobileOpen(!mobileOpen)}
              >
                {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile drawer */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden bg-white border-t border-slate-100"
              style={{ boxShadow: '0 8px 24px rgba(0,0,0,0.06)' }}
            >
              <nav className="flex flex-col p-4 gap-2">
                {NAV_ITEMS.map(item => {
                  const isActive = activeTab === item.label;
                  return (
                    <motion.button
                      key={item.label}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => { onTabChange(item.label); setMobileOpen(false); }}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors"
                      style={{
                        background: isActive ? item.bgColor : 'transparent',
                        color: isActive ? item.color : '#475569',
                      }}
                    >
                      <item.icon className="h-5 w-5" style={{ color: isActive ? item.color : undefined }} />
                      {item.label}
                    </motion.button>
                  );
                })}
                <button
                  onClick={() => { fileRef.current?.click(); setMobileOpen(false); }}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-white mt-2"
                  style={{ background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)' }}
                >
                  <Upload className="h-5 w-5" />
                  Upload Dataset
                </button>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Click-outside handler for profile dropdown */}
      {profileOpen && (
        <div className="fixed inset-0 z-[99]" onClick={() => setProfileOpen(false)} />
      )}
    </>
  );
}
