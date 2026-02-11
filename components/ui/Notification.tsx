import React from 'react';
import { AlertCircle, CheckCircle2, X } from 'lucide-react';

interface NotificationProps {
  type: 'error' | 'success';
  message: string;
  onClose: () => void;
}

export const Notification: React.FC<NotificationProps> = ({ type, message, onClose }) => {
  return (
    <div
      className="fixed top-28 left-1/2 -translate-x-1/2 z-[150] w-full max-w-xl p-6 animate-in slide-in-from-top-6 duration-300"
      role={type === 'error' ? 'alert' : 'status'}
      aria-live={type === 'error' ? 'assertive' : 'polite'}
    >
       <div className={`${type === 'error' ? 'bg-rose-500 shadow-rose-500/20' : 'bg-emerald-600 shadow-emerald-600/20'} text-white rounded-[28px] p-8 shadow-2xl flex items-center justify-between gap-8 border border-white/20`}>
          <div className="flex items-center gap-5">
            {type === 'error' ? <AlertCircle className="w-8 h-8 shrink-0" aria-hidden="true" /> : <CheckCircle2 className="w-8 h-8 shrink-0" aria-hidden="true" />}
            <p className="text-base font-bold leading-relaxed">{message}</p>
          </div>
          <button
            onClick={onClose}
            className="p-3 hover:bg-white/10 rounded-2xl transition-colors"
            aria-label="Close notification"
          >
            <X className="w-6 h-6" aria-hidden="true" />
          </button>
       </div>
    </div>
  );
};
