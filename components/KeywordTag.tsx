
import React from 'react';
import { Check, XCircle } from 'lucide-react';

export const KeywordTag: React.FC<{ text: string, type: 'matched' | 'missing' }> = ({ text, type }) => (
  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tight border transition-colors ${
    type === 'matched' 
    ? 'bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20 hover:bg-violet-500/20' 
    : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20 hover:bg-rose-500/20'
  }`}>
    {type === 'matched' ? <Check className="w-2.5 h-2.5" /> : <XCircle className="w-2.5 h-2.5" />}
    {text}
  </span>
);
