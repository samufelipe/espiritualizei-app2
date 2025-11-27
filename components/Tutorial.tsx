
import React, { useState, useEffect } from 'react';
import { CheckCircle2, MessageCircle, Sparkles, ArrowRight, X, User, Music, MapPin } from 'lucide-react';
import BrandLogo from './BrandLogo';
import { UserProfile } from '../types';

interface TutorialProps {
  onComplete: () => void;
  user: UserProfile;
}

const Tutorial: React.FC<TutorialProps> = ({ onComplete, user }) => {
  const [step, setStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleNext = () => {
    if (step < 5) {
      setStep(prev => prev + 1);
    } else {
      setIsVisible(false);
      setTimeout(onComplete, 500); // Allow animation to finish
    }
  };

  const firstName = user.name.split(' ')[0];

  const steps = [
    {
      title: `Bem-vindo, ${firstName}`,
      description: "Este aplicativo não é apenas uma lista de tarefas. É um santuário digital construído para o seu momento de vida. Tudo aqui tem um único propósito: te ajudar a ser constante na fé.",
      icon: BrandLogo,
      positionClass: "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2", // Center
      highlightNav: -1
    },
    {
      title: "Sua Regra de Vida",
      description: "Aqui está o coração do método. Sua rotina foi personalizada para sua realidade. Tente cumprir estas práticas diariamente para ganhar constância.",
      icon: CheckCircle2,
      positionClass: "bottom-24 left-4 sm:left-10", // Points to Routine Nav (approx)
      highlightNav: 1 // Index of Routine in Navigation
    },
    {
      title: "Capela Sonora",
      description: "O silêncio é a linguagem de Deus. Toque no ícone de música flutuante para ativar sons de chuva, piano ou canto gregoriano e se isolar do mundo enquanto reza.",
      icon: Music,
      positionClass: "bottom-32 right-4 sm:right-10", // Points to Ambient Player (bottom right)
      highlightNav: -1
    },
    {
      title: "Direção Espiritual",
      description: "Sentiu aridez ou tem dúvida sobre a fé? Converse com nossa IA. Ela foi treinada no Catecismo e na vida dos Santos para te guiar.",
      icon: MessageCircle,
      positionClass: "bottom-24 right-4 sm:right-20", // Points to Chat
      highlightNav: 3 // Index of Chat
    },
    {
      title: "Encontre sua Igreja",
      description: "A fé é vivida em comunidade. Na aba Comunidade, use o botão de Mapa para encontrar as paróquias mais próximas de você e os horários de Missa.",
      icon: MapPin,
      positionClass: "bottom-24 right-4 sm:right-4", // Points to Community
      highlightNav: 4 // Index of Community
    },
    {
      title: "Comunidade Viva",
      description: "Ninguém se salva sozinho. Peça orações e acenda velas virtuais pelas intenções dos irmãos. A caridade é o vínculo da perfeição.",
      icon: Sparkles,
      positionClass: "bottom-24 right-4 sm:right-4", // Points to Community
      highlightNav: 4 // Index of Community
    }
  ];

  const currentStep = steps[step];
  const isCenter = currentStep.highlightNav === -1 && currentStep.title !== 'Capela Sonora'; // Capela is bottom right but not nav

  return (
    <div className={`fixed inset-0 z-[60] flex flex-col transition-opacity duration-500 ${isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      
      {/* Backdrop with Blur/Darken */}
      <div className="absolute inset-0 bg-brand-dark/90 backdrop-blur-sm transition-all duration-500" />

      {/* Content Card */}
      <div className={`absolute ${currentStep.positionClass} w-[90%] max-w-sm transition-all duration-500 ease-out`}>
        <div className="bg-white dark:bg-brand-dark border border-white/20 shadow-2xl rounded-3xl p-6 relative overflow-hidden animate-slide-up ring-4 ring-brand-violet/20">
          
          {/* Decorative Blob */}
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-brand-violet/20 rounded-full blur-2xl animate-pulse-slow" />

          <div className="relative z-10">
            <div className="w-14 h-14 bg-brand-violet/10 text-brand-violet rounded-2xl flex items-center justify-center mb-4 shadow-sm border border-brand-violet/10">
              {isCenter ? (
                <BrandLogo size={28} variant="fill" />
              ) : (
                <currentStep.icon size={28} />
              )}
            </div>

            <h3 className="text-2xl font-bold text-brand-dark dark:text-white mb-3 leading-tight">
              {currentStep.title}
            </h3>
            
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-8 text-base font-medium">
              {currentStep.description}
            </p>

            <div className="flex items-center justify-between">
              {/* Progress Dots */}
              <div className="flex gap-2">
                {steps.map((_, idx) => (
                  <div 
                    key={idx}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      idx === step ? 'w-8 bg-brand-violet' : 'w-1.5 bg-slate-200 dark:bg-white/20'
                    }`}
                  />
                ))}
              </div>

              <button 
                onClick={handleNext}
                className="bg-brand-violet text-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg shadow-brand-violet/30 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
              >
                {step === steps.length - 1 ? 'Começar Jornada' : 'Próximo'} <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Pointer Arrow (Visual Cue for non-center steps) */}
        {!isCenter && (
          <div className={`absolute ${step >= 2 ? '-bottom-3 right-8' : '-bottom-3 left-8'} text-white dark:text-brand-dark animate-bounce`}>
             <div className="w-0 h-0 border-l-[10px] border-l-transparent border-t-[10px] border-t-white dark:border-t-brand-dark border-r-[10px] border-r-transparent filter drop-shadow-lg"></div>
          </div>
        )}
      </div>

      {/* Skip Button */}
      <button 
        onClick={onComplete}
        className="absolute top-12 right-6 text-white/60 hover:text-white text-xs font-bold uppercase tracking-wider transition-colors z-50 bg-white/10 px-3 py-1 rounded-full backdrop-blur-md"
      >
        Pular Tutorial
      </button>
    </div>
  );
};

export default Tutorial;
