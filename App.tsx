
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
import { auditResumeFile, startManagerChat, refactorResume } from './api/geminiService';
import { AuditResult, Message, FileData, RefactorOptions, Suggestion } from './types/index';

// Helpers
import { openInNewTab, downloadFile } from './helpers/browser';
import { extractCandidateName, generateResumeTemplate } from './helpers/resume';

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
    title: 'Welcome to Hirely AI!',
    description: "I'm your new resume partner. Let's work together to make your professional story shine!",
    icon: <Sparkles className="w-6 h-6 text-violet-500" />
  },
  {
    target: 'strategy-config',
    title: 'Your Career Path',
    description: 'Tell me your goals so I can tailor my advice perfectly for your next big step.',
    icon: <Sliders className="w-6 h-6 text-violet-500" />
  },
  {
    target: 'upload-section',
    title: 'Your Current Resume',
    description: "Upload what you have now. Don't worry, we're going to make it even better together!",
    icon: <Upload className="w-6 h-6 text-violet-500" />
  },
  {
    target: 'jd-section',
    title: 'The Dream Job',
    description: "Paste the job you're excited about so I can help you match exactly what they're looking for.",
    icon: <Target className="w-6 h-6 text-violet-500" />
  },
  {
    target: 'hirely-fab',
    title: 'Chat with Me',
    description: "I'm right here whenever you have a question or need a little extra career advice!",
    icon: <MessageSquare className="w-6 h-6 text-violet-500" />
  }
];

const CHAT_SUGGESTIONS = [
  { text: "How to tailor my resume?", icon: <Target className="w-3 h-3" /> },
  { text: "How to write a bullet point?", icon: <PenTool className="w-3 h-3" /> },
  { text: "What makes a resume stand out?", icon: <Sparkles className="w-3 h-3" /> }
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
  }, [messages, chatLoading, chatOpen]);

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
      setNotification(null);
    };
    reader.readAsDataURL(file);
  };

  const handleAudit = async () => {
    if (!selectedFile) return;
    setLoading(true);
    setResult(null);
    setSearchTerm('');
    const steps = ["Initializing Raw Extraction...", "Detecting ATS Killers...", "Generating Compatibility Report...", "Finalizing Strategic Insights..."];
    let stepIdx = 0;
    setScanStep(steps[0]);
    const interval = setInterval(() => {
      stepIdx = (stepIdx + 1) % steps.length;
      setScanStep(steps[stepIdx]);
    }, 2000); 

    try {
      const auditData = await auditResumeFile(selectedFile, jdText);
      setResult(auditData);
    } catch (err) {
      setNotification({ type: 'error', message: "Oops! My sensors hit a little snag. Let's try again!" });
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
    setShowRefactorOptions(false);
    setNotification(null);
    setReadyHtml(null);

    try {
      const optimizedHtml = await refactorResume(selectedFile, result, jdText, refactorSettings);
      
      if (!optimizedHtml || optimizedHtml.length < 50) {
        throw new Error("Resume optimization returned insufficient data. Please try again.");
      }

      const candidateName = extractCandidateName(optimizedHtml);
      const generatedContent = generateResumeTemplate(optimizedHtml, candidateName);

      if (type === 'pdf') {
        if (!openInNewTab(generatedContent)) {
          setReadyHtml(generatedContent);
          setNotification({ type: 'success', message: "Resume generated! Click the 'View Resume' button to see it." });
        }
      } else if (type === 'docx') {
        const filename = `${candidateName.replace(/\s+/g, '_')}_Optimized.docx`;
        downloadFile(generatedContent, filename, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
      }
    } catch (err: any) {
      console.error(err);
      setNotification({ type: 'error', message: err.message || "Failed to generate resume. Please try again." });
    } finally {
      setRefactoring(false);
    }
  };

  const handleSendMessage = async (customMsg?: string) => {
    const textToSend = customMsg || inputValue;
    if (!textToSend.trim() || chatLoading) return;
    
    if (!chatInstance.current) {
        chatInstance.current = startManagerChat();
    }
    
    setInputValue('');
    setMessages(prev => [...prev, { role: 'user', text: textToSend, timestamp: Date.now() }]);
    setChatLoading(true);
    try {
      const response = await chatInstance.current.sendMessage({ message: textToSend });
      setMessages(prev => [...prev, { role: 'model', text: response.text, timestamp: Date.now() }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'model', text: "I'm having a little trouble connecting. Could you try that again?", timestamp: Date.now() }]);
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
    <div className="min-h-screen flex flex-col bg-transparent text-slate-800 dark:text-slate-300 font-sans selection:bg-violet-500/30 transition-colors duration-300">
      
      {notification && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] w-full max-w-md p-4 animate-in slide-in-from-top-4 duration-300">
           <div className={`${notification.type === 'error' ? 'bg-rose-500' : 'bg-emerald-600'} text-white rounded-2xl p-4 shadow-2xl flex items-center justify-between gap-4 border border-white/20`}>
              <div className="flex items-center gap-3">
                {notification.type === 'error' ? <AlertCircle className="w-5 h-5 shrink-0" /> : <CheckCircle2 className="w-5 h-5 shrink-0" />}
                <p className="text-xs font-bold leading-relaxed">{notification.message}</p>
              </div>
              <button onClick={() => setNotification(null)} className="p-1 hover:bg-white/10 rounded-lg transition-colors">
                <X className="w-4 h-4" />
              </button>
           </div>
        </div>
      )}

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
                    {tourStep === TOUR_STEPS.length - 1 ? 'Let\'s Go!' : 'Next'}
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

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
            Quick Tour
          </button>
          <button 
            onClick={toggleTheme}
            className="p-2 text-slate-400 hover:text-violet-500 transition-colors bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10"
          >
            {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
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
            Optimize Your Strategy
            <span className="ml-2 text-[9px] font-bold text-slate-500 dark:text-slate-600 bg-slate-100 dark:bg-white/5 px-2 py-0.5 rounded-full">{showSettings ? 'Active' : 'Options'}</span>
          </button>

          {showSettings && (
            <section className="bg-white/90 dark:bg-[#0f172a]/60 backdrop-blur-md border border-slate-200 dark:border-white/5 rounded-[30px] p-8 animate-in slide-in-from-top-2 duration-300 grid grid-cols-1 md:grid-cols-2 gap-10 shadow-sm relative z-40">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center">
                    Career Stage <InfoTooltip text="This helps me suggest the best phrasing for your experience level." />
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
                    Match with Job Description <InfoTooltip text="Higher means I'll try to use more specific keywords from the job post." />
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
          <div className="h-[400px] flex flex-col items-center justify-center space-y-6 bg-slate-900/10 dark:bg-[#0f172a]/20 backdrop-blur-sm border border-slate-200 dark:border-white/5 rounded-[50px] relative overflow-hidden group">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(139,92,246,0.05)_0%,transparent_70%)]" />
            <div className="flex flex-col items-center gap-2 relative z-10">
              <Terminal className="w-10 h-10 text-violet-500 animate-pulse" />
            </div>
            <p className="text-[11px] font-black uppercase tracking-[0.4em] text-violet-500 transition-all duration-1000">{scanStep}</p>
          </div>
        ) : result ? (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <section className="lg:col-span-2 bg-white/80 dark:bg-[#080d1a]/80 backdrop-blur-md border border-slate-200 dark:border-white/10 rounded-[32px] p-6 lg:p-10 shadow-xl">
                <div className="flex flex-col items-center text-center space-y-8 max-w-4xl mx-auto">
                  <div className="space-y-2">
                    <div className="flex items-baseline justify-center gap-2">
                      <span className="text-7xl font-black text-slate-900 dark:text-white tracking-tighter">{result.overall_score}</span>
                      <span className="text-2xl font-bold text-slate-400 dark:text-slate-600">/ 100</span>
                    </div>
                    <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-violet-500">Your Resume Readiness</h3>
                  </div>

                  <div className="space-y-3 w-full">
                    <h4 className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-600">Expert Summary</h4>
                    <p className="text-base md:text-lg font-medium leading-relaxed text-slate-700 dark:text-slate-200 px-4">
                      "{result.summary}"
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-6 w-full pt-4">
                    <CriteriaBar score={result.criteria.formatting.score} label="Layout & Design" tooltip="Checking if your layout is easy for recruiters and ATS systems to scan." />
                    <CriteriaBar score={result.criteria.content.score} label="Professional Story" tooltip="Evaluating the clarity and depth of your background description." />
                    <CriteriaBar score={result.criteria.impact.score} label="Achievement Impact" tooltip="Measuring how well your accomplishments demonstrate value." />
                    <CriteriaBar score={result.criteria.relevance.score} label="Strategic Alignment" tooltip="Assessing how well your skills map to the target role." />
                  </div>

                  <div className="w-full pt-6 flex flex-col items-center gap-4 relative">
                    <div className="relative w-full max-w-md">
                      {readyHtml ? (
                         <button
                           onClick={() => handleOpenPreview(readyHtml)}
                           className="w-full flex items-center justify-center gap-3 px-8 py-5 bg-emerald-500 hover:bg-emerald-400 text-white rounded-[24px] text-xs font-black uppercase tracking-[0.2em] shadow-2xl shadow-emerald-500/30 transition-all active:scale-95 animate-bounce"
                         >
                           <Eye className="w-5 h-5" />
                           View Optimized Resume
                         </button>
                      ) : (
                        <div className="relative">
                          <button
                            onClick={() => setShowRefactorOptions(!showRefactorOptions)}
                            disabled={refactoring}
                            className="w-full flex items-center justify-center gap-3 px-8 py-5 bg-violet-600 hover:bg-violet-500 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white rounded-[24px] text-xs font-black uppercase tracking-[0.2em] shadow-2xl shadow-violet-500/30 transition-all active:scale-95"
                          >
                            {refactoring ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
                            {refactoring ? 'Optimizing...' : 'Download Resume'}
                          </button>
                          
                          {showRefactorOptions && (
                            <div className="absolute bottom-full left-0 right-0 mb-4 bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-white/10 rounded-2xl p-2 shadow-2xl z-[100] animate-in fade-in slide-in-from-bottom-4">
                              <button onClick={() => handleRefactor('pdf')} className="w-full flex items-center gap-3 px-4 py-4 hover:bg-slate-50 dark:hover:bg-white/5 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-300 transition-colors">
                                <Sparkles className="w-4 h-4 text-violet-500" /> Generate New Resume (PDF)
                              </button>
                              <button onClick={() => handleRefactor('docx')} className="w-full flex items-center gap-3 px-4 py-4 hover:bg-slate-50 dark:hover:bg-white/5 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-300 transition-colors">
                                <FileDown className="w-4 h-4 text-blue-500" /> Download Word (.docx)
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <button onClick={handleReset} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-violet-500 transition-colors mt-6">
                      <RefreshCw className="w-3.5 h-3.5" /> Start New Audit
                    </button>
                  </div>
                </div>
              </section>

              <section className="bg-slate-900 dark:bg-black border border-white/10 rounded-[32px] p-8 flex flex-col shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4">
                  <Bot className="w-8 h-8 text-violet-500/20 group-hover:text-violet-500/40 transition-colors" />
                </div>
                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                  <Terminal className="w-3.5 h-3.5 text-emerald-500" /> ATS Compatibility
                </h3>
                <div className="space-y-4">
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-black text-white">{result.ats_report.parsing_health_score}%</span>
                    <span className="text-[9px] font-bold text-emerald-500 uppercase">Health Score</span>
                  </div>
                  <div className="space-y-2">
                    {result.ats_report.layout_warnings.map((warn, i) => (
                      <div key={i} className="flex items-start gap-2 text-[10px] text-slate-400 bg-white/5 p-2 rounded-lg border border-white/5">
                        <AlertTriangle className="w-3 h-3 text-amber-500 shrink-0 mt-0.5" />
                        {warn}
                      </div>
                    ))}
                    {result.ats_report.layout_warnings.length === 0 && (
                      <div className="text-[10px] text-emerald-500 bg-emerald-500/10 p-2 rounded-lg border border-emerald-500/20">
                        Layout is fully optimized for machine parsing.
                      </div>
                    )}
                  </div>
                  <button onClick={() => setShowBotView(!showBotView)} className="w-full flex items-center justify-center gap-2 py-3 border border-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest text-slate-300 hover:bg-white/5 transition-all">
                    {showBotView ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    {showBotView ? 'Hide Bot View' : 'View as Bot'}
                  </button>
                </div>
              </section>
            </div>

            {showBotView && (
              <section className="bg-black border border-violet-500/20 rounded-2xl p-6 font-mono text-xs text-emerald-500/80 animate-in zoom-in-95">
                <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-2">
                   <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                     {selectedFile ? `${selectedFile.name.split('.')[0]}_RAW_ATS_TEXT` : 'RAW_ATS_TEXT_PARSER.buffer'}
                   </span>
                   <Terminal className="w-4 h-4 text-slate-500" />
                </div>
                <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                  <pre className="whitespace-pre-wrap leading-relaxed">{result.ats_report.view_as_bot_preview}</pre>
                </div>
              </section>
            )}

            <section className="bg-white/50 dark:bg-[#0f172a]/20 backdrop-blur-sm border border-slate-200 dark:border-white/5 rounded-[32px] p-6 lg:p-8 space-y-6 shadow-sm">
              <div className="flex items-center gap-3 px-2">
                <Target className="w-4 h-4 text-slate-400 dark:text-slate-600" />
                <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 dark:text-slate-600">Keyword Density Map</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/5 pb-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-violet-500 flex items-center gap-2">
                      <CheckCircle2 className="w-3 h-3" /> {jdText ? 'Core Competencies Matched' : 'Relevant Industry Keywords Found'}
                    </span>
                    <span className="text-[9px] font-bold text-slate-400">Frequency Score</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {result.jd_alignment.keyword_weights.filter(kw => result.jd_alignment.matched_keywords.includes(kw.keyword)).map((kw, i) => (
                      <div key={i} className="flex items-center gap-2 px-3 py-1.5 bg-violet-500/10 border border-violet-500/20 rounded-full text-[10px] font-bold uppercase text-violet-600 dark:text-violet-400">
                        {kw.keyword}
                        <span className="bg-violet-500 text-white px-1.5 py-0.5 rounded-full text-[8px]">{kw.count}x</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/5 pb-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-rose-500 flex items-center gap-2">
                      <AlertCircle className="w-3 h-3" /> {jdText ? 'Critical Gaps to Address' : 'Recommended Industry Skills'}
                    </span>
                    <span className="text-[9px] font-bold text-slate-400">Priority Weight</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {result.jd_alignment.keyword_weights.filter(kw => result.jd_alignment.missing_keywords.includes(kw.keyword)).map((kw, i) => (
                      <div key={i} className="flex items-center gap-2 px-3 py-1.5 bg-rose-500/10 border border-rose-500/20 rounded-full text-[10px] font-bold uppercase text-rose-600 dark:text-rose-400">
                        {kw.keyword}
                        <span className="bg-rose-500 text-white px-1.5 py-0.5 rounded-full text-[8px]">{kw.importance}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            <div className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-4">
                <div className="flex items-center gap-3">
                  <ArrowUpRight className="w-4 h-4 text-slate-400 dark:text-slate-600" />
                  <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 dark:text-slate-600">Strategic Polish ({filteredSuggestions.length})</h3>
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <div className="relative group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 group-focus-within:text-violet-500 transition-colors" />
                    <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search insights..." className="pl-9 pr-4 py-2 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-[10px] font-medium placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-violet-500/20 transition-all w-full sm:w-48" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {filteredSuggestions.map((suggestion, idx) => (
                  <div key={idx} className="bg-white/80 dark:bg-[#0f172a]/30 backdrop-blur-sm border border-slate-200 dark:border-white/5 rounded-[24px] p-6 hover:shadow-2xl hover:scale-[1.02] hover:-translate-y-1 hover:border-violet-500/20 transition-all duration-300 space-y-6 group/card">
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
                          <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-600 mt-0.5">{suggestion.type} Polish</p>
                        </div>
                      </div>
                      <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border ${
                        suggestion.severity === 'high' ? 'bg-rose-500/5 text-rose-500 border-rose-500/20' : 
                        suggestion.severity === 'medium' ? 'bg-amber-500/5 text-amber-500 border-amber-500/20' : 
                        'bg-emerald-500/5 text-emerald-500 border-emerald-500/20'
                      }`}>
                        {suggestion.severity === 'high' ? 'High Impact' : suggestion.severity === 'medium' ? 'Strategic Polish' : 'Refinement'}
                      </span>
                    </div>

                    <div className="bg-slate-50/50 dark:bg-black/20 border-l-2 border-violet-500/30 dark:border-violet-500/20 p-4 rounded-r-xl group-hover/card:bg-violet-500/[0.02] transition-colors">
                      <div className="flex items-center gap-2 mb-2">
                        <BrainCircuit className="w-3.5 h-3.5 text-violet-500" />
                        <span className="text-[9px] font-black uppercase tracking-widest text-violet-500/80">Professional Rationale</span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed italic">{suggestion.thinking}</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <div className="bg-slate-50/50 dark:bg-black/40 border border-slate-200 dark:border-white/5 rounded-xl p-4">
                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-700 block mb-2">Current Content</span>
                        <HighlightedText text={suggestion.original_text} />
                      </div>
                      <div className="bg-violet-500/[0.03] border border-violet-500/10 rounded-xl p-4 relative group">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[9px] font-black uppercase tracking-widest text-violet-500/80">Proposed Optimization</span>
                          <button onClick={() => navigator.clipboard.writeText(suggestion.fix)} className="text-[9px] font-black text-violet-500 hover:text-slate-900 dark:hover:text-white transition-all flex items-center gap-1.5 px-2 py-1 bg-violet-500/10 rounded-md hover:bg-violet-500/20">
                            <Copy className="w-3 h-3" /> COPY TO CLIPBOARD
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
            <div id="upload-section" className="w-full max-w-4xl h-[520px] flex flex-col items-center justify-center text-center p-12 border-2 border-dashed border-slate-200 dark:border-white/5 rounded-[60px] space-y-8 bg-white/50 dark:bg-[#0f172a]/10 backdrop-blur-sm hover:bg-white/70 dark:hover:bg-[#0f172a]/20 hover:scale-[1.005] transition-all duration-500 relative overflow-hidden group shadow-inner">
              <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              <div className="w-32 h-32 rounded-[40px] bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-white/10 flex items-center justify-center shadow-2xl relative z-10 overflow-visible group-hover:scale-110 transition-transform duration-500">
                <BrandLogo size={40} className="w-24 h-24" />
                <div className="absolute -top-3 -right-3 w-10 h-10 bg-violet-500 rounded-2xl flex items-center justify-center shadow-lg border-4 border-white dark:border-[#020617] animate-bounce z-20">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
              </div>
              <div className="space-y-4 relative z-10">
                <h2 className="text-2xl font-black tracking-tighter text-slate-900 dark:text-white uppercase tracking-widest">Hirely AI Assistant</h2>
                <p className="max-w-xl text-sm text-slate-500 dark:text-slate-600 leading-relaxed mx-auto">Upload your current resume and a target job description to begin your career acceleration.</p>
                <div className="pt-6">
                  <button onClick={() => fileInputRef.current?.click()} className="px-8 py-4 bg-violet-500 text-white rounded-[22px] font-black uppercase text-xs tracking-[0.2em] shadow-2xl shadow-violet-500/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-3 mx-auto">
                    <Upload className="w-4 h-4" /> Select Resume File
                  </button>
                  <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept=".pdf,.docx" />
                </div>
                {selectedFile && <div className="flex items-center gap-3 justify-center text-violet-500 animate-in fade-in zoom-in font-bold uppercase text-[11px] tracking-widest mt-6"><div className="p-1 bg-violet-500 rounded-full"><CheckCircle2 className="w-3.5 h-3.5 text-white" /></div>{selectedFile.name} Ready</div>}
              </div>
            </div>

            <div id="jd-section" className="w-full max-w-2xl animate-in slide-in-from-top-4 duration-500 delay-200">
              <div className="bg-white/80 dark:bg-[#0f172a]/40 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-[40px] p-6 space-y-4 shadow-xl hover:shadow-2xl transition-all border-b-4 border-b-violet-500/30">
                <div className="flex items-center justify-between px-2">
                   <div className="flex items-center gap-3"><div className="w-8 h-8 rounded-xl bg-violet-500/10 flex items-center justify-center"><Target className="w-4 h-4 text-violet-500" /></div><h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">Target Role Description</h3></div>
                   {jdText && <span className="text-[9px] font-bold text-violet-500 bg-violet-500/10 px-2 py-0.5 rounded-full uppercase">Processing Context...</span>}
                </div>
                <textarea value={jdText} onChange={(e) => setJdText(e.target.value)} placeholder="Paste the Job Description to tailor your strategy..." className="w-full bg-slate-50/50 dark:bg-black/20 border border-slate-200 dark:border-white/5 rounded-3xl p-6 text-sm resize-none h-40 custom-scrollbar font-medium outline-none focus:ring-2 focus:ring-violet-500/20 transition-all" />
                <div className="flex justify-center pt-2">
                  <button onClick={handleAudit} disabled={!selectedFile || loading} className="group relative flex items-center gap-3 px-10 py-4 bg-violet-500 disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-400 text-white rounded-[24px] font-black uppercase text-[11px] tracking-[0.2em] shadow-xl shadow-violet-500/20 active:scale-95 transition-all overflow-hidden">
                    <Zap className="w-4 h-4 fill-white" /> {loading ? 'Auditing Resume...' : 'Analyze My Professional Profile'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <button 
        id="hirely-fab"
        onClick={() => setChatOpen(!chatOpen)}
        className={`fixed bottom-6 right-6 w-14 h-14 rounded-full bg-violet-500 text-white shadow-2xl shadow-violet-500/40 hover:scale-110 active:scale-95 transition-all z-[110] flex items-center justify-center group ${chatOpen ? 'rotate-90 bg-slate-800 dark:bg-white text-white dark:text-slate-900' : ''}`}
      >
        {chatOpen ? <X className="w-6 h-6" /> : (
          <div className="relative">
            <MessageSquare className="w-6 h-6 group-hover:hidden" />
            <Sparkles className="w-6 h-6 hidden group-hover:block animate-pulse" />
          </div>
        )}
        {!chatOpen && (
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 border-2 border-white dark:border-[#020617] rounded-full" />
        )}
      </button>

      <div className={`fixed bottom-24 right-6 w-[calc(100%-3rem)] sm:w-[420px] h-[600px] max-h-[calc(100vh-160px)] bg-white dark:bg-[#020617] border border-slate-200 dark:border-white/10 shadow-2xl transition-all duration-300 z-[100] flex flex-col rounded-[32px] overflow-hidden ${chatOpen ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-12 opacity-0 scale-95 pointer-events-none'}`}>
        <div className="p-6 border-b border-slate-200 dark:border-white/5 flex items-center justify-between bg-slate-50/50 dark:bg-[#080d1a]/50">
          <div className="flex items-center gap-3">
            <BrandLogo size={20} className="w-10 h-10 shadow-violet-500/10" />
            <div>
              <h3 className="font-black text-xs text-slate-900 dark:text-white uppercase tracking-widest leading-none mb-1">Hirely AI Advisor</h3>
              <p className="text-[9px] text-emerald-500 font-bold uppercase tracking-widest flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" /> I'm here to help!
              </p>
            </div>
          </div>
          <button onClick={() => setChatOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl transition-all">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>
        
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-white dark:bg-[#020617]">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] p-4 rounded-[24px] text-xs leading-relaxed shadow-sm ${msg.role === 'user' ? 'bg-violet-600 text-white rounded-tr-none' : 'bg-slate-100 dark:bg-slate-900/80 text-slate-800 dark:text-slate-300 rounded-tl-none border border-slate-200 dark:border-white/5'}`}>
                {msg.role === 'model' ? <FormattedText text={msg.text} /> : msg.text}
              </div>
            </div>
          ))}
          {chatLoading && (
            <div className="flex justify-start">
              <div className="bg-slate-100 dark:bg-slate-900/80 p-4 rounded-[24px] rounded-tl-none border border-slate-200 dark:border-white/5">
                <Loader2 className="w-4 h-4 animate-spin text-violet-500" />
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-[#080d1a]/50 flex flex-col gap-4">
          {!chatLoading && (
            <div className="flex flex-wrap gap-2 items-center">
              {CHAT_SUGGESTIONS.map((suggestion, i) => (
                <button
                  key={i}
                  onClick={() => handleSendMessage(suggestion.text)}
                  className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 hover:text-violet-500 hover:border-violet-500/30 hover:bg-violet-500/5 transition-all shadow-sm active:scale-95"
                >
                  {suggestion.icon}
                  {suggestion.text}
                </button>
              ))}
            </div>
          )}
          
          <div className="relative">
            <input 
              value={inputValue} 
              onChange={(e) => setInputValue(e.target.value)} 
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()} 
              placeholder="Ask for strategic advice..." 
              className="w-full bg-white dark:bg-[#020617] border border-slate-200 dark:border-white/10 rounded-2xl py-4 pl-6 pr-14 text-xs focus:ring-1 focus:ring-violet-500 outline-none shadow-inner transition-all" 
            />
            <button 
              onClick={() => handleSendMessage()} 
              disabled={!inputValue.trim() || chatLoading}
              className="absolute right-2 top-2 p-2.5 bg-violet-500 text-white rounded-xl active:scale-95 transition-all disabled:opacity-50 disabled:active:scale-100"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
