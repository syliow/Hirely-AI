import { GoogleGenAI, Type, Chat } from "@google/genai";
import { AuditResult, FileData, RefactorOptions } from "../types/index";
import { cleanAIHtml } from "../helpers/string";

const SYSTEM_INSTRUCTION = `
You are the "Hirely AI Strategic Advisor," acting as a highly experienced Executive Recruiter and Career Strategist.
Your goal is to provide high-fidelity career intelligence and document refactoring to help candidates present their best professional selves.

SECURITY DIRECTIVE: 
- DO NOT generate <script>, <iframe>, <object>, or <embed> tags. 
- DO NOT include inline JavaScript (e.g., onclick, onmouseover).
- Return ONLY static, professional HTML and CSS.

CORE ATS SIMULATION PHASE:
1. RAW DATA EXTRACTION: Before evaluating content, perform a "Raw Data Extraction" simulation. 
2. IDENTIFY ATS KILLERS: Search for tables, complex multi-column layouts, graphics, images, and non-standard text encodings that often break enterprise parsers.
3. GENERATE BOT VIEW: Populate 'view_as_bot_preview' with exactly what a raw text parser would see after stripping all formatting. IMPORTANT: Provide the full extracted text of the resume, do not truncate or use ellipses.

STRATEGIC ANALYSIS PRINCIPLES:
1. CLARITY & PRECISION: Help candidates identify weak points that obscure their true professional value.
2. ACTIONABLE INSIGHTS: Provide specific "Diff-style" fixes.
3. THE XYZ STANDARD: Force every bullet point to follow the "XYZ formula": Accomplished [Action/X] as measured by [Quantifiable Result/Y], by doing [Method/Z]. 
   CRITICAL CONSTRAINT: Do NOT include literal tags like "[X]", "[Y]", or "[Z]" in the final output. These are internal logic markers ONLY. The final text must be natural, high-performance professional English.
4. NO FLUFF: Strike out generic buzzwords.
5. WORD ECONOMY: Value brevity.

VETTING OBSERVATIONS:
- Use 'thinking' to explain the professional reasoning and technical risk (e.g., parsing failures).
- In 'original_text', wrap weaknesses in [ERR] and [/ERR] tags.

JD MATCHING & KEYWORD DENSITY:
- Priority: Match the candidate's skills to the JD.
- KEYWORD WEIGHT: In 'keyword_weights', identify the frequency and importance of specific keywords from the JD and how often they appear in the resume. 
- IF NO JD IS PROVIDED: Analyze the resume to infer the target industry or role, then identify "Standard Industry Keywords" that the candidate should be ranked for. Weight these based on their importance in that specific industry.
- Map missing keywords to their importance levels (critical, preferred, bonus).
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
        formatting: { 
          type: Type.OBJECT, 
          properties: { score: { type: Type.NUMBER }, feedback: { type: Type.STRING } },
          required: ["score", "feedback"]
        },
        content: { 
          type: Type.OBJECT, 
          properties: { score: { type: Type.NUMBER }, feedback: { type: Type.STRING } },
          required: ["score", "feedback"]
        },
        impact: { 
          type: Type.OBJECT, 
          properties: { score: { type: Type.NUMBER }, feedback: { type: Type.STRING } },
          required: ["score", "feedback"]
        },
        relevance: { 
          type: Type.OBJECT, 
          properties: { score: { type: Type.NUMBER }, feedback: { type: Type.STRING } },
          required: ["score", "feedback"]
        }
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

export const auditResumeFile = async (file: FileData, jdText: string = ""): Promise<AuditResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const filePart = {
    inlineData: {
      data: file.data,
      mimeType: file.mimeType
    }
  };

  const textPart = {
    text: `AUDIT COMMAND: Perform a Raw Data Extraction simulation and complete strategic analysis. 
    Context: """${jdText || "NO JOB DESCRIPTION PROVIDED. Analyze resume against standard industry benchmarks for inferred role."}""". 
    Identify ATS Killers and calculate Keyword Weighting.`
  };

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: { parts: [filePart, textPart] },
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      responseMimeType: "application/json",
      responseSchema: AUDIT_SCHEMA,
    },
  });

  return JSON.parse(response.text || '{}');
};

export const refactorResume = async (file: FileData, result: AuditResult, jdText: string, options: RefactorOptions): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const filePart = {
    inlineData: {
      data: file.data,
      mimeType: file.mimeType
    }
  };

  const textPart = {
    text: `STRATEGIC REFACTOR: Rewrite this resume for an ${options.level.toUpperCase()} role.
    Target intensity: ${options.jdAlignment}% matching with JD: "${jdText || "Inferred Industry Standards"}".
    
    STRICT FORMATTING RULES:
    1. Output MUST be ONLY valid HTML.
    2. DO NOT include any introductory text, summary of changes, JSON blocks, or meta-comments.
    3. Bullet points MUST follow XYZ structure naturally without literal "[X]", "[Y]", or "[Z]" tags.
    4. Provide a standard, professional single-column resume layout using clean semantic tags like <header>, <h1>, <h2>, <ul>, <li>, and <p>.
    5. Return ONLY the resume content. Any non-HTML text will be rejected.`
  };

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: { parts: [filePart, textPart] },
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
    },
  });

  return cleanAIHtml(response.text || '');
};

export const startManagerChat = (): Chat => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  return ai.chats.create({
    model: 'gemini-3-pro-preview',
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
    },
  });
};