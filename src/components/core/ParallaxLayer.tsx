import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { ReactNode, MouseEvent, useRef, useCallback } from 'react';

export default function ParallaxLayer({ children, intensity = 10, className = '' }: { children: ReactNode, intensity?: number, className?: string }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const lastUpdate = useRef(0);

  const mouseXSpring = useSpring(x, { stiffness: 100, damping: 30 });
  const mouseYSpring = useSpring(y, { stiffness: 100, damping: 30 });

  // Subtle Parallax Tilt for Dashboard based on mouse coordinates relative to container center
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], [intensity, -intensity]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], [-intensity, intensity]);

  // Throttled to ~30fps to reduce CPU overhead with many ParallaxLayer instances
  const handleMouseMove = useCallback((e: MouseEvent<HTMLDivElement>) => {
    const now = performance.now();
    if (now - lastUpdate.current < 32) return; // ~30fps throttle
    lastUpdate.current = now;

    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    
    // Normalize coordinates to -0.5 .. 0.5
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    
    x.set(xPct);
    y.set(yPct);
  }, [x, y]);

  const handleMouseLeave = useCallback(() => {
    x.set(0);
    y.set(0);
  }, [x, y]);

  return (
    <div 
      className={`perspective-[1400px] ${className}`}
      onMouseMove={handleMouseMove} 
      onMouseLeave={handleMouseLeave}
    >
      <motion.div style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}>
        {/* Adds 3D depth by translating children forward */}
        <motion.div style={{ transform: "translateZ(20px)" }}>
          {children}
        </motion.div>
      </motion.div>
    </div>
  );
}

