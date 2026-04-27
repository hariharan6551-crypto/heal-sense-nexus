// ============================================================================
// PowerBIReportPanel — Full Reports & Power BI panel for the Dashboard
// Replaces the mock Reports tab with real Power BI integration
// ============================================================================
import { useState, useMemo, memo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart3, FileText, ExternalLink, RefreshCw, Activity,
  CheckCircle2, Zap, Download, Shield, Database as DatabaseIcon,
  ChevronRight, Sparkles, Globe, Layers
} from 'lucide-react';
import GlassCard from '@/components/core/GlassCard';
import PowerBIEmbed from './PowerBIEmbed';
import { POWERBI_REPORTS, isConfigured, buildServiceUrl, getConfigStatus, type PowerBIReportConfig } from './PowerBIConfig';
import { getTokenStatus, triggerDatasetRefresh } from './PowerBITokenService';
import { PowerBIConfigWizard } from './PowerBIFallback';
import type { DatasetInfo } from '@/lib/parseData';

interface Props {
  dataset: DatasetInfo;
  filters: Record<string, string>;
  onExportCSV: () => void;
}

// Report selector card
const ReportCard = memo(function ReportCard({
  report,
  isActive,
  onClick,
}: {
  report: PowerBIReportConfig;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 ${
        isActive
          ? 'border-blue-400 bg-blue-50/80 shadow-md shadow-blue-100'
          : 'border-slate-200/60 bg-white/70 hover:border-blue-200 hover:bg-blue-50/30'
      }`}
    >
      <div className="flex items-start gap-3">
        <span className="text-2xl">{report.icon || '📊'}</span>
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-bold truncate ${isActive ? 'text-blue-700' : 'text-slate-700'}`}>
            {report.name}
          </p>
          {report.description && (
            <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">{report.description}</p>
          )}
          <div className="flex items-center gap-2 mt-2">
            {report.refreshSchedule && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded text-[9px] font-bold">
                <RefreshCw className="w-2.5 h-2.5" />
                {report.refreshSchedule === 'realtime' ? 'Live' : report.refreshSchedule}
              </span>
            )}
            {report.reportId ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-600 border border-blue-200 rounded text-[9px] font-bold">
                <CheckCircle2 className="w-2.5 h-2.5" /> Configured
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-50 text-slate-400 border border-slate-200 rounded text-[9px] font-bold">
                Not configured
              </span>
            )}
          </div>
        </div>
        <ChevronRight className={`w-4 h-4 mt-1 flex-shrink-0 transition-colors ${isActive ? 'text-blue-400' : 'text-slate-300'}`} />
      </div>
    </motion.button>
  );
});

// Integration status panel
function IntegrationStatus() {
  const tokenStatus = getTokenStatus();
  const configStatus = getConfigStatus();

  const items = [
    {
      label: 'Azure AD Authentication',
      status: configStatus.configured,
      detail: configStatus.configured ? 'Token handshake active' : `Missing: ${configStatus.missing.join(', ')}`,
      icon: Shield,
      color: configStatus.configured ? '#10B981' : '#EF4444',
    },
    {
      label: 'Embed Token',
      status: tokenStatus.hasToken,
      detail: tokenStatus.hasToken ? `Expires in ${tokenStatus.expiresIn}` : 'Not acquired',
      icon: Zap,
      color: tokenStatus.hasToken ? '#10B981' : '#F59E0B',
    },
    {
      label: 'Power BI Service',
      status: navigator.onLine,
      detail: navigator.onLine ? 'Connected to Power BI cloud' : 'Offline',
      icon: Globe,
      color: navigator.onLine ? '#10B981' : '#EF4444',
    },
    {
      label: 'SDK Mode',
      status: true,
      detail: 'iframe + SDK dual-mode ready',
      icon: Layers,
      color: '#3B82F6',
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-3 p-3 rounded-xl bg-white/60 border border-white/80">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: `${item.color}12` }}>
            <item.icon className="w-4 h-4" style={{ color: item.color }} />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-bold text-slate-700 truncate">{item.label}</p>
            <p className="text-[10px] text-slate-400 truncate">{item.detail}</p>
          </div>
          <div className="ml-auto flex-shrink-0">
            <span className={`w-2.5 h-2.5 rounded-full block ${item.status ? 'bg-emerald-400' : 'bg-red-400'}`}
              style={{ boxShadow: item.status ? '0 0 6px rgba(16,185,129,0.5)' : '0 0 6px rgba(239,68,68,0.5)' }} />
          </div>
        </div>
      ))}
    </div>
  );
}

// Main export
export default function PowerBIReportPanel({ dataset, filters, onExportCSV }: Props) {
  const [activeReport, setActiveReport] = useState<string>(POWERBI_REPORTS[0]?.id || 'main-dashboard');
  const [showStatus, setShowStatus] = useState(false);

  const configured = isConfigured();

  const selectedReport = useMemo(() =>
    POWERBI_REPORTS.find(r => r.id === activeReport) || POWERBI_REPORTS[0],
    [activeReport]
  );

  const handleReportLoaded = useCallback(() => {
    console.log(`[PowerBI] Report "${selectedReport?.name}" loaded successfully`);
  }, [selectedReport]);

  const handleReportError = useCallback((error: string) => {
    console.error(`[PowerBI] Report "${selectedReport?.name}" error:`, error);
  }, [selectedReport]);

  return (
    <div className="space-y-4 page-transition">
      {/* Header */}
      <GlassCard className="p-5">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#F2C811] to-[#E8A008] flex items-center justify-center shadow-md relative overflow-hidden">
              <div className="absolute inset-0 bg-white/10 animate-pulse" />
              <span className="text-lg font-black text-white relative z-10">BI</span>
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-800 tracking-tight flex items-center gap-2">
                Power BI Enterprise Integration
                <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-50 text-blue-600 border border-blue-200 rounded-full">
                  {configured ? 'LIVE' : 'SETUP'}
                </span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Embedded reports with real-time data synchronization
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Integration status toggle */}
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setShowStatus(!showStatus)}
              className={`flex items-center gap-2 px-4 py-2 text-[11px] font-bold rounded-xl transition-all ${
                showStatus
                  ? 'bg-violet-50 text-violet-600 border border-violet-200'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-violet-50'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              Status
            </motion.button>

            {/* Export CSV */}
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={onExportCSV}
              className="flex items-center gap-2 px-5 py-2.5 text-white text-[11px] font-bold uppercase tracking-wider rounded-xl shadow-md hover:shadow-lg transition-all"
              style={{
                background: 'linear-gradient(135deg, #3B82F6, #6366F1)',
                boxShadow: '0 4px 15px rgba(59,130,246,0.3)',
              }}
            >
              <Download className="w-3.5 h-3.5" />
              Export Secure CSV
            </motion.button>
          </div>
        </div>

        {/* Integration Status Panel */}
        <AnimatePresence>
          {showStatus && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <div className="mt-4 pt-4 border-t border-slate-100">
                <IntegrationStatus />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </GlassCard>

      {/* Main Content: Report Selector + Embed */}
      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-4">
        {/* Report Selector Sidebar */}
        <div className="space-y-3">
          <GlassCard className="p-4">
            <h3 className="text-xs font-black text-slate-600 uppercase tracking-widest mb-3 flex items-center gap-2">
              <BarChart3 className="w-3.5 h-3.5 text-blue-500" />
              Available Reports
            </h3>
            <div className="space-y-2">
              {POWERBI_REPORTS.map(report => (
                <ReportCard
                  key={report.id}
                  report={report}
                  isActive={activeReport === report.id}
                  onClick={() => setActiveReport(report.id)}
                />
              ))}
            </div>
          </GlassCard>

          {/* Quick Actions */}
          <GlassCard className="p-4">
            <h3 className="text-xs font-black text-slate-600 uppercase tracking-widest mb-3 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-violet-500" />
              Quick Actions
            </h3>
            <div className="space-y-2">
              {selectedReport?.reportId && selectedReport?.groupId && (
                <a
                  href={buildServiceUrl(selectedReport.reportId, selectedReport.groupId)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-2.5 text-[11px] font-bold text-slate-600 bg-white/70 border border-slate-200 rounded-xl hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-all w-full"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Open in Power BI Service
                </a>
              )}
              <button
                onClick={onExportCSV}
                className="flex items-center gap-2 px-3 py-2.5 text-[11px] font-bold text-slate-600 bg-white/70 border border-slate-200 rounded-xl hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 transition-all w-full"
              >
                <FileText className="w-3.5 h-3.5" />
                Generate Summary Report
              </button>
            </div>
          </GlassCard>
        </div>

        {/* Power BI Embed Area */}
        <GlassCard className="p-4 lg:p-5">
          {configured && selectedReport ? (
            <PowerBIEmbed
              report={selectedReport}
              filters={filters}
              height="650px"
              showToolbar={true}
              onReportLoaded={handleReportLoaded}
              onError={handleReportError}
            />
          ) : (
            <PowerBIConfigWizard />
          )}
        </GlassCard>
      </div>

      {/* Internal Summary Report — kept from original for non-Power BI data */}
      <GlassCard className="p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-black text-slate-800 tracking-tight flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-500" />
            Internal Dataset Summary
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs text-slate-600 font-mono">
          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-white/80">
            <p className="font-bold text-blue-700 mb-4 tracking-wide uppercase flex items-center gap-2">
              <DatabaseIcon className="w-3.5 h-3.5" /> Dataset Summary
            </p>
            <div className="space-y-2">
              <p className="flex justify-between border-b border-slate-200/50 pb-2">
                <span className="text-slate-500">File:</span>
                <span className="text-slate-800 font-bold">{dataset.fileName}</span>
              </p>
              <p className="flex justify-between border-b border-slate-200/50 pb-2">
                <span className="text-slate-500">Rows:</span>
                <span className="text-slate-800 font-bold">{dataset.totalRows.toLocaleString()}</span>
              </p>
              <p className="flex justify-between border-b border-slate-200/50 pb-2">
                <span className="text-slate-500">Columns:</span>
                <span className="text-slate-800 font-bold">{dataset.totalColumns}</span>
              </p>
              <p className="flex justify-between border-b border-slate-200/50 pb-2">
                <span className="text-slate-500">Missing:</span>
                <span className="text-slate-800 font-bold">{dataset.missingValueCount.toLocaleString()}</span>
              </p>
            </div>
          </div>
          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-white/80">
            <p className="font-bold text-violet-700 mb-4 tracking-wide uppercase flex items-center gap-2">
              <Layers className="w-3.5 h-3.5" /> Column Matrix
            </p>
            <div className="space-y-2">
              <p className="flex flex-col gap-1 border-b border-slate-200/50 pb-2">
                <span className="text-slate-500">Numeric:</span>
                <span className="text-slate-800 font-bold max-w-full truncate">{dataset.numericColumns.join(', ') || 'None'}</span>
              </p>
              <p className="flex flex-col gap-1 border-b border-slate-200/50 pb-2">
                <span className="text-slate-500">Categorical:</span>
                <span className="text-slate-800 font-bold max-w-full truncate">{dataset.categoricalColumns.join(', ') || 'None'}</span>
              </p>
              <p className="flex flex-col gap-1 pb-1">
                <span className="text-slate-500">Datetime:</span>
                <span className="text-slate-800 font-bold max-w-full truncate">{dataset.datetimeColumns.join(', ') || 'None'}</span>
              </p>
            </div>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
