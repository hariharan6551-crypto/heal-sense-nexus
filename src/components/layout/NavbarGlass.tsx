import { motion } from 'framer-motion';
import { ReactNode } from 'react';

export default function NavbarGlass({ children, className = '' }: { children: ReactNode, className?: string }) {
  return (
    <div
      className={`h-[64px] relative z-50 ${className}`}
      style={{
        background: 'rgba(255, 255, 255, 0.7)',
        backdropFilter: 'blur(30px) saturate(180%)',
        WebkitBackdropFilter: 'blur(30px) saturate(180%)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.9)',
        boxShadow: '0 4px 30px rgba(59, 130, 246, 0.08)',
      }}
    >
      {/* Light Shimmer */}
      <div className="absolute inset-x-0 bottom-0 h-[1px] bg-gradient-to-r from-transparent via-[#3B82F6]/30 to-transparent" />
      <div className="w-full h-full max-w-[1800px] mx-auto flex items-center justify-between px-4 lg:px-6">
        {children}
      </div>
    </div>
  );
}
