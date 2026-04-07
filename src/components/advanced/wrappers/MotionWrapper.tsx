// ============================================================================
// MotionWrapper — Framer Motion Animation Wrapper
// NON-DESTRUCTIVE: Pure animation wrapper for any child
// ============================================================================
import { ReactNode } from 'react';
import { motion, type Variants, AnimatePresence } from 'framer-motion';

type AnimationType = 'fadeUp' | 'fadeDown' | 'fadeLeft' | 'fadeRight' | 'scale' | 'blur' | 'slideBlur' | 'stagger';

interface Props {
  children: ReactNode;
  animation?: AnimationType;
  delay?: number;
  duration?: number;
  className?: string;
  staggerIndex?: number;
  show?: boolean;
}

const animations: Record<AnimationType, Variants> = {
  fadeUp: {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -12 },
  },
  fadeDown: {
    hidden: { opacity: 0, y: -24 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 12 },
  },
  fadeLeft: {
    hidden: { opacity: 0, x: -24 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 24 },
  },
  fadeRight: {
    hidden: { opacity: 0, x: 24 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -24 },
  },
  scale: {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
  },
  blur: {
    hidden: { opacity: 0, filter: 'blur(10px)' },
    visible: { opacity: 1, filter: 'blur(0px)' },
    exit: { opacity: 0, filter: 'blur(6px)' },
  },
  slideBlur: {
    hidden: { opacity: 0, y: 16, filter: 'blur(8px)' },
    visible: { opacity: 1, y: 0, filter: 'blur(0px)' },
    exit: { opacity: 0, y: -8, filter: 'blur(4px)' },
  },
  stagger: {
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0 },
  },
};

export default function MotionWrapper({
  children,
  animation = 'fadeUp',
  delay = 0,
  duration = 0.5,
  className = '',
  staggerIndex = 0,
  show = true,
}: Props) {
  const computedDelay = delay + staggerIndex * 0.08;

  return (
    <AnimatePresence mode="wait">
      {show && (
        <motion.div
          key="motion-wrapper"
          variants={animations[animation]}
          initial="hidden"
          animate="visible"
          exit="exit"
          transition={{
            duration,
            delay: computedDelay,
            ease: [0.22, 1, 0.36, 1],
          }}
          className={className}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
