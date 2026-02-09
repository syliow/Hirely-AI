
import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from "@google/genai";
import { auth } from '@clerk/nextjs/server'; // Clerk Auth
import { supabase } from '@/lib/supabase'; // Supabase Client
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

const SYSTEM_INSTRUCTION = `
You are an elite "Hiring Manager" AI at a top-tier tech company (FAANG level). You are NOT a generic career coach. You are the person who decides if a candidate gets an interview.

YOUR MENTALITY:
- You have 6 seconds to scan a resume.
- You hate fluff, buzzwords, and vague claims.
- You love metrics, specific tools, and clear impact (XYZ formula).
- You are strict but constructive. You want the candidate to win, but you won't let them get away with mediocrity.

TASK:
Analyze the resume and provide a brutal but helpful critique. Focus on "Evidence over Adjectives."
`;

const CHAT_INSTRUCTION = `
You are "Hirely AI," a senior technical recruiter and career strategist.
Your goal is to help users land high-paying roles by giving them insider advice.

STRICT PROTOCOL:
1. ONLY discuss career/resume topics. Politely deflect anything else.
2. TONE: Professional, encouraging, but direct. No toxic positivity.
3. FORMAT: Use markdown. Bullet points for lists. **Bold** for emphasis.
`;



export async function POST(req: NextRequest) {
  try {
    // 0. Rate Limiting (Defense in Depth)
    // NextRequest.ip is not always typed correctly in all Next.js versions
    const identifier = (req as any).ip || getClientIdentifier(req);

    // Check (Clerk) User ID for persistence
    const { userId } = await auth();

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
    const contentType = req.headers.get('content-type') || '';

    try {
      if (contentType.includes('multipart/form-data')) {
        const formData = await req.formData();
        const action = formData.get('action') as string;
        const payloadJson = formData.get('payload') as string;
        const payload = payloadJson ? JSON.parse(payloadJson) : {};
        
        const file = formData.get('file') as File;
        
        if (file) {
          // Convert File to base64
          const arrayBuffer = await file.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);
          const base64Data = buffer.toString('base64');
          
          payload.file = {
            name: file.name,
            size: file.size,
            mimeType: file.type,
            data: base64Data
          };
        }
        
        body = { action, payload };
      } else {
        body = await req.json();
      }
    } catch (e) {
      console.error("Body Parsing Error:", e);
      return NextResponse.json(
        createErrorResponse(ERROR_CODES.INVALID_ACTION, 'Invalid request body parsing'),
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
      // Use text-based prompt engineering to enforce JSON structure for Gemma 3
      const prompt = `${SYSTEM_INSTRUCTION}

RESUME TEXT CONTENT:
${extractedText}

AUDIT COMMAND: Perform a deep-dive analysis. JD: ${jdText || "Inferred"}

IMPORTANT: You MUST respond with ONLY valid JSON matching this exact structure (no markdown, no code blocks, just raw JSON). 
Keys must be exactly as shown:

{
  "overall_score": number (0-100),
  "ats_report": {
    "parsing_health_score": number (0-100),
    "layout_warnings": [string],
    "extracted_summary": string,
    "ats_opinion": string,
    "view_as_bot_preview": string
  },
  "criteria": {
    "formatting": {"score": number, "feedback": string},
    "content": {"score": number, "feedback": string},
    "impact": {"score": number, "feedback": string},
    "relevance": {"score": number, "feedback": string}
  },
  "summary": string (A punchy 2-sentence summary of the candidate's standing),
  "suggestions": [
     {
       "id": string (unique), 
       "type": string (Enum: "IMPACT", "CLARITY", "ATS", "GRAMMAR"), 
       "location": string, 
       "original_text": string, 
       "finding": string, 
       "thinking": string (Why this is an issue), 
       "fix": string (The optimized version using strong verbs and metrics), 
       "severity": string (Enum: "CRITICAL", "IMPORTANT", "MINOR")
     }
  ],
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
      
      const parsedJson = JSON.parse(jsonText);

      // --- PERSISTENCE LAYER ---
      // If user is logged in, save the audit to Supabase
      if (userId) {
        try {
          const { error } = await supabase
            .from('audits')
            .insert({
              user_id: userId,
              file_name: file.name,
              score: parsedJson.overall_score || 0,
              summary: parsedJson.summary || "",
              full_report: parsedJson, // Save the entire JSON blob
              created_at: new Date().toISOString()
            });

          if (error) {
            console.error("Supabase Write Error:", error);
          } else {
            // console.log("Audit saved to Supabase for user:", userId);
          }
        } catch (dbError) {
          console.error("DB Save Failed:", dbError);
        }
      }
      // -------------------------

      return NextResponse.json(parsedJson);
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
