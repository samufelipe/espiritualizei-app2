
import React, { useState, useEffect } from 'react';
import { CheckCircle2, Book, Sparkles, ArrowRight, MapPin, User } from 'lucide-react';
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

  // Configuração dos passos alinhada com a Navigation.tsx (6 itens)
  // Indices da Navegação: 0:Home, 1:Rotina, 2:Aprender, 3:Comunidade, 4:Igrejas, 5:Perfil
  const steps = [
    {
      title: `Sua Jornada Começa, ${firstName}`,
      description: "Este não é apenas um app, é o seu santuário digital. Organizamos sua vida de oração para que você tenha constância e profundidade, dia após dia.",
      icon: BrandLogo,
      positionClass: "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2", // Centro
      arrowClass: "hidden", 
      highlightNav: -1
    },
    {
      title: "Seu Plano Personalizado",
      description: "Lembra das perguntas que você respondeu? Aqui está o resultado: uma rotina espiritual moldada exatamente para sua realidade e suas lutas. É aqui que a transformação acontece.",
      icon: CheckCircle2,
      positionClass: "bottom-24 left-4 sm:left-[16%]", // Aponta para a 2ª aba
      arrowClass: "bottom-[-12px] left-8 border-t-brand-dark dark:border-t-white", 
      highlightNav: 1
    },
    {
      title: "Biblioteca da Fé",
      description: "Ninguém ama o que não conhece. Acesse conteúdos profundos sobre Doutrina, Liturgia e Espiritualidade para alimentar sua inteligência.",
      icon: Book,
      positionClass: "bottom-24 left-1/2 -translate-x-1/2", // Aponta para o meio (aprox aba 3)
      arrowClass: "bottom-[-12px] left-[35%] border-t-brand-dark dark:border-t-white",
      highlightNav: 2
    },
    {
      title: "Comunidade Viva",
      description: "Não caminhe sozinho. Peça orações no Mural, veja quem está rezando por você e acompanhe o Ranking de caridade.",
      icon: Sparkles,
      positionClass: "bottom-24 right-1/2 translate-x-1/2", // Aponta para aba 4
      arrowClass: "bottom-[-12px] right-[35%] border-t-brand-dark dark:border-t-white",
      highlightNav: 3
    },
    {
      title: "Encontre Jesus",
      description: "Viajou ou mudou de bairro? Localize as Igrejas Católicas e horários de Missa mais próximos de você em segundos.",
      icon: MapPin,
      positionClass: "bottom-24 right-2 sm:right-[16%]", // Aponta para a 5ª aba
      arrowClass: "bottom-[-12px] right-20 border-t-brand-dark dark:border-t-white",
      highlightNav: 4
    },
    {
      title: "Seu Perfil",
      description: "Acompanhe suas conquistas, medalhas e configure sua conta. Aqui você vê o quanto sua alma cresceu nesta jornada.",
      icon: User,
      positionClass: "bottom-24 right-0 sm:right-4", // Aponta para a 6ª aba
      arrowClass: "bottom-[-12px] right-6 border-t-brand-dark dark:border-t-white",
      highlightNav: 5
    }
  ];

  const currentStep = steps[step];
  const isCenter = currentStep.highlightNav === -1;

  return (
    <div className={`fixed inset-0 z-[60] flex flex-col transition-opacity duration-500 ${isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      
      {/* Backdrop with Blur/Darken */}
      <div className="absolute inset-0 bg-brand-dark/80 dark:bg-black/90 backdrop-blur-sm transition-all duration-500" />

      {/* Content Card */}
      <div className={`absolute ${currentStep.positionClass} w-[90%] max-w-sm transition-all duration-500 ease-in-out`}>
        <div className="bg-white dark:bg-brand-dark border border-slate-200 dark:border-white/20 shadow-2xl rounded-[2rem] p-6 relative overflow-visible animate-slide-up ring-4 ring-brand-violet/20">
          
          {/* Decorative Blob */}
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-brand-violet/10 rounded-full blur-2xl animate-pulse-slow pointer-events-none" />

          <div className="relative z-10">
            <div className="w-14 h-14 bg-brand-violet text-white rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-brand-violet/20">
              {isCenter ? (
                <BrandLogo size={28} variant="fill" className="text-white" />
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
              <div className="flex gap-1.5">
                {steps.map((_, idx) => (
                  <div 
                    key={idx}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      idx === step ? 'w-6 bg-brand-violet' : 'w-1.5 bg-slate-200 dark:bg-white/20'
                    }`}
                  />
                ))}
              </div>

              <button 
                onClick={handleNext}
                className="bg-brand-dark dark:bg-white text-white dark:text-brand-dark px-6 py-3 rounded-xl font-bold text-sm shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
              >
                {step === steps.length - 1 ? 'Começar' : 'Próximo'} <ArrowRight size={16} />
              </button>
            </div>
          </div>

          {/* Pointer Arrow */}
          {!isCenter && (
             <div className={`absolute w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[12px] ${currentStep.arrowClass}`}></div>
          )}
        </div>
      </div>

      {/* Skip Button */}
      <button 
        onClick={onComplete}
        className="absolute top-12 right-6 text-white/60 hover:text-white text-xs font-bold uppercase tracking-wider transition-colors z-50 bg-white/10 px-4 py-2 rounded-full backdrop-blur-md"
      >
        Pular Introdução
      </button>
    </div>
  );
};

export default Tutorial;
