import React, { useState, useMemo } from 'react';
import { AuditResult } from '@/lib/types';
import { CriteriaBar } from '@/components/CriteriaBar';
import { HighlightedText } from '@/components/HighlightedText';
import { SuggestionCard } from './SuggestionCard';
import { 
  Eye, Download, RefreshCw, Bot, Terminal, AlertTriangle, 
  Target, CheckCircle2, AlertCircle, ArrowUpRight, Search, 
  Copy, Sparkles, FileDown, EyeOff
} from 'lucide-react';

interface AuditResultsProps {
  result: AuditResult;
  readyHtml: string | null;
  fileName?: string;
  onReset: () => void;
  onRefactor: (type: 'pdf' | 'docx') => void;
  onPreview: (html: string) => void;
}

export const AuditResults: React.FC<AuditResultsProps> = ({ 
  result, 
  readyHtml, 
  fileName, 
  onReset, 
  onRefactor, 
  onPreview 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showBotView, setShowBotView] = useState(false);
  const [showRefactorOptions, setShowRefactorOptions] = useState(false);

  const sortedSuggestions = useMemo(() => {
    if (!result) return [];
    return [...result.suggestions].sort((a, b) => {
      const priority = { high: 0, medium: 1, low: 2 };
      return priority[a.severity] - priority[b.severity];
    });
  }, [result]);

  const filteredSuggestions = useMemo(() => {
    if (!searchTerm.trim()) return sortedSuggestions;
    const term = searchTerm.toLowerCase();
    return sortedSuggestions.filter(s =>
      s.finding.toLowerCase().includes(term) || 
      s.fix.toLowerCase().includes(term) || 
      s.location.toLowerCase().includes(term)
    );
  }, [sortedSuggestions, searchTerm]);

  return (
    <div className="space-y-8 md:space-y-16 animate-in fade-in slide-in-from-bottom-8 duration-700">
      
      <div className="flex flex-col gap-8 md:gap-16">
        <section className="bg-white/90 dark:bg-[#080d1a]/90 backdrop-blur-2xl border border-slate-200 dark:border-white/10 rounded-[40px] md:rounded-[56px] p-6 md:p-10 lg:p-14 shadow-2xl">
            <div className="space-y-6 md:space-y-8 max-w-5xl mx-auto flex flex-col items-center">
              <div className="space-y-2 text-center">
                <div className="flex items-baseline justify-center gap-2 md:gap-4">
                  <span className="text-6xl md:text-8xl lg:text-[7rem] font-black text-slate-900 dark:text-white tracking-tighter leading-none">{result.overall_score}</span>
                  <span className="text-xl md:text-3xl font-bold text-slate-400 dark:text-slate-600">/ 100</span>
                </div>
                <h3 className="text-[10px] md:text-xs font-black uppercase tracking-[0.4em] text-violet-500">Professional Readiness Index</h3>
              </div>

              <div className="space-y-3 w-full">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-600">Executive Summary</h4>
                <p className="text-base md:text-lg lg:text-xl font-medium leading-relaxed text-slate-700 dark:text-slate-200 px-4 md:px-8">"{result.summary}"</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 lg:gap-x-16 gap-y-8 w-full pt-6">
              <CriteriaBar score={result.criteria.formatting.score} label="ATS Parsing Layout" tooltip="Ensures your resume layout is machine-readable." />
              <CriteriaBar score={result.criteria.content.score} label="Professional Narrative" tooltip="The clarity and logical flow of your experience." />
              <CriteriaBar score={result.criteria.impact.score} label="Quantifiable Impact" tooltip="Measurement of results using the XYZ formula." />
              <CriteriaBar score={result.criteria.relevance.score} label="Strategic Alignment" tooltip="Matching your core skills to the market demands." />
            </div>

            <div className="w-full pt-6 md:pt-10 flex flex-col items-center gap-6 relative">
              <div className="relative w-full max-w-xl">
                {readyHtml ? (
                   <button onClick={() => onPreview(readyHtml)} className="w-full flex items-center justify-center gap-3 md:gap-5 px-6 py-4 md:px-10 md:py-6 bg-emerald-500 hover:bg-emerald-400 text-white rounded-[24px] md:rounded-[28px] text-xs md:text-sm font-black uppercase tracking-[0.2em] shadow-2xl shadow-emerald-500/40 transition-all active:scale-95 animate-bounce">
                     <Eye className="w-5 h-5 md:w-7 md:h-7" /> View Optimized Resume
                   </button>
                ) : (
                  <div className="relative">
                    <button onClick={() => setShowRefactorOptions(!showRefactorOptions)} className="w-full flex items-center justify-center gap-3 md:gap-5 px-6 py-4 md:px-10 md:py-6 bg-violet-600 hover:bg-violet-500 text-white rounded-[24px] md:rounded-[28px] text-xs md:text-sm font-black uppercase tracking-[0.2em] shadow-2xl shadow-violet-500/40 transition-all active:scale-95">
                      <Download className="w-5 h-5 md:w-7 md:h-7" /> Download Resume
                    </button>
                    {showRefactorOptions && (
                      <div className="absolute bottom-full left-0 right-0 mb-6 bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-white/10 rounded-[28px] p-3 shadow-3xl z-[100] animate-in fade-in slide-in-from-bottom-6">
                        <button onClick={() => onRefactor('pdf')} className="w-full flex items-center gap-4 px-6 py-4 hover:bg-slate-50 dark:hover:bg-white/10 rounded-2xl text-[13px] font-black uppercase tracking-widest text-slate-700 dark:text-slate-200 transition-colors">
                          <Sparkles className="w-5 h-5 text-violet-500" /> Optimize into PDF
                        </button>
                        <button onClick={() => onRefactor('docx')} className="w-full flex items-center gap-4 px-6 py-4 hover:bg-slate-50 dark:hover:bg-white/10 rounded-2xl text-[13px] font-black uppercase tracking-widest text-slate-700 dark:text-slate-200 transition-colors">
                          <FileDown className="w-5 h-5 text-blue-500" /> Download as Word (.docx)
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <button onClick={onReset} className="flex items-center gap-4 text-xs md:text-sm font-black uppercase tracking-widest text-slate-400 hover:text-violet-500 transition-colors mt-6"><RefreshCw className="w-4 h-4 md:w-5 md:h-5" /> Start New Audit</button>
            </div>
          </div>
        </section>

        <section className="bg-slate-900 dark:bg-black border border-white/10 rounded-[40px] md:rounded-[56px] p-6 md:p-12 flex flex-col shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 md:p-10"><Bot className="w-8 h-8 md:w-12 md:h-12 text-violet-500/20 group-hover:text-violet-500/40 transition-colors" /></div>
          <h3 className="text-xs md:text-sm font-black uppercase tracking-widest text-slate-400 mb-8 flex items-center gap-4"><Terminal className="w-5 h-5 text-emerald-500" /> ATS Compatibility Report</h3>
          <div className="space-y-6 md:space-y-10">
            <div className="flex items-baseline gap-4">
              <span className="text-4xl md:text-6xl font-black text-white">{result.ats_report.parsing_health_score}%</span>
              <span className="text-[10px] md:text-xs font-bold text-emerald-500 uppercase tracking-widest">Health Score</span>
            </div>
            
            {(result.ats_report as any).ats_opinion && (
              <div className="text-sm text-slate-300 bg-white/5 p-6 rounded-2xl border border-white/10 italic leading-relaxed">
                "{ (result.ats_report as any).ats_opinion }"
              </div>
            )}

            <div className="space-y-4">
              {result.ats_report.layout_warnings.map((warn, i) => (
                <div key={i} className="flex items-start gap-4 text-sm text-slate-400 bg-white/5 p-4 rounded-2xl border border-white/5">
                  <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-1" /> {warn}
                </div>
              ))}
              {result.ats_report.layout_warnings.length === 0 && (
                <div className="text-sm text-emerald-500 bg-emerald-500/10 p-4 rounded-2xl border border-emerald-500/20">Resume layout is fully optimized for machine extraction.</div>
              )}
            </div>
            <button onClick={() => setShowBotView(!showBotView)} className="w-full flex items-center justify-center gap-4 py-6 border border-white/10 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-300 hover:bg-white/10 transition-all mt-6">
              {showBotView ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />} {showBotView ? 'Hide Raw View' : 'Inspect Raw Bot View'}
            </button>
          </div>
        </section>
      </div>

      {showBotView && (
        <section className="bg-black border border-violet-500/20 rounded-[32px] md:rounded-[40px] p-6 md:p-12 font-mono text-xs md:text-base text-emerald-500/80 animate-in zoom-in-95 shadow-inner relative group">
          <div className="flex items-center justify-between mb-8 border-b border-white/10 pb-6">
             <span className="text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-[0.3em]">{fileName ? fileName.replace('.pdf', '') : 'RESUME'}_RAW_TEXT</span>
             <button onClick={() => navigator.clipboard.writeText(result.ats_report.view_as_bot_preview)} className="text-slate-500 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/10">
               <Copy className="w-5 h-5" />
             </button>
          </div>
          <div className="max-h-[600px] overflow-y-auto custom-scrollbar leading-relaxed"><pre className="whitespace-pre-wrap">{result.ats_report.view_as_bot_preview}</pre></div>
        </section>
      )}

      <section className="bg-white/50 dark:bg-[#0f172a]/20 backdrop-blur-md border border-slate-200 dark:border-white/10 rounded-[40px] md:rounded-[64px] p-6 md:p-12 lg:p-16 space-y-12 shadow-lg">
        <div className="flex items-center gap-4 md:gap-6 px-4">
          <Target className="w-6 h-6 md:w-8 md:h-8 text-slate-400 dark:text-slate-600" />
          <h3 className="text-xs md:text-sm font-black uppercase tracking-[0.5em] text-slate-400 dark:text-slate-600">Keyword Strategic Map</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16">
          <div className="space-y-8">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-4">
              <span className="text-xs md:text-sm font-black uppercase tracking-widest text-violet-500 flex items-center gap-4"><CheckCircle2 className="w-5 h-5" /> Core Competencies</span>
              <span className="text-[10px] md:text-xs font-bold text-slate-400">Match Rank</span>
            </div>
            <div className="flex flex-wrap gap-2 md:gap-4">
              {result.jd_alignment.keyword_weights.filter(kw => result.jd_alignment.matched_keywords.includes(kw.keyword)).map((kw, i) => (
                <div key={i} className="flex items-center gap-4 px-4 py-2 md:px-6 md:py-3 bg-violet-500/10 border border-violet-500/20 rounded-full text-xs md:text-sm font-bold uppercase text-violet-600 dark:text-violet-400">
                  {kw.keyword} <span className="bg-violet-500 text-white px-2 py-0.5 md:px-3 md:py-1 rounded-full text-[10px] md:text-xs">{kw.count}x</span>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-8">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-4">
              <span className="text-xs md:text-sm font-black uppercase tracking-widest text-rose-500 flex items-center gap-4"><AlertCircle className="w-5 h-5" /> Skill Gaps</span>
              <span className="text-[10px] md:text-xs font-bold text-slate-400">Weight</span>
            </div>
            <div className="flex flex-wrap gap-2 md:gap-4">
              {result.jd_alignment.keyword_weights.filter(kw => result.jd_alignment.missing_keywords.includes(kw.keyword)).map((kw, i) => (
                <div key={i} className="flex items-center gap-4 px-4 py-2 md:px-6 md:py-3 bg-rose-500/10 border border-rose-500/20 rounded-full text-xs md:text-sm font-bold uppercase text-rose-600 dark:text-rose-400">
                  {kw.keyword} <span className="bg-rose-500 text-white px-2 py-0.5 md:px-3 md:py-1 rounded-full text-[10px] md:text-xs uppercase">{kw.importance}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="space-y-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 px-4 md:px-8">
          <div className="flex items-center gap-4 md:gap-6">
            <ArrowUpRight className="w-6 h-6 md:w-8 md:h-8 text-slate-400 dark:text-slate-600" />
            <h3 className="text-xs md:text-sm font-black uppercase tracking-[0.5em] text-slate-400 dark:text-slate-600">Strategic Recommendations</h3>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:gap-10">
          {filteredSuggestions.map((suggestion) => (
            <SuggestionCard key={suggestion.id} suggestion={suggestion} />
          ))}
        </div>
      </div>
    </div>
  );
};
