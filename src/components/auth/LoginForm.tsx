import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import {
  Lock, User, ArrowRight, Eye, EyeOff, ShieldCheck,
  Sparkles, Fingerprint, Zap, CheckCircle2, AlertCircle,
} from 'lucide-react';

interface Props {
  onMorphStart?: () => void;
}

/* ───── 3D Animated Blue Border ───── */
function BlueBorder({ children, active }: { children: React.ReactNode; active: boolean }) {
  return (
    <div className="relative rounded-[28px] p-[2px]" style={{ isolation: 'isolate' }}>
      {/* Animated blue/black gradient border */}
      <motion.div
        className="absolute inset-0 rounded-[28px] z-0"
        style={{
          background: active
            ? 'linear-gradient(135deg, #0ea5e9, #2563eb, #1e3a8a, #0ea5e9)'
            : 'linear-gradient(135deg, rgba(59,130,246,0.3), rgba(30,58,138,0.2), rgba(59,130,246,0.3))',
          backgroundSize: '300% 100%',
          animation: active ? 'blueBorder 2s linear infinite' : 'blueBorder 6s linear infinite',
        }}
        animate={{
          boxShadow: active
            ? ['0 0 20px rgba(59,130,246,0.5)', '0 0 40px rgba(14,165,233,0.5)', '0 0 20px rgba(59,130,246,0.5)']
            : '0 0 0px rgba(0,0,0,0)',
        }}
        transition={{ duration: 2, repeat: Infinity }}
      />
      {/* Glow effect */}
      <div
        className="absolute inset-0 rounded-[28px] z-0 transition-opacity duration-500"
        style={{
          filter: 'blur(20px)',
          opacity: active ? 0.6 : 0.1,
          background: 'linear-gradient(135deg, #0ea5e9, #3b82f6, #1e3a8a)',
          backgroundSize: '300% 100%',
          animation: 'blueBorder 3s linear infinite',
        }}
      />
      {/* Card content */}
      <div className="relative z-10 rounded-[26px] overflow-hidden">{children}</div>
      <style>{`
        @keyframes blueBorder {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
    </div>
  );
}

export default function LoginForm({ onMorphStart }: Props) {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ username?: string; password?: string }>({});
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const validate = () => {
    const newErrors: { username?: string; password?: string } = {};
    if (!username.trim()) newErrors.username = 'Username is required';
    if (!password.trim()) newErrors.password = 'Password is required';
    else if (password.length < 3) newErrors.password = 'Password must be at least 3 characters';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 800));

    setLoginSuccess(true);
    localStorage.setItem('isAuthenticated', 'true');
    toast.success('Authentication Successful', {
      description: 'Morphing to Analytics Dashboard…',
      icon: <Zap className="w-4 h-4 text-blue-400" />,
      style: { background: 'rgba(10, 15, 30, 0.9)', color: '#fff', border: '1px solid rgba(59,130,246,0.3)' }
    });

    await new Promise((r) => setTimeout(r, 400));

    if (onMorphStart) {
      onMorphStart();
      setTimeout(() => navigate('/'), 900);
    } else {
      navigate('/');
    }
  };

  const isFormActive = !!focused;

  // 3D Morph Animation Variants
  const containerVars: Variants = {
    hidden: { opacity: 0, rotateX: 10, scale: 0.95 },
    visible: { 
      opacity: 1, 
      rotateX: 0, 
      scale: 1, 
      transition: { 
        duration: 0.8, 
        ease: [0.16, 1, 0.3, 1], 
        staggerChildren: 0.08, 
        delayChildren: 0.1 
      } 
    },
    morphing: {
      scale: 0.9,
      opacity: 0,
      rotateX: -15,
      y: -50,
      filter: 'blur(10px)',
      transition: { duration: 0.6, ease: [0.4, 0, 0.2, 1] }
    }
  };
  
  const itemVars: Variants = {
    hidden: { opacity: 0, y: 30, rotateX: -20, filter: 'blur(8px)', scale: 0.9 },
    visible: { opacity: 1, y: 0, rotateX: 0, filter: 'blur(0px)', scale: 1, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
  };

  return (
    <div className="w-full max-w-[440px]" style={{ perspective: '1200px' }}>
      <BlueBorder active={isFormActive || isLoading}>
        <motion.div
          animate={loginSuccess ? "morphing" : mounted ? 'visible' : 'hidden'}
          initial="hidden"
          variants={containerVars}
          className="rounded-[26px] overflow-hidden relative"
          style={{
            background: 'linear-gradient(180deg, rgba(8, 15, 30, 0.9) 0%, rgba(2, 6, 15, 0.95) 100%)',
            backdropFilter: 'blur(40px) saturate(180%)',
            boxShadow: '0 25px 60px rgba(0,0,0,0.8), inset 0 1px 1px rgba(255,255,255,0.1)',
            transformOrigin: 'bottom center',
          }}
        >
          {/* ── Header section ── */}
          <div className="relative px-8 pt-10 pb-8 text-center overflow-hidden">
            {/* Holographic blue gradient background */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: `
                  radial-gradient(circle at 20% 30%, rgba(59,130,246,0.15) 0%, transparent 50%),
                  radial-gradient(circle at 80% 80%, rgba(14,165,233,0.1) 0%, transparent 50%),
                  radial-gradient(circle at 50% 10%, rgba(30,58,138,0.2) 0%, transparent 60%)
                `,
              }}
            />

            {/* Glowing top scanline */}
            <motion.div
              className="absolute top-0 left-0 right-0 h-[3px]"
              style={{
                background: 'linear-gradient(90deg, transparent, #0ea5e9, #3b82f6, #60a5fa, transparent)',
                backgroundSize: '200% 100%',
              }}
              animate={{ backgroundPosition: ['0% 50%', '200% 50%'] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            />

            {/* Logo with 3D AI rotating core */}
            <motion.div variants={itemVars} className="relative w-20 h-20 mx-auto mb-6" style={{ perspective: '500px' }}>
              {/* Outer 3D ring */}
              <motion.div
                animate={{ rotateX: 360, rotateZ: 360 }}
                transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-0 rounded-full"
                style={{ border: '1px solid rgba(59,130,246,0.3)', transformStyle: 'preserve-3d' }}
              />
              {/* Middle 3D ring */}
              <motion.div
                animate={{ rotateY: 360, rotateX: -360 }}
                transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-2 rounded-full"
                style={{ border: '1px solid rgba(14,165,233,0.4)', transformStyle: 'preserve-3d' }}
              />
              {/* Center icon block */}
              <motion.div
                className="absolute inset-4 rounded-2xl flex items-center justify-center bg-blue-900/40 backdrop-blur-md"
                style={{
                  border: '1px solid rgba(59,130,246,0.5)',
                  boxShadow: '0 0 20px rgba(59,130,246,0.4)',
                }}
                whileHover={{ scale: 1.1, rotateY: 20 }}
              >
                <Fingerprint className="w-6 h-6 text-blue-400 drop-shadow-[0_0_8px_rgba(96,165,250,0.8)]" />
              </motion.div>
            </motion.div>

            {/* AI Core badge */}
            <motion.div variants={itemVars} className="flex items-center justify-center gap-2 mb-3">
              <motion.div
                animate={{ opacity: [0.7, 1, 0.7], boxShadow: ['0 0 5px rgba(59,130,246,0.2)', '0 0 15px rgba(59,130,246,0.6)', '0 0 5px rgba(59,130,246,0.2)'] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10"
                style={{ border: '1px solid rgba(59,130,246,0.3)' }}
              >
                <Sparkles className="w-3 h-3 text-blue-400" />
                <span className="text-[10px] font-bold text-blue-300 tracking-[0.2em] uppercase drop-shadow">
                  AI System Online
                </span>
              </motion.div>
            </motion.div>

            {/* Title */}
            <motion.h2
              variants={itemVars}
              className="text-[26px] font-black tracking-tight text-white mb-1"
              style={{ textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}
            >
              System Access
            </motion.h2>
            <motion.p variants={itemVars} className="text-xs font-medium text-blue-200/60">
              Authenticate to initialize 3D Morph Protocol
            </motion.p>
          </div>

          {/* ── Glowing Divider ── */}
          <div className="mx-8 relative">
            <div
              className="h-[1px]"
              style={{
                background: 'linear-gradient(90deg, transparent, rgba(59,130,246,0.4), rgba(14,165,233,0.6), rgba(59,130,246,0.4), transparent)',
              }}
            />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-[2px] bg-blue-400 blur-sm rounded-full" />
          </div>

          {/* ── Form body ── */}
          <div className="px-8 py-7">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Username field */}
              <motion.div variants={itemVars} className="space-y-2 relative z-20">
                <label htmlFor="login-username" className="text-[10px] font-bold uppercase tracking-[0.15em] text-blue-300/80">
                  Operative ID
                </label>
                <motion.div
                  animate={{
                    borderColor: focused === 'username' ? '#3B82F6' : errors.username ? '#EF4444' : 'rgba(59,130,246,0.2)',
                    boxShadow: focused === 'username'
                      ? '0 0 0 3px rgba(59,130,246,0.15), inset 0 0 10px rgba(59,130,246,0.1)'
                      : errors.username
                        ? '0 0 0 3px rgba(239,68,68,0.15)'
                        : 'inset 0 1px 3px rgba(0,0,0,0.5)',
                  }}
                  transition={{ duration: 0.3 }}
                  className="flex items-center rounded-2xl overflow-hidden relative group"
                  style={{
                    background: 'rgba(10, 15, 30, 0.6)',
                    border: '1.5px solid transparent'
                  }}
                >
                  <motion.span
                    animate={{ color: focused === 'username' ? '#60a5fa' : '#475569' }}
                    className="pl-4 flex-shrink-0"
                  >
                    <User className="w-[18px] h-[18px]" />
                  </motion.span>
                  <input
                    id="login-username"
                    type="text"
                    required
                    value={username}
                    onChange={(e) => { setUsername(e.target.value); if (errors.username) setErrors(prev => ({ ...prev, username: undefined })); }}
                    onFocus={() => setFocused('username')}
                    onBlur={() => setFocused(null)}
                    className="flex-1 px-3 py-4 bg-transparent outline-none text-sm font-medium text-white placeholder:text-slate-600 focus:placeholder:text-slate-500"
                    placeholder="Enter identification"
                    autoComplete="username"
                    aria-label="Username"
                  />
                  <AnimatePresence>
                    {username.length > 0 && !errors.username && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.5, rotate: -90 }}
                        animate={{ opacity: 1, scale: 1, rotate: 0 }}
                        exit={{ opacity: 0, scale: 0.5, rotate: 90 }}
                        className="pr-4"
                      >
                        <CheckCircle2 className="w-4 h-4 text-blue-400" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
                <AnimatePresence>
                  {errors.username && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex items-center gap-1 pl-1"
                    >
                      <AlertCircle className="w-3 h-3 text-red-400" />
                      <p className="text-[10px] text-red-400 font-medium">{errors.username}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Password field */}
              <motion.div variants={itemVars} className="space-y-2 relative z-10">
                <label htmlFor="login-password" className="text-[10px] font-bold uppercase tracking-[0.15em] text-blue-300/80">
                  Access Key
                </label>
                <motion.div
                  animate={{
                    borderColor: focused === 'password' ? '#3B82F6' : errors.password ? '#EF4444' : 'rgba(59,130,246,0.2)',
                    boxShadow: focused === 'password'
                      ? '0 0 0 3px rgba(59,130,246,0.15), inset 0 0 10px rgba(59,130,246,0.1)'
                      : errors.password
                        ? '0 0 0 3px rgba(239,68,68,0.15)'
                        : 'inset 0 1px 3px rgba(0,0,0,0.5)',
                  }}
                  transition={{ duration: 0.3 }}
                  className="flex items-center rounded-2xl overflow-hidden relative"
                  style={{
                    background: 'rgba(10, 15, 30, 0.6)',
                    border: '1.5px solid transparent'
                  }}
                >
                  <motion.span
                    animate={{ color: focused === 'password' ? '#60a5fa' : '#475569' }}
                    className="pl-4 flex-shrink-0"
                  >
                    <Lock className="w-[18px] h-[18px]" />
                  </motion.span>
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); if (errors.password) setErrors(prev => ({ ...prev, password: undefined })); }}
                    onFocus={() => setFocused('password')}
                    onBlur={() => setFocused(null)}
                    className="flex-1 px-3 py-4 bg-transparent outline-none text-sm font-medium text-white placeholder:text-slate-600 focus:placeholder:text-slate-500"
                    placeholder="Enter security key"
                    autoComplete="current-password"
                    aria-label="Password"
                  />
                  <motion.button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    whileHover={{ scale: 1.1, color: '#60a5fa' }}
                    whileTap={{ scale: 0.9 }}
                    className="pr-4 text-slate-500 hover:text-blue-400 transition-colors"
                    tabIndex={-1}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </motion.button>
                </motion.div>
                {/* Password strength indicator — Blue neon shades */}
                <AnimatePresence>
                  {password.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex gap-1.5 pt-1"
                    >
                      {[
                        { min: 3, color: '#0369a1' }, // dark blue
                        { min: 6, color: '#0284c7' }, // medium blue
                        { min: 9, color: '#0ea5e9' }, // light blue
                        { min: 12, color: '#38bdf8' }, // sky blue
                      ].map((level, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ scaleX: 0 }}
                          animate={{ scaleX: 1 }}
                          transition={{ delay: idx * 0.1, duration: 0.3 }}
                          className="h-[3px] flex-1 rounded-full"
                          style={{
                             background: password.length >= level.min ? level.color : 'rgba(255,255,255,0.05)',
                             boxShadow: password.length >= level.min ? `0 0 8px ${level.color}` : 'none',
                             transformOrigin: 'left',
                          }}
                        />
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Submit button — Blue Cyber Gradient */}
              <motion.div variants={itemVars} className="pt-2">
                <motion.button
                  type="submit"
                  disabled={isLoading}
                  id="login-submit-btn"
                  whileHover={!isLoading ? { scale: 1.02, rotateX: 10, y: -2, boxShadow: '0 15px 25px rgba(59,130,246,0.4)' } : {}}
                  whileTap={!isLoading ? { scale: 0.98, rotateX: -5 } : {}}
                  className="relative w-full font-bold py-4 px-6 rounded-2xl flex items-center justify-center gap-2.5 overflow-hidden group"
                  style={{
                    background: loginSuccess
                      ? 'linear-gradient(135deg, #0ea5e9, #3b82f6)'
                      : 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 50%, #0ea5e9 100%)',
                    color: '#ffffff',
                    boxShadow: isLoading
                      ? '0 0 25px rgba(59,130,246,0.3)'
                      : '0 4px 20px rgba(37,99,235,0.4), inset 0 1px 0 rgba(255,255,255,0.2)',
                    border: '1px solid rgba(14,165,233,0.3)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    transformStyle: 'preserve-3d',
                  }}
                >
                  {/* Energy wave animation */}
                  <motion.div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100"
                    style={{
                      background: 'linear-gradient(105deg, transparent 20%, rgba(255,255,255,0.3) 50%, transparent 80%)',
                      transition: 'opacity 0.3s',
                    }}
                    animate={{ x: ['-100%', '200%'] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                  />

                  {isLoading ? (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2.5">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="w-5 h-5 rounded-full"
                        style={{ border: '2px solid rgba(255,255,255,0.2)', borderTopColor: '#fff', borderRightColor: '#fff' }}
                      />
                      <span className="relative z-10 text-sm tracking-widest uppercase text-white drop-shadow-md">
                        {loginSuccess ? 'Access Granted' : 'Decrypting...'}
                      </span>
                    </motion.div>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 relative z-10 text-blue-200" />
                      <span className="relative z-10 text-sm tracking-widest uppercase text-white drop-shadow-md">Initialize Sequence</span>
                      <motion.div
                        className="relative z-10"
                        animate={{ x: [0, 5, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                      >
                        <ArrowRight className="w-4 h-4 text-blue-200" />
                      </motion.div>
                    </>
                  )}
                </motion.button>
              </motion.div>
            </form>

            {/* ── Security footer with neon glow ── */}
            <motion.div variants={itemVars} className="mt-7 flex items-center justify-center gap-4">
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#3b82f6', boxShadow: '0 0 10px #3b82f6, 0 0 20px #3b82f6', animation: 'pulseNeon 2s infinite' }} />
                <p className="text-[10px] font-medium text-slate-400">Node Active</p>
              </div>
              <div className="w-[1px] h-3 bg-slate-700" />
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3 h-3 text-blue-500" />
                <p className="text-[10px] font-medium text-slate-400">AES-256 Encrypted</p>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </BlueBorder>
      <style>{`
        @keyframes pulseNeon {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.8); }
        }
      `}</style>
    </div>
  );
}
