import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, Moon, Sun, Shield, List, X, Activity, Server } from 'lucide-react';
import GlassCard from '@/components/core/GlassCard';

export default function AdminControlView() {
  const [activeTab, setActiveTab] = useState<'settings' | 'logs'>('settings');

  return (
    <div className="w-full max-w-5xl mx-auto mt-6">
      <GlassCard glowColor="cyan" className="flex flex-col h-[70vh] overflow-hidden bg-white/40 border border-white/60 shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/50 bg-white/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-500 flex items-center justify-center shadow-lg shadow-cyan-500/30">
              <Settings className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-black text-[var(--text-primary)] tracking-tight">Admin Control Center</h2>
              <p className="text-[10px] uppercase font-bold tracking-widest text-cyan-600">Enterprise Settings & Logs</p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <div className="w-64 border-r border-white/50 bg-white/20 p-4 space-y-2">
            <button
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                activeTab === 'settings' 
                  ? 'bg-white shadow-sm text-cyan-600' 
                  : 'text-slate-600 hover:bg-white/50'
              }`}
            >
              <Settings className="w-4 h-4" />
              Dashboard Settings
            </button>
            <button
              onClick={() => setActiveTab('logs')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                activeTab === 'logs' 
                  ? 'bg-white shadow-sm text-cyan-600' 
                  : 'text-slate-600 hover:bg-white/50'
              }`}
            >
              <List className="w-4 h-4" />
              Access Logs
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 p-6 overflow-y-auto bg-transparent">
            <AnimatePresence mode="wait">
              {activeTab === 'settings' ? (
                <motion.div
                  key="settings"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div>
                    <h3 className="text-sm font-black text-slate-800 mb-4 uppercase tracking-wider flex items-center gap-2">
                      <Shield className="w-4 h-4 text-violet-500" /> Role-Based Access Control
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-2xl bg-white border-2 border-cyan-500 shadow-md flex items-center justify-between">
                        <span className="font-bold text-slate-800">Admin Level Access</span>
                        <div className="px-3 py-1 bg-cyan-100 text-cyan-700 rounded-full text-xs font-bold">Active</div>
                      </div>
                      <div className="p-4 rounded-2xl bg-white/50 border border-white/80 opacity-60 flex items-center justify-between">
                        <span className="font-bold text-slate-800">Doctor / Analyst</span>
                        <div className="px-3 py-1 bg-slate-200 text-slate-500 rounded-full text-xs font-bold">Manage</div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-black text-slate-800 mb-4 uppercase tracking-wider flex items-center gap-2">
                      <Sun className="w-4 h-4 text-amber-500" /> Theme Preference
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-2xl bg-white border-2 border-cyan-500 shadow-md cursor-pointer flex items-center justify-between">
                        <span className="font-bold text-slate-800">Light Mode (System)</span>
                        <div className="w-4 h-4 rounded-full bg-cyan-500" />
                      </div>
                      <div className="p-4 rounded-2xl bg-white/50 border border-white/80 cursor-not-allowed opacity-50 flex items-center justify-between">
                        <span className="font-bold text-slate-800">Dark Matter (Disabled)</span>
                        <Moon className="w-4 h-4 text-slate-500" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-black text-slate-800 mb-4 uppercase tracking-wider flex items-center gap-2">
                      <Activity className="w-4 h-4 text-pink-500" /> Performance Settings
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-4 rounded-xl bg-white/60">
                        <div>
                          <p className="font-bold text-slate-800">Hardware Acceleration</p>
                          <p className="text-xs text-slate-500 font-medium">Use GPU for animations & particles</p>
                        </div>
                        <div className="w-12 h-6 rounded-full bg-cyan-500 relative cursor-pointer">
                          <div className="absolute top-1 left-7 w-4 h-4 bg-white rounded-full shadow-sm" />
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-4 rounded-xl bg-white/60">
                        <div>
                          <p className="font-bold text-slate-800">Live Data Streaming</p>
                          <p className="text-xs text-slate-500 font-medium">Auto-refresh metrics</p>
                        </div>
                        <div className="w-12 h-6 rounded-full bg-cyan-500 relative cursor-pointer">
                          <div className="absolute top-1 left-7 w-4 h-4 bg-white rounded-full shadow-sm" />
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="logs"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <h3 className="text-sm font-black text-slate-800 mb-4 uppercase tracking-wider flex items-center gap-2">
                    <Server className="w-4 h-4 text-emerald-500" /> Recent System Access
                  </h3>
                  <div className="space-y-2">
                    {[
                      { ip: '192.168.1.104', action: 'Admin Login', status: 'success', time: 'Just now' },
                      { ip: '10.0.0.45', action: 'Power BI Configured', status: 'info', time: '5 mins ago' },
                      { ip: '172.16.0.12', action: 'Failed Auth Attempt', status: 'error', time: '1 hr ago' },
                      { ip: '192.168.1.104', action: 'Dataset Updated', status: 'info', time: '2 hrs ago' },
                      { ip: 'System', action: 'RBAC Policy Update', status: 'success', time: '1 day ago' },
                    ].map((log, i) => (
                      <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/60 border border-white">
                        <div className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full ${
                            log.status === 'success' ? 'bg-emerald-500' :
                            log.status === 'error' ? 'bg-pink-500' : 'bg-cyan-500'
                          }`} />
                          <div>
                            <p className="font-bold text-xs text-slate-800">{log.action}</p>
                            <p className="text-[10px] text-slate-500 font-medium font-mono">{log.ip}</p>
                          </div>
                        </div>
                        <span className="text-xs font-bold text-slate-400">{log.time}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
