import React from 'react';
import { Clock, Ban, ShieldAlert, X, Loader2 } from 'lucide-react';

export type LimitModalType = 'rate_limit' | 'daily_limit' | 'quota_exceeded' | null;

interface LimitModalProps {
  type: LimitModalType;
  retryAfter: number;
  onClose: () => void;
}

export const LimitModal: React.FC<LimitModalProps> = ({ type, retryAfter, onClose }) => {
  if (!type) return null;

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-8 bg-slate-900/80 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="bg-white dark:bg-[#0f172a] border border-rose-500/30 rounded-[56px] p-14 max-w-xl w-full shadow-2xl space-y-10 animate-in zoom-in-95 duration-300">
        <div className="flex flex-col items-center text-center space-y-8">
          {/* Icon based on limit type */}
          <div className={`w-28 h-28 rounded-[36px] flex items-center justify-center shadow-inner ${
            type === 'rate_limit' 
              ? 'bg-amber-500/10 border-2 border-amber-500/30' 
              : type === 'daily_limit' 
              ? 'bg-orange-500/10 border-2 border-orange-500/30'
              : 'bg-rose-500/10 border-2 border-rose-500/30'
          }`}>
            {type === 'rate_limit' && <Clock className="w-14 h-14 text-amber-500" />}
            {type === 'daily_limit' && <Ban className="w-14 h-14 text-orange-500" />}
            {type === 'quota_exceeded' && <ShieldAlert className="w-14 h-14 text-rose-500" />}
          </div>
          
          {/* Title */}
          <div className="space-y-4">
            <h4 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">
              {type === 'rate_limit' && 'Slow Down!'}
              {type === 'daily_limit' && 'Daily Limit Reached'}
              {type === 'quota_exceeded' && 'Service Unavailable'}
            </h4>
            
            {/* Description based on type */}
            <p className="text-lg text-slate-500 dark:text-slate-400 font-medium leading-relaxed max-w-md mx-auto">
              {type === 'rate_limit' && 
                "You're making requests too quickly. Please wait a moment before trying again."
              }
              {type === 'daily_limit' && 
                "You've reached your daily usage limit. This helps us keep the service free for everyone. Please try again tomorrow!"
              }
              {type === 'quota_exceeded' && 
                "Our AI service has reached its capacity for today. We're working on expanding our limits. Please try again later."
              }
            </p>
          </div>

          {/* Countdown timer for rate limit */}
          {type === 'rate_limit' && retryAfter > 0 && (
            <div className="flex items-center gap-4 px-8 py-5 bg-amber-500/10 border border-amber-500/20 rounded-3xl">
              <Clock className="w-7 h-7 text-amber-500 animate-pulse" />
              <div className="text-left">
                <p className="text-xs font-black uppercase tracking-widest text-amber-600 dark:text-amber-400">Try again in</p>
                <p className="text-4xl font-black text-amber-500 tabular-nums">{retryAfter}s</p>
              </div>
            </div>
          )}

          {/* Tips */}
          <div className="w-full bg-slate-50 dark:bg-black/30 rounded-3xl p-6 text-left space-y-3 border border-slate-200 dark:border-white/5">
            <p className="text-xs font-black uppercase tracking-widest text-slate-400">💡 Tips</p>
            <ul className="text-sm text-slate-500 dark:text-slate-400 space-y-2">
              {type === 'rate_limit' && (
                <>
                  <li>• Wait for the timer to finish before retrying</li>
                  <li>• Each action (audit, refactor, chat) counts as one request</li>
                </>
              )}
              {type === 'daily_limit' && (
                <>
                  <li>• Limits reset at midnight UTC</li>
                  <li>• You get 50 requests per day</li>
                  <li>• Make each analysis count!</li>
                </>
              )}
              {type === 'quota_exceeded' && (
                <>
                  <li>• This is a temporary issue on our end</li>
                  <li>• Usually resolves within a few hours</li>
                  <li>• Check back later today</li>
                </>
              )}
            </ul>
          </div>
        </div>

        {/* Close button */}
        <div className="flex justify-center">
          <button 
            onClick={onClose} 
            className={`flex items-center gap-4 px-12 py-5 rounded-[28px] text-sm font-black uppercase tracking-[0.2em] shadow-xl transition-all active:scale-95 ${
              type === 'rate_limit' && retryAfter > 0
                ? 'bg-slate-200 dark:bg-white/10 text-slate-500 cursor-not-allowed'
                : 'bg-violet-500 text-white hover:bg-violet-400 shadow-violet-500/30'
            }`}
            disabled={type === 'rate_limit' && retryAfter > 0}
          >
            {type === 'rate_limit' && retryAfter > 0 ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" /> Please Wait
              </>
            ) : (
              <>
                <X className="w-5 h-5" /> Close
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
