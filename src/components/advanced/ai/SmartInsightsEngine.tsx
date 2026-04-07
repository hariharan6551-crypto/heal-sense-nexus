// ============================================================================
// SmartInsightsEngine — Auto Anomaly Detection & NLP Insights
// ADD-ON MODULE: Mock AI logic included
// ============================================================================
import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAdvancedStore } from '@/stores/advancedStore';
import { Brain, Lightbulb, AlertOctagon, CheckCircle2, Sparkles, X, RefreshCcw, ChevronRight } from 'lucide-react';

interface Props {
  datasetSize?: number;
  columns?: string[];
}

interface SmartInsight {
  id: string;
  type: 'anomaly' | 'trend' | 'correlation' | 'recommendation';
  title: string;
  description: string;
  confidence: number;
  severity: 'low' | 'medium' | 'high';
  metric?: string;
  action?: string;
}

const INSIGHT_TEMPLATES: Omit<SmartInsight, 'id' | 'confidence'>[] = [
  {
    type: 'anomaly',
    title: 'Unusual Spike Detected',
    description: 'Column values show a 3.2σ deviation from the rolling mean in the most recent data window. This may indicate a data quality issue or genuine change in trend.',
    severity: 'high',
    metric: '+320% above baseline',
    action: 'Investigate recent data entries',
  },
  {
    type: 'trend',
    title: 'Consistent Upward Trajectory',
    description: 'A sustained upward trend has been identified across 6 consecutive periods with a compound growth rate of ~4.7% per period.',
    severity: 'low',
    metric: '+4.7% CAGR',
    action: 'Monitor for continuation',
  },
  {
    type: 'correlation',
    title: 'Strong Inverse Correlation Found',
    description: 'Two numeric features exhibit a Pearson correlation of -0.87, suggesting a significant inverse relationship that could inform predictive models.',
    severity: 'medium',
    metric: 'r = -0.87',
    action: 'Consider for feature engineering',
  },
  {
    type: 'recommendation',
    title: 'Data Completeness Opportunity',
    description: 'Filling 12 missing values using median imputation would improve overall data quality score from 94.2% to 99.1%, enhancing model reliability.',
    severity: 'medium',
    metric: '12 missing values',
    action: 'Apply median imputation',
  },
  {
    type: 'anomaly',
    title: 'Outlier Cluster Identified',
    description: 'A group of 8 records fall outside the interquartile range across multiple dimensions simultaneously, suggesting systematic outliers.',
    severity: 'high',
    metric: '8 records flagged',
    action: 'Review flagged records',
  },
  {
    type: 'trend',
    title: 'Seasonal Pattern Detected',
    description: 'The AI engine has identified a recurring cyclical pattern with an approximate period of 4 intervals, indicating potential seasonality in the data.',
    severity: 'low',
    metric: '4-period cycle',
    action: 'Apply seasonal decomposition',
  },
];

const typeIcons: Record<string, typeof Brain> = {
  anomaly: AlertOctagon,
  trend: Sparkles,
  correlation: Brain,
  recommendation: Lightbulb,
};

const typeColors: Record<string, string> = {
  anomaly: 'from-rose-500 to-red-600',
  trend: 'from-cyan-500 to-blue-600',
  correlation: 'from-violet-500 to-purple-600',
  recommendation: 'from-amber-500 to-orange-600',
};

const severityColors: Record<string, string> = {
  low: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
  medium: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
  high: 'text-rose-400 bg-rose-400/10 border-rose-400/20',
};

export default function SmartInsightsEngine({ datasetSize = 100, columns = [] }: Props) {
  const { insightsPanelOpen, toggleInsightsPanel } = useAdvancedStore();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [expandedInsight, setExpandedInsight] = useState<string | null>(null);

  const insights = useMemo<SmartInsight[]>(() => {
    return INSIGHT_TEMPLATES.slice(0, Math.min(6, Math.max(3, Math.floor(datasetSize / 50)))).map((t, i) => ({
      ...t,
      id: `insight-${i}`,
      confidence: 0.72 + Math.random() * 0.23,
    }));
  }, [datasetSize]);

  useEffect(() => {
    if (insightsPanelOpen) {
      setIsAnalyzing(true);
      const t = setTimeout(() => setIsAnalyzing(false), 2000);
      return () => clearTimeout(t);
    }
  }, [insightsPanelOpen]);

  return (
    <AnimatePresence>
      {insightsPanelOpen && (
        <motion.div
          initial={{ opacity: 0, x: 400 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 400 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="fixed right-0 top-0 bottom-0 w-[420px] z-[60] advanced-panel-glass overflow-y-auto"
        >
          <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/30">
                  <Brain className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Smart Insights</h2>
                  <p className="text-xs text-slate-400">AI anomaly detection engine</p>
                </div>
              </div>
              <button onClick={toggleInsightsPanel} className="advanced-close-btn">
                <X className="w-4 h-4" />
              </button>
            </div>

            {isAnalyzing ? (
              <div className="flex flex-col items-center justify-center py-16 gap-4">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                >
                  <Brain className="w-10 h-10 text-cyan-400" />
                </motion.div>
                <p className="text-sm text-slate-400">Analyzing {datasetSize} records...</p>
                <div className="w-48 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"
                    initial={{ width: '0%' }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 1.8 }}
                  />
                </div>
              </div>
            ) : (
              <>
                {/* Summary stats */}
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {[
                    { label: 'Anomalies', value: insights.filter(i => i.type === 'anomaly').length, color: 'text-rose-400' },
                    { label: 'Trends', value: insights.filter(i => i.type === 'trend').length, color: 'text-cyan-400' },
                    { label: 'Actions', value: insights.filter(i => i.action).length, color: 'text-amber-400' },
                  ].map((stat) => (
                    <div key={stat.label} className="advanced-metric-card text-center py-3">
                      <p className={`text-xl font-black ${stat.color}`}>{stat.value}</p>
                      <p className="text-[10px] text-slate-500 uppercase tracking-wider">{stat.label}</p>
                    </div>
                  ))}
                </div>

                {/* Insights List */}
                <div className="space-y-3">
                  {insights.map((insight, i) => {
                    const Icon = typeIcons[insight.type];
                    const isExpanded = expandedInsight === insight.id;
                    return (
                      <motion.div
                        key={insight.id}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="advanced-metric-card overflow-hidden cursor-pointer"
                        onClick={() => setExpandedInsight(isExpanded ? null : insight.id)}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${typeColors[insight.type]} flex items-center justify-center flex-shrink-0 shadow-lg`}>
                            <Icon className="w-4 h-4 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <h4 className="text-sm font-bold text-white truncate">{insight.title}</h4>
                              <ChevronRight className={`w-3 h-3 text-slate-500 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${severityColors[insight.severity]}`}>
                                {insight.severity.toUpperCase()}
                              </span>
                              <span className="text-[10px] text-slate-500">
                                {(insight.confidence * 100).toFixed(0)}% confidence
                              </span>
                            </div>
                          </div>
                        </div>

                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3 }}
                              className="overflow-hidden"
                            >
                              <div className="mt-3 pt-3 border-t border-slate-700/50">
                                <p className="text-xs text-slate-400 leading-relaxed mb-2">{insight.description}</p>
                                {insight.metric && (
                                  <div className="flex items-center gap-2 text-xs mb-2">
                                    <span className="text-slate-500">Metric:</span>
                                    <span className="font-bold text-cyan-400">{insight.metric}</span>
                                  </div>
                                )}
                                {insight.action && (
                                  <button className="text-[11px] text-purple-400 font-semibold hover:text-purple-300 flex items-center gap-1 mt-1">
                                    <Sparkles className="w-3 h-3" />
                                    {insight.action}
                                  </button>
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
