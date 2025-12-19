
import React, { useState, useEffect } from 'react';
import { OnboardingData } from '../types';
import { ArrowRight, Check, User, Clock, Zap, CloudRain, Heart, Coffee, Car, Moon, Sun, Anchor, Shield, Brain, Lightbulb, Mail, Phone, Lock, Eye, EyeOff, BookOpen, Users, Sword, Flower, Hammer, Crown, Wifi, AlertCircle, ArrowLeft, MessageSquare } from 'lucide-react';
import BrandLogo from './BrandLogo';
import { savePartialLead } from '../services/databaseService';

interface OnboardingProps {
  onComplete: (data: OnboardingData) => Promise<void>;
  onBack: () => void;
}

interface SelectionCardProps {
  selected: boolean;
  onClick: () => void;
  icon: React.ElementType;
  title: string;
  description?: string;
  layout?: 'vertical' | 'horizontal';
}

const SelectionCard: React.FC<SelectionCardProps> = ({ 
  selected, 
  onClick, 
  icon: Icon, 
  title, 
  description,
  layout = 'horizontal'
}) => (
  <button
    onClick={onClick}
    className={`w-full relative group overflow-hidden rounded-2xl border-2 transition-all duration-300 ease-out active:scale-[0.98] flex text-left ${
      layout === 'vertical' ? 'flex-col items-center text-center p-4 gap-3' : 'flex-row items-center p-4 gap-4'
    } ${
      selected 
        ? 'border-brand-violet bg-brand-violet shadow-xl shadow-brand-violet/20 scale-[1.01] z-10' 
        : 'border-slate-100 dark:border-white/5 bg-white dark:bg-white/5 hover:border-brand-violet/30 hover:bg-slate-50 dark:hover:bg-white/10'
    }`}
  >
    <div className={`absolute top-3 right-3 transition-all duration-300 z-20 ${selected ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}`}>
      <div className="bg-white/20 backdrop-blur-sm rounded-full p-1">
        <Check size={12} className="text-white" strokeWidth={3} />
      </div>
    </div>
    <div className={`flex-shrink-0 rounded-xl flex items-center justify-center transition-colors duration-300 ${
      layout === 'vertical' ? 'w-12 h-12' : 'w-12 h-12'
    } ${
      selected 
        ? 'bg-white/20 text-white' 
        : 'bg-slate-50 dark:bg-white/10 text-slate-400 dark:text-slate-400 group-hover:text-brand-violet group-hover:bg-brand-violet/10'
    }`}>
       <Icon size={layout === 'vertical' ? 24 : 22} strokeWidth={1.5} />
    </div>
    <div className="flex-1 min-w-0 w-full z-10">
      <p className={`font-bold leading-tight mb-1 transition-colors break-words hyphens-auto ${
        layout === 'vertical' ? 'text-sm' : 'text-base'
      } ${
        selected ? 'text-white' : 'text-brand-dark dark:text-white'
      }`}>
        {title}
      </p>
      {description && (
        <p className={`text-xs leading-relaxed transition-colors line-clamp-3 ${
          selected ? 'text-white/80 font-medium' : 'text-slate-500 dark:text-slate-400'
        }`}>
          {description}
        </p>
      )}
    </div>
  </button>
);

const Onboarding: React.FC<OnboardingProps> = ({ onComplete, onBack }) => {
  const [step, setStep] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ email?: string, phone?: string }>({});
  
  const [formData, setFormData] = useState<OnboardingData>({
    name: '', email: '', phone: '', password: '',
    stateOfLife: 'single', routineType: 'structured', primaryStruggle: 'anxiety',
    bestMoment: 'morning', spiritualGoal: 'peace', patronSaint: 'michael',
    confessionFrequency: 'long_time'
  });

  const TOTAL_STEPS = 9;

  const handleCaptureLead = () => {
    const isEmailValid = /\S+@\S+\.\S+/.test(formData.email);
    if (isEmailValid && formData.name.trim()) {
      savePartialLead(formData.email, formData.name, step, formData);
    }
  };

  const handleNext = async () => {
    if (step === 1 && !formData.name.trim()) return;
    
    if (step === 8) {
       handleCaptureLead();
    }

    if (step === 9) {
       const cleanEmail = formData.email.trim();
       const cleanPassword = formData.password?.trim() || '';

       if (!/\S+@\S+\.\S+/.test(cleanEmail)) {
          setFieldErrors(prev => ({ ...prev, email: 'Digite um e-mail válido.' }));
          return;
       }
       if (cleanPassword.length < 6) {
          alert('A senha deve ter no mínimo 6 caracteres.');
          return;
       }
       
       setIsSubmitting(true);
       setFieldErrors({});

       try {
         await onComplete({ ...formData, email: cleanEmail, password: cleanPassword });
       } catch (error: any) {
         setIsSubmitting(false);
         setFieldErrors(prev => ({ ...prev, email: 'Erro no cadastro. Verifique os dados.' }));
       }
       return;
    }
    setStep(step + 1);
  };

  const updateField = (field: keyof OnboardingData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (step >= 2 && step <= 8) {
        setTimeout(() => setStep(prev => Math.min(prev + 1, TOTAL_STEPS)), 350); 
    }
  };

  const renderWelcome = () => (
    <div className="flex flex-col h-full justify-center items-center text-center space-y-8 px-6 animate-fade-in relative">
      <button onClick={onBack} className="absolute top-6 left-6 text-slate-400 hover:text-brand-dark dark:hover:text-white transition-colors flex items-center gap-1 font-bold text-sm">
        <ArrowLeft size={18} /> Voltar
      </button>
      <div className="mb-6 relative">
        <div className="absolute inset-0 bg-brand-violet/20 blur-3xl rounded-full animate-pulse-slow" />
        <BrandLogo size={120} className="text-brand-violet relative z-10 drop-shadow-xl" variant="fill" />
      </div>
      <div className="space-y-4 max-w-md">
        <h1 className="text-4xl font-extrabold text-brand-dark dark:text-white tracking-tight">Espiritualizei</h1>
        <p className="text-slate-500 dark:text-slate-400 text-lg leading-relaxed">Sua jornada espiritual organizada e adaptada ao seu tempo.</p>
      </div>
      <button onClick={handleNext} className="w-full max-w-xs bg-brand-violet text-white font-bold py-4 rounded-2xl shadow-xl shadow-brand-violet/30 hover:bg-purple-600 transition-all flex items-center justify-center gap-2 active:scale-95">
        Começar Jornada <ArrowRight size={20} />
      </button>
    </div>
  );

  const renderName = () => (
    <div className="flex flex-col h-full pt-32 px-6 animate-slide-in-right overflow-y-auto">
      <div className="max-w-lg mx-auto w-full">
        <h2 className="text-3xl font-bold text-brand-dark dark:text-white mb-3">Como você se chama?</h2>
        <p className="text-slate-500 dark:text-slate-400 mb-12 font-medium text-lg">Gostaríamos de personalizar sua experiência.</p>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          onKeyDown={(e) => e.key === 'Enter' && formData.name.trim() && handleNext()}
          className="text-4xl font-bold text-brand-dark dark:text-white border-b-2 border-slate-200 dark:border-slate-700 focus:border-brand-violet outline-none py-4 bg-transparent placeholder:text-slate-300 w-full transition-all"
          placeholder="Digite seu nome..."
          autoFocus
        />
        <div className="mt-auto pt-12 pb-8">
          <button onClick={handleNext} disabled={!formData.name.trim()} className="w-full bg-brand-dark dark:bg-white text-white dark:text-brand-dark py-4 rounded-2xl disabled:opacity-50 transition-all shadow-lg font-bold text-lg flex items-center justify-center gap-2">
            Continuar <ArrowRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );

  const renderSelectionStep = (title: string, subtitle: string, field: keyof OnboardingData, options: any[], hint?: any) => (
    <div className="flex flex-col h-full pt-32 px-6 animate-slide-in-right overflow-y-auto pb-32">
      <div className="max-w-lg mx-auto w-full">
        <h2 className="text-2xl font-bold text-brand-dark dark:text-white mb-2">{title}</h2>
        <p className="text-slate-500 dark:text-slate-400 mb-8 text-sm font-medium">{subtitle}</p>
        <div className="space-y-3">
          {options.map((opt) => (
            <SelectionCard
              key={opt.val}
              selected={formData[field] === opt.val}
              onClick={() => updateField(field, opt.val)}
              icon={opt.icon}
              title={opt.label}
              description={opt.desc}
            />
          ))}
        </div>
        {hint && (
           <div className="mt-8 p-4 rounded-2xl bg-brand-violet/5 dark:bg-white/5 border border-brand-violet/10 dark:border-white/10 flex gap-4 items-start">
             <div className="w-8 h-8 rounded-full bg-brand-violet/10 flex items-center justify-center text-brand-violet shrink-0 mt-0.5"><Lightbulb size={16} /></div>
             <div>
               <p className="text-xs font-bold text-brand-violet uppercase tracking-wide mb-1">Insight</p>
               <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{hint}</p>
             </div>
           </div>
        )}
      </div>
    </div>
  );

  const renderAccountCreation = () => {
    const isEmailValid = /\S+@\S+\.\S+/.test(formData.email);
    const isPasswordValid = (formData.password || '').length >= 6;
    const isValid = isEmailValid && isPasswordValid;

    return (
      <div className="flex flex-col h-full pt-24 px-6 animate-slide-in-right overflow-y-auto pb-10">
        <div className="max-w-lg mx-auto w-full">
          <div className="text-center mb-8">
             <div className="w-16 h-16 bg-brand-violet/10 text-brand-violet rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Shield size={32} />
             </div>
             <h2 className="text-2xl font-bold text-brand-dark dark:text-white mb-2">Salvar meu Plano</h2>
             <p className="text-slate-500 dark:text-slate-400 text-sm">Crie sua conta para acessar sua rotina em qualquer lugar.</p>
          </div>
          <div className="space-y-4 bg-white dark:bg-white/5 p-6 rounded-[2rem] border border-slate-100 dark:border-white/5 shadow-xl">
             <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-slate-400 ml-1">E-mail</label>
                <div className="relative group">
                   <Mail className={`absolute left-4 top-3.5 transition-colors ${fieldErrors.email ? 'text-red-500' : 'text-slate-400 group-focus-within:text-brand-violet'}`} size={20} />
                   <input
                     type="email"
                     value={formData.email}
                     onBlur={handleCaptureLead}
                     onChange={(e) => {
                        setFormData(prev => ({ ...prev, email: e.target.value }));
                        if(fieldErrors.email) setFieldErrors(prev => ({...prev, email: undefined}));
                     }}
                     className={`w-full bg-slate-50 dark:bg-black/20 border rounded-xl py-3.5 pl-12 text-brand-dark dark:text-white placeholder:text-slate-400 outline-none transition-all font-medium ${fieldErrors.email ? 'border-red-500 focus:border-red-500' : 'border-slate-200 dark:border-white/10 focus:border-brand-violet'}`}
                     placeholder="seu@email.com"
                   />
                </div>
             </div>
             <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-slate-400 ml-1">Criar Senha</label>
                <div className="relative group">
                   <Lock className="absolute left-4 top-3.5 text-slate-400" size={20} />
                   <input
                     type={showPassword ? "text" : "password"}
                     value={formData.password}
                     onChange={(e) => updateField('password', e.target.value)}
                     className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl py-3.5 pl-12 pr-12 text-brand-dark dark:text-white placeholder:text-slate-400 outline-none focus:border-brand-violet transition-all font-medium"
                     placeholder="Mínimo 6 caracteres"
                   />
                   <button onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-3.5 text-slate-400 hover:text-brand-violet transition-colors">
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                   </button>
                </div>
             </div>
          </div>
          <div className="mt-8">
             <button onClick={handleNext} disabled={!isValid || isSubmitting} className={`w-full py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 shadow-xl transition-all ${isValid ? 'bg-brand-violet text-white hover:bg-purple-600' : 'bg-slate-200 dark:bg-white/10 text-slate-400 cursor-not-allowed'}`}>
                {isSubmitting ? <span className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <>Finalizar Cadastro <ArrowRight size={20} /></>}
             </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-[100dvh] h-[100dvh] bg-slate-50 dark:bg-brand-dark relative overflow-hidden font-sans">
      <div className="absolute top-[-20%] right-[-20%] w-[50%] h-[50%] bg-brand-violet/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="h-full max-w-2xl mx-auto">
        {step === 0 && renderWelcome()}
        {step === 1 && renderName()}
        {step === 2 && renderSelectionStep('Como é seu ritmo diário?', 'Para criarmos uma carga adequada.', 'routineType', [
            { val: 'chaotic', label: 'Inconstante', desc: 'Meu dia muda o tempo todo.', icon: Zap },
            { val: 'structured', label: 'Organizado', desc: 'Tenho horários definidos.', icon: Anchor },
            { val: 'overwhelmed', label: 'Exausto', desc: 'Sinto que não sobra tempo.', icon: CloudRain },
            { val: 'flexible', label: 'Livre', desc: 'Consigo encaixar tarefas.', icon: Clock }
        ])}
        {step === 3 && renderSelectionStep('Sua luta principal hoje?', 'Focaremos o plano nisso.', 'primaryStruggle', [
            { val: 'anxiety', label: 'Ansiedade', desc: 'Busco paz interior.', icon: Brain },
            { val: 'laziness', label: 'Procrastinação', desc: 'Falta de ânimo espiritual.', icon: Coffee },
            { val: 'dryness', label: 'Aridez', desc: 'Dificuldade em sentir Deus.', icon: CloudRain },
            { val: 'lust', label: 'Vícios', desc: 'Luta contra impulsos.', icon: Shield },
            { val: 'pride', label: 'Egoísmo', desc: 'Necessidade de servir mais.', icon: User }
        ])}
        {step === 4 && renderSelectionStep('Sua relação com a Confissão?', 'Para seu cuidado sacramental.', 'confessionFrequency', [
            { val: 'frequent', label: 'Frequente', desc: 'A cada 15-30 dias.', icon: Shield },
            { val: 'rare', label: 'Raramente', desc: 'Uma ou duas vezes por ano.', icon: MessageSquare },
            { val: 'long_time', label: 'Faz muito tempo', desc: 'Gostaria de voltar.', icon: Heart },
            { val: 'never', label: 'Nunca me confessei', desc: 'Desejo conhecer mais.', icon: BookOpen }
        ])}
        {step === 5 && renderSelectionStep('Onde é mais fácil rezar?', 'Para sugerir os melhores horários.', 'bestMoment', [
            { val: 'morning', label: 'Ao acordar', desc: 'Primícias do dia.', icon: Sun },
            { val: 'commute', label: 'No trajeto', desc: 'Tempo de trânsito.', icon: Car },
            { val: 'breaks', label: 'Pausas', desc: 'Intervalos de trabalho.', icon: Coffee },
            { val: 'night', label: 'Antes de dormir', desc: 'No silêncio da noite.', icon: Moon }
        ])}
        {step === 6 && renderSelectionStep('Seu objetivo espiritual?', 'Para alinhar o propósito.', 'spiritualGoal', [
            { val: 'peace', label: 'Paz Interior', desc: 'Quietude e confiança.', icon: Brain },
            { val: 'truth', label: 'Conhecimento', desc: 'Entender melhor a fé.', icon: BookOpen },
            { val: 'discipline', label: 'Fortaleza', desc: 'Vencer a si mesmo.', icon: Shield },
            { val: 'love', label: 'Caridade', desc: 'Amar a Deus e ao próximo.', icon: Heart }
        ])}
        {step === 7 && renderSelectionStep('Qual seu estado de vida?', 'Define seus deveres.', 'stateOfLife', [
            { val: 'student', label: 'Estudante', icon: BookOpen, desc: 'Foco em estudos e futuro.' },
            { val: 'single', label: 'Solteiro(a)', icon: User, desc: 'Foco em santidade no mundo.' },
            { val: 'married', label: 'Casado(a)', icon: Heart, desc: 'Santificar o lar e família.' },
            { val: 'parent', label: 'Com Filhos', icon: Users, desc: 'Doação total ao próximo.' },
            { val: 'retired', label: 'Aposentado(a)', icon: Coffee, desc: 'Foco em sabedoria e oração.' }
        ])}
        {step === 8 && renderSelectionStep('Quem intercede por você?', 'Escolha um guia de santidade.', 'patronSaint', [
            { val: 'acutis', label: 'B. Carlo Acutis', desc: 'Mestre da internet.', icon: Wifi },
            { val: 'michael', label: 'São Miguel', desc: 'Combate espiritual.', icon: Sword },
            { val: 'therese', label: 'Santa Teresinha', desc: 'A pequena via.', icon: Flower },
            { val: 'joseph', label: 'São José', desc: 'Trabalho e família.', icon: Hammer },
            { val: 'mary', label: 'Virgem Maria', desc: 'A porta do céu.', icon: Crown }
        ])}
        {step === 9 && renderAccountCreation()}
      </div>
      {step > 0 && (
        <div className="fixed top-0 left-0 right-0 p-6 pt-8 bg-slate-50 dark:bg-brand-dark z-30">
          <div className="max-w-2xl mx-auto">
            <div className="flex justify-between items-center mb-4">
              <button onClick={() => setStep(step - 1)} className="text-slate-400 font-bold text-sm">Voltar</button>
              <span className="text-[10px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-widest">PROCESSO {step} / {TOTAL_STEPS}</span>
            </div>
            <div className="flex gap-1 h-1">
              {Array.from({ length: TOTAL_STEPS }, (_, i) => i + 1).map(i => (
                <div key={i} className={`rounded-full transition-all duration-500 flex-1 ${i <= step ? 'bg-brand-violet' : 'bg-slate-200 dark:bg-white/10'}`} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Onboarding;
