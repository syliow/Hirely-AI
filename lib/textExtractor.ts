import { Buffer } from 'buffer';
import { createHash } from 'crypto';
import { FileData } from './types';
import { parsePdf } from './pdf';

const textCache = new Map<string, string>();
const MAX_CACHE_SIZE = 50;

/**
 * Extracts text from a file (PDF or Word) using the appropriate parser.
 * Caches results in memory based on file content hash.
 *
 * Optimization: Accepts an optional `fileBuffer` to avoid base64 conversion overhead.
 */
export async function extractTextFromFile(file: FileData, fileBuffer?: Buffer): Promise<string> {
  try {
    // 1. Resolve buffer (from argument or base64)
    let buffer: Buffer;

    if (fileBuffer) {
      buffer = fileBuffer;
    } else if (file.data) {
      buffer = Buffer.from(file.data, 'base64');
    } else {
      // Fallback or error
      throw new Error("No file content provided (buffer or base64 data missing)");
    }

    // 2. Generate cache key from buffer (SHA-256)
    // Secure Cache Key: SHA-256 of the binary content
    // This is more efficient than hashing the base64 string
    const cacheKey = createHash('sha256').update(buffer).digest('hex');

    if (textCache.has(cacheKey)) {
      // console.log('[Cache Hit]', file.name);
      return textCache.get(cacheKey)!;
    }

    let text = "";

    // 3. Extract text based on mime type
    if (file.mimeType.includes('pdf')) {
      const data = await parsePdf(buffer);
      text = data.text || '';
      console.log('[PDF] Extracted', text.length, 'characters from', data.numpages, 'pages');
    } else if (file.mimeType.includes('word') || file.mimeType.includes('docx') || file.mimeType.includes('officedocument')) {
      // Lazy load mammoth for performance (optimize cold start)
      const mammothModule = await import('mammoth');
      const mammoth = (mammothModule as any).default || mammothModule;
      const result = await mammoth.extractRawText({ buffer });
      text = result.value || '';
    }

    // Clean text: remove excessive newlines/spaces
    text = text.replace(/\s+/g, ' ').trim();

    if (text.length < 50) {
      throw new Error("File contains insufficient text (likely a scanned image). Please use a text-based PDF/DOCX.");
    }

    // Update cache
    if (textCache.size >= MAX_CACHE_SIZE) {
      // Evict oldest entry
      const firstKey = textCache.keys().next().value;
      if (firstKey) textCache.delete(firstKey);
    }
    textCache.set(cacheKey, text);

    return text;
  } catch (e: any) {
    console.error("Text Extraction Error:", e);
    // Propagate the specific error message if it's our own
    if (e.message.includes("scanned image")) throw e;
    return "";
  }
}
