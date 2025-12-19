
import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, UserProfile } from '../types';
import { sendMessageToAssistant } from '../services/geminiService';
import { ArrowUp } from 'lucide-react';
import BrandLogo from './BrandLogo';

interface SpiritualChatProps {
  user?: UserProfile;
}

const SpiritualChat: React.FC<SpiritualChatProps> = ({ user }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text: `A paz de Cristo esteja convosco, ${user?.name || 'irmão(ã)'}. Como está seu coração hoje?`,
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const responseText = await sendMessageToAssistant(input, user);
      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-white dark:bg-brand-dark relative animate-fade-in transition-colors">
      <div className="absolute inset-0 bg-gradient-to-b from-white via-white to-slate-50 dark:from-brand-dark dark:via-brand-dark dark:to-black/20 pointer-events-none" />

      <div 
        className="flex-1 overflow-y-auto pt-12 pb-32 px-6 space-y-8 smooth-scroll relative z-10"
        role="log" 
        aria-live="polite" 
        aria-relevant="additions"
      >
        {messages.map((msg, idx) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex w-full animate-slide-up-content ${isUser ? 'justify-end' : 'justify-start'}`}
              style={{ animationDelay: `${idx * 50}ms` }}
            >
              <div className={`max-w-[90%] ${isUser ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                <span className={`text-[10px] tracking-widest uppercase font-bold text-stone-300 dark:text-slate-600 ${isUser ? 'text-right' : 'text-left'}`}>
                   {isUser ? 'Você' : 'Assistente'}
                </span>
                <div
                  className={`text-base leading-relaxed ${
                    isUser
                      ? 'text-brand-dark dark:text-white font-sans font-light'
                      : 'text-slate-700 dark:text-slate-300 font-serif italic'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            </div>
          );
        })}
        
        {isLoading && (
           <div className="flex justify-start w-full animate-pulse pl-1">
              <div className="flex gap-2 items-center">
                  <BrandLogo size={14} variant="fill" className="text-brand-violet animate-spin-slow" />
                  <span className="text-xs text-stone-400 dark:text-slate-500 font-serif italic">Refletindo com carinho...</span>
              </div>
           </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="absolute bottom-24 left-0 right-0 px-6 z-30">
        <div className="bg-white/80 dark:bg-brand-dark/80 backdrop-blur-xl rounded-3xl p-1.5 shadow-float border border-white/40 dark:border-white/10 flex items-center gap-2 transition-all focus-within:shadow-glow focus-within:border-brand-violet/30">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Conte-me o que está no seu coração..."
            aria-label="Mensagem para o assistente"
            className="flex-1 bg-transparent pl-4 py-3 outline-none text-base text-brand-dark dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 font-sans font-light"
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            aria-label="Enviar mensagem"
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 ${
              input.trim() && !isLoading
                ? 'bg-brand-violet text-white scale-100'
                : 'bg-slate-100 dark:bg-white/10 text-slate-300 dark:text-slate-600 scale-90'
            }`}
          >
            <ArrowUp size={18} strokeWidth={2.5} aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SpiritualChat;
