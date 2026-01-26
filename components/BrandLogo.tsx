
import React from 'react';

export const BrandLogo = ({ className = "w-10 h-10", size = 24 }: { className?: string, size?: number }) => {
  return (
    <div className={`${className} bg-violet-500/10 dark:bg-violet-500/5 rounded-2xl flex items-center justify-center overflow-hidden transition-all duration-500 border border-violet-500/20 dark:border-violet-500/10 hover:border-violet-500/40 group/logo shadow-inner`}>
      <svg 
        width={size} 
        height={size} 
        viewBox="0 0 24 24" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="group-hover/logo:scale-110 group-hover/logo:rotate-[12deg] transition-transform duration-500"
      >
        <path d="M12 12L20 7.5L12 3L4 7.5L12 12Z" className="fill-violet-400 dark:fill-violet-400" />
        <path d="M12 12L20 7.5V16.5L12 21V12Z" className="fill-violet-600 dark:fill-violet-600" />
        <path d="M12 12L4 7.5V16.5L12 21V12Z" className="fill-violet-800 dark:fill-violet-800" />
      </svg>
    </div>
  );
};
