import { sanitizeHtml } from "./security";

export const cleanAIHtml = (html: string): string => {
  let cleaned = html || '';
  
  // Strip markdown code blocks
  if (cleaned.includes('```html')) {
    cleaned = cleaned.split('```html')[1].split('```')[0].trim();
  } else if (cleaned.includes('```')) {
    cleaned = cleaned.split('```')[1].split('```')[0].trim();
  }
  
  // Find the actual start of HTML content (skipping any pre-text)
  const startTag = cleaned.match(/<(header|div|h1|style)/i);
  if (startTag && startTag.index !== undefined) {
    cleaned = cleaned.substring(startTag.index);
  }
  
  // Find the actual end of HTML content (skipping any post-text/metadata)
  const endTag = cleaned.lastIndexOf('>');
  if (endTag !== -1) {
    cleaned = cleaned.substring(0, endTag + 1);
  }
  
  // Security Layer: Final sanitization pass to prevent XSS
  return sanitizeHtml(cleaned.trim());
};
