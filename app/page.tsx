
"use client";

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  CheckCircle2, Loader2, AlertTriangle, 
  Lightbulb, Target, Zap, Send, MessageSquare, 
  X, Copy, Sun, Moon,
  ArrowUpRight, Download, Sparkles, FileDown,
  Upload, ChevronDown, ChevronUp,
  Search, AlertCircle, RefreshCw, BrainCircuit, PlayCircle, ChevronRight, ChevronLeft,
  Terminal, Bot, Eye, EyeOff, PenTool
} from 'lucide-react';

import { AuditResult, Message, FileData, RefactorOptions } from '@/lib/types';
import { openInNewTab, downloadFile } from '@/helpers/browser';
import { extractCandidateName, generateResumeTemplate } from '@/helpers/resume';
import { cleanAIHtml } from '@/helpers/string';

import { BrandLogo } from '@/components/BrandLogo';
import { HighlightedText } from '@/components/HighlightedText';
import { FormattedText } from '@/components/FormattedText';
import { InfoTooltip } from '@/components/InfoTooltip';
import { CriteriaBar } from '@/components/CriteriaBar';
import { Footer } from '@/components/Footer';

const TOUR_STEPS = [
  { target: 'header-brand', title: 'Welcome to Hirely AI!', description: "I'm your new resume partner.", icon: <Sparkles className="w-6 h-6 text-violet-500" /> },
  { target: 'strategy-config', title: 'Your Career Path', description: 'Tell me your goals.', icon: <Target className="w-6 h-6 text-violet-500" /> },
  { target: 'upload-section', title: 'Your Current Resume', description: "Upload what you have now.", icon: <Upload className="w-6 h-6 text-violet-500" /> },
  { target: 'jd-section', title: 'The Dream Job', description: "Paste the job you're excited about.", icon: <Target className="w-6 h-6 text-violet-500" /> },
  { target: 'hirely-fab', title: 'Chat with Me', description: "I'm right here whenever you have a question!", icon: <MessageSquare className="w-6 h-6 text-violet-500" /> }
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
  const [refactorSettings, setRefactorSettings] = useState<RefactorOptions>({ level: 'junior', jdAlignment: 100 });
  const [messages, setMessages] = useState<Message[]>([{ role: 'model', text: "Hi! I'm Hirely AI, your personal resume partner. Shall we take a look at your profile?", timestamp: Date.now() }]);
  const [inputValue, setInputValue] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isDarkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [isDarkMode]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
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

  const handleAudit = async () => {
    if (!selectedFile) return;
    setLoading(true);
    setResult(null);
    const steps = ["Initializing...", "Detecting ATS Killers...", "Generating Report...", "Finalizing..."];
    let stepIdx = 0;
    setScanStep(steps[0]);
    const interval = setInterval(() => {
      stepIdx = (stepIdx + 1) % steps.length;
      setScanStep(steps[stepIdx]);
    }, 1500);

    try {
      const auditData = await callApi('audit', { file: selectedFile, jdText });
      setResult(auditData);
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message });
    } finally {
      clearInterval(interval);
      setLoading(false);
    }
  };

  const handleRefactor = async (type: 'pdf' | 'docx' = 'pdf') => {
    if (!selectedFile || !result) return;
    setRefactoring(true);
    setShowRefactorOptions(false);
    try {
      const { text } = await callApi('refactor', { file: selectedFile, jdText, options: refactorSettings });
      const optimizedHtml = cleanAIHtml(text);
      const candidateName = extractCandidateName(optimizedHtml);
      const generatedContent = generateResumeTemplate(optimizedHtml, candidateName);
      if (type === 'pdf') {
        if (!openInNewTab(generatedContent)) {
          setReadyHtml(generatedContent);
          setNotification({ type: 'success', message: "Ready! Click 'View Resume'." });
        }
      } else {
        downloadFile(generatedContent, `${candidateName}_Optimized.docx`, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
      }
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message });
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
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message });
    } finally {
      setChatLoading(false);
    }
  };

  const filteredSuggestions = useMemo(() => {
    if (!result) return [];
    let list = [...result.suggestions].sort((a, b) => {
      const p = { high: 0, medium: 1, low: 2 };
      return p[a.severity] - p[b.severity];
    });
    if (searchTerm.trim()) {
      const t = searchTerm.toLowerCase();
      list = list.filter(s => s.finding.toLowerCase().includes(t) || s.fix.toLowerCase().includes(t));
    }
    return list;
  }, [result, searchTerm]);

  return (
    <div className="min-h-screen flex flex-col font-sans">
      {/* Notifications */}
      {notification && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] w-full max-w-md p-4 animate-in slide-in-from-top-4">
           <div className={`${notification.type === 'error' ? 'bg-rose-500' : 'bg-emerald-600'} text-white rounded-2xl p-4 shadow-2xl flex items-center justify-between gap-4 border border-white/20`}>
              <div className="flex items-center gap-3">
                {notification.type === 'error' ? <AlertCircle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
                <p className="text-xs font-bold">{notification.message}</p>
              </div>
              <button onClick={() => setNotification(null)} className="p-1 hover:bg-white/10 rounded-lg"><X className="w-4 h-4" /></button>
           </div>
        </div>
      )}

      {/* Header */}
      <header className="h-16 border-b border-slate-200 dark:border-white/5 flex items-center px-6 lg:px-12 justify-between sticky top-0 bg-white/80 dark:bg-[#020617]/80 backdrop-blur-xl z-50">
        <div id="header-brand" className="flex items-center gap-4 cursor-pointer" onClick={() => window.location.reload()}>
          <BrandLogo size={24} />
          <span className="text-xl font-black tracking-tighter text-slate-900 dark:text-white uppercase">HIRELY<span className="text-violet-500">.AI</span></span>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2 text-slate-400 hover:text-violet-500 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10">
            {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl mx-auto w-full p-6 space-y-8 overflow-y-auto">
        
        {/* Settings Toggle */}
        <div id="strategy-config" className="space-y-3">
          <button onClick={() => setShowSettings(!showSettings)} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
            {showSettings ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            Professional Strategy
          </button>
          {showSettings && (
            <section className="bg-white/90 dark:bg-[#0f172a]/60 backdrop-blur-md border border-slate-200 dark:border-white/5 rounded-[30px] p-8 animate-in slide-in-from-top-2 grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Career Stage</label>
                <div className="flex bg-slate-200 dark:bg-black/40 p-1.5 rounded-2xl">
                  {['junior', 'mid', 'senior', 'staff'].map((lvl) => (
                    <button key={lvl} onClick={() => setRefactorSettings(s => ({ ...s, level: lvl as any }))} className={`flex-1 py-2 text-[10px] font-black uppercase rounded-xl transition-all ${refactorSettings.level === lvl ? 'bg-violet-500 text-white shadow-xl' : 'text-slate-500'}`}>
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">JD Match Intensity ({refactorSettings.jdAlignment}%)</label>
                <input type="range" min="1" max="100" value={refactorSettings.jdAlignment} onChange={(e) => setRefactorSettings(s => ({ ...s, jdAlignment: parseInt(e.target.value) }))} className="w-full accent-violet-500" />
              </div>
            </section>
          )}
        </div>

        {/* Upload / Result Logic */}
        {loading ? (
          <div className="h-[400px] flex flex-col items-center justify-center space-y-6 bg-slate-900/10 dark:bg-[#0f172a]/20 border border-slate-200 dark:border-white/5 rounded-[50px] animate-pulse">
            <Terminal className="w-10 h-10 text-violet-500" />
            <p className="text-[11px] font-black uppercase tracking-[0.4em] text-violet-500">{scanStep}</p>
          </div>
        ) : result ? (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <section className="lg:col-span-2 bg-white/80 dark:bg-[#080d1a]/80 border border-slate-200 dark:border-white/10 rounded-[32px] p-10 shadow-xl text-center space-y-8">
                <div className="space-y-2">
                  <div className="flex items-baseline justify-center gap-2">
                    <span className="text-7xl font-black text-slate-900 dark:text-white tracking-tighter">{result.overall_score}</span>
                    <span className="text-2xl font-bold text-slate-400">/ 100</span>
                  </div>
                  <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-violet-500">Resume Readiness</h3>
                </div>
                <p className="text-base font-medium text-slate-700 dark:text-slate-200">"{result.summary}"</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 text-left">
                  <CriteriaBar score={result.criteria.formatting.score} label="Layout" tooltip="ATS readability" />
                  <CriteriaBar score={result.criteria.content.score} label="Story" tooltip="Depth of detail" />
                  <CriteriaBar score={result.criteria.impact.score} label="Impact" tooltip="Quantified results" />
                  <CriteriaBar score={result.criteria.relevance.score} label="Relevance" tooltip="JD alignment" />
                </div>
                <div className="pt-6 flex flex-col items-center gap-4">
                  {readyHtml ? (
                    <button onClick={() => openInNewTab(readyHtml)} className="px-8 py-5 bg-emerald-500 text-white rounded-[24px] text-xs font-black uppercase tracking-widest shadow-2xl flex items-center gap-3"><Eye className="w-5 h-5" /> View Optimized Resume</button>
                  ) : (
                    <div className="relative w-full max-w-xs">
                      <button onClick={() => setShowRefactorOptions(!showRefactorOptions)} disabled={refactoring} className="w-full px-8 py-5 bg-violet-600 text-white rounded-[24px] text-xs font-black uppercase tracking-widest shadow-2xl flex items-center justify-center gap-3">
                        {refactoring ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
                        {refactoring ? 'Optimizing...' : 'Download Resume'}
                      </button>
                      {showRefactorOptions && (
                        <div className="absolute bottom-full left-0 right-0 mb-4 bg-white dark:bg-[#0f172a] border rounded-2xl p-2 shadow-2xl z-[100]">
                          <button onClick={() => handleRefactor('pdf')} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-white/5 rounded-xl text-[10px] font-black uppercase"><Sparkles className="w-4 h-4 text-violet-500" /> Generate PDF</button>
                          <button onClick={() => handleRefactor('docx')} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-white/5 rounded-xl text-[10px] font-black uppercase"><FileDown className="w-4 h-4 text-blue-500" /> Download Word</button>
                        </div>
                      )}
                    </div>
                  )}
                  <button onClick={() => setResult(null)} className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-violet-500"><RefreshCw className="w-3.5 h-3.5 inline mr-1" /> New Audit</button>
                </div>
              </section>

              <section className="bg-slate-900 border border-white/10 rounded-[32px] p-8 space-y-6 text-white">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2"><Bot className="w-4 h-4" /> ATS Engine</h3>
                <div className="space-y-2">
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-black">{result.ats_report.parsing_health_score}%</span>
                    <span className="text-[9px] font-bold text-emerald-500 uppercase">Health</span>
                  </div>
                  {result.ats_report.layout_warnings.map((w, i) => (
                    <div key={i} className="text-[10px] text-slate-400 bg-white/5 p-2 rounded-lg flex items-start gap-2"><AlertTriangle className="w-3 h-3 text-amber-500 shrink-0 mt-0.5" />{w}</div>
                  ))}
                </div>
                <button onClick={() => setShowBotView(!showBotView)} className="w-full py-3 border border-white/10 rounded-xl text-[9px] font-black uppercase hover:bg-white/5">{showBotView ? 'Hide Raw' : 'View Raw'}</button>
              </section>
            </div>

            {showBotView && (
              <section className="bg-black border border-violet-500/20 rounded-2xl p-6 font-mono text-xs text-emerald-500/80 max-h-[400px] overflow-y-auto">
                <pre className="whitespace-pre-wrap">{result.ats_report.view_as_bot_preview}</pre>
              </section>
            )}

            {/* Suggestions */}
            <div className="space-y-6">
              <div className="flex items-center justify-between px-4">
                <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Strategic Polish ({filteredSuggestions.length})</h3>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                  <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Filter..." className="pl-9 pr-4 py-2 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-[10px] outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4">
                {filteredSuggestions.map((suggestion, idx) => (
                  <div key={idx} className="bg-white/80 dark:bg-[#0f172a]/30 border border-slate-200 dark:border-white/5 rounded-[24px] p-6 space-y-6 group/card hover:shadow-xl transition-all">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${suggestion.severity === 'high' ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'}`}>
                          {suggestion.severity === 'high' ? <AlertTriangle /> : <Lightbulb />}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white">{suggestion.location}</h4>
                          <p className="text-[9px] font-black uppercase text-slate-400">{suggestion.type}</p>
                        </div>
                      </div>
                      <span className={`text-[9px] font-black uppercase px-2 py-1 rounded-lg border ${suggestion.severity === 'high' ? 'text-rose-500 border-rose-500/20' : 'text-amber-500 border-amber-500/20'}`}>{suggestion.severity}</span>
                    </div>
                    <div className="bg-slate-50 dark:bg-black/20 p-4 rounded-xl border-l-2 border-violet-500"><p className="text-xs text-slate-600 dark:text-slate-400 italic">"{suggestion.thinking}"</p></div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <div className="p-4 bg-slate-50 dark:bg-black/40 rounded-xl"><HighlightedText text={suggestion.original_text} /></div>
                      <div className="p-4 bg-violet-500/5 rounded-xl border border-violet-500/10">
                        <div className="flex justify-between items-center mb-2"><span className="text-[9px] font-black text-violet-500 uppercase">Proposal</span><button onClick={() => navigator.clipboard.writeText(suggestion.fix)} className="text-[9px] font-bold text-violet-500 flex items-center gap-1"><Copy className="w-3 h-3"/> COPY</button></div>
                        <p className="text-xs font-bold font-mono">{suggestion.fix}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Landing / Upload State */
          <div className="flex flex-col items-center justify-center space-y-8">
            <div id="upload-section" className="w-full max-w-4xl h-[480px] border-2 border-dashed border-slate-200 dark:border-white/5 rounded-[60px] flex flex-col items-center justify-center p-12 space-y-8 bg-white/50 dark:bg-[#0f172a]/10 group transition-all">
              <div className="w-24 h-24 bg-white dark:bg-[#0f172a] rounded-[30px] border flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                <BrandLogo size={40} />
              </div>
              <div className="text-center space-y-4">
                <h2 className="text-2xl font-black uppercase tracking-widest">Hirely AI Assistant</h2>
                <p className="text-sm text-slate-500 max-w-md mx-auto">Upload your resume and target JD for a high-fidelity strategic audit.</p>
                <button onClick={() => fileInputRef.current?.click()} className="px-8 py-4 bg-violet-500 text-white rounded-[22px] font-black uppercase text-xs tracking-widest shadow-2xl hover:scale-105 active:scale-95 transition-all">Select File</button>
                <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept=".pdf,.docx" />
                {selectedFile && <div className="text-violet-500 text-[11px] font-bold uppercase tracking-widest mt-4 flex items-center justify-center gap-2"><CheckCircle2 className="w-4 h-4"/> {selectedFile.name}</div>}
              </div>
            </div>

            <div id="jd-section" className="w-full max-w-2xl bg-white dark:bg-[#0f172a]/40 border rounded-[40px] p-6 space-y-4 shadow-xl border-b-4 border-b-violet-500/30">
              <div className="flex items-center gap-3"><Target className="w-4 h-4 text-violet-500"/><h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Target Role Description</h3></div>
              <textarea value={jdText} onChange={(e) => setJdText(e.target.value)} placeholder="Paste JD here..." className="w-full bg-slate-50 dark:bg-black/20 border-none rounded-3xl p-6 text-sm h-40 outline-none" />
              <div className="flex justify-center"><button onClick={handleAudit} disabled={!selectedFile || loading} className="px-10 py-4 bg-violet-500 disabled:bg-slate-300 text-white rounded-[24px] font-black uppercase text-[11px] tracking-widest shadow-xl flex items-center gap-3"><Zap className="w-4 h-4 fill-white"/> Analyze Profile</button></div>
            </div>
          </div>
        )}
      </main>

      {/* Chat FAB */}
      <button onClick={() => setChatOpen(!chatOpen)} className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-violet-500 text-white shadow-2xl z-[110] flex items-center justify-center hover:scale-110 transition-all">
        {chatOpen ? <X /> : <MessageSquare />}
      </button>

      {/* Chat Drawer */}
      <div className={`fixed bottom-24 right-6 w-[420px] max-w-[calc(100%-3rem)] h-[600px] max-h-[calc(100vh-160px)] bg-white dark:bg-[#020617] border rounded-[32px] shadow-2xl transition-all z-[100] flex flex-col overflow-hidden ${chatOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}>
        <div className="p-6 border-b flex items-center justify-between bg-slate-50 dark:bg-[#080d1a]/50">
          <div className="flex items-center gap-3">
            <BrandLogo size={20} />
            <div>
              <h3 className="font-black text-xs uppercase">Hirely Advisor</h3>
              <p className="text-[9px] text-emerald-500 uppercase flex items-center gap-1"><span className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse" /> Online</p>
            </div>
          </div>
          <button onClick={() => setChatOpen(false)}><X className="w-5 h-5 text-slate-500" /></button>
        </div>
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] p-4 rounded-[24px] text-xs ${m.role === 'user' ? 'bg-violet-600 text-white rounded-tr-none' : 'bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-300 rounded-tl-none border'}`}>
                {m.role === 'model' ? <FormattedText text={m.text} /> : m.text}
              </div>
            </div>
          ))}
          {chatLoading && <Loader2 className="w-4 h-4 animate-spin text-violet-500" />}
        </div>
        <div className="p-6 border-t space-y-4">
          <div className="flex flex-wrap gap-2">
            {CHAT_SUGGESTIONS.map((s, i) => (
              <button key={i} onClick={() => handleSendMessage(s.text)} className="px-3 py-2 bg-slate-100 dark:bg-white/5 border rounded-xl text-[9px] font-black uppercase text-slate-500 hover:text-violet-500 transition-all">{s.text}</button>
            ))}
          </div>
          <div className="relative">
            <input value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()} placeholder="Ask advice..." className="w-full border rounded-2xl py-4 pl-6 pr-14 text-xs outline-none dark:bg-[#020617]" />
            <button onClick={() => handleSendMessage()} disabled={!inputValue.trim() || chatLoading} className="absolute right-2 top-2 p-2.5 bg-violet-500 text-white rounded-xl"><Send className="w-4 h-4"/></button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
