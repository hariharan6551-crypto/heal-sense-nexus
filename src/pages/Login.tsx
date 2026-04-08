import LoginForm from '@/components/auth/LoginForm';
import { Navigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/* ───── Vibrant Particle System (light theme) ───── */
function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    const COLORS = ['#EF4444', '#EAB308', '#3B82F6', '#22C55E', '#8B5CF6', '#EC4899', '#F97316'];
    const particles: { x: number; y: number; vx: number; vy: number; size: number; opacity: number; color: string }[] = [];
    const PARTICLE_COUNT = 60;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        size: Math.random() * 3 + 1,
        opacity: Math.random() * 0.25 + 0.08,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p, i) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color.replace(')', `, ${p.opacity})`).replace('rgb', 'rgba').replace('#', '');
        // Use hex with alpha
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = p.color;
        ctx.fill();
        ctx.globalAlpha = 1;

        // Draw vibrant connections
        for (let j = i + 1; j < particles.length; j++) {
          const dx = p.x - particles[j].x;
          const dy = p.y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 100) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.globalAlpha = 0.04 * (1 - dist / 100);
            ctx.strokeStyle = p.color;
            ctx.lineWidth = 0.5;
            ctx.stroke();
            ctx.globalAlpha = 1;
          }
        }
      });

      animationId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 pointer-events-none"
      style={{ opacity: 0.5 }}
    />
  );
}

/* ───── Vibrant floating orbs ───── */
function VibrantOrbs() {
  const orbs = [
    { color: 'rgba(239,68,68,0.08)', x: '10%', y: '15%', size: 500, dur: 18 },
    { color: 'rgba(59,130,246,0.07)', x: '75%', y: '60%', size: 450, dur: 22 },
    { color: 'rgba(34,197,94,0.06)', x: '50%', y: '80%', size: 400, dur: 16 },
    { color: 'rgba(234,179,8,0.06)', x: '85%', y: '10%', size: 350, dur: 20 },
    { color: 'rgba(139,92,246,0.05)', x: '30%', y: '40%', size: 300, dur: 14 },
  ];

  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      {orbs.map((orb, i) => (
        <motion.div
          key={i}
          animate={{
            x: [0, 40, -30, 0],
            y: [0, -30, 20, 0],
            scale: [1, 1.1, 0.9, 1],
          }}
          transition={{ duration: orb.dur, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute rounded-full"
          style={{
            left: orb.x, top: orb.y,
            width: orb.size, height: orb.size,
            background: `radial-gradient(circle, ${orb.color} 0%, transparent 70%)`,
            filter: 'blur(60px)',
          }}
        />
      ))}
    </div>
  );
}

/* ───── Floating colorful shapes ───── */
function FloatingShapes() {
  const shapes = [
    { type: 'circle', size: 12, x: '15%', y: '20%', color: '#EF4444', dur: 7 },
    { type: 'circle', size: 8, x: '80%', y: '15%', color: '#EAB308', dur: 9 },
    { type: 'circle', size: 10, x: '70%', y: '75%', color: '#3B82F6', dur: 6 },
    { type: 'circle', size: 6, x: '25%', y: '70%', color: '#22C55E', dur: 8 },
    { type: 'ring', size: 50, x: '60%', y: '25%', color: 'rgba(59,130,246,0.15)', dur: 10 },
    { type: 'ring', size: 35, x: '20%', y: '55%', color: 'rgba(239,68,68,0.12)', dur: 12 },
    { type: 'ring', size: 45, x: '85%', y: '45%', color: 'rgba(34,197,94,0.1)', dur: 11 },
  ];

  return (
    <div className="fixed inset-0 z-0 pointer-events-none">
      {shapes.map((s, i) => (
        <motion.div
          key={i}
          animate={{
            y: [0, -15, 10, 0],
            opacity: [0.4, 0.8, 0.4],
            rotate: s.type === 'ring' ? [0, 180, 360] : 0,
            scale: [1, 1.1, 0.95, 1],
          }}
          transition={{
            duration: s.dur,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: i * 0.5,
          }}
          className="absolute"
          style={{ left: s.x, top: s.y }}
        >
          {s.type === 'circle' ? (
            <div
              style={{
                width: s.size, height: s.size,
                borderRadius: '50%',
                background: s.color,
                boxShadow: `0 0 ${s.size * 2}px ${s.color}40`,
              }}
            />
          ) : (
            <div
              style={{
                width: s.size, height: s.size,
                borderRadius: '50%',
                border: `2px solid ${s.color}`,
              }}
            />
          )}
        </motion.div>
      ))}
    </div>
  );
}

export default function Login() {
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true' || sessionStorage.getItem('isAuthenticated') === 'true';
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
        background: 'linear-gradient(135deg, #f0f4ff 0%, #fef7f0 25%, #f0fdf4 50%, #eff6ff 75%, #fdf2f8 100%)',
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.8 } }}
    >
      {/* Subtle grid */}
      <div
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(59,130,246,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(59,130,246,0.03) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
          maskImage: 'radial-gradient(ellipse at center, black 30%, transparent 75%)',
          WebkitMaskImage: 'radial-gradient(ellipse at center, black 30%, transparent 75%)',
        }}
      />

      <ParticleField />
      <VibrantOrbs />
      <FloatingShapes />

      {/* Login card wrapped in Shared Layout Morph Container */}
      <motion.div
        layoutId="cinematic-morph-container"
        className="z-10 w-full max-w-[440px] origin-center"
        initial={{ opacity: 0, y: 40, scale: 0.92, filter: 'blur(10px)', perspective: 1400 }}
        animate={isMorphing
          ? { 
              opacity: 0, 
              scale: 1.2, 
              filter: 'blur(20px)',
              z: 200,
            }
          : mounted
            ? { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)', z: 0 }
            : { opacity: 0, y: 40, scale: 0.92, filter: 'blur(10px)' }
        }
        transition={{
          layout: { type: "spring", bounce: 0, duration: 1.2 },
          duration: isMorphing ? 1.0 : 0.8,
          ease: [0.22, 1, 0.36, 1],
          delay: isMorphing ? 0 : 0.2,
        }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        <LoginForm onMorphStart={() => setIsMorphing(true)} />
      </motion.div>

      {/* Footer */}
      <motion.div
        className="z-10 mt-10 text-center"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: isMorphing ? 0 : mounted ? 0.6 : 0, y: isMorphing ? -20 : 0 }}
        transition={{ duration: 0.5, delay: isMorphing ? 0 : 1.2 }}
      >
        <p className="text-[10px] font-semibold tracking-[0.25em] uppercase text-slate-400">
          Enterprise Analytics Suite v3.0 — Secure Portal
        </p>
      </motion.div>
    </motion.div>
  );
}
