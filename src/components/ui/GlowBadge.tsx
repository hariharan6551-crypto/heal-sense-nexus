import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface GlowBadgeProps {
  children: ReactNode;
  color?: 'blue' | 'violet' | 'teal' | 'pink' | 'emerald' | 'amber';
  className?: string;
  pulse?: boolean;
}

export function GlowBadge({ children, color = 'blue', className, pulse = false }: GlowBadgeProps) {
  const colorStyles = {
    blue: 'bg-blue-500/10 border-blue-500/30 text-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.2)]',
    violet: 'bg-violet-500/10 border-violet-500/30 text-violet-400 shadow-[0_0_10px_rgba(139,92,246,0.2)]',
    teal: 'bg-teal-500/10 border-teal-500/30 text-teal-400 shadow-[0_0_10px_rgba(20,184,166,0.2)]',
    pink: 'bg-pink-500/10 border-pink-500/30 text-pink-400 shadow-[0_0_10px_rgba(236,72,153,0.2)]',
    emerald: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.2)]',
    amber: 'bg-amber-500/10 border-amber-500/30 text-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.2)]',
  };

  return (
    <div className={cn(
      "px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide uppercase border backdrop-blur-md flex items-center gap-1.5",
      colorStyles[color],
      pulse && "animate-pulse",
      className
    )}>
      {pulse && <span className={cn("w-1.5 h-1.5 rounded-full", `bg-${color}-400`)} />}
      {children}
    </div>
  );
}
