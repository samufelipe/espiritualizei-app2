
import React, { useState } from 'react';
import { Sparkles, ArrowRight, Brain, Coffee, CloudRain, Shield, BookOpen, User, Check, RefreshCw, Calendar, ThumbsUp, ThumbsDown, Activity, Clock } from 'lucide-react';
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
  const [likedPractices, setLikedPractices] = useState<string[]>([]);
  const [dislikedPractices, setDislikedPractices] = useState<string[]>([]);
  const [timeChange, setTimeChange] = useState<'same' | 'less' | 'more'>('same');
  const [newStruggle, setNewStruggle] = useState<any>(currentStruggle || 'anxiety');
  const [newGoal, setNewGoal] = useState<any>('peace');

  const PRACTICES_OPTIONS = ['Rosário', 'Leitura', 'Silêncio', 'Missa', 'Jejum', 'Exame de Consciência', 'Música Sacra'];

  const STRUGGLES = [
    { val: 'anxiety', label: 'Ansiedade', icon: Brain },
    { val: 'laziness', label: 'Preguiça', icon: Coffee },
    { val: 'dryness', label: 'Aridez', icon: CloudRain },
    { val: 'lust', label: 'Vícios', icon: Shield },
    { val: 'ignorance', label: 'Dúvida', icon: BookOpen },
    { val: 'pride', label: 'Soberba', icon: User }
  ];

  const togglePractice = (practice: string, type: 'liked' | 'disliked') => {
      if (type === 'liked') {
          setLikedPractices(prev => prev.includes(practice) ? prev.filter(p => p !== practice) : [...prev, practice]);
          setDislikedPractices(prev => prev.filter(p => p !== practice)); // Remove from disliked if liked
      } else {
          setDislikedPractices(prev => prev.includes(practice) ? prev.filter(p => p !== practice) : [...prev, practice]);
          setLikedPractices(prev => prev.filter(p => p !== practice)); // Remove from liked if disliked
      }
  };

  const handleFinish = () => {
    setIsGenerating(true);
    
    const reviewData: MonthlyReviewData = {
        intensity,
        consistency,
        likedPractices,
        dislikedPractices,
        timeAvailabilityChange: timeChange,
        newStruggle,
        newGoal
    };

    setTimeout(() => {
        onComplete(reviewData);
    }, 2000); 
  };

  if (isGenerating) {
      return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-brand-dark/95 backdrop-blur-md animate-fade-in">
            <div className="text-center p-6">
                <div className="w-16 h-16 bg-brand-violet/20 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                    <Sparkles size={32} className="text-brand-violet animate-spin-slow" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Processando sua Jornada</h2>
                <p className="text-slate-400 max-w-xs mx-auto">A inteligência do app está reajustando sua rotina com base no seu feedback sincero...</p>
            </div>
        </div>
      );
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-brand-dark/90 backdrop-blur-md animate-fade-in" />
      
      <div className="relative w-full max-w-md bg-white dark:bg-brand-dark rounded-[2rem] shadow-2xl p-6 sm:p-8 animate-slide-up border border-white/10 flex flex-col max-h-[90vh]">
        
        {/* Progress Bar */}
        <div className="flex gap-1 mb-6">
            {[0, 1, 2, 3].map(i => (
                <div key={i} className={`h-1.5 rounded-full flex-1 transition-all ${i <= step ? 'bg-brand-violet' : 'bg-slate-100 dark:bg-white/10'}`} />
            ))}
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar pb-4">
            {/* STEP 0: INTRO */}
            {step === 0 && (
                <div className="text-center py-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-amber-500/20">
                        <Calendar size={32} className="text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-brand-dark dark:text-white mb-3">Renovação de Votos</h2>
                    <p className="text-slate-600 dark:text-slate-300 mb-8 leading-relaxed text-sm">
                        30 dias se passaram. Para que sua vida espiritual cresça, precisamos ser honestos sobre o que funcionou e o que foi um peso. Vamos ajustar a carga?
                    </p>
                    <button onClick={() => setStep(1)} className="w-full bg-brand-violet text-white font-bold py-4 rounded-xl shadow-lg hover:scale-105 transition-all flex items-center justify-center gap-2">
                        Começar Avaliação <ArrowRight size={20} />
                    </button>
                    <button onClick={onClose} className="mt-4 text-xs font-bold text-slate-400 hover:text-white">Pular e manter rotina atual</button>
                </div>
            )}

            {/* STEP 1: PERFORMANCE REVIEW */}
            {step === 1 && (
                <div className="space-y-8">
                    <div>
                        <h3 className="text-lg font-bold text-brand-dark dark:text-white mb-1 flex items-center gap-2"><Activity size={18} className="text-brand-violet"/> Intensidade</h3>
                        <p className="text-sm text-slate-500 mb-4">Como você sentiu o peso da rotina?</p>
                        <div className="grid grid-cols-3 gap-2">
                            <button onClick={() => setIntensity('too_light')} className={`p-3 rounded-xl border text-xs font-bold transition-all ${intensity === 'too_light' ? 'bg-brand-violet text-white border-brand-violet' : 'border-slate-200 dark:border-white/10 dark:text-slate-300'}`}>Muito Leve</button>
                            <button onClick={() => setIntensity('balanced')} className={`p-3 rounded-xl border text-xs font-bold transition-all ${intensity === 'balanced' ? 'bg-brand-violet text-white border-brand-violet' : 'border-slate-200 dark:border-white/10 dark:text-slate-300'}`}>Equilibrada</button>
                            <button onClick={() => setIntensity('too_heavy')} className={`p-3 rounded-xl border text-xs font-bold transition-all ${intensity === 'too_heavy' ? 'bg-brand-violet text-white border-brand-violet' : 'border-slate-200 dark:border-white/10 dark:text-slate-300'}`}>Pesada</button>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-lg font-bold text-brand-dark dark:text-white mb-1 flex items-center gap-2"><Check size={18} className="text-green-500"/> Consistência Real</h3>
                        <p className="text-sm text-slate-500 mb-4">Sendo sincero, o quanto você cumpriu?</p>
                        <div className="space-y-2">
                            <button onClick={() => setConsistency('low')} className={`w-full p-3 rounded-xl border text-left text-sm transition-all ${consistency === 'low' ? 'border-brand-violet bg-brand-violet/5 text-brand-violet' : 'border-slate-200 dark:border-white/10 dark:text-slate-300'}`}>😓 Pouco (Menos de 30%)</button>
                            <button onClick={() => setConsistency('medium')} className={`w-full p-3 rounded-xl border text-left text-sm transition-all ${consistency === 'medium' ? 'border-brand-violet bg-brand-violet/5 text-brand-violet' : 'border-slate-200 dark:border-white/10 dark:text-slate-300'}`}>😐 Mais ou menos (Uns 50%)</button>
                            <button onClick={() => setConsistency('high')} className={`w-full p-3 rounded-xl border text-left text-sm transition-all ${consistency === 'high' ? 'border-brand-violet bg-brand-violet/5 text-brand-violet' : 'border-slate-200 dark:border-white/10 dark:text-slate-300'}`}>🔥 Bastante (Quase tudo)</button>
                        </div>
                    </div>
                </div>
            )}

            {/* STEP 2: FEEDBACK SPECIFIC */}
            {step === 2 && (
                <div className="space-y-6">
                    <div>
                        <h3 className="text-lg font-bold text-brand-dark dark:text-white mb-1">O que funcionou?</h3>
                        <p className="text-sm text-slate-500 mb-4">Selecione o que você gostou (👍) ou o que foi difícil (👎).</p>
                        
                        <div className="space-y-3">
                            {PRACTICES_OPTIONS.map(p => {
                                const isLiked = likedPractices.includes(p);
                                const isDisliked = dislikedPractices.includes(p);
                                return (
                                    <div key={p} className="flex items-center justify-between bg-slate-50 dark:bg-white/5 p-3 rounded-xl border border-slate-100 dark:border-white/5">
                                        <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{p}</span>
                                        <div className="flex gap-2">
                                            <button onClick={() => togglePractice(p, 'liked')} className={`p-2 rounded-full transition-colors ${isLiked ? 'bg-green-500 text-white' : 'bg-white dark:bg-white/10 text-slate-400'}`}><ThumbsUp size={16}/></button>
                                            <button onClick={() => togglePractice(p, 'disliked')} className={`p-2 rounded-full transition-colors ${isDisliked ? 'bg-red-500 text-white' : 'bg-white dark:bg-white/10 text-slate-400'}`}><ThumbsDown size={16}/></button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div>
                        <h3 className="text-lg font-bold text-brand-dark dark:text-white mb-1 flex items-center gap-2"><Clock size={18} className="text-blue-500"/> Seu Tempo</h3>
                        <p className="text-sm text-slate-500 mb-3">Para o próximo mês, você terá:</p>
                        <div className="flex gap-2">
                            <button onClick={() => setTimeChange('less')} className={`flex-1 p-2 rounded-lg border text-xs font-bold ${timeChange === 'less' ? 'bg-brand-violet text-white' : 'dark:text-slate-300'}`}>Menos Tempo</button>
                            <button onClick={() => setTimeChange('same')} className={`flex-1 p-2 rounded-lg border text-xs font-bold ${timeChange === 'same' ? 'bg-brand-violet text-white' : 'dark:text-slate-300'}`}>Igual</button>
                            <button onClick={() => setTimeChange('more')} className={`flex-1 p-2 rounded-lg border text-xs font-bold ${timeChange === 'more' ? 'bg-brand-violet text-white' : 'dark:text-slate-300'}`}>Mais Tempo</button>
                        </div>
                    </div>
                </div>
            )}

            {/* STEP 3: NEW BATTLE */}
            {step === 3 && (
                <div>
                    <h3 className="text-xl font-bold text-brand-dark dark:text-white mb-1">Próxima Batalha</h3>
                    <p className="text-sm text-slate-500 mb-6">Qual será o foco espiritual deste novo ciclo?</p>
                    
                    <div className="grid grid-cols-2 gap-3 mb-8">
                        {STRUGGLES.map(s => (
                            <button 
                                key={s.val}
                                onClick={() => setNewStruggle(s.val)}
                                className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${newStruggle === s.val ? 'bg-brand-violet text-white border-brand-violet shadow-lg' : 'bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-500 hover:bg-slate-50 dark:hover:bg-white/10'}`}
                            >
                                <s.icon size={24} />
                                <span className="text-xs font-bold uppercase tracking-wide">{s.label}</span>
                            </button>
                        ))}
                    </div>
                    
                    <div className="bg-brand-violet/10 p-4 rounded-xl border border-brand-violet/20 mb-6">
                        <p className="text-xs text-brand-violet font-bold uppercase mb-1">Objetivo: {newGoal === 'peace' ? 'Paz Interior' : 'Santidade'}</p>
                        <p className="text-xs text-slate-500">A IA ajustará as orações para combater a {STRUGGLES.find(s => s.val === newStruggle)?.label} com base no seu feedback anterior.</p>
                    </div>
                </div>
            )}
        </div>

        {/* Footer Actions */}
        <div className="pt-4 mt-auto border-t border-slate-100 dark:border-white/5">
            {step < 3 ? (
                <button onClick={() => setStep(prev => prev + 1)} className="w-full bg-brand-dark dark:bg-white text-white dark:text-brand-dark font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 shadow-lg">
                    Próximo <ArrowRight size={18} />
                </button>
            ) : (
                <button onClick={handleFinish} className="w-full bg-brand-violet text-white font-bold py-4 rounded-xl shadow-lg hover:bg-purple-600 flex items-center justify-center gap-2">
                    <RefreshCw size={20} /> Gerar Nova Rotina Otimizada
                </button>
            )}
        </div>

      </div>
    </div>
  );
};

export default MonthlyReviewModal;
