import LoginForm from '@/components/auth/LoginForm';
import { Navigate } from 'react-router-dom';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Login() {
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true' || sessionStorage.getItem('isAuthenticated') === 'true';
  const [isMorphing, setIsMorphing] = useState(false);

  if (isAuthenticated && !isMorphing) {
    return <Navigate to="/" replace />;
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #f0f4f8 0%, #e8eef5 30%, #f5f7fa 60%, #eef2f7 100%)',
      }}
    >
      {/* Subtle animated mesh background */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          backgroundImage:
            'radial-gradient(circle at 20% 50%, rgba(99,102,241,0.06) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(6,182,212,0.05) 0%, transparent 50%), radial-gradient(circle at 50% 80%, rgba(139,92,246,0.04) 0%, transparent 50%)',
        }}
      />

      {/* Floating soft orbs */}
      <div
        className="pointer-events-none absolute z-0"
        style={{
          top: '10%', left: '5%', width: '400px', height: '400px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)',
          animation: 'orbFloat 15s ease-in-out infinite',
          filter: 'blur(40px)',
        }}
      />
      <div
        className="pointer-events-none absolute z-0"
        style={{
          bottom: '5%', right: '10%', width: '350px', height: '350px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(6,182,212,0.07) 0%, transparent 70%)',
          animation: 'orbFloat 12s ease-in-out infinite reverse',
          filter: 'blur(40px)',
        }}
      />

      {/* Morph overlay — expands to full screen when transitioning */}
      <AnimatePresence>
        {isMorphing && (
          <motion.div
            initial={{ opacity: 0, scale: 0.3, borderRadius: '24px' }}
            animate={{ opacity: 1, scale: 1, borderRadius: '0px' }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-50"
            style={{
              background: 'linear-gradient(135deg, #1e1b4b 0%, #1e3a8a 40%, #0e7490 100%)',
            }}
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}
              className="flex flex-col items-center justify-center h-full gap-4"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                className="w-10 h-10 rounded-full border-3 border-white/20 border-t-white"
                style={{ borderWidth: '3px' }}
              />
              <p className="text-white/80 text-sm font-semibold tracking-wide">Initializing Dashboard…</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Login card */}
      <motion.div
        className="z-10 w-full max-w-md"
        initial={{ opacity: 0, y: 30, scale: 0.96 }}
        animate={isMorphing 
          ? { opacity: 0, y: -50, scale: 1.1 }
          : { opacity: 1, y: 0, scale: 1 }
        }
        transition={{ duration: isMorphing ? 0.4 : 0.7, ease: [0.22, 1, 0.36, 1] }}
      >
        <LoginForm onMorphStart={() => setIsMorphing(true)} />
      </motion.div>

      {/* Bottom footer */}
      <motion.div 
        className="z-10 mt-8 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: isMorphing ? 0 : 1 }}
        transition={{ duration: 0.3 }}
      >
        <p className="text-[10px] text-slate-400 font-medium tracking-wide">
          Enterprise Analytics Suite v3.0 — Secure Portal
        </p>
      </motion.div>
    </div>
  );
}
