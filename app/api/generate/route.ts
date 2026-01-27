
import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI, Type } from "@google/genai";
import { FileData, RefactorOptions, AuditResult } from "@/lib/types";

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
    const body = await req.json();
    const { action, payload } = body;

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: "Server misconfigured: Missing API Key" }, { status: 500 });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    if (action === 'audit') {
      const { file, jdText } = payload as { file: FileData, jdText: string };
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
          { parts: [{ inlineData: { data: file.data, mimeType: file.mimeType } }, { text: `AUDIT COMMAND: Perform analysis. JD: ${jdText || "Inferred"}` }] }
        ],
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          responseMimeType: "application/json",
          responseSchema: AUDIT_SCHEMA,
        },
      });
      return NextResponse.json(JSON.parse(response.text || '{}'));
    }

    if (action === 'refactor') {
      const { file, jdText, options } = payload as { file: FileData, jdText: string, options: RefactorOptions };
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
          { parts: [{ inlineData: { data: file.data, mimeType: file.mimeType } }, { text: `STRATEGIC REFACTOR: Target ${options.level}. Intensity ${options.jdAlignment}%. JD: ${jdText || "Inferred"}. Return ONLY valid single-column HTML.` }] }
        ],
        config: { systemInstruction: SYSTEM_INSTRUCTION },
      });
      return NextResponse.json({ text: response.text });
    }

    if (action === 'chat') {
      const { messages } = payload as { messages: any[] };
      const response = await ai.models.generateContent({
        model: "gemini-3-pro-preview",
        contents: messages.map(m => ({ role: m.role, parts: [{ text: m.text }] })),
        config: { systemInstruction: SYSTEM_INSTRUCTION },
      });
      return NextResponse.json({ text: response.text });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
