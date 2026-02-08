import React from 'react';
import { BrandLogo } from '@/components/BrandLogo';
import { PlayCircle, Sun, Moon } from 'lucide-react';

interface HeaderProps {
  onReset: () => void;
  onStartTour: () => void;
  onToggleTheme: () => void;
  isDarkMode: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onReset, onStartTour, onToggleTheme, isDarkMode }) => {
  return (
    <header className="h-16 md:h-20 border-b border-slate-200 dark:border-white/5 flex items-center px-4 md:px-10 lg:px-20 justify-between sticky top-0 bg-white/90 dark:bg-[#020617]/90 backdrop-blur-2xl z-50">
      <div id="header-brand" className="flex items-center gap-3 md:gap-6 group cursor-pointer" onClick={onReset}>
        <BrandLogo size={36} className="w-10 h-10 md:w-14 md:h-14" />
        <span className="text-xl md:text-3xl font-black tracking-tighter text-slate-900 dark:text-white uppercase">HIRELY<span className="text-violet-500">.AI</span></span>
      </div>
      
      <div className="flex items-center gap-8">
        <button onClick={onStartTour} className="hidden sm:flex items-center gap-4 px-8 py-4 text-sm font-black uppercase tracking-widest text-violet-500 hover:text-violet-400 transition-colors bg-violet-500/10 rounded-3xl border border-violet-500/20 shadow-sm">
          <PlayCircle className="w-5 h-5" /> Quick Tour
        </button>
        <button onClick={onToggleTheme} className="p-4 text-slate-400 hover:text-violet-500 transition-colors bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm">
          {isDarkMode ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
        </button>
      </div>
    </header>
  );
};
