export interface TextSegment {
  isList: boolean;
  lines: string[];
}

const LIST_ITEM_REGEX = /^[*-]\s|^\d+\.\s/;

export const parseTextSegments = (text: string): TextSegment[] => {
  if (!text) return [];

  // Process text into segments (paragraphs or lists)
  const rawSegments = text.split('\n\n');

  return rawSegments.map((segment) => {
    const lines = segment.split('\n');

    // Detect if this segment is a list
    const isList = lines.every(line => LIST_ITEM_REGEX.test(line.trim()));

    return {
      isList,
      lines
    };
  });
};
