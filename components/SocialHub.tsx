
import React, { useState, useEffect, useRef } from 'react';
import { Trophy, MessageCircle, Send, Flame, Zap, Crown, User, Heart, Loader2, ArrowRight, Users, Star, ShieldCheck } from 'lucide-react';
import { UserProfile } from '../types';
import LeaderboardWidget from './LeaderboardWidget';
import BrandLogo from './BrandLogo';
import { fetchChatMessages, createChatMessage, updateChatMessageReaction } from '../services/databaseService';

interface SocialHubProps {
  user: UserProfile;
}

interface QuickMessage {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  userLevel: number;
  text: string;
  timestamp: Date;
  type: 'chat' | 'achievement';
  reactions: {
    heart: number;
    candle: number;
    pray: number;
  };
  userReactions: {
    heart: boolean;
    candle: boolean;
    pray: boolean;
  };
}

const SocialHub: React.FC<SocialHubProps> = ({ user }) => {
  const [activeSubTab, setActiveSubTab] = useState<'ranking' | 'chat'>('ranking');
  const [messages, setMessages] = useState<QuickMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [loadingChat, setLoadingChat] = useState(false);
  const [onlineCount, setOnlineCount] = useState(133);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeSubTab === 'chat') {
        loadRealMessages();
    }
    
    const interval = setInterval(() => {
      setOnlineCount(prev => prev + (Math.random() > 0.5 ? 1 : -1));
    }, 10000);
    return () => clearInterval(interval);
  }, [activeSubTab]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, activeSubTab]);

  const loadRealMessages = async () => {
    setLoadingChat(true);
    try {
        const dbMessages = await fetchChatMessages();
        if (Array.isArray(dbMessages)) {
          setMessages(dbMessages);
        } else {
          setMessages([]);
        }
    } catch (e) {
        console.error('Erro ao carregar mensagens:', e);
        setMessages([]);
    } finally {
        setLoadingChat(false);
    }
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
        userAvatar: user.photoUrl,
        userLevel: user.level,
        text: inputText,
        timestamp: new Date(),
        type: 'chat',
        reactions: { heart: 0, candle: 0, pray: 0 },
        userReactions: { heart: false, candle: false, pray: false }
    };

    // UI Otimista
    setMessages(prev => [...prev, newMsg]);
    setInputText('');

    try {
        await createChatMessage(newMsg);
    } catch (e) {
        console.error("Falha ao salvar no banco:", e);
    } finally {
        setIsSending(false);
    }
  };

  const handleReaction = async (messageId: string, reactionType: 'heart' | 'candle' | 'pray') => {
    let updatedReactions;

    setMessages(prev => prev.map(msg => {
      if (msg.id !== messageId) return msg;

      const currentReactions = { ...msg.reactions };
      const currentUserReactions = { ...msg.userReactions };

      if (currentUserReactions[reactionType]) {
        currentReactions[reactionType]--;
        currentUserReactions[reactionType] = false;
      } else {
        Object.keys(currentUserReactions).forEach((key) => {
          const k = key as keyof typeof currentUserReactions;
          if (currentUserReactions[k]) {
            currentReactions[k]--;
            currentUserReactions[k] = false;
          }
        });

        currentReactions[reactionType]++;
        currentUserReactions[reactionType] = true;
      }

      updatedReactions = currentReactions;
      return {
        ...msg,
        reactions: currentReactions,
        userReactions: currentUserReactions
      };
    }));

    if (updatedReactions) {
       await updateChatMessageReaction(messageId, updatedReactions);
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#F8FAFC] dark:bg-brand-dark animate-fade-in font-sans overflow-hidden">
      
      {/* Cabeçalho Refinado - Otimizado Mobile */}
      <div className="shrink-0 pt-6 px-4 sm:px-6 pb-4 bg-white dark:bg-[#1A1F26] border-b border-slate-100 dark:border-white/5 z-30 shadow-sm">
        <div className="max-w-4xl mx-auto flex flex-col gap-4">
           <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-2xl bg-brand-violet/10 flex items-center justify-center text-brand-violet shrink-0 shadow-sm">
                    <Users size={22} />
                 </div>
                 <div className="min-w-0">
                    <h1 className="text-lg sm:text-xl font-black text-brand-dark dark:text-white tracking-tight truncate">Chat da Comunidade</h1>
                    <div className="flex items-center gap-1.5">
                       <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                       <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">{onlineCount} FIÉIS ONLINE AGORA</span>
                    </div>
                 </div>
              </div>
           </div>

           {/* Segmented Control */}
           <div className="flex p-1 bg-slate-100 dark:bg-black/30 rounded-2xl w-full max-w-sm mx-auto sm:mx-0">
              <button 
                 onClick={() => setActiveSubTab('ranking')}
                 className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeSubTab === 'ranking' ? 'bg-white dark:bg-[#2D333B] text-brand-violet shadow-md' : 'text-slate-500 dark:text-slate-400'}`}
              >
                 <Trophy size={14} fill={activeSubTab === 'ranking' ? "currentColor" : "none"} /> Ranking
              </button>
              <button 
                 onClick={() => setActiveSubTab('chat')}
                 className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeSubTab === 'chat' ? 'bg-white dark:bg-[#2D333B] text-brand-violet shadow-md' : 'text-slate-500 dark:text-slate-400'}`}
              >
                 <MessageCircle size={14} fill={activeSubTab === 'chat' ? "currentColor" : "none"} /> Chat Global
              </button>
           </div>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="flex-1 overflow-hidden relative">
        <div className="max-w-4xl mx-auto w-full h-full flex flex-col">
           
           {activeSubTab === 'ranking' && (
              <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 pb-32 no-scrollbar animate-slide-up">
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <div className="md:col-span-2">
                       <div className="bg-gradient-to-br from-brand-violet to-purple-800 rounded-[2rem] p-6 sm:p-8 text-white relative overflow-hidden shadow-xl h-full flex flex-col justify-center">
                          <div className="absolute top-[-20%] right-[-10%] opacity-10"><Trophy size={160} /></div>
                          <div className="relative z-10">
                             <div className="inline-flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest mb-3 border border-white/10">
                                <Star size={10} fill="currentColor" /> Edificação da Igreja
                             </div>
                             <h2 className="text-2xl sm:text-3xl font-black mb-2 tracking-tight">Exército de Luz</h2>
                             <p className="text-purple-100 text-xs sm:text-sm leading-relaxed max-w-sm font-medium opacity-90">
                                Cada intercessão e prática de rotina fortalece nossa família de fé.
                             </p>
                          </div>
                       </div>
                    </div>
                    
                    <div className="bg-white dark:bg-[#1A1F26] rounded-[2rem] p-6 border border-slate-100 dark:border-white/5 shadow-sm flex flex-col items-center text-center justify-center">
                       <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4">Sua Performance</p>
                       <div className="relative mb-3">
                          <div className="w-14 h-14 rounded-full border-4 border-brand-violet/20 border-t-brand-violet flex items-center justify-center">
                             <span className="text-lg font-black text-brand-dark dark:text-white">{user.level}</span>
                          </div>
                          <div className="absolute -top-1 -right-1 bg-brand-violet text-white p-1 rounded-full shadow-lg"><Zap size={10} fill="currentColor" /></div>
                       </div>
                       <p className="text-xs font-bold text-brand-dark dark:text-white">{user.currentXP} XP</p>
                       <p className="text-[9px] text-slate-500 font-medium">Próximo Nível: {user.nextLevelXP} XP</p>
                    </div>
                 </div>

                 <LeaderboardWidget user={user} />
              </div>
           )}

           {activeSubTab === 'chat' && (
              <div className="flex-1 flex flex-col h-full bg-slate-50/30 dark:bg-brand-dark relative animate-slide-up">
                 
                 <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 space-y-6 pb-28 no-scrollbar">
                    {loadingChat ? (
                       <div className="flex flex-col justify-center items-center h-full gap-4">
                          <Loader2 className="animate-spin text-brand-violet" size={32} />
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sintonizando fraternidade...</p>
                       </div>
                    ) : messages.length === 0 ? (
                       <div className="flex flex-col items-center justify-center h-full text-center p-10 opacity-50">
                          <MessageCircle size={48} className="text-slate-300 mb-4" />
                          <p className="font-bold text-slate-500 text-sm">A praça está em silêncio...</p>
                       </div>
                    ) : messages.map((msg, idx) => {
                       if (!msg || !msg.id) return null;
                       const isMe = msg.userId === user?.id;
                       const isSystem = msg.type === 'achievement';

                       if (isSystem) {
                          return (
                             <div key={msg.id} className="flex justify-center my-4 animate-fade-in px-4">
                                <div className="bg-white/80 dark:bg-white/5 border border-slate-100 dark:border-white/5 px-4 py-1.5 rounded-full flex items-center gap-2 shadow-sm">
                                   <Heart size={10} className="text-brand-violet" fill="currentColor" />
                                   <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400 text-center">{msg.text}</span>
                                </div>
                             </div>
                          );
                       }

                       return (
                          <div key={msg.id} className={`flex gap-2 sm:gap-3 ${isMe ? 'flex-row-reverse' : 'flex-row'} items-end group`}>
                             <div className={`shrink-0 w-8 h-8 sm:w-9 sm:h-9 rounded-xl overflow-hidden shadow-sm border-2 ${isMe ? 'border-brand-violet' : 'border-white dark:border-white/10'}`}>
                                {msg.userAvatar ? (
                                   <img src={msg.userAvatar} className="w-full h-full object-cover" />
                                ) : (
                                   <div className="w-full h-full bg-slate-200 dark:bg-white/10 flex items-center justify-center font-bold text-xs text-slate-500">
                                      {msg.userName.charAt(0)}
                                   </div>
                                )}
                             </div>

                             <div className={`flex flex-col max-w-[85%] sm:max-w-[75%] ${isMe ? 'items-end' : 'items-start'}`}>
                                {!isMe && (
                                   <div className="flex items-center gap-2 mb-1 px-1">
                                      <span className="text-[10px] font-black text-brand-dark dark:text-white/80">{msg.userName}</span>
                                      <span className="bg-slate-100 dark:bg-white/10 text-slate-500 text-[8px] font-black px-1.5 py-0.5 rounded-md uppercase">Lvl {msg.userLevel}</span>
                                   </div>
                                )}
                                <div className={`p-3 sm:p-4 rounded-2xl shadow-sm text-sm font-medium leading-relaxed relative ${
                                   isMe 
                                      ? 'bg-brand-violet text-white rounded-br-none' 
                                      : 'bg-white dark:bg-[#1A1F26] text-slate-700 dark:text-slate-200 border border-slate-50 dark:border-white/5 rounded-bl-none shadow-md shadow-slate-200/40'
                                }`}>
                                   {msg.text}
                                   <span className={`block text-[8px] mt-1.5 opacity-40 text-right ${isMe ? 'text-white' : 'text-slate-400'}`}>
                                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                   </span>
                                </div>

                                <div className={`flex flex-wrap gap-2 mt-2 ${isMe ? 'justify-end' : 'justify-start'}`}>
                                   <button 
                                      onClick={() => handleReaction(msg.id, 'heart')}
                                      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[10px] font-black transition-all active:scale-125 border shadow-sm ${
                                         msg.userReactions.heart 
                                         ? 'bg-red-50 border-red-200 text-red-500' 
                                         : 'bg-white/50 dark:bg-white/5 border-slate-100 dark:border-white/5 text-slate-400'
                                      }`}
                                   >
                                      <Heart size={12} fill={msg.userReactions.heart ? "currentColor" : "none"} />
                                      {msg.reactions.heart > 0 && <span>{msg.reactions.heart}</span>}
                                   </button>
                                   <button 
                                      onClick={() => handleReaction(msg.id, 'candle')}
                                      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[10px] font-black transition-all active:scale-125 border shadow-sm ${
                                         msg.userReactions.candle 
                                         ? 'bg-amber-50 border-amber-200 text-amber-500' 
                                         : 'bg-white/50 dark:bg-white/5 border-slate-100 dark:border-white/5 text-slate-400'
                                      }`}
                                   >
                                      <Flame size={12} fill={msg.userReactions.candle ? "currentColor" : "none"} />
                                      {msg.reactions.candle > 0 && <span>{msg.reactions.candle}</span>}
                                   </button>
                                   <button 
                                      onClick={() => handleReaction(msg.id, 'pray')}
                                      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[10px] font-black transition-all active:scale-125 border shadow-sm ${
                                         msg.userReactions.pray 
                                         ? 'bg-blue-50 border-blue-200 text-blue-500' 
                                         : 'bg-white/50 dark:bg-white/5 border-slate-100 dark:border-white/5 text-slate-400'
                                      }`}
                                   >
                                      <span className="text-xs">🙏</span>
                                      {msg.reactions.pray > 0 && <span>{msg.reactions.pray}</span>}
                                   </button>
                                </div>
                             </div>
                          </div>
                       );
                    })}
                 </div>

                 <div className="sticky bottom-0 left-0 right-0 px-4 py-4 bg-gradient-to-t from-slate-50 dark:from-brand-dark via-slate-50/95 dark:via-brand-dark/95 to-transparent z-40">
                    <form onSubmit={handleSendMessage} className="max-w-2xl mx-auto bg-white dark:bg-[#1A1F26] border border-slate-200 dark:border-white/10 rounded-2xl p-1.5 shadow-2xl flex gap-2 items-center ring-4 ring-black/5">
                       <div className="w-9 h-9 rounded-xl bg-slate-50 dark:bg-white/5 flex items-center justify-center text-slate-400 shrink-0">
                          <Heart size={18} />
                       </div>
                       <input 
                          type="text" 
                          value={inputText}
                          onChange={(e) => setInputText(e.target.value)}
                          placeholder="Fale com a comunidade..."
                          className="flex-1 bg-transparent px-1 outline-none text-sm font-medium text-brand-dark dark:text-white placeholder:text-slate-400 h-10"
                       />
                       <button 
                          disabled={!inputText.trim() || isSending}
                          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all active:scale-90 disabled:opacity-50 ${inputText.trim() ? 'bg-brand-violet text-white shadow-lg shadow-brand-violet/20' : 'bg-slate-100 dark:bg-white/5 text-slate-400'}`}
                       >
                          {isSending ? <Loader2 size={18} className="animate-spin" /> : <ArrowRight size={20} />}
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
