// ============================================================================
// AICopilot — Chat-based AI Assistant Overlay
// ADD-ON MODULE: Context-aware mock responses
// ============================================================================
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAdvancedStore } from '@/stores/advancedStore';
import { MessageCircle, Send, X, Sparkles, Bot, User, Trash2, Minimize2 } from 'lucide-react';

interface Props {
  datasetName?: string;
  totalRows?: number;
  columns?: string[];
}

// Mock AI response generator
function generateResponse(input: string, ctx: { dataset?: string; rows?: number; cols?: string[] }): string {
  const q = input.toLowerCase();

  if (q.includes('summary') || q.includes('overview')) {
    return `📊 **Dataset Overview**\n\nYou're currently analyzing **${ctx.dataset || 'your dataset'}** containing **${ctx.rows?.toLocaleString() || '—'} rows** across **${ctx.cols?.length || 0} columns**.\n\nKey columns include: ${ctx.cols?.slice(0, 5).join(', ') || 'N/A'}.\n\nI detect a mix of numeric and categorical features well-suited for trend analysis and predictive modeling.`;
  }
  if (q.includes('anomal') || q.includes('outlier')) {
    return `🔍 **Anomaly Detection Results**\n\nI've scanned the dataset using an Isolation Forest algorithm (simulated).\n\n• **3 potential outliers** detected in the upper quartile\n• **Confidence:** 87.2%\n• These records deviate >2.5σ from the cluster centroid\n\n*Recommendation:* Review these records in the data table using the filter panel.`;
  }
  if (q.includes('predict') || q.includes('forecast')) {
    return `🔮 **Prediction Analysis**\n\nBased on the current trajectory:\n• **Short-term (30d):** +3.2% growth expected\n• **Medium-term (90d):** Stable with seasonal adjustment\n• **Risk Level:** Low (0.23 probability of reversal)\n\nOpen the **AI Predictions Panel** for detailed time-series forecasts.`;
  }
  if (q.includes('recommend') || q.includes('suggest') || q.includes('what should')) {
    return `💡 **Recommendations**\n\n1. **Apply cross-filtering** to isolate high-value segments\n2. **Enable the What-If simulator** to test scenario impacts\n3. **Export a filtered CSV** for stakeholder review\n4. Consider **seasonal decomposition** — I detect a cyclical pattern\n\nWould you like me to elaborate on any of these?`;
  }
  if (q.includes('help') || q.includes('what can')) {
    return `🤖 **I can help you with:**\n\n• Dataset summaries & overviews\n• Anomaly & outlier detection\n• Predictive forecasting\n• Smart recommendations\n• Data quality assessment\n• Generating dashboard configurations\n\nJust ask me anything about your data!`;
  }
  return `I've analyzed your query regarding "${input.slice(0, 50)}..."\n\nBased on the current dataset (${ctx.rows?.toLocaleString() || '—'} records), I've identified several relevant patterns. The data shows consistent characteristics across ${ctx.cols?.length || 0} dimensions.\n\n*Tip:* Try asking about anomalies, predictions, or recommendations for more specific insights.`;
}

export default function AICopilot({ datasetName, totalRows, columns }: Props) {
  const { copilotOpen, toggleCopilot, copilotMessages, addCopilotMessage, clearCopilot } = useAdvancedStore();
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [copilotMessages]);

  useEffect(() => {
    if (copilotOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [copilotOpen]);

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg = input.trim();
    setInput('');
    addCopilotMessage({ role: 'user', content: userMsg });

    setIsTyping(true);
    setTimeout(() => {
      const response = generateResponse(userMsg, {
        dataset: datasetName,
        rows: totalRows,
        cols: columns,
      });
      addCopilotMessage({ role: 'assistant', content: response });
      setIsTyping(false);
    }, 800 + Math.random() * 1200);
  };

  const quickActions = [
    'Give me a summary',
    'Detect anomalies',
    'What should I do next?',
    'Show predictions',
  ];

  return (
    <>
      {/* Chat Panel */}
      <AnimatePresence>
        {copilotOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="fixed bottom-6 right-6 z-[55] w-[400px] h-[560px] rounded-2xl overflow-hidden bg-white shadow-2xl border border-slate-200 flex flex-col"
          >
            {/* Chat Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-sm">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800">AI Copilot</h3>
                  <p className="text-[10px] text-slate-500 flex items-center gap-1 font-medium tracking-wide">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    Online · Context-aware
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={clearCopilot} className="advanced-icon-btn" title="Clear chat">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
                <button onClick={toggleCopilot} className="advanced-icon-btn" title="Minimize">
                  <Minimize2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
              {copilotMessages.length === 0 && (
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-violet-500/20 to-purple-600/20 flex items-center justify-center">
                    <Sparkles className="w-7 h-7 text-purple-400" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-800 mb-1">How can I help?</h4>
                  <p className="text-xs text-slate-500 mb-4 font-medium">Ask me anything about your dataset</p>
                  <div className="space-y-2">
                    {quickActions.map((action) => (
                      <button
                        key={action}
                        onClick={() => {
                          setInput(action);
                          setTimeout(handleSend, 100);
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-xs text-slate-700 transition-colors border border-slate-200 font-semibold"
                      >
                        {action}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {copilotMessages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm ${
                    msg.role === 'user' 
                      ? 'bg-blue-50 border border-blue-100' 
                      : 'bg-gradient-to-br from-violet-500 to-purple-600'
                  }`}>
                    {msg.role === 'user' ? (
                      <User className="w-3.5 h-3.5 text-blue-600" />
                    ) : (
                      <Bot className="w-3.5 h-3.5 text-white" />
                    )}
                  </div>
                  <div className={`max-w-[280px] rounded-xl px-3 py-2.5 text-xs leading-relaxed shadow-sm font-medium ${
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white border border-blue-700 rounded-tr-sm'
                      : 'bg-white text-slate-700 border border-slate-200 rounded-tl-sm'
                  }`}>
                    <div className="whitespace-pre-wrap">{msg.content}</div>
                    <p className={`text-[9px] mt-1 ${msg.role === 'user' ? 'text-blue-200' : 'text-slate-400'}`}>
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </motion.div>
              ))}

              {isTyping && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex gap-2.5"
                >
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                    <Bot className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div className="bg-slate-50 rounded-xl rounded-tl-sm px-4 py-3 border border-slate-200 shadow-sm">
                    <div className="flex gap-1">
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          className="w-1.5 h-1.5 rounded-full bg-purple-400"
                          animate={{ opacity: [0.3, 1, 0.3] }}
                          transition={{ duration: 1, delay: i * 0.2, repeat: Infinity }}
                        />
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-3 border-t border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-2 bg-white rounded-xl px-3 py-2 border border-slate-200 focus-within:border-blue-300 focus-within:ring-2 focus-within:ring-blue-100 transition-all shadow-sm">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask about your data..."
                  className="flex-1 bg-transparent text-sm text-slate-800 placeholder:text-slate-400 font-medium outline-none"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim()}
                  className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white disabled:opacity-30 hover:shadow-lg hover:shadow-purple-500/30 transition-all"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
