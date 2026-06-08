import React from 'react';

// === THEME PRESETS ===
export const THEMES = {
  iMessage: {
    receiverBg: 'bg-zinc-200 border-zinc-200 text-black rounded-tl-none',
    senderBg: 'bg-blue-600 border-blue-600 text-white rounded-tr-none',
    typingBg: 'bg-zinc-200',
    dotColor: 'bg-zinc-500'
  },
  WhatsApp: {
    receiverBg: 'bg-white border-emerald-100 text-black rounded-tl-none shadow-sm',
    senderBg: 'bg-emerald-500 border-emerald-500 text-white rounded-tr-none shadow-sm',
    typingBg: 'bg-white',
    dotColor: 'bg-emerald-600'
  },
  Messenger: {
    receiverBg: 'bg-zinc-100 border-zinc-200 text-black rounded-tl-none',
    senderBg: 'bg-sky-500 border-sky-500 text-white rounded-tr-none',
    typingBg: 'bg-zinc-100',
    dotColor: 'bg-zinc-400'
  },
  Espana: {
    receiverBg: 'bg-white border-espana-red/10 text-espana-charcoal rounded-tl-none shadow-sm',
    senderBg: 'bg-accent-indigo border-indigo-600/10 text-white rounded-tr-none shadow-sm',
    typingBg: 'bg-white border border-espana-red/10 shadow-sm',
    dotColor: 'bg-espana-red'
  }
};

/**
 * Parses bold text containing **asterisks** into React strong elements
 * @param {string} text - Input text
 * @returns {React.ReactNode}
 */
export const parseBoldText = (text) => {
  if (!text) return '';
  const parts = text.split(/\*\*(.*?)\*\*/g);
  return parts.map((part, i) => i % 2 === 1 ? <strong key={i} className="font-extrabold">{part}</strong> : part);
};

/**
 * Animated Typing Indicator Bubble
 */
export const TypingBubble = ({ theme = 'Espana' }) => {
  const activeTheme = THEMES[theme] || THEMES.Espana;
  return (
    <div className={`p-4 rounded-2xl ${activeTheme.typingBg} w-max max-w-[80%] flex items-center gap-1.5 shadow-sm animate-bubble-pop border border-espana-red/5`}>
      <span className="text-[10px] font-black text-brand-400 uppercase tracking-wider select-none">Typing</span>
      <span className="flex gap-1 items-center px-1">
        <span className={`w-1.5 h-1.5 ${activeTheme.dotColor} rounded-full animate-dot-pulse`} style={{ animationDelay: '0ms' }}></span>
        <span className={`w-1.5 h-1.5 ${activeTheme.dotColor} rounded-full animate-dot-pulse`} style={{ animationDelay: '150ms' }}></span>
        <span className={`w-1.5 h-1.5 ${activeTheme.dotColor} rounded-full animate-dot-pulse`} style={{ animationDelay: '300ms' }}></span>
      </span>
    </div>
  );
};

/**
 * Standard Chat Bubble styling wrapper
 */
export const ChatBubble = ({ children, sender, theme = 'Espana', borderRadius = 16, className = '' }) => {
  const activeTheme = THEMES[theme] || THEMES.Espana;
  return (
    <div 
      className={`p-4 rounded-2xl flex flex-col gap-1.5 shadow-sm border max-w-[85%] sm:max-w-[80%] animate-bubble-pop ${
        sender ? 'self-end ' + activeTheme.senderBg : 'self-start ' + activeTheme.receiverBg
      } ${className}`}
      style={{ borderRadius: `${borderRadius}px` }}
    >
      {children}
    </div>
  );
};

const ChatSequence = {
  THEMES,
  parseBoldText,
  TypingBubble,
  ChatBubble
};

export default ChatSequence;
