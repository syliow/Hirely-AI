
export type Severity = 'high' | 'medium' | 'low';
export type SuggestionType = 'formatting' | 'content' | 'keyword';

export interface Suggestion {
  id: string;
  type: SuggestionType;
  location: string;
  original_text: string;
  finding: string;
  fix: string;
  thinking: string; // Reasoning behind the suggestion
  severity: Severity;
}

export interface JDAlignment {
  matched_keywords: string[];
  missing_keywords: string[];
  relevant_skills_to_highlight: string[];
}

export interface CriteriaScore {
  label: string;
  score: number; // 0-100
  feedback: string;
}

export interface AuditResult {
  overall_score: number;
  criteria: {
    formatting: CriteriaScore;
    content: CriteriaScore;
    impact: CriteriaScore;
    relevance: CriteriaScore;
  };
  summary: string;
  suggestions: Suggestion[];
  jd_alignment: JDAlignment;
}

export interface RefactorOptions {
  level: 'junior' | 'mid' | 'senior' | 'staff';
  jdAlignment: number; // 1-100
}

export interface Message {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export interface FileData {
  name: string;
  size: number;
  data: string; // base64
  mimeType: string;
}
