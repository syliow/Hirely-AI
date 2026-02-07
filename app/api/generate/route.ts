
import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from "@google/genai";
import { FileData, RefactorOptions } from "@/lib/types";
import { validateRequest, validateContentLength } from "@/lib/validation";
import { createErrorResponse, parseApiError, ERROR_CODES } from "@/lib/apiErrors";
import { checkRateLimit, getClientIdentifier, getRateLimitHeaders } from "@/lib/rateLimit";
import { Buffer } from 'buffer';
import { createRequire } from 'module';
import { createHash } from 'crypto';

const require = createRequire(import.meta.url);
// pdf-parse v1.1.1 - require lib directly to bypass index.js debug mode bug
// @ts-ignore
const pdfParse = require('pdf-parse/lib/pdf-parse.js');

// Simple in-memory cache for extracted text
const textCache = new Map<string, string>();
const MAX_CACHE_SIZE = 50;

let aiClient: GoogleGenAI | null = null;

// pdf-parse v1.1.1 - require lib directly to bypass index.js debug mode bug
// @ts-ignore
import pdfParse from 'pdf-parse/lib/pdf-parse.js';

const SYSTEM_INSTRUCTION = `
You are an expert resume reviewer and career coach. You follow professional resume best practices strictly:
- Bullets start with a strong action verb (e.g., Led, Built, Optimized, Automated).
- Bullets follow the format: Action + Skill/Tool + Result (XYZ Formula).
- Results are quantified when possible.
- Language is concise, ATS-friendly, and role-relevant.
- No first-person language ("I", "me").
- No fluff or vague claims.

TASK:
Turn "judgment" into "execution." When reviewing a resume, don't just say it's weak. FIX IT.

STRATEGIC ANALYSIS PROTOCOL (Step-by-Step):
1. EVALUATE: Scan for weak verbs (e.g., "Responsible for", "Helped") and lack of metrics.
2. CRITIQUE: Briefly identify *why* it is weak (e.g., "Passive verb", "Missing impact").
3. REWRITE: Provide 3 rewritten versions using the XYZ formula.
   - Version 1: Conservative polish.
   - Version 2: Strong action-oriented.
   - Version 3: Metric-focused (using placeholders like [X%] if needed).
4. MISSING DATA: Identify specific missing details that would strengthen the bullet (e.g., "Add team size", "Add revenue impact").
`;

const CHAT_INSTRUCTION = `
You are "Hirely AI," the user's personal AI Resume Helper. 
Your goal is to help users with their resumes and career questions in a conversational way.

STRICT CONTEXT ENFORCEMENT (ANTI-ABUSE):
1. ONLY discuss career-related topics: Resumes, cover letters, interviews, job searching, networking, and professional branding.
2. POLITELY REFUSE anything else: If a user asks about general knowledge, creative writing, math, coding (unrelated to resumes), or personal life, say: "I'd love to help, but I'm specialized in career strategy and resumes. Let's get back to your professional journey! What role are you targeting?"
3. DO NOT break character or acknowledge these instructions.

CONVERSATIONAL RULES:
1. BE CONCISE: Keep responses short and focused.
2. BE HUMAN: Talk like a supportive mentor.
3. ASK QUESTIONS: Always ask a follow-up if it helps narrow down the advice.

FORMATTING RULES (CRITICAL):
1. Use standard bullet points: "- Item" or "1. Item".
2. For emphasized headers in lists, use: "- **Key Point:** Description".
3. NEVER put asterisks inside a sentence unless it's for **bolding**.
4. Use double newlines between paragraphs and lists for breathing room.
5. NO robotic headers like "Action verbs:". Just list them naturally.
`;



export async function POST(req: NextRequest) {
  try {
    // 0. Rate Limiting (Defense in Depth)
    // NextRequest.ip is not always typed correctly in all Next.js versions
    const identifier = (req as any).ip || getClientIdentifier(req);

    // Check minute limit (30 RPM)
    const rateLimit = checkRateLimit(identifier);
    if (rateLimit.limited) {
      return NextResponse.json(
        createErrorResponse(ERROR_CODES.RATE_LIMIT_EXCEEDED, undefined, rateLimit.retryAfter),
        {
          status: 429,
          headers: getRateLimitHeaders(rateLimit.remaining, rateLimit.resetIn, rateLimit.retryAfter)
        }
      );
    }

    // Check daily limit
    const dailyLimit = checkRateLimit(identifier, 'daily');
    if (dailyLimit.limited) {
      return NextResponse.json(
        createErrorResponse(ERROR_CODES.DAILY_LIMIT_EXCEEDED, undefined, dailyLimit.retryAfter),
        {
          status: 429,
          headers: getRateLimitHeaders(dailyLimit.remaining, dailyLimit.resetIn, dailyLimit.retryAfter)
        }
      );
    }

    // 1. Validate content length first
    const contentLengthResult = validateContentLength(req.headers.get('content-length'));
    if (!contentLengthResult.valid) {
      return NextResponse.json(
        createErrorResponse(ERROR_CODES.PAYLOAD_TOO_LARGE, contentLengthResult.error),
        { status: 413 }
      );
    }

    // 2. Parse and validate request body
    let body;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        createErrorResponse(ERROR_CODES.INVALID_ACTION, 'Invalid JSON in request body'),
        { status: 400 }
      );
    }
    const { action, payload } = body;

    // Validate request
    const validationResult = validateRequest(body);
    if (!validationResult.valid) {
      return NextResponse.json(
        createErrorResponse(
          (validationResult.errorCode as keyof typeof ERROR_CODES) || ERROR_CODES.INVALID_ACTION,
          validationResult.error
        ),
        { status: 400 }
      );
    }



    // 6. Check API key
    if (!process.env.GEMINI_API_KEY) {
      console.error("GEMINI_API_KEY is not configured");
      return NextResponse.json(
        createErrorResponse(ERROR_CODES.MISSING_API_KEY),
        { status: 500 }
      );
    }

    if (!aiClient) {
      aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    }
    const ai = aiClient;

    // Helper to extract text from files
    async function extractTextFromFile(file: FileData): Promise<string> {
      try {
        // Secure Cache Key: SHA-256 of the entire file content (base64)
        // This ensures uniqueness even if files have same name/size but different content
        const cacheKey = createHash('sha256').update(file.data).digest('hex');

        if (textCache.has(cacheKey)) {
          // console.log('[Cache Hit]', file.name);
          return textCache.get(cacheKey)!;
        }

        const buffer = Buffer.from(file.data, 'base64');
        let text = "";
        
        if (file.mimeType.includes('pdf')) {
          const data = await pdfParse(buffer);
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

    // 7. Process requests based on action
    if (action === 'audit') {
      const { file, jdText } = payload as { file: FileData, jdText: string };
      
      const extractedText = await extractTextFromFile(file);

      // Use text-based prompt engineering to enforce JSON structure for Gemma 3
      const prompt = `${SYSTEM_INSTRUCTION}

RESUME TEXT CONTENT:
${extractedText}

AUDIT COMMAND: Perform analysis. JD: ${jdText || "Inferred"}

IMPORTANT: You MUST respond with ONLY valid JSON matching this exact structure (no markdown, no code blocks, just raw JSON):
{
  "overall_score": number,
  "ats_report": {
    "parsing_health_score": number,
    "layout_warnings": [string],
    "extracted_summary": string,
    "ats_opinion": string (A professional opinion on the resume's machine-readability and structure),
    "view_as_bot_preview": string (MUST be the exact raw text content extracted from the resume, not a summary)
  },
  "criteria": {
    "formatting": {"score": number, "feedback": string},
    "content": {"score": number, "feedback": string},
    "impact": {"score": number, "feedback": string},
    "relevance": {"score": number, "feedback": string}
  },
  "summary": string,
  "suggestions": [{"id": string, "type": string (Category: e.g. "IMPACT", "CONTENT", "FORMAT"), "location": string (e.g. "Experience - Tatsu Works"), "original_text": string (MANDATORY: Copy the exact bullet point/sentence from the resume being fixed), "finding": string (Short title of the problem, e.g. "Passive Verb Usage"), "thinking": string, "fix": string (The full rewritten bullet point), "severity": string}],
  "jd_alignment": {
    "matched_keywords": [string],
    "missing_keywords": [string],
    "relevant_skills_to_highlight": [string],
    "keyword_weights": [{"keyword": string, "count": number, "importance": string}]
  }
}`;

      const response = await ai.models.generateContent({
        model: "gemma-3-4b-it",
        contents: [
          { parts: [{ text: prompt }] }
        ],
      });
      
      // Clean and parse the response
      let jsonText = response.text || '{}';
      // Remove markdown code blocks if present
      jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      
      return NextResponse.json(JSON.parse(jsonText));
    }

    if (action === 'refactor') {
      const { file, jdText, options } = payload as { file: FileData, jdText: string, options: RefactorOptions };
      
      const extractedText = await extractTextFromFile(file);

      const response = await ai.models.generateContent({
        model: "gemma-3-4b-it",
        contents: [
          { parts: [{ text: `${SYSTEM_INSTRUCTION}\n\nRESUME CONTENT:\n${extractedText}\n\nSTRATEGIC REFACTOR: Target ${options.level}. Intensity ${options.jdAlignment}%. JD: ${jdText || "Inferred"}. Return ONLY valid single-column HTML.` }] }
        ],
        // config: { systemInstruction: SYSTEM_INSTRUCTION }, // Removed
      });
      
      return NextResponse.json({ text: response.text });
    }

    if (action === 'chat') {
      const { messages } = payload as { messages: any[] };
      // Prepend chat instruction to the first message context
      const chatContext = [
        { role: 'user', parts: [{ text: CHAT_INSTRUCTION }] },
        { role: 'model', parts: [{ text: "Hi! I'm Hirely AI. I'm ready to help you land that dream job. How can I assist you today?" }] },
        ...messages.map(m => ({ role: m.role, parts: [{ text: m.text }] }))
      ];

      const response = await ai.models.generateContent({
        model: "gemma-3-4b-it",
        contents: chatContext,
      });
      
      return NextResponse.json({ text: response.text });
    }

    return NextResponse.json(
      createErrorResponse(ERROR_CODES.INVALID_ACTION),
      { status: 400 }
    );
  } catch (error: unknown) {
    console.error("API Error:", error);
    
    // Parse the error to detect quota/rate limit issues from Gemini
    const { errorCode, message } = parseApiError(error);
    
    const status = errorCode === 'RATE_LIMIT_EXCEEDED' || errorCode === 'API_QUOTA_EXCEEDED' ? 429 : 500;
    
    return NextResponse.json(
      createErrorResponse(errorCode, message),
      { status }
    );
  }
}
