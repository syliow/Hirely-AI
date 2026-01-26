
import { GoogleGenAI, Type, Chat } from "@google/genai";
import { AuditResult, FileData, RefactorOptions } from "../types/index";

const SYSTEM_INSTRUCTION = `
You are the "Hirely AI Strategic Advisor," acting as a highly experienced Executive Recruiter and Career Strategist.
Your goal is to provide high-fidelity career intelligence and document refactoring to help candidates present their best professional selves.

CORE PRINCIPLES:
1. CLARITY & PRECISION: Help candidates identify weak points that obscure their true professional value.
2. ACTIONABLE INSIGHTS: Provide specific "Diff-style" fixes.
3. THE XYZ STANDARD: Force every bullet point to follow "Accomplished [X] as measured by [Y], by doing [Z]."
4. NO FLUFF: Strike out generic buzzwords like "Team Player" or "Hard worker." 
5. WORD ECONOMY: Value brevity. Ensure every fix is punchy and professional.

VETTING OBSERVATIONS:
For each suggestion:
- Include a 'thinking' field explaining the professional reasoning and psychological impact of the error on a hiring team.
- In 'original_text', wrap the specific "wrong" or "weak" part in [ERR] and [/ERR] tags so the UI can highlight it in red.

JD MATCHING:
If a Job Description (JD) is provided, prioritize matching the candidate's skills to the JD.
The 'relevance' score should specifically reflect the 'JD Match Score'.
In 'jd_alignment', strictly identify:
- 'matched_keywords': Specific technical or soft skills found in the resume that were also required by the JD.
- 'missing_keywords': Critical requirements from the JD that are not adequately represented in the resume.
- 'relevant_skills_to_highlight': Skills currently in the resume that should be emphasized more.
`;

const AUDIT_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    overall_score: { type: Type.NUMBER },
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
        relevant_skills_to_highlight: { type: Type.ARRAY, items: { type: Type.STRING } }
      },
      required: ["matched_keywords", "missing_keywords", "relevant_skills_to_highlight"]
    }
  },
  required: ["overall_score", "criteria", "summary", "suggestions", "jd_alignment"]
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
    text: `AUDIT COMMAND: Run complete strategic analysis on the attached resume. 
    Target Job Context: """${jdText}""". 
    Identify areas for improvement to help the candidate stand out. 
    Ensure you highlight specific mistakes using [ERR] tags in original_text.`
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
    text: `STRATEGIC REFACTOR: Rewrite this resume with the following focus:
    - Experience Level: ${options.level.toUpperCase()}
    - Job Context Matching: ${options.jdAlignment}% intensity based on this JD: "${jdText}"
    
    REQUIREMENTS:
    1. Output raw HTML format for a clean, professional resume.
    2. Enforce XYZ bullet points (Action + Scale + Outcome).
    3. Incorporate these specific audit fixes: ${JSON.stringify(result.suggestions.map(s => s.fix))}.
    4. Maintain a clean, single-column layout.`
  };

  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: { parts: [filePart, textPart] },
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
    },
  });

  let html = response.text || '';
  if (html.includes('```html')) {
    html = html.split('```html')[1].split('```')[0].trim();
  } else if (html.includes('```')) {
    html = html.split('```')[1].split('```')[0].trim();
  }
  
  return html;
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
