// ============================================================================
// BootScreen — Premium Light-Mode Loading Sequence
// CINEMATIC ADD-ON: Plays on first load, then reveals the dashboard
// ============================================================================
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';

interface Props {
  onComplete: () => void;
  skipDelay?: number;
}

const BOOT_STEPS = [
  { label: 'Initializing ADVANCED Core Engine', duration: 400 },
  { label: 'Loading AI Prediction Models', duration: 500 },
  { label: 'Connecting to Data Pipeline', duration: 350 },
  { label: 'Calibrating Anomaly Detection', duration: 450 },
  { label: 'Rendering Visual Layer', duration: 300 },
  { label: 'System Online', duration: 200 },
];

export default function BootScreen({ onComplete }: Props) {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [showSkip, setShowSkip] = useState(false);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShowSkip(true), 800);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const totalDuration = BOOT_STEPS.reduce((s, step) => s + step.duration, 0);
    let elapsed = 0;
    let stepIdx = 0;

    const interval = setInterval(() => {
      elapsed += 50;
      const pct = Math.min((elapsed / totalDuration) * 100, 100);
      setProgress(pct);

      let acc = 0;
      for (let i = 0; i < BOOT_STEPS.length; i++) {
        acc += BOOT_STEPS[i].duration;
        if (elapsed < acc) {
          if (i !== stepIdx) {
            stepIdx = i;
            setCurrentStep(i);
          }
          break;
        }
      }

      if (pct >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          setExiting(true);
          setTimeout(onComplete, 600);
        }, 300);
      }
    }, 50);

    return () => clearInterval(interval);
  }, [onComplete]);

  const handleSkip = () => {
    setExiting(true);
    setTimeout(onComplete, 400);
  };

  return (
    <AnimatePresence>
      {!exiting && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #eef2ff 40%, #f0fdf4 70%, #faf5ff 100%)' }}
        >
          {/* Subtle dot grid */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(circle, rgba(99,102,241,0.06) 1px, transparent 1px)',
              backgroundSize: '32px 32px',
            }}
          />

          {/* Content */}
          <div className="relative z-10 flex flex-col items-center">
            {/* Logo */}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="mb-8"
            >
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-violet-500 via-indigo-500 to-cyan-500 flex items-center justify-center shadow-2xl shadow-violet-500/20 relative">
                <Sparkles className="w-9 h-9 text-white" />
                <motion.div
                  className="absolute inset-0 rounded-3xl border-2 border-violet-300/40"
                  animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </div>
            </motion.div>

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-3xl font-black text-slate-900 tracking-tight mb-1"
              style={{ fontFamily: 'Space Grotesk, sans-serif' }}
            >
              ADVANCED AI
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-xs text-slate-400 uppercase tracking-[0.3em] mb-10"
            >
              Intelligence Operating System
            </motion.p>

            {/* Progress bar */}
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 280 }}
              transition={{ delay: 0.4, duration: 0.4 }}
              className="mb-4"
            >
              <div className="w-[280px] h-1 bg-slate-200 rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-violet-500 via-indigo-500 to-cyan-500"
                  style={{ width: `${progress}%` }}
                  transition={{ duration: 0.1 }}
                />
              </div>
            </motion.div>

            {/* Current step */}
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xs text-slate-500 h-5 flex items-center gap-2"
            >
              <motion.span
                className="w-1.5 h-1.5 rounded-full bg-violet-500"
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 0.8, repeat: Infinity }}
              />
              {BOOT_STEPS[currentStep]?.label}
              <span className="text-slate-300">{Math.round(progress)}%</span>
            </motion.div>

            {/* Step list */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-8 space-y-1"
            >
              {BOOT_STEPS.map((step, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{
                    opacity: i <= currentStep ? 1 : 0.3,
                    x: 0,
                  }}
                  transition={{ delay: 0.6 + i * 0.08 }}
                  className="flex items-center gap-2 text-[10px]"
                >
                  <span className={`w-1 h-1 rounded-full ${
                    i < currentStep ? 'bg-emerald-500' : i === currentStep ? 'bg-violet-500' : 'bg-slate-300'
                  }`} />
                  <span className={
                    i < currentStep ? 'text-emerald-600/70' : i === currentStep ? 'text-slate-800' : 'text-slate-400'
                  }>
                    {step.label}
                  </span>
                  {i < currentStep && <span className="text-emerald-500/60">✓</span>}
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Skip button */}
          <AnimatePresence>
            {showSkip && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={handleSkip}
                className="absolute bottom-8 text-xs text-slate-400 hover:text-slate-600 transition-colors"
              >
                Press to skip →
              </motion.button>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
