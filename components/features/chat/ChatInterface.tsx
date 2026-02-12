import React, { useRef, useEffect } from 'react';
import { BrandLogo } from '@/components/BrandLogo';
import { Message } from '@/lib/types';
import { MessageSquare, X, Loader2, Send, Target, PenTool, Sparkles } from 'lucide-react';
import { ChatMessage } from './ChatMessage';

const CHAT_SUGGESTIONS = [
  { text: "How to tailor my resume?", icon: <Target className="w-4 h-4" /> },
  { text: "How to write a bullet point?", icon: <PenTool className="w-4 h-4" /> },
  { text: "What makes a resume stand out?", icon: <Sparkles className="w-4 h-4" /> }
];

const LOADING_MESSAGES = [
  "Reviewing your request...",
  "Drafting the perfect response...",
  "Consulting the career strategy playbook...",
  "Analyzing key details...",
  "Polishing my advice...",
  "Thinking..."
];

const TypingMessage = () => {
  const [msg, setMsg] = React.useState(LOADING_MESSAGES[0]);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setMsg(LOADING_MESSAGES[Math.floor(Math.random() * LOADING_MESSAGES.length)]);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return <span className="text-sm text-slate-500 dark:text-slate-400 font-medium animate-pulse">{msg}</span>;
};

interface ChatInterfaceProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  messages: Message[];
  inputValue: string;
  setInputValue: (val: string) => void;
  loading: boolean;
  onSendMessage: (msg?: string) => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ open, setOpen, messages, inputValue, setInputValue, loading, onSendMessage }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading, open]);

  return (
    <>
      <button id="hirely-fab" onClick={() => setOpen(!open)} className={`fixed bottom-4 right-4 md:bottom-10 md:right-10 w-16 h-16 md:w-20 md:h-20 rounded-full bg-violet-500 text-white shadow-3xl shadow-violet-500/40 hover:scale-110 active:scale-95 transition-all z-[110] flex items-center justify-center group ${open ? 'rotate-90 bg-slate-800 dark:bg-white text-white dark:text-slate-900' : ''}`}>
        {open ? <X className="w-6 h-6 md:w-8 md:h-8" /> : <MessageSquare className="w-6 h-6 md:w-8 md:h-8" />}
        {!open && <div className="absolute -top-1 -right-1 w-5 h-5 md:w-6 md:h-6 bg-rose-500 border-4 border-white dark:border-[#020617] rounded-full animate-bounce" />}
      </button>

      <div className={`fixed bottom-24 right-4 w-[calc(100vw-2rem)] md:bottom-36 md:right-10 md:w-[480px] h-[60vh] md:h-[720px] max-h-[calc(100vh-140px)] md:max-h-[calc(100vh-200px)] bg-white dark:bg-[#020617] border border-slate-200 dark:border-white/10 shadow-3xl transition-all duration-300 z-[100] flex flex-col rounded-[32px] md:rounded-[56px] overflow-hidden ${open ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-20 opacity-0 scale-95 pointer-events-none'}`}>
        <div className="p-6 md:p-10 border-b border-slate-200 dark:border-white/10 flex items-center justify-between bg-slate-50/50 dark:bg-[#080d1a]/50">
          <div className="flex items-center gap-3 md:gap-5">
            <BrandLogo size={28} className="w-10 h-10 md:w-14 md:h-14" />
            <div>
              <h3 className="font-black text-xs md:text-base text-slate-900 dark:text-white uppercase tracking-widest leading-none mb-2">Hirely AI Advisor</h3>
              <p className="text-xs text-emerald-500 font-bold uppercase tracking-widest flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> I'm always here to help!
              </p>
            </div>
          </div>
          <button onClick={() => setOpen(false)} className="p-4 hover:bg-slate-100 dark:hover:bg-white/10 rounded-2xl transition-all"><X className="w-8 h-8 text-slate-500" /></button>
        </div>
        
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-10 space-y-10 custom-scrollbar bg-white dark:bg-[#020617]">
          {messages.map((msg, idx) => (
            <ChatMessage key={idx} message={msg} />
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-slate-100 dark:bg-slate-900/80 p-6 rounded-[32px] rounded-tl-none border border-slate-200 dark:border-white/5 flex items-center gap-3">
                <Loader2 className="w-5 h-5 animate-spin text-violet-500" />
                <TypingMessage />
              </div>
            </div>
          )}
        </div>

        <div className="p-10 border-t border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-[#080d1a]/50 flex flex-col gap-8">
          {!loading && messages.length <= 1 && (
            <div className="flex flex-wrap gap-3">
              {CHAT_SUGGESTIONS.map((suggestion, i) => (
                <button key={i} onClick={() => onSendMessage(suggestion.text)} className="flex items-center gap-3 px-5 py-3 bg-white dark:bg-white/10 border border-slate-200 dark:border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 hover:text-violet-500 hover:border-violet-500/30 transition-all shadow-sm">
                  {suggestion.icon} {suggestion.text}
                </button>
              ))}
            </div>
          )}
          <div className="relative">
            <input value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && onSendMessage()} placeholder="Ask for career prep advice..." className="w-full bg-white dark:bg-[#020617] border border-slate-200 dark:border-white/10 rounded-[28px] py-6 pl-10 pr-20 text-base focus:ring-2 focus:ring-violet-500 outline-none shadow-inner transition-all" />
            <button onClick={() => onSendMessage()} disabled={!inputValue.trim() || loading} className="absolute right-3 top-3 p-4 bg-violet-500 text-white rounded-[20px] shadow-lg active:scale-95 transition-all disabled:opacity-50"><Send className="w-6 h-6" /></button>
          </div>
        </div>
      </div>
    </>
  );
};
