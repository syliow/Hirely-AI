import React from 'react';
import { HelpCircle } from 'lucide-react';

export const InfoTooltip = ({ text }: { text: string }) => (
  <div className="group relative inline-block ml-3 align-middle">
    <HelpCircle className="w-5 h-5 text-slate-400 cursor-help hover:text-violet-400 transition-colors" />
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 w-64 p-5 bg-slate-900 text-sm text-slate-200 rounded-[20px] shadow-3xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 border border-white/10 font-medium leading-relaxed text-center">
      {text}
      <div className="absolute top-full left-1/2 -translate-x-1/2 border-[12px] border-transparent border-t-slate-900" />
    </div>
  </div>
);
