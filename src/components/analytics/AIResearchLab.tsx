import { useState } from 'react';
import { Send, Cpu, Database, Zap, Sparkles, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import GlassCard from '@/components/core/GlassCard';
import GlowButton from '@/components/core/GlowButton';

export default function AIResearchLab() {
  const [question, setQuestion] = useState('');
  const [responses, setResponses] = useState<{ q: string; a: React.ReactNode }[]>([]);

  const handleAsk = () => {
    if (!question.trim()) return;
    const q = question.trim();
    const ql = q.toLowerCase();

    let answer: React.ReactNode = null;

    if (ql.includes('understand data') || ql.includes('analytics') || ql.includes('patterns')) {
      answer = (
        <div className="space-y-4 fade-in">
          <div className="bg-blue-50/80 backdrop-blur-sm p-4 rounded-xl border border-blue-100 shadow-sm">
            <h4 className="font-bold flex items-center gap-2 text-blue-700 mb-2">
              <BookOpen className="w-4 h-4" /> 1. Matrix Analysis
            </h4>
            <p className="text-sm text-slate-700 leading-relaxed font-mono font-medium">
              Data analytics involves analyzing raw data to find trends and answer questions. With <strong className="text-blue-700">Predictive Modeling</strong>, the system calculates future probabilities. The platform evaluates high-dimensional matrices to isolate <strong className="text-blue-700">Cluster Patterns</strong> and predict target outcomes accurately.
            </p>
          </div>

          <div className="bg-amber-50/80 backdrop-blur-sm p-4 rounded-xl border border-amber-100 shadow-sm">
            <h4 className="font-bold flex items-center gap-2 text-amber-700 mb-2">
              <Zap className="w-4 h-4" /> 2. Outlier Detection
            </h4>
            <ul className="text-sm text-slate-700 space-y-2 list-none pl-1 font-mono font-medium">
              <li className="flex gap-2"><span className="text-amber-500">▶</span> Anomalies are isolated utilizing statistical deviations.</li>
              <li className="flex gap-2"><span className="text-amber-500">▶</span> The system flags records exceeding standard confidence intervals.</li>
              <li className="flex gap-2"><span className="text-amber-500">▶</span> Rapid diagnostic scans ensure zero data corruption.</li>
            </ul>
          </div>

          <div className="bg-violet-50/80 backdrop-blur-sm p-4 rounded-xl border border-violet-100 shadow-sm">
            <h4 className="font-bold flex items-center gap-2 text-violet-700 mb-2">
              <Cpu className="w-4 h-4" /> 3. Advanced Compute Strategies
            </h4>
            <ul className="text-sm text-slate-700 space-y-2 list-none pl-1 font-mono font-medium">
              <li className="flex gap-2"><span className="text-violet-500">▶</span> <strong className="text-violet-700">Neural Forecasting:</strong> Identifying multi-layered trends over time.</li>
              <li className="flex gap-2"><span className="text-violet-500">▶</span> <strong className="text-violet-700">Behavioral Modeling:</strong> Predicting node activities.</li>
              <li className="flex gap-2"><span className="text-violet-500">▶</span> <strong className="text-violet-700">Regression Analysis:</strong> Correlating massive independent variables.</li>
            </ul>
          </div>

          <div className="bg-teal-50/80 backdrop-blur-sm p-4 rounded-xl border border-teal-100 shadow-sm">
            <h4 className="font-bold flex items-center gap-2 text-teal-700 mb-2">
              <Database className="w-4 h-4" /> 4. Data Processing Pipelines
            </h4>
            <ul className="text-sm text-slate-700 space-y-2 list-none pl-1 font-mono font-medium">
              <li className="flex gap-2"><span className="text-teal-500">▶</span> Automated ETL (Extract, Transform, Load) protocols.</li>
              <li className="flex gap-2"><span className="text-teal-500">▶</span> Real-time stream processing of incoming telemetry.</li>
              <li className="flex gap-2"><span className="text-teal-500">▶</span> Robust encrypted data lakes ensuring complete integrity.</li>
            </ul>
          </div>

          <div className="bg-pink-50/80 backdrop-blur-sm p-4 rounded-xl border border-pink-100 shadow-sm">
            <h4 className="font-bold flex items-center gap-2 text-pink-700 mb-2">
              <Sparkles className="w-4 h-4" /> 5. Automated Intelligence Outcomes
            </h4>
            <p className="text-sm text-slate-700 leading-relaxed font-mono font-medium">
              Ultimately, the objective is to empower operators with <strong className="text-pink-700">Prescriptive Analytics</strong>, defining exactly which steps to take to resolve bottlenecks and optimize all network <strong className="text-pink-700">performance indicators</strong>.
            </p>
          </div>
        </div>
      );
    } else {
      answer = (
        <p className="text-sm text-slate-500 font-mono font-medium">
          I am the AI Research Lab. My current focus is advanced data compute operations. Try asking me: <br/>
          <strong className="text-blue-600 mt-2 block hover:text-blue-800 cursor-pointer transition-colors" onClick={() => setQuestion('Understand Data Analytics and patterns')}>{">> "}"Understand Data Analytics and patterns"</strong>
        </p>
      );
    }

    setResponses(prev => [...prev, { q, a: answer }]);
    setQuestion('');
  };

  return (
    <GlassCard className="overflow-hidden h-full flex flex-col" glowColor="blue">
      {/* Header */}
      <div className="px-6 py-5 border-b border-white/50 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.06), rgba(99,102,241,0.06))' }}
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-400/5 rounded-full filter blur-[80px]" />
        
        <div className="flex items-center gap-4 relative z-10">
          <motion.div
            whileHover={{ scale: 1.1, rotate: 10 }}
            className="p-2.5 rounded-xl shadow-md"
            style={{
              background: 'linear-gradient(135deg, #3B82F6, #6366F1)',
              boxShadow: '0 4px 15px rgba(59,130,246,0.3)',
            }}
          >
            <Cpu className="h-6 w-6 text-white" />
          </motion.div>
          <div>
            <h3 className="text-xl font-black tracking-widest text-slate-800 uppercase">AI Research Lab</h3>
            <p className="text-[10px] text-blue-600 uppercase tracking-[0.2em] font-bold font-mono mt-0.5">Advanced Analytics Compute Engine</p>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 min-h-0 p-6 overflow-y-auto space-y-6 bg-transparent custom-scrollbar relative">
        {responses.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 space-y-4">
            <div className="relative">
              <Cpu className="w-24 h-24 stroke-[1] text-blue-200 animate-[spin_20s_linear_infinite]" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Database className="w-12 h-12 stroke-[1.5] text-blue-300 animate-pulse" />
              </div>
            </div>
            <p className="font-mono text-sm font-bold tracking-widest text-slate-400">AWAITING RESEARCH QUERY...</p>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {responses.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div className="flex items-start justify-end gap-2">
                  <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-3 rounded-2xl rounded-tr-sm text-sm shadow-lg max-w-[80%] font-mono font-medium">
                    {item.q}
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/80 backdrop-blur-md border border-blue-100 flex items-center justify-center flex-shrink-0 shadow-md relative overflow-hidden">
                    <div className="absolute inset-0 bg-blue-50/50 animate-pulse" />
                    <Cpu className="w-5 h-5 text-blue-600 relative z-10" />
                  </div>
                  <div className="bg-white/60 backdrop-blur-sm border border-white/80 px-5 py-4 rounded-2xl rounded-tl-sm text-sm shadow-sm w-full max-w-[90%]">
                    {item.a}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* Input Area */}
      <div className="p-5 border-t border-white/50 bg-white/30 backdrop-blur-sm">
        <div className="flex gap-3 relative">
          <input
            type="text"
            placeholder="Initialize research query..."
            value={question}
            onChange={e => setQuestion(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAsk()}
            className="flex-1 pl-4 pr-14 py-3.5 bg-white/60 backdrop-blur-md border border-white/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300 text-slate-800 placeholder-slate-400 font-mono font-medium shadow-sm transition-all"
          />
          <GlowButton
            onClick={handleAsk}
            variant="primary"
            className="px-5 py-3 rounded-xl shadow-md"
          >
            <Send className="h-4 w-4" />
          </GlowButton>
        </div>
        <div className="mt-3 text-center text-[9px] text-slate-400 font-black tracking-[0.3em] uppercase">
          System: Online | Module: Active | Sec-Lvl: Alpha
        </div>
      </div>
    </GlassCard>
  );
}
