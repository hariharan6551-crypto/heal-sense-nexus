import { useState, useMemo } from 'react';
import { Bot, Send, AlertTriangle, TrendingUp, Zap, Info } from 'lucide-react';
import type { DatasetInfo } from '@/lib/parseData';
import type { DataAnalysis } from '@/lib/analyzeData';
import type { Insight } from '@/lib/insightEngine';

interface Props {
  dataset: DatasetInfo;
  analysis: DataAnalysis;
  insights: Insight[];
}

const SEVERITY_STYLES = {
  info: 'bg-blue-50 border-blue-200 text-blue-800',
  warning: 'bg-amber-50 border-amber-200 text-amber-800',
  critical: 'bg-red-50 border-red-200 text-red-800',
};
const SEVERITY_ICON = {
  info: Info,
  warning: AlertTriangle,
  critical: Zap,
};

export default function AIPanel({ dataset, analysis, insights }: Props) {
  const [question, setQuestion] = useState('');
  const [answers, setAnswers] = useState<{ q: string; a: string }[]>([]);

  const suggestedQuestions = useMemo(() => {
    const qs: string[] = [];
    if (dataset.numericColumns.length > 0) qs.push(`What is the average ${dataset.numericColumns[0]}?`);
    if (dataset.categoricalColumns.length > 0 && dataset.numericColumns.length > 0)
      qs.push(`Which ${dataset.categoricalColumns[0]} has the highest ${dataset.numericColumns[0]}?`);
    if (analysis.strongCorrelations.length > 0)
      qs.push(`What are the strongest correlations?`);
    if (analysis.topOutlierColumns.length > 0)
      qs.push(`Are there any outliers in the data?`);
    qs.push('Summarize the dataset');
    return qs.slice(0, 4);
  }, [dataset, analysis]);

  const handleAsk = () => {
    if (!question.trim()) return;
    const q = question.trim();
    const ql = q.toLowerCase();
    let answer = '';

    if (ql.includes('average') || ql.includes('mean')) {
      const stats = analysis.columnStats.slice(0, 3);
      answer = stats.map(s => `**${s.column}**: mean = ${s.mean.toLocaleString()}, median = ${s.median.toLocaleString()}`).join('\n');
    } else if (ql.includes('correlation')) {
      if (analysis.strongCorrelations.length > 0) {
        answer = analysis.strongCorrelations.slice(0, 3)
          .map(c => `**${c.col1}** ↔ **${c.col2}**: r = ${c.value.toFixed(2)} (${c.value > 0 ? 'positive' : 'negative'})`)
          .join('\n');
      } else answer = 'No strong correlations found in this dataset.';
    } else if (ql.includes('outlier')) {
      if (analysis.topOutlierColumns.length > 0) {
        const cols = analysis.topOutlierColumns.slice(0, 3);
        answer = cols.map(col => {
          const s = analysis.columnStats.find(st => st.column === col);
          return s ? `**${col}**: ${s.outlierCount} outliers (range ${s.min}–${s.max})` : col;
        }).join('\n');
      } else answer = 'No significant outliers detected.';
    } else if (ql.includes('highest') || ql.includes('top') || ql.includes('best')) {
      if (dataset.categoricalColumns.length > 0 && dataset.numericColumns.length > 0) {
        const cat = dataset.categoricalColumns[0];
        const num = dataset.numericColumns[0];
        const groups: Record<string, { sum: number; count: number }> = {};
        for (const row of dataset.data) {
          const k = String(row[cat] ?? '');
          if (!groups[k]) groups[k] = { sum: 0, count: 0 };
          groups[k].sum += Number(row[num]) || 0;
          groups[k].count++;
        }
        const sorted = Object.entries(groups).map(([n, { sum, count }]) => ({ n, avg: sum / count })).sort((a, b) => b.avg - a.avg);
        answer = `Top ${cat} by ${num}:\n` + sorted.slice(0, 5).map((s, i) => `${i + 1}. **${s.n}**: ${s.avg.toFixed(2)}`).join('\n');
      } else answer = 'Need categorical + numeric columns for ranking analysis.';
    } else {
      // General summary
      answer = `Dataset: **${dataset.fileName}**\n` +
        `${dataset.totalRows.toLocaleString()} rows × ${dataset.totalColumns} columns\n` +
        `Numeric: ${dataset.numericColumns.join(', ')}\n` +
        `Categorical: ${dataset.categoricalColumns.join(', ')}\n` +
        `Missing values: ${dataset.missingValueCount.toLocaleString()}\n` +
        `Duplicates: ${dataset.duplicateRowCount}`;
    }
    setAnswers(prev => [...prev, { q, a: answer }]);
    setQuestion('');
  };

  return (
    <div className="space-y-4">
      {/* AI Chat */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-4 py-3 bg-gradient-to-r from-[#1e3a5f] to-[#2563eb] text-white">
          <div className="flex items-center gap-2">
            <Bot className="h-4 w-4" />
            <h3 className="text-sm font-bold">Smart AI Assistant</h3>
          </div>
        </div>
        <div className="p-3">
          <div className="flex gap-2 mb-3">
            <input
              type="text" placeholder="Ask a question about the dataset..."
              value={question} onChange={e => setQuestion(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAsk()}
              className="flex-1 px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button onClick={handleAsk} className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <Send className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="space-y-1.5">
            {suggestedQuestions.map(sq => (
              <button key={sq} onClick={() => setQuestion(sq)}
                className="w-full text-left px-2 py-1.5 text-[10px] text-slate-600 bg-slate-50 rounded hover:bg-blue-50 transition-colors truncate">
                💡 {sq}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* AI Answers */}
      {answers.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
            <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <Bot className="h-4 w-4 text-blue-600" /> AI Q&A
            </h3>
          </div>
          <div className="p-3 space-y-3 max-h-[250px] overflow-y-auto scrollbar-thin">
            {answers.map((item, i) => (
              <div key={i}>
                <p className="text-[10px] font-bold text-blue-600 mb-1">Q: {item.q}</p>
                <p className="text-[10px] text-slate-600 bg-blue-50 p-2 rounded-lg whitespace-pre-line">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Auto-Generated Insights */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
          <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-blue-600" /> AI Insights
          </h3>
        </div>
        <div className="p-3 space-y-2 max-h-[350px] overflow-y-auto scrollbar-thin">
          {insights.slice(0, 8).map(ins => {
            const Icon = SEVERITY_ICON[ins.severity];
            return (
              <div key={ins.id} className={`rounded-lg border p-2.5 ${SEVERITY_STYLES[ins.severity]}`}>
                <div className="flex items-start gap-2">
                  <Icon className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-[10px] font-bold">{ins.title}</p>
                    <p className="text-[9px] mt-0.5 opacity-80">{ins.description}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
