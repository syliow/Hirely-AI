import DOMPurify from 'isomorphic-dompurify';

/**
 * Sanitize an HTML string to remove potentially malicious executable content.
 * Prevents XSS by stripping scripts, event handlers, and dangerous tags.
 * Uses isomorphic-dompurify to handle both client and server environments.
 */
export const sanitizeHtml = (html: string): string => {
  if (!html) return '';

  return DOMPurify.sanitize(html, {
    USE_PROFILES: { html: true },
    ADD_ATTR: ['target'], // Allow target attribute for links
  });
};

/**
 * Escapes HTML special characters to prevent XSS when inserting text into HTML.
 */
export const escapeHtml = (text: string): string => {
  if (!text) return '';
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};
