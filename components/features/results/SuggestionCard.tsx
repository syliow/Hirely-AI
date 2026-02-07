import React, { memo } from 'react';
import { Suggestion } from '@/lib/types';
import {
  AlertTriangle,
  Lightbulb,
  CheckCircle2,
  BrainCircuit,
  Copy
} from 'lucide-react';

interface SuggestionCardProps {
  suggestion: Suggestion;
}

export const SuggestionCard = memo(({ suggestion }: SuggestionCardProps) => {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const cleanFixText = suggestion.fix.replace(/^[^:]+:\s*/, '').replace(/^['"]|['"]$/g, '');

  return (
    <div className="bg-white/90 dark:bg-[#0f172a]/40 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-[48px] p-10 lg:p-12 hover:shadow-2xl hover:scale-[1.01] transition-all duration-300 space-y-10 group/card">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-10">
        <div className="flex items-center gap-8">
          <div className={`w-14 h-14 rounded-[20px] flex items-center justify-center shrink-0 border transition-colors ${suggestion.severity === 'high' ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' : suggestion.severity === 'medium' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'}`}>
            {suggestion.severity === 'high' ? <AlertTriangle className="w-6 h-6" /> : suggestion.severity === 'medium' ? <Lightbulb className="w-6 h-6" /> : <CheckCircle2 className="w-6 h-6" />}
          </div>
          <div>
            <h4 className="text-lg font-bold text-slate-900 dark:text-white line-clamp-1">{suggestion.finding}</h4>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mt-1.5 opacity-70 flex items-center gap-2">
               <span className="text-violet-500">{suggestion.type}</span> • <span title={suggestion.location} className="max-w-[200px] truncate">{suggestion.location.split(/[●•|]/)[0].trim()}</span>
            </p>
          </div>
        </div>
        <span className={`text-[10px] font-black uppercase tracking-widest px-5 py-2.5 rounded-xl border ${suggestion.severity === 'high' ? 'bg-rose-500/5 text-rose-500 border-rose-500/20' : suggestion.severity === 'medium' ? 'bg-amber-500/5 text-amber-500 border-amber-500/20' : 'bg-emerald-500/5 text-emerald-500 border-emerald-500/20'}`}>
          {suggestion.severity === 'high' ? 'CRITICAL' : suggestion.severity === 'medium' ? 'POLISH' : 'OPTIMIZE'}
        </span>
      </div>

      <div className="bg-slate-50 dark:bg-black/30 border-l-4 border-violet-500/40 p-6 rounded-r-2xl group-hover/card:bg-violet-500/[0.03] transition-colors">
        <div className="flex items-center gap-3 mb-3"><BrainCircuit className="w-4 h-4 text-violet-500" /><span className="text-[10px] font-black uppercase tracking-widest text-violet-500/70">Expert Thinking</span></div>
        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed italic">"{suggestion.thinking}"</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/5 rounded-3xl p-8 transform transition-all hover:bg-rose-50 dark:hover:bg-rose-900/10"><span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-600 block mb-4">Original Entry</span><p className="font-mono text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{suggestion.original_text}</p></div>
        <div className="bg-emerald-500/[0.04] border border-emerald-500/10 rounded-3xl p-8 relative group">
          <div className="flex items-center justify-between mb-4"><span className="text-[10px] font-black uppercase tracking-widest text-emerald-600/80 dark:text-emerald-400/80">Optimized Refactoring</span><button onClick={() => copyToClipboard(cleanFixText)} className="text-[10px] font-black text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 transition-all flex items-center gap-2 px-4 py-2 bg-emerald-500/10 rounded-xl hover:bg-emerald-500/20"><Copy className="w-3 h-3" /> COPY</button></div>
          <p className="text-sm font-bold text-slate-800 dark:text-emerald-50 leading-relaxed font-mono">{suggestion.fix}</p>
        </div>
      </div>
    </div>
  );
});

SuggestionCard.displayName = 'SuggestionCard';
