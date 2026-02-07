
import React, { useMemo } from 'react';

export const HighlightedText = ({ text }: { text: string }) => {
  const parts = useMemo(() => text.split(/(\[ERR\].*?\[\/ERR\])/g), [text]);
  return (
    <p className="text-sm text-slate-500 dark:text-slate-500 italic">
      "
      {parts.map((part, i) => {
        if (part.startsWith('[ERR]') && part.endsWith('[/ERR]')) {
          return (
            <span key={i} className="text-rose-500 font-bold underline decoration-rose-500/30">
              {part.slice(5, -6)}
            </span>
          );
        }
        return part;
      })}
      "
    </p>
  );
};
