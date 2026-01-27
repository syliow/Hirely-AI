
import React from 'react';
import { Check, XCircle } from 'lucide-react';

export const KeywordTag: React.FC<{ text: string, type: 'matched' | 'missing' }> = ({ text, type }) => (
  <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-tight border transition-colors ${
    type === 'matched' 
    ? 'bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20 hover:bg-violet-500/20' 
    : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20 hover:bg-rose-500/20'
  }`}>
    {type === 'matched' ? <Check className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
    {text}
  </span>
);
