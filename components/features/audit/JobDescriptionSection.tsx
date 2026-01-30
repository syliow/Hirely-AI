import React from 'react';
import { Target, Zap } from 'lucide-react';

interface JobDescriptionSectionProps {
  jdText: string;
  setJdText: (text: string) => void;
  onAudit: () => void;
  loading: boolean;
  hasFile: boolean;
}

export const JobDescriptionSection: React.FC<JobDescriptionSectionProps> = ({ jdText, setJdText, onAudit, loading, hasFile }) => {
  const [loadingMsg, setLoadingMsg] = React.useState("Initializing Audit...");

  React.useEffect(() => {
    if (!loading) return;
    const messages = [
      "Extracting Raw Text Layer...",
      "Analyzing Formatting Structure...",
      "Detecting Keywords & Skills...",
      "Identifying ATS Killers...",
      "Calculating Health Score...",
      "Generating Compatibility Report..."
    ];
    let i = 0;
    setLoadingMsg(messages[0]);
    const interval = setInterval(() => {
      i = (i + 1) % messages.length;
      setLoadingMsg(messages[i]);
    }, 1500);
    return () => clearInterval(interval);
  }, [loading]);

  return (
    <div id="jd-section" className="w-full max-w-4xl animate-in slide-in-from-top-8 duration-500 delay-300">
      <div className="bg-white/90 dark:bg-[#0f172a]/50 backdrop-blur-2xl border border-slate-200 dark:border-white/10 rounded-[64px] p-12 space-y-8 shadow-2xl hover:shadow-3xl transition-all border-b-8 border-b-violet-500/30">
        <div className="flex items-center justify-between px-4">
           <div className="flex items-center gap-6"><div className="w-12 h-12 rounded-2xl bg-violet-500/10 flex items-center justify-center"><Target className="w-7 h-7 text-violet-500" /></div><h3 className="text-sm font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Target Role Requirements</h3></div>
           {jdText && <span className="text-xs font-bold text-violet-500 bg-violet-500/10 px-4 py-2 rounded-full uppercase tracking-widest animate-pulse">Context Loaded</span>}
        </div>
        <textarea value={jdText} onChange={(e) => setJdText(e.target.value)} placeholder="Paste the Job Description to tailor your profile strategy..." className="w-full bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-white/5 rounded-[40px] p-10 text-lg resize-none h-56 custom-scrollbar font-medium outline-none focus:ring-4 focus:ring-violet-500/10 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-700" />
        <div className="flex justify-center pt-6">
          <button onClick={onAudit} disabled={!hasFile || loading} className="group relative flex items-center gap-6 px-16 py-7 bg-violet-500 disabled:bg-slate-300 dark:disabled:bg-slate-800 text-white rounded-[32px] font-black uppercase text-sm tracking-[0.25em] shadow-2xl shadow-violet-500/30 active:scale-95 transition-all min-w-[300px] justify-center">
            <Zap className={`w-6 h-6 fill-white ${loading ? 'animate-pulse' : ''}`} /> {loading ? loadingMsg : 'Analyze Professional Profile'}
          </button>
        </div>
      </div>
    </div>
  );
};
