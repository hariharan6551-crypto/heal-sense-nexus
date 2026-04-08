import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Lock, User, ArrowRight, Eye, EyeOff, ShieldCheck,
  Sparkles, Fingerprint, Zap, CheckCircle2, AlertCircle,
  TrendingUp, BarChart3,
} from 'lucide-react';

interface Props {
  onMorphStart?: () => void;
}

/* ───── Rainbow Animated Border ───── */
function RainbowBorder({ children, active }: { children: React.ReactNode; active: boolean }) {
  return (
    <div className="relative rounded-[28px] p-[2px]" style={{ isolation: 'isolate' }}>
      {/* Animated rainbow gradient border */}
      <motion.div
        className="absolute inset-0 rounded-[28px] z-0"
        style={{
          background: active
            ? 'linear-gradient(135deg, #EF4444, #EAB308, #22C55E, #3B82F6, #8B5CF6, #EC4899, #EF4444)'
            : 'linear-gradient(135deg, rgba(59,130,246,0.2), rgba(34,197,94,0.15), rgba(234,179,8,0.15), rgba(239,68,68,0.15), rgba(59,130,246,0.2))',
          backgroundSize: '300% 100%',
          animation: active ? 'rainbowBorder 2s linear infinite' : 'rainbowBorder 6s linear infinite',
        }}
      />
      {/* Glow effect */}
      <div
        className="absolute inset-0 rounded-[28px] z-0 transition-opacity duration-500"
        style={{
          filter: 'blur(15px)',
          opacity: active ? 0.3 : 0.1,
          background: 'linear-gradient(135deg, #EF4444, #EAB308, #22C55E, #3B82F6)',
          backgroundSize: '300% 100%',
          animation: 'rainbowBorder 3s linear infinite',
        }}
      />
      {/* Card content */}
      <div className="relative z-10 rounded-[26px]">{children}</div>
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
      description: 'Launching Analytics Dashboard…',
      icon: <Zap className="w-4 h-4 text-yellow-500" />,
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

  const containerVars = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
  };
  const itemVars = {
    hidden: { opacity: 0, y: 20, filter: 'blur(4px)' },
    visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
  };

  // Color accents based on focused field
  const activeColor = focused === 'username' ? '#3B82F6' : focused === 'password' ? '#8B5CF6' : '#3B82F6';

  return (
    <div className="w-full max-w-[440px]">
      <RainbowBorder active={isFormActive || isLoading}>
        <div
          className="rounded-[26px] overflow-hidden"
          style={{
            background: 'rgba(255, 255, 255, 0.92)',
            backdropFilter: 'blur(40px) saturate(180%)',
            boxShadow: '0 25px 60px rgba(0,0,0,0.08), 0 4px 20px rgba(0,0,0,0.04)',
          }}
        >
          {/* ── Header section ── */}
          <motion.div
            variants={containerVars}
            initial="hidden"
            animate={mounted ? 'visible' : 'hidden'}
            className="relative px-8 pt-10 pb-8 text-center overflow-hidden"
          >
            {/* Colorful gradient mesh background */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: `
                  radial-gradient(circle at 20% 30%, rgba(59,130,246,0.06) 0%, transparent 50%),
                  radial-gradient(circle at 80% 70%, rgba(239,68,68,0.05) 0%, transparent 50%),
                  radial-gradient(circle at 50% 50%, rgba(34,197,94,0.04) 0%, transparent 60%)
                `,
              }}
            />

            {/* Animated rainbow top line */}
            <motion.div
              className="absolute top-0 left-0 right-0 h-[3px]"
              style={{
                background: 'linear-gradient(90deg, #EF4444, #EAB308, #22C55E, #3B82F6, #8B5CF6, #EC4899, #EF4444)',
                backgroundSize: '200% 100%',
              }}
              animate={{ backgroundPosition: ['0% 50%', '200% 50%'] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            />

            {/* Logo with colorful orbital animation */}
            <motion.div variants={itemVars} className="relative w-20 h-20 mx-auto mb-6">
              {/* Outer orbit — Red accent */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-0 rounded-full"
                style={{ border: '1.5px solid rgba(239,68,68,0.2)' }}
              >
                <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full"
                  style={{ background: '#EF4444', boxShadow: '0 0 10px rgba(239,68,68,0.4)' }}
                />
              </motion.div>
              {/* Middle orbit — Blue accent */}
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-2 rounded-full"
                style={{ border: '1.5px solid rgba(59,130,246,0.15)' }}
              >
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full"
                  style={{ background: '#3B82F6', boxShadow: '0 0 8px rgba(59,130,246,0.4)' }}
                />
              </motion.div>
              {/* Inner orbit — Green accent */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-4 rounded-full"
                style={{ border: '1px solid rgba(34,197,94,0.12)' }}
              >
                <div className="absolute -right-0.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full"
                  style={{ background: '#22C55E', boxShadow: '0 0 6px rgba(34,197,94,0.4)' }}
                />
              </motion.div>
              {/* Center icon */}
              <motion.div
                className="absolute inset-5 rounded-2xl flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, rgba(59,130,246,0.1), rgba(139,92,246,0.08))',
                  border: '1px solid rgba(59,130,246,0.15)',
                  boxShadow: '0 4px 20px rgba(59,130,246,0.1)',
                }}
                whileHover={{ scale: 1.05, rotate: 5 }}
              >
                <BarChart3 className="w-5 h-5 text-blue-600" />
              </motion.div>
            </motion.div>

            {/* Security badge */}
            <motion.div variants={itemVars} className="flex items-center justify-center gap-2 mb-3">
              <motion.div
                animate={{ opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="flex items-center gap-1.5 px-3 py-1 rounded-full"
                style={{
                  background: 'rgba(34,197,94,0.06)',
                  border: '1px solid rgba(34,197,94,0.15)',
                }}
              >
                <ShieldCheck className="w-3 h-3 text-green-500" />
                <span className="text-[10px] font-bold text-green-600 tracking-[0.2em] uppercase">
                  Secure Portal
                </span>
              </motion.div>
            </motion.div>

            {/* Title */}
            <motion.h2
              variants={itemVars}
              className="text-[26px] font-black tracking-tight text-slate-800 mb-1"
            >
              Welcome Back
            </motion.h2>
            <motion.p variants={itemVars} className="text-xs font-medium text-slate-400">
              Sign in to your Analytics Dashboard
            </motion.p>
          </motion.div>

          {/* ── Rainbow Divider ── */}
          <div className="mx-8">
            <div
              className="h-[1.5px]"
              style={{
                background: 'linear-gradient(90deg, transparent, rgba(239,68,68,0.15), rgba(234,179,8,0.15), rgba(34,197,94,0.15), rgba(59,130,246,0.15), transparent)',
              }}
            />
          </div>

          {/* ── Form body ── */}
          <motion.div
            className="px-8 py-7"
            variants={containerVars}
            initial="hidden"
            animate={mounted ? 'visible' : 'hidden'}
          >
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Username field */}
              <motion.div variants={itemVars} className="space-y-2">
                <label htmlFor="login-username" className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
                  Username
                </label>
                <motion.div
                  animate={{
                    borderColor: focused === 'username' ? '#3B82F6' : errors.username ? '#EF4444' : 'rgba(0,0,0,0.08)',
                    boxShadow: focused === 'username'
                      ? '0 0 0 3px rgba(59,130,246,0.08), 0 2px 12px rgba(59,130,246,0.06)'
                      : errors.username
                        ? '0 0 0 3px rgba(239,68,68,0.08)'
                        : '0 1px 3px rgba(0,0,0,0.02)',
                  }}
                  transition={{ duration: 0.3 }}
                  className="flex items-center rounded-2xl overflow-hidden"
                  style={{
                    background: '#fff',
                    border: '1.5px solid rgba(0,0,0,0.08)',
                  }}
                >
                  <motion.span
                    animate={{ color: focused === 'username' ? '#3B82F6' : '#94a3b8' }}
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
                    className="flex-1 px-3 py-4 bg-transparent outline-none text-sm font-medium text-slate-800"
                    placeholder="Enter your username"
                    autoComplete="username"
                    aria-label="Username"
                  />
                  <AnimatePresence>
                    {username.length > 0 && !errors.username && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.5 }}
                        className="pr-4"
                      >
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
                <AnimatePresence>
                  {errors.username && (
                    <motion.div
                      initial={{ opacity: 0, height: 0. }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex items-center gap-1 pl-1"
                    >
                      <AlertCircle className="w-3 h-3 text-red-500" />
                      <p className="text-[10px] text-red-500 font-medium">{errors.username}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Password field */}
              <motion.div variants={itemVars} className="space-y-2">
                <label htmlFor="login-password" className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
                  Password
                </label>
                <motion.div
                  animate={{
                    borderColor: focused === 'password' ? '#8B5CF6' : errors.password ? '#EF4444' : 'rgba(0,0,0,0.08)',
                    boxShadow: focused === 'password'
                      ? '0 0 0 3px rgba(139,92,246,0.08), 0 2px 12px rgba(139,92,246,0.06)'
                      : errors.password
                        ? '0 0 0 3px rgba(239,68,68,0.08)'
                        : '0 1px 3px rgba(0,0,0,0.02)',
                  }}
                  transition={{ duration: 0.3 }}
                  className="flex items-center rounded-2xl overflow-hidden"
                  style={{
                    background: '#fff',
                    border: '1.5px solid rgba(0,0,0,0.08)',
                  }}
                >
                  <motion.span
                    animate={{ color: focused === 'password' ? '#8B5CF6' : '#94a3b8' }}
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
                    className="flex-1 px-3 py-4 bg-transparent outline-none text-sm font-medium text-slate-800"
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    aria-label="Password"
                  />
                  <motion.button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="pr-4 text-slate-400 hover:text-slate-600 transition-colors"
                    tabIndex={-1}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </motion.button>
                </motion.div>
                {/* Password strength indicator — rainbow colors */}
                <AnimatePresence>
                  {password.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex gap-1.5 pt-1"
                    >
                      {[
                        { min: 3, color: '#EF4444' },
                        { min: 6, color: '#EAB308' },
                        { min: 9, color: '#3B82F6' },
                        { min: 12, color: '#22C55E' },
                      ].map((level, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ scaleX: 0 }}
                          animate={{ scaleX: 1 }}
                          transition={{ delay: idx * 0.1, duration: 0.3 }}
                          className="h-[3px] flex-1 rounded-full"
                          style={{
                            background: password.length >= level.min ? level.color : 'rgba(0,0,0,0.06)',
                            transformOrigin: 'left',
                          }}
                        />
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
                <AnimatePresence>
                  {errors.password && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex items-center gap-1 pl-1"
                    >
                      <AlertCircle className="w-3 h-3 text-red-500" />
                      <p className="text-[10px] text-red-500 font-medium">{errors.password}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Submit button — Vibrant gradient */}
              <motion.div variants={itemVars} className="pt-2">
                <motion.button
                  type="submit"
                  disabled={isLoading}
                  id="login-submit-btn"
                  whileHover={!isLoading ? { scale: 1.02, y: -2 } : {}}
                  whileTap={!isLoading ? { scale: 0.98 } : {}}
                  className="relative w-full font-bold py-4 px-6 rounded-2xl flex items-center justify-center gap-2.5 overflow-hidden group"
                  style={{
                    background: loginSuccess
                      ? 'linear-gradient(135deg, #16a34a, #22C55E)'
                      : 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 50%, #EC4899 100%)',
                    color: '#ffffff',
                    boxShadow: isLoading
                      ? '0 0 25px rgba(59,130,246,0.2)'
                      : '0 4px 20px rgba(59,130,246,0.25), 0 2px 8px rgba(139,92,246,0.15)',
                    transition: 'background 0.3s ease',
                  }}
                >
                  {/* Shine animation */}
                  <motion.div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100"
                    style={{
                      background: 'linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.2) 50%, transparent 70%)',
                      transition: 'opacity 0.3s',
                    }}
                    animate={{ x: ['-100%', '200%'] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', repeatDelay: 1 }}
                  />

                  {isLoading ? (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2.5">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="w-5 h-5 rounded-full"
                        style={{ border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff' }}
                      />
                      <span className="relative z-10 text-sm tracking-wide">
                        {loginSuccess ? 'Authenticated ✓' : 'Verifying…'}
                      </span>
                    </motion.div>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 relative z-10" />
                      <span className="relative z-10 text-sm tracking-wide">Sign In to Dashboard</span>
                      <motion.div
                        className="relative z-10"
                        animate={{ x: [0, 4, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                      >
                        <ArrowRight className="w-4 h-4" />
                      </motion.div>
                    </>
                  )}
                </motion.button>
              </motion.div>
            </form>

            {/* ── Security footer with colored icons ── */}
            <motion.div variants={itemVars} className="mt-7 flex items-center justify-center gap-4">
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#22C55E', boxShadow: '0 0 6px rgba(34,197,94,0.4)', animation: 'liveBreathe 2s ease-in-out infinite' }} />
                <p className="text-[10px] font-medium text-slate-400">System Online</p>
              </div>
              <div className="w-[1px] h-3 bg-slate-200" />
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3 h-3 text-blue-500" />
                <p className="text-[10px] font-medium text-slate-400">256-bit Encrypted</p>
              </div>
              <div className="w-[1px] h-3 bg-slate-200" />
              <div className="flex items-center gap-1.5">
                <Zap className="w-3 h-3 text-yellow-500" />
                <p className="text-[10px] font-medium text-slate-400">SOC2</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </RainbowBorder>
    </div>
  );
}
