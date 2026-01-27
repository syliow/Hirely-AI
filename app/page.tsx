"use client";

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  CheckCircle2, Loader2, AlertTriangle, 
  Lightbulb, Target, Zap, Send, MessageSquare, 
  X, Copy, Sun, Moon,
  ArrowUpRight, Download, Sparkles, FileDown,
  Settings, Sliders, HelpCircle, Upload, ChevronDown, ChevronUp,
  Search, AlertCircle, RefreshCw, BrainCircuit, PlayCircle, ChevronRight, ChevronLeft, Printer,
  PenTool, Star, Terminal, Bot, Eye, EyeOff
} from 'lucide-react';

// API & Types
import { AuditResult, Message, FileData, RefactorOptions } from '@/lib/types';

// Helpers
import { openInNewTab, downloadFile } from '@/helpers/browser';
import { extractCandidateName, generateResumeTemplate } from '@/helpers/resume';
import { cleanAIHtml } from '@/helpers/string';

// Components
import { BrandLogo } from '@/components/BrandLogo';
import { HighlightedText } from '@/components/HighlightedText';
import { FormattedText } from '@/components/FormattedText';
import { InfoTooltip } from '@/components/InfoTooltip';
import { CriteriaBar } from '@/components/CriteriaBar';
import { KeywordTag } from '@/components/KeywordTag';
import { Footer } from '@/components/Footer';

// Constants
const TOUR_STEPS = [
  {
    target: 'header-brand',
    title: 'Welcome to Hirely AI!',
    description: "I'm your new resume partner. Let's work together to make your professional story shine!",
    icon: <Sparkles className="w-8 h-8 text-violet-500" />
  },
  {
    target: 'strategy-config',
    title: 'Your Career Path',
    description: 'Tell me your goals so I can tailor my advice perfectly for your next big step.',
    icon: <Sliders className="w-8 h-8 text-violet-500" />
  },
  {
    target: 'upload-section',
    title: 'Your Current Resume',
    description: "Upload what you have now. Don't worry, we're going to make it even better together!",
    icon: <Upload className="w-8 h-8 text-violet-500" />
  },
  {
    target: 'jd-section',
    title: 'The Dream Job',
    description: "Paste the job you're excited about so I can help you match exactly what they're looking for.",
    icon: <Target className="w-8 h-8 text-violet-500" />
  },
  {
    target: 'hirely-fab',
    title: 'Chat with Me',
    description: "I'm right here whenever you have a question or need a little extra career advice!",
    icon: <MessageSquare className="w-8 h-8 text-violet-500" />
  }
];

const CHAT_SUGGESTIONS = [
  { text: "How to tailor my resume?", icon: <Target className="w-4 h-4" /> },
  { text: "How to write a bullet point?", icon: <PenTool className="w-4 h-4" /> },
  { text: "What makes a resume stand out?", icon: <Sparkles className="w-4 h-4" /> }
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export default function Home() {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [selectedFile, setSelectedFile] = useState<FileData | null>(null);
  const [jdText, setJdText] = useState('');
  const [loading, setLoading] = useState(false);
  const [refactoring, setRefactoring] = useState(false);
  const [scanStep, setScanStep] = useState('');
  const [result, setResult] = useState<AuditResult | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [notification, setNotification] = useState<{ type: 'error' | 'success', message: string } | null>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [showRefactorOptions, setShowRefactorOptions] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showBotView, setShowBotView] = useState(false);
  const [readyHtml, setReadyHtml] = useState<string | null>(null);
  
  const [tourActive, setTourActive] = useState(false);
  const [tourStep, setTourStep] = useState(0);

  const [refactorSettings, setRefactorSettings] = useState<RefactorOptions>({
    level: 'junior',
    jdAlignment: 100
  });
  
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: "Hi! I'm Hirely AI, your personal resume partner. I'm so ready to help you land that dream job! Shall we take a look at your profile?", timestamp: Date.now() }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  
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
  }, [messages, chatLoading, chatOpen]);

  const callApi = async (action: string, payload: any) => {
    const res = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, payload }),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || "Failed to communicate with AI");
    }
    return res.json();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      setNotification({ type: 'error', message: "File too large! Please upload a resume under 10MB." });
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = (event.target?.result as string).split(',')[1];
      setSelectedFile({
        name: file.name,
        size: file.size,
        data: base64,
        mimeType: file.type || (file.name.endsWith('.pdf') ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')
      });
      setNotification(null);
    };
    reader.readAsDataURL(file);
  };

  const handleAudit = async () => {
    if (!selectedFile) return;
    setLoading(true);
    setResult(null);
    setSearchTerm('');
    const steps = ["Initializing Strategic Extraction...", "Detecting ATS Parsing Risks...", "Generating Compatibility Score...", "Finalizing Strategic Analysis..."];
    let stepIdx = 0;
    setScanStep(steps[0]);
    const interval = setInterval(() => {
      stepIdx = (stepIdx + 1) % steps.length;
      setScanStep(steps[stepIdx]);
    }, 2000); 

    try {
      const auditData = await callApi('audit', { file: selectedFile, jdText });
      setResult(auditData);
    } catch (err: any) {
      setNotification({ 
        type: 'error', 
        message: err.message?.includes('429') 
          ? "API limit reached. Please wait a moment before trying again." 
          : "Audit failed. Check your internet connection or try a different file." 
      });
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
    setShowBotView(false);
    setReadyHtml(null);
    setNotification(null);
  };

  const handleOpenPreview = (html: string) => {
    if (openInNewTab(html)) {
      setReadyHtml(null);
    }
  };

  const handleRefactor = async (type: 'pdf' | 'docx' = 'pdf') => {
    if (!selectedFile || !result) return;
    
    setRefactoring(true);
    setScanStep("Refining Content Strategy...");
    setShowRefactorOptions(false);
    setNotification(null);
    setReadyHtml(null);

    try {
      const { text } = await callApi('refactor', { file: selectedFile, jdText, options: refactorSettings });
      
      const optimizedHtml = cleanAIHtml(text);

      if (!optimizedHtml || optimizedHtml.length < 50) {
        throw new Error("Resume optimization returned insufficient data. Please try again.");
      }

      setScanStep("Generating Document Assets...");
      const candidateName = extractCandidateName(optimizedHtml);
      const generatedContent = generateResumeTemplate(optimizedHtml, candidateName);

      if (type === 'pdf') {
        if (!openInNewTab(generatedContent)) {
          setReadyHtml(generatedContent);
          setNotification({ type: 'success', message: "Resume ready! Click 'View Optimized Resume' to preview." });
        }
      } else if (type === 'docx') {
        const filename = `${candidateName.replace(/\s+/g, '_')}_Optimized.docx`;
        downloadFile(generatedContent, filename, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
      }
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message || "Refactor failed. Please try again." });
    } finally {
      setRefactoring(false);
    }
  };

  const handleSendMessage = async (customMsg?: string) => {
    const textToSend = customMsg || inputValue;
    if (!textToSend.trim() || chatLoading) return;
    
    setInputValue('');
    const newMessages = [...messages, { role: 'user', text: textToSend, timestamp: Date.now() }] as Message[];
    setMessages(newMessages);
    setChatLoading(true);

    try {
      const { text } = await callApi('chat', { messages: newMessages });
      setMessages(prev => [...prev, { role: 'model', text, timestamp: Date.now() }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'model', text: "I hit a snag connecting. Let's try that again!", timestamp: Date.now() }]);
    } finally {
      setChatLoading(false);
    }
  };

  const startTour = () => {
    setTourStep(0);
    setTourActive(true);
    setShowSettings(true);
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
    <div className="min-h-screen flex flex-col bg-transparent text-slate-800 dark:text-slate-200 font-sans selection:bg-violet-500/30 transition-colors duration-300">
      
      {notification && (
        <div className="fixed top-28 left-1/2 -translate-x-1/2 z-[150] w-full max-w-xl p-6 animate-in slide-in-from-top-6 duration-300">
           <div className={`${notification.type === 'error' ? 'bg-rose-500 shadow-rose-500/20' : 'bg-emerald-600 shadow-emerald-600/20'} text-white rounded-[28px] p-8 shadow-2xl flex items-center justify-between gap-8 border border-white/20`}>
              <div className="flex items-center gap-5">
                {notification.type === 'error' ? <AlertCircle className="w-8 h-8 shrink-0" /> : <CheckCircle2 className="w-8 h-8 shrink-0" />}
                <p className="text-base font-bold leading-relaxed">{notification.message}</p>
              </div>
              <button onClick={() => setNotification(null)} className="p-3 hover:bg-white/10 rounded-2xl transition-colors">
                <X className="w-6 h-6" />
              </button>
           </div>
        </div>
      )}

      {tourActive && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-8 bg-slate-900/70 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white dark:bg-[#0f172a] border border-violet-500/20 rounded-[56px] p-14 max-w-2xl w-full shadow-2xl space-y-12 animate-in zoom-in-95 duration-300">
            <div className="flex flex-col items-center text-center space-y-8">
              <div className="w-24 h-24 rounded-[32px] bg-violet-500/10 flex items-center justify-center shadow-inner">
                {TOUR_STEPS[tourStep].icon}
              </div>
              <div className="space-y-4">
                <h4 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">{TOUR_STEPS[tourStep].title}</h4>
                <p className="text-lg text-slate-500 dark:text-slate-400 font-medium leading-relaxed">{TOUR_STEPS[tourStep].description}</p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-8">
              <div className="flex gap-3">
                {TOUR_STEPS.map((_, i) => (
                  <div key={i} className={`h-2.5 rounded-full transition-all duration-300 ${i === tourStep ? 'w-12 bg-violet-500' : 'w-3 bg-slate-200 dark:bg-white/10'}`} />
                ))}
              </div>
              <div className="flex items-center gap-6">
                <button onClick={() => setTourActive(false)} className="px-8 py-4 text-sm font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">Skip</button>
                <div className="flex gap-4">
                  {tourStep > 0 && (
                    <button onClick={() => setTourStep(tourStep - 1)} className="p-5 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 rounded-3xl hover:bg-slate-200 dark:hover:bg-white/10 transition-all"><ChevronLeft className="w-6 h-6" /></button>
                  )}
                  <button onClick={() => tourStep === TOUR_STEPS.length - 1 ? setTourActive(false) : setTourStep(tourStep + 1)} className="flex items-center gap-4 px-10 py-5 bg-violet-500 text-white rounded-[28px] text-sm font-black uppercase tracking-widest hover:bg-violet-400 transition-all shadow-xl shadow-violet-500/20">
                    {tourStep === TOUR_STEPS.length - 1 ? 'Start Career Hunt' : 'Next'}
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <header className="h-20 border-b border-slate-200 dark:border-white/5 flex items-center px-10 lg:px-20 justify-between sticky top-0 bg-white/90 dark:bg-[#020617]/90 backdrop-blur-2xl z-50">
        <div id="header-brand" className="flex items-center gap-6 group cursor-pointer" onClick={() => handleReset()}>
          <BrandLogo size={36} className="w-14 h-14" />
          <span className="text-3xl font-black tracking-tighter text-slate-900 dark:text-white uppercase">HIRELY<span className="text-violet-500">.AI</span></span>
        </div>
        
        <div className="flex items-center gap-8">
          <button onClick={startTour} className="hidden sm:flex items-center gap-4 px-8 py-4 text-sm font-black uppercase tracking-widest text-violet-500 hover:text-violet-400 transition-colors bg-violet-500/10 rounded-3xl border border-violet-500/20 shadow-sm">
            <PlayCircle className="w-5 h-5" /> Quick Tour
          </button>
          <button onClick={toggleTheme} className="p-4 text-slate-400 hover:text-violet-500 transition-colors bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm">
            {isDarkMode ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full p-10 lg:p-14 space-y-16 overflow-y-auto custom-scrollbar">
        
        <div id="strategy-config" className="space-y-6">
          <button onClick={() => setShowSettings(!showSettings)} className="flex items-center gap-4 text-sm font-black uppercase tracking-[0.25em] text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors ml-4">
            {showSettings ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            Professional Strategy Settings
            <span className="ml-4 text-xs font-bold text-slate-500 dark:text-slate-600 bg-slate-100 dark:bg-white/10 px-4 py-2 rounded-full">{showSettings ? 'Active' : 'Options'}</span>
          </button>

          {showSettings && (
            <section className="bg-white/90 dark:bg-[#0f172a]/60 backdrop-blur-xl border border-slate-200 dark:border-white/5 rounded-[48px] p-12 animate-in slide-in-from-top-4 duration-300 grid grid-cols-1 md:grid-cols-2 gap-16 shadow-lg relative z-40">
              <div className="space-y-8">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-black uppercase tracking-widest text-slate-500 flex items-center">Career Stage <InfoTooltip text="Tailors phrasing to your specific seniority level." /></label>
                  <span className="text-sm font-black text-violet-500 uppercase">{refactorSettings.level}</span>
                </div>
                <div className="flex bg-slate-200 dark:bg-black/50 p-2.5 rounded-3xl border border-slate-300 dark:border-white/10">
                  {['junior', 'mid', 'senior', 'staff'].map((lvl) => (
                    <button key={lvl} onClick={() => setRefactorSettings(s => ({ ...s, level: lvl as any }))} className={`flex-1 py-4 text-xs font-black uppercase tracking-tighter rounded-2xl transition-all ${refactorSettings.level === lvl ? 'bg-violet-500 text-white shadow-2xl shadow-violet-500/30' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'}`}>
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-8">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-black uppercase tracking-widest text-slate-500 flex items-center">JD Match Intensity <InfoTooltip text="Higher values force stricter alignment with target job keywords." /></label>
                  <span className="text-sm font-black text-violet-500 uppercase">{refactorSettings.jdAlignment}%</span>
                </div>
                <div className="px-3 pt-6">
                  <input type="range" min="1" max="100" value={refactorSettings.jdAlignment} onChange={(e) => setRefactorSettings(s => ({ ...s, jdAlignment: parseInt(e.target.value) }))} className="w-full h-3 bg-slate-300 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-violet-500" />
                </div>
              </div>
            </section>
          )}
        </div>

        {loading || refactoring ? (
          <div className="h-[600px] flex flex-col items-center justify-center space-y-12 bg-slate-900/10 dark:bg-[#0f172a]/20 backdrop-blur-md border border-slate-200 dark:border-white/5 rounded-[80px] relative overflow-hidden group shadow-inner">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(139,92,246,0.12)_0%,transparent_70%)]" />
            <div className="relative z-10 flex flex-col items-center gap-8">
              <div className="relative">
                <div className="absolute inset-0 bg-violet-500/20 blur-3xl animate-pulse rounded-full" />
                <Terminal className="w-20 h-20 text-violet-500 animate-bounce relative z-10" />
              </div>
              <div className="space-y-4 text-center">
                <p className="text-lg font-black uppercase tracking-[0.6em] text-violet-500 transition-all duration-1000 animate-pulse">{scanStep}</p>
                <div className="w-64 h-2 bg-slate-200 dark:bg-white/5 rounded-full overflow-hidden mx-auto">
                   <div className="h-full bg-violet-500 animate-[loading_2s_infinite]" style={{ width: '40%' }}></div>
                </div>
              </div>
            </div>
          </div>
        ) : result ? (
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
                         <button onClick={() => handleOpenPreview(readyHtml)} className="w-full flex items-center justify-center gap-5 px-10 py-6 bg-emerald-500 hover:bg-emerald-400 text-white rounded-[28px] text-sm font-black uppercase tracking-[0.2em] shadow-2xl shadow-emerald-500/40 transition-all active:scale-95 animate-bounce">
                           <Eye className="w-7 h-7" /> View Optimized Resume
                         </button>
                      ) : (
                        <div className="relative">
                          <button onClick={() => setShowRefactorOptions(!showRefactorOptions)} className="w-full flex items-center justify-center gap-5 px-10 py-6 bg-violet-600 hover:bg-violet-500 text-white rounded-[28px] text-sm font-black uppercase tracking-[0.2em] shadow-2xl shadow-violet-500/40 transition-all active:scale-95">
                            <Download className="w-7 h-7" /> Download Resume
                          </button>
                          {showRefactorOptions && (
                            <div className="absolute bottom-full left-0 right-0 mb-6 bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-white/10 rounded-[28px] p-3 shadow-3xl z-[100] animate-in fade-in slide-in-from-bottom-6">
                              <button onClick={() => handleRefactor('pdf')} className="w-full flex items-center gap-4 px-6 py-4 hover:bg-slate-50 dark:hover:bg-white/10 rounded-2xl text-[13px] font-black uppercase tracking-widest text-slate-700 dark:text-slate-200 transition-colors">
                                <Sparkles className="w-5 h-5 text-violet-500" /> Optimize into PDF
                              </button>
                              <button onClick={() => handleRefactor('docx')} className="w-full flex items-center gap-4 px-6 py-4 hover:bg-slate-50 dark:hover:bg-white/10 rounded-2xl text-[13px] font-black uppercase tracking-widest text-slate-700 dark:text-slate-200 transition-colors">
                                <FileDown className="w-5 h-5 text-blue-500" /> Download as Word (.docx)
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    <button onClick={handleReset} className="flex items-center gap-4 text-sm font-black uppercase tracking-widest text-slate-400 hover:text-violet-500 transition-colors mt-6"><RefreshCw className="w-5 h-5" /> Start New Audit</button>
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
              <section className="bg-black border border-violet-500/20 rounded-[40px] p-12 font-mono text-base text-emerald-500/80 animate-in zoom-in-95 shadow-inner">
                <div className="flex items-center justify-between mb-8 border-b border-white/10 pb-6">
                   <span className="text-xs font-bold text-slate-500 uppercase tracking-[0.3em]">{selectedFile?.name}_RAW_SIMULATION</span>
                   <Terminal className="w-6 h-6 text-slate-500" />
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
                    <span className="text-sm font-black uppercase tracking-widest text-violet-500 flex items-center gap-4"><CheckCircle2 className="w-5 h-5" /> Core Competencies Identified</span>
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
                    <span className="text-sm font-black uppercase tracking-widest text-rose-500 flex items-center gap-4"><AlertCircle className="w-5 h-5" /> Critical Skills Gaps</span>
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
                  <h3 className="text-sm font-black uppercase tracking-[0.5em] text-slate-400 dark:text-slate-600">Strategic Polish Recommendations</h3>
                </div>
                <div className="relative group">
                  <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-violet-500 transition-colors" />
                  <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Filter insights..." className="pl-14 pr-8 py-4 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl text-sm font-medium placeholder:text-slate-400 outline-none focus:ring-4 focus:ring-violet-500/10 transition-all w-full sm:w-72 shadow-sm" />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-10">
                {filteredSuggestions.map((suggestion, idx) => (
                  <div key={idx} className="bg-white/90 dark:bg-[#0f172a]/40 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-[48px] p-10 lg:p-12 hover:shadow-2xl hover:scale-[1.01] transition-all duration-300 space-y-10 group/card">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-10">
                      <div className="flex items-center gap-8">
                        <div className={`w-16 h-16 rounded-[24px] flex items-center justify-center shrink-0 border transition-colors ${suggestion.severity === 'high' ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' : suggestion.severity === 'medium' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'}`}>
                          {suggestion.severity === 'high' ? <AlertTriangle className="w-8 h-8" /> : suggestion.severity === 'medium' ? <Lightbulb className="w-8 h-8" /> : <CheckCircle2 className="w-8 h-8" />}
                        </div>
                        <div>
                          <h4 className="text-xl font-bold text-slate-900 dark:text-white">{suggestion.location}</h4>
                          <p className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-600 mt-2">{suggestion.type} Strategy</p>
                        </div>
                      </div>
                      <span className={`text-xs font-black uppercase tracking-widest px-6 py-3 rounded-2xl border ${suggestion.severity === 'high' ? 'bg-rose-500/5 text-rose-500 border-rose-500/20' : suggestion.severity === 'medium' ? 'bg-amber-500/5 text-amber-500 border-amber-500/20' : 'bg-emerald-500/5 text-emerald-500 border-emerald-500/20'}`}>
                        {suggestion.severity === 'high' ? 'Critical Action' : suggestion.severity === 'medium' ? 'Strategic Polish' : 'Optimization'}
                      </span>
                    </div>

                    <div className="bg-slate-50 dark:bg-black/30 border-l-8 border-violet-500/40 p-8 rounded-r-3xl group-hover/card:bg-violet-500/[0.03] transition-colors">
                      <div className="flex items-center gap-4 mb-4"><BrainCircuit className="w-6 h-6 text-violet-500" /><span className="text-xs font-black uppercase tracking-widest text-violet-500/80">Professional Thinking</span></div>
                      <p className="text-base text-slate-600 dark:text-slate-400 leading-relaxed italic">{suggestion.thinking}</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      <div className="bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/5 rounded-3xl p-8"><span className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-700 block mb-4">Original Entry</span><HighlightedText text={suggestion.original_text} /></div>
                      <div className="bg-violet-500/[0.04] border border-violet-500/10 rounded-3xl p-8 relative group">
                        <div className="flex items-center justify-between mb-4"><span className="text-xs font-black uppercase tracking-widest text-violet-500/80">Optimized Refactoring</span><button onClick={() => navigator.clipboard.writeText(suggestion.fix.replace(/^[^:]+:\s*/, '').replace(/^['"]|['"]$/g, ''))} className="text-xs font-black text-violet-500 hover:text-slate-900 dark:hover:text-white transition-all flex items-center gap-3 px-5 py-2.5 bg-violet-500/10 rounded-xl hover:bg-violet-500/20"><Copy className="w-4 h-4" /> COPY FIX</button></div>
                        <p className="text-base font-bold text-slate-800 dark:text-violet-50 leading-relaxed font-mono">{suggestion.fix}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center space-y-16 animate-in fade-in duration-700">
            <div id="upload-section" className="w-full max-w-6xl h-[640px] border-4 border-dashed border-slate-200 dark:border-white/5 rounded-[96px] flex flex-col items-center justify-center text-center p-20 space-y-12 bg-white/50 dark:bg-[#0f172a]/10 backdrop-blur-xl hover:bg-white/80 dark:hover:bg-[#0f172a]/20 hover:scale-[1.002] transition-all duration-700 relative overflow-hidden group shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
              <div className="w-48 h-48 rounded-[56px] bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-white/10 flex items-center justify-center shadow-3xl relative z-10 group-hover:scale-110 transition-transform duration-700">
                <BrandLogo size={72} className="w-36 h-36" />
                <div className="absolute -top-6 -right-6 w-16 h-16 bg-violet-500 rounded-3xl flex items-center justify-center shadow-2xl border-8 border-white dark:border-[#020617] animate-bounce z-20"><Sparkles className="w-7 h-7 text-white" /></div>
              </div>
              <div className="space-y-8 relative z-10">
                <h2 className="text-4xl font-black tracking-tighter text-slate-900 dark:text-white uppercase tracking-[0.1em]">Hirely Strategic Assistant</h2>
                <p className="max-w-3xl text-xl text-slate-500 dark:text-slate-500 leading-relaxed mx-auto font-medium">Upload your resume and a target job description to begin a high-fidelity career acceleration audit.</p>
                <div className="pt-10">
                  <button onClick={() => fileInputRef.current?.click()} className="px-14 py-7 bg-violet-500 text-white rounded-[36px] font-black uppercase text-base tracking-widest shadow-2xl shadow-violet-500/30 hover:scale-105 active:scale-95 transition-all flex items-center gap-6 mx-auto">
                    <Upload className="w-6 h-6" /> Choose Resume File
                  </button>
                  <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept=".pdf,.docx" />
                </div>
                {selectedFile && <div className="flex items-center gap-4 justify-center text-violet-500 animate-in fade-in zoom-in font-black uppercase text-sm tracking-[0.2em] mt-10"><div className="p-2 bg-violet-500 rounded-full shadow-lg"><CheckCircle2 className="w-5 h-5 text-white" /></div> {selectedFile.name} Ready for Audit</div>}
              </div>
            </div>

            <div id="jd-section" className="w-full max-w-4xl animate-in slide-in-from-top-8 duration-500 delay-300">
              <div className="bg-white/90 dark:bg-[#0f172a]/50 backdrop-blur-2xl border border-slate-200 dark:border-white/10 rounded-[64px] p-12 space-y-8 shadow-2xl hover:shadow-3xl transition-all border-b-8 border-b-violet-500/30">
                <div className="flex items-center justify-between px-4">
                   <div className="flex items-center gap-6"><div className="w-12 h-12 rounded-2xl bg-violet-500/10 flex items-center justify-center"><Target className="w-7 h-7 text-violet-500" /></div><h3 className="text-sm font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Target Role Requirements</h3></div>
                   {jdText && <span className="text-xs font-bold text-violet-500 bg-violet-500/10 px-4 py-2 rounded-full uppercase tracking-widest animate-pulse">Context Loaded</span>}
                </div>
                <textarea value={jdText} onChange={(e) => setJdText(e.target.value)} placeholder="Paste the Job Description to tailor your profile strategy..." className="w-full bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-white/5 rounded-[40px] p-10 text-lg resize-none h-56 custom-scrollbar font-medium outline-none focus:ring-4 focus:ring-violet-500/10 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-700" />
                <div className="flex justify-center pt-6">
                  <button onClick={handleAudit} disabled={!selectedFile || loading} className="group relative flex items-center gap-6 px-16 py-7 bg-violet-500 disabled:bg-slate-300 dark:disabled:bg-slate-800 text-white rounded-[32px] font-black uppercase text-sm tracking-[0.25em] shadow-2xl shadow-violet-500/30 active:scale-95 transition-all">
                    <Zap className="w-6 h-6 fill-white" /> {loading ? 'Auditing Resume...' : 'Analyze Professional Profile'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <button id="hirely-fab" onClick={() => setChatOpen(!chatOpen)} className={`fixed bottom-10 right-10 w-20 h-20 rounded-full bg-violet-500 text-white shadow-3xl shadow-violet-500/40 hover:scale-110 active:scale-95 transition-all z-[110] flex items-center justify-center group ${chatOpen ? 'rotate-90 bg-slate-800 dark:bg-white text-white dark:text-slate-900' : ''}`}>
        {chatOpen ? <X className="w-8 h-8" /> : <MessageSquare className="w-8 h-8" />}
        {!chatOpen && <div className="absolute -top-1 -right-1 w-6 h-6 bg-rose-500 border-4 border-white dark:border-[#020617] rounded-full animate-bounce" />}
      </button>

      <div className={`fixed bottom-36 right-10 w-[480px] max-w-[calc(100%-4rem)] h-[720px] max-h-[calc(100vh-200px)] bg-white dark:bg-[#020617] border border-slate-200 dark:border-white/10 shadow-3xl transition-all duration-300 z-[100] flex flex-col rounded-[56px] overflow-hidden ${chatOpen ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-20 opacity-0 scale-95 pointer-events-none'}`}>
        <div className="p-10 border-b border-slate-200 dark:border-white/10 flex items-center justify-between bg-slate-50/50 dark:bg-[#080d1a]/50">
          <div className="flex items-center gap-5">
            <BrandLogo size={28} className="w-14 h-14" />
            <div>
              <h3 className="font-black text-base text-slate-900 dark:text-white uppercase tracking-widest leading-none mb-2">Hirely AI Advisor</h3>
              <p className="text-xs text-emerald-500 font-bold uppercase tracking-widest flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Strategist Online
              </p>
            </div>
          </div>
          <button onClick={() => setChatOpen(false)} className="p-4 hover:bg-slate-100 dark:hover:bg-white/10 rounded-2xl transition-all"><X className="w-8 h-8 text-slate-500" /></button>
        </div>
        
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-10 space-y-10 custom-scrollbar bg-white dark:bg-[#020617]">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[88%] p-6 rounded-[32px] text-base leading-relaxed shadow-sm ${msg.role === 'user' ? 'bg-violet-600 text-white rounded-tr-none' : 'bg-slate-100 dark:bg-slate-900/80 text-slate-800 dark:text-slate-300 rounded-tl-none border border-slate-200 dark:border-white/5'}`}>
                {msg.role === 'model' ? <FormattedText text={msg.text} /> : msg.text}
              </div>
            </div>
          ))}
          {chatLoading && <div className="flex justify-start"><div className="bg-slate-100 dark:bg-slate-900/80 p-6 rounded-[32px] rounded-tl-none border border-slate-200 dark:border-white/5"><Loader2 className="w-6 h-6 animate-spin text-violet-500" /></div></div>}
        </div>

        <div className="p-10 border-t border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-[#080d1a]/50 flex flex-col gap-8">
          {!chatLoading && (
            <div className="flex flex-wrap gap-3">
              {CHAT_SUGGESTIONS.map((suggestion, i) => (
                <button key={i} onClick={() => handleSendMessage(suggestion.text)} className="flex items-center gap-3 px-5 py-3 bg-white dark:bg-white/10 border border-slate-200 dark:border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 hover:text-violet-500 hover:border-violet-500/30 transition-all shadow-sm">
                  {suggestion.icon} {suggestion.text}
                </button>
              ))}
            </div>
          )}
          <div className="relative">
            <input value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()} placeholder="Ask for career prep advice..." className="w-full bg-white dark:bg-[#020617] border border-slate-200 dark:border-white/10 rounded-[28px] py-6 pl-10 pr-20 text-base focus:ring-2 focus:ring-violet-500 outline-none shadow-inner transition-all" />
            <button onClick={() => handleSendMessage()} disabled={!inputValue.trim() || chatLoading} className="absolute right-3 top-3 p-4 bg-violet-500 text-white rounded-[20px] shadow-lg active:scale-95 transition-all disabled:opacity-50"><Send className="w-6 h-6" /></button>
          </div>
        </div>
      </div>

      <Footer />
      
      <style>{`
        @keyframes loading {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(250%); }
        }
      `}</style>
    </div>
  );
}
