import React, { useMemo, memo } from 'react';
import { parseTextSegments } from '@/helpers/textParser';

const MARKDOWN_REGEX = /(\*\*.*?\*\*|\*.*?\*)/g;
const LIST_REPLACEMENT_REGEX = /^[*-]\s|^\d+\.\s/;

export const FormattedText = memo(({ text }: { text: string }) => {
  const segments = useMemo(() => parseTextSegments(text), [text]);

  if (!text) return null;

  return (
    <div className="space-y-4">
      {segments.map((segment, sIdx) => {
        const { isList, lines } = segment;

        if (isList) {
          return (
            <ul key={sIdx} className="space-y-3 my-4 ml-6 list-disc marker:text-violet-500">
              {lines.map((line, lIdx) => (
                <li key={lIdx} className="pl-2">
                  {renderLine(line.trim().replace(LIST_REPLACEMENT_REGEX, ''))}
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
});

FormattedText.displayName = 'FormattedText';

function renderLine(line: string) {
  // Simple markdown renderer for bold and italics
  return line.split(MARKDOWN_REGEX).map((part, i) => {
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
