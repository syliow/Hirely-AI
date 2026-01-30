import React, { useState, useMemo } from 'react';
import { AuditResult } from '@/lib/types';
import { CriteriaBar } from '@/components/CriteriaBar';
import { HighlightedText } from '@/components/HighlightedText';
import { 
  Eye, Download, RefreshCw, Bot, Terminal, AlertTriangle, 
  Target, CheckCircle2, AlertCircle, ArrowUpRight, Search, 
  Lightbulb, BrainCircuit, Copy, Sparkles, FileDown, EyeOff 
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

  const filteredSuggestions = useMemo(() => {
    if (!result) return [];
    const base = [...result.suggestions].sort((a, b) => {
      const priority = { high: 0, medium: 1, low: 2 };
      return priority[a.severity] - priority[b.severity];
    });

    if (!searchTerm.trim()) return base;
    const term = searchTerm.toLowerCase();
    return base.filter(s => 
      s.finding.toLowerCase().includes(term) || 
      s.fix.toLowerCase().includes(term) || 
      s.location.toLowerCase().includes(term)
    );
  }, [result, searchTerm]);

  return (
    <div className="space-y-16 animate-in fade-in slide-in-from-bottom-8 duration-700">
      
      <div className="flex flex-col gap-16">
        <section className="bg-white/90 dark:bg-[#080d1a]/90 backdrop-blur-2xl border border-slate-200 dark:border-white/10 rounded-[56px] p-10 lg:p-14 shadow-2xl">
            <div className="space-y-8 max-w-5xl mx-auto flex flex-col items-center">
              <div className="space-y-2">
                <div className="flex items-baseline justify-center gap-4">
                  <span className="text-8xl lg:text-[7rem] font-black text-slate-900 dark:text-white tracking-tighter leading-none">{result.overall_score}</span>
                  <span className="text-3xl font-bold text-slate-400 dark:text-slate-600">/ 100</span>
                </div>
                <h3 className="text-xs font-black uppercase tracking-[0.4em] text-violet-500">Professional Readiness Index</h3>
              </div>

              <div className="space-y-3 w-full">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-600">Executive Summary</h4>
                <p className="text-lg md:text-xl font-medium leading-relaxed text-slate-700 dark:text-slate-200 px-8">"{result.summary}"</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-16 gap-y-8 w-full pt-6">
              <CriteriaBar score={result.criteria.formatting.score} label="ATS Parsing Layout" tooltip="Ensures your resume layout is machine-readable." />
              <CriteriaBar score={result.criteria.content.score} label="Professional Narrative" tooltip="The clarity and logical flow of your experience." />
              <CriteriaBar score={result.criteria.impact.score} label="Quantifiable Impact" tooltip="Measurement of results using the XYZ formula." />
              <CriteriaBar score={result.criteria.relevance.score} label="Strategic Alignment" tooltip="Matching your core skills to the market demands." />
            </div>

            <div className="w-full pt-10 flex flex-col items-center gap-6 relative">
              <div className="relative w-full max-w-xl">
                {readyHtml ? (
                   <button onClick={() => onPreview(readyHtml)} className="w-full flex items-center justify-center gap-5 px-10 py-6 bg-emerald-500 hover:bg-emerald-400 text-white rounded-[28px] text-sm font-black uppercase tracking-[0.2em] shadow-2xl shadow-emerald-500/40 transition-all active:scale-95 animate-bounce">
                     <Eye className="w-7 h-7" /> View Optimized Resume
                   </button>
                ) : (
                  <div className="relative">
                    <button onClick={() => setShowRefactorOptions(!showRefactorOptions)} className="w-full flex items-center justify-center gap-5 px-10 py-6 bg-violet-600 hover:bg-violet-500 text-white rounded-[28px] text-sm font-black uppercase tracking-[0.2em] shadow-2xl shadow-violet-500/40 transition-all active:scale-95">
                      <Download className="w-7 h-7" /> Download Resume
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
              <button onClick={onReset} className="flex items-center gap-4 text-sm font-black uppercase tracking-widest text-slate-400 hover:text-violet-500 transition-colors mt-6"><RefreshCw className="w-5 h-5" /> Start New Audit</button>
            </div>
          </div>
        </section>

        <section className="bg-slate-900 dark:bg-black border border-white/10 rounded-[56px] p-12 flex flex-col shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-10"><Bot className="w-12 h-12 text-violet-500/20 group-hover:text-violet-500/40 transition-colors" /></div>
          <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-8 flex items-center gap-4"><Terminal className="w-5 h-5 text-emerald-500" /> ATS Compatibility Report</h3>
          <div className="space-y-10">
            <div className="flex items-baseline gap-4">
              <span className="text-6xl font-black text-white">{result.ats_report.parsing_health_score}%</span>
              <span className="text-xs font-bold text-emerald-500 uppercase tracking-widest">Health Score</span>
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
        <section className="bg-black border border-violet-500/20 rounded-[40px] p-12 font-mono text-base text-emerald-500/80 animate-in zoom-in-95 shadow-inner relative group">
          <div className="flex items-center justify-between mb-8 border-b border-white/10 pb-6">
             <span className="text-xs font-bold text-slate-500 uppercase tracking-[0.3em]">{fileName ? fileName.replace('.pdf', '') : 'RESUME'}_RAW_TEXT</span>
             <button onClick={() => navigator.clipboard.writeText(result.ats_report.view_as_bot_preview)} className="text-slate-500 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/10">
               <Copy className="w-5 h-5" />
             </button>
          </div>
          <div className="max-h-[600px] overflow-y-auto custom-scrollbar leading-relaxed"><pre className="whitespace-pre-wrap">{result.ats_report.view_as_bot_preview}</pre></div>
        </section>
      )}

      <section className="bg-white/50 dark:bg-[#0f172a]/20 backdrop-blur-md border border-slate-200 dark:border-white/10 rounded-[64px] p-12 lg:p-16 space-y-12 shadow-lg">
        <div className="flex items-center gap-6 px-4">
          <Target className="w-8 h-8 text-slate-400 dark:text-slate-600" />
          <h3 className="text-sm font-black uppercase tracking-[0.5em] text-slate-400 dark:text-slate-600">Keyword Strategic Map</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
          <div className="space-y-8">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-4">
              <span className="text-sm font-black uppercase tracking-widest text-violet-500 flex items-center gap-4"><CheckCircle2 className="w-5 h-5" /> Core Competencies</span>
              <span className="text-xs font-bold text-slate-400">Match Rank</span>
            </div>
            <div className="flex flex-wrap gap-4">
              {result.jd_alignment.keyword_weights.filter(kw => result.jd_alignment.matched_keywords.includes(kw.keyword)).map((kw, i) => (
                <div key={i} className="flex items-center gap-4 px-6 py-3 bg-violet-500/10 border border-violet-500/20 rounded-full text-sm font-bold uppercase text-violet-600 dark:text-violet-400">
                  {kw.keyword} <span className="bg-violet-500 text-white px-3 py-1 rounded-full text-xs">{kw.count}x</span>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-8">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-4">
              <span className="text-sm font-black uppercase tracking-widest text-rose-500 flex items-center gap-4"><AlertCircle className="w-5 h-5" /> Skill Gaps</span>
              <span className="text-xs font-bold text-slate-400">Weight</span>
            </div>
            <div className="flex flex-wrap gap-4">
              {result.jd_alignment.keyword_weights.filter(kw => result.jd_alignment.missing_keywords.includes(kw.keyword)).map((kw, i) => (
                <div key={i} className="flex items-center gap-4 px-6 py-3 bg-rose-500/10 border border-rose-500/20 rounded-full text-sm font-bold uppercase text-rose-600 dark:text-rose-400">
                  {kw.keyword} <span className="bg-rose-500 text-white px-3 py-1 rounded-full text-xs uppercase">{kw.importance}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="space-y-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 px-8">
          <div className="flex items-center gap-6">
            <ArrowUpRight className="w-8 h-8 text-slate-400 dark:text-slate-600" />
            <h3 className="text-sm font-black uppercase tracking-[0.5em] text-slate-400 dark:text-slate-600">Strategic Recommendations</h3>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-10">
          {filteredSuggestions.map((suggestion, idx) => (
            <div key={idx} className="bg-white/90 dark:bg-[#0f172a]/40 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-[48px] p-10 lg:p-12 hover:shadow-2xl hover:scale-[1.01] transition-all duration-300 space-y-10 group/card">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-10">
                <div className="flex items-center gap-8">
                  <div className={`w-14 h-14 rounded-[20px] flex items-center justify-center shrink-0 border transition-colors ${suggestion.severity === 'high' ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' : suggestion.severity === 'medium' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'}`}>
                    {suggestion.severity === 'high' ? <AlertTriangle className="w-6 h-6" /> : suggestion.severity === 'medium' ? <Lightbulb className="w-6 h-6" /> : <CheckCircle2 className="w-6 h-6" />}
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-slate-900 dark:text-white line-clamp-1">{suggestion.finding}</h4>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mt-1.5 opacity-70 flex items-center gap-2">
                       <span className="text-violet-500">{suggestion.type}</span> • <span title={suggestion.location} className="max-w-[200px] truncate">{suggestion.location.split(/[●•|]/)[0].trim()}</span>
                    </p>
                  </div>
                </div>
                <span className={`text-[10px] font-black uppercase tracking-widest px-5 py-2.5 rounded-xl border ${suggestion.severity === 'high' ? 'bg-rose-500/5 text-rose-500 border-rose-500/20' : suggestion.severity === 'medium' ? 'bg-amber-500/5 text-amber-500 border-amber-500/20' : 'bg-emerald-500/5 text-emerald-500 border-emerald-500/20'}`}>
                  {suggestion.severity === 'high' ? 'CRITICAL' : suggestion.severity === 'medium' ? 'POLISH' : 'OPTIMIZE'}
                </span>
              </div>

              <div className="bg-slate-50 dark:bg-black/30 border-l-4 border-violet-500/40 p-6 rounded-r-2xl group-hover/card:bg-violet-500/[0.03] transition-colors">
                <div className="flex items-center gap-3 mb-3"><BrainCircuit className="w-4 h-4 text-violet-500" /><span className="text-[10px] font-black uppercase tracking-widest text-violet-500/70">Expert Thinking</span></div>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed italic">"{suggestion.thinking}"</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/5 rounded-3xl p-8 transform transition-all hover:bg-rose-50 dark:hover:bg-rose-900/10"><span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-600 block mb-4">Original Entry</span><p className="font-mono text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{suggestion.original_text}</p></div>
                <div className="bg-emerald-500/[0.04] border border-emerald-500/10 rounded-3xl p-8 relative group">
                  <div className="flex items-center justify-between mb-4"><span className="text-[10px] font-black uppercase tracking-widest text-emerald-600/80 dark:text-emerald-400/80">Optimized Refactoring</span><button onClick={() => navigator.clipboard.writeText(suggestion.fix.replace(/^[^:]+:\s*/, '').replace(/^['"]|['"]$/g, ''))} className="text-[10px] font-black text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 transition-all flex items-center gap-2 px-4 py-2 bg-emerald-500/10 rounded-xl hover:bg-emerald-500/20"><Copy className="w-3 h-3" /> COPY</button></div>
                  <p className="text-sm font-bold text-slate-800 dark:text-emerald-50 leading-relaxed font-mono">{suggestion.fix}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
