
import React, { useState } from 'react';
import { Sparkles, ArrowRight, Brain, Coffee, CloudRain, Shield, BookOpen, User, Check, RefreshCw, Calendar, ThumbsUp, ThumbsDown, Activity, Clock, Heart, Zap, MapPin, Headphones, PenLine, ChevronRight, Users, GraduationCap, Anchor } from 'lucide-react';
import { MonthlyReviewData } from '../types';

interface MonthlyReviewModalProps {
  onClose: () => void;
  onComplete: (data: MonthlyReviewData) => void;
  currentStruggle?: string;
}

const MonthlyReviewModal: React.FC<MonthlyReviewModalProps> = ({ onClose, onComplete, currentStruggle }) => {
  const [step, setStep] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);

  // --- REVIEW STATE ---
  const [intensity, setIntensity] = useState<'too_heavy' | 'balanced' | 'too_light'>('balanced');
  const [consistency, setConsistency] = useState<'low' | 'medium' | 'high'>('medium');
  const [likedModules, setLikedModules] = useState<string[]>([]);
  const [dislikedModules, setDislikedModules] = useState<string[]>([]);
  const [timeChange, setTimeChange] = useState<'same' | 'less' | 'more'>('same');
  const [newStruggle, setNewStruggle] = useState<string>(currentStruggle || 'anxiety');
  const [newGoal, setNewGoal] = useState<'peace' | 'truth' | 'discipline' | 'love' | 'healing'>('peace');
  const [lifeContext, setLifeContext] = useState<'stressful' | 'stable' | 'transition'>('stable');

  // Módulos reais do Aplicativo Espiritualizei
  const APP_MODULES = [
    { id: 'liturgy', label: 'Liturgia e Evangelho', icon: BookOpen },
    { id: 'routine', label: 'Gestão da Minha Rotina', icon: Check },
    { id: 'community', label: 'Mural e Comunidade', icon: Users },
    { id: 'library', label: 'Biblioteca de Estudos', icon: GraduationCap },
    { id: 'maps', label: 'Mapa de Igrejas', icon: MapPin },
    { id: 'chat', label: 'Diretor Espiritual (IA)', icon: Sparkles },
    { id: 'player', label: 'Capela Sonora', icon: Headphones },
    { id: 'journal', label: 'Diário da Alma', icon: PenLine }
  ];

  const STRUGGLES = [
    { val: 'anxiety', label: 'Ansiedade', icon: Brain },
    { val: 'laziness', label: 'Preguiça', icon: Coffee },
    { val: 'dryness', label: 'Aridez', icon: CloudRain },
    { val: 'lust', label: 'Vícios', icon: Shield },
    { val: 'ignorance', label: 'Dúvida', icon: BookOpen },
    { val: 'pride', label: 'Soberba', icon: User }
  ];

  const toggleModuleFeedback = (moduleLabel: string, type: 'liked' | 'disliked') => {
      if (type === 'liked') {
          setLikedModules(prev => prev.includes(moduleLabel) ? prev.filter(p => p !== moduleLabel) : [...prev, moduleLabel]);
          setDislikedModules(prev => prev.filter(p => p !== moduleLabel));
      } else {
          setDislikedModules(prev => prev.includes(moduleLabel) ? prev.filter(p => p !== moduleLabel) : [...prev, moduleLabel]);
          setLikedModules(prev => prev.filter(p => p !== moduleLabel));
      }
  };

  const handleFinish = () => {
    setIsGenerating(true);
    const reviewData: MonthlyReviewData = {
        intensity,
        consistency,
        lifeContext,
        likedModules,
        dislikedModules,
        timeAvailabilityChange: timeChange,
        newStruggle,
        newGoal
    };
    // Simula tempo de oração/IA
    setTimeout(() => onComplete(reviewData), 3000); 
  };

  if (isGenerating) {
      return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-brand-dark/95 backdrop-blur-md animate-fade-in">
            <div className="text-center p-8 max-w-sm">
                <div className="w-20 h-20 bg-brand-violet/20 rounded-full flex items-center justify-center mx-auto mb-8 animate-pulse border border-brand-violet/30">
                    <Sparkles size={40} className="text-brand-violet animate-spin-slow" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-3">Recalibrando seu Caminho</h2>
                <p className="text-slate-400 leading-relaxed text-sm">Sua nova regra de vida está sendo escrita agora, unindo sua realidade atual à tradição da Igreja.</p>
            </div>
        </div>
      );
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-brand-dark/90 backdrop-blur-md animate-fade-in" />
      
      <div className="relative w-full max-w-md bg-white dark:bg-brand-dark rounded-[2.5rem] shadow-2xl p-6 sm:p-8 animate-slide-up border border-white/10 flex flex-col max-h-[92vh] overflow-hidden">
        
        <div className="flex gap-1.5 mb-8">
            {[0, 1, 2, 3].map(i => (
                <div key={i} className={`h-1.5 rounded-full flex-1 transition-all duration-500 ${i <= step ? 'bg-brand-violet' : 'bg-slate-100 dark:bg-white/10'}`} />
            ))}
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar pb-6">
            {step === 0 && (
                <div className="animate-fade-in">
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-gradient-to-br from-brand-violet to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-brand-violet/20">
                            <RefreshCw size={32} className="text-white" />
                        </div>
                        <h2 className="text-2xl font-bold text-brand-dark dark:text-white mb-2">Renovação de Votos</h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Completamos 30 dias. Como está seu coração hoje?</p>
                    </div>

                    <div className="space-y-3">
                        <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Seu Momento Atual de Vida</p>
                        {[
                            { id: 'stressful', label: 'Ciclo Agitado', desc: 'Muito trabalho ou preocupações externas.', icon: Zap },
                            { id: 'stable', label: 'Ciclo Equilibrado', desc: 'Consigo manter minha ordem diária.', icon: Check },
                            { id: 'transition', label: 'Ciclo de Mudança', desc: 'Novos hábitos ou nova fase de vida.', icon: RefreshCw }
                        ].map(ctx => (
                            <button 
                                key={ctx.id}
                                onClick={() => setLifeContext(ctx.id as any)}
                                className={`w-full p-4 rounded-2xl border text-left flex items-center gap-4 transition-all ${lifeContext === ctx.id ? 'bg-brand-violet/10 border-brand-violet' : 'bg-white dark:bg-white/5 border-slate-100 dark:border-white/5'}`}
                            >
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${lifeContext === ctx.id ? 'bg-brand-violet text-white' : 'bg-slate-100 dark:bg-white/10 text-slate-400'}`}>
                                    <ctx.icon size={20} />
                                </div>
                                <div>
                                    <p className={`text-sm font-bold ${lifeContext === ctx.id ? 'text-brand-violet' : 'text-brand-dark dark:text-white'}`}>{ctx.label}</p>
                                    <p className="text-[10px] text-slate-500">{ctx.desc}</p>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {step === 1 && (
                <div className="space-y-8 animate-fade-in">
                    <div>
                        <h3 className="text-lg font-bold text-brand-dark dark:text-white mb-1">Avaliação de Carga</h3>
                        <p className="text-sm text-slate-500 mb-4">A rotina espiritual foi viável no último ciclo?</p>
                        <div className="grid grid-cols-3 gap-2">
                            <button onClick={() => setIntensity('too_light')} className={`py-4 px-2 rounded-xl border text-[10px] font-bold transition-all uppercase tracking-wide ${intensity === 'too_light' ? 'bg-brand-violet text-white border-brand-violet shadow-lg' : 'border-slate-200 dark:border-white/10 dark:text-slate-400'}`}>Leve demais</button>
                            <button onClick={() => setIntensity('balanced')} className={`py-4 px-2 rounded-xl border text-[10px] font-bold transition-all uppercase tracking-wide ${intensity === 'balanced' ? 'bg-brand-violet text-white border-brand-violet shadow-lg' : 'border-slate-200 dark:border-white/10 dark:text-slate-400'}`}>Ideal</button>
                            <button onClick={() => setIntensity('too_heavy')} className={`py-4 px-2 rounded-xl border text-[10px] font-bold transition-all uppercase tracking-wide ${intensity === 'too_heavy' ? 'bg-brand-violet text-white border-brand-violet shadow-lg' : 'border-slate-200 dark:border-white/10 dark:text-slate-400'}`}>Exaustiva</button>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-lg font-bold text-brand-dark dark:text-white mb-1">Fidelidade aos Exercícios</h3>
                        <p className="text-sm text-slate-500 mb-4">O quanto você conseguiu realizar de fato?</p>
                        <div className="space-y-2">
                            <button onClick={() => setConsistency('low')} className={`w-full p-4 rounded-2xl border text-left text-sm transition-all flex justify-between items-center ${consistency === 'low' ? 'border-brand-violet bg-brand-violet/5 text-brand-violet' : 'border-slate-200 dark:border-white/10 dark:text-slate-400'}`}>
                                <span>Raramente consegui seguir</span>
                                {consistency === 'low' && <Check size={16}/>}
                            </button>
                            <button onClick={() => setConsistency('medium')} className={`w-full p-4 rounded-2xl border text-left text-sm transition-all flex justify-between items-center ${consistency === 'medium' ? 'border-brand-violet bg-brand-violet/5 text-brand-violet' : 'border-slate-200 dark:border-white/10 dark:text-slate-400'}`}>
                                <span>Fui fiel em cerca de metade</span>
                                {consistency === 'medium' && <Check size={16}/>}
                            </button>
                            <button onClick={() => setConsistency('high')} className={`w-full p-4 rounded-2xl border text-left text-sm transition-all flex justify-between items-center ${consistency === 'high' ? 'border-brand-violet bg-brand-violet/5 text-brand-violet' : 'border-slate-200 dark:border-white/10 dark:text-slate-400'}`}>
                                <span>Cumpri quase tudo</span>
                                {consistency === 'high' && <Check size={16}/>}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {step === 2 && (
                <div className="space-y-6 animate-fade-in">
                    <div>
                        <h3 className="text-lg font-bold text-brand-dark dark:text-white mb-1">O que funcionou?</h3>
                        <p className="text-sm text-slate-500 mb-4">Avalie os recursos que você utilizou no Espiritualizei:</p>
                        
                        <div className="space-y-3">
                            {APP_MODULES.map(m => {
                                const isLiked = likedModules.includes(m.label);
                                const isDisliked = dislikedModules.includes(m.label);
                                return (
                                    <div key={m.id} className="flex items-center justify-between bg-slate-50 dark:bg-white/5 p-4 rounded-2xl border border-slate-100 dark:border-white/5 group">
                                        <div className="flex items-center gap-3">
                                            <m.icon size={18} className="text-slate-400 group-hover:text-brand-violet transition-colors" />
                                            <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{m.label}</span>
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={() => toggleModuleFeedback(m.label, 'liked')} className={`p-2.5 rounded-full transition-all active:scale-90 ${isLiked ? 'bg-green-500 text-white shadow-lg' : 'bg-white dark:bg-white/10 text-slate-400'}`}><ThumbsUp size={16}/></button>
                                            <button onClick={() => toggleModuleFeedback(m.label, 'disliked')} className={`p-2.5 rounded-full transition-all active:scale-90 ${isDisliked ? 'bg-red-500 text-white shadow-lg' : 'bg-white dark:bg-white/10 text-slate-400'}`}><ThumbsDown size={16}/></button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="bg-blue-50 dark:bg-blue-900/10 p-5 rounded-[1.5rem] border border-blue-100 dark:border-blue-900/20">
                        <h3 className="text-sm font-bold text-blue-700 dark:text-blue-300 mb-1 flex items-center gap-2"><Clock size={16}/> Disponibilidade de Tempo</h3>
                        <p className="text-[11px] text-blue-600 dark:text-blue-400 mb-4">Para os próximos 30 dias, você prevê:</p>
                        <div className="grid grid-cols-3 gap-2">
                            {[{id:'less', l:'Menos tempo'}, {id:'same', l:'Mesmo tempo'}, {id:'more', l:'Mais tempo'}].map(t => (
                                <button key={t.id} onClick={() => setTimeChange(t.id as any)} className={`py-2 rounded-xl text-[10px] font-black uppercase ${timeChange === t.id ? 'bg-blue-600 text-white shadow-md' : 'bg-white dark:bg-white/5 text-blue-500 border border-blue-200 dark:border-blue-800'}`}>{t.l}</button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {step === 3 && (
                <div className="animate-fade-in">
                    <h3 className="text-xl font-bold text-brand-dark dark:text-white mb-1">Direcionamento de Crescimento</h3>
                    <p className="text-sm text-slate-500 mb-6">Qual será o seu foco espiritual para este novo ciclo?</p>
                    
                    <div className="grid grid-cols-2 gap-3 mb-8">
                        {STRUGGLES.map(s => (
                            <button 
                                key={s.val}
                                onClick={() => setNewStruggle(s.val)}
                                className={`p-5 rounded-2xl border flex flex-col items-center gap-2 transition-all group ${newStruggle === s.val ? 'bg-brand-violet text-white border-brand-violet shadow-lg shadow-brand-violet/20' : 'bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-500 hover:border-brand-violet/30'}`}
                            >
                                <s.icon size={28} className={newStruggle === s.val ? 'text-white' : 'text-slate-400 group-hover:text-brand-violet'} />
                                <span className="text-xs font-bold uppercase tracking-wide">{s.label}</span>
                            </button>
                        ))}
                    </div>

                    <div className="space-y-4">
                        <p className="text-xs font-bold uppercase tracking-widest text-slate-400 px-1">Onde o app mais deve contribuir?</p>
                        <div className="grid grid-cols-1 gap-2">
                            {[
                                { id: 'peace', l: 'Trazer mais Paz Interior e Silêncio', icon: Heart },
                                { id: 'truth', l: 'Aprofundar meu Conhecimento Teológico', icon: BookOpen },
                                { id: 'discipline', l: 'Fortalecer minha Disciplina de Oração', icon: Shield },
                                { id: 'love', l: 'Incentivar minha Caridade e Serviço', icon: Users }
                            ].map(goal => (
                                <button 
                                    key={goal.id}
                                    onClick={() => setNewGoal(goal.id as any)}
                                    className={`w-full p-4 rounded-2xl border text-left flex items-center justify-between transition-all ${newGoal === goal.id ? 'bg-brand-violet/10 border-brand-violet text-brand-violet font-bold' : 'bg-white dark:bg-white/5 border-slate-100 dark:border-white/5 text-slate-500'}`}
                                >
                                    <span className="text-sm">{goal.l}</span>
                                    <goal.icon size={16} />
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>

        <div className="pt-6 mt-auto border-t border-slate-100 dark:border-white/5 flex flex-col gap-3">
            {step < 3 ? (
                <button 
                    onClick={() => setStep(prev => prev + 1)} 
                    className="w-full bg-brand-dark dark:bg-white text-white dark:text-brand-dark font-black py-5 rounded-[1.5rem] flex items-center justify-center gap-2 shadow-xl active:scale-95 transition-all text-lg"
                >
                    Próximo Passo <ChevronRight size={22} />
                </button>
            ) : (
                <button 
                    onClick={handleFinish} 
                    className="w-full bg-brand-violet text-white font-black py-5 rounded-[1.5rem] shadow-xl shadow-brand-violet/30 hover:bg-purple-600 flex items-center justify-center gap-3 active:scale-95 transition-all text-lg"
                >
                    <RefreshCw size={22} /> Gerar Minha Nova Rotina
                </button>
            )}
            {step === 0 && (
                <button onClick={onClose} className="py-2 text-xs font-bold text-slate-400 hover:text-brand-violet transition-colors">Avaliar mais tarde</button>
            )}
        </div>
      </div>
    </div>
  );
};

export default MonthlyReviewModal;
