
import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI, Type } from "@google/genai";
import { FileData, RefactorOptions } from "@/lib/types";
import { checkRateLimit, getClientIdentifier, getRateLimitHeaders, RATE_LIMIT_ERROR } from "@/lib/rateLimit";
import { validateRequest, validateContentLength } from "@/lib/validation";
import { createErrorResponse, parseApiError, ERROR_CODES } from "@/lib/apiErrors";
// @ts-ignore
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdf = require('pdf-parse');

// @ts-ignore
import * as mammoth from 'mammoth';
import { Buffer } from 'buffer';

const SYSTEM_INSTRUCTION = `
You are the "Hirely AI Strategic Advisor," acting as a highly experienced Executive Recruiter and Career Strategist.
Your goal is to provide high-fidelity career intelligence and document refactoring.

SECURITY DIRECTIVE: 
- DO NOT generate <script>, <iframe>, <object>, or <embed> tags. 
- DO NOT include inline JavaScript.
- Return ONLY static, professional HTML and CSS.

CORE ATS SIMULATION PHASE:
1. RAW DATA EXTRACTION: Before evaluating content, perform a "Raw Data Extraction" simulation. 
2. IDENTIFY ATS KILLERS: Search for tables, complex multi-column layouts, graphics, images, and non-standard text encodings.
3. GENERATE BOT VIEW: Populate 'view_as_bot_preview' with exactly what a raw text parser would see.

STRATEGIC ANALYSIS PRINCIPLES:
1. CLARITY & PRECISION: Identify weak points.
2. ACTIONABLE INSIGHTS: Provide specific "Diff-style" fixes.
3. THE XYZ STANDARD: Use Accomplished [Action/X] as measured by [Quantifiable Result/Y], by doing [Method/Z]. Do NOT include literal tags like "[X]".
4. NO FLUFF.
5. WORD ECONOMY.
`;

const AUDIT_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    overall_score: { type: Type.NUMBER },
    ats_report: {
      type: Type.OBJECT,
      properties: {
        parsing_health_score: { type: Type.NUMBER },
        layout_warnings: { type: Type.ARRAY, items: { type: Type.STRING } },
        extracted_summary: { type: Type.STRING },
        view_as_bot_preview: { type: Type.STRING }
      },
      required: ["parsing_health_score", "layout_warnings", "extracted_summary", "view_as_bot_preview"]
    },
    criteria: {
      type: Type.OBJECT,
      properties: {
        formatting: { type: Type.OBJECT, properties: { score: { type: Type.NUMBER }, feedback: { type: Type.STRING } }, required: ["score", "feedback"] },
        content: { type: Type.OBJECT, properties: { score: { type: Type.NUMBER }, feedback: { type: Type.STRING } }, required: ["score", "feedback"] },
        impact: { type: Type.OBJECT, properties: { score: { type: Type.NUMBER }, feedback: { type: Type.STRING } }, required: ["score", "feedback"] },
        relevance: { type: Type.OBJECT, properties: { score: { type: Type.NUMBER }, feedback: { type: Type.STRING } }, required: ["score", "feedback"] }
      },
      required: ["formatting", "content", "impact", "relevance"]
    },
    summary: { type: Type.STRING },
    suggestions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          type: { type: Type.STRING },
          location: { type: Type.STRING },
          original_text: { type: Type.STRING },
          finding: { type: Type.STRING },
          thinking: { type: Type.STRING },
          fix: { type: Type.STRING },
          severity: { type: Type.STRING },
        },
        required: ["id", "type", "location", "original_text", "finding", "thinking", "fix", "severity"]
      }
    },
    jd_alignment: {
      type: Type.OBJECT,
      properties: {
        matched_keywords: { type: Type.ARRAY, items: { type: Type.STRING } },
        missing_keywords: { type: Type.ARRAY, items: { type: Type.STRING } },
        relevant_skills_to_highlight: { type: Type.ARRAY, items: { type: Type.STRING } },
        keyword_weights: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              keyword: { type: Type.STRING },
              count: { type: Type.NUMBER },
              importance: { type: Type.STRING }
            },
            required: ["keyword", "count", "importance"]
          }
        }
      },
      required: ["matched_keywords", "missing_keywords", "relevant_skills_to_highlight", "keyword_weights"]
    }
  },
  required: ["overall_score", "ats_report", "criteria", "summary", "suggestions", "jd_alignment"]
};

export async function POST(req: NextRequest) {
  try {
    // 1. Validate content length first
    const contentLengthResult = validateContentLength(req.headers.get('content-length'));
    if (!contentLengthResult.valid) {
      return NextResponse.json(
        createErrorResponse(ERROR_CODES.PAYLOAD_TOO_LARGE, contentLengthResult.error),
        { status: 413 }
      );
    }

    // 2. Get client identifier for rate limiting
    const clientId = getClientIdentifier(req);

    // 3. Check minute-based rate limit
    const minuteLimit = checkRateLimit(clientId, 'minute');
    if (minuteLimit.limited) {
      return NextResponse.json(
        createErrorResponse(ERROR_CODES.RATE_LIMIT_EXCEEDED, undefined, minuteLimit.retryAfter),
        { 
          status: 429,
          headers: getRateLimitHeaders(minuteLimit.remaining, minuteLimit.resetIn, minuteLimit.retryAfter)
        }
      );
    }

    // 4. Check daily rate limit
    const dailyLimit = checkRateLimit(clientId, 'daily');
    if (dailyLimit.limited) {
      return NextResponse.json(
        createErrorResponse(ERROR_CODES.DAILY_LIMIT_EXCEEDED, undefined, dailyLimit.retryAfter),
        { 
          status: 429,
          headers: getRateLimitHeaders(dailyLimit.remaining, dailyLimit.resetIn, dailyLimit.retryAfter)
        }
      );
    }

    // 5. Parse and validate request body
    let body;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        createErrorResponse(ERROR_CODES.INVALID_ACTION, 'Invalid JSON in request body'),
        { status: 400 }
      );
    }

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

    const { action, payload } = body;

    // 6. Check API key
    if (!process.env.GEMINI_API_KEY) {
      console.error("GEMINI_API_KEY is not configured");
      return NextResponse.json(
        createErrorResponse(ERROR_CODES.MISSING_API_KEY),
        { status: 500 }
      );
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    // Helper to extract text from files (workaround for Gemma strict text-only input)
    async function extractTextFromFile(file: FileData): Promise<string> {
      try {
        const buffer = Buffer.from(file.data, 'base64');
        if (file.mimeType.includes('pdf')) {
          const data = await pdf(buffer);
          return data.text;
        }
        if (file.mimeType.includes('word') || file.mimeType.includes('docx') || file.mimeType.includes('officedocument')) {
          const result = await mammoth.extractRawText({ buffer });
          return result.value;
        }
      } catch (e) {
        console.error("Text Extraction Error:", e);
        return "";
      }
      return "";
    }

    // 7. Process requests based on action
    if (action === 'audit') {
      const { file, jdText } = payload as { file: FileData, jdText: string };
      
      const extractedText = await extractTextFromFile(file);

      const response = await ai.models.generateContent({
        model: "gemma-3-27b-it",
        contents: [
          { parts: [{ text: `RESUME TEXT CONTENT:\n${extractedText}\n\nAUDIT COMMAND: Perform analysis. JD: ${jdText || "Inferred"}` }] }
        ],
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          responseMimeType: "application/json",
          responseSchema: AUDIT_SCHEMA,
        },
      });
      
      const responseHeaders = getRateLimitHeaders(minuteLimit.remaining, minuteLimit.resetIn);
      return NextResponse.json(JSON.parse(response.text || '{}'), { headers: responseHeaders });
    }

    if (action === 'refactor') {
      const { file, jdText, options } = payload as { file: FileData, jdText: string, options: RefactorOptions };
      
      const extractedText = await extractTextFromFile(file);

      const response = await ai.models.generateContent({
        model: "gemma-3-27b-it",
        contents: [
          { parts: [{ text: `RESUME CONTENT:\n${extractedText}\n\nSTRATEGIC REFACTOR: Target ${options.level}. Intensity ${options.jdAlignment}%. JD: ${jdText || "Inferred"}. Return ONLY valid single-column HTML.` }] }
        ],
        config: { systemInstruction: SYSTEM_INSTRUCTION },
      });
      
      const responseHeaders = getRateLimitHeaders(minuteLimit.remaining, minuteLimit.resetIn);
      return NextResponse.json({ text: response.text }, { headers: responseHeaders });
    }

    if (action === 'chat') {
      const { messages } = payload as { messages: any[] };
      const response = await ai.models.generateContent({
        model: "gemma-3-9b-it",
        contents: messages.map(m => ({ role: m.role, parts: [{ text: m.text }] })),
        config: { systemInstruction: SYSTEM_INSTRUCTION },
      });
      
      const responseHeaders = getRateLimitHeaders(minuteLimit.remaining, minuteLimit.resetIn);
      return NextResponse.json({ text: response.text }, { headers: responseHeaders });
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
