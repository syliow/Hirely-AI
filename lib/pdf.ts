import { Buffer } from 'buffer';
import { Result } from 'pdf-parse';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

/**
 * Parses a PDF buffer and extracts text using pdf-parse.
 *
 * Note: We are directly requiring 'pdf-parse/lib/pdf-parse.js' instead of the main entry point
 * to bypass a bug in pdf-parse v1.1.1 where it attempts to read a test file in certain environments
 * (detected as debug mode).
 *
 * @param buffer The PDF file buffer
 * @returns The parsed PDF data
 */
export async function parsePdf(buffer: Buffer): Promise<Result> {
  // @ts-ignore - pdf-parse does not export types for the internal library file
  const pdfParse = require('pdf-parse/lib/pdf-parse.js');
  return pdfParse(buffer);
}
