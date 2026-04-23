import { motion, HTMLMotionProps } from 'framer-motion';
import { ReactNode, forwardRef, memo, CSSProperties } from 'react';

interface GlassCardProps extends HTMLMotionProps<"div"> {
  children: ReactNode;
  className?: string;
  glowColor?: 'blue' | 'cyan' | 'none';
  interactive?: boolean;
}

// Memoized to prevent re-renders when parent state changes but card props don't
const GlassCard = memo(function GlassCard({ children, className = '', glowColor = 'none', interactive = false, ...props }: GlassCardProps) {
  const glowClass = glowColor === 'blue' ? 'shadow-[0_4px_30px_rgba(59,130,246,0.1)] hover:shadow-[0_8px_40px_rgba(59,130,246,0.2)]'
    : glowColor === 'cyan' ? 'shadow-[0_4px_30px_rgba(56,189,248,0.1)] hover:shadow-[0_8px_40px_rgba(56,189,248,0.2)]' 
    : '';

  const baseClass = `relative overflow-hidden rounded-2xl bg-white/70 backdrop-blur-[30px] border border-white/80 shadow-sm transition-all duration-300 ${glowClass} ${className}`;

  const innerContent = (
    <>
      {/* Edge Highlight (Top light reflection) */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white to-transparent opacity-80" />
      
      {/* Subtle Gradient Mesh Background */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-[#F8FBFF]/30 to-[#DCEEFF]/10" />
      
      <div className="relative z-10">{children}</div>
    </>
  );

  if (!interactive) {
    return (
      <div className={baseClass} style={props.style as CSSProperties}>
        {innerContent}
      </div>
    );
  }

  // Only use motion.div for interactive cards that need hover animations
  return (
    <motion.div
      className={baseClass}
      whileHover={{ y: -4, scale: 1.01 }}
      {...props}
    >
      {innerContent}
      {/* Light Shimmer on Hover — only for interactive cards */}
      <motion.div 
        className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/40 to-transparent -translate-x-[150%] skew-x-[-30deg]"
        whileHover={{ translateX: '150%' }}
        transition={{ duration: 0.8, ease: "easeInOut" }}
      />
    </motion.div>
  );
});

export default GlassCard;

