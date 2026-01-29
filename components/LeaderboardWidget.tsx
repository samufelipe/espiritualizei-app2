
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
  
  const top1 = currentList?.[0];
  const top2 = currentList?.[1];
  const top3 = currentList?.[2];
  const others = currentList?.slice(3) || [];

  if (loading) return <div className="h-64 bg-slate-100 dark:bg-white/5 rounded-[2rem] animate-pulse" />;

  return (
    <div className="bg-white dark:bg-[#1A1F26] rounded-[2.5rem] shadow-card border border-slate-100 dark:border-white/5 flex flex-col relative overflow-hidden">
       
       <div className="absolute top-0 right-0 w-32 h-32 bg-brand-violet/5 rounded-full blur-3xl pointer-events-none" />

       {/* Header */}
       <div className="flex items-center justify-between p-7 pb-4 relative z-10">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center text-amber-500 shadow-sm">
                <Trophy size={20} fill="currentColor" />
             </div>
             <div>
                <h3 className="font-black text-brand-dark dark:text-white text-sm uppercase tracking-widest">Nível de Caridade</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter mt-0.5">Ranking Geral</p>
             </div>
          </div>
          
          <button onClick={() => setShowInfo(true)} className="text-slate-400 hover:text-brand-violet transition-colors flex items-center gap-1 text-[10px] font-black bg-slate-50 dark:bg-white/5 px-3 py-1.5 rounded-xl border border-slate-100 dark:border-white/10">
             <Info size={14} /> PONTUAR
          </button>
       </div>

       {/* Tabs do Ranking */}
       <div className="px-7 mb-8">
         <div className="flex p-1.5 bg-slate-100 dark:bg-black/30 rounded-2xl border border-slate-200 dark:border-white/5">
            <button 
              onClick={() => setActiveTab('intercessors')}
              className={`flex-1 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 ${activeTab === 'intercessors' ? 'bg-white dark:bg-white/10 text-brand-violet shadow-sm' : 'text-slate-400'}`}
            >
               <Flame size={14} fill={activeTab === 'intercessors' ? "currentColor" : "none"} /> Intercessores
            </button>
            <button 
              onClick={() => setActiveTab('pilgrims')}
              className={`flex-1 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 ${activeTab === 'pilgrims' ? 'bg-white dark:bg-white/10 text-brand-violet shadow-sm' : 'text-slate-400'}`}
            >
               <Zap size={14} fill={activeTab === 'pilgrims' ? "currentColor" : "none"} /> Constantes
            </button>
         </div>
       </div>

       {/* Pódio Visual */}
       <div className="flex justify-center items-end gap-3 px-6 mb-10 relative z-10 border-b border-slate-50 dark:border-white/5 pb-8 mx-4">
          
          {/* 2º Lugar */}
          {top2 && (
             <div className="flex flex-col items-center group w-1/3">
                <div className="relative transition-transform group-hover:-translate-y-2 duration-500">
                   <div className="w-14 h-14 rounded-[1.25rem] border-2 border-slate-300 dark:border-slate-500 bg-white dark:bg-white/5 flex items-center justify-center text-slate-500 font-bold text-xs shadow-xl overflow-hidden">
                      {top2.avatarUrl ? <img src={top2.avatarUrl} className="w-full h-full object-cover"/> : top2.userName.charAt(0)}
                   </div>
                   <div className="absolute -bottom-2 inset-x-0 flex justify-center"><span className="bg-slate-200 text-slate-700 text-[10px] font-black px-2 py-0.5 rounded-full border-2 border-white dark:border-brand-dark shadow-md">2</span></div>
                </div>
                <p className="text-[10px] font-black mt-4 text-brand-dark dark:text-white truncate w-full text-center">{top2.userName.split(' ')[0]}</p>
                <p className="text-[9px] font-bold text-brand-violet bg-brand-violet/5 px-2 py-0.5 rounded-full mt-1">{top2.score} pts</p>
             </div>
          )}

          {/* 1º Lugar */}
          {top1 && (
             <div className="flex flex-col items-center relative -top-6 group w-1/3">
                <Crown size={24} className="text-amber-400 fill-amber-400 mb-2 animate-bounce drop-shadow-[0_0_10px_rgba(251,191,36,0.4)]" />
                <div className="relative transition-transform group-hover:scale-110 duration-500">
                   <div className="w-20 h-20 rounded-[1.5rem] border-4 border-amber-400 bg-white dark:bg-amber-900/20 flex items-center justify-center text-amber-600 font-black text-2xl shadow-2xl shadow-amber-500/20 overflow-hidden ring-4 ring-amber-400/10">
                      {top1.avatarUrl ? <img src={top1.avatarUrl} className="w-full h-full object-cover"/> : top1.userName.charAt(0)}
                   </div>
                   <div className="absolute -bottom-2.5 inset-x-0 flex justify-center"><span className="bg-gradient-to-r from-amber-400 to-orange-500 text-white text-[11px] font-black px-3 py-1 rounded-full border-2 border-white dark:border-brand-dark shadow-lg">CAMPEÃO</span></div>
                </div>
                <p className="text-xs font-black mt-5 text-brand-dark dark:text-white truncate w-full text-center">{top1.userName.split(' ')[0]}</p>
                <p className="text-[10px] font-black text-amber-600 bg-amber-50 dark:bg-amber-900/40 px-3 py-1 rounded-lg mt-1">{top1.score} pts</p>
             </div>
          )}

          {/* 3º Lugar */}
          {top3 && (
             <div className="flex flex-col items-center group w-1/3">
                <div className="relative transition-transform group-hover:-translate-y-2 duration-500">
                   <div className="w-14 h-14 rounded-[1.25rem] border-2 border-orange-300 bg-white dark:bg-white/5 flex items-center justify-center text-orange-600 font-bold text-xs shadow-xl overflow-hidden">
                      {top3.avatarUrl ? <img src={top3.avatarUrl} className="w-full h-full object-cover"/> : top3.userName.charAt(0)}
                   </div>
                   <div className="absolute -bottom-2 inset-x-0 flex justify-center"><span className="bg-orange-100 text-orange-700 text-[10px] font-black px-2 py-0.5 rounded-full border-2 border-white dark:border-brand-dark shadow-md">3</span></div>
                </div>
                <p className="text-[10px] font-black mt-4 text-brand-dark dark:text-white truncate w-full text-center">{top3.userName.split(' ')[0]}</p>
                <p className="text-[9px] font-bold text-brand-violet bg-brand-violet/5 px-2 py-0.5 rounded-full mt-1">{top3.score} pts</p>
             </div>
          )}
       </div>

       {/* Lista de Seguidores (Outros) */}
       <div className="overflow-y-auto px-4 space-y-2.5 pb-24 no-scrollbar">
          {others?.map((entry) => (
             <div key={entry.id} className="flex items-center gap-4 p-4 rounded-2xl bg-white dark:bg-white/5 border border-slate-50 dark:border-white/5 hover:border-slate-200 dark:hover:border-white/10 transition-all hover:shadow-sm group">
                <span className="w-6 text-center text-xs font-black text-slate-300 group-hover:text-brand-violet transition-colors">{entry.rank}</span>
                <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-[#15191E] flex items-center justify-center text-slate-500 font-bold text-sm border border-slate-100 dark:border-white/5 shadow-inner">
                   {entry.userName.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                   <p className="text-sm font-bold text-brand-dark dark:text-white truncate tracking-tight">{entry.userName}</p>
                   <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Peregrino Fiel</p>
                </div>
                <div className="text-right">
                   <span className="text-xs font-black text-brand-violet">{entry.score}</span>
                   <p className="text-[8px] font-bold text-slate-400 uppercase">Pontos</p>
                </div>
             </div>
          ))}
       </div>

       {/* Sua Posição (Rodapé Fixo no Widget) */}
       {user && (
          <div className="absolute bottom-0 left-0 right-0 p-5 bg-white dark:bg-[#1A1F26] border-t border-slate-100 dark:border-white/10 shadow-[0_-10px_25px_-5px_rgba(0,0,0,0.05)] z-20">
             <div className="flex items-center justify-between mb-3 px-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                   <User size={12} className="text-brand-violet" /> Seu Impacto Real
                </p>
                <div className="flex items-center gap-1.5 bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded-full">
                   <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                   <span className="text-[9px] text-green-600 dark:text-green-400 font-black uppercase">Subindo de Rank</span>
                </div>
             </div>
             
	             <div className="flex items-center gap-4 p-4 rounded-3xl bg-brand-violet text-white shadow-2xl shadow-brand-violet/30 border border-white/20 transform hover:scale-[1.01] transition-all">
	                <span className="text-lg font-black italic opacity-80">#{currentList?.findIndex(e => e.userId === user.id) !== -1 ? (currentList?.findIndex(e => e.userId === user.id) || 0) + 1 : '--'}</span>
	                <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center overflow-hidden border border-white/30 backdrop-blur-md">
	                   {user.photoUrl ? <img src={user.photoUrl} className="w-full h-full object-cover" /> : user.name.charAt(0)}
	                </div>
	                <div className="flex-1 min-w-0">
	                   <p className="text-sm font-black truncate tracking-tight">{user.name}</p>
	                   <div className="w-full bg-black/20 h-1.5 rounded-full mt-1.5 overflow-hidden border border-white/10">
	                      <div className="bg-white h-full transition-all duration-1000 shadow-[0_0_8px_white]" style={{ width: `${Math.min(100, (user.currentXP / user.nextLevelXP) * 100)}%` }} />
	                   </div>
	                </div>
	                <div className="text-center bg-white/10 px-3 py-1.5 rounded-xl border border-white/10">
	                   <span className="block text-sm font-black leading-none">{user.currentXP}</span>
	                   <span className="text-[8px] opacity-80 uppercase font-black tracking-tighter">Pontos</span>
	                </div>
	             </div>
          </div>
       )}

       {/* Modal de Informação */}
       {showInfo && (
          <div className="absolute inset-0 bg-white/98 dark:bg-[#1A1F26]/98 backdrop-blur-md z-50 flex flex-col p-8 animate-fade-in">
             <div className="flex justify-between items-center mb-8">
                <div>
                   <h3 className="font-black text-xl text-brand-dark dark:text-white tracking-tight">Como Pontuar?</h3>
                   <div className="h-1 w-10 bg-brand-violet rounded-full mt-1" />
                </div>
                <button onClick={() => setShowInfo(false)} className="bg-slate-100 dark:bg-white/10 p-2.5 rounded-2xl hover:bg-slate-200 transition-colors"><X size={20} /></button>
             </div>
             
             <p className="text-sm text-slate-600 dark:text-slate-300 mb-8 leading-relaxed font-medium">
                Sua pontuação reflete sua caridade e constância. No Espiritualizei, não competimos contra os irmãos, mas nos incentivamos mutuamente à santidade.
             </p>

             <div className="space-y-4">
                <div className="flex items-center gap-5 bg-slate-50 dark:bg-white/5 p-5 rounded-3xl border border-slate-100 dark:border-white/5 shadow-sm">
                   <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/20 text-orange-500 rounded-2xl flex items-center justify-center shadow-inner">
                      <Flame size={24} fill="currentColor" />
                   </div>
                   <div className="flex-1">
                      <p className="font-black text-brand-dark dark:text-white text-sm">Interceder</p>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">Rezar por uma intenção</p>
                   </div>
                   <span className="font-black text-brand-violet bg-brand-violet/10 px-4 py-2 rounded-xl text-xs">+10</span>
                </div>

                <div className="flex items-center gap-5 bg-slate-50 dark:bg-white/5 p-5 rounded-3xl border border-slate-100 dark:border-white/5 shadow-sm">
                   <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 text-green-600 rounded-2xl flex items-center justify-center shadow-inner">
                      <ShieldCheck size={24} />
                   </div>
                   <div className="flex-1">
                      <p className="font-black text-brand-dark dark:text-white text-sm">Fidelidade</p>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">Concluir rotina do dia</p>
                   </div>
                   <span className="font-black text-brand-violet bg-brand-violet/10 px-4 py-2 rounded-xl text-xs">+50</span>
                </div>

                <div className="flex items-center gap-5 bg-slate-50 dark:bg-white/5 p-5 rounded-3xl border border-slate-100 dark:border-white/5 shadow-sm">
                   <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 text-blue-500 rounded-2xl flex items-center justify-center shadow-inner">
                      <Heart size={24} fill="currentColor" />
                   </div>
                   <div className="flex-1">
                      <p className="font-black text-brand-dark dark:text-white text-sm">Testemunhar</p>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">Partilhar uma graça</p>
                   </div>
                   <span className="font-black text-brand-violet bg-brand-violet/10 px-4 py-2 rounded-xl text-xs">+20</span>
                </div>
             </div>
             
             <button onClick={() => setShowInfo(false)} className="mt-auto w-full bg-brand-dark dark:bg-white text-white dark:text-brand-dark py-4 rounded-2xl font-black text-sm shadow-xl active:scale-95 transition-all">ENTENDIDO</button>
          </div>
       )}
    </div>
  );
};

export default LeaderboardWidget;
