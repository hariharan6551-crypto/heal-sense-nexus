// ============================================================================
// NeonBorder — Animated Gradient Glowing Border Wrapper
// NON-DESTRUCTIVE: Pure visual wrapper
// ============================================================================
import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { useAdvancedStore } from '@/stores/advancedStore';

interface Props {
  children: ReactNode;
  className?: string;
  color?: 'blue' | 'cyan' | 'purple' | 'emerald' | 'rainbow';
  intensity?: 'low' | 'medium' | 'high';
  animated?: boolean;
}

const borderGradients: Record<string, string> = {
  blue: 'linear-gradient(135deg, #3b82f6, #1d4ed8, #60a5fa, #3b82f6)',
  cyan: 'linear-gradient(135deg, #06b6d4, #0891b2, #67e8f9, #06b6d4)',
  purple: 'linear-gradient(135deg, #8b5cf6, #7c3aed, #a78bfa, #8b5cf6)',
  emerald: 'linear-gradient(135deg, #10b981, #059669, #6ee7b7, #10b981)',
  rainbow: 'linear-gradient(135deg, #f43f5e, #8b5cf6, #3b82f6, #06b6d4, #10b981, #f59e0b, #f43f5e)',
};

const intensityMap: Record<string, { blur: string; opacity: number; borderWidth: number }> = {
  low: { blur: '8px', opacity: 0.3, borderWidth: 1 },
  medium: { blur: '16px', opacity: 0.5, borderWidth: 1.5 },
  high: { blur: '24px', opacity: 0.7, borderWidth: 2 },
};

export default function NeonBorder({
  children,
  className = '',
  color = 'cyan',
  intensity = 'medium',
  animated = true,
}: Props) {
  const { theme } = useAdvancedStore();
  const config = intensityMap[intensity];
  const gradient = borderGradients[color];

  // Show glow in all themes (subtle in light)
  const showGlow = true;
  const isLight = theme === 'light';
  const glowOpacity = isLight ? config.opacity * 0.3 : config.opacity;

  return (
    <motion.div
      className={`advanced-neon-border-wrapper ${className}`}
      style={{ position: 'relative' }}
      whileHover={animated ? { scale: 1.002 } : undefined}
    >
      {/* Animated gradient border */}
      {showGlow && (
        <div
          className={`advanced-neon-glow ${animated ? 'advanced-neon-animated' : ''}`}
          style={{
            background: gradient,
            backgroundSize: '300% 300%',
            filter: `blur(${config.blur})`,
            opacity: glowOpacity,
          }}
        />
      )}
      <div
        className="advanced-neon-border-inner"
        style={{
          borderWidth: showGlow ? config.borderWidth : 1,
          borderStyle: 'solid',
          borderImage: showGlow ? `${gradient} 1` : undefined,
          borderColor: showGlow ? undefined : 'rgba(148, 163, 184, 0.2)',
        }}
      >
        {children}
      </div>
    </motion.div>
  );
}
