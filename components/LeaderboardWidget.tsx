
import React, { useState, useEffect } from 'react';
import { LeaderboardData, UserProfile } from '../types';
import { fetchLeaderboard } from '../services/databaseService';
import { Trophy, Flame, Zap, Crown, Info, X, ChevronUp, Star, ShieldCheck, Heart, User } from 'lucide-react';

interface LeaderboardWidgetProps {
  user?: UserProfile;
}

const LeaderboardWidget: React.FC<LeaderboardWidgetProps> = ({ user }) => {
  const [data, setData] = useState<LeaderboardData | null>(null);
  const [activeTab, setActiveTab] = useState<'intercessors' | 'pilgrims'>('intercessors');
  const [loading, setLoading] = useState(true);
  const [showInfo, setShowInfo] = useState(false);

  useEffect(() => {
    const load = async () => {
      const result = await fetchLeaderboard();
      setData(result);
      setLoading(false);
    };
    load();
  }, []);

  const currentList = activeTab === 'intercessors' ? data?.intercessors : data?.pilgrims;
  
  // Extract Top 3 for Podium Visualization
  const top1 = currentList?.[0];
  const top2 = currentList?.[1];
  const top3 = currentList?.[2];
  
  // The rest of the list
  const others = currentList?.slice(3) || [];

  // FIND CURRENT USER (Mock Logic)
  const userRank = 42; 
  const userScore = user?.currentXP || 120;
  const isUserInTop = false;

  if (loading) return <div className="h-64 bg-slate-100 dark:bg-white/5 rounded-[2rem] animate-pulse" />;

  return (
    <div className="bg-white dark:bg-[#1A1F26] rounded-[2rem] shadow-card border border-slate-100 dark:border-white/5 h-full flex flex-col relative overflow-hidden">
       
       <div className="absolute top-0 right-0 w-32 h-32 bg-brand-violet/5 rounded-full blur-3xl pointer-events-none" />

       {/* Header */}
       <div className="flex items-center justify-between p-6 pb-2 relative z-10">
          <div className="flex items-center gap-2">
             <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center text-amber-500">
                <Trophy size={16} fill="currentColor" />
             </div>
             <div>
                <h3 className="font-bold text-brand-dark dark:text-white text-sm uppercase tracking-widest">Ranking</h3>
                <p className="text-[10px] text-slate-400 font-medium">Nível de Caridade</p>
             </div>
          </div>
          
          <button onClick={() => setShowInfo(true)} className="text-slate-400 hover:text-brand-violet transition-colors flex items-center gap-1 text-[10px] font-bold bg-slate-50 dark:bg-white/5 px-2 py-1 rounded-lg">
             <Info size={12} /> Pontuar
          </button>
       </div>

       {/* Tabs */}
       <div className="px-6 mb-6">
         <div className="flex p-1 bg-slate-100 dark:bg-black/30 rounded-xl border border-slate-200 dark:border-white/5">
            <button 
              onClick={() => setActiveTab('intercessors')}
              className={`flex-1 py-2 text-[10px] font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${activeTab === 'intercessors' ? 'bg-white dark:bg-white/10 text-brand-violet shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
            >
               <Flame size={12} /> Intercessores
            </button>
            <button 
              onClick={() => setActiveTab('pilgrims')}
              className={`flex-1 py-2 text-[10px] font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${activeTab === 'pilgrims' ? 'bg-white dark:bg-white/10 text-brand-violet shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
            >
               <Zap size={12} /> Constantes
            </button>
         </div>
       </div>

       {/* PODIUM (Visual & Fun) */}
       <div className="flex justify-center items-end gap-3 px-4 mb-4 relative z-10 border-b border-slate-100 dark:border-white/5 pb-6">
          
          {/* 2nd Place */}
          {top2 && (
             <div className="flex flex-col items-center group w-1/3">
                <div className="relative transition-transform group-hover:-translate-y-1">
                   <div className="w-10 h-10 rounded-full border-2 border-slate-300 dark:border-slate-500 bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-500 font-bold text-xs shadow-lg overflow-hidden">
                      {top2.avatarUrl ? <img src={top2.avatarUrl} className="w-full h-full object-cover"/> : top2.userName.charAt(0)}
                   </div>
                   <div className="absolute -bottom-1.5 inset-x-0 flex justify-center"><span className="bg-slate-200 text-slate-600 text-[9px] font-black px-1.5 py-0.5 rounded-full border border-white dark:border-brand-dark shadow-sm">2</span></div>
                </div>
                <p className="text-[10px] font-bold mt-3 text-slate-600 dark:text-slate-300 truncate w-full text-center">{top2.userName.split(' ')[0]}</p>
                <p className="text-[9px] font-bold text-brand-violet">{top2.score}</p>
             </div>
          )}

          {/* 1st Place */}
          {top1 && (
             <div className="flex flex-col items-center relative -top-3 group w-1/3">
                <Crown size={20} className="text-amber-400 fill-amber-400 mb-1 animate-bounce drop-shadow-md" />
                <div className="relative transition-transform group-hover:scale-105">
                   <div className="w-14 h-14 rounded-full border-4 border-amber-400 bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center text-amber-600 font-bold text-lg shadow-xl shadow-amber-500/20 overflow-hidden">
                      {top1.avatarUrl ? <img src={top1.avatarUrl} className="w-full h-full object-cover"/> : top1.userName.charAt(0)}
                   </div>
                   <div className="absolute -bottom-2 inset-x-0 flex justify-center"><span className="bg-gradient-to-r from-amber-300 to-amber-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full border-2 border-white dark:border-brand-dark shadow-md">1</span></div>
                </div>
                <p className="text-xs font-black mt-3 text-brand-dark dark:text-white truncate w-full text-center">{top1.userName.split(' ')[0]}</p>
                <p className="text-[10px] font-bold text-amber-500 bg-amber-50 dark:bg-amber-900/20 px-2 py-0.5 rounded-lg mt-0.5">{top1.score} pts</p>
             </div>
          )}

          {/* 3rd Place */}
          {top3 && (
             <div className="flex flex-col items-center group w-1/3">
                <div className="relative transition-transform group-hover:-translate-y-1">
                   <div className="w-10 h-10 rounded-full border-2 border-orange-300 bg-orange-50 dark:bg-white/5 flex items-center justify-center text-orange-600 font-bold text-xs shadow-lg overflow-hidden">
                      {top3.avatarUrl ? <img src={top3.avatarUrl} className="w-full h-full object-cover"/> : top3.userName.charAt(0)}
                   </div>
                   <div className="absolute -bottom-1.5 inset-x-0 flex justify-center"><span className="bg-orange-200 text-orange-700 text-[9px] font-black px-1.5 py-0.5 rounded-full border border-white dark:border-brand-dark shadow-sm">3</span></div>
                </div>
                <p className="text-[10px] font-bold mt-3 text-slate-600 dark:text-slate-300 truncate w-full text-center">{top3.userName.split(' ')[0]}</p>
                <p className="text-[9px] font-bold text-brand-violet">{top3.score}</p>
             </div>
          )}
       </div>

       {/* List (Rest) - Scrollable Area */}
       <div className="overflow-y-auto flex-1 px-4 space-y-2 pb-24 scrollbar-thin">
          {others?.map((entry) => (
             <div key={entry.id} className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50/50 dark:bg-white/5 border border-transparent hover:border-slate-200 dark:hover:border-white/10 transition-colors">
                <span className="w-6 text-center text-xs font-bold text-slate-400">{entry.rank}</span>
                <div className="w-8 h-8 rounded-full bg-white dark:bg-white/10 flex items-center justify-center text-slate-500 font-bold text-xs border border-slate-100 dark:border-white/5 shadow-sm">
                   {entry.userName.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                   <p className="text-xs font-bold text-brand-dark dark:text-white truncate">{entry.userName}</p>
                </div>
                <span className="text-xs font-bold text-brand-violet bg-brand-violet/5 px-2 py-1 rounded-lg">{entry.score}</span>
             </div>
          ))}
       </div>

       {/* YOUR POSITION */}
       {!isUserInTop && user && (
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-white dark:bg-[#1A1F26] border-t border-slate-100 dark:border-white/5 shadow-[0_-10px_20px_-5px_rgba(0,0,0,0.1)] z-20">
             <div className="flex items-center justify-between mb-2">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                   <User size={10} /> Sua Posição Real
                </p>
                <span className="text-[10px] text-brand-violet font-bold flex items-center gap-1">
                   <ChevronUp size={12} /> Falta pouco para subir
                </span>
             </div>
             
             <div className="flex items-center gap-3 p-3 rounded-2xl bg-brand-violet text-white shadow-lg shadow-brand-violet/20 transform scale-[1.02] border border-white/20">
                <span className="w-6 text-center text-sm font-black">{userRank}</span>
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold text-xs border border-white/20">
                   {user.photoUrl ? <img src={user.photoUrl} className="w-full h-full object-cover rounded-full" /> : "Você"}
                </div>
                <div className="flex-1 min-w-0">
                   <p className="text-xs font-bold text-white truncate">{user.name}</p>
                   <div className="w-full bg-black/20 h-1.5 rounded-full mt-1 overflow-hidden">
                      <div className="bg-white h-full w-[70%]" />
                   </div>
                </div>
                <div className="text-center">
                   <span className="block text-xs font-black">{userScore}</span>
                   <span className="text-[8px] opacity-80 uppercase font-bold">Pontos</span>
                </div>
             </div>
          </div>
       )}

       {/* Info Modal (Gamified) */}
       {showInfo && (
          <div className="absolute inset-0 bg-white/95 dark:bg-[#1A1F26]/95 backdrop-blur-sm z-50 flex flex-col p-6 animate-fade-in">
             <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-lg text-brand-dark dark:text-white">Como Pontuar?</h3>
                <button onClick={() => setShowInfo(false)} className="bg-slate-100 dark:bg-white/10 p-2 rounded-full"><X size={18} /></button>
             </div>
             
             <p className="text-sm text-slate-600 dark:text-slate-300 mb-6">
                Sua pontuação reflete sua caridade e constância. Não é uma competição, é um incentivo à santidade.
             </p>

             <div className="space-y-3">
                <div className="flex items-center gap-4 bg-slate-50 dark:bg-white/5 p-4 rounded-2xl border border-slate-100 dark:border-white/5">
                   <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/20 text-orange-500 rounded-full flex items-center justify-center shadow-sm">
                      <Flame size={20} fill="currentColor" />
                   </div>
                   <div className="flex-1">
                      <p className="font-bold text-brand-dark dark:text-white text-sm">Interceder</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Rezar por alguém</p>
                   </div>
                   <span className="font-black text-brand-violet bg-brand-violet/10 px-3 py-1 rounded-lg">+10</span>
                </div>

                <div className="flex items-center gap-4 bg-slate-50 dark:bg-white/5 p-4 rounded-2xl border border-slate-100 dark:border-white/5">
                   <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 text-green-600 rounded-full flex items-center justify-center shadow-sm">
                      <ShieldCheck size={20} />
                   </div>
                   <div className="flex-1">
                      <p className="font-bold text-brand-dark dark:text-white text-sm">Completar Dia</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Finalizar sua rotina</p>
                   </div>
                   <span className="font-black text-brand-violet bg-brand-violet/10 px-3 py-1 rounded-lg">+50</span>
                </div>

                <div className="flex items-center gap-4 bg-slate-50 dark:bg-white/5 p-4 rounded-2xl border border-slate-100 dark:border-white/5">
                   <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 text-blue-500 rounded-full flex items-center justify-center shadow-sm">
                      <Heart size={20} fill="currentColor" />
                   </div>
                   <div className="flex-1">
                      <p className="font-bold text-brand-dark dark:text-white text-sm">Testemunho</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Partilhar uma graça</p>
                   </div>
                   <span className="font-black text-brand-violet bg-brand-violet/10 px-3 py-1 rounded-lg">+20</span>
                </div>
             </div>
          </div>
       )}
    </div>
  );
};

export default LeaderboardWidget;
