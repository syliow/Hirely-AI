"use client";

import React, { useState, useEffect, useRef } from 'react';

// API & Types
import { AuditResult, Message, FileData, RefactorOptions } from '@/lib/types';
import { ApiError } from '@/lib/apiErrors';

// Helpers
import { openInNewTab, downloadFile } from '@/helpers/browser';
import { extractCandidateName, generateResumeTemplate } from '@/helpers/resume';
import { cleanAIHtml } from '@/helpers/string';

// Components
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/Footer';
import { Notification } from '@/components/ui/Notification';

import { StrategySettings } from '@/components/features/settings/StrategySettings';
import { TourOverlay } from '@/components/features/tour/TourOverlay';
import { UploadSection } from '@/components/features/upload/UploadSection';
import { JobDescriptionSection } from '@/components/features/audit/JobDescriptionSection';
import { LoadingScreen } from '@/components/features/audit/LoadingScreen';
import { AuditResults } from '@/components/features/results/AuditResults';
import { ChatInterface } from '@/components/features/chat/ChatInterface';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export default function Home() {
  // --- Global UI State ---
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [notification, setNotification] = useState<{ type: 'error' | 'success', message: string } | null>(null);
  
  // --- Data State ---
  const [selectedFile, setSelectedFile] = useState<FileData | null>(null);
  const [jdText, setJdText] = useState('');
  const [result, setResult] = useState<AuditResult | null>(null);
  const [readyHtml, setReadyHtml] = useState<string | null>(null);

  // --- Process State ---
  const [loading, setLoading] = useState(false);
  const [refactoring, setRefactoring] = useState(false);
  const [scanStep, setScanStep] = useState('');

  // --- Feature State: Chat ---
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: "Hi! I'm Hirely AI, your personal AI Resume Helper. I'm ready to help you craft the best resume possible! Shall we take a look at your profile?", timestamp: Date.now() }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  // --- Feature State: Settings ---
  const [showSettings, setShowSettings] = useState(false);
  const [refactorSettings, setRefactorSettings] = useState<RefactorOptions>({
    level: 'junior',
    jdAlignment: 100
  });

  // --- Feature State: Tour ---
  const [tourActive, setTourActive] = useState(false);
  const [tourStep, setTourStep] = useState(0);


  // --- Effects ---
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // --- API Helper ---
  const callApi = async (action: string, payload: any) => {
    let body;
    let headers: Record<string, string> = {};

    if (payload?.file?.file instanceof File) {
      const formData = new FormData();
      formData.append('action', action);

      const { file, ...restPayload } = payload;
      formData.append('file', file.file);
      formData.append('payload', JSON.stringify(restPayload));

      body = formData;
    } else {
      headers['Content-Type'] = 'application/json';
      body = JSON.stringify({ action, payload });
    }

    const res = await fetch('/api/generate', {
      method: 'POST',
      headers,
      body,
    });
    
    if (!res.ok) {
      const errorData: ApiError = await res.json();
      
      console.error('[API Error]', errorData);
      throw new Error(errorData.error || "Failed to communicate with AI");
    }
    return res.json();
  };

  // --- Handlers ---

  
  const handleFileSelect = (file: File) => {
    if (file.size > MAX_FILE_SIZE) {
      setNotification({ type: 'error', message: "File too large! Please upload a resume under 10MB." });
      return;
    }

    setSelectedFile({
      name: file.name,
      size: file.size,
      mimeType: file.type || (file.name.endsWith('.pdf') ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'),
      file: file
    });
    setNotification(null);
  };

  const handleAudit = async () => {
    if (!selectedFile) return;


    setLoading(true);
    setResult(null);
    
    const steps = [
      "Reading your resume...", 
      "Analyzing ATS compatibility...", 
      "Identifying key skill gaps...", 
      "Comparing against top candidates...", 
      "Crafting personalized improvements...",
      "Finalizing your audit report..."
    ];
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
      console.error("Audit Error:", err);
      setNotification({ 
        type: 'error', 
        message: err.message || "Audit failed. Check your internet connection or try a different file." 
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
    setReadyHtml(null);
    setNotification(null);
  };


  const handleOpenPreview = (html: string) => {
    if (openInNewTab(html)) {
      setReadyHtml(null);
    }
  };

  const handleRefactor = async (type: 'pdf' | 'docx') => {
    if (!selectedFile || !result) return;
    
    setRefactoring(true);
    setScanStep("Refining Content Strategy...");
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
    } catch (err: any) {
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

  return (
    <div className="min-h-screen flex flex-col bg-transparent text-slate-800 dark:text-slate-200 font-sans selection:bg-violet-500/30 transition-colors duration-300">
      
      {notification && (
        <Notification type={notification.type} message={notification.message} onClose={() => setNotification(null)} />
      )}

      <TourOverlay active={tourActive} step={tourStep} onClose={() => setTourActive(false)} onStepChange={setTourStep} />

      <Header 
        onReset={handleReset} 
        onStartTour={startTour} 
        onToggleTheme={() => setIsDarkMode(!isDarkMode)} 
        isDarkMode={isDarkMode} 
      />

      <main className="flex-1 max-w-6xl mx-auto w-full p-4 md:p-10 lg:p-14 space-y-8 md:space-y-16 overflow-y-auto custom-scrollbar">
        
        <StrategySettings 
          showSettings={showSettings} 
          setShowSettings={setShowSettings} 
          settings={refactorSettings} 
          setSettings={setRefactorSettings} 
        />

        {loading || refactoring ? (
          <LoadingScreen scanStep={scanStep} />
        ) : result ? (
          <AuditResults 
            result={result} 
            readyHtml={readyHtml} 
            fileName={selectedFile?.name}
            onReset={handleReset} 
            onRefactor={handleRefactor} 
            onPreview={handleOpenPreview} 
          />
        ) : (
          <div className="flex flex-col items-center justify-center space-y-16 animate-in fade-in duration-700">
            <UploadSection 
              onFileSelect={handleFileSelect}
              selectedFile={selectedFile} 
            />
            
            <JobDescriptionSection 
              jdText={jdText} 
              setJdText={setJdText} 
              onAudit={handleAudit} 
              loading={loading} 
              hasFile={!!selectedFile} 
            />
          </div>
        )}
      </main>

      <ChatInterface 
        open={chatOpen} 
        setOpen={setChatOpen} 
        messages={messages} 
        inputValue={inputValue} 
        setInputValue={setInputValue} 
        loading={chatLoading} 
        onSendMessage={handleSendMessage} 
      />

      <Footer />
    </div>
  );
}
