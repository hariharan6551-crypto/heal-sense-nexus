import { ReactNode } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';

interface GlassCardProps extends HTMLMotionProps<"div"> {
  children: ReactNode;
  className?: string;
  glowColor?: 'blue' | 'violet' | 'teal' | 'pink' | 'none';
  interactive?: boolean;
}

export function GlassCard({ children, className, glowColor = 'none', interactive = false, ...props }: GlassCardProps) {
  const glowClasses = {
    blue: 'hover:shadow-[0_0_20px_rgba(59,130,246,0.4)]',
    violet: 'hover:shadow-[0_0_20px_rgba(139,92,246,0.4)]',
    teal: 'hover:shadow-[0_0_20px_rgba(20,184,166,0.4)]',
    pink: 'hover:shadow-[0_0_20px_rgba(236,72,153,0.4)]',
    none: ''
  };

  return (
    <motion.div
      whileHover={interactive ? { scale: 1.02, rotateX: 2, y: -2 } : {}}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={cn(
        "bg-[rgba(255,255,255,0.03)] backdrop-blur-[20px] border border-[rgba(255,255,255,0.08)] rounded-2xl relative overflow-hidden",
        interactive && glowClasses[glowColor],
        interactive && "cursor-pointer transition-shadow",
        className
      )}
      {...props}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
      <div className="relative z-10 h-full w-full">
        {children}
      </div>
    </motion.div>
  );
}
