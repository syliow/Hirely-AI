export interface TextSegment {
  isList: boolean;
  lines: string[];
}

export const parseTextSegments = (text: string): TextSegment[] => {
  if (!text) return [];

  // Process text into segments (paragraphs or lists)
  const rawSegments = text.split('\n\n');

  return rawSegments.map((segment) => {
    const lines = segment.split('\n');

    // Detect if this segment is a list
    const isList = lines.every(line => /^[*-]\s|^\d+\.\s/.test(line.trim()));

    return {
      isList,
      lines
    };
  });
};
