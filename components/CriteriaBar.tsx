import React from 'react';
import { InfoTooltip } from './InfoTooltip';

export const CriteriaBar = ({ score, label, tooltip }: { score: number, label: string, tooltip: string }) => {
  const colorClass = score >= 80 ? 'bg-violet-500' : score >= 50 ? 'bg-amber-500' : 'bg-rose-500';
  const textColorClass = score >= 80 ? 'text-violet-500' : score >= 50 ? 'text-amber-500' : 'text-rose-500';

  return (
    <div className="flex flex-col gap-3.5">
      <div className="flex justify-between items-end">
        <div className="flex items-center">
          <span className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">{label}</span>
          <InfoTooltip text={tooltip} />
        </div>
        <span className={`text-sm font-bold ${textColorClass}`}>{score}/100</span>
      </div>
      <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
        <div 
          className={`h-full ${colorClass} transition-all duration-1000 ease-out shadow-lg`} 
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
};
