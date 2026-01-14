
import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { CommunityChallenge } from '../types';
import { Calendar, CheckCircle2, ArrowRight, Play, X, BookOpen, Trophy, Share2, Sparkles, Heart, Users, Flame, MessageCircle, ChevronLeft, ChevronRight, ShieldCheck, Quote, Clock } from 'lucide-react';
import BrandLogo from './BrandLogo';

interface LiturgicalEventsProps {
  challenges: CommunityChallenge[];
  onJoin: (id: string, amount?: number) => void; 
  onTestify?: (content: string) => void;
  onExpandChange?: (isExpanded: boolean) => void; 
}

const LiturgicalEvents: React.FC<LiturgicalEventsProps> = ({ challenges, onJoin, onTestify, onExpandChange }) => {
  const safeChallenges = Array.isArray(challenges) ? challenges : [];
  const activeChallenge = safeChallenges.find(c => c.status === 'active');
  
  const [showSession, setShowSession] = useState(false);
  const [showCompletion, setShowCompletion] = useState(false);
  const [step, setStep] = useState(0); 
  const contentRef = useRef<HTMLDivElement>(null);

  const dailyTopics = activeChallenge?.dailyTopics || [];
  const currentDayTopic = dailyTopics[0]; // No novo sistema, o dailyTopic[0] é o desafio do ciclo

  useEffect(() => {
    if (onExpandChange) {
      const timer = setTimeout(() => {
        onExpandChange(!!showSession);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [showSession, onExpandChange]);

  useEffect(() => {
     if (showSession) {
        setStep(0);
        document.body.style.overflow = 'hidden';
     } else {
        document.body.style.overflow = 'unset';
     }
     
     const timer = setTimeout(() => {
        if (contentRef.current) {
           contentRef.current.scrollTo({ top: 0, behavior: 'instant' });
        }
     }, 100);
     return () => {
        clearTimeout(timer);
        document.body.style.overflow = 'unset';
     };
  }, [showSession]);

  if (!activeChallenge || !currentDayTopic) return null;

  const handleComplete = () => {
    onJoin(activeChallenge.id, 1); 
    setShowSession(false);
    setShowCompletion(true);
  };

  const handleShare = () => {
    if (onTestify) {
        // Mensagem mais humanizada e convidativa
        const text = `Concluí o desafio comunitário: "${currentDayTopic.title}".\n\nFoi uma experiência de... [conte aqui brevemente como foi para você]\n\nQue nossa caminhada juntos nos leve à santidade! 🙏✨`;
        onTestify(text);
        setShowCompletion(false);
    }
  };

  const progressPercent = ((activeChallenge.currentDay || 1) / (activeChallenge.totalDays || 3)) * 100;

  const getActionIcon = () => {
      switch (currentDayTopic.actionType) {
          case 'RELATIONSHIP': return <Users size={18} />;
          case 'SACRIFICE': return <Flame size={18} />;
          case 'PRAYER': return <Heart size={18} />;
          default: return <Sparkles size={18} />;
      }
  };

  const getActionLabel = () => {
      switch (currentDayTopic.actionType) {
          case 'RELATIONSHIP': return 'Caridade Real';
          case 'SACRIFICE': return 'Oferta de Amor';
          case 'PRAYER': return 'Intimidade com Deus';
          default: return 'Ação Concreta';
      }
  };

  const getStepAtmosphere = () => {
      switch(step) {
          case 0: return "from-[#1e1b4b] via-[#312e81] to-[#1e1b4b]"; 
          case 1: return "from-[#1a2e05] via-[#365314] to-[#1a2e05]";
          case 2: return "from-[#2e1065] via-[#4c1d95] to-[#2e1065]";
          default: return "bg-[#15191E]";
      }
  };

  const renderStepContent = () => {
     switch(step) {
        case 0: // INSPIRAÇÃO
           return (
              <div className="flex flex-col items-center text-center space-y-8 animate-fade-in w-full max-w-2xl mx-auto py-4">
                 <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-white/10 flex items-center justify-center text-white shadow-2xl shrink-0 border border-white/20 backdrop-blur-md relative overflow-hidden group mt-4">
                    <div className="absolute inset-0 bg-white/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                    <BrandLogo className="w-10 h-10 md:w-12 md:h-12 relative z-10 text-white" variant="outline" />
                 </div>
                 
                 <div className="space-y-4">
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/70 block bg-white/5 px-3 py-1 rounded-full w-fit mx-auto border border-white/10">Reflexão para sua Alma</span>
                    <h3 className="text-3xl md:text-5xl font-black text-white px-4 drop-shadow-2xl tracking-tight leading-tight">
                       {currentDayTopic.title}
                    </h3>
                    <p className="text-white/90 text-lg md:text-2xl leading-relaxed font-medium px-4 max-w-lg mx-auto italic">
                       {currentDayTopic.description}
                    </p>
                 </div>

                 {currentDayTopic.scripture && (
                    <div className="bg-black/20 p-6 md:p-8 rounded-3xl border border-white/10 relative w-full text-left backdrop-blur-md mt-4 max-w-md mx-auto">
                       <Quote className="absolute top-4 left-4 text-white/10 w-8 h-8" />
                       <p className="font-serif italic text-white text-base md:text-xl leading-relaxed relative z-10 text-center pt-2">
                          "{currentDayTopic.scripture}"
                       </p>
                    </div>
                 )}
              </div>
           );
        case 1: // AÇÃO PRÁTICA
           return (
              <div className="flex flex-col space-y-8 animate-fade-in w-full max-w-2xl mx-auto py-4">
                 <div className="flex items-center gap-5 bg-white/5 p-6 rounded-[2rem] border border-white/5 backdrop-blur-sm">
                    <div className="w-16 h-16 rounded-2xl bg-white/10 text-white flex items-center justify-center shrink-0 border border-white/20 shadow-lg">
                       <Play className="w-8 h-8 fill-current" />
                    </div>
                    <div>
                       <h3 className="text-2xl font-bold text-white tracking-tight">O passo concreto</h3>
                       <p className="text-sm text-white/60">Como santificar sua realidade hoje.</p>
                    </div>
                 </div>
                 
                 <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-10 shadow-inner relative overflow-hidden backdrop-blur-md min-h-[250px] flex flex-col justify-center text-center">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
                    <p className="text-white text-xl md:text-3xl leading-relaxed font-medium relative z-10 font-sans">
                       {currentDayTopic.actionContent}
                    </p>
                 </div>
                 
                 <div className="flex items-center justify-center gap-4 p-5 bg-black/20 rounded-2xl border border-white/5 text-center">
                    <ShieldCheck className="w-6 h-6 text-green-400 shrink-0" />
                    <p className="text-sm text-white/70 leading-snug font-medium">
                       Esta ação impacta sua vida real: família, amigos e deveres diários.
                    </p>
                 </div>
              </div>
           );
        case 2: // COMPROMISSO
           return (
              <div className="flex flex-col items-center text-center space-y-10 animate-fade-in w-full max-w-2xl mx-auto py-8">
                 <div className="relative shrink-0 flex items-center justify-center">
                    <div className="absolute inset-0 bg-brand-violet/40 blur-[80px] rounded-full animate-pulse-slow" />
                    <div className="relative z-10 transform scale-125">
                       <BrandLogo size={80} variant="fill" className="text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.4)]" />
                    </div>
                 </div>
                 
                 <div className="space-y-6">
                    <h3 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-tight">Selar Compromisso</h3>
                    <p className="text-white/80 text-lg md:text-2xl leading-relaxed italic font-serif bg-black/20 p-8 rounded-[2rem] border border-white/5">
                       "Senhor, que este ato não seja para minha glória, mas para a Tua. Ensina-me a amar meus irmãos como Tu me amas."
                    </p>
                 </div>

                 <div className="w-full bg-white/5 rounded-3xl p-6 border border-white/10 flex justify-between items-center px-8">
                    <div className="text-left">
                       <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest block mb-1">Caminhada da Alma</span>
                       <div className="flex items-center gap-3 text-amber-400 font-bold text-2xl">
                          <Trophy className="w-7 h-7" /> +50 XP
                       </div>
                    </div>
                    <div className="h-10 w-px bg-white/10" />
                    <div className="text-right">
                       <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest block mb-1">Membros Unidos</span>
                       <p className="text-white font-bold text-xl">{activeChallenge.participants} participando</p>
                    </div>
                 </div>
              </div>
           );
        default: return null;
     }
  };

  const ModalPortal = () => {
     if (!showSession) return null;

     return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-end md:items-center justify-center">
           <div className="absolute inset-0 bg-black/95 backdrop-blur-2xl animate-fade-in" onClick={() => setShowSession(false)} />
           
           <div className={`relative w-full h-full md:h-auto md:max-h-[95vh] md:max-w-4xl md:rounded-[3rem] flex flex-col overflow-hidden animate-slide-up shadow-2xl transition-colors duration-1000 bg-gradient-to-br ${getStepAtmosphere()} border border-white/10`}>
              
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30 pointer-events-none mix-blend-overlay" />

              <div className="shrink-0 px-8 pt-12 pb-6 md:p-10 flex justify-between items-center relative z-20">
                 <div className="flex-1 flex gap-3 mr-12">
                    {[0,1,2].map(i => (
                       <div key={i} className="h-1.5 flex-1 bg-white/10 rounded-full overflow-hidden backdrop-blur-md border border-white/5">
                          <div className={`h-full bg-white shadow-[0_0_10px_white] transition-all duration-700 ease-out ${i <= step ? 'w-full' : 'w-0'}`} />
                       </div>
                    ))}
                 </div>
                 <button onClick={() => setShowSession(false)} className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-all shrink-0 backdrop-blur-md border border-white/10">
                    <X size={24} />
                 </button>
              </div>

              <div ref={contentRef} className="flex-1 overflow-y-auto overflow-x-hidden relative z-10 scrollbar-hide px-8 md:px-16 pb-40 md:pb-20">
                 {renderStepContent()}
              </div>

              <div className="shrink-0 p-8 pb-12 md:p-10 relative z-20 bg-gradient-to-t from-black/60 to-transparent flex gap-4">
                 {step > 0 && (
                    <button onClick={() => setStep(step - 1)} className="w-16 h-16 rounded-2xl font-bold text-white hover:bg-white/10 transition-colors flex items-center justify-center bg-white/10 backdrop-blur-md border border-white/10 shrink-0 active:scale-95">
                       <ChevronLeft size={32} />
                    </button>
                 )}
                 
                 {step < 2 ? (
                    <button onClick={() => setStep(step + 1)} className="flex-1 bg-white text-brand-dark font-black h-16 rounded-2xl shadow-2xl hover:scale-[1.02] transition-all flex items-center justify-center gap-3 active:scale-95 text-xl tracking-tight group">
                       Próximo Passo <ChevronRight size={24} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                 ) : (
                    <button onClick={handleComplete} className="flex-1 bg-gradient-to-r from-brand-violet to-purple-600 text-white font-black h-16 rounded-2xl shadow-[0_0_30px_rgba(167,139,250,0.5)] hover:scale-[1.02] transition-all flex items-center justify-center gap-3 active:scale-95 text-xl tracking-tight animate-pulse-slow">
                       Confirmar Entrega <CheckCircle2 size={28} />
                    </button>
                 )}
              </div>
           </div>
        </div>,
        document.body
     );
  };

  return (
    <div className="mb-8 animate-slide-up">
      <div className="relative w-full rounded-[2.5rem] overflow-hidden bg-gradient-to-br from-[#1A1F26] via-[#2A2E35] to-[#1A1F26] shadow-2xl border border-white/5 group isolate transition-all hover:shadow-brand-violet/10">
         <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10 pointer-events-none mix-blend-overlay" />
         
         <div className="relative z-10 flex flex-col md:flex-row items-stretch md:items-center justify-between p-8 sm:p-12 gap-8">
            <div className="flex-1 flex flex-col gap-6 max-w-2xl">
               <div className="flex flex-wrap items-center gap-3">
                  <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-full pl-1.5 pr-4 py-1.5 flex items-center gap-3 shadow-sm">
                     <div className="bg-brand-violet text-white w-8 h-8 rounded-full flex items-center justify-center text-xs font-black shadow-lg">#{activeChallenge.currentDay}</div>
                     <span className="text-xs font-bold text-white uppercase tracking-widest">Jornada Litúrgica</span>
                  </div>
                  <div className="bg-amber-400/10 backdrop-blur-md border border-amber-400/20 rounded-full px-4 py-1.5 flex items-center gap-2 text-amber-200">
                     {getActionIcon()}
                     <span className="text-xs font-bold uppercase tracking-widest">{getActionLabel()}</span>
                  </div>
                  <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-full px-4 py-1.5 flex items-center gap-2 text-white/50">
                     <Clock size={14} />
                     <span className="text-[10px] font-bold uppercase tracking-widest">Ciclo de {activeChallenge.totalDays} dias</span>
                  </div>
               </div>
               
               <div className="space-y-3">
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-[0.2em]">O Desafio Atual</p>
                  <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white leading-tight tracking-tight drop-shadow-md">
                     {currentDayTopic.title}
                  </h2>
                  <p className="text-slate-300 text-base sm:text-xl font-medium leading-relaxed max-w-xl opacity-90">
                     {currentDayTopic.description}
                  </p>
               </div>

               <div className="w-full max-w-md">
                  <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 px-1">
                     <span>Progresso no Ciclo</span>
                     <span>{Math.round(progressPercent)}%</span>
                  </div>
                  <div className="h-2 w-full bg-black/40 rounded-full overflow-hidden">
                     <div className="h-full bg-brand-violet shadow-[0_0_15px_rgba(167,139,250,0.6)] relative transition-all duration-1000" style={{ width: `${progressPercent}%` }}>
                        <div className="absolute right-0 top-0 bottom-0 w-1 bg-white/30" />
                     </div>
                  </div>
                  <p className="text-[9px] text-slate-500 mt-2 font-bold uppercase tracking-wider italic">Próximo desafio em: {activeChallenge.daysLeft} dias</p>
               </div>
            </div>

            <div className="shrink-0">
               <button 
                  onClick={() => !currentDayTopic.isCompleted && setShowSession(true)}
                  disabled={currentDayTopic.isCompleted}
                  className={`relative overflow-hidden w-full md:w-auto px-10 py-5 rounded-[2rem] font-black text-lg shadow-2xl flex items-center justify-center gap-3 transition-all transform active:scale-95 group/btn ${
                     currentDayTopic.isCompleted ? 'bg-white/5 border border-white/5 text-white/30 cursor-default' : 'bg-white text-brand-dark hover:scale-105 hover:shadow-brand-violet/20'
                  }`}
               >
                  {currentDayTopic.isCompleted ? (
                     <span className="flex items-center gap-2">Gesto Concluido <CheckCircle2 size={24} /></span>
                  ) : (
                     <>
                        <span className="relative z-10 flex items-center gap-2">Aceitar Missão <Play size={24} fill="currentColor" /></span>
                        <div className="absolute top-0 -left-[100%] w-full h-full bg-gradient-to-r from-transparent via-brand-violet/20 to-transparent transform skew-x-12 group-hover/btn:animate-shimmer" />
                     </>
                  )}
               </button>
            </div>
         </div>
      </div>

      <ModalPortal />

      {showCompletion && (
         <div className="fixed inset-0 z-[10000] flex items-center justify-center p-6">
            <div className="absolute inset-0 bg-black/95 backdrop-blur-xl animate-fade-in" onClick={() => setShowCompletion(false)} />
            <div className="relative w-full max-w-sm bg-[#1A1F26] p-10 rounded-[3rem] shadow-[0_0_50px_rgba(0,0,0,0.5)] animate-bounce-in text-center border border-white/10 overflow-hidden">
               <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30 pointer-events-none" />
               <div className="relative z-10">
                  <div className="w-24 h-24 bg-green-500/10 text-green-400 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner border border-green-500/20">
                     <Trophy size={48} className="drop-shadow-lg" />
                  </div>
                  <h3 className="text-3xl font-black text-white mb-3">Deus seja louvado!</h3>
                  <p className="text-slate-400 text-sm mb-8 leading-relaxed">
                     Sua fidelidade nas pequenas coisas do cotidiano edifica toda a nossa Igreja.
                  </p>
                  <div className="space-y-4">
                     <button onClick={handleShare} className="w-full py-4 rounded-2xl bg-gradient-to-r from-brand-violet to-purple-600 text-white font-bold hover:shadow-lg hover:scale-[1.02] transition-all flex items-center justify-center gap-3 shadow-brand-violet/20">
                        <MessageCircle size={20} /> Compartilhar com a Comunidade
                     </button>
                     <button onClick={() => setShowCompletion(false)} className="w-full py-3 text-slate-500 text-sm font-bold hover:text-white transition-colors">
                        Apenas Concluir
                     </button>
                  </div>
               </div>
            </div>
         </div>
      )}
    </div>
  );
};

export default LiturgicalEvents;
