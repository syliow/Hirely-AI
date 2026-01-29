import React from 'react';
import { Sparkles, Sliders, Upload, Target, MessageSquare, ChevronLeft, ChevronRight } from 'lucide-react';

export const TOUR_STEPS = [
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

interface TourOverlayProps {
  active: boolean;
  step: number;
  onClose: () => void;
  onStepChange: (step: number) => void;
}

export const TourOverlay: React.FC<TourOverlayProps> = ({ active, step, onClose, onStepChange }) => {
  if (!active) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-8 bg-slate-900/70 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white dark:bg-[#0f172a] border border-violet-500/20 rounded-[56px] p-14 max-w-2xl w-full shadow-2xl space-y-12 animate-in zoom-in-95 duration-300">
        <div className="flex flex-col items-center text-center space-y-8">
          <div className="w-24 h-24 rounded-[32px] bg-violet-500/10 flex items-center justify-center shadow-inner">
            {TOUR_STEPS[step].icon}
          </div>
          <div className="space-y-4">
            <h4 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">{TOUR_STEPS[step].title}</h4>
            <p className="text-lg text-slate-500 dark:text-slate-400 font-medium leading-relaxed">{TOUR_STEPS[step].description}</p>
          </div>
        </div>

        <div className="flex items-center justify-between pt-8">
          <div className="flex gap-3">
            {TOUR_STEPS.map((_, i) => (
              <div key={i} className={`h-2.5 rounded-full transition-all duration-300 ${i === step ? 'w-12 bg-violet-500' : 'w-3 bg-slate-200 dark:bg-white/10'}`} />
            ))}
          </div>
          <div className="flex items-center gap-6">
            <button onClick={onClose} className="px-8 py-4 text-sm font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">Skip</button>
            <div className="flex gap-4">
              {step > 0 && (
                <button onClick={() => onStepChange(step - 1)} className="p-5 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 rounded-3xl hover:bg-slate-200 dark:hover:bg-white/10 transition-all"><ChevronLeft className="w-6 h-6" /></button>
              )}
              <button onClick={() => step === TOUR_STEPS.length - 1 ? onClose() : onStepChange(step + 1)} className="flex items-center gap-4 px-10 py-5 bg-violet-500 text-white rounded-[28px] text-sm font-black uppercase tracking-widest hover:bg-violet-400 transition-all shadow-xl shadow-violet-500/20">
                {step === TOUR_STEPS.length - 1 ? 'Start Career Hunt' : 'Next'}
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
