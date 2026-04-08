// ============================================================================
// AuditLogPanel — Enterprise Audit Trail & Activity Log
// ENTERPRISE ADD-ON MODULE: Non-destructive overlay panel
// ============================================================================
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAdvancedStore } from '@/stores/advancedStore';
import {
  ClipboardList, X, FileText, Download, Filter, Search,
  User, Database, Shield, Settings, Eye, Upload, LogOut,
  ChevronDown, Clock
} from 'lucide-react';

interface AuditEntry {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  category: 'auth' | 'data' | 'system' | 'access' | 'export';
  details: string;
  severity: 'low' | 'medium' | 'high';
  ip: string;
}

const MOCK_AUDIT: AuditEntry[] = [
  { id: 'a1', timestamp: '2026-04-03T20:30:15Z', user: 'Dr. Sarah Chen', action: 'Login', category: 'auth', details: 'Successful authentication via OTP', severity: 'low', ip: '192.168.1.42' },
  { id: 'a2', timestamp: '2026-04-03T20:28:00Z', user: 'James Wilson', action: 'Dataset Upload', category: 'data', details: 'Uploaded "patient_records_q1.csv" — 2,847 rows', severity: 'medium', ip: '192.168.1.55' },
  { id: 'a3', timestamp: '2026-04-03T20:25:30Z', user: 'System', action: 'AI Model Run', category: 'system', details: 'Prediction model executed on 1,247 records — completed in 2.3s', severity: 'low', ip: '10.0.0.1' },
  { id: 'a4', timestamp: '2026-04-03T20:20:00Z', user: 'Emily Rodriguez', action: 'Permission Change', category: 'access', details: 'Role changed from "viewer" to "editor" for user m.park@advanced.ai', severity: 'high', ip: '192.168.1.87' },
  { id: 'a5', timestamp: '2026-04-03T20:15:00Z', user: 'Dr. Sarah Chen', action: 'Data Export', category: 'export', details: 'Exported filtered dataset as CSV — 423 records, 12 columns', severity: 'medium', ip: '192.168.1.42' },
  { id: 'a6', timestamp: '2026-04-03T20:10:00Z', user: 'Michael Park', action: 'Failed Login', category: 'auth', details: 'Invalid OTP — account locked after 3 attempts', severity: 'high', ip: '203.45.67.89' },
  { id: 'a7', timestamp: '2026-04-03T20:05:00Z', user: 'System', action: 'Backup Complete', category: 'system', details: 'Automated daily backup — 47.2 MB compressed', severity: 'low', ip: '10.0.0.1' },
  { id: 'a8', timestamp: '2026-04-03T20:00:00Z', user: 'Lisa Thompson', action: 'View Dashboard', category: 'access', details: 'Accessed main analytics dashboard', severity: 'low', ip: '192.168.1.103' },
  { id: 'a9', timestamp: '2026-04-03T19:50:00Z', user: 'James Wilson', action: 'Chart Configuration', category: 'data', details: 'Modified bar chart axis settings for "Revenue by Region"', severity: 'low', ip: '192.168.1.55' },
  { id: 'a10', timestamp: '2026-04-03T19:40:00Z', user: 'System', action: 'Security Scan', category: 'system', details: 'Routine vulnerability scan — 0 issues found', severity: 'low', ip: '10.0.0.1' },
];

const categoryIcons: Record<string, typeof User> = {
  auth: LogOut,
  data: Database,
  system: Settings,
  access: Shield,
  export: Download,
};

const categoryColors: Record<string, string> = {
  auth: 'from-blue-500 to-indigo-600',
  data: 'from-cyan-500 to-teal-600',
  system: 'from-slate-500 to-zinc-600',
  access: 'from-rose-500 to-pink-600',
  export: 'from-emerald-500 to-green-600',
};

const severityDot: Record<string, string> = {
  low: 'bg-emerald-400',
  medium: 'bg-amber-400',
  high: 'bg-rose-400',
};

export default function AuditLogPanel() {
  const { auditPanelOpen, toggleAuditPanel } = useAdvancedStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const filteredLogs = useMemo(() => {
    return MOCK_AUDIT.filter((entry) => {
      const matchesSearch = !searchQuery || 
        entry.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.details.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || entry.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, categoryFilter]);

  const formatTime = (ts: string) => {
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (ts: string) => {
    const d = new Date(ts);
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  return (
    <AnimatePresence>
      {auditPanelOpen && (
        <motion.div
          initial={{ opacity: 0, x: 400 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 400 }}
          className="fixed right-0 top-0 bottom-0 w-[480px] z-[60] bg-white/95 backdrop-blur-xl shadow-2xl border-l border-slate-200 overflow-y-auto"
        >
          <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                  <ClipboardList className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-800">Audit Logs</h2>
                  <p className="text-xs text-slate-500">System activity trail</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500" title="Export Logs">
                  <Download className="w-4 h-4" />
                </button>
                <button onClick={toggleAuditPanel} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                  <X className="w-4 h-4 text-slate-500" />
                </button>
              </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-4 gap-2 mb-4">
              {[
                { label: 'Total', value: MOCK_AUDIT.length, color: 'text-slate-800' },
                { label: 'Auth', value: MOCK_AUDIT.filter(a => a.category === 'auth').length, color: 'text-blue-600' },
                { label: 'Data', value: MOCK_AUDIT.filter(a => a.category === 'data').length, color: 'text-cyan-600' },
                { label: 'High Risk', value: MOCK_AUDIT.filter(a => a.severity === 'high').length, color: 'text-rose-600' },
              ].map((stat) => (
                <div key={stat.label} className="bg-slate-50 rounded-xl p-3 border border-slate-100 shadow-sm text-center">
                  <p className={`text-lg font-black font-mono ${stat.color}`}>{stat.value}</p>
                  <p className="text-[9px] text-slate-500 uppercase tracking-wider font-bold">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Search */}
            <div className="flex gap-2 mb-4">
              <div className="flex-1 flex items-center gap-2 bg-slate-50 rounded-xl px-3 py-2 border border-slate-200 focus-within:border-indigo-300 transition-colors shadow-sm">
                <Search className="w-3.5 h-3.5 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search logs..."
                  className="flex-1 bg-transparent text-xs text-slate-800 placeholder:text-slate-400 outline-none"
                />
              </div>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 outline-none cursor-pointer [&>option]:bg-white shadow-sm"
              >
                <option value="all">All</option>
                <option value="auth">Auth</option>
                <option value="data">Data</option>
                <option value="system">System</option>
                <option value="access">Access</option>
                <option value="export">Export</option>
              </select>
            </div>

            {/* Timeline */}
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-[18px] top-0 bottom-0 w-px bg-slate-200" />

              <div className="space-y-1">
                {filteredLogs.map((entry, i) => {
                  const Icon = categoryIcons[entry.category] || FileText;
                  return (
                    <motion.div
                      key={entry.id}
                      initial={{ opacity: 0, x: 16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className="relative flex gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors group"
                    >
                      {/* Timeline dot */}
                      <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${categoryColors[entry.category]} flex items-center justify-center flex-shrink-0 shadow-lg z-10`}>
                        <Icon className="w-4 h-4 text-white" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-800">{entry.action}</span>
                            <span className={`w-1.5 h-1.5 rounded-full ${severityDot[entry.severity]}`} />
                          </div>
                          <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                            <Clock className="w-3 h-3" />
                            {formatTime(entry.timestamp)}
                          </div>
                        </div>
                        <p className="text-[11px] text-slate-500 leading-relaxed mb-1">{entry.details}</p>
                        <div className="flex items-center gap-3 text-[10px] text-slate-400">
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3" /> {entry.user}
                          </span>
                          <span className="opacity-0 group-hover:opacity-100 transition-opacity">{entry.ip}</span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {filteredLogs.length === 0 && (
              <div className="py-12 text-center">
                <ClipboardList className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                <p className="text-xs text-slate-500">No matching log entries</p>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
