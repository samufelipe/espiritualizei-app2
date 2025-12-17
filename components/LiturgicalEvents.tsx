
import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { CommunityChallenge } from '../types';
import { Calendar, CheckCircle2, ArrowRight, Play, X, BookOpen, Trophy, Share2, Sparkles, Heart, Users, Flame, MessageCircle, ChevronLeft, ChevronRight, ShieldCheck, Quote } from 'lucide-react';
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
  const currentDay = activeChallenge?.currentDay || 1;
  const currentDayTopic = dailyTopics.find(t => t.day === currentDay);

  useEffect(() => {
    if (onExpandChange) {
      const timer = setTimeout(() => {
        onExpandChange(!!showSession);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [showSession, onExpandChange]);

  // RESET SCROLL ROBUSTO
  useEffect(() => {
     if (showSession) {
        setStep(0);
        // Bloquear scroll do corpo principal
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

  useEffect(() => {
     const timer = setTimeout(() => {
        if (contentRef.current) {
           contentRef.current.scrollTo({ top: 0, behavior: 'smooth' });
        }
     }, 50);
     return () => clearTimeout(timer);
  }, [step]);

  if (!activeChallenge || !currentDayTopic) return null;

  const handleComplete = () => {
    onJoin(activeChallenge.id, 1); 
    setShowSession(false);
    setShowCompletion(true);
  };

  const handleShare = () => {
    if (onTestify) {
        const actionLabel = currentDayTopic.actionType === 'RELATIONSHIP' ? 'de caridade' : currentDayTopic.actionType === 'SACRIFICE' ? 'de sacrifício' : 'espiritual';
        const text = `Hoje venci o desafio do dia ${activeChallenge.currentDay}: "${currentDayTopic.title}".\n\nFoi um ato ${actionLabel} que ofereci por todos aqui. Vamos juntos! 🔥`;
        onTestify(text);
        setShowCompletion(false);
    }
  };

  const progressPercent = ((activeChallenge.currentDay || 1) / (activeChallenge.totalDays || 30)) * 100;

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
          case 'RELATIONSHIP': return 'Caridade Fraterna';
          case 'SACRIFICE': return 'Pequeno Sacrifício';
          case 'PRAYER': return 'Vida de Oração';
          default: return 'Desafio do Dia';
      }
  };

  const getStepAtmosphere = () => {
      switch(step) {
          case 0: return "from-[#0f172a] via-[#1e1b4b] to-[#312e81]"; 
          case 1: return "from-[#2a1205] via-[#431407] to-[#7c2d12]";
          case 2: return "from-[#1e052a] via-[#3b0764] to-[#581c87]";
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
                 
                 <div>
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/70 mb-3 block bg-white/5 px-3 py-1 rounded-full w-fit mx-auto border border-white/10">O Propósito</span>
                    <h3 className="text-2xl md:text-4xl font-extrabold text-white mb-4 leading-tight px-4 drop-shadow-xl tracking-tight">
                       {currentDayTopic.title}
                    </h3>
                    <p className="text-white/80 text-base md:text-xl leading-relaxed font-medium px-4 max-w-lg mx-auto">
                       {currentDayTopic.description}
                    </p>
                 </div>

                 {currentDayTopic.scripture && (
                    <div className="bg-black/20 p-6 md:p-8 rounded-3xl border border-white/10 relative w-full text-left backdrop-blur-md mt-4">
                       <Quote className="absolute top-6 left-6 text-white/20 w-8 h-8" />
                       <p className="font-serif italic text-white text-base md:text-xl leading-relaxed relative z-10 px-4 text-center md:text-left pt-6">
                          "{currentDayTopic.scripture}"
                       </p>
                    </div>
                 )}
              </div>
           );
        case 1: // AÇÃO PRÁTICA
           return (
              <div className="flex flex-col space-y-6 animate-fade-in w-full max-w-2xl mx-auto py-4">
                 <div className="flex items-center gap-5 bg-white/5 p-5 rounded-3xl border border-white/5 backdrop-blur-sm">
                    <div className="w-14 h-14 rounded-2xl bg-white/10 text-white flex items-center justify-center shrink-0 border border-white/20 shadow-lg">
                       <BookOpen className="w-7 h-7" strokeWidth={1.5} />
                    </div>
                    <div>
                       <h3 className="text-xl font-bold text-white">Instruções</h3>
                       <p className="text-sm text-white/60">Passo a passo para sua santificação hoje</p>
                    </div>
                 </div>
                 
                 <div className="bg-black/20 border border-white/10 rounded-3xl p-8 shadow-inner relative overflow-hidden backdrop-blur-md min-h-[200px] flex flex-col justify-center">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
                    <div className="prose prose-invert prose-p:text-white/90 prose-p:text-lg md:prose-p:text-2xl prose-p:leading-relaxed max-w-none relative z-10 font-sans text-center md:text-left">
                       <p className="whitespace-pre-line">{currentDayTopic.actionContent || "Realize este ato com amor e intenção."}</p>
                    </div>
                 </div>
                 
                 <div className="flex items-center justify-center gap-3 p-4 bg-white/5 rounded-2xl border border-white/5 text-center">
                    <Users className="w-5 h-5 text-white/70 shrink-0" />
                    <p className="text-sm text-white/70 leading-snug font-medium">
                       Ao realizar este ato, você se une a {activeChallenge.participants} outros membros.
                    </p>
                 </div>
              </div>
           );
        case 2: // COMPROMISSO
           return (
              <div className="flex flex-col items-center text-center space-y-8 animate-fade-in w-full max-w-2xl mx-auto py-8">
                 <div className="relative shrink-0 flex items-center justify-center py-6">
                    {/* Efeito Glow Ambiente - Mais suave */}
                    <div className="absolute inset-0 bg-brand-violet/40 blur-[70px] rounded-full animate-pulse-slow" />
                    
                    {/* Ícone Cruz Latina Minimalista (SVG Customizado) */}
                    <div className="relative z-10 transform hover:scale-105 transition-transform duration-700">
                       <svg 
                          width="120" 
                          height="120" 
                          viewBox="0 0 24 24" 
                          fill="none" 
                          xmlns="http://www.w3.org/2000/svg"
                          className="text-white drop-shadow-[0_0_25px_rgba(255,255,255,0.6)]"
                       >
                          {/* Cruz Latina: Vertical longa, Horizontal mais curta e alta */}
                          <path 
                             d="M12 2V22M7 8H17" 
                             stroke="currentColor" 
                             strokeWidth="1" 
                             strokeLinecap="round" 
                             strokeLinejoin="round"
                          />
                       </svg>
                    </div>
                 </div>
                 
                 <div>
                    <h3 className="text-3xl md:text-4xl font-bold text-white mb-6 drop-shadow-md">Aceita a missão?</h3>
                    <div className="bg-white/10 border border-white/10 rounded-3xl p-6 relative backdrop-blur-sm">
                       <p className="text-white text-lg md:text-xl leading-relaxed italic font-serif">
                          "Senhor, dai-me a graça de realizar este pequeno ato de amor por Ti e pelos meus irmãos."
                       </p>
                    </div>
                 </div>

                 <div className="w-full bg-black/20 rounded-3xl p-5 border border-white/10 flex flex-col gap-4">
                    <div className="flex justify-between items-center text-xs font-bold text-white/50 uppercase tracking-widest px-2">
                       <span>Recompensa</span>
                       <span>Status</span>
                    </div>
                    <div className="flex justify-between items-center px-2">
                       <div className="flex items-center gap-3 text-amber-400 font-bold text-xl">
                          <Trophy className="w-6 h-6" /> 50 XP
                       </div>
                       <div className="flex items-center gap-2 text-white/90 text-sm bg-white/10 px-4 py-2 rounded-full border border-white/10 font-bold">
                          Aguardando Confirmação <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                       </div>
                    </div>
                 </div>
              </div>
           );
        default: return null;
     }
  };

  // --- RENDER DO MODAL VIA PORTAL ---
  const ModalPortal = () => {
     if (!showSession) return null;

     return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-end md:items-center justify-center">
           {/* Backdrop */}
           <div className="absolute inset-0 bg-black/90 backdrop-blur-xl animate-fade-in" onClick={() => setShowSession(false)} />
           
           {/* Content Container */}
           <div className={`relative w-full h-full md:h-auto md:max-h-[90vh] md:max-w-3xl md:rounded-[3rem] bg-brand-dark flex flex-col overflow-hidden animate-slide-up shadow-2xl transition-colors duration-1000 bg-gradient-to-br ${getStepAtmosphere()}`}>
              
              {/* Decorative Texture */}
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30 pointer-events-none mix-blend-overlay" />

              {/* --- HEADER --- */}
              <div className="shrink-0 px-6 pt-12 pb-4 md:p-8 flex justify-between items-center relative z-20 bg-gradient-to-b from-black/40 to-transparent">
                 <div className="flex-1 flex gap-2 mr-8">
                    {[0,1,2].map(i => (
                       <div key={i} className="h-1.5 flex-1 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm">
                          <div className={`h-full bg-white transition-all duration-700 ease-out ${i <= step ? 'w-full' : 'w-0'}`} />
                       </div>
                    ))}
                 </div>
                 <button 
                   onClick={() => setShowSession(false)} 
                   className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-all shrink-0 backdrop-blur-md"
                 >
                    <X size={20} />
                 </button>
              </div>

              {/* --- BODY (SCROLLABLE) --- */}
              <div ref={contentRef} className="flex-1 overflow-y-auto overflow-x-hidden relative z-10 scrollbar-hide px-6 md:px-10 pb-32 md:pb-10">
                 {renderStepContent()}
              </div>

              {/* --- FOOTER (FIXED BOTTOM) --- */}
              <div className="shrink-0 p-6 pb-8 md:p-8 relative z-20 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex gap-4">
                 {step > 0 && (
                    <button 
                       onClick={() => setStep(step - 1)}
                       className="w-14 h-14 rounded-2xl font-bold text-white hover:bg-white/10 transition-colors flex items-center justify-center bg-white/10 backdrop-blur-md border border-white/10 shrink-0 active:scale-95"
                    >
                       <ChevronLeft size={24} />
                    </button>
                 )}
                 
                 {step < 2 ? (
                    <button 
                       onClick={() => setStep(step + 1)}
                       className="flex-1 bg-white text-brand-dark font-bold h-14 rounded-2xl shadow-xl hover:bg-slate-200 transition-all flex items-center justify-center gap-2 active:scale-95 text-lg tracking-wide group"
                    >
                       Próximo <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                 ) : (
                    <button 
                       onClick={handleComplete}
                       className="flex-1 bg-white text-brand-violet font-bold h-14 rounded-2xl shadow-xl hover:bg-slate-100 transition-all flex items-center justify-center gap-2 active:scale-95 animate-pulse-slow text-lg tracking-wide"
                    >
                       Confirmar Missão <CheckCircle2 size={24} />
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
      {/* CARD PRINCIPAL (COLLAPSED) */}
      <div className="relative w-full rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden bg-gradient-to-br from-[#4C1D95] via-[#6D28D9] to-[#8B5CF6] shadow-2xl shadow-brand-violet/30 group border border-white/10 isolate">
         <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/5 rounded-full blur-[80px] -mr-32 -mt-32 pointer-events-none mix-blend-overlay" />
         <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 pointer-events-none mix-blend-overlay" />

         <div className="relative z-10 flex flex-col md:flex-row items-stretch md:items-center justify-between p-6 sm:p-10 gap-6 sm:gap-12">
            <div className="flex-1 flex flex-col gap-4 max-w-2xl">
               <div className="flex flex-wrap items-center gap-2">
                  <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-full pl-1 pr-3 py-1 flex items-center gap-2 shadow-sm">
                     <div className="bg-white text-brand-violet w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black">{activeChallenge.currentDay}</div>
                     <span className="text-[10px] font-bold text-white uppercase tracking-wider">Dia da Jornada</span>
                  </div>
                  <div className="bg-amber-400/20 backdrop-blur-md border border-amber-400/20 rounded-full px-3 py-1 flex items-center gap-1.5 shadow-sm text-amber-100">
                     {getActionIcon()}
                     <span className="text-[10px] font-bold uppercase tracking-wider">{getActionLabel()}</span>
                  </div>
                  {currentDayTopic.isCompleted && (
                     <span className="bg-green-500/90 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-widest flex items-center gap-1.5 shadow-lg border border-white/10">
                        <CheckCircle2 size={12} strokeWidth={3} /> Concluído
                     </span>
                  )}
               </div>
               
               <div>
                  <p className="text-purple-200 text-xs font-bold uppercase tracking-widest mb-1 opacity-80">Sua Missão de Hoje</p>
                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white leading-[1.1] tracking-tight drop-shadow-sm mb-3">
                     {currentDayTopic.title}
                  </h2>
                  <div className="pl-4 border-l-2 border-white/30">
                     <p className="text-purple-100 text-sm sm:text-base font-medium leading-relaxed opacity-90 line-clamp-2">
                        <span className="font-bold text-white opacity-100">Propósito:</span> {currentDayTopic.description}
                     </p>
                  </div>
               </div>

               <div className="w-full max-w-md mt-1">
                  <div className="flex justify-between text-[10px] font-bold text-purple-200 uppercase tracking-wider mb-1.5 px-1">
                     <span>Caminhada da Comunidade</span>
                     <span>{Math.round(progressPercent)}%</span>
                  </div>
                  <div className="h-2 w-full bg-black/20 rounded-full overflow-hidden backdrop-blur-sm">
                     <div className="h-full bg-gradient-to-r from-green-300 to-green-500 shadow-[0_0_15px_rgba(74,222,128,0.6)] relative" style={{ width: `${progressPercent}%` }}>
                        <div className="absolute right-0 top-0 bottom-0 w-1 bg-white/50" />
                     </div>
                  </div>
               </div>
            </div>

            <div className="shrink-0 w-full md:w-auto flex flex-col justify-center">
               <button 
                  onClick={() => !currentDayTopic.isCompleted && setShowSession(true)}
                  disabled={currentDayTopic.isCompleted}
                  className={`relative overflow-hidden w-full md:w-auto px-8 py-4 sm:py-5 rounded-2xl font-bold text-sm sm:text-base shadow-xl flex items-center justify-center gap-3 transition-all transform active:scale-95 group/btn ${
                     currentDayTopic.isCompleted ? 'bg-white/10 border border-white/5 text-white/50 cursor-default' : 'bg-white text-brand-violet hover:bg-slate-50 hover:scale-105 hover:shadow-2xl'
                  }`}
               >
                  {currentDayTopic.isCompleted ? (
                     <><span className="relative z-10 flex items-center gap-2">Missão Cumprida <CheckCircle2 size={20} /></span></>
                  ) : (
                     <>
                        <span className="relative z-10 flex items-center gap-2">Ver Desafio Prático <Play size={20} fill="currentColor" /></span>
                        <div className="absolute top-0 -left-[100%] w-full h-full bg-gradient-to-r from-transparent via-white/40 to-transparent transform skew-x-12 group-hover/btn:animate-shimmer" />
                     </>
                  )}
               </button>
            </div>
         </div>
      </div>

      <ModalPortal />

      {/* --- MODAL DE SUCESSO (MANTIDO) --- */}
      {showCompletion && (
         <div className="fixed inset-0 z-[5010] flex items-center justify-center p-6">
            <div className="absolute inset-0 bg-black/90 backdrop-blur-xl animate-fade-in" onClick={() => setShowCompletion(false)} />
            <div className="relative w-full max-w-sm bg-[#1A1F26] p-8 rounded-[2.5rem] shadow-2xl animate-bounce-in text-center border border-white/10 overflow-hidden">
               <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30 pointer-events-none" />
               <div className="relative z-10">
                  <div className="w-20 h-20 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(34,197,94,0.2)] border border-green-500/20">
                     <Trophy size={40} className="drop-shadow-lg" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Dia Concluído!</h3>
                  <p className="text-slate-400 text-sm mb-6 px-2">
                     Sua fidelidade edifica a Igreja. Que tal inspirar seus irmãos partilhando essa graça?
                  </p>
                  <div className="space-y-3">
                     <button onClick={handleShare} className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 text-white font-bold hover:shadow-lg hover:scale-[1.02] transition-all flex items-center justify-center gap-2 shadow-blue-500/20 text-sm">
                        <MessageCircle size={18} /> Partilhar Graça no Mural
                     </button>
                     <button onClick={() => setShowCompletion(false)} className="w-full py-3 text-slate-500 text-sm font-bold hover:text-white transition-colors hover:bg-white/5 rounded-xl">
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
