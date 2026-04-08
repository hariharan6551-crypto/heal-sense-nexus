import { ReactNode } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';

interface GlassCardProps extends HTMLMotionProps<"div"> {
  children: ReactNode;
  className?: string;
  glowColor?: 'blue' | 'red' | 'green' | 'yellow' | 'violet' | 'none';
  interactive?: boolean;
}

const GLOW_COLORS = {
  blue: 'rgba(59,130,246,0.08)',
  red: 'rgba(239,68,68,0.08)',
  green: 'rgba(34,197,94,0.08)',
  yellow: 'rgba(234,179,8,0.08)',
  violet: 'rgba(139,92,246,0.08)',
  none: 'transparent',
};

export function GlassCard({ children, className, glowColor = 'none', interactive = false, ...props }: GlassCardProps) {
  return (
    <motion.div
      whileHover={interactive ? { scale: 1.02, y: -3 } : {}}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={cn(
        "bg-white rounded-2xl relative overflow-hidden transition-all duration-300",
        interactive && "cursor-pointer hover:shadow-lg",
        className
      )}
      style={{
        border: '1px solid rgba(0, 0, 0, 0.05)',
        boxShadow: '0 2px 12px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.02)',
        ...(props.style || {}),
      }}
      {...props}
    >
      {/* Subtle colored glow overlay */}
      {glowColor !== 'none' && (
        <div
          className="absolute top-0 right-0 w-32 h-32 rounded-bl-full pointer-events-none opacity-60"
          style={{ background: `radial-gradient(circle, ${GLOW_COLORS[glowColor]}, transparent 70%)` }}
        />
      )}
      <div className="relative z-10 h-full w-full">
        {children}
      </div>
    </motion.div>
  );
}
