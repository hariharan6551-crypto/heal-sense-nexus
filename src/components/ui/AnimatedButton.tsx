import { ReactNode } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';

interface AnimatedButtonProps extends HTMLMotionProps<"button"> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'glow';
  className?: string;
}

export function AnimatedButton({ children, variant = 'primary', className, ...props }: AnimatedButtonProps) {
  const variants = {
    primary: 'bg-primary text-white hover:bg-primary/90 border border-transparent',
    secondary: 'bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] text-white hover:bg-[rgba(255,255,255,0.1)]',
    glow: 'bg-gradient-to-r from-blue-500 to-violet-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.5)] border border-blue-400/30'
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={cn(
        "px-4 py-2 rounded-xl font-medium transition-colors relative overflow-hidden flex items-center justify-center gap-2",
        variants[variant],
        className
      )}
      {...props}
    >
      {/* Light sweep effect */}
      <motion.div 
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 -translate-x-full"
        whileHover={{ translateX: '200%' }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      />
      <span className="relative z-10 flex items-center gap-2">{children}</span>
    </motion.button>
  );
}
