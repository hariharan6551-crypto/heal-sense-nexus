import LoginForm from '@/components/auth/LoginForm';
import { Navigate } from 'react-router-dom';

export default function Login() {
  const isAuthenticated = sessionStorage.getItem('isAuthenticated') === 'true';

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #0f0c29 0%, #1a1a4e 35%, #0d2137 65%, #0e7490 100%)',
      }}
    >
      {/* Animated floating orbs */}
      <div
        className="pointer-events-none absolute"
        style={{
          top: '-10%',
          left: '-5%',
          width: '55%',
          height: '55%',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99,102,241,0.25) 0%, transparent 70%)',
          animation: 'orbFloat 10s ease-in-out infinite',
        }}
      />
      <div
        className="pointer-events-none absolute"
        style={{
          bottom: '-15%',
          right: '-5%',
          width: '50%',
          height: '50%',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(14,116,144,0.3) 0%, transparent 70%)',
          animation: 'orbFloat 13s ease-in-out infinite reverse',
        }}
      />
      <div
        className="pointer-events-none absolute"
        style={{
          top: '45%',
          left: '35%',
          width: '30%',
          height: '30%',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(167,139,250,0.12) 0%, transparent 70%)',
          animation: 'orbFloat 8s ease-in-out infinite 2s',
        }}
      />

      {/* Grid dot overlay */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            'radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />

      {/* Login card — entrance animation */}
      <div
        className="z-10 w-full max-w-md"
        style={{ animation: 'cardEntrance 0.6s cubic-bezier(0.22,1,0.36,1) both' }}
      >
        <LoginForm />
      </div>

      {/* Footer */}
      <p
        className="mt-8 text-xs z-10"
        style={{ color: 'rgba(255,255,255,0.35)', animation: 'fadeUp 0.8s ease 0.4s both' }}
      >
        © {new Date().getFullYear()} Heal Sense Nexus · Confidential &amp; Proprietary
      </p>
    </div>
  );
}
