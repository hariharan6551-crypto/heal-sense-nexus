import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, X, Download, Sparkles, MessageSquare,
  BarChart3, FileSpreadsheet,
} from 'lucide-react';

interface Props {
  onExportCSV?: () => void;
  onOpenAI?: () => void;
  onScrollTop?: () => void;
}

export default function FloatingActionButton({ onExportCSV, onOpenAI, onScrollTop }: Props) {
  const [expanded, setExpanded] = useState(false);

  const actions = [
    {
      icon: Sparkles,
      label: 'Engage AI',
      gradient: 'linear-gradient(135deg, #8B5CF6, #6366F1)',
      shadow: '0 4px 16px rgba(139,92,246,0.3)',
      onClick: onOpenAI,
    },
    {
      icon: FileSpreadsheet,
      label: 'Extract Data',
      gradient: 'linear-gradient(135deg, #22C55E, #10B981)',
      shadow: '0 4px 16px rgba(34,197,94,0.3)',
      onClick: onExportCSV,
    },
    {
      icon: BarChart3,
      label: 'Top Navigation',
      gradient: 'linear-gradient(135deg, #3B82F6, #0EA5E9)',
      shadow: '0 4px 16px rgba(59,130,246,0.3)',
      onClick: onScrollTop,
    },
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {/* Action buttons */}
      <AnimatePresence>
        {expanded && (
          <>
            {/* Backdrop blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/5 backdrop-blur-[2px]"
              onClick={() => setExpanded(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="flex flex-col gap-3 mb-2 relative z-10"
            >
              {actions.map((action, i) => (
                <motion.button
                  key={i}
                  initial={{ opacity: 0, x: 20, scale: 0.8 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: 20, scale: 0.8 }}
                  transition={{ delay: i * 0.06, type: 'spring', stiffness: 300 }}
                  whileHover={{ scale: 1.05, x: -4 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => { action.onClick?.(); setExpanded(false); }}
                  className="flex items-center gap-2.5 px-5 py-3 rounded-full text-white text-xs font-bold tracking-wide backdrop-blur-sm"
                  style={{
                    background: action.gradient,
                    boxShadow: action.shadow,
                  }}
                >
                  <action.icon className="h-4 w-4" />
                  {action.label}
                </motion.button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main FAB — Premium glassmorphism */}
      <motion.button
        onClick={() => setExpanded(!expanded)}
        whileHover={{ scale: 1.12 }}
        whileTap={{ scale: 0.92 }}
        animate={{
          rotate: expanded ? 45 : 0,
        }}
        className="w-14 h-14 rounded-full text-white flex items-center justify-center transition-all duration-300 relative z-10"
        style={{
          background: expanded
            ? 'linear-gradient(135deg, #EF4444, #EC4899)'
            : 'linear-gradient(135deg, #3B82F6, #8B5CF6)',
          boxShadow: expanded
            ? '0 8px 30px rgba(239,68,68,0.35), 0 0 0 4px rgba(239,68,68,0.1)'
            : '0 8px 30px rgba(59,130,246,0.35), 0 0 0 4px rgba(59,130,246,0.1)',
        }}
      >
        {/* Pulse ring */}
        {!expanded && (
          <motion.div
            className="absolute inset-0 rounded-full"
            animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0, 0.3] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            style={{ background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)' }}
          />
        )}
        {expanded ? (
          <X className="h-6 w-6 relative z-10" />
        ) : (
          <Plus className="h-6 w-6 relative z-10" />
        )}
      </motion.button>
    </div>
  );
}
