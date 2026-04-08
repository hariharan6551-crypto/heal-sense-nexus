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
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="flex flex-col gap-3 mb-2"
          >
            {actions.map((action, i) => (
              <motion.button
                key={i}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: i * 0.06 }}
                whileHover={{ scale: 1.05, x: -4 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => { action.onClick?.(); setExpanded(false); }}
                className="flex items-center gap-2.5 px-4 py-2.5 rounded-full text-white text-xs font-bold tracking-wide"
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
        )}
      </AnimatePresence>

      {/* Main FAB — Vibrant gradient */}
      <motion.button
        onClick={() => setExpanded(!expanded)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.92 }}
        animate={{
          rotate: expanded ? 45 : 0,
        }}
        className="w-14 h-14 rounded-full text-white flex items-center justify-center transition-all duration-300"
        style={{
          background: expanded
            ? 'linear-gradient(135deg, #EF4444, #EC4899)'
            : 'linear-gradient(135deg, #3B82F6, #8B5CF6)',
          boxShadow: expanded
            ? '0 8px 30px rgba(239,68,68,0.35)'
            : '0 8px 30px rgba(59,130,246,0.35)',
        }}
      >
        {expanded ? (
          <X className="h-6 w-6" />
        ) : (
          <Plus className="h-6 w-6" />
        )}
      </motion.button>
    </div>
  );
}
