import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Building2, Lock, User, ArrowRight, Eye, EyeOff, ShieldCheck } from 'lucide-react';

export default function LoginForm() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) return;
    
    setIsLoading(true);
    // Simulate a brief auth delay for UX
    await new Promise((r) => setTimeout(r, 600));

    localStorage.setItem('isAuthenticated', 'true');
    toast.success('Authentication Secure', {
      description: 'Connected to Enterprise Dashboard.',
    });
    navigate('/');
  };

  return (
    <div className="login-card w-full max-w-md">
      {/* Glass card */}
      <div
        className="relative rounded-3xl overflow-hidden"
        style={{
          background: 'rgba(255,255,255,0.85)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          boxShadow:
            '0 8px 32px rgba(31,38,135,0.18), 0 1.5px 0 rgba(255,255,255,0.6) inset',
          border: '1.5px solid rgba(255,255,255,0.55)',
        }}
      >
        {/* Header gradient band */}
        <div
          className="relative p-8 text-white text-center overflow-hidden"
          style={{
            background:
              'linear-gradient(135deg, #312e81 0%, #1e3a8a 45%, #0e7490 100%)',
          }}
        >
          {/* Animated orb inside header */}
          <div
            className="absolute -top-10 -right-10 w-40 h-40 rounded-full opacity-20"
            style={{
              background: 'radial-gradient(circle, #7dd3fc, transparent)',
              animation: 'orbFloat 6s ease-in-out infinite',
            }}
          />
          <div
            className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full opacity-15"
            style={{
              background: 'radial-gradient(circle, #a78bfa, transparent)',
              animation: 'orbFloat 8s ease-in-out infinite reverse',
            }}
          />

          <div
            className="relative w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{
              background: 'rgba(255,255,255,0.15)',
              border: '1px solid rgba(255,255,255,0.3)',
              backdropFilter: 'blur(8px)',
              boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
            }}
          >
            <Building2 className="h-8 w-8 text-white" />
          </div>

          <div className="flex items-center justify-center gap-2 mb-1">
            <ShieldCheck className="w-4 h-4 text-cyan-300" />
            <span className="text-xs font-semibold text-cyan-300 tracking-widest uppercase">
              Secure Portal
            </span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight">Secure Login</h2>
          <p className="text-blue-200 mt-1 text-sm">
            Analytics · Provider Dashboard
          </p>
        </div>

        {/* Form body */}
        <div className="p-8">
          <form onSubmit={handleCredentialsSubmit} className="space-y-5">
            {/* Username field */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Username
              </label>
              <div
                className="flex items-center rounded-xl border transition-all duration-200"
                style={{
                  border:
                    focused === 'username'
                      ? '1.5px solid #3b82f6'
                      : '1.5px solid #e2e8f0',
                  boxShadow:
                    focused === 'username'
                      ? '0 0 0 3px rgba(59,130,246,0.12)'
                      : 'none',
                  background: focused === 'username' ? '#fff' : '#f8fafc',
                }}
              >
                <span className="pl-4 text-slate-400">
                  <User className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onFocus={() => setFocused('username')}
                  onBlur={() => setFocused(null)}
                  className="flex-1 px-3 py-3.5 bg-transparent outline-none text-slate-800 text-sm placeholder-slate-400"
                  placeholder="Enter your username"
                  autoComplete="username"
                />
              </div>
            </div>

            {/* Password field */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Password
              </label>
              <div
                className="flex items-center rounded-xl border transition-all duration-200"
                style={{
                  border:
                    focused === 'password'
                      ? '1.5px solid #3b82f6'
                      : '1.5px solid #e2e8f0',
                  boxShadow:
                    focused === 'password'
                      ? '0 0 0 3px rgba(59,130,246,0.12)'
                      : 'none',
                  background: focused === 'password' ? '#fff' : '#f8fafc',
                }}
              >
                <span className="pl-4 text-slate-400">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocused('password')}
                  onBlur={() => setFocused(null)}
                  className="flex-1 px-3 py-3.5 bg-transparent outline-none text-slate-800 text-sm placeholder-slate-400"
                  placeholder="Enter your password"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="pr-4 text-slate-400 hover:text-slate-600 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={isLoading}
              className="relative w-full text-white font-semibold py-3.5 px-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 group overflow-hidden mt-2"
              style={{
                background: isLoading
                  ? 'linear-gradient(135deg, #6366f1, #0e7490)'
                  : 'linear-gradient(135deg, #3730a3, #1d4ed8, #0e7490)',
                boxShadow: isLoading
                  ? 'none'
                  : '0 4px 20px rgba(29,78,216,0.35)',
                transform: isLoading ? 'scale(0.98)' : 'scale(1)',
              }}
            >
              {/* Shine effect */}
              <span
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{
                  background:
                    'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.15) 50%, transparent 60%)',
                }}
              />
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin h-4 w-4 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8z"
                    />
                  </svg>
                  <span>Authenticating…</span>
                </>
              ) : (
                <>
                  <span>Sign In to Dashboard</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
                </>
              )}
            </button>
          </form>

          {/* Footer badge */}
          <div className="mt-6 flex items-center justify-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <p className="text-xs text-slate-400">

            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
