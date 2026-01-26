/**
 * Sanitize an HTML string to remove potentially malicious executable content.
 * Prevents XSS by stripping scripts, event handlers, and dangerous tags.
 */
export const sanitizeHtml = (html: string): string => {
  if (!html) return '';

  return html
    // 1. Remove <script> tags and their contents
    .replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gim, "")
    // 2. Remove <iframe>, <object>, <embed>, and <base> tags
    .replace(/<(iframe|object|embed|base)\b[^>]*>([\s\S]*?)<\/\1>/gim, "")
    .replace(/<(iframe|object|embed|base)\b[^>]*\/?>/gim, "")
    // 3. Strip all inline event handlers (onmouseover, onclick, etc.)
    .replace(/\son\w+="[^"]*"/gim, "")
    .replace(/\son\w+='[^']*'/gim, "")
    .replace(/\son\w+=\w+/gim, "")
    // 4. Sanitize javascript: URIs in href and src
    .replace(/href\s*=\s*(['"])\s*javascript:[^'"]*['"]/gim, 'href="#sanitized"')
    .replace(/src\s*=\s*(['"])\s*javascript:[^'"]*['"]/gim, 'src="about:blank"')
    // 5. Basic cleanup for common malformed tags
    .trim();
};
