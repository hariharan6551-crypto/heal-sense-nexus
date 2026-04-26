import { useRef, useState, useEffect, memo, useCallback, startTransition } from 'react';
import {
  LayoutDashboard, Database, Bot, FileText, Settings,
  Sparkles, Upload, Clock, LogOut, ChevronDown, Menu, X, Shield
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { parseFile } from '@/lib/parseData';
import type { DatasetInfo } from '@/lib/parseData';
import { useNavigate } from 'react-router-dom';
import NavbarGlass from '@/components/layout/NavbarGlass';
import GlowButton from '@/components/core/GlowButton';

interface Props {
  onDatasetLoaded: (ds: DatasetInfo) => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
  dashboardTitle?: string;
  datasetName?: string;
}

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: 'Dashboard', color: '#3B82F6', bgColor: 'rgba(59,130,246,0.08)' },
  { icon: Shield, label: 'Risk Analysis', color: '#EF4444', bgColor: 'rgba(239,68,68,0.08)' },
  { icon: FileText, label: 'Reports', color: '#F59E0B', bgColor: 'rgba(245,158,11,0.08)' },
  { icon: Settings, label: 'Settings', color: '#64748b', bgColor: 'rgba(100,116,139,0.08)' },
];

// Isolated clock component — prevents re-rendering the entire navbar every second
const LiveClock = memo(function LiveClock() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);
  return (
    <div className="hidden xl:flex items-center gap-2 text-xs font-bold px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 shadow-sm text-slate-500">
      <Clock className="h-4 w-4 text-blue-500" />
      <span className="tabular-nums">{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
    </div>
  );
});

export default function PrimaryRibbon({ onDatasetLoaded, activeTab, onTabChange, dashboardTitle, datasetName }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  // Wrap tab changes in startTransition so the click feels instant
  const handleTabChange = useCallback((tab: string) => {
    startTransition(() => onTabChange(tab));
  }, [onTabChange]);

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
        <NavbarGlass>
          {/* Logo + Title */}
          <div className="flex items-center gap-3 min-w-0">
            <motion.div
              whileHover={{ scale: 1.05, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-blue-500 opacity-20 blur-md pointer-events-none" />
              <div 
                className="absolute inset-x-0 bottom-0 h-1/2 bg-blue-400 opacity-50 blur-lg" 
              />
              <div 
                className="absolute inset-0 border border-blue-300 rounded-xl bg-white/40 shadow-[0_0_15px_rgba(59,130,246,0.3)] z-10" 
              />
              <Sparkles className="h-5 w-5 text-blue-600 relative z-20 drop-shadow-md" />
            </motion.div>
            <div className="min-w-0">
              {/* Removed Title per user request */}
            </div>
          </div>

          {/* Desktop Nav Items — uses startTransition for instant tab switch */}
          <nav className="hidden lg:flex items-center gap-1.5 h-full ml-8" id="nav-tabs">
            {NAV_ITEMS.map(item => {
              const isActive = activeTab === item.label;
              return (
                <button
                  key={item.label}
                  id={`nav-tab-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                  onClick={() => handleTabChange(item.label)}
                  className={`relative px-5 h-[44px] flex items-center gap-2.5 rounded-xl text-sm font-bold transition-all duration-200 hover:-translate-y-[1px] active:scale-[0.97] ${isActive ? '' : 'hover:bg-slate-50'}`}
                  style={{
                    background: isActive ? item.bgColor : 'transparent',
                    color: isActive ? item.color : '#64748b',
                    boxShadow: isActive ? `0 2px 8px ${item.bgColor}` : 'none'
                  }}
                >
                  <item.icon className="h-[18px] w-[18px]" style={{ color: isActive ? item.color : undefined }} />
                  <span>{item.label}</span>
                  {isActive && (
                    <div
                      className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-8 h-[4px] rounded-full transition-all duration-300"
                      style={{ background: `linear-gradient(90deg, ${item.color}, ${item.color}80)` }}
                    />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Section */}
          <div className="flex items-center gap-4 ml-auto relative z-20">
            {/* Live Clock — isolated memo'd component */}
            <LiveClock />

            {/* Upload Dataset CTA */}
            <input
              type="file"
              accept=".csv"
              className="hidden"
              ref={fileRef}
              onChange={handleFile}
            />
            <GlowButton
              onClick={() => fileRef.current?.click()}
              className="hidden md:flex items-center gap-2 px-4 py-[10px] text-[11px] font-black uppercase tracking-wider bg-white/70 hover:bg-white text-blue-600 rounded-xl shadow-sm border border-blue-100"
              variant="secondary"
            >
              <Database className="w-4 h-4" /> Upload Dataset
            </GlowButton>

            {/* Profile */}
            <div className="relative ml-2">
              <motion.button
                onClick={() => setProfileOpen(!profileOpen)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 p-1 pl-3 rounded-full bg-white hover:bg-blue-50 transition-colors text-slate-700 shadow-sm border border-slate-200/60"
              >
                <span className="text-sm font-black text-slate-800">{username.charAt(0).toUpperCase()}</span>
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white bg-gradient-to-tr from-blue-600 to-cyan-400 shadow-[0_2px_10px_rgba(59,130,246,0.4)]">
                  <ChevronDown className="h-4 w-4" />
                </div>
              </motion.button>

              <AnimatePresence>
                {profileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.95, filter: 'blur(4px)' }}
                    animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
                    exit={{ opacity: 0, y: -8, scale: 0.95, filter: 'blur(4px)' }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 top-full mt-3 w-56 bg-white/90 backdrop-blur-xl rounded-2xl overflow-hidden z-50 shadow-[0_20px_40px_rgba(0,0,0,0.1)] border border-white/50"
                  >
                    <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50">
                      <p className="text-sm font-black text-slate-800">{username}</p>
                      <p className="text-[10px] text-blue-500 font-bold uppercase tracking-widest mt-1">Enterprise Admin</p>
                    </div>
                    <button onClick={handleLogout} className="w-full flex items-center gap-3 px-5 py-4 text-sm text-pink-600 hover:bg-pink-50 transition-colors font-bold group">
                      <LogOut className="h-4 w-4 group-hover:scale-110 transition-transform" />
                      Sign Out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Mobile Menu Toggle */}
            <button
              className="lg:hidden flex items-center justify-center w-10 h-10 rounded-xl border border-slate-200 text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </NavbarGlass>

        {/* Mobile drawer */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden bg-white/95 backdrop-blur-2xl border-t border-slate-100/50 shadow-2xl relative z-40"
            >
              <nav className="flex flex-col p-5 gap-2">
                {NAV_ITEMS.map(item => {
                  const isActive = activeTab === item.label;
                  return (
                    <motion.button
                      key={item.label}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => { handleTabChange(item.label); setMobileOpen(false); }}
                      className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-bold transition-all"
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
                <GlowButton
                  onClick={() => { fileRef.current?.click(); setMobileOpen(false); }}
                  className="w-full mt-4 flex justify-center items-center py-4 rounded-xl gap-2 font-bold"
                  variant="primary"
                >
                  <Upload className="h-5 w-5" /> Upload Dataset
                </GlowButton>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
      
      {profileOpen && (
        <div className="fixed inset-0 z-[99]" onClick={() => setProfileOpen(false)} />
      )}
    </>
  );
}
