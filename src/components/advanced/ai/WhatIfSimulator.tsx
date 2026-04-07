import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAdvancedStore } from '@/stores/advancedStore';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { SlidersHorizontal, X, RotateCcw, Zap, ArrowRight } from 'lucide-react';

interface Props {
  numericColumns?: string[];
  datasetSize?: number;
}

interface ScenarioParam {
  name: string;
  baseValue: number;
  currentValue: number;
  min: number;
  max: number;
}

export default function WhatIfSimulator({ numericColumns = [], datasetSize = 100 }: Props) {
  const { whatIfPanelOpen, toggleWhatIfPanel } = useAdvancedStore();

  const defaultParams = useMemo<ScenarioParam[]>(() => {
    const names = numericColumns.length > 0 ? numericColumns.slice(0, 5) : ['Revenue', 'Volume', 'Rate', 'Score', 'Growth'];
    return names.map((name) => {
      const base = Math.round(50 + Math.random() * 200);
      return { name, baseValue: base, currentValue: base, min: Math.round(base * 0.2), max: Math.round(base * 2.5) };
    });
  }, [numericColumns]);

  const [params, setParams] = useState<ScenarioParam[]>(defaultParams);

  const impactData = useMemo(() => {
    return params.map((p) => {
      const change = ((p.currentValue - p.baseValue) / p.baseValue) * 100;
      const impact = change * (0.5 + Math.random() * 0.5);
      return { name: p.name.length > 10 ? p.name.slice(0, 10) + '…' : p.name, change: +change.toFixed(1), impact: +impact.toFixed(1) };
    });
  }, [params]);

  const totalImpact = impactData.reduce((s, d) => s + d.impact, 0);

  return (
    <AnimatePresence>
      {whatIfPanelOpen && (
        <motion.div initial={{ opacity: 0, x: 400 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 400 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="fixed right-0 top-0 bottom-0 w-[420px] z-[60] advanced-panel-glass overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/30">
                  <SlidersHorizontal className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">What-If Simulator</h2>
                  <p className="text-xs text-slate-400">Scenario impact analysis</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setParams(defaultParams)} className="advanced-icon-btn"><RotateCcw className="w-4 h-4" /></button>
                <button onClick={toggleWhatIfPanel} className="advanced-close-btn"><X className="w-4 h-4" /></button>
              </div>
            </div>

            <div className="advanced-metric-card mb-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Net Impact</span>
                <Zap className="w-4 h-4 text-amber-400" />
              </div>
              <span className={`text-3xl font-black ${totalImpact >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {totalImpact >= 0 ? '+' : ''}{totalImpact.toFixed(1)}%
              </span>
            </div>

            <div className="space-y-4 mb-6">
              {params.map((param, i) => {
                const pct = ((param.currentValue - param.baseValue) / param.baseValue) * 100;
                return (
                  <motion.div key={param.name} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} className="advanced-metric-card">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-slate-300 truncate max-w-[180px]">{param.name}</span>
                      <div className="flex items-center gap-1 text-xs">
                        <span className="text-slate-500">{param.baseValue}</span>
                        <ArrowRight className="w-3 h-3 text-slate-600" />
                        <span className={pct >= 0 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>{param.currentValue}</span>
                      </div>
                    </div>
                    <input type="range" min={param.min} max={param.max} value={param.currentValue}
                      onChange={(e) => setParams(prev => prev.map((p, j) => j === i ? { ...p, currentValue: +e.target.value } : p))}
                      className="advanced-range-slider w-full" />
                    <div className="flex justify-between mt-1">
                      <span className="text-[9px] text-slate-600">{param.min}</span>
                      <span className={`text-[10px] font-bold ${pct >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>{pct >= 0 ? '+' : ''}{pct.toFixed(1)}%</span>
                      <span className="text-[9px] text-slate-600">{param.max}</span>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            <div className="advanced-metric-card">
              <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-3">Impact Distribution</p>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={impactData} layout="vertical">
                    <XAxis type="number" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis dataKey="name" type="category" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} width={70} />
                    <Tooltip contentStyle={{ backgroundColor: 'rgba(15,23,42,0.95)', border: '1px solid rgba(148,163,184,0.2)', borderRadius: '12px', color: '#e2e8f0', fontSize: '11px' }} />
                    <Bar dataKey="impact" radius={[0, 6, 6, 0]}>
                      {impactData.map((e, idx) => <Cell key={idx} fill={e.impact >= 0 ? '#10b981' : '#f43f5e'} fillOpacity={0.8} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
