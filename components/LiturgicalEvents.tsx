
import React, { useState, useEffect } from 'react';
import { CommunityChallenge } from '../types';
import { Calendar, Flag, Users, Sparkles, Flame, Heart, Plus, Trophy, CheckCircle2, Lock, ChevronRight, Share2, ArrowRight } from 'lucide-react';

interface LiturgicalEventsProps {
  challenges: CommunityChallenge[];
  onJoin: (id: string, amount?: number) => void; 
  onTestify?: (content: string) => void; // New prop for feedback loop
}

const LiturgicalEvents: React.FC<LiturgicalEventsProps> = ({ challenges, onJoin, onTestify }) => {
  const activeChallenge = challenges.find(c => c.status === 'active');
  const upcomingChallenges = challenges.filter(c => c.status === 'upcoming');
  
  const [animatePulse, setAnimatePulse] = useState(false);
  const [currentTickerIndex, setCurrentTickerIndex] = useState(0);
  const [showCompletionModal, setShowCompletionModal] = useState(false);

  // Live Pulse Ticker Effect
  useEffect(() => {
    if (activeChallenge?.recentActivity && activeChallenge.recentActivity.length > 0) {
      const interval = setInterval(() => {
        setCurrentTickerIndex((prev) => (prev + 1) % (activeChallenge.recentActivity?.length || 1));
        setAnimatePulse(true);
        setTimeout(() => setAnimatePulse(false), 1000);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [activeChallenge]);

  const handleCompleteDay = () => {
    if (activeChallenge) {
      onJoin(activeChallenge.id, 1); 
      setShowCompletionModal(true); // Open celebration modal
    }
  };

  const handleShareTestimony = () => {
    if (onTestify && activeChallenge) {
        const topic = activeChallenge.dailyTopics?.find(t => t.day === activeChallenge.currentDay);
        const text = `Completei o Dia ${activeChallenge.currentDay} da ${activeChallenge.title}! \n\nTema: "${topic?.title}". \n\nSenti que...`;
        onTestify(text);
        setShowCompletionModal(false);
    }
  };

  const currentActivity = activeChallenge?.recentActivity?.[currentTickerIndex];
  const currentDayTopic = activeChallenge?.dailyTopics?.find(t => t.day === activeChallenge.currentDay);

  return (
    <div className="space-y-6 animate-slide-up relative">
      
      {/* --- Active Journey (Hero) --- */}
      {activeChallenge && (
        <div className="relative overflow-hidden rounded-[2.5rem] bg-white dark:bg-brand-dark shadow-float border border-slate-100 dark:border-white/10 group transition-all">
          {/* Dynamic Background Theme */}
          <div 
            className="absolute inset-0 opacity-10 dark:opacity-20 transition-opacity" 
            style={{ backgroundColor: activeChallenge.seasonColor }} 
          />
          
          {/* Decorative Glows */}
          <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full blur-[100px] opacity-30 animate-pulse-slow" style={{ backgroundColor: activeChallenge.seasonColor }} />
          <div className="absolute -left-20 -bottom-20 w-64 h-64 rounded-full blur-[80px] opacity-20" style={{ backgroundColor: activeChallenge.seasonColor }} />

          <div className="relative z-10 p-6 sm:p-8">
             
             {/* Header: Season Badge & Ticker */}
             <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2 bg-white/60 dark:bg-black/30 px-3 py-1.5 rounded-full backdrop-blur-md border border-white/20 shadow-sm">
                   <Sparkles size={14} className="text-brand-dark dark:text-white" />
                   <span className="text-[10px] font-bold uppercase tracking-widest text-brand-dark dark:text-white">
                     Jornada Espiritual
                   </span>
                </div>
                
                {currentActivity && (
                  <div className={`hidden sm:flex items-center gap-2 transition-opacity duration-500 ${animatePulse ? 'opacity-50' : 'opacity-100'}`}>
                     <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                     <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                       <span className="font-bold text-brand-dark dark:text-white">{currentActivity.user}</span> completou o dia
                     </p>
                  </div>
                )}
             </div>

             {/* Title & Progress Context */}
             <div className="mb-8">
               <h2 className="text-3xl sm:text-4xl font-extrabold text-brand-dark dark:text-white mb-2 leading-tight tracking-tight drop-shadow-sm">
                 {activeChallenge.title}
               </h2>
               <div className="flex items-center gap-3 text-sm font-medium text-slate-500 dark:text-slate-400">
                  <Users size={16} />
                  <span>{(activeChallenge.participants / 1000).toFixed(1)}k peregrinos caminhando juntos</span>
               </div>
             </div>

             {/* --- THE DAILY CARD (Innovation) --- */}
             {currentDayTopic ? (
               <div className="bg-white/80 dark:bg-black/40 rounded-3xl p-6 border border-white/40 dark:border-white/5 backdrop-blur-sm shadow-lg mb-8 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1.5 h-full" style={{ backgroundColor: activeChallenge.seasonColor }} />
                  
                  <div className="flex justify-between items-start mb-3">
                     <span className="text-xs font-black uppercase tracking-widest text-brand-violet bg-brand-violet/10 px-2 py-1 rounded">
                        Dia {currentDayTopic.day} de {activeChallenge.totalDays}
                     </span>
                     {currentDayTopic.isCompleted && (
                        <div className="flex items-center gap-1 text-green-600 dark:text-green-400 text-xs font-bold">
                           <CheckCircle2 size={14} /> Completado
                        </div>
                     )}
                  </div>

                  <h3 className="text-xl font-bold text-brand-dark dark:text-white mb-2">
                     {currentDayTopic.title}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-4">
                     {currentDayTopic.description}
                  </p>
                  
                  {currentDayTopic.action && (
                     <div className="mb-6 p-3 bg-brand-violet/5 dark:bg-white/5 rounded-xl border border-brand-violet/10 flex gap-3 items-start">
                        <div className="mt-0.5 text-brand-violet"><Flag size={16} /></div>
                        <div>
                           <p className="text-xs font-bold text-brand-violet uppercase mb-0.5">Ação Concreta</p>
                           <p className="text-xs text-slate-600 dark:text-slate-300 italic">{currentDayTopic.action}</p>
                        </div>
                     </div>
                  )}

                  {!currentDayTopic.isCompleted ? (
                     <button 
                        onClick={handleCompleteDay}
                        className="w-full py-3.5 rounded-xl font-bold text-white shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 hover:brightness-110 hover:shadow-xl relative overflow-hidden group"
                        style={{ backgroundColor: activeChallenge.seasonColor }}
                     >
                        <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:animate-[shimmer_1s_infinite]" />
                        <Flame size={18} className="animate-pulse" /> 
                        {activeChallenge.isUserParticipating ? 'Concluir Dia' : 'Aceitar Desafio & Começar'}
                     </button>
                  ) : (
                     <div className="w-full py-3.5 rounded-xl bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 font-bold flex items-center justify-center gap-2 border border-green-200 dark:border-green-900/50">
                        <CheckCircle2 size={18} /> Dia Concluído
                     </div>
                  )}
               </div>
             ) : (
               <div className="mb-8">
                  <p className="text-slate-500">Carregando jornada...</p>
               </div>
             )}

             {/* --- Journey Timeline --- */}
             <div className="relative">
                <div className="flex justify-between items-end mb-3 px-1">
                   <span className="text-xs font-bold uppercase text-slate-400 tracking-widest">Seu Caminho</span>
                   <span className="text-xs font-bold text-brand-dark dark:text-white">
                      {((activeChallenge.userContribution / (activeChallenge.totalDays || 1)) * 100).toFixed(0)}% Concluído
                   </span>
                </div>
                
                <div className="flex gap-1.5 h-2 mb-2">
                   {Array.from({ length: Math.min(10, activeChallenge.totalDays || 10) }).map((_, idx) => {
                      const dayNum = idx + 1;
                      const isDone = dayNum < (currentDayTopic?.day || 1);
                      const isCurrent = dayNum === (currentDayTopic?.day || 1);
                      
                      return (
                         <div 
                           key={idx} 
                           className={`flex-1 rounded-full transition-all duration-500 ${
                              isDone 
                                ? 'bg-green-500' 
                                : isCurrent 
                                   ? 'bg-brand-violet animate-pulse' 
                                   : 'bg-slate-200 dark:bg-white/10'
                           }`}
                         />
                      );
                   })}
                </div>
             </div>

          </div>
        </div>
      )}

      {/* --- Upcoming Events --- */}
      {upcomingChallenges.length > 0 && (
        <div className="pt-4">
          <div className="flex items-center gap-2 mb-4 px-1">
            <Calendar size={18} className="text-slate-400" />
            <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Em Breve</h3>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
            {upcomingChallenges.map(challenge => (
              <div 
                key={challenge.id}
                className="min-w-[280px] bg-white dark:bg-white/5 p-5 rounded-2xl border border-slate-100 dark:border-white/10 shadow-sm relative group overflow-hidden opacity-80 hover:opacity-100 transition-all hover:-translate-y-1"
              >
                 <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center mb-3 text-slate-500">
                    <Calendar size={18} />
                 </div>
                 <h4 className="font-bold text-brand-dark dark:text-white text-lg mb-1">{challenge.title}</h4>
                 <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 line-clamp-2 leading-relaxed">{challenge.description}</p>
                 <div className="flex items-center justify-between mt-auto">
                    <span className="text-xs font-bold text-brand-violet bg-brand-violet/10 px-2 py-1 rounded">Pré-inscrição</span>
                    <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                       Inicia {new Date(challenge.startDate).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })}
                    </span>
                 </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- COMPLETION MODAL (THE TESTIMONY CYCLE) --- */}
      {showCompletionModal && activeChallenge && (
         <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <div className="absolute inset-0 bg-brand-dark/90 backdrop-blur-md animate-fade-in" onClick={() => setShowCompletionModal(false)} />
            <div className="relative w-full max-w-sm bg-white dark:bg-brand-dark p-8 rounded-[2rem] shadow-2xl animate-scale-in text-center border border-white/10">
               
               <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-500/20">
                  <Trophy size={40} className="animate-bounce" />
               </div>
               
               <h3 className="text-2xl font-bold text-brand-dark dark:text-white mb-2">Dia Concluído!</h3>
               <p className="text-slate-500 dark:text-slate-400 text-sm mb-8 leading-relaxed">
                  Você deu mais um passo. A comunidade se alegra com sua constância. Que tal inspirar alguém?
               </p>

               <div className="flex flex-col gap-3">
                  <button 
                     onClick={handleShareTestimony}
                     className="w-full py-4 rounded-xl bg-brand-violet text-white font-bold shadow-lg shadow-brand-violet/30 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                     <Share2 size={18} /> Compartilhar Graça
                  </button>
                  <button 
                     onClick={() => setShowCompletionModal(false)}
                     className="w-full py-4 rounded-xl bg-slate-50 dark:bg-white/5 text-slate-500 font-bold hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
                  >
                     Continuar em Silêncio
                  </button>
               </div>
            </div>
         </div>
      )}
    </div>
  );
};

export default LiturgicalEvents;
