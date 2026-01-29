import React from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { RefactorOptions } from '@/lib/types';
import { InfoTooltip as InfoTooltipComponent } from '@/components/InfoTooltip';

interface StrategySettingsProps {
  showSettings: boolean;
  setShowSettings: (show: boolean) => void;
  settings: RefactorOptions;
  setSettings: React.Dispatch<React.SetStateAction<RefactorOptions>>;
}

export const StrategySettings: React.FC<StrategySettingsProps> = ({ showSettings, setShowSettings, settings, setSettings }) => {
  return (
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
              <label className="text-sm font-black uppercase tracking-widest text-slate-500 flex items-center">Career Stage <InfoTooltipComponent text="Tailors phrasing to your specific seniority level." /></label>
              <span className="text-sm font-black text-violet-500 uppercase">{settings.level}</span>
            </div>
            <div className="flex bg-slate-200 dark:bg-black/50 p-2.5 rounded-3xl border border-slate-300 dark:border-white/10">
              {['junior', 'mid', 'senior', 'staff'].map((lvl) => (
                <button key={lvl} onClick={() => setSettings(s => ({ ...s, level: lvl as any }))} className={`flex-1 py-4 text-xs font-black uppercase tracking-tighter rounded-2xl transition-all ${settings.level === lvl ? 'bg-violet-500 text-white shadow-2xl shadow-violet-500/30' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'}`}>
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <label className="text-sm font-black uppercase tracking-widest text-slate-500 flex items-center">JD Match Intensity <InfoTooltipComponent text="Higher values force stricter alignment with target job keywords." /></label>
              <span className="text-sm font-black text-violet-500 uppercase">{settings.jdAlignment}%</span>
            </div>
            <div className="px-3 pt-6">
              <input type="range" min="1" max="100" value={settings.jdAlignment} onChange={(e) => setSettings(s => ({ ...s, jdAlignment: parseInt(e.target.value) }))} className="w-full h-3 bg-slate-300 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-violet-500" />
            </div>
          </div>
        </section>
      )}
    </div>
  );
};
