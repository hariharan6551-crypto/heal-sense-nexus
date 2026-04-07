// ============================================================================
// UltraContainer — The Root Enhancement Wrapper (LIGHT MODE)
// Wraps the ENTIRE existing dashboard with subtle background effects
// NON-DESTRUCTIVE: Children render untouched
// ============================================================================
import { ReactNode, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAdvancedStore } from '@/stores/advancedStore';

interface Props {
  children: ReactNode;
}

export default function UltraContainer({ children }: Props) {
  const { particlesEnabled } = useAdvancedStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const particlesRef = useRef<{ x: number; y: number; vx: number; vy: number; size: number; alpha: number; hue: number }[]>([]);

  // Cursor-reactive gradient overlay
  useEffect(() => {
    const handleMouse = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener('mousemove', handleMouse);
    return () => window.removeEventListener('mousemove', handleMouse);
  }, []);

  // Particle system — subtle light-mode particles
  useEffect(() => {
    if (!particlesEnabled || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Initialize particles with light-friendly colors
    if (particlesRef.current.length === 0) {
      for (let i = 0; i < 40; i++) {
        particlesRef.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.2,
          vy: (Math.random() - 0.5) * 0.2,
          size: Math.random() * 2 + 0.5,
          alpha: Math.random() * 0.15 + 0.05,
          hue: 220 + Math.random() * 40,
        });
      }
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particlesRef.current.forEach((p, i) => {
        const dx = mouseRef.current.x - p.x;
        const dy = mouseRef.current.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 300) {
          p.vx += (dx / dist) * 0.008;
          p.vy += (dy / dist) * 0.008;
        }

        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.99;
        p.vy *= 0.99;

        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 50%, 55%, ${p.alpha})`;
        ctx.fill();

        for (let j = i + 1; j < particlesRef.current.length; j++) {
          const p2 = particlesRef.current[j];
          const d = Math.sqrt((p.x - p2.x) ** 2 + (p.y - p2.y) ** 2);
          if (d < 120) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `hsla(${p.hue}, 40%, 55%, ${0.04 * (1 - d / 120)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      });

      animId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, [particlesEnabled]);

  return (
    <div className="advanced-ultra-container advanced-light">
      {/* Ambient glow that follows cursor — subtle warm tint */}
      <div
        className="advanced-cursor-glow"
        style={{
          background: `radial-gradient(600px circle at ${mouseRef.current.x}px ${mouseRef.current.y}px, rgba(99, 102, 241, 0.03), transparent 40%)`,
        }}
      />

      {/* Particle canvas */}
      {particlesEnabled && (
        <canvas
          ref={canvasRef}
          className="advanced-particle-canvas"
        />
      )}

      {/* Existing dashboard renders untouched */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="advanced-content-layer"
      >
        {children}
      </motion.div>
    </div>
  );
}
