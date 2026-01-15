
import React, { useState, useEffect, useRef } from 'react';
import { Trophy, MessageCircle, Send, Flame, Zap, Crown, User, Sparkles, Loader2, ArrowRight } from 'lucide-react';
import { UserProfile } from '../types';
import LeaderboardWidget from './LeaderboardWidget';
import { supabase } from '../services/authService';

interface SocialHubProps {
  user: UserProfile;
}

interface QuickMessage {
  id: string;
  userId: string;
  userName: string;
  text: string;
  timestamp: Date;
}

const SocialHub: React.FC<SocialHubProps> = ({ user }) => {
  const [activeSubTab, setActiveSubTab] = useState<'ranking' | 'chat'>('ranking');
  const [messages, setMessages] = useState<QuickMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [loadingChat, setLoadingChat] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeSubTab === 'chat') {
        loadMessages();
    }
  }, [activeSubTab]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = async () => {
    setLoadingChat(true);
    // Simulação de busca no DB (Para produção, conectar à tabela 'social_chat')
    setTimeout(() => {
        setMessages([
            { id: '1', userId: 'bot1', userName: 'Maria Santos', text: 'Bom dia, irmãos! Que a paz de Cristo esteja com vocês hoje. 🙏', timestamp: new Date(Date.now() - 3600000) },
            { id: '2', userId: 'bot2', userName: 'João Pedro', text: 'Alguém mais está fazendo o desafio do silêncio? Tem sido incrível!', timestamp: new Date(Date.now() - 1800000) },
            { id: '3', userId: 'bot3', userName: 'Ana Clara', text: 'Rezem por mim, hoje tenho uma prova difícil na faculdade. Deus abençoe!', timestamp: new Date(Date.now() - 600000) },
        ]);
        setLoadingChat(false);
    }, 800);
  };

  const scrollToBottom = () => {
    if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isSending) return;

    setIsSending(true);
    const newMsg: QuickMessage = {
        id: Date.now().toString(),
        userId: user.id,
        userName: user.name,
        text: inputText,
        timestamp: new Date()
    };

    // Mock send
    setTimeout(() => {
        setMessages(prev => [...prev, newMsg]);
        setInputText('');
        setIsSending(false);
    }, 300);
  };

  return (
    <div className="h-screen flex flex-col bg-slate-50 dark:bg-brand-dark animate-fade-in font-sans">
      
      {/* Header Fixo */}
      <div className="shrink-0 p-6 bg-white dark:bg-[#1A1F26] border-b border-slate-100 dark:border-white/5">
        <div className="max-w-2xl mx-auto flex flex-col gap-4">
           <div className="flex justify-between items-center">
              <div>
                 <h1 className="text-xl font-extrabold text-brand-dark dark:text-white flex items-center gap-2">
                    <Sparkles className="text-brand-violet" size={20} /> Caminho da Fé
                 </h1>
                 <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mt-0.5">Comunidade Global</p>
              </div>
              <div className="flex bg-slate-100 dark:bg-black/20 p-1 rounded-xl">
                 <button 
                    onClick={() => setActiveSubTab('ranking')}
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeSubTab === 'ranking' ? 'bg-white dark:bg-white/10 text-brand-violet shadow-sm' : 'text-slate-400'}`}
                 >
                    Ranking
                 </button>
                 <button 
                    onClick={() => setActiveSubTab('chat')}
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeSubTab === 'chat' ? 'bg-white dark:bg-white/10 text-brand-violet shadow-sm' : 'text-slate-400'}`}
                 >
                    Chat Global
                 </button>
              </div>
           </div>
        </div>
      </div>

      {/* Conteúdo Variável */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="max-w-2xl mx-auto w-full h-full flex flex-col relative">
           
           {activeSubTab === 'ranking' && (
              <div className="flex-1 overflow-y-auto p-6 pb-32 no-scrollbar">
                 <div className="bg-gradient-to-br from-brand-violet to-purple-800 rounded-[2.5rem] p-8 text-white mb-8 relative overflow-hidden shadow-2xl">
                    <div className="absolute top-0 right-0 p-4 opacity-10"><Trophy size={120} /></div>
                    <h2 className="text-2xl font-black mb-2">Exército de Luz</h2>
                    <p className="text-purple-100 text-sm leading-relaxed max-w-xs">Veja como a fidelidade dos seus irmãos edifica a Igreja inteira.</p>
                 </div>
                 <LeaderboardWidget user={user} />
              </div>
           )}

           {activeSubTab === 'chat' && (
              <div className="flex-1 flex flex-col h-full bg-white dark:bg-[#1A1F26] rounded-t-[2.5rem] mt-4 shadow-2xl border-t border-slate-100 dark:border-white/5 relative overflow-hidden">
                 
                 {/* Mensagens */}
                 <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 pb-24 no-scrollbar">
                    {loadingChat ? (
                       <div className="flex justify-center items-center h-full"><Loader2 className="animate-spin text-brand-violet" /></div>
                    ) : messages.map((msg, idx) => (
                       <div key={msg.id} className={`flex flex-col ${msg.userId === user.id ? 'items-end' : 'items-start'} animate-slide-up`} style={{ animationDelay: `${idx * 50}ms` }}>
                          <div className="flex items-center gap-2 mb-1">
                             <span className="text-[9px] font-black text-slate-400 uppercase">{msg.userName}</span>
                             <span className="text-[8px] text-slate-300">
                                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                             </span>
                          </div>
                          <div className={`max-w-[85%] p-4 rounded-2xl shadow-sm text-sm font-medium leading-relaxed ${msg.userId === user.id ? 'bg-brand-violet text-white rounded-tr-none' : 'bg-slate-50 dark:bg-white/5 text-slate-700 dark:text-slate-200 border border-slate-100 dark:border-white/5 rounded-tl-none'}`}>
                             {msg.text}
                          </div>
                       </div>
                    ))}
                 </div>

                 {/* Input de Chat */}
                 <div className="absolute bottom-0 left-0 right-0 p-4 bg-white/95 dark:bg-[#1A1F26]/95 backdrop-blur-md border-t border-slate-100 dark:border-white/5 z-20">
                    <form onSubmit={handleSendMessage} className="flex gap-2 items-center bg-slate-100 dark:bg-black/30 rounded-2xl p-1.5 shadow-inner">
                       <input 
                          type="text" 
                          value={inputText}
                          onChange={(e) => setInputText(e.target.value)}
                          placeholder="Envie uma palavra de luz..."
                          className="flex-1 bg-transparent px-4 py-2.5 outline-none text-sm font-medium text-brand-dark dark:text-white"
                       />
                       <button 
                          disabled={!inputText.trim() || isSending}
                          className="w-10 h-10 rounded-xl bg-brand-violet text-white flex items-center justify-center shadow-lg shadow-brand-violet/20 active:scale-95 transition-all disabled:opacity-50"
                       >
                          {isSending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                       </button>
                    </form>
                 </div>
              </div>
           )}

        </div>
      </div>
    </div>
  );
};

export default SocialHub;
