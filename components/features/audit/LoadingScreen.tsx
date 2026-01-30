import React from 'react';
import { Terminal } from 'lucide-react';

interface LoadingScreenProps {
  scanStep: string;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ scanStep }) => {
  return (
    <div className="h-[600px] flex flex-col items-center justify-center space-y-12 bg-slate-900/10 dark:bg-[#0f172a]/20 backdrop-blur-md border border-slate-200 dark:border-white/5 rounded-[80px] relative overflow-hidden group shadow-inner">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(139,92,246,0.12)_0%,transparent_70%)]" />
      <div className="relative z-10 flex flex-col items-center gap-8">
        <div className="relative">
          <div className="absolute inset-0 bg-violet-500/20 blur-3xl animate-pulse rounded-full" />
          <Terminal className="w-20 h-20 text-violet-500 animate-bounce relative z-10" />
        </div>
        <div className="space-y-4 text-center">
          <p className="text-lg font-black uppercase tracking-[0.6em] text-violet-500 transition-all duration-1000 animate-pulse">{scanStep}</p>
          <div className="w-64 h-2 bg-slate-200 dark:bg-white/5 rounded-full overflow-hidden mx-auto">
             <div className="h-full bg-violet-500 animate-[loading_2s_infinite]" style={{ width: '40%' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};
