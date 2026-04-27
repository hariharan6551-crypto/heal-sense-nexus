// ============================================================================
// Power BI Fallback — Error handling, loading states, and config guidance
// Premium UI with retry mechanism and configuration wizard
// ============================================================================
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle, RefreshCw, ExternalLink, Settings,
  CheckCircle2, XCircle, Copy, ChevronDown, ChevronUp, Wifi, WifiOff,
  Shield, Key, Globe
} from 'lucide-react';
import { getConfigStatus, buildServiceUrl } from './PowerBIConfig';

interface FallbackProps {
  error?: string;
  onRetry: () => void;
  isRetrying?: boolean;
  reportId?: string;
  groupId?: string;
}

// Loading Skeleton
export function PowerBILoadingSkeleton() {
  return (
    <div className="w-full min-h-[500px] rounded-2xl border border-slate-200 bg-white/60 backdrop-blur-sm flex flex-col items-center justify-center gap-4 relative overflow-hidden">
      {/* Animated shimmer */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-50/50 to-transparent animate-shimmer" />
      
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center shadow-lg"
      >
        <span className="text-white font-black text-lg">BI</span>
      </motion.div>
      
      <div className="text-center">
        <p className="text-sm font-bold text-slate-700">Loading Power BI Report...</p>
        <p className="text-xs text-slate-400 mt-1">Acquiring secure embed token</p>
      </div>
      
      {/* Progress bar */}
      <div className="w-48 h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"
          initial={{ width: '0%' }}
          animate={{ width: '100%' }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>
    </div>
  );
}

// Error Fallback with retry
export function PowerBIErrorFallback({ error, onRetry, isRetrying, reportId, groupId }: FallbackProps) {
  const [showDetails, setShowDetails] = useState(false);
  const isNetworkError = error?.includes('network') || error?.includes('fetch') || error?.includes('Failed to fetch');
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full min-h-[400px] rounded-2xl border-2 border-dashed border-red-200/60 bg-gradient-to-br from-red-50/30 to-orange-50/30 backdrop-blur-sm flex flex-col items-center justify-center p-8"
    >
      <div className="w-14 h-14 rounded-2xl bg-red-100 border border-red-200 flex items-center justify-center mb-4">
        {isNetworkError ? (
          <WifiOff className="w-6 h-6 text-red-500" />
        ) : (
          <AlertTriangle className="w-6 h-6 text-red-500" />
        )}
      </div>
      
      <h3 className="text-lg font-black text-slate-800 mb-1">
        {isNetworkError ? 'Connection Failed' : 'Report Load Failed'}
      </h3>
      <p className="text-sm text-slate-500 max-w-md text-center mb-5">
        {isNetworkError 
          ? 'Unable to connect to Power BI Service. Check your network connection and try again.'
          : 'The Power BI report could not be loaded. This may be due to authentication, permissions, or configuration issues.'
        }
      </p>

      {/* Action Buttons */}
      <div className="flex items-center gap-3 mb-5">
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={onRetry}
          disabled={isRetrying}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-bold rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isRetrying ? 'animate-spin' : ''}`} />
          {isRetrying ? 'Retrying...' : 'Retry'}
        </motion.button>

        {reportId && groupId && (
          <a
            href={buildServiceUrl(reportId, groupId)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-5 py-2.5 bg-white text-slate-700 text-sm font-bold rounded-xl border border-slate-200 hover:bg-blue-50 hover:border-blue-200 transition-all"
          >
            <ExternalLink className="w-4 h-4" />
            Open in Power BI
          </a>
        )}
      </div>

      {/* Expandable error details */}
      <button
        onClick={() => setShowDetails(!showDetails)}
        className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-600 transition-colors"
      >
        {showDetails ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        {showDetails ? 'Hide details' : 'Show error details'}
      </button>
      
      <AnimatePresence>
        {showDetails && error && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mt-3 w-full max-w-lg overflow-hidden"
          >
            <div className="bg-slate-900 text-red-300 rounded-xl p-4 text-xs font-mono leading-relaxed relative">
              <button
                onClick={() => navigator.clipboard.writeText(error)}
                className="absolute top-2 right-2 p-1 hover:bg-white/10 rounded"
                title="Copy error"
              >
                <Copy className="w-3 h-3 text-slate-500" />
              </button>
              {error}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// Configuration Wizard — shown when Power BI is not configured
export function PowerBIConfigWizard() {
  const { missing } = getConfigStatus();
  const [expandedStep, setExpandedStep] = useState<number>(0);
  
  const steps = [
    {
      title: 'Register Azure AD Application',
      icon: Shield,
      color: '#3B82F6',
      content: (
        <div className="space-y-2 text-xs text-slate-600 font-mono leading-relaxed">
          <p>1. Go to <a href="https://portal.azure.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Azure Portal</a> → Azure Active Directory → App Registrations</p>
          <p>2. Click <strong>"New registration"</strong></p>
          <p>3. Name: <code className="bg-slate-100 px-1.5 py-0.5 rounded text-violet-700">HealSenseNexus-PowerBI</code></p>
          <p>4. Redirect URI: <code className="bg-slate-100 px-1.5 py-0.5 rounded text-violet-700">https://your-domain.com</code></p>
          <p>5. Copy the <strong>Application (client) ID</strong> and <strong>Directory (tenant) ID</strong></p>
          <p>6. Under "API Permissions" → Add → Power BI Service → Delegated:</p>
          <ul className="list-disc list-inside ml-4 space-y-1">
            <li>Report.Read.All</li>
            <li>Dataset.Read.All</li>
            <li>Workspace.Read.All</li>
          </ul>
        </div>
      ),
    },
    {
      title: 'Create Client Secret',
      icon: Key,
      color: '#F59E0B',
      content: (
        <div className="space-y-2 text-xs text-slate-600 font-mono leading-relaxed">
          <p>1. In your App Registration → <strong>Certificates & secrets</strong></p>
          <p>2. Click <strong>"New client secret"</strong></p>
          <p>3. Set description: <code className="bg-slate-100 px-1.5 py-0.5 rounded text-violet-700">healsense-pbi-secret</code></p>
          <p>4. Set expiration (recommended: 12 months)</p>
          <p>5. Copy the <strong>Secret Value</strong> immediately (shown only once)</p>
          <p>6. Add to backend env: <code className="bg-slate-100 px-1.5 py-0.5 rounded text-violet-700">POWERBI_CLIENT_SECRET=your-secret</code></p>
        </div>
      ),
    },
    {
      title: 'Configure Environment Variables',
      icon: Globe,
      color: '#10B981',
      content: (
        <div className="space-y-2 text-xs text-slate-600 font-mono leading-relaxed">
          <p>Add these to your <code className="bg-slate-100 px-1.5 py-0.5 rounded text-violet-700">.env.local</code> file:</p>
          <div className="bg-slate-900 text-green-300 rounded-lg p-3 mt-2 space-y-1">
            <p>VITE_POWERBI_CLIENT_ID=your-app-client-id</p>
            <p>VITE_POWERBI_TENANT_ID=your-directory-tenant-id</p>
            <p>VITE_POWERBI_GROUP_ID=your-workspace-id</p>
            <p>VITE_POWERBI_REPORT_ID=your-report-id</p>
            <p>VITE_POWERBI_DATASET_ID=your-dataset-id</p>
            <p># Backend only (not VITE_ prefixed):</p>
            <p>POWERBI_CLIENT_SECRET=your-client-secret</p>
          </div>
          {missing.length > 0 && (
            <div className="mt-3">
              <p className="text-red-500 font-bold mb-1">Currently missing:</p>
              {missing.map(m => (
                <span key={m} className="inline-flex items-center gap-1 mr-2 mb-1 px-2 py-0.5 bg-red-50 text-red-600 rounded text-[10px] font-bold border border-red-200">
                  <XCircle className="w-3 h-3" /> {m}
                </span>
              ))}
            </div>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="w-full rounded-2xl border-2 border-dashed border-amber-200/60 bg-gradient-to-br from-amber-50/30 to-yellow-50/30 backdrop-blur-sm p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center">
          <Settings className="w-5 h-5 text-amber-600" />
        </div>
        <div>
          <h3 className="text-lg font-black text-slate-800">Power BI Setup Required</h3>
          <p className="text-xs text-slate-500 mt-0.5">Complete these steps to enable embedded Power BI reports</p>
        </div>
      </div>

      <div className="space-y-3">
        {steps.map((step, i) => (
          <div key={i} className="bg-white/70 backdrop-blur-sm rounded-xl border border-white/80 overflow-hidden">
            <button
              onClick={() => setExpandedStep(expandedStep === i ? -1 : i)}
              className="w-full flex items-center gap-3 p-4 hover:bg-slate-50 transition-colors text-left"
            >
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: `${step.color}15` }}>
                <step.icon className="w-4 h-4" style={{ color: step.color }} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-slate-700">
                  <span className="text-slate-400 mr-2">Step {i + 1}.</span>
                  {step.title}
                </p>
              </div>
              {expandedStep === i ? (
                <ChevronUp className="w-4 h-4 text-slate-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-400" />
              )}
            </button>
            <AnimatePresence>
              {expandedStep === i && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="px-4 pb-4 pt-0">{step.content}</div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  );
}
