import { motion, HTMLMotionProps } from 'framer-motion';
import { ReactNode } from 'react';

interface GlassCardProps extends HTMLMotionProps<"div"> {
  children: ReactNode;
  className?: string;
  glowColor?: 'blue' | 'cyan' | 'none';
  interactive?: boolean;
}

export default function GlassCard({ children, className = '', glowColor = 'none', interactive = false, ...props }: GlassCardProps) {
  const glowClass = glowColor === 'blue' ? 'shadow-[0_4px_30px_rgba(59,130,246,0.1)] hover:shadow-[0_8px_40px_rgba(59,130,246,0.2)]'
    : glowColor === 'cyan' ? 'shadow-[0_4px_30px_rgba(56,189,248,0.1)] hover:shadow-[0_8px_40px_rgba(56,189,248,0.2)]' 
    : '';
    
  return (
    <motion.div
      className={`relative overflow-hidden rounded-2xl bg-white/70 backdrop-blur-[30px] border border-white/80 shadow-sm transition-all duration-300 ${glowClass} ${className}`}
      whileHover={interactive ? { y: -4, scale: 1.01 } : {}}
      {...props}
    >
      {/* Edge Highlight (Top light reflection) */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white to-transparent opacity-80" />
      
      {/* Subtle Gradient Mesh Background */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-[#F8FBFF]/30 to-[#DCEEFF]/10" />
      
      {/* Light Shimmer on Hover */}
      {interactive && (
        <motion.div 
          className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/40 to-transparent -translate-x-[150%] skew-x-[-30deg]"
          whileHover={{ translateX: '150%' }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
        />
      )}
      
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}
