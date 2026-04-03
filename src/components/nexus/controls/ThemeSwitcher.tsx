// ============================================================================
// ThemeSwitcher — Light Mode Indicator (Light-only mode)
// ============================================================================
import { Sun } from 'lucide-react';

export default function ThemeSwitcher() {
  return (
    <div className="flex items-center gap-1 bg-amber-50 rounded-xl px-2.5 py-1.5 border border-amber-200/60">
      <Sun className="w-3 h-3 text-amber-500" />
      <span className="text-[10px] font-semibold text-amber-700 hidden lg:inline">Light</span>
    </div>
  );
}
