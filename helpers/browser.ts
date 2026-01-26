import { sanitizeHtml } from "./security";

export const openInNewTab = (html: string): boolean => {
  // Ensure the document being written is sanitized
  const sanitizedHtml = sanitizeHtml(html);
  const previewWindow = window.open('', '_blank');
  if (previewWindow) {
    previewWindow.document.write(sanitizedHtml);
    previewWindow.document.close();
    return true;
  }
  return false;
};

export const downloadFile = (content: string, filename: string, mimeType: string): void => {
  // Ensure content being downloaded is sanitized
  const sanitizedContent = sanitizeHtml(content);
  const blob = new Blob(['\ufeff', sanitizedContent], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
