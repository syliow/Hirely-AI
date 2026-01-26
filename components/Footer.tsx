
import React from 'react';
import { Github, Linkedin } from 'lucide-react';
import { BrandLogo } from './BrandLogo';

export const Footer = () => (
  <footer className="w-full py-12 px-6 border-t border-slate-200 dark:border-white/5 mt-12 bg-white/50 dark:bg-[#020617]/50">
    <div className="max-w-5xl mx-auto flex flex-col items-center justify-center text-center gap-8">
      <div className="flex flex-col items-center gap-3">
        <div className="flex items-center gap-2">
          <BrandLogo size={16} className="w-8 h-8" />
          <span className="text-sm font-black tracking-tighter text-slate-900 dark:text-white uppercase">HIRELY<span className="text-violet-500">.AI</span></span>
        </div>
        <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
          Developed by <a href="https://liowshanyi.site" target="_blank" rel="noopener noreferrer" className="font-bold text-violet-500 hover:text-violet-400 transition-colors">Shanyi Liow</a>
        </p>
      </div>
      
      <div className="flex items-center gap-4">
        <a 
          href="https://github.com/syliow" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="p-2.5 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:text-violet-500 dark:hover:text-violet-400 rounded-xl border border-slate-200 dark:border-white/10 transition-all active:scale-95 shadow-sm"
          aria-label="GitHub Profile"
        >
          <Github className="w-5 h-5" />
        </a>
        <a 
          href="https://www.linkedin.com/in/syliow/" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="p-2.5 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:text-violet-500 dark:hover:text-violet-400 rounded-xl border border-slate-200 dark:border-white/10 transition-all active:scale-95 shadow-sm"
          aria-label="LinkedIn Profile"
        >
          <Linkedin className="w-5 h-5" />
        </a>
      </div>
    </div>
  </footer>
);
