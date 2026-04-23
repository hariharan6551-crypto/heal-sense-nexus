import { memo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Brain, Target, Zap, CheckCircle, XCircle } from 'lucide-react';
import type { MLPipelineResult, ModelMetrics } from '@/lib/healthcareML';
import GlassCard from '@/components/core/GlassCard';

const COLORS = ['#3B82F6', '#8B5CF6', '#14B8A6', '#EC4899', '#F59E0B', '#10B981', '#6366F1', '#06B6D4'];

function MetricBar({ label, value, max = 1, color }: { label: string; value: number; max?: number; color: string }) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs font-bold text-slate-600 w-20">{label}</span>
      <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="text-xs font-black w-14 text-right" style={{ color }}>{(value * 100).toFixed(1)}%</span>
    </div>
  );
}

function ModelCard({ metrics }: { metrics: ModelMetrics }) {
  const { tp, fp, tn, fn } = metrics.confusionMatrix;
  return (
    <GlassCard className="p-5">
      <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
        <Brain className="w-4 h-4 text-blue-500" /> {metrics.modelName}
      </h3>
      <div className="space-y-3 mb-5">
        <MetricBar label="Accuracy" value={metrics.accuracy} color="#3B82F6" />
        <MetricBar label="Precision" value={metrics.precision} color="#8B5CF6" />
        <MetricBar label="Recall" value={metrics.recall} color="#10B981" />
        <MetricBar label="F1 Score" value={metrics.f1Score} color="#F59E0B" />
        <MetricBar label="AUC-ROC" value={metrics.aucROC} color="#EC4899" />
      </div>
      {/* Confusion Matrix */}
      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Confusion Matrix</p>
      <div className="grid grid-cols-2 gap-1 max-w-[200px]">
        <div className="bg-emerald-100 rounded-lg p-2 text-center">
          <p className="text-[9px] text-emerald-600 font-bold">True Pos</p>
          <p className="text-lg font-black text-emerald-700">{tp}</p>
        </div>
        <div className="bg-red-100 rounded-lg p-2 text-center">
          <p className="text-[9px] text-red-600 font-bold">False Pos</p>
          <p className="text-lg font-black text-red-700">{fp}</p>
        </div>
        <div className="bg-amber-100 rounded-lg p-2 text-center">
          <p className="text-[9px] text-amber-600 font-bold">False Neg</p>
          <p className="text-lg font-black text-amber-700">{fn}</p>
        </div>
        <div className="bg-blue-100 rounded-lg p-2 text-center">
          <p className="text-[9px] text-blue-600 font-bold">True Neg</p>
          <p className="text-lg font-black text-blue-700">{tn}</p>
        </div>
      </div>
    </GlassCard>
  );
}

export default memo(function ModelResults({ result }: { result: MLPipelineResult }) {
  const { logisticMetrics, forestMetrics, featureImportance } = result;
  const topFeatures = featureImportance.slice(0, 10);

  return (
    <div className="space-y-5">
      {/* Model Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ModelCard metrics={logisticMetrics} />
        <ModelCard metrics={forestMetrics} />
      </div>

      {/* Feature Importance */}
      <GlassCard className="p-5">
        <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Target className="w-4 h-4 text-violet-500" /> Top Feature Importances — Key Drivers of Readmission
        </h3>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={topFeatures} layout="vertical" margin={{ left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 10, fill: '#64748b' }} />
            <YAxis type="category" dataKey="feature" tick={{ fontSize: 10, fill: '#64748b' }} width={160} />
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            <Tooltip content={({ active, payload, label }: { active?: boolean; payload?: { value: number | string }[]; label?: string }) => {
              if (!active || !payload?.length) return null;
              return (
                <div className="bg-white/95 backdrop-blur border border-slate-200 px-4 py-3 rounded-xl shadow-lg text-xs">
                  <p className="font-bold text-slate-800">{label}</p>
                  <p className="text-slate-600">Importance: <strong>{payload[0].value}%</strong></p>
                </div>
              );
            }} />
            <Bar dataKey="importance" name="Importance %" radius={[0, 6, 6, 0]} barSize={18}>
              {topFeatures.map((f, i) => (
                <rect key={i} fill={f.direction === 'increases_risk' ? '#EF4444' : '#10B981'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <div className="flex gap-4 mt-3 justify-center">
          <div className="flex items-center gap-1.5 text-xs">
            <XCircle className="w-3 h-3 text-red-500" /> <span className="text-slate-600">Increases Risk</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <CheckCircle className="w-3 h-3 text-emerald-500" /> <span className="text-slate-600">Decreases Risk</span>
          </div>
        </div>
      </GlassCard>

      {/* AI Insights */}
      <GlassCard className="p-5">
        <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-500" /> AI-Generated Insights
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {featureImportance.slice(0, 6).map(f => (
            <div key={f.feature} className={`rounded-xl p-4 border ${f.direction === 'increases_risk' ? 'bg-red-50/50 border-red-100' : 'bg-emerald-50/50 border-emerald-100'}`}>
              <p className={`text-xs font-bold ${f.direction === 'increases_risk' ? 'text-red-700' : 'text-emerald-700'}`}>{f.feature}</p>
              <p className="text-[11px] text-slate-600 mt-1">
                {f.direction === 'increases_risk'
                  ? `Higher values of ${f.feature.toLowerCase()} are associated with increased readmission risk (${f.importance}% importance).`
                  : `Higher values of ${f.feature.toLowerCase()} are protective against readmission (${f.importance}% importance).`}
              </p>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
});
