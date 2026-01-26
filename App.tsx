
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  CheckCircle2, Loader2, AlertTriangle, 
  Lightbulb, Target, Zap, Send, MessageSquare, 
  X, Copy, Sun, Moon,
  ArrowUpRight, Download, Sparkles, FileDown,
  Settings, Sliders, HelpCircle, Upload, ChevronDown, ChevronUp,
  Search, AlertCircle, RefreshCw, BrainCircuit, PlayCircle, ChevronRight, ChevronLeft, Printer
} from 'lucide-react';

// API & Types
import { auditResumeFile, startManagerChat, refactorResume } from './api/geminiService';
import { AuditResult, Message, FileData, RefactorOptions, Suggestion } from './types/index';

// Components
import { BrandLogo } from './components/BrandLogo';
import { HighlightedText } from './components/HighlightedText';
import { FormattedText } from './components/FormattedText';
import { InfoTooltip } from './components/InfoTooltip';
import { CriteriaBar } from './components/CriteriaBar';
import { KeywordTag } from './components/KeywordTag';
import { Footer } from './components/Footer';

type TourStep = {
  target: string;
  title: string;
  description: string;
  icon: React.ReactNode;
};

const TOUR_STEPS: TourStep[] = [
  {
    target: 'header-brand',
    title: 'Welcome to Hirely AI',
    description: 'The ultimate professional resume auditing and strategic refactoring platform.',
    icon: <Sparkles className="w-6 h-6 text-violet-500" />
  },
  {
    target: 'strategy-config',
    title: 'Career Strategy',
    description: 'Configure your target experience level and alignment intensity to tune the AI core.',
    icon: <Sliders className="w-6 h-6 text-violet-500" />
  },
  {
    target: 'upload-section',
    title: 'Resume Source',
    description: 'Upload your existing resume (PDF or DOCX) to begin the strategic evaluation.',
    icon: <Upload className="w-6 h-6 text-violet-500" />
  },
  {
    target: 'jd-section',
    title: 'Job Description Target',
    description: 'Paste the target job description here for specialized keyword and impact alignment.',
    icon: <Target className="w-6 h-6 text-violet-500" />
  },
  {
    target: 'hirely-chat-btn',
    title: 'Hirely Secure Link',
    description: 'Connect directly with the Strategic Advisor for real-time career intelligence and questions.',
    icon: <MessageSquare className="w-6 h-6 text-violet-500" />
  }
];

export default function App() {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [selectedFile, setSelectedFile] = useState<FileData | null>(null);
  const [jdText, setJdText] = useState('');
  const [loading, setLoading] = useState(false);
  const [refactoring, setRefactoring] = useState(false);
  const [scanStep, setScanStep] = useState('');
  const [result, setResult] = useState<AuditResult | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [showRefactorOptions, setShowRefactorOptions] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  // Tour State
  const [tourActive, setTourActive] = useState(false);
  const [tourStep, setTourStep] = useState(0);

  const [refactorSettings, setRefactorSettings] = useState<RefactorOptions>({
    level: 'mid',
    jdAlignment: 100
  });
  
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: "Strategic insight active. Hirely sensors are online. Ready to evaluate your profile?", timestamp: Date.now() }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const chatInstance = useRef<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, chatLoading]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = (event.target?.result as string).split(',')[1];
      setSelectedFile({
        name: file.name,
        size: file.size,
        data: base64,
        mimeType: file.type || (file.name.endsWith('.pdf') ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')
      });
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  const handleAudit = async () => {
    if (!selectedFile) return;
    setLoading(true);
    setResult(null);
    setSearchTerm('');
    const steps = ["Calibrating Hirely sensors...", "Evaluating professional standing...", "Analyzing impact metrics...", "Strategizing content refactor..."];
    let stepIdx = 0;
    const interval = setInterval(() => {
      setScanStep(steps[stepIdx % steps.length]);
      stepIdx++;
    }, 1000);

    try {
      const auditData = await auditResumeFile(selectedFile, jdText);
      setResult(auditData);
    } catch (err) {
      setError("Intelligence Node timeout.");
    } finally {
      clearInterval(interval);
      setLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setSelectedFile(null);
    setJdText('');
    setSearchTerm('');
    setShowRefactorOptions(false);
  };

  const handleDownloadFixes = () => {
    if (!result) return;
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      const fixesHtml = result.suggestions.map((s, idx) => `
        <div style="margin-bottom: 25px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; page-break-inside: avoid;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
             <h3 style="margin: 0; font-size: 16px; color: #1e293b;">${idx + 1}. ${s.location}</h3>
             <span style="font-size: 10px; font-weight: 800; text-transform: uppercase; padding: 4px 10px; border-radius: 6px; border: 1px solid ${s.severity === 'high' ? '#fecaca' : s.severity === 'medium' ? '#fde68a' : '#bbf7d0'}; background: ${s.severity === 'high' ? '#fef2f2' : s.severity === 'medium' ? '#fffbeb' : '#f0fdf4'}; color: ${s.severity === 'high' ? '#ef4444' : s.severity === 'medium' ? '#f59e0b' : '#10b981'};">
               ${s.severity} Priority
             </span>
          </div>
          <p style="font-size: 13px; color: #64748b; margin-bottom: 10px;"><strong>Issue:</strong> ${s.finding}</p>
          <p style="font-size: 12px; color: #94a3b8; font-style: italic; margin-bottom: 15px;"><strong>Advisor Context:</strong> ${s.thinking}</p>
          <div style="background: #f8fafc; padding: 15px; border-left: 4px solid #8b5cf6; border-radius: 4px;">
            <p style="margin: 0; font-family: 'JetBrains Mono', monospace; font-size: 13px; font-weight: 700; color: #4c1d95;">${s.fix}</p>
          </div>
        </div>
      `).join('');
      
      const content = `
        <html>
          <head>
            <title>Hirely AI Strategic Fixes - ${selectedFile?.name}</title>
            <style>
              @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@700&display=swap');
              body { padding: 40px; }
              @media print {
                body { padding: 0; }
                @page { margin: 2cm; }
              }
            </style>
          </head>
          <body>
            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 30px;">
              <h1 style="font-family: -apple-system, sans-serif; font-size: 24px; color: #1e293b; margin: 0;">Strategic Resume Fixes</h1>
              <span style="font-family: -apple-system, sans-serif; font-size: 12px; color: #8b5cf6; font-weight: 800; text-transform: uppercase;">By Hirely AI</span>
            </div>
            <p style="font-family: -apple-system, sans-serif; color: #64748b; font-size: 14px; margin-bottom: 40px;">Detailed observations and recommended adjustments for: <strong>${selectedFile?.name}</strong></p>
            ${fixesHtml}
            <footer style="margin-top: 50px; font-family: -apple-system, sans-serif; font-size: 10px; color: #94a3b8; text-align: center;">
              Generated by Hirely AI Strategic Advisor. Targeted Experience: ${refactorSettings.level.toUpperCase()}
            </footer>
          </body>
        </html>
      `;
      printWindow.document.write(content);
      printWindow.document.close();
      setTimeout(() => {
        printWindow.print();
      }, 700);
    }
  };

  const handleRefactor = async (type: 'pdf' | 'docx' = 'pdf') => {
    if (!selectedFile || !result) return;
    setRefactoring(true);
    setShowRefactorOptions(false);
    try {
      const optimizedHtml = await refactorResume(selectedFile, result, jdText, refactorSettings);
      
      const header = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'></head><body>";
      const footer = "</body></html>";
      const fullHtml = header + optimizedHtml + footer;

      if (type === 'pdf') {
        const printWindow = window.open('', '_blank');
        if (printWindow) {
          printWindow.document.write(fullHtml);
          printWindow.document.close();
          setTimeout(() => printWindow.print(), 500);
        }
      } else {
        const source = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(fullHtml);
        const link = document.createElement("a");
        link.href = source;
        link.download = `HirelyAI_Strategic_${selectedFile.name.split('.')[0]}.doc`;
        link.click();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setRefactoring(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || chatLoading) return;
    if (!chatInstance.current) {
        chatInstance.current = startManagerChat();
    }
    const userMsg = inputValue;
    setInputValue('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg, timestamp: Date.now() }]);
    setChatLoading(true);
    try {
      const response = await chatInstance.current.sendMessage({ message: userMsg });
      setMessages(prev => [...prev, { role: 'model', text: response.text, timestamp: Date.now() }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'model', text: "Strategic link disrupted.", timestamp: Date.now() }]);
    } finally {
      setChatLoading(false);
    }
  };

  const startTour = () => {
    setTourStep(0);
    setTourActive(true);
    setShowSettings(true);
  };

  const nextTourStep = () => {
    if (tourStep < TOUR_STEPS.length - 1) {
      setTourStep(tourStep + 1);
    } else {
      setTourActive(false);
    }
  };

  const prevTourStep = () => {
    if (tourStep > 0) {
      setTourStep(tourStep - 1);
    }
  };

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

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
    <div className="min-h-screen flex flex-col bg-white dark:bg-[#020617] text-slate-800 dark:text-slate-300 font-sans selection:bg-violet-500/30 transition-colors duration-300">
      
      {/* Tour Overlay */}
      {tourActive && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white dark:bg-[#0f172a] border border-violet-500/20 rounded-[40px] p-10 max-w-lg w-full shadow-2xl space-y-8 animate-in zoom-in-95 duration-300">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 rounded-[22px] bg-violet-500/10 flex items-center justify-center shadow-inner">
                {TOUR_STEPS[tourStep].icon}
              </div>
              <div className="space-y-2">
                <h4 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">{TOUR_STEPS[tourStep].title}</h4>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed">{TOUR_STEPS[tourStep].description}</p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4">
              <div className="flex gap-1.5">
                {TOUR_STEPS.map((_, i) => (
                  <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === tourStep ? 'w-8 bg-violet-500' : 'w-2 bg-slate-200 dark:bg-white/10'}`} />
                ))}
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setTourActive(false)}
                  className="px-5 py-2.5 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  Skip
                </button>
                <div className="flex gap-2">
                  {tourStep > 0 && (
                    <button 
                      onClick={prevTourStep}
                      className="p-3 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 rounded-xl hover:bg-slate-200 dark:hover:bg-white/10 transition-all active:scale-95"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                  )}
                  <button 
                    onClick={nextTourStep}
                    className="flex items-center gap-2 px-6 py-3 bg-violet-500 text-white rounded-[20px] text-[10px] font-black uppercase tracking-widest hover:bg-violet-400 transition-all shadow-xl shadow-violet-500/20 active:scale-95"
                  >
                    {tourStep === TOUR_STEPS.length - 1 ? 'Finish' : 'Next Step'}
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <header className="h-16 border-b border-slate-200 dark:border-white/5 flex items-center px-6 lg:px-12 justify-between sticky top-0 bg-white/80 dark:bg-[#020617]/80 backdrop-blur-xl z-50">
        <div id="header-brand" className="flex items-center gap-4 group cursor-pointer" onClick={() => handleReset()}>
          <BrandLogo size={24} />
          <span className="text-xl font-black tracking-tighter text-slate-900 dark:text-white uppercase">HIRELY<span className="text-violet-500">.AI</span></span>
        </div>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={startTour}
            className="hidden sm:flex items-center gap-2 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-violet-500 hover:text-violet-400 transition-colors bg-violet-500/5 rounded-xl border border-violet-500/10"
          >
            <PlayCircle className="w-3.5 h-3.5" />
            Walkthrough
          </button>
          {result && (
            <button 
              onClick={handleReset}
              className="hidden sm:flex items-center gap-2 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-violet-500 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Reset Audit
            </button>
          )}
          <button 
            onClick={toggleTheme}
            className="p-2 text-slate-400 hover:text-violet-500 transition-colors bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10"
          >
            {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <div className="h-4 w-px bg-slate-200 dark:bg-white/10" />
          <button 
            id="hirely-chat-btn"
            onClick={() => setChatOpen(!chatOpen)}
            className="flex items-center gap-2 px-5 py-2.5 bg-violet-500 text-white rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-violet-400 transition-all shadow-lg shadow-violet-500/20 active:scale-95"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            Hirely Link
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto w-full p-6 space-y-8 overflow-y-auto custom-scrollbar">
        
        <div id="strategy-config" className="space-y-3">
          <button 
            onClick={() => setShowSettings(!showSettings)}
            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors ml-2"
          >
            {showSettings ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            Strategy Configuration
            <span className="ml-2 text-[9px] font-bold text-slate-500 dark:text-slate-600 bg-slate-100 dark:bg-white/5 px-2 py-0.5 rounded-full">{showSettings ? 'Active' : 'Configure'}</span>
          </button>

          {showSettings && (
            <section className="bg-slate-50 dark:bg-[#0f172a]/40 border border-slate-200 dark:border-white/5 rounded-[30px] p-8 animate-in slide-in-from-top-2 duration-300 grid grid-cols-1 md:grid-cols-2 gap-10 shadow-sm">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center">
                    Target Experience <InfoTooltip text="Tunes phrasing and bullet point complexity for your desired level." />
                  </label>
                  <span className="text-[10px] font-black text-violet-500 uppercase">{refactorSettings.level}</span>
                </div>
                <div className="flex bg-slate-200 dark:bg-black/40 p-1.5 rounded-2xl border border-slate-300 dark:border-white/5">
                  {['junior', 'mid', 'senior', 'staff'].map((lvl) => (
                    <button
                      key={lvl}
                      onClick={() => setRefactorSettings(s => ({ ...s, level: lvl as any }))}
                      className={`flex-1 py-2 text-[10px] font-black uppercase tracking-tighter rounded-xl transition-all ${refactorSettings.level === lvl ? 'bg-violet-500 text-white shadow-xl shadow-violet-500/20' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'}`}
                    >
                      {lvl.charAt(0).toUpperCase() + lvl.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center">
                    Alignment Intensity <InfoTooltip text="Controls how aggressively we align your content to the Job Description." />
                  </label>
                  <span className="text-[10px] font-black text-violet-500 uppercase">{refactorSettings.jdAlignment}%</span>
                </div>
                <div className="px-1 pt-2">
                  <input 
                    type="range" min="1" max="100" 
                    value={refactorSettings.jdAlignment}
                    onChange={(e) => setRefactorSettings(s => ({ ...s, jdAlignment: parseInt(e.target.value) }))}
                    className="w-full h-1.5 bg-slate-300 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-violet-500"
                  />
                </div>
              </div>
            </section>
          )}
        </div>

        {loading ? (
          <div className="h-[400px] flex flex-col items-center justify-center space-y-6 bg-slate-50 dark:bg-[#0f172a]/10 border border-slate-200 dark:border-white/5 rounded-[50px]">
            <div className="w-16 h-16 rounded-full border-4 border-violet-500/10 border-t-violet-500 animate-spin" />
            <p className="text-[11px] font-black uppercase tracking-[0.4em] text-violet-500">{scanStep}</p>
          </div>
        ) : result ? (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
            <section className="bg-white dark:bg-[#080d1a] border border-slate-200 dark:border-white/10 rounded-[32px] p-6 lg:p-10 shadow-xl overflow-hidden">
              <div className="flex flex-col items-center text-center space-y-8 max-w-4xl mx-auto">
                <div className="space-y-2">
                  <div className="flex items-baseline justify-center gap-2">
                    <span className="text-7xl font-black text-slate-900 dark:text-white tracking-tighter">{result.overall_score}</span>
                    <span className="text-2xl font-bold text-slate-400 dark:text-slate-600">/ 100</span>
                  </div>
                  <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-violet-500">Overall Hirely Rating</h3>
                </div>

                <div className="space-y-3 w-full">
                  <h4 className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-600">Executive Summary</h4>
                  <p className="text-base md:text-lg font-medium leading-relaxed text-slate-700 dark:text-slate-200 px-4">
                    "{result.summary}"
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-6 w-full pt-4">
                  <CriteriaBar score={result.criteria.formatting.score} label="Presentation" tooltip="Checks for consistent margins, clear headings, and clean visual structure." />
                  <CriteriaBar score={result.criteria.content.score} label="Experience Depth" tooltip="Evaluates the substance and clarity of your professional background." />
                  <CriteriaBar score={result.criteria.impact.score} label="Value Proof" tooltip="Measures if bullet points use quantitative results to prove value." />
                  <CriteriaBar score={result.criteria.relevance.score} label="Strategic Fit" tooltip="How well your background aligns with the specific Job Description provided." />
                </div>

                <div className="w-full pt-6 flex flex-col items-center gap-4">
                  <div className="relative w-full max-w-md">
                    <button
                      onClick={() => setShowRefactorOptions(!showRefactorOptions)}
                      disabled={refactoring}
                      className="w-full flex items-center justify-center gap-3 px-8 py-5 bg-violet-500 hover:bg-violet-400 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white rounded-[24px] text-xs font-black uppercase tracking-[0.2em] shadow-2xl shadow-violet-500/30 transition-all active:scale-95"
                    >
                      {refactoring ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                      {refactoring ? 'Synthesizing...' : 'Apply Strategic Refactor'}
                    </button>
                    
                    {showRefactorOptions && (
                      <div className="absolute top-full left-0 right-0 mt-3 bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-white/10 rounded-2xl p-2 shadow-2xl z-50 animate-in fade-in slide-in-from-top-4">
                        <button onClick={() => handleRefactor('pdf')} className="w-full flex items-center gap-3 px-4 py-4 hover:bg-slate-50 dark:hover:bg-white/5 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-300 transition-colors">
                          <FileDown className="w-4 h-4 text-violet-500" /> Export Strategic PDF
                        </button>
                        <button onClick={() => handleRefactor('docx')} className="w-full flex items-center gap-3 px-4 py-4 hover:bg-slate-50 dark:hover:bg-white/5 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-300 transition-colors">
                          <FileDown className="w-4 h-4 text-blue-500" /> Export Strategic DOCX
                        </button>
                      </div>
                    )}
                  </div>
                  
                  <button onClick={handleReset} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-violet-500 transition-colors">
                    <RefreshCw className="w-3.5 h-3.5" /> Reset & Audit Another
                  </button>
                </div>
              </div>
            </section>

            {(result.jd_alignment.matched_keywords.length > 0 || result.jd_alignment.missing_keywords.length > 0) && (
              <section className="bg-slate-50 dark:bg-[#0f172a]/20 border border-slate-200 dark:border-white/5 rounded-[32px] p-6 lg:p-8 space-y-6 shadow-sm">
                <div className="flex items-center gap-3 px-2">
                  <Target className="w-4 h-4 text-slate-400 dark:text-slate-600" />
                  <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 dark:text-slate-600">Strategic Alignment</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/5 pb-2">
                      <span className="text-[10px] font-black uppercase tracking-widest text-violet-500 flex items-center gap-2"><CheckCircle2 className="w-3 h-3" /> Identified Strengths</span>
                      <span className="text-[9px] font-bold text-slate-400">{result.jd_alignment.matched_keywords.length} Matches</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {result.jd_alignment.matched_keywords.map((kw, i) => <KeywordTag key={i} text={kw} type="matched" />)}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/5 pb-2">
                      <span className="text-[10px] font-black uppercase tracking-widest text-rose-500 flex items-center gap-2"><AlertCircle className="w-3 h-3" /> Strategic Gaps</span>
                      <span className="text-[9px] font-bold text-slate-400">{result.jd_alignment.missing_keywords.length} Recommended</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {result.jd_alignment.missing_keywords.map((kw, i) => <KeywordTag key={i} text={kw} type="missing" />)}
                    </div>
                  </div>
                </div>
              </section>
            )}

            <div className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-4">
                <div className="flex items-center gap-3">
                  <ArrowUpRight className="w-4 h-4 text-slate-400 dark:text-slate-600" />
                  <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 dark:text-slate-600">Strategic Observations ({filteredSuggestions.length})</h3>
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <div className="relative group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 group-focus-within:text-violet-500 transition-colors" />
                    <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Filter finding or fix..." className="pl-9 pr-4 py-2 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-[10px] font-medium placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-violet-500/20 transition-all w-full sm:w-48" />
                  </div>
                  <button onClick={handleDownloadFixes} className="flex items-center justify-center gap-2 px-4 py-2 bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-violet-500/20 transition-all active:scale-95">
                    <Printer className="w-3.5 h-3.5" /> Export All Fixes (PDF)
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {filteredSuggestions.map((suggestion, idx) => (
                  <div key={idx} className="bg-white dark:bg-[#0f172a]/30 border border-slate-200 dark:border-white/5 rounded-[24px] p-6 hover:shadow-2xl hover:scale-[1.02] hover:-translate-y-1 hover:border-violet-500/20 transition-all duration-300 space-y-6 group/card">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border transition-colors ${
                          suggestion.severity === 'high' ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' : 
                          suggestion.severity === 'medium' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 
                          'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                        }`}>
                          {suggestion.severity === 'high' ? <AlertTriangle className="w-5 h-5" /> : suggestion.severity === 'medium' ? <Lightbulb className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white">{suggestion.location}</h4>
                          <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-600 mt-0.5">{suggestion.type} check</p>
                        </div>
                      </div>
                      <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border ${
                        suggestion.severity === 'high' ? 'bg-rose-500/5 text-rose-500 border-rose-500/20' : 
                        suggestion.severity === 'medium' ? 'bg-amber-500/5 text-amber-500 border-amber-500/20' : 
                        'bg-emerald-500/5 text-emerald-500 border-emerald-500/20'
                      }`}>
                        Priority {suggestion.severity === 'high' ? 'Critical' : suggestion.severity === 'medium' ? 'Moderate' : 'Low'}
                      </span>
                    </div>

                    <div className="bg-slate-50 dark:bg-black/20 border-l-2 border-violet-500/30 dark:border-violet-500/20 p-4 rounded-r-xl group-hover/card:bg-violet-500/[0.02] transition-colors">
                      <div className="flex items-center gap-2 mb-2">
                        <BrainCircuit className="w-3.5 h-3.5 text-violet-500" />
                        <span className="text-[9px] font-black uppercase tracking-widest text-violet-500/80">Advisor Reasoning</span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed italic">{suggestion.thinking}</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <div className="bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/5 rounded-xl p-4">
                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-700 block mb-2">Identified Issue</span>
                        <HighlightedText text={suggestion.original_text} />
                      </div>
                      <div className="bg-violet-500/[0.03] border border-violet-500/10 rounded-xl p-4 relative group">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[9px] font-black uppercase tracking-widest text-violet-500/80">Recommended Fix</span>
                          <button onClick={() => navigator.clipboard.writeText(suggestion.fix)} className="text-[9px] font-black text-violet-500 hover:text-slate-900 dark:hover:text-white transition-all flex items-center gap-1.5 px-2 py-1 bg-violet-500/10 rounded-md hover:bg-violet-500/20">
                            <Copy className="w-3 h-3" /> COPY FIX
                          </button>
                        </div>
                        <p className="text-xs font-bold text-slate-800 dark:text-violet-50 leading-relaxed font-mono">{suggestion.fix}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center space-y-8 animate-in fade-in duration-700">
            <div id="upload-section" className="w-full max-w-4xl h-[520px] flex flex-col items-center justify-center text-center p-12 border-2 border-dashed border-slate-200 dark:border-white/5 rounded-[60px] space-y-8 bg-slate-50 dark:bg-[#0f172a]/10 hover:bg-slate-100 dark:hover:bg-[#0f172a]/20 hover:scale-[1.005] transition-all duration-500 relative overflow-hidden group shadow-inner">
              <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              <div className="w-32 h-32 rounded-[40px] bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-white/10 flex items-center justify-center shadow-2xl relative z-10 overflow-visible group-hover:scale-110 transition-transform duration-500">
                <BrandLogo size={40} className="w-24 h-24" />
                <div className="absolute -top-3 -right-3 w-10 h-10 bg-violet-500 rounded-2xl flex items-center justify-center shadow-lg border-4 border-white dark:border-[#020617] animate-bounce z-20">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
              </div>
              <div className="space-y-4 relative z-10">
                <h2 className="text-2xl font-black tracking-tighter text-slate-900 dark:text-white uppercase tracking-widest">Hirely AI Resume Audit</h2>
                <p className="max-w-xl text-sm text-slate-500 dark:text-slate-600 leading-relaxed mx-auto">Gain a superior perspective on your professional credentials.</p>
                <div className="pt-6">
                  <button onClick={() => fileInputRef.current?.click()} className="px-8 py-4 bg-violet-500 text-white rounded-[22px] font-black uppercase text-xs tracking-[0.2em] shadow-2xl shadow-violet-500/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-3 mx-auto">
                    <Upload className="w-4 h-4" /> Upload Resume
                  </button>
                  <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept=".pdf,.docx" />
                </div>
                {selectedFile && <div className="flex items-center gap-3 justify-center text-violet-500 animate-in fade-in zoom-in font-bold uppercase text-[11px] tracking-widest mt-6"><div className="p-1 bg-violet-500 rounded-full"><CheckCircle2 className="w-3.5 h-3.5 text-white" /></div>{selectedFile.name}</div>}
              </div>
            </div>

            <div id="jd-section" className="w-full max-w-2xl animate-in slide-in-from-top-4 duration-500 delay-200">
              <div className="bg-white/80 dark:bg-[#0f172a]/40 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-[40px] p-6 space-y-4 shadow-xl hover:shadow-2xl transition-all border-b-4 border-b-violet-500/30">
                <div className="flex items-center justify-between px-2">
                   <div className="flex items-center gap-3"><div className="w-8 h-8 rounded-xl bg-violet-500/10 flex items-center justify-center"><Target className="w-4 h-4 text-violet-500" /></div><h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">Job Target Alignment</h3></div>
                   {jdText && <span className="text-[9px] font-bold text-violet-500 bg-violet-500/10 px-2 py-0.5 rounded-full uppercase">Context Loaded</span>}
                </div>
                <textarea value={jdText} onChange={(e) => setJdText(e.target.value)} placeholder="Paste the Job Description here..." className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/5 rounded-3xl p-6 text-sm resize-none h-40 custom-scrollbar font-medium outline-none focus:ring-2 focus:ring-violet-500/20 transition-all" />
                <div className="flex justify-center pt-2">
                  <button onClick={handleAudit} disabled={!selectedFile || loading} className="group relative flex items-center gap-3 px-10 py-4 bg-violet-500 disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-400 text-white rounded-[24px] font-black uppercase text-[11px] tracking-[0.2em] shadow-xl shadow-violet-500/20 active:scale-95 transition-all overflow-hidden">
                    <Zap className="w-4 h-4 fill-white" /> {loading ? 'Analyzing Profile...' : 'Initiate Strategic Audit'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <div className={`fixed inset-y-0 right-0 w-full sm:w-[500px] bg-white dark:bg-[#020617] border-l border-slate-200 dark:border-white/5 shadow-2xl transition-all duration-500 z-[100] flex flex-col ${chatOpen ? 'translate-x-0' : 'translate-x-full opacity-0 pointer-events-none'}`}>
        <div className="p-8 border-b border-slate-200 dark:border-white/5 flex items-center justify-between bg-slate-50/50 dark:bg-[#080d1a]/50">
          <div className="flex items-center gap-4">
            <BrandLogo size={24} className="w-12 h-12 shadow-violet-500/20" />
            <div><h3 className="font-black text-sm text-slate-900 dark:text-white uppercase tracking-widest">Strategic Advisor</h3><p className="text-[10px] text-violet-500 font-bold uppercase tracking-widest flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse" /> Hirely Secure Link</p></div>
          </div>
          <button onClick={() => setChatOpen(false)} className="p-2.5 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl transition-all"><X className="w-6 h-6 text-slate-500" /></button>
        </div>
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] p-6 rounded-[30px] text-sm leading-relaxed ${msg.role === 'user' ? 'bg-violet-600 text-white' : 'bg-slate-100 dark:bg-slate-900/50 text-slate-800 dark:text-slate-300'}`}>{msg.role === 'model' ? <FormattedText text={msg.text} /> : msg.text}</div>
            </div>
          ))}
        </div>
        <div className="p-8 border-t border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-[#080d1a]/50">
          <div className="relative">
            <input value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()} placeholder="Query the advisor..." className="w-full bg-white dark:bg-[#020617] border border-slate-200 dark:border-white/10 rounded-[20px] py-5 pl-8 pr-16 text-sm focus:ring-1 focus:ring-violet-500 outline-none" />
            <button onClick={handleSendMessage} className="absolute right-4 top-4 p-3 bg-violet-500 text-white rounded-xl active:scale-95 transition-all"><Send className="w-4 h-4" /></button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
