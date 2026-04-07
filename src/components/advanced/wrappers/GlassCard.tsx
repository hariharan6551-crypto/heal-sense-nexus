// ============================================================================
// GlassCard — Glassmorphism Wrapper Component
// Wraps any content in a premium glass-effect container
// NON-DESTRUCTIVE: Pure visual wrapper
// ============================================================================
import { ReactNode } from 'react';
import { motion, type Variants } from 'framer-motion';
import { useAdvancedStore } from '@/stores/advancedStore';

interface Props {
  children: ReactNode;
  className?: string;
  animate?: boolean;
  delay?: number;
  glow?: 'blue' | 'cyan' | 'purple' | 'emerald' | 'orange' | 'none';
  onClick?: () => void;
  hoverable?: boolean;
}

const glowColors: Record<string, string> = {
  blue: 'rgba(59, 130, 246, 0.15)',
  cyan: 'rgba(6, 182, 212, 0.15)',
  purple: 'rgba(139, 92, 246, 0.15)',
  emerald: 'rgba(16, 185, 129, 0.15)',
  orange: 'rgba(245, 158, 11, 0.15)',
  none: 'transparent',
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 20, scale: 0.97 },
  visible: { opacity: 1, y: 0, scale: 1 },
};

export default function GlassCard({
  children,
  className = '',
  animate = true,
  delay = 0,
  glow = 'none',
  onClick,
  hoverable = true,
}: Props) {
  const { theme } = useAdvancedStore();

  const isNeon = theme === 'neon';
  const isDark = theme === 'dark' || theme === 'neon';

  return (
    <motion.div
      variants={animate ? cardVariants : undefined}
      initial={animate ? 'hidden' : undefined}
      animate={animate ? 'visible' : undefined}
      transition={{
        duration: 0.5,
        delay,
        ease: [0.22, 1, 0.36, 1],
      }}
      whileHover={
        hoverable
          ? {
              y: -3,
              scale: 1.005,
              transition: { duration: 0.25, ease: 'easeOut' },
            }
          : undefined
      }
      onClick={onClick}
      className={`advanced-glass-card ${isDark ? 'advanced-glass-dark' : 'advanced-glass-light'} ${
        isNeon ? 'advanced-glass-neon' : ''
      } ${onClick ? 'cursor-pointer' : ''} ${className}`}
      style={{
        boxShadow: glow !== 'none' ? `0 0 40px ${glowColors[glow]}, 0 4px 20px rgba(0,0,0,0.1)` : undefined,
      }}
    >
      {/* Inner glow gradient */}
      <div className="advanced-glass-inner-glow" />
      <div className="relative z-[1]">{children}</div>
    </motion.div>
  );
}
