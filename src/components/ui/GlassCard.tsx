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
  return (
    <motion.div
      whileHover={interactive ? { scale: 1.02, y: -3 } : {}}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={cn(
        "bg-white rounded-2xl border border-slate-100 relative overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300",
        interactive && "cursor-pointer",
        className
      )}
      {...props}
    >
      <div className="relative z-10 h-full w-full">
        {children}
      </div>
    </motion.div>
  );
}
