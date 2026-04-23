import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import {
  Lock, User, ArrowRight, Eye, EyeOff, ShieldCheck,
  Sparkles, Fingerprint, Zap, CheckCircle2, AlertCircle,
} from 'lucide-react';
import GlassCard from '@/components/core/GlassCard';
import GlowButton from '@/components/core/GlowButton';

interface Props {
  onMorphStart?: () => void;
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

    // Validate credentials: Admin / Health2026
    if (username.trim() !== 'Admin' || password !== 'Health2026') {
      setIsLoading(false);
      setErrors({ username: 'Invalid credentials', password: 'Invalid credentials' });
      toast.error('Access Denied', { description: 'Invalid username or password. Use Admin / Health2026' });
      return;
    }

    setLoginSuccess(true);
    sessionStorage.setItem('isAuthenticated', 'true');
    sessionStorage.setItem('dashboard-user', username.trim());
    localStorage.removeItem('isAuthenticated'); // Clear any legacy persist
    toast.success('Authentication Successful', {
      description: 'Morphing to Healthcare Analytics Dashboard…',
      icon: <Zap className="w-4 h-4 text-blue-500" />,
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
    <div className="w-full max-w-[440px] px-2" style={{ perspective: '1200px' }}>
      <motion.div
        animate={loginSuccess ? "morphing" : mounted ? 'visible' : 'hidden'}
        initial="hidden"
        variants={containerVars}
        style={{ transformOrigin: 'bottom center' }}
      >
        <GlassCard 
          glowColor={isFormActive || isLoading ? 'cyan' : 'blue'} 
          className="p-8 pb-10"
        >
          {/* ── Header section ── */}
          <div className="relative text-center overflow-hidden mb-8">
            {/* Logo with 3D rotating core */}
            <motion.div variants={itemVars} className="relative w-20 h-20 mx-auto mb-6" style={{ perspective: '500px' }}>
              <motion.div
                animate={{ rotateX: 360, rotateZ: 360 }}
                transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-0 rounded-full border border-blue-200 shadow-[0_0_15px_rgba(59,130,246,0.2)]"
                style={{ transformStyle: 'preserve-3d' }}
              />
              <motion.div
                animate={{ rotateY: 360, rotateX: -360 }}
                transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-2 rounded-full border border-cyan-300 shadow-[0_0_15px_rgba(56,189,248,0.3)]"
                style={{ transformStyle: 'preserve-3d' }}
              />
              <motion.div
                className="absolute inset-4 rounded-2xl flex items-center justify-center bg-white/60 backdrop-blur-md shadow-[0_0_20px_rgba(59,130,246,0.3)] border border-white/50"
                whileHover={{ scale: 1.1, rotateY: 20 }}
              >
                <Fingerprint className="w-8 h-8 text-blue-600 drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
              </motion.div>
            </motion.div>

            {/* AI Core badge */}
            <motion.div variants={itemVars} className="flex items-center justify-center gap-2 mb-3">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200">
                <Sparkles className="w-3 h-3 text-blue-500" />
                <span className="text-[10px] font-bold text-blue-600 tracking-[0.2em] uppercase">
                  AI System Online
                </span>
              </div>
            </motion.div>

            <motion.h2
              variants={itemVars}
              className="text-[26px] font-black tracking-tight text-slate-800 mb-1"
            >
              System Access
            </motion.h2>
            <motion.p variants={itemVars} className="text-xs font-medium text-slate-500">
              Authenticate to access secured metrics
            </motion.p>
          </div>

          {/* ── Form body ── */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <motion.div variants={itemVars} className="space-y-2 relative z-20">
              <label htmlFor="login-username" className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500">
                Operative ID
              </label>
              <div
                className={`flex items-center rounded-2xl overflow-hidden relative group transition-all duration-300 border-2 bg-white/50 backdrop-blur-sm ${
                  focused === 'username' ? 'border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.2)]'
                  : errors.username ? 'border-red-400' : 'border-white/80 shadow-sm'
                }`}
              >
                <span className={`pl-4 flex-shrink-0 transition-colors ${focused === 'username' ? 'text-blue-500' : 'text-slate-400'}`}>
                  <User className="w-[18px] h-[18px]" />
                </span>
                <input
                  id="login-username"
                  type="text"
                  required
                  value={username}
                  onChange={(e) => { setUsername(e.target.value); if (errors.username) setErrors(prev => ({ ...prev, username: undefined })); }}
                  onFocus={() => setFocused('username')}
                  onBlur={() => setFocused(null)}
                  className="flex-1 px-3 py-4 bg-transparent outline-none text-sm font-medium text-slate-800 placeholder:text-slate-400"
                  placeholder="Enter identification"
                  autoComplete="username"
                />
                <AnimatePresence>
                  {username.length > 0 && !errors.username && (
                    <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.5 }} className="pr-4">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>

            <motion.div variants={itemVars} className="space-y-2 relative z-10">
              <label htmlFor="login-password" className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500">
                Access Key
              </label>
              <div
                className={`flex items-center rounded-2xl overflow-hidden relative transition-all duration-300 border-2 bg-white/50 backdrop-blur-sm ${
                  focused === 'password' ? 'border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.2)]'
                  : errors.password ? 'border-red-400' : 'border-white/80 shadow-sm'
                }`}
              >
                <span className={`pl-4 flex-shrink-0 transition-colors ${focused === 'password' ? 'text-blue-500' : 'text-slate-400'}`}>
                  <Lock className="w-[18px] h-[18px]" />
                </span>
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); if (errors.password) setErrors(prev => ({ ...prev, password: undefined })); }}
                  onFocus={() => setFocused('password')}
                  onBlur={() => setFocused(null)}
                  className="flex-1 px-3 py-4 bg-transparent outline-none text-sm font-medium text-slate-800 placeholder:text-slate-400"
                  placeholder="Enter security key"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="pr-4 text-slate-400 hover:text-blue-500 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </motion.div>

            <motion.div variants={itemVars} className="pt-4">
              <GlowButton type="submit" disabled={isLoading} className="w-full py-4 rounded-2xl flex items-center justify-center gap-2" variant="primary">
                {isLoading ? (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      className="w-5 h-5 rounded-full border-2 border-white/40 border-t-white"
                    />
                    <span className="text-sm tracking-widest uppercase">
                      {loginSuccess ? 'Access Granted' : 'Decrypting...'}
                    </span>
                  </motion.div>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    <span className="text-sm tracking-widest uppercase">Initialize Sequence</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </GlowButton>
            </motion.div>
          </form>

          <motion.div variants={itemVars} className="mt-8 flex items-center justify-center gap-4 border-t border-slate-200/60 pt-6">
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
              <p className="text-[10px] font-bold uppercase text-slate-500">Node Active</p>
            </div>
            <div className="w-[1px] h-3 bg-slate-300" />
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3 h-3 text-emerald-500" />
              <p className="text-[10px] font-bold uppercase text-slate-500">AES Encrypted</p>
            </div>
          </motion.div>
        </GlassCard>
      </motion.div>
    </div>
  );
}
