import LoginForm from '@/components/auth/LoginForm';
import { Navigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import MorphContainer from '@/components/core/MorphContainer';

/* ───── Light Theme Sky Blue Particle System (Ultra-Optimized) ───── */
function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animationId: number;
    let lastTime = 0;
    const TARGET_INTERVAL = 1000 / 30; // Cap at 30fps
    const COLORS = ['#3B82F6', '#38BDF8', '#60A5FA', '#93C5FD', '#FFFFFF'];
    const PARTICLE_COUNT = 25;
    const particles: { x: number; y: number; vx: number; vy: number; size: number; opacity: number; color: string }[] = [];

    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener('resize', resize, { passive: true });

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push({
        x: Math.random() * canvas.width, y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.3,
        size: Math.random() * 3.5 + 1.5, opacity: Math.random() * 0.35 + 0.1,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
      });
    }

    const draw = (now: number) => {
      animationId = requestAnimationFrame(draw);
      if (now - lastTime < TARGET_INTERVAL) return;
      lastTime = now;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const w = canvas.width, h = canvas.height;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = w; if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h; if (p.y > h) p.y = 0;
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, 6.2832);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    };
    animationId = requestAnimationFrame(draw);

    return () => { cancelAnimationFrame(animationId); window.removeEventListener('resize', resize); };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 z-0 pointer-events-none" style={{ opacity: 0.7 }} />;
}

export default function Login() {
  const isAuthenticated = sessionStorage.getItem('isAuthenticated') === 'true';
  const [isMorphing, setIsMorphing] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (isAuthenticated && !isMorphing) {
    return <Navigate to="/" replace />;
  }

  return (
    <motion.div
      className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, #F8FBFF 0%, #EAF3FF 50%, #DCEEFF 100%)',
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.8 } }}
    >
      {/* Light soft rays mapping to center */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_center,transparent_0%,#EAF3FF_100%)] pointer-events-none opacity-50" />
      
      <ParticleField />

      {/* Cinematic Login Panel wrapped in MorphContainer */}
      <MorphContainer
        id="cinematic-morph-container"
        className="z-10 w-full max-w-[440px] origin-center"
        initial={{ opacity: 0, y: 40, filter: 'blur(10px)', perspective: 1400 }}
        animate={
          isMorphing
            ? {
                opacity: 0,
                scale: 1.2,
                filter: 'blur(20px)',
                z: 200,
                rotateX: 10,
                rotateY: 0, // Stop Rotation
              }
            : mounted
            ? { opacity: 1, y: 0, filter: 'blur(0px)', z: 0 }
            : { opacity: 0, y: 40, filter: 'blur(10px)' }
        }
        transition={{
          layout: { type: 'spring', bounce: 0, duration: 1.2 },
          duration: isMorphing ? 1.0 : 0.8,
          ease: [0.22, 1, 0.36, 1],
          delay: isMorphing ? 0 : 0.2,
        }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* One-time 3D entrance rotation (no infinite loop) */}
        <motion.div
          initial={{ rotateY: 180 }}
          animate={isMorphing ? { rotateY: 0 } : { rotateY: 0 }}
          transition={{
            duration: 1.2,
            ease: [0.22, 1, 0.36, 1] // Apple-like ease out
          }}
          style={{ transformStyle: 'preserve-3d' }}
          className="w-full"
        >
          {/* Add continuous Y float animation */}
          <motion.div
            animate={isMorphing ? { y: 0 } : { y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: isMorphing ? 0 : Infinity, ease: "easeInOut" }}
          >
            <LoginForm onMorphStart={() => setIsMorphing(true)} />
          </motion.div>
        </motion.div>
      </MorphContainer>

      <motion.div
        className="z-10 mt-10 text-center"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: isMorphing ? 0 : mounted ? 0.6 : 0, y: isMorphing ? -20 : 0 }}
        transition={{ duration: 0.5, delay: isMorphing ? 0 : 1.2 }}
      >
        <p className="text-[10px] font-semibold tracking-[0.25em] uppercase text-blue-600">
          Enterprise Analytics Suite v3.0 — Secure Portal
        </p>
      </motion.div>
    </motion.div>
  );
}
