// ============================================================================
// AIPredictionPanel — Time-series Forecasting & Risk Probability
// ADD-ON MODULE: Mock AI logic included
// ============================================================================
import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { useAdvancedStore } from '@/stores/advancedStore';
import { TrendingUp, TrendingDown, AlertTriangle, Target, Zap, ChevronDown, ChevronUp, X } from 'lucide-react';

interface Props {
  datasetSize?: number;
  numericColumns?: string[];
}

// Mock time-series forecasting engine
function generateForecast(size: number) {
  const periods = 12;
  const data = [];
  let baseValue = size * 0.8 + Math.random() * size * 0.4;
  const trend = (Math.random() - 0.3) * size * 0.02;

  for (let i = 0; i < periods; i++) {
    const noise = (Math.random() - 0.5) * size * 0.1;
    const seasonal = Math.sin((i / periods) * Math.PI * 2) * size * 0.05;
    const value = Math.max(0, baseValue + trend * i + noise + seasonal);
    data.push({
      period: `M${i + 1}`,
      actual: i < 8 ? Math.round(value) : undefined,
      predicted: i >= 6 ? Math.round(value * (1 + (Math.random() - 0.4) * 0.1)) : undefined,
      lower: i >= 6 ? Math.round(value * 0.85) : undefined,
      upper: i >= 6 ? Math.round(value * 1.15) : undefined,
    });
    baseValue = value;
  }
  return data;
}

function generateRiskScores(columns: string[]) {
  return columns.slice(0, 5).map((col) => ({
    name: col,
    risk: Math.random(),
    trend: Math.random() > 0.5 ? 'up' : 'down' as 'up' | 'down',
    confidence: 0.7 + Math.random() * 0.25,
  }));
}

export default function AIPredictionPanel({ datasetSize = 100, numericColumns = [] }: Props) {
  const { predictionPanelOpen, togglePredictionPanel } = useAdvancedStore();
  const [activeMetric, setActiveMetric] = useState(0);
  const [isComputing, setIsComputing] = useState(false);

  const forecast = useMemo(() => generateForecast(datasetSize), [datasetSize]);
  const risks = useMemo(() => generateRiskScores(numericColumns), [numericColumns]);

  useEffect(() => {
    if (predictionPanelOpen) {
      setIsComputing(true);
      const t = setTimeout(() => setIsComputing(false), 1500);
      return () => clearTimeout(t);
    }
  }, [predictionPanelOpen]);

  const overallTrend = forecast[forecast.length - 1]?.predicted && forecast[5]?.actual
    ? ((forecast[forecast.length - 1]!.predicted! - forecast[5]!.actual!) / forecast[5]!.actual!) * 100
    : 0;

  return (
    <AnimatePresence>
      {predictionPanelOpen && (
        <motion.div
          initial={{ opacity: 0, x: 400 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 400 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="fixed right-0 top-0 bottom-0 w-[420px] z-[60] bg-white/95 backdrop-blur-xl shadow-2xl border-l border-slate-200 overflow-y-auto"
        >
          <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
                  <Target className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-800">AI Predictions</h2>
                  <p className="text-xs text-slate-500">Time-series forecasting engine</p>
                </div>
              </div>
              <button onClick={togglePredictionPanel} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500">
                <X className="w-4 h-4" />
              </button>
            </div>

            {isComputing ? (
              <div className="flex flex-col items-center justify-center py-16 gap-4">
                <div className="advanced-spinner" />
                <p className="text-sm text-slate-500 animate-pulse font-medium">Running prediction models...</p>
                <div className="flex gap-1">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <motion.div
                      key={i}
                      className="w-2 h-2 rounded-full bg-purple-500"
                      animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 1, delay: i * 0.15, repeat: Infinity }}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <>
                {/* Trend Overview */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 shadow-sm mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500 uppercase tracking-wider font-bold">Projected Trend</span>
                    <div className={`flex items-center gap-1 text-sm font-bold ${overallTrend >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {overallTrend >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                      {overallTrend >= 0 ? '+' : ''}{overallTrend.toFixed(1)}%
                    </div>
                  </div>
                  <p className="text-2xl font-black text-slate-800 mt-2 font-mono">
                    {forecast[forecast.length - 1]?.predicted?.toLocaleString() || '—'}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">Predicted value at M12</p>
                </div>

                {/* Forecast Chart */}
                <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm mb-4">
                  <p className="text-xs text-slate-600 uppercase tracking-wider font-bold mb-3">Forecast Timeline</p>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={forecast}>
                        <defs>
                          <linearGradient id="predGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="actGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="period" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} width={45} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'rgba(255, 255, 255, 0.95)',
                            border: '1px solid rgba(148, 163, 184, 0.2)',
                            borderRadius: '12px',
                            color: '#0f172a',
                            fontSize: '11px',
                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)'
                          }}
                        />
                        <Area type="monotone" dataKey="upper" stroke="none" fill="rgba(139, 92, 246, 0.1)" />
                        <Area type="monotone" dataKey="lower" stroke="none" fill="rgba(139, 92, 246, 0.1)" />
                        <Area type="monotone" dataKey="actual" stroke="#06b6d4" fill="url(#actGrad)" strokeWidth={2} dot={{ r: 3, fill: '#06b6d4' }} />
                        <Line type="monotone" dataKey="predicted" stroke="#8b5cf6" strokeWidth={2} strokeDasharray="6 3" dot={{ r: 3, fill: '#8b5cf6' }} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex gap-4 mt-2 text-[10px] text-slate-500">
                    <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-cyan-500 rounded" /> Actual</span>
                    <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-purple-500 rounded border-dashed" style={{borderTop: '2px dashed #8b5cf6', background: 'transparent'}} /> Predicted</span>
                    <span className="flex items-center gap-1"><span className="w-3 h-3 bg-purple-500/10 rounded" /> Confidence</span>
                  </div>
                </div>

                {/* Risk Scores */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 shadow-sm">
                  <p className="text-xs text-slate-600 uppercase tracking-wider font-bold mb-3 flex items-center gap-2">
                    <AlertTriangle className="w-3 h-3" /> Risk Probability Scores
                  </p>
                  <div className="space-y-3">
                    {risks.map((r, i) => (
                      <motion.div
                        key={r.name}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="flex items-center gap-3"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-slate-700 truncate font-semibold">{r.name}</span>
                            <span className={`text-xs font-bold ${r.risk > 0.7 ? 'text-rose-400' : r.risk > 0.4 ? 'text-amber-400' : 'text-emerald-400'}`}>
                              {(r.risk * 100).toFixed(0)}%
                            </span>
                          </div>
                          <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${r.risk * 100}%` }}
                              transition={{ duration: 0.8, delay: i * 0.1 }}
                              className={`h-full rounded-full ${
                                r.risk > 0.7 ? 'bg-gradient-to-r from-rose-500 to-red-400' :
                                r.risk > 0.4 ? 'bg-gradient-to-r from-amber-500 to-yellow-400' :
                                'bg-gradient-to-r from-emerald-500 to-green-400'
                              }`}
                            />
                          </div>
                        </div>
                        <span className="text-[10px] text-slate-500">{(r.confidence * 100).toFixed(0)}% conf</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
