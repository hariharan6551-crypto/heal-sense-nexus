// ============================================================================
// APIIntegrationPanel — API Integration Dashboard
// ENTERPRISE ADD-ON MODULE: Non-destructive overlay panel
// ============================================================================
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNexusStore } from '@/stores/nexusStore';
import {
  Plug, X, Globe, CheckCircle2, XCircle, AlertTriangle,
  RefreshCcw, Copy, Eye, EyeOff, Clock, TrendingUp,
  Activity, Server, Zap, ArrowUpRight
} from 'lucide-react';

interface APIEndpoint {
  id: string;
  name: string;
  url: string;
  status: 'healthy' | 'degraded' | 'down';
  latency: number;
  uptime: number;
  lastChecked: string;
  requests24h: number;
}

interface APIKey {
  id: string;
  name: string;
  key: string;
  created: string;
  lastUsed: string;
  status: 'active' | 'revoked';
}

const MOCK_ENDPOINTS: APIEndpoint[] = [
  { id: 'e1', name: 'Analytics Engine', url: '/api/v2/analytics', status: 'healthy', latency: 45, uptime: 99.97, lastChecked: '30s ago', requests24h: 12847 },
  { id: 'e2', name: 'AI Prediction Service', url: '/api/v2/predict', status: 'healthy', latency: 120, uptime: 99.92, lastChecked: '30s ago', requests24h: 3421 },
  { id: 'e3', name: 'Data Ingestion', url: '/api/v2/ingest', status: 'degraded', latency: 340, uptime: 98.5, lastChecked: '30s ago', requests24h: 891 },
  { id: 'e4', name: 'Export Service', url: '/api/v2/export', status: 'healthy', latency: 89, uptime: 99.99, lastChecked: '30s ago', requests24h: 234 },
  { id: 'e5', name: 'WebSocket Feed', url: 'wss://stream.nexus.ai', status: 'healthy', latency: 12, uptime: 99.95, lastChecked: '30s ago', requests24h: 45231 },
];

const MOCK_KEYS: APIKey[] = [
  { id: 'k1', name: 'Production Key', key: 'nxs_prod_a8f2c1d9e4b7...', created: 'Jan 15, 2026', lastUsed: '2 min ago', status: 'active' },
  { id: 'k2', name: 'Staging Key', key: 'nxs_stg_7d3f9a2b1c8e...', created: 'Feb 20, 2026', lastUsed: '4 hours ago', status: 'active' },
  { id: 'k3', name: 'Legacy Key (v1)', key: 'nxs_v1_deprecated...', created: 'Aug 10, 2025', lastUsed: 'Dec 31, 2025', status: 'revoked' },
];

const statusConfig: Record<string, { icon: typeof CheckCircle2; color: string; bg: string; label: string }> = {
  healthy: { icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-400', label: 'Healthy' },
  degraded: { icon: AlertTriangle, color: 'text-amber-400', bg: 'bg-amber-400', label: 'Degraded' },
  down: { icon: XCircle, color: 'text-rose-400', bg: 'bg-rose-400', label: 'Down' },
};

export default function APIIntegrationPanel() {
  const { apiPanelOpen, toggleAPIPanel } = useNexusStore();
  const [activeTab, setActiveTab] = useState<'endpoints' | 'keys'>('endpoints');
  const [showKey, setShowKey] = useState<string | null>(null);

  const healthyCount = MOCK_ENDPOINTS.filter(e => e.status === 'healthy').length;
  const avgLatency = Math.round(MOCK_ENDPOINTS.reduce((s, e) => s + e.latency, 0) / MOCK_ENDPOINTS.length);
  const totalRequests = MOCK_ENDPOINTS.reduce((s, e) => s + e.requests24h, 0);

  return (
    <AnimatePresence>
      {apiPanelOpen && (
        <motion.div
          initial={{ opacity: 0, x: 400 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 400 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="fixed right-0 top-0 bottom-0 w-[480px] z-[60] nexus-panel-glass overflow-y-auto"
        >
          <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                  <Plug className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">API Hub</h2>
                  <p className="text-xs text-slate-400">Integration & endpoint monitoring</p>
                </div>
              </div>
              <button onClick={toggleAPIPanel} className="nexus-close-btn">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Health Overview */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              <div className="nexus-metric-card text-center py-3">
                <Activity className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
                <p className="text-xl font-black text-emerald-400">{healthyCount}/{MOCK_ENDPOINTS.length}</p>
                <p className="text-[9px] text-slate-500 uppercase tracking-wider">Services Up</p>
              </div>
              <div className="nexus-metric-card text-center py-3">
                <Zap className="w-4 h-4 text-amber-400 mx-auto mb-1" />
                <p className="text-xl font-black text-amber-400">{avgLatency}ms</p>
                <p className="text-[9px] text-slate-500 uppercase tracking-wider">Avg Latency</p>
              </div>
              <div className="nexus-metric-card text-center py-3">
                <TrendingUp className="w-4 h-4 text-cyan-400 mx-auto mb-1" />
                <p className="text-xl font-black text-cyan-400">{(totalRequests / 1000).toFixed(1)}k</p>
                <p className="text-[9px] text-slate-500 uppercase tracking-wider">Requests 24h</p>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 mb-5 bg-white/5 rounded-xl p-1 border border-white/5">
              {[
                { id: 'endpoints' as const, label: 'Endpoints', icon: Server },
                { id: 'keys' as const, label: 'API Keys', icon: Zap },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all ${
                    activeTab === tab.id
                      ? 'bg-white/10 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <tab.icon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              ))}
            </div>

            {activeTab === 'endpoints' ? (
              <div className="space-y-2">
                {MOCK_ENDPOINTS.map((endpoint, i) => {
                  const statusCfg = statusConfig[endpoint.status];
                  const StatusIcon = statusCfg.icon;
                  return (
                    <motion.div
                      key={endpoint.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.06 }}
                      className="nexus-metric-card"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center`}>
                          <Globe className="w-4 h-4 text-slate-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-white">{endpoint.name}</span>
                            <StatusIcon className={`w-3.5 h-3.5 ${statusCfg.color}`} />
                          </div>
                          <span className="text-[10px] text-slate-500 font-mono">{endpoint.url}</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-4 gap-2">
                        {[
                          { label: 'Latency', value: `${endpoint.latency}ms`, color: endpoint.latency > 200 ? 'text-amber-400' : 'text-emerald-400' },
                          { label: 'Uptime', value: `${endpoint.uptime}%`, color: endpoint.uptime > 99.9 ? 'text-emerald-400' : 'text-amber-400' },
                          { label: 'Req/24h', value: endpoint.requests24h.toLocaleString(), color: 'text-cyan-400' },
                          { label: 'Checked', value: endpoint.lastChecked, color: 'text-slate-400' },
                        ].map((metric) => (
                          <div key={metric.label} className="text-center">
                            <p className={`text-xs font-bold ${metric.color}`}>{metric.value}</p>
                            <p className="text-[8px] text-slate-600 uppercase">{metric.label}</p>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-3">
                {MOCK_KEYS.map((apiKey, i) => (
                  <motion.div
                    key={apiKey.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className="nexus-metric-card"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-white">{apiKey.name}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                          apiKey.status === 'active'
                            ? 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20'
                            : 'text-slate-500 bg-slate-500/10 border-slate-500/20 line-through'
                        }`}>
                          {apiKey.status.toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 bg-white/3 rounded-lg px-3 py-2 mb-2">
                      <code className="flex-1 text-[11px] text-slate-300 font-mono">
                        {showKey === apiKey.id ? apiKey.key : '••••••••••••••••••••'}
                      </code>
                      <button onClick={() => setShowKey(showKey === apiKey.id ? null : apiKey.id)} className="nexus-icon-btn w-6 h-6">
                        {showKey === apiKey.id ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                      </button>
                      <button className="nexus-icon-btn w-6 h-6" title="Copy">
                        <Copy className="w-3 h-3" />
                      </button>
                    </div>
                    <div className="flex items-center gap-4 text-[10px] text-slate-500">
                      <span>Created: {apiKey.created}</span>
                      <span>Last used: {apiKey.lastUsed}</span>
                    </div>
                  </motion.div>
                ))}

                <button className="w-full py-2.5 rounded-xl border border-dashed border-white/10 text-xs font-semibold text-slate-400 hover:text-white hover:border-white/20 hover:bg-white/5 transition-all flex items-center justify-center gap-2">
                  <Zap className="w-3.5 h-3.5" />
                  Generate New API Key
                </button>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
