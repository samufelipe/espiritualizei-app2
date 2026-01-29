
import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { CommunityChallenge } from '../types';
import { CheckCircle2, Play, X, Trophy, Heart, Users, Flame, MessageCircle, ChevronLeft, ChevronRight, ShieldCheck, Quote, Lightbulb, ListChecks, Share2 } from 'lucide-react';
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
  const currentDayTopic = dailyTopics.find(t => t.day === activeChallenge?.currentDay) || dailyTopics[0];

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
     } else {
        document.body.style.overflow = 'unset';
     }
     return () => { document.body.style.overflow = 'unset'; };
  }, [showSession]);

  if (!activeChallenge || !currentDayTopic) return null;

  const handleOpen = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (currentDayTopic.isCompleted) {
        alert("Você já concluiu este desafio! Sua oferta já foi contabilizada em seu perfil. A constância é o segredo da santidade. 🙏");
        return;
    }
    setShowSession(true);
  };

  const handleComplete = () => {
    if (currentDayTopic.isCompleted) return;
    onJoin(activeChallenge.id, 1); 
    setShowSession(false);
    setShowCompletion(true);
  };

  const handleShare = () => {
    if (onTestify) {
        const text = `Hoje escolhi a constância! ✨ \n\nConcluí o desafio comunitário: "${currentDayTopic.title}". \nMinha missão foi: ${currentDayTopic.actionContent}\n\nConvido toda a comunidade a também realizar este gesto hoje. Vamos juntos santificar o cotidiano! 🙏💜 #Espiritualizei`;
        onTestify(text);
        setShowCompletion(false);
        
        // Tenta encontrar a tab de feed/social para redirecionar
        const communityTab = document.querySelector('button[data-tab-id="feed"]') as HTMLElement;
        if (communityTab) {
            communityTab.click();
        } else {
            // Fallback para o nome, mais genérico
            const allTabs = document.querySelectorAll('button');
            for (let tab of allTabs) {
                if (tab.innerText.toLowerCase().includes('feed')) {
                    tab.click();
                    break;
                }
            }
        }
    }
  };

  const handleInstagramShare = async () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1080;
    canvas.height = 1920;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Fundo Oficial #1A2530 com gradiente de profundidade
    const grad = ctx.createLinearGradient(0, 0, 0, 1920);
    grad.addColorStop(0, '#1A2530');
    grad.addColorStop(0.5, '#242F3A');
    grad.addColorStop(1, '#1A2530');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Pontos de luz para um toque celestial
    ctx.globalAlpha = 0.1;
    ctx.fillStyle = '#A78BFA';
    ctx.beginPath(); ctx.arc(1080, 0, 600, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(0, 1920, 400, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 1.0;

    // Desenhar Coração Lilás (Marca Oficial) - Vetorizado
    ctx.fillStyle = '#A78BFA';
    const heartPath = new Path2D("M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z");
    ctx.save();
    ctx.translate(540 - 150, 320 - 150); // Centralizar e posicionar
    ctx.scale(12.5, 12.5); // Escalar o path (24x24 para 300x300)
    ctx.fill(heartPath);
    ctx.restore();

    // Textos com design refinado
    ctx.textAlign = 'center';
    
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 42px sans-serif';
    ctx.letterSpacing = '4px';
    ctx.fillText('ESPIRITUALIZEI', 540, 580);

    // Divisor sutil
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(440, 650); ctx.lineTo(640, 650); ctx.stroke();

    // Badge de Conclusão
    ctx.fillStyle = 'rgba(167, 139, 250, 0.15)';
    ctx.roundRect(540 - 200, 780, 400, 60, 30); ctx.fill();
    ctx.fillStyle = '#A78BFA';
    ctx.font = 'bold 24px sans-serif';
    ctx.letterSpacing = '2px';
    ctx.fillText('DESAFIO CONCLUÍDO', 540, 818);

    // Função auxiliar para desenhar texto com quebra de linha e retornar a altura total
    const wrapText = (context: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number) => {
      const words = text.split(' ');
      let line = '';
      let currentY = y;
      const lines = [];

      for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' ';
        const metrics = context.measureText(testLine);
        const testWidth = metrics.width;
        if (testWidth > maxWidth && n > 0) {
          lines.push(line.trim());
          line = words[n] + ' ';
        } else {
          line = testLine;
        }
      }
      lines.push(line.trim());

      // Desenhar as linhas centralizadas
      lines.forEach((l, i) => {
        context.fillText(l, x, currentY + (i * lineHeight));
      });

      return lines.length * lineHeight;
    };

    // Título do Desafio
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 85px sans-serif';
    const titleY = 1000;
    const titleHeight = wrapText(ctx, currentDayTopic.title, 540, titleY, 850, 100);

    // Ação Concreta (Box de destaque dinâmico)
    const actionText = `"${currentDayTopic.actionContent}"`;
    ctx.font = 'italic 48px serif';
    
    // Calcular altura necessária para o texto da ação
    const actionMaxWidth = 780;
    const actionLineHeight = 65;
    const actionWords = actionText.split(' ');
    let tempLine = '';
    let actionLinesCount = 1;
    for (let n = 0; n < actionWords.length; n++) {
      const testLine = tempLine + actionWords[n] + ' ';
      if (ctx.measureText(testLine).width > actionMaxWidth && n > 0) {
        actionLinesCount++;
        tempLine = actionWords[n] + ' ';
      } else {
        tempLine = testLine;
      }
    }

    const boxPadding = 60;
    const boxHeight = (actionLinesCount * actionLineHeight) + (boxPadding * 2);
    const boxY = titleY + titleHeight + 80;
    
    // Desenhar Box
    ctx.fillStyle = 'rgba(255,255,255,0.05)';
    ctx.roundRect(100, boxY, 880, boxHeight, 40); 
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.1)'; 
    ctx.stroke();

    // Desenhar Texto da Ação
    ctx.fillStyle = '#A78BFA';
    wrapText(ctx, actionText, 540, boxY + boxPadding + 40, actionMaxWidth, actionLineHeight);

    // Call to Action (Rodapé)
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 32px sans-serif';
    ctx.fillText('Organize sua vida espiritual.', 540, 1680);
    
    ctx.fillStyle = '#A78BFA';
    ctx.font = 'bold 38px sans-serif';
    ctx.fillText('espiritualizei.com', 540, 1750);

    try {
      const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/png'));
      if (!blob) return;

      const file = new File([blob], 'desafio-espiritualizei.png', { type: 'image/png' });
      const shareData = {
        title: 'Minha Jornada no Espiritualizei',
        text: 'Hoje escolhi a constância na minha vida de fé. ✨\n\nConheça o app que está me ajudando a organizar minha rotina de oração e desafios comunitários: https://www.espiritualizei.com/ 💜\n\n#Espiritualizei #VidaDeOração #Fé',
        files: [file]
      };

      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
      } else {
        const dataUrl = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = `desafio-espiritualizei.png`;
        link.href = dataUrl;
        link.click();
        alert("Imagem premium gerada! ✨ Salve-a e compartilhe no seu Story para inspirar outros. Não esqueça de marcar o @espiritualizei.");
      }
    } catch (err) {
      console.error('Erro ao compartilhar:', err);
    }
  };

  const progressPercent = ((activeChallenge.currentDay || 1) / (activeChallenge.totalDays || 3)) * 100;

  const getActionIcon = () => {
      switch (currentDayTopic.actionType) {
          case 'RELATIONSHIP': return <Users size={18} />;
          case 'SACRIFICE': return <Flame size={18} />;
          case 'PRAYER': return <Heart size={18} />;
          default: return <Heart size={18} fill="currentColor" />;
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
          case 1: return "from-[#14532d] via-[#166534] to-[#14532d]"; // Verde musgo espiritual
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
                 <div className="flex items-center gap-4 p-5 bg-white/10 rounded-[2rem] border border-white/20 shadow-lg backdrop-blur-md">
                    <div className="w-12 h-12 rounded-xl bg-brand-violet flex items-center justify-center text-white shrink-0 shadow-lg">
                       <ListChecks size={24} />
                    </div>
                    <div>
                       <h3 className="text-xl font-bold text-white tracking-tight">O que preciso fazer?</h3>
                       <p className="text-xs text-white/60">Sua missão prática para santificar o hoje.</p>
                    </div>
                 </div>
                 
                 <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-10 shadow-inner relative overflow-hidden backdrop-blur-md min-h-[220px] flex flex-col justify-center text-center">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
                    <p className="text-white text-xl md:text-3xl leading-relaxed font-black relative z-10 font-sans tracking-tight">
                       {currentDayTopic.actionContent}
                    </p>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-black/20 p-6 rounded-3xl border border-white/5 flex flex-col gap-3">
                       <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-widest">
                          <Lightbulb size={16} /> Dica de Ouro
                       </div>
                       <p className="text-sm text-white/80 leading-relaxed">
                          Coloque um lembrete no celular ou um post-it na sua mesa para não esquecer de realizar este gesto até o final do dia.
                       </p>
                    </div>
                    <div className="bg-black/20 p-6 rounded-3xl border border-white/5 flex flex-col gap-3">
                       <div className="flex items-center gap-2 text-green-400 font-bold text-xs uppercase tracking-widest">
                          <ShieldCheck size={16} /> Intenção Correta
                       </div>
                       <p className="text-sm text-white/80 leading-relaxed">
                          Não faça apenas por cumprir uma tarefa. Ofereça cada segundo deste esforço por uma intenção pessoal ou pela sua paróquia.
                       </p>
                    </div>
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
                     <div className="text-white w-8 h-8 rounded-full flex items-center justify-center text-xs font-black shadow-lg" style={{ backgroundColor: activeChallenge.seasonColor || '#7C3AED' }}>#{activeChallenge.currentDay}</div>
                     <span className="text-xs font-bold text-white uppercase tracking-widest">Jornada Litúrgica</span>
                  </div>
                  <div className="backdrop-blur-md border rounded-full px-4 py-1.5 flex items-center gap-2" style={{ backgroundColor: `${activeChallenge.seasonColor}15`, borderColor: `${activeChallenge.seasonColor}30`, color: activeChallenge.seasonColor }}>
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
                     <div className="h-full relative transition-all duration-1000" style={{ width: `${progressPercent}%`, backgroundColor: activeChallenge.seasonColor || '#7C3AED', boxShadow: `0 0 15px ${activeChallenge.seasonColor}60` }}>
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
                 <button onClick={() => { setShowSession(false); }} className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-all shrink-0">
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
                    <button onClick={handleComplete} className="flex-1 text-white font-black h-16 rounded-2xl shadow-2xl flex items-center justify-center gap-3 active:scale-95 text-xl tracking-tight" style={{ background: `linear-gradient(to right, ${activeChallenge.seasonColor || '#7C3AED'}, #4C1D95)`, boxShadow: `0 0 30px ${activeChallenge.seasonColor}50` }}>
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
                     <button 
                        onClick={handleShare} 
                        className="w-full py-5 rounded-[1.5rem] text-white font-black hover:scale-[1.02] transition-all flex items-center justify-center gap-3 shadow-xl active:scale-95 group"
                        style={{ 
                           background: `linear-gradient(135deg, ${activeChallenge.seasonColor || '#7C3AED'}, #4C1D95)`,
                           boxShadow: `0 10px 30px -10px ${activeChallenge.seasonColor}80`
                        }}
                     >
                        <MessageCircle size={22} className="group-hover:rotate-12 transition-transform" /> 
                        <span className="tracking-tight">Compartilhar com a Comunidade</span>
                     </button>
                     
                     <button 
                        onClick={handleInstagramShare} 
                        className="w-full py-5 rounded-[1.5rem] bg-gradient-to-r from-[#833ab4] via-[#fd1d1d] to-[#fcb045] text-white font-black hover:scale-[1.02] transition-all flex items-center justify-center gap-3 shadow-xl active:scale-95 group"
                     >
                        <Share2 size={22} className="group-hover:scale-110 transition-transform" /> 
                        <span className="tracking-tight">Story do Instagram</span>
                     </button>
                     
                     <button 
                        onClick={() => setShowCompletion(false)} 
                        className="w-full py-3 text-slate-500 text-sm font-bold hover:text-slate-300 transition-colors"
                     >
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
