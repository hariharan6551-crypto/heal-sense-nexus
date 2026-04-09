import { motion, HTMLMotionProps } from 'framer-motion';
import { ReactNode } from 'react';

interface GlowButtonProps extends HTMLMotionProps<"button"> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'danger';
}

export default function GlowButton({ children, variant = 'primary', className = '', ...props }: GlowButtonProps) {
  const bgColors = {
    primary: 'bg-gradient-to-r from-[#3B82F6] to-[#38BDF8] text-white',
    secondary: 'bg-white/80 text-blue-600 border border-blue-200',
    danger: 'bg-gradient-to-r from-red-500 to-pink-500 text-white',
  };
  
  const glowColors = {
    primary: 'shadow-[0_0_15px_rgba(59,130,246,0.3)] hover:shadow-[0_0_25px_rgba(56,189,248,0.5)]',
    secondary: 'shadow-[0_4px_10px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_20px_rgba(59,130,246,0.15)]',
    danger: 'shadow-[0_0_15px_rgba(239,68,68,0.3)] hover:shadow-[0_0_25px_rgba(236,72,153,0.5)]',
  };

  return (
    <motion.button
      className={`relative px-6 py-3 rounded-xl font-bold tracking-wide transition-all overflow-hidden group ${bgColors[variant]} ${glowColors[variant]} ${className}`}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      {...props}
    >
      <span className="relative z-10">{children}</span>
      {variant !== 'secondary' && (
        <div className="absolute inset-0 pointer-events-none">
          <motion.div
            className="absolute inset-0 bg-white/30"
            initial={{ x: '-100%', skewX: -20 }}
            whileHover={{ x: '100%' }}
            transition={{ duration: 0.6, ease: 'easeInOut' }}
          />
        </div>
      )}
    </motion.button>
  );
}
