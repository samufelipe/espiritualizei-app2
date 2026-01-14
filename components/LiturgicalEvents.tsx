
import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { CommunityChallenge } from '../types';
import { Calendar, CheckCircle2, ArrowRight, Play, X, BookOpen, Trophy, Share2, Sparkles, Heart, Users, Flame, MessageCircle, ChevronLeft, ChevronRight, ShieldCheck, Quote, Clock, Loader2, Volume2, Music, Pause } from 'lucide-react';
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
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const dailyTopics = activeChallenge?.dailyTopics || [];
  const currentDayTopic = dailyTopics.find(t => t.day === activeChallenge?.currentDay) || dailyTopics[0];

  // URL estável de Canto Gregoriano (Salve Regina - Domínio Público)
  const MEDITATION_TRACK = 'https://upload.wikimedia.org/wikipedia/commons/e/e2/Salve_Regina.ogg';

  useEffect(() => {
    if (onExpandChange) {
      onExpandChange(!!showSession);
    }
  }, [showSession, onExpandChange]);

  useEffect(() => {
     if (showSession) {
        setStep(0);
        document.body.style.overflow = 'hidden';
        if (contentRef.current) contentRef.current.scrollTo({ top: 0 });
        
        // Inicializa o áudio
        if (!audioRef.current) {
            audioRef.current = new Audio(MEDITATION_TRACK);
            audioRef.current.loop = true;
            audioRef.current.volume = 0.4;
        }
     } else {
        document.body.style.overflow = 'unset';
        if (audioRef.current) {
            audioRef.current.pause();
            setIsPlayingMusic(false);
        }
     }
     return () => { 
         document.body.style.overflow = 'unset';
         if (audioRef.current) audioRef.current.pause();
     };
  }, [showSession]);

  if (!activeChallenge || !currentDayTopic) return null;

  const handleOpen = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!currentDayTopic.isCompleted) {
        setShowSession(true);
    }
  };

  const handleToggleMusic = () => {
    if (!audioRef.current) return;

    if (isPlayingMusic) {
        audioRef.current.pause();
    } else {
        audioRef.current.play().catch(e => console.error("Erro ao tocar música:", e));
    }
    setIsPlayingMusic(!isPlayingMusic);
  };

  const handleComplete = () => {
    if (audioRef.current) audioRef.current.pause();
    onJoin(activeChallenge.id, 1); 
    setShowSession(false);
    setShowCompletion(true);
  };

  const handleShare = () => {
    if (onTestify) {
        const text = `Concluí o desafio comunitário: "${currentDayTopic.title}". 🙏✨`;
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
        case 0: 
           return (
              <div className="flex flex-col items-center text-center space-y-8 animate-fade-in w-full max-w-2xl mx-auto py-4">
                 <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-white/10 flex items-center justify-center text-white shadow-2xl shrink-0 border border-white/20 backdrop-blur-md relative mt-4">
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
        case 1: 
           return (
              <div className="flex flex-col space-y-8 animate-fade-in w-full max-w-2xl mx-auto py-4">
                 <button 
                    onClick={handleToggleMusic}
                    className={`flex items-center gap-5 p-6 rounded-[2rem] border transition-all text-left w-full group/card ${isPlayingMusic ? 'bg-white/15 border-white/40 shadow-glow' : 'bg-white/5 border-white/10 hover:bg-white/10 active:scale-95'}`}
                 >
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 border shadow-lg transition-all ${isPlayingMusic ? 'bg-brand-violet border-brand-violet text-white scale-105' : 'bg-white/10 border-white/20 text-white'}`}>
                       {isPlayingMusic ? <Pause className="w-8 h-8 fill-current" /> : <Music className="w-8 h-8" />}
                    </div>
                    <div>
                       <h3 className="text-2xl font-bold text-white tracking-tight">{isPlayingMusic ? 'Em Meditação...' : 'Som para Oração'}</h3>
                       <p className="text-sm text-white/60">
                          {isPlayingMusic ? 'Respire fundo e leia o passo abaixo.' : 'Ative o Canto Gregoriano para refletir.'}
                       </p>
                    </div>
                    {isPlayingMusic && (
                        <div className="ml-auto flex gap-1 items-end h-4 mr-2">
                            <div className="w-1 bg-white/40 rounded-full animate-[bounce_1s_infinite]" />
                            <div className="w-1 bg-white/60 rounded-full animate-[bounce_1.3s_infinite]" />
                            <div className="w-1 bg-white/40 rounded-full animate-[bounce_0.8s_infinite]" />
                        </div>
                    )}
                 </button>
                 
                 <div className={`bg-white/10 border border-white/20 rounded-[2.5rem] p-10 shadow-inner relative overflow-hidden backdrop-blur-md min-h-[250px] flex flex-col justify-center text-center transition-all duration-1000 ${isPlayingMusic ? 'ring-2 ring-brand-violet/30 bg-white/15' : ''}`}>
                    <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
                    <p className="text-white text-xl md:text-3xl leading-relaxed font-black relative z-10 font-sans tracking-tight">
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
        case 2: 
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

  return (
    <div className="mb-8 animate-slide-up">
      <div 
        onClick={handleOpen}
        className="relative w-full rounded-[2.5rem] overflow-hidden bg-gradient-to-br from-[#1A1F26] via-[#2A2E35] to-[#1A1F26] shadow-2xl border border-white/5 group isolate transition-all hover:shadow-brand-violet/10 cursor-pointer"
      >
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
               </div>
            </div>

            <div className="shrink-0">
               <button 
                  className={`relative overflow-hidden w-full md:w-auto px-10 py-5 rounded-[2rem] font-black text-lg shadow-2xl flex items-center justify-center gap-3 transition-all transform active:scale-95 group/btn ${
                     currentDayTopic.isCompleted ? 'bg-white/5 border border-white/5 text-white/30 cursor-default' : 'bg-white text-brand-dark hover:scale-105 hover:shadow-brand-violet/20'
                  }`}
               >
                  {currentDayTopic.isCompleted ? (
                     <span className="flex items-center gap-2">Gesto Concluido <CheckCircle2 size={24} /></span>
                  ) : (
                     <span className="relative z-10 flex items-center gap-2">Aceitar Missão <Play size={24} fill="currentColor" /></span>
                  )}
               </button>
            </div>
         </div>
      </div>

      {showSession && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-end md:items-center justify-center">
           <div className="absolute inset-0 bg-black/95 backdrop-blur-2xl animate-fade-in" onClick={() => setShowSession(false)} />
           
           <div className={`relative w-full h-full md:h-auto md:max-h-[95vh] md:max-w-4xl md:rounded-[3rem] flex flex-col overflow-hidden animate-slide-up shadow-2xl transition-colors duration-1000 bg-gradient-to-br ${getStepAtmosphere()} border border-white/10`}>
              <div className="shrink-0 px-8 pt-12 pb-6 md:p-10 flex justify-between items-center relative z-20">
                 <div className="flex-1 flex gap-3 mr-12">
                    {[0,1,2].map(i => (
                       <div key={i} className="h-1.5 flex-1 bg-white/10 rounded-full overflow-hidden">
                          <div className={`h-full bg-white shadow-[0_0_10px_white] transition-all duration-700 ease-out ${i <= step ? 'w-full' : 'w-0'}`} />
                       </div>
                    ))}
                 </div>
                 <button onClick={() => { setShowSession(false); setIsPlayingMusic(false); }} className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-all shrink-0">
                    <X size={24} />
                 </button>
              </div>

              <div ref={contentRef} className="flex-1 overflow-y-auto overflow-x-hidden relative z-10 px-8 md:px-16 pb-40 md:pb-20 no-scrollbar">
                 {renderStepContent()}
              </div>

              <div className="shrink-0 p-8 pb-12 md:p-10 relative z-20 bg-gradient-to-t from-black/60 to-transparent flex gap-4">
                 {step > 0 && (
                    <button onClick={() => setStep(step - 1)} className="w-16 h-16 rounded-2xl font-bold text-white bg-white/10 backdrop-blur-md border border-white/10 shrink-0 active:scale-95 flex items-center justify-center">
                       <ChevronLeft size={32} />
                    </button>
                 )}
                 {step < 2 ? (
                    <button onClick={() => setStep(step + 1)} className="flex-1 bg-white text-brand-dark font-black h-16 rounded-2xl shadow-2xl hover:scale-[1.02] transition-all flex items-center justify-center gap-3 active:scale-95 text-xl tracking-tight">
                       Próximo Passo <ChevronRight size={24} />
                    </button>
                 ) : (
                    <button onClick={handleComplete} className="flex-1 bg-gradient-to-r from-brand-violet to-purple-600 text-white font-black h-16 rounded-2xl shadow-[0_0_30px_rgba(167,139,250,0.5)] flex items-center justify-center gap-3 active:scale-95 text-xl tracking-tight">
                       Confirmar Entrega <CheckCircle2 size={28} />
                    </button>
                 )}
              </div>
           </div>
        </div>,
        document.body
      )}

      {showCompletion && (
         <div className="fixed inset-0 z-[10000] flex items-center justify-center p-6">
            <div className="absolute inset-0 bg-black/95 backdrop-blur-xl animate-fade-in" onClick={() => setShowCompletion(false)} />
            <div className="relative w-full max-w-sm bg-[#1A1F26] p-10 rounded-[3rem] shadow-2xl animate-bounce-in text-center border border-white/10 overflow-hidden">
               <div className="relative z-10">
                  <div className="w-24 h-24 bg-green-500/10 text-green-400 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner border border-green-500/20">
                     <Trophy size={48} />
                  </div>
                  <h3 className="text-3xl font-black text-white mb-3">Deus seja louvado!</h3>
                  <p className="text-slate-400 text-sm mb-8 leading-relaxed">Sua fidelidade nas pequenas coisas do cotidiano edifica toda a nossa Igreja.</p>
                  <div className="space-y-4">
                     <button onClick={handleShare} className="w-full py-4 rounded-2xl bg-gradient-to-r from-brand-violet to-purple-600 text-white font-bold hover:scale-[1.02] transition-all flex items-center justify-center gap-3 shadow-brand-violet/20">
                        <MessageCircle size={20} /> Compartilhar com a Comunidade
                     </button>
                     <button onClick={() => setShowCompletion(false)} className="w-full py-3 text-slate-500 text-sm font-bold">Apenas Concluir</button>
                  </div>
               </div>
            </div>
         </div>
      )}
    </div>
  );
};

export default LiturgicalEvents;
