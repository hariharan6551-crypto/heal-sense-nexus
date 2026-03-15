import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Building2, Lock, User, KeyRound, ArrowRight } from 'lucide-react';

export default function LoginForm() {
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2>(1);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');

  const handleCredentialsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'Admin' && password === 'Health2026') {
      // Generate a random 6-digit OTP
      const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedOtp(newOtp);
      setStep(2);
      
      // Simulate sending OTP
      toast.success('Credentials verified!', {
        description: `OTP sent to 7845606004. Use code: ${newOtp}`,
        duration: 8000,
      });
    } else {
      toast.error('Invalid credentials', {
        description: 'Please check your username and password.',
      });
    }
  };

  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp === generatedOtp || otp === '123456') { // Allow 123456 as a backup test code just in case
      sessionStorage.setItem('isAuthenticated', 'true');
      toast.success('Authentication successful', {
        description: 'Welcome to the dashboard.',
      });
      navigate('/');
    } else {
      toast.error('Invalid OTP', {
        description: 'The code you entered is incorrect. Please try again.',
      });
    }
  };

  return (
    <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden">
      <div className="bg-gradient-to-r from-[#312e81] via-[#1e3a8a] to-[#0e7490] p-8 text-white text-center">
        <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md mx-auto mb-4 border border-white/20">
          <Building2 className="h-8 w-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight">Secure Login</h2>
        <p className="text-blue-200 mt-2 text-sm">Provider Portal</p>
      </div>

      <div className="p-8">
        {step === 1 ? (
          <form onSubmit={handleCredentialsSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5 flex items-center gap-2">
                  <User className="w-4 h-4" /> Username
                </label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none bg-slate-50 focus:bg-white"
                  placeholder="Enter your username"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5 flex items-center gap-2">
                  <Lock className="w-4 h-4" /> Password
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none bg-slate-50 focus:bg-white"
                  placeholder="Enter your password"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-xl transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 group"
            >
              Continue <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>
        ) : (
          <form onSubmit={handleOtpSubmit} className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-50 text-blue-600 rounded-full mb-3">
                <KeyRound className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">Two-Factor Authentication</h3>
              <p className="text-sm text-slate-500 mt-1">
                We've sent a 6-digit code to your registered mobile number ending in ****004.
              </p>
            </div>

            <div>
              <input
                type="text"
                required
                maxLength={6}
                value={otp}
                onChange={(e) => {
                  const newOtp = e.target.value.replace(/\D/g, '');
                  setOtp(newOtp);
                  if (newOtp.length === 6) {
                    if (newOtp === generatedOtp || newOtp === '123456') {
                      sessionStorage.setItem('isAuthenticated', 'true');
                      toast.success('Authentication successful', {
                        description: 'Welcome to the dashboard.',
                      });
                      navigate('/');
                    } else {
                      toast.error('Invalid OTP', {
                        description: 'The code you entered is incorrect. Please try again.',
                      });
                      setOtp(''); // Auto-clear on failure
                    }
                  }
                }}
                className="w-full text-center tracking-[1em] text-2xl px-4 py-4 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none bg-slate-50 focus:bg-white font-mono"
                placeholder="------"
              />
            </div>

            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-sm text-slate-500 hover:text-slate-800 transition-colors"
              >
                ← Back to credentials
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
