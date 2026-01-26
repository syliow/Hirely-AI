
export type Severity = 'high' | 'medium' | 'low';
export type SuggestionType = 'formatting' | 'content' | 'keyword' | 'ats_compatibility';

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

export interface ATSReport {
  parsing_health_score: number;
  layout_warnings: string[];
  extracted_summary: string;
  view_as_bot_preview: string;
}

export interface KeywordWeight {
  keyword: string;
  count: number;
  importance: 'critical' | 'preferred' | 'bonus';
}

export interface JDAlignment {
  matched_keywords: string[];
  missing_keywords: string[];
  relevant_skills_to_highlight: string[];
  keyword_weights: KeywordWeight[];
}

export interface CriteriaScore {
  label: string;
  score: number; // 0-100
  feedback: string;
}

export interface AuditResult {
  overall_score: number;
  ats_report: ATSReport;
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
