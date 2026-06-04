import React, { memo } from 'react';
import { Message } from '@/lib/types';
import { FormattedText } from '@/components/FormattedText';

interface ChatMessageProps {
  message: Message;
}

// Memoized to prevent re-renders of the entire list when parent state (like input value) changes
export const ChatMessage = memo(({ message }: ChatMessageProps) => {
  return (
    <div className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[88%] p-6 rounded-[32px] text-base leading-relaxed shadow-sm ${message.role === 'user' ? 'bg-violet-600 text-white rounded-tr-none' : 'bg-slate-100 dark:bg-slate-900/80 text-slate-800 dark:text-slate-300 rounded-tl-none border border-slate-200 dark:border-white/5'}`}>
        {message.role === 'model' ? <FormattedText text={message.text} /> : message.text}
      </div>
    </div>
  );
});

ChatMessage.displayName = 'ChatMessage';
