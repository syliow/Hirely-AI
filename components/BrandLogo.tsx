
import React from 'react';

export const BrandLogo = ({ className = "w-10 h-10", size = 24 }: { className?: string, size?: number }) => {
  return (
    <div className={`${className} bg-violet-500/5 dark:bg-violet-500/5 rounded-3xl flex items-center justify-center overflow-hidden transition-all duration-500 border border-violet-500/10 dark:border-white/5 hover:border-violet-500/30 group/logo shadow-sm`}>
      <svg 
        width={size} 
        height={size} 
        viewBox="0 0 512 512" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="group-hover/logo:scale-110 transition-transform duration-700 ease-out"
      >
        <defs>
          <linearGradient id="primaryGradLogo" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{stopColor: '#8b5cf6'}} />
            <stop offset="100%" style={{stopColor: '#6366f1'}} />
          </linearGradient>
          <linearGradient id="secondaryGradLogo" x1="100%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" style={{stopColor: '#a78bfa'}} />
            <stop offset="100%" style={{stopColor: '#7c3aed'}} />
          </linearGradient>
          <filter id="shadowLogo" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="6"/>
            <feOffset dx="0" dy="4" result="offsetblur"/>
            <feComponentTransfer>
              <feFuncA type="linear" slope="0.3"/>
            </feComponentTransfer>
            <feMerge>
              <feMergeNode/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        <g transform="translate(256, 256)">
          <path 
            d="M80,140 L80,-20 C80,-53 53,-80 20,-80 L-140,-80" 
            stroke="url(#secondaryGradLogo)" 
            strokeWidth="64" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
          />
          <g filter="url(#shadowLogo)">
            <path 
              d="M-80,-140 L-80,20 C-80,53 -53,80 -20,80 L140,80" 
              stroke="url(#primaryGradLogo)" 
              strokeWidth="64" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
            />
          </g>
          <circle cx="0" cy="0" r="12" fill="white" />
        </g>
      </svg>
    </div>
  );
};
