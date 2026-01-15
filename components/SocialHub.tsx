
import React, { useState, useEffect, useRef } from 'react';
import { Trophy, MessageCircle, Send, Flame, Zap, Crown, User, Heart, Loader2, ArrowRight, Users, Star, ShieldCheck } from 'lucide-react';
import { UserProfile } from '../types';
import LeaderboardWidget from './LeaderboardWidget';
import BrandLogo from './BrandLogo';

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
  const [onlineCount, setOnlineCount] = useState(128);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeSubTab === 'chat') {
        loadMessages();
    }
    
    // Simular variação de pessoas online
    const interval = setInterval(() => {
      setOnlineCount(prev => prev + (Math.random() > 0.5 ? 1 : -1));
    }, 10000);
    return () => clearInterval(interval);
  }, [activeSubTab]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, activeSubTab]);

  const loadMessages = async () => {
    if (messages.length > 0) return;
    setLoadingChat(true);
    setTimeout(() => {
        setMessages([
            { 
              id: '1', userId: 'bot1', userName: 'Maria Santos', userLevel: 12, text: 'Bom dia, irmãos! Que a paz de Cristo esteja com vocês hoje. 🙏', timestamp: new Date(Date.now() - 3600000), type: 'chat',
              reactions: { heart: 5, candle: 2, pray: 8 },
              userReactions: { heart: false, candle: false, pray: false }
            },
            { 
              id: 'sys1', userId: 'sys', userName: 'Espiritualizei', userLevel: 0, text: 'Pedro Silva acabou de subir para o Nível 5! 🎊', timestamp: new Date(Date.now() - 2400000), type: 'achievement',
              reactions: { heart: 0, candle: 0, pray: 0 },
              userReactions: { heart: false, candle: false, pray: false }
            },
            { 
              id: '2', userId: 'bot2', userName: 'João Pedro', userLevel: 8, text: 'Alguém mais está fazendo o desafio do silêncio? Tem sido incrível!', timestamp: new Date(Date.now() - 1800000), type: 'chat',
              reactions: { heart: 3, candle: 1, pray: 4 },
              userReactions: { heart: false, candle: false, pray: false }
            },
            { 
              id: '3', userId: 'bot3', userName: 'Ana Clara', userLevel: 15, text: 'Rezem por mim, hoje tenho uma prova difícil na faculdade. Deus abençoe!', timestamp: new Date(Date.now() - 600000), type: 'chat',
              reactions: { heart: 2, candle: 5, pray: 12 },
              userReactions: { heart: false, candle: false, pray: false }
            },
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
        userAvatar: user.photoUrl,
        userLevel: user.level,
        text: inputText,
        timestamp: new Date(),
        type: 'chat',
        reactions: { heart: 0, candle: 0, pray: 0 },
        userReactions: { heart: false, candle: false, pray: false }
    };

    setTimeout(() => {
        setMessages(prev => [...prev, newMsg]);
        setInputText('');
        setIsSending(false);
    }, 300);
  };

  const handleReaction = (messageId: string, reactionType: 'heart' | 'candle' | 'pray') => {
    setMessages(prev => prev.map(msg => {
      if (msg.id !== messageId) return msg;

      const hasReacted = msg.userReactions[reactionType];
      return {
        ...msg,
        reactions: {
          ...msg.reactions,
          [reactionType]: hasReacted ? msg.reactions[reactionType] - 1 : msg.reactions[reactionType] + 1
        },
        userReactions: {
          ...msg.userReactions,
          [reactionType]: !hasReacted
        }
      };
    }));
  };

  return (
    <div className="h-screen flex flex-col bg-[#F8FAFC] dark:bg-brand-dark animate-fade-in font-sans overflow-hidden">
      
      {/* Cabeçalho da Aba Social */}
      <div className="shrink-0 pt-6 px-6 pb-4 bg-white dark:bg-[#1A1F26] border-b border-slate-100 dark:border-white/5 z-30">
        <div className="max-w-4xl mx-auto">
           <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-2xl bg-brand-violet/10 flex items-center justify-center text-brand-violet shadow-sm">
                    <Users size={22} />
                 </div>
                 <div>
                    <h1 className="text-xl font-black text-brand-dark dark:text-white tracking-tight">Chat da Comunidade</h1>
                    <div className="flex items-center gap-1.5">
                       <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                       <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{onlineCount} FIÉIS ONLINE AGORA</span>
                    </div>
                 </div>
              </div>

              {/* Segmented Control */}
              <div className="flex p-1.5 bg-slate-100 dark:bg-black/30 rounded-[1.25rem] w-full sm:w-64">
                 <button 
                    onClick={() => setActiveSubTab('ranking')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-black transition-all ${activeSubTab === 'ranking' ? 'bg-white dark:bg-[#2D333B] text-brand-violet shadow-md' : 'text-slate-500 dark:text-slate-400'}`}
                 >
                    <Trophy size={14} fill={activeSubTab === 'ranking' ? "currentColor" : "none"} /> Ranking
                 </button>
                 <button 
                    onClick={() => setActiveSubTab('chat')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-black transition-all ${activeSubTab === 'chat' ? 'bg-white dark:bg-[#2D333B] text-brand-violet shadow-md' : 'text-slate-500 dark:text-slate-400'}`}
                 >
                    <MessageCircle size={14} fill={activeSubTab === 'chat' ? "currentColor" : "none"} /> Chat Global
                 </button>
              </div>
           </div>
        </div>
      </div>

      {/* Área de Conteúdo principal */}
      <div className="flex-1 overflow-hidden relative">
        <div className="max-w-4xl mx-auto w-full h-full flex flex-col">
           
           {activeSubTab === 'ranking' && (
              <div className="flex-1 overflow-y-auto px-6 py-8 pb-32 no-scrollbar animate-slide-up">
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    <div className="md:col-span-2">
                       <div className="bg-gradient-to-br from-brand-violet to-purple-800 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl shadow-brand-violet/20 h-full flex flex-col justify-center">
                          <div className="absolute top-[-20%] right-[-10%] opacity-10"><Trophy size={200} /></div>
                          <div className="relative z-10">
                             <div className="inline-flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-4 border border-white/10">
                                <Star size={10} fill="currentColor" /> Edificação da Igreja
                             </div>
                             <h2 className="text-3xl font-black mb-3 tracking-tight">Exército de Luz</h2>
                             <p className="text-purple-100 text-sm leading-relaxed max-w-sm font-medium">
                                No Espiritualizei, seu progresso é fruto da sua caridade. Veja como a fidelidade de cada um fortalece toda a nossa família de fé.
                             </p>
                          </div>
                       </div>
                    </div>
                    
                    <div className="bg-white dark:bg-[#1A1F26] rounded-[2.5rem] p-6 border border-slate-100 dark:border-white/5 shadow-card flex flex-col items-center text-center justify-center">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Sua Performance</p>
                       <div className="relative mb-3">
                          <div className="w-16 h-16 rounded-full border-4 border-brand-violet/20 border-t-brand-violet flex items-center justify-center">
                             <span className="text-xl font-black text-brand-dark dark:text-white">{user.level}</span>
                          </div>
                          <div className="absolute -top-1 -right-1 bg-brand-violet text-white p-1 rounded-full shadow-lg"><Zap size={10} fill="currentColor" /></div>
                       </div>
                       <p className="text-sm font-bold text-brand-dark dark:text-white">{user.currentXP} XP</p>
                       <p className="text-[10px] text-slate-500 font-medium">Faltam {user.nextLevelXP - user.currentXP} para o Nível {user.level + 1}</p>
                    </div>
                 </div>

                 <LeaderboardWidget user={user} />
              </div>
           )}

           {activeSubTab === 'chat' && (
              <div className="flex-1 flex flex-col h-full bg-slate-50/50 dark:bg-brand-dark relative animate-slide-up">
                 
                 {/* Mensagens do Chat */}
                 <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-6 space-y-8 pb-32 no-scrollbar">
                    {loadingChat ? (
                       <div className="flex flex-col justify-center items-center h-full gap-4">
                          <Loader2 className="animate-spin text-brand-violet" size={32} />
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Sintonizando frequências...</p>
                       </div>
                    ) : messages.length === 0 ? (
                       <div className="flex flex-col items-center justify-center h-full text-center p-10 opacity-50">
                          <MessageCircle size={60} className="text-slate-300 mb-4" />
                          <p className="font-bold text-slate-500">A praça está em silêncio...</p>
                          <p className="text-sm text-slate-400">Seja o primeiro a enviar uma palavra de luz!</p>
                       </div>
                    ) : messages.map((msg, idx) => {
                       const isMe = msg.userId === user.id;
                       const isSystem = msg.type === 'achievement';

                       if (isSystem) {
                          return (
                             <div key={msg.id} className="flex justify-center my-4 animate-fade-in">
                                <div className="bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 px-4 py-1.5 rounded-full flex items-center gap-2">
                                   <Heart size={12} className="text-brand-violet" fill="currentColor" />
                                   <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">{msg.text}</span>
                                </div>
                             </div>
                          );
                       }

                       return (
                          <div key={msg.id} className={`flex gap-3 ${isMe ? 'flex-row-reverse' : 'flex-row'} items-end group`}>
                             {/* Avatar */}
                             <div className={`shrink-0 w-9 h-9 rounded-xl overflow-hidden shadow-sm border-2 ${isMe ? 'border-brand-violet' : 'border-white dark:border-white/10'}`}>
                                {msg.userAvatar ? (
                                   <img src={msg.userAvatar} className="w-full h-full object-cover" />
                                ) : (
                                   <div className="w-full h-full bg-slate-200 dark:bg-white/10 flex items-center justify-center font-bold text-xs text-slate-500">
                                      {msg.userName.charAt(0)}
                                   </div>
                                )}
                             </div>

                             {/* Bolha de Mensagem */}
                             <div className={`flex flex-col max-w-[80%] ${isMe ? 'items-end' : 'items-start'}`}>
                                {!isMe && (
                                   <div className="flex items-center gap-2 mb-1 px-1">
                                      <span className="text-[10px] font-black text-brand-dark dark:text-white/80">{msg.userName}</span>
                                      {msg.userLevel > 0 && (
                                         <span className="bg-slate-100 dark:bg-white/10 text-slate-500 text-[8px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-tighter">LVL {msg.userLevel}</span>
                                      )}
                                   </div>
                                )}
                                <div className={`p-4 rounded-2xl shadow-sm text-sm font-medium leading-relaxed relative group/msg ${
                                   isMe 
                                      ? 'bg-brand-violet text-white rounded-br-none' 
                                      : 'bg-white dark:bg-[#1A1F26] text-slate-700 dark:text-slate-200 border border-slate-100 dark:border-white/5 rounded-bl-none shadow-md shadow-slate-200/50 dark:shadow-none'
                                }`}>
                                   {msg.text}
                                   <span className={`block text-[8px] mt-2 opacity-50 text-right ${isMe ? 'text-white' : 'text-slate-400'}`}>
                                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                   </span>
                                </div>

                                {/* Reações */}
                                <div className={`flex flex-wrap gap-1.5 mt-2 ${isMe ? 'justify-end' : 'justify-start'}`}>
                                   <button 
                                      onClick={() => handleReaction(msg.id, 'heart')}
                                      className={`flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-black transition-all active:scale-125 border ${
                                         msg.userReactions.heart 
                                         ? 'bg-red-50 border-red-200 text-red-500 shadow-sm' 
                                         : 'bg-white/50 dark:bg-white/5 border-slate-100 dark:border-white/5 text-slate-400 hover:border-red-200 hover:text-red-400'
                                      }`}
                                   >
                                      <Heart size={10} fill={msg.userReactions.heart ? "currentColor" : "none"} />
                                      {msg.reactions.heart > 0 && <span>{msg.reactions.heart}</span>}
                                   </button>
                                   <button 
                                      onClick={() => handleReaction(msg.id, 'candle')}
                                      className={`flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-black transition-all active:scale-125 border ${
                                         msg.userReactions.candle 
                                         ? 'bg-amber-50 border-amber-200 text-amber-500 shadow-sm' 
                                         : 'bg-white/50 dark:bg-white/5 border-slate-100 dark:border-white/5 text-slate-400 hover:border-amber-200 hover:text-amber-400'
                                      }`}
                                   >
                                      <Flame size={10} fill={msg.userReactions.candle ? "currentColor" : "none"} />
                                      {msg.reactions.candle > 0 && <span>{msg.reactions.candle}</span>}
                                   </button>
                                   <button 
                                      onClick={() => handleReaction(msg.id, 'pray')}
                                      className={`flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-black transition-all active:scale-125 border ${
                                         msg.userReactions.pray 
                                         ? 'bg-blue-50 border-blue-200 text-blue-500 shadow-sm' 
                                         : 'bg-white/50 dark:bg-white/5 border-slate-100 dark:border-white/5 text-slate-400 hover:border-blue-200 hover:text-blue-400'
                                      }`}
                                   >
                                      <span>🙏</span>
                                      {msg.reactions.pray > 0 && <span>{msg.reactions.pray}</span>}
                                   </button>
                                </div>
                             </div>
                          </div>
                       );
                    })}
                 </div>

                 {/* Barra de Input Flutuante */}
                 <div className="absolute bottom-6 left-0 right-0 px-6 z-40">
                    <form onSubmit={handleSendMessage} className="max-w-2xl mx-auto bg-white/80 dark:bg-[#1A1F26]/80 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-2xl p-2 shadow-float flex gap-2 items-center">
                       <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-white/5 flex items-center justify-center text-slate-400 shrink-0">
                          <Heart size={20} />
                       </div>
                       <input 
                          type="text" 
                          value={inputText}
                          onChange={(e) => setInputText(e.target.value)}
                          placeholder="Envie uma palavra de luz..."
                          className="flex-1 bg-transparent px-2 outline-none text-sm font-medium text-brand-dark dark:text-white placeholder:text-slate-400"
                       />
                       <button 
                          disabled={!inputText.trim() || isSending}
                          className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg transition-all active:scale-90 disabled:opacity-50 ${inputText.trim() ? 'bg-brand-violet text-white shadow-brand-violet/30' : 'bg-slate-100 dark:bg-white/5 text-slate-400'}`}
                       >
                          {isSending ? <Loader2 size={20} className="animate-spin" /> : <ArrowRight size={22} />}
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
