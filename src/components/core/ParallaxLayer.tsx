import { ReactNode, memo } from 'react';

// Lightweight parallax — CSS-only hover tilt for performance
// Removed framer-motion springs/transforms that caused GPU thrashing across 20+ card instances
export default memo(function ParallaxLayer({ children, intensity = 10, className = '' }: { children: ReactNode, intensity?: number, className?: string }) {
  return (
    <div className={`parallax-card ${className}`}>
      {children}
    </div>
  );
});
