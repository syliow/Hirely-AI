import React from 'react';
import { Github, Linkedin } from 'lucide-react';
import { BrandLogo } from './BrandLogo';

export const Footer = () => (
  <footer className="w-full py-20 px-10 border-t border-slate-200 dark:border-white/5 mt-20 bg-white/60 dark:bg-[#020617]/60 backdrop-blur-md">
    <div className="max-w-6xl mx-auto flex flex-col items-center justify-center text-center gap-12">
      <div className="flex flex-col items-center gap-6">
        <div className="flex items-center gap-4">
          <BrandLogo size={28} className="w-14 h-14" />
          <span className="text-2xl font-black tracking-tighter text-slate-900 dark:text-white uppercase">HIRELY<span className="text-violet-500">.AI</span></span>
        </div>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-500">
          Developed by <a href="https://liowshanyi.site" target="_blank" rel="noopener noreferrer" className="font-black text-violet-500 hover:text-violet-400 transition-colors">Shanyi Liow</a>
        </p>
      </div>
      
      <div className="flex items-center gap-8">
        <a 
          href="https://github.com/syliow" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="p-4 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:text-violet-500 dark:hover:text-violet-400 rounded-2xl border border-slate-200 dark:border-white/10 transition-all active:scale-95 shadow-sm"
          aria-label="GitHub Profile"
        >
          <Github className="w-7 h-7" />
        </a>
        <a 
          href="https://www.linkedin.com/in/syliow/" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="p-4 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:text-violet-500 dark:hover:text-violet-400 rounded-2xl border border-slate-200 dark:border-white/10 transition-all active:scale-95 shadow-sm"
          aria-label="LinkedIn Profile"
        >
          <Linkedin className="w-7 h-7" />
        </a>
      </div>
    </div>
  </footer>
);
