// ============================================================================
// PowerBIEmbed — Core embed component using Power BI JavaScript SDK
// Supports: SDK mode (interactive), iframe fallback, auto token refresh
// ============================================================================
import { useRef, useEffect, useState, useCallback, useMemo, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Maximize2, Minimize2, RefreshCw, ExternalLink, Filter,
  Wifi, WifiOff, Clock, CheckCircle2, Settings2
} from 'lucide-react';
import {
  isConfigured, buildEmbedUrl, buildServiceUrl,
  type PowerBIReportConfig
} from './PowerBIConfig';
import { acquireEmbedToken, getTokenStatus, triggerDatasetRefresh, clearTokenCache } from './PowerBITokenService';
import { PowerBILoadingSkeleton, PowerBIErrorFallback, PowerBIConfigWizard } from './PowerBIFallback';

interface Props {
  report: PowerBIReportConfig;
  filters?: Record<string, string>;
  height?: string;
  showToolbar?: boolean;
  onReportLoaded?: () => void;
  onError?: (error: string) => void;
}

// Embed mode: 'sdk' uses Power BI JS SDK, 'iframe' uses direct iframe embed
type EmbedMode = 'sdk' | 'iframe';

const PowerBIEmbed = memo(function PowerBIEmbed({
  report,
  filters,
  height = '600px',
  showToolbar = true,
  onReportLoaded,
  onError,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const reportInstanceRef = useRef<any>(null);

  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [error, setError] = useState<string>('');
  const [isRetrying, setIsRetrying] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [embedMode, setEmbedMode] = useState<EmbedMode>('iframe');
  const [showFilters, setShowFilters] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const configured = isConfigured();
  const tokenStatus = getTokenStatus();

  // Build embed URL with current filters
  const embedUrl = useMemo(() => {
    if (!report.reportId || !report.groupId) return '';
    return buildEmbedUrl(report.reportId, report.groupId, filters);
  }, [report.reportId, report.groupId, filters]);

  const serviceUrl = useMemo(() => {
    if (!report.reportId || !report.groupId) return '';
    return buildServiceUrl(report.reportId, report.groupId);
  }, [report.reportId, report.groupId]);

  // SDK-based embedding
  const embedWithSDK = useCallback(async () => {
    if (!containerRef.current || !report.reportId || !report.groupId) return;

    try {
      setStatus('loading');

      // Dynamically import powerbi-client
      const pbi = await import('powerbi-client');
      const models = pbi.models;

      // Acquire embed token
      const tokenConfig = await acquireEmbedToken(
        report.reportId,
        report.groupId,
        report.datasetId
      );

      const config: any = {
        type: 'report',
        id: report.reportId,
        embedUrl: tokenConfig.embedUrl || embedUrl,
        accessToken: tokenConfig.accessToken,
        tokenType: tokenConfig.tokenType === 'Aad' ? models.TokenType.Aad : models.TokenType.Embed,
        permissions: models.Permissions.Read,
        settings: {
          panes: {
            filters: { expanded: showFilters, visible: true },
            pageNavigation: { visible: true },
          },
          bars: { statusBar: { visible: true } },
          background: models.BackgroundType.Transparent,
          navContentPaneEnabled: true,
          filterPaneEnabled: true,
        },
      };

      // Apply dashboard filters to report
      if (filters && Object.keys(filters).length > 0) {
        const reportFilters: any[] = [];
        Object.entries(filters).forEach(([key, value]) => {
          if (value && value !== '__all__' && !key.startsWith('__')) {
            reportFilters.push({
              $schema: 'http://powerbi.com/product/schema#basic',
              target: { table: 'Dataset', column: key },
              operator: 'In',
              values: [value],
              filterType: models.FilterType.Basic,
            });
          }
        });
        if (reportFilters.length > 0) {
          config.filters = reportFilters;
        }
      }

      // Embed the report
      const powerbiService = new pbi.service.Service(
        pbi.factories.hpmFactory,
        pbi.factories.wpmpFactory,
        pbi.factories.routerFactory
      );

      const reportInstance = powerbiService.embed(containerRef.current, config);
      reportInstanceRef.current = reportInstance;

      // Event handlers
      reportInstance.on('loaded', () => {
        setStatus('ready');
        setLastRefresh(new Date());
        setRetryCount(0);
        onReportLoaded?.();
        console.log('[PowerBI SDK] Report loaded successfully');
      });

      reportInstance.on('error', (event: any) => {
        const errorMsg = event?.detail?.message || 'Unknown Power BI error';
        console.error('[PowerBI SDK] Error:', errorMsg);
        setError(errorMsg);
        setStatus('error');
        onError?.(errorMsg);
      });

      reportInstance.on('rendered', () => {
        console.log('[PowerBI SDK] Report rendered');
      });

    } catch (err) {
      const errorMsg = (err as Error).message || 'Failed to embed report';
      console.error('[PowerBI SDK] Embed failed:', errorMsg);

      // Fallback to iframe mode on SDK failure
      if (embedMode === 'sdk') {
        console.log('[PowerBI] Falling back to iframe mode...');
        setEmbedMode('iframe');
        return;
      }

      setError(errorMsg);
      setStatus('error');
      onError?.(errorMsg);
    }
  }, [report, embedUrl, filters, showFilters, onReportLoaded, onError, embedMode]);

  // iframe-based embedding (simpler, more reliable fallback)
  const embedWithIframe = useCallback(() => {
    if (!embedUrl) {
      setError('No embed URL available. Check report configuration.');
      setStatus('error');
      return;
    }

    setStatus('loading');

    // The iframe will handle loading via onLoad/onError
    // Set a timeout in case iframe doesn't trigger events
    const loadTimeout = setTimeout(() => {
      setStatus((prevStatus) => {
        if (prevStatus === 'loading') {
          setLastRefresh(new Date());
          onReportLoaded?.();
          return 'ready';
        }
        return prevStatus;
      });
    }, 5000);

    // Return the timeout ID so we can clear it if needed
    return loadTimeout;
  }, [embedUrl, onReportLoaded]);

  // Initialize embed
  useEffect(() => {
    if (!configured) return;

    let iframeTimeout: NodeJS.Timeout | number | undefined;

    if (embedMode === 'sdk') {
      embedWithSDK();
    } else {
      iframeTimeout = embedWithIframe();
    }

    return () => {
      if (iframeTimeout) clearTimeout(iframeTimeout);
      // Cleanup SDK instance
      if (reportInstanceRef.current) {
        try {
          reportInstanceRef.current.off('loaded');
          reportInstanceRef.current.off('error');
          reportInstanceRef.current.off('rendered');
        } catch {}
      }
    };
  }, [configured, embedMode, embedWithSDK, embedWithIframe]);

  // Handle retry
  const handleRetry = useCallback(async () => {
    setIsRetrying(true);
    setRetryCount(prev => prev + 1);
    clearTokenCache();
    setError('');

    // Small delay for UX
    await new Promise(r => setTimeout(r, 800));

    if (embedMode === 'sdk') {
      await embedWithSDK();
    } else {
      embedWithIframe();
    }

    setIsRetrying(false);
  }, [embedMode, embedWithSDK, embedWithIframe]);

  // Handle dataset refresh
  const handleRefresh = useCallback(async () => {
    if (!report.datasetId || !report.groupId) return;
    setIsRefreshing(true);

    const result = await triggerDatasetRefresh(report.groupId, report.datasetId);

    if (result.success) {
      setLastRefresh(new Date());
      // Reload the report after data refresh
      if (reportInstanceRef.current) {
        try { await reportInstanceRef.current.refresh(); } catch {}
      }
    }

    setIsRefreshing(false);
  }, [report]);

  // Handle fullscreen toggle
  const toggleFullscreen = useCallback(() => {
    const container = containerRef.current || iframeRef.current?.parentElement;
    if (!container) return;

    if (!isFullscreen) {
      container.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
    setIsFullscreen(!isFullscreen);
  }, [isFullscreen]);

  // Listen for fullscreen changes
  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  // ── Not configured → show setup wizard ──
  if (!configured) {
    return <PowerBIConfigWizard />;
  }

  // ── Error state → show fallback ──
  if (status === 'error' && !isRetrying) {
    return (
      <PowerBIErrorFallback
        error={error}
        onRetry={handleRetry}
        isRetrying={isRetrying}
        reportId={report.reportId}
        groupId={report.groupId}
      />
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Toolbar */}
      {showToolbar && (
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            {/* Status badge */}
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold border ${
              status === 'ready'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : status === 'loading'
                ? 'bg-blue-50 text-blue-700 border-blue-200'
                : 'bg-red-50 text-red-700 border-red-200'
            }`}>
              {status === 'ready' ? (
                <><Wifi className="w-3 h-3" /> Connected</>
              ) : status === 'loading' ? (
                <><RefreshCw className="w-3 h-3 animate-spin" /> Loading...</>
              ) : (
                <><WifiOff className="w-3 h-3" /> Disconnected</>
              )}
            </div>

            {/* Last refresh time */}
            {lastRefresh && (
              <div className="flex items-center gap-1 px-2 py-1 text-[10px] text-slate-400 font-mono">
                <Clock className="w-3 h-3" />
                {lastRefresh.toLocaleTimeString()}
              </div>
            )}

            {/* Embed mode indicator */}
            <div className="px-2 py-1 text-[10px] text-slate-400 font-mono bg-slate-50 rounded">
              {embedMode.toUpperCase()}
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Toggle filters */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2 rounded-lg text-xs transition-colors ${
                showFilters ? 'bg-blue-50 text-blue-600 border border-blue-200' : 'bg-white text-slate-500 border border-slate-200 hover:bg-blue-50'
              }`}
              title="Toggle filters"
            >
              <Filter className="w-4 h-4" />
            </button>

            {/* Refresh data */}
            {report.datasetId && (
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="p-2 rounded-lg bg-white text-slate-500 border border-slate-200 hover:bg-blue-50 hover:text-blue-600 transition-colors disabled:opacity-50"
                title="Refresh dataset"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              </button>
            )}

            {/* Switch embed mode */}
            <button
              onClick={() => {
                setEmbedMode(embedMode === 'sdk' ? 'iframe' : 'sdk');
                handleRetry();
              }}
              className="p-2 rounded-lg bg-white text-slate-500 border border-slate-200 hover:bg-violet-50 hover:text-violet-600 transition-colors"
              title={`Switch to ${embedMode === 'sdk' ? 'iframe' : 'SDK'} mode`}
            >
              <Settings2 className="w-4 h-4" />
            </button>

            {/* Open in Power BI */}
            {serviceUrl && (
              <a
                href={serviceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-white text-slate-500 border border-slate-200 hover:bg-emerald-50 hover:text-emerald-600 transition-colors"
                title="Open in Power BI Service"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            )}

            {/* Fullscreen */}
            <button
              onClick={toggleFullscreen}
              className="p-2 rounded-lg bg-white text-slate-500 border border-slate-200 hover:bg-blue-50 hover:text-blue-600 transition-colors"
              title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>
      )}

      {/* Embed Container */}
      <div
        ref={containerRef}
        className="relative w-full rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-sm"
        style={{ height, minHeight: '400px' }}
      >
        {/* Loading overlay */}
        <AnimatePresence>
          {status === 'loading' && (
            <motion.div
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-10"
            >
              <PowerBILoadingSkeleton />
            </motion.div>
          )}
        </AnimatePresence>

        {/* iframe embed mode */}
        {embedMode === 'iframe' && embedUrl && (
          <iframe
            ref={iframeRef}
            title={report.name}
            src={embedUrl}
            frameBorder="0"
            allowFullScreen
            className="w-full h-full border-0"
            style={{ minHeight: '400px' }}
            onLoad={() => {
              setStatus('ready');
              setLastRefresh(new Date());
              setRetryCount(0);
              onReportLoaded?.();
            }}
            onError={() => {
              setError('iframe failed to load the Power BI report');
              setStatus('error');
            }}
          />
        )}
      </div>

      {/* Refresh schedule indicator */}
      {report.refreshSchedule && status === 'ready' && (
        <div className="flex items-center justify-end gap-1.5 text-[10px] text-slate-400">
          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
          Auto-refresh: {report.refreshSchedule === 'realtime' ? 'Real-time' : `Every ${report.refreshSchedule}`}
        </div>
      )}
    </div>
  );
});

export default PowerBIEmbed;
