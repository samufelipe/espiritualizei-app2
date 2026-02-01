
import React, { useState, useEffect } from 'react';
import { CheckCircle2, Book, Heart, ArrowRight, User, Trophy, Mail, Sparkles, Crown, Lock, Flame, Target, Gift } from 'lucide-react';
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
    if (step < steps.length - 1) {
      setStep(prev => prev + 1);
    } else {
      setIsVisible(false);
      setTimeout(onComplete, 500);
    }
  };

  const firstName = user.name.split(' ')[0];

  // Tour Guiado Persuasivo - Estratégia de Produto
  const steps = [
    {
      title: `Bem-vindo ao Espiritualizei, ${firstName}!`,
      description: "Você acaba de dar o passo mais importante para transformar sua vida espiritual. Este não é apenas um app – é o seu santuário digital, criado para te ajudar a ter constância e profundidade na oração.",
      icon: BrandLogo,
      positionClass: "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
      arrowClass: "hidden", 
      highlightNav: -1,
      badge: null
    },
    {
      title: "Sua Rotina Personalizada",
      description: "Com base nas suas respostas, criamos uma jornada espiritual única para você. Cada dia traz práticas adaptadas à sua realidade – orações, reflexões e desafios que cabem na sua rotina.",
      icon: CheckCircle2,
      positionClass: "bottom-24 left-4 sm:left-[16%]",
      arrowClass: "bottom-[-12px] left-8 border-t-brand-dark dark:border-t-white", 
      highlightNav: 1,
      badge: "Gratuito"
    },
    {
      title: "Biblioteca da Fé",
      description: "Acesse centenas de conteúdos sobre Doutrina, Liturgia, Santos e Espiritualidade. Ninguém ama o que não conhece – aqui você alimenta sua inteligência e fortalece sua fé.",
      icon: Book,
      positionClass: "bottom-24 left-1/2 -translate-x-1/2",
      arrowClass: "bottom-[-12px] left-[35%] border-t-brand-dark dark:border-t-white",
      highlightNav: 2,
      badge: "Premium"
    },
    {
      title: "Comunidade de Oração",
      description: "Você nunca caminha sozinho. Peça orações no mural, reze pelas intenções de outros irmãos e participe de desafios comunitários que renovam a cada 3 dias!",
      icon: Heart,
      positionClass: "bottom-24 right-1/2 translate-x-1/2",
      arrowClass: "bottom-[-12px] right-[35%] border-t-brand-dark dark:border-t-white",
      highlightNav: 3,
      badge: "Gratuito"
    },
    {
      title: "Ranking de Caridade",
      description: "Ganhe XP ao completar sua rotina e rezar pelos outros. Suba de nível, conquiste medalhas e veja sua alma crescer. Um incentivo fraterno para sua constância!",
      icon: Trophy,
      positionClass: "bottom-24 right-2 sm:right-[16%]",
      arrowClass: "bottom-[-12px] right-20 border-t-brand-dark dark:border-t-white",
      highlightNav: 4,
      badge: "Gratuito"
    },
    {
      title: "Seu Perfil Espiritual",
      description: "Acompanhe suas conquistas, nível de maturidade espiritual e configure sua conta. Aqui você vê o quanto sua alma cresceu nesta jornada.",
      icon: User,
      positionClass: "bottom-24 right-0 sm:right-4",
      arrowClass: "bottom-[-12px] right-6 border-t-brand-dark dark:border-t-white",
      highlightNav: 5,
      badge: null
    },
    {
      title: "Desbloqueie Todo o Potencial",
      description: "Com o Premium, você tem acesso à Biblioteca completa, Chat da Comunidade, Plano de Vida adaptável e muito mais. Invista na sua alma – ela é eterna!",
      icon: Crown,
      positionClass: "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
      arrowClass: "hidden",
      highlightNav: -1,
      badge: "Premium",
      isPremiumSlide: true
    },
    {
      title: "Um Presente para Você",
      description: "Enviamos um e-mail especial de boas-vindas com dicas para começar sua jornada. Verifique sua caixa de entrada e prepare-se para uma transformação real!",
      icon: Mail,
      positionClass: "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
      arrowClass: "hidden",
      highlightNav: -1,
      badge: null
    }
  ];

  const currentStep = steps[step];
  const isCenter = currentStep.highlightNav === -1;
  const isPremiumSlide = (currentStep as any).isPremiumSlide;

  return (
    <div className={`fixed inset-0 z-[60] flex flex-col transition-opacity duration-500 ${isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      
      {/* Backdrop with Blur/Darken */}
      <div className={`absolute inset-0 backdrop-blur-sm transition-all duration-500 ${isPremiumSlide ? 'bg-brand-violet/90' : 'bg-brand-dark/80 dark:bg-black/90'}`} />

      {/* Content Card */}
      <div className={`absolute ${currentStep.positionClass} w-[90%] max-w-sm transition-all duration-500 ease-in-out`}>
        <div className={`border shadow-2xl rounded-[2rem] p-6 relative overflow-visible animate-slide-up ${isPremiumSlide ? 'bg-gradient-to-br from-brand-violet to-purple-700 border-white/20 ring-4 ring-white/20' : 'bg-white dark:bg-brand-dark border-slate-200 dark:border-white/20 ring-4 ring-brand-violet/20'}`}>
          
          {/* Decorative Blob */}
          <div className={`absolute -top-10 -right-10 w-32 h-32 rounded-full blur-2xl animate-pulse-slow pointer-events-none ${isPremiumSlide ? 'bg-white/20' : 'bg-brand-violet/10'}`} />

          {/* Badge */}
          {currentStep.badge && (
            <div className={`absolute -top-3 right-6 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${currentStep.badge === 'Premium' ? 'bg-amber-400 text-amber-900' : 'bg-green-500 text-white'}`}>
              {currentStep.badge === 'Premium' && <Crown size={10} className="inline mr-1" />}
              {currentStep.badge}
            </div>
          )}

          <div className="relative z-10">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 shadow-lg ${isPremiumSlide ? 'bg-white text-brand-violet' : 'bg-brand-violet text-white shadow-brand-violet/20'}`}>
              {isCenter && !isPremiumSlide ? (
                <BrandLogo size={28} variant="fill" className="text-white" />
              ) : (
                <currentStep.icon size={28} />
              )}
            </div>

            <h3 className={`text-2xl font-bold mb-3 leading-tight ${isPremiumSlide ? 'text-white' : 'text-brand-dark dark:text-white'}`}>
              {currentStep.title}
            </h3>
            
            <p className={`leading-relaxed mb-6 text-base font-medium ${isPremiumSlide ? 'text-white/90' : 'text-slate-600 dark:text-slate-300'}`}>
              {currentStep.description}
            </p>

            {/* Premium Benefits List */}
            {isPremiumSlide && (
              <div className="bg-white/10 rounded-xl p-4 mb-6 space-y-2">
                {['Biblioteca completa de formação', 'Chat da Comunidade em tempo real', 'Plano de vida adaptável mensal', 'Sem anúncios ou interrupções'].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs font-bold text-white">
                    <CheckCircle2 size={14} className="text-green-400 shrink-0" />
                    {item}
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between">
              {/* Progress Dots */}
              <div className="flex gap-1.5">
                {steps.map((_, idx) => (
                  <div 
                    key={idx}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      idx === step ? `w-6 ${isPremiumSlide ? 'bg-white' : 'bg-brand-violet'}` : `w-1.5 ${isPremiumSlide ? 'bg-white/30' : 'bg-slate-200 dark:bg-white/20'}`
                    }`}
                  />
                ))}
              </div>

              <button 
                onClick={handleNext}
                className={`px-6 py-3 rounded-xl font-bold text-sm shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 ${isPremiumSlide ? 'bg-white text-brand-violet' : 'bg-brand-dark dark:bg-white text-white dark:text-brand-dark'}`}
              >
                {step === steps.length - 1 ? 'Começar Jornada' : 'Próximo'} <ArrowRight size={16} />
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
