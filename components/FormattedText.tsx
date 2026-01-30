import React from 'react';

export const FormattedText = ({ text }: { text: string }) => {
  if (!text) return null;

  // Process text into segments (paragraphs or lists)
  const segments = text.split('\n\n');

  return (
    <div className="space-y-4">
      {segments.map((segment, sIdx) => {
        const lines = segment.split('\n');
        
        // Detect if this segment is a list
        const isList = lines.every(line => /^[*-]\s|^\d+\.\s/.test(line.trim()));

        if (isList) {
          return (
            <ul key={sIdx} className="space-y-3 my-4 ml-6 list-disc marker:text-violet-500">
              {lines.map((line, lIdx) => (
                <li key={lIdx} className="pl-2">
                  {renderLine(line.trim().replace(/^[*-]\s|^\d+\.\s/, ''))}
                </li>
              ))}
            </ul>
          );
        }

        return (
          <p key={sIdx} className="leading-relaxed text-base">
            {lines.map((line, lIdx) => (
              <React.Fragment key={lIdx}>
                {renderLine(line)}
                {lIdx < lines.length - 1 && <br />}
              </React.Fragment>
            ))}
          </p>
        );
      })}
    </div>
  );
};

function renderLine(line: string) {
  // Simple markdown renderer for bold and italics
  return line.split(/(\*\*.*?\*\*|\*.*?\*)/g).map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className="font-bold text-slate-900 dark:text-white border-b border-violet-500/10">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith('*') && part.endsWith('*')) {
      return <em key={i} className="italic text-slate-700 dark:text-slate-400">{part.slice(1, -1)}</em>;
    }
    return part;
  });
}
