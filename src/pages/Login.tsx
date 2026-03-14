import LoginForm from '@/components/auth/LoginForm';
import { Navigate } from 'react-router-dom';

export default function Login() {
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-blue-100/50 blur-3xl" />
        <div className="absolute top-[60%] -right-[10%] w-[40%] h-[40%] rounded-full bg-cyan-100/50 blur-3xl" />
      </div>
      
      <LoginForm />
      
      <p className="mt-8 text-sm text-slate-500 z-10">
        © 2024 Heal Sense Nexus • Confidential & Proprietary
      </p>
    </div>
  );
}
