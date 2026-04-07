import { useState, useMemo, useEffect, useRef } from 'react';
import { Bot, Send, AlertTriangle, TrendingUp, Zap, Info, Sparkles, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { DatasetInfo } from '@/lib/parseData';
import type { DataAnalysis } from '@/lib/analyzeData';
import type { Insight } from '@/lib/insightEngine';
import { GlassCard } from '../ui/GlassCard';
import { GlowBadge } from '../ui/GlowBadge';
import { AnimatedButton } from '../ui/AnimatedButton';

interface Props {
  dataset: DatasetInfo;
  analysis: DataAnalysis;
  insights: Insight[];
}

const SEVERITY_STYLES = {
  info: { bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-400', icon: Info, color: 'blue' },
  warning: { bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-400', icon: AlertTriangle, color: 'amber' },
  critical: { bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-400', icon: Zap, color: 'pink' },
};

export default function AIPanel({ dataset, analysis, insights }: Props) {
  const [question, setQuestion] = useState('');
  const [chatHistory, setChatHistory] = useState<{ id: string, role: 'user'|'assistant', text: string }[]>([
    { id: 'initial', role: 'assistant', text: 'System initialized. I am ready to analyze your dataset. How can I assist you today?' }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatHistory, isTyping]);

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

  const handleAsk = (qStr = question) => {
    if (!qStr.trim() || isTyping) return;
    const q = qStr.trim();
    
    // Add user message
    const userId = Date.now().toString();
    setChatHistory(prev => [...prev, { id: userId, role: 'user', text: q }]);
    setQuestion('');
    setIsTyping(true);

    const ql = q.toLowerCase();
    let answer = '';

    // Logic remains
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
      answer = `Dataset **${dataset.fileName}** successfully processed.\n` +
        `• Rows: ${dataset.totalRows.toLocaleString()} | Cols: ${dataset.totalColumns}\n` +
        `• Metrics tracked: ${dataset.numericColumns.join(', ')}\n` +
        `• Categories: ${dataset.categoricalColumns.join(', ')}`;
    }

    // Simulate AI thinking & typing
    setTimeout(() => {
      setIsTyping(false);
      setChatHistory(prev => [...prev, { id: 'ai_'+Date.now(), role: 'assistant', text: answer }]);
    }, 1200 + Math.random() * 800);
  };

  return (
    <div className="space-y-4">
      {/* AI Chat Interface */}
      <GlassCard className="flex flex-col h-[400px]" glowColor="blue">
        <div className="px-4 py-3 border-b border-[rgba(255,255,255,0.08)] bg-[rgba(0,0,0,0.2)]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Bot className="h-5 w-5 text-blue-400" />
                {isTyping && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-teal-400 animate-pulse shadow-[0_0_8px_rgba(20,184,166,0.8)]" />
                )}
              </div>
              <div>
                <h3 className="text-sm font-bold text-white tracking-wide">ADVANCED AI</h3>
                <p className="text-[10px] text-blue-300 flex items-center gap-1">
                  <Activity className="h-3 w-3" /> System Active
                </p>
              </div>
            </div>
            <GlowBadge color="blue" pulse>JARVIS MODE</GlowBadge>
          </div>
        </div>
        
        {/* Chat History */}
        <div ref={scrollRef} className="flex-1 p-4 overflow-y-auto scrollbar-thin space-y-4">
          <AnimatePresence initial={false}>
            {chatHistory.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-6 h-6 rounded-full bg-blue-500/20 border border-blue-500/40 flex items-center justify-center flex-shrink-0 mt-1">
                    <Sparkles className="w-3 h-3 text-blue-400" />
                  </div>
                )}
                <div className={`px-4 py-2 text-xs rounded-2xl max-w-[85%] leading-relaxed whitespace-pre-line ${
                  msg.role === 'user' 
                    ? 'bg-blue-600 text-white rounded-tr-sm shadow-[0_4px_12px_rgba(37,99,235,0.2)]'
                    : 'bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] text-slate-300 rounded-tl-sm'
                }`}>
                  {msg.text.split('**').map((part, i) => i % 2 === 1 ? <strong key={i} className="text-blue-300">{part}</strong> : part)}
                </div>
              </motion.div>
            ))}
            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-3 justify-start"
              >
                <div className="w-6 h-6 rounded-full bg-blue-500/20 border border-blue-500/40 flex items-center justify-center flex-shrink-0 mt-1">
                  <Sparkles className="w-3 h-3 text-teal-400 animate-spin" style={{ animationDuration: '3s' }} />
                </div>
                <div className="px-4 py-3 bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-2xl rounded-tl-sm flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-blue-400/50 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 rounded-full bg-teal-400/50 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 rounded-full bg-violet-400/50 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Input Area */}
        <div className="p-3 border-t border-[rgba(255,255,255,0.08)] bg-[rgba(0,0,0,0.2)]">
          <div className="flex gap-2 mb-3 px-1 overflow-x-auto scrollbar-thin pb-1">
            {suggestedQuestions.map(sq => (
              <button key={sq} onClick={() => handleAsk(sq)}
                className="whitespace-nowrap px-3 py-1.5 text-[10px] text-blue-300 bg-blue-500/10 border border-blue-500/20 rounded-full hover:bg-blue-500/20 hover:border-blue-500/40 transition-colors">
                {sq}
              </button>
            ))}
          </div>
          <div className="flex gap-2 relative">
            <input
              type="text" placeholder="Ask Advanced..."
              value={question} onChange={e => setQuestion(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAsk()}
              disabled={isTyping}
              className="flex-1 px-4 py-2 text-sm bg-[rgba(255,255,255,0.05)] text-white placeholder-slate-500 border border-[rgba(255,255,255,0.1)] rounded-xl focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 outline-none transition-all disabled:opacity-50"
            />
            <AnimatedButton onClick={() => handleAsk()} variant="glow" disabled={isTyping} className="px-3 py-2 disabled:opacity-50">
              <Send className="h-4 w-4" />
            </AnimatedButton>
          </div>
        </div>
      </GlassCard>

      {/* Auto-Generated Insights Container */}
      <GlassCard className="overflow-hidden" glowColor="none">
        <div className="px-4 py-3 border-b border-[rgba(255,255,255,0.08)] bg-[rgba(0,0,0,0.2)]">
          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-violet-400" /> Automated Intelligence
          </h3>
        </div>
        <div className="p-3 space-y-2 max-h-[350px] overflow-y-auto scrollbar-thin">
          {insights.slice(0, 8).map((ins, i) => {
            const style = SEVERITY_STYLES[ins.severity as keyof typeof SEVERITY_STYLES] || SEVERITY_STYLES.info;
            const Icon = style.icon;
            
            return (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                key={ins.id} 
                className={`rounded-xl border border-[rgba(255,255,255,0.05)] p-3 ${style.bg} ${style.border} backdrop-blur-md relative overflow-hidden group`}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
                <div className="flex items-start gap-3 relative z-10">
                  <div className={`mt-0.5 p-1.5 rounded-lg bg-black/20 ${style.text}`}>
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <h4 className="text-[11px] font-bold text-slate-200 tracking-wide">{ins.title}</h4>
                    <p className="text-[10px] mt-1 text-slate-400 leading-relaxed">{ins.description}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </GlassCard>
    </div>
  );
}
