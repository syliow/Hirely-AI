import React from 'react';

export const FormattedText = ({ text }: { text: string }) => {
  return (
    <div className="space-y-6">
      {text.split('\n\n').map((paragraph, pIdx) => (
        <p key={pIdx} className="leading-relaxed text-base">
          {paragraph.split('\n').map((line, lIdx) => (
            <React.Fragment key={lIdx}>
              {line.split(/(\*\*.*?\*\*)/g).map((part, i) => {
                if (part.startsWith('**') && part.endsWith('**')) {
                  return <strong key={i} className="font-bold text-slate-900 dark:text-white underline decoration-violet-500/20">{part.slice(2, -2)}</strong>;
                }
                return part;
              })}
              {lIdx < paragraph.split('\n').length - 1 && <br />}
            </React.Fragment>
          ))}
        </p>
      ))}
    </div>
  );
};
