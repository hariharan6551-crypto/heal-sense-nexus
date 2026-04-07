import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Lock, User, ArrowRight, Eye, EyeOff, ShieldCheck, LayoutDashboard } from 'lucide-react';

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

    // Brief auth delay
    await new Promise((r) => setTimeout(r, 600));

    localStorage.setItem('isAuthenticated', 'true');
    toast.success('Authentication Successful', {
      description: 'Loading Analytics Dashboard…',
    });

    // Trigger morph animation
    if (onMorphStart) {
      onMorphStart();
      // Navigate after morph animation completes
      setTimeout(() => {
        navigate('/');
      }, 800);
    } else {
      navigate('/');
    }
  };

  return (
    <div className="w-full max-w-md">
      {/* White card with shadow */}
      <div
        className="relative rounded-3xl overflow-hidden"
        style={{
          background: '#ffffff',
          boxShadow: '0 25px 60px rgba(0,0,0,0.08), 0 4px 20px rgba(0,0,0,0.04)',
          border: '1px solid rgba(0,0,0,0.04)',
        }}
      >
        {/* Gradient header */}
        <div
          className="relative px-8 pt-10 pb-8 text-white text-center overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #1e3a5f 0%, #2563eb 40%, #0891b2 100%)',
          }}
        >
          {/* Subtle wave decoration */}
          <div
            className="absolute bottom-0 left-0 right-0 h-8 pointer-events-none"
            style={{
              background: 'linear-gradient(180deg, transparent 0%, rgba(255,255,255,0.08) 100%)',
            }}
          />

          {/* Logo icon */}
          <div
            className="relative w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
            style={{
              background: 'rgba(255,255,255,0.15)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255,255,255,0.2)',
              boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
            }}
          >
            <LayoutDashboard className="h-7 w-7 text-white" />
          </div>

          <div className="flex items-center justify-center gap-2 mb-2 relative z-10">
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-300" />
            <span className="text-[10px] font-bold text-cyan-300 tracking-[0.2em] uppercase">
              Secure Portal
            </span>
          </div>
          <h2 className="text-2xl font-black tracking-tight text-white">Secure Login</h2>
          <p className="text-blue-200/70 mt-1 text-xs font-medium">
            Analytics · Provider Dashboard
          </p>
        </div>

        {/* Form body */}
        <div className="px-8 py-7">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username field */}
            <div className="space-y-1.5">
              <label htmlFor="login-username" className="block text-[10px] font-bold text-slate-500 uppercase tracking-[0.15em]">
                Username
              </label>
              <div
                className="flex items-center rounded-xl transition-all duration-300"
                style={{
                  border: focused === 'username'
                    ? '1.5px solid #2563eb'
                    : errors.username
                      ? '1.5px solid #ef4444'
                      : '1.5px solid #e2e8f0',
                  boxShadow: focused === 'username'
                    ? '0 0 0 3px rgba(37,99,235,0.1)'
                    : errors.username
                      ? '0 0 0 3px rgba(239,68,68,0.08)'
                      : 'none',
                  background: '#fff',
                }}
              >
                <span className="pl-4 text-slate-400">
                  <User className="w-4 h-4" />
                </span>
                <input
                  id="login-username"
                  type="text"
                  required
                  value={username}
                  onChange={(e) => { setUsername(e.target.value); if (errors.username) setErrors(prev => ({ ...prev, username: undefined })); }}
                  onFocus={() => setFocused('username')}
                  onBlur={() => setFocused(null)}
                  className="flex-1 px-3 py-3.5 bg-transparent outline-none text-slate-800 text-sm placeholder-slate-400 font-medium"
                  placeholder="Enter your username"
                  autoComplete="username"
                  aria-label="Username"
                />
              </div>
              {errors.username && (
                <p className="text-[10px] text-red-500 font-medium mt-1 pl-1">{errors.username}</p>
              )}
            </div>

            {/* Password field */}
            <div className="space-y-1.5">
              <label htmlFor="login-password" className="block text-[10px] font-bold text-slate-500 uppercase tracking-[0.15em]">
                Password
              </label>
              <div
                className="flex items-center rounded-xl transition-all duration-300"
                style={{
                  border: focused === 'password'
                    ? '1.5px solid #2563eb'
                    : errors.password
                      ? '1.5px solid #ef4444'
                      : '1.5px solid #e2e8f0',
                  boxShadow: focused === 'password'
                    ? '0 0 0 3px rgba(37,99,235,0.1)'
                    : errors.password
                      ? '0 0 0 3px rgba(239,68,68,0.08)'
                      : 'none',
                  background: '#fff',
                }}
              >
                <span className="pl-4 text-slate-400">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); if (errors.password) setErrors(prev => ({ ...prev, password: undefined })); }}
                  onFocus={() => setFocused('password')}
                  onBlur={() => setFocused(null)}
                  className="flex-1 px-3 py-3.5 bg-transparent outline-none text-slate-800 text-sm placeholder-slate-400 font-medium"
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  aria-label="Password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="pr-4 text-slate-400 hover:text-slate-600 transition-colors"
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-[10px] text-red-500 font-medium mt-1 pl-1">{errors.password}</p>
              )}
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={isLoading}
              id="login-submit-btn"
              className="relative w-full text-white font-bold py-3.5 px-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 group overflow-hidden mt-2"
              style={{
                background: isLoading
                  ? 'linear-gradient(135deg, rgba(37,99,235,0.7), rgba(8,145,178,0.7))'
                  : 'linear-gradient(135deg, #1e3a5f 0%, #2563eb 50%, #0891b2 100%)',
                boxShadow: isLoading
                  ? 'none'
                  : '0 4px 20px rgba(37,99,235,0.25), 0 2px 8px rgba(0,0,0,0.1)',
              }}
            >
              {/* Animated shine */}
              <span
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{
                  background: 'linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.15) 50%, transparent 65%)',
                  animation: 'loginBtnShine 3s ease-in-out infinite',
                }}
              />
              {isLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  <span className="relative z-10">Signing in…</span>
                </>
              ) : (
                <>
                  <span className="relative z-10">Sign In to Dashboard</span>
                  <ArrowRight className="w-4 h-4 relative z-10 group-hover:translate-x-1 transition-transform duration-200" />
                </>
              )}
            </button>
          </form>

          {/* Security badge */}
          <div className="mt-6 flex items-center justify-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <p className="text-[10px] text-slate-400 font-medium">
              256-bit encrypted · SOC2 Compliant
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
