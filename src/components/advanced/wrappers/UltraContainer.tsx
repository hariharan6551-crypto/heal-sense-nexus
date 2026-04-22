// ============================================================================
// UltraContainer — The Root Enhancement Wrapper (VIBRANT LIGHT MODE)
// Wraps the ENTIRE existing dashboard with colorful background effects
// NON-DESTRUCTIVE: Children render untouched
// ============================================================================
import { ReactNode, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useAdvancedStore } from '@/stores/advancedStore';

interface Props {
  children: ReactNode;
}

export default function UltraContainer({ children }: Props) {
  const { particlesEnabled } = useAdvancedStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const particlesRef = useRef<{ x: number; y: number; vx: number; vy: number; size: number; alpha: number; color: string }[]>([]);

  // Throttled cursor tracking (30fps instead of every pixel move)
  useEffect(() => {
    let ticking = false;
    const handleMouse = (e: MouseEvent) => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(() => {
          mouseRef.current = { x: e.clientX, y: e.clientY };
          ticking = false;
        });
      }
    };
    window.addEventListener('mousemove', handleMouse, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouse);
  }, []);

  // Optimized particle system — reduced count, spatial culling for connections
  useEffect(() => {
    if (!particlesEnabled || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animId: number;
    const COLORS = ['#EF4444', '#EAB308', '#3B82F6', '#22C55E', '#8B5CF6', '#EC4899'];
    const PARTICLE_COUNT = 25; // Reduced from 35 for smoother performance
    const CONNECTION_DIST = 100; // Reduced from 120
    const CONNECTION_DIST_SQ = CONNECTION_DIST * CONNECTION_DIST; // Pre-compute for fast distance check
    let frameCount = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize, { passive: true });

    // Initialize particles
    if (particlesRef.current.length === 0) {
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        particlesRef.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.2,
          vy: (Math.random() - 0.5) * 0.2,
          size: Math.random() * 2.5 + 0.5,
          alpha: Math.random() * 0.12 + 0.04,
          color: COLORS[Math.floor(Math.random() * COLORS.length)],
        });
      }
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      frameCount++;

      const particles = particlesRef.current;
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      // Draw connections only every 2nd frame for performance
      const drawConnections = frameCount % 2 === 0;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Mouse attraction
        const dx = mx - p.x;
        const dy = my - p.y;
        const distSq = dx * dx + dy * dy;
        if (distSq < 90000) { // 300²
          const dist = Math.sqrt(distSq);
          p.vx += (dx / dist) * 0.006;
          p.vy += (dy / dist) * 0.006;
        }

        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.99;
        p.vy *= 0.99;

        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        // Draw particle
        ctx.globalAlpha = p.alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();

        // Draw connections (optimized with squared distance check)
        if (drawConnections) {
          for (let j = i + 1; j < particles.length; j++) {
            const p2 = particles[j];
            const cdx = p.x - p2.x;
            const cdy = p.y - p2.y;
            const cdSq = cdx * cdx + cdy * cdy;
            if (cdSq < CONNECTION_DIST_SQ) {
              const cd = Math.sqrt(cdSq);
              ctx.beginPath();
              ctx.moveTo(p.x, p.y);
              ctx.lineTo(p2.x, p2.y);
              ctx.globalAlpha = 0.03 * (1 - cd / CONNECTION_DIST);
              ctx.strokeStyle = p.color;
              ctx.lineWidth = 0.5;
              ctx.stroke();
            }
          }
        }
      }
      ctx.globalAlpha = 1;

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
      {/* Particle canvas */}
      {particlesEnabled && (
        <canvas
          ref={canvasRef}
          className="advanced-particle-canvas"
        />
      )}

      {/* Dashboard content renders untouched */}
      <motion.div
        layoutId="cinematic-morph-container"
        initial={{ opacity: 0, scale: 0.95, filter: 'blur(10px)', z: -50 }}
        animate={{ opacity: 1, scale: 1, filter: 'blur(0px)', z: 0 }}
        transition={{ layout: { type: "spring", bounce: 0, duration: 1.2 }, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="advanced-content-layer relative z-10 w-full min-h-screen bg-transparent"
        style={{ transformStyle: 'preserve-3d' }}
      >
        {children}
      </motion.div>
    </div>
  );
}

