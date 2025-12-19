
import React, { useState, useEffect } from 'react';
import { OnboardingData } from '../types';
import { ArrowRight, Check, User, Clock, Zap, CloudRain, Heart, Coffee, Car, Moon, Sun, Anchor, Shield, Brain, Lightbulb, Mail, Phone, Lock, Eye, EyeOff, BookOpen, Users, Sword, Flower, Hammer, Crown, Wifi, AlertCircle, ArrowLeft } from 'lucide-react';
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
    bestMoment: 'morning', spiritualGoal: 'peace', patronSaint: 'michael'
  });

  const TOTAL_STEPS = 8;

  /**
   * CAPTURA DE LEAD (Resend Strategy)
   * Dispara quando o usuário termina de digitar o e-mail ou muda de campo
   */
  const handleCaptureLead = () => {
    const isEmailValid = /\S+@\S+\.\S+/.test(formData.email);
    if (isEmailValid && formData.name.trim()) {
      savePartialLead(formData.email, formData.name, step, formData);
    }
  };

  const handleNext = async () => {
    if (step === 1 && !formData.name.trim()) return;
    
    // Antes de avançar para o passo final, salvamos o progresso do lead
    if (step === 7) {
       handleCaptureLead();
    }

    if (step === 8) {
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

       const submissionData = { ...formData, email: cleanEmail, password: cleanPassword };

       try {
         await onComplete(submissionData);
       } catch (error: any) {
         setIsSubmitting(false);
         const msg = error.message?.toLowerCase() || '';
         if (msg.includes('e-mail') || msg.includes('email') || msg.includes('user already registered')) {
            setFieldErrors(prev => ({ ...prev, email: 'Este e-mail já está em uso.' }));
         }
         if (msg.includes('telefone') || msg.includes('phone')) {
            setFieldErrors(prev => ({ ...prev, phone: 'Este telefone já está cadastrado.' }));
         }
       }
       return;
    }
    setStep(step + 1);
  };

  const updateField = (field: keyof OnboardingData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (step >= 2 && step <= 7) {
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
        <p className="text-slate-500 dark:text-slate-400 text-lg leading-relaxed">Construa uma rotina espiritual que caiba na sua realidade e transforme sua alma.</p>
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
        <p className="text-slate-500 dark:text-slate-400 mb-12 font-medium text-lg">Deus te chama pelo nome.</p>
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
             <h2 className="text-2xl font-bold text-brand-dark dark:text-white mb-2">Salvar meu Plano Espiritual</h2>
             <p className="text-slate-500 dark:text-slate-400 text-sm">Crie sua conta para acessar sua rotina personalizada.</p>
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
                {fieldErrors.email && <div className="flex items-center gap-1 text-xs text-red-500 font-bold ml-1 animate-fade-in"><AlertCircle size={10} /> {fieldErrors.email}</div>}
             </div>
             <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-slate-400 ml-1">Celular (Opcional)</label>
                <div className="relative group">
                   <Phone className="absolute left-4 top-3.5 text-slate-400" size={20} />
                   <input
                     type="tel"
                     value={formData.phone}
                     onChange={(e) => updateField('phone', e.target.value)}
                     className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl py-3.5 pl-12 text-brand-dark dark:text-white placeholder:text-slate-400 outline-none focus:border-brand-violet transition-all font-medium"
                     placeholder="(00) 00000-0000"
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
        {step === 2 && renderSelectionStep('Quem intercede por você?', 'Escolha um santo guia.', 'patronSaint', [
            { val: 'acutis', label: 'B. Carlo Acutis', desc: 'Santidade digital.', icon: Wifi },
            { val: 'michael', label: 'São Miguel', desc: 'Combate espiritual.', icon: Sword },
            { val: 'therese', label: 'Santa Teresinha', desc: 'Pequenas coisas.', icon: Flower },
            { val: 'joseph', label: 'São José', desc: 'Trabalho e família.', icon: Hammer },
            { val: 'mary', label: 'Virgem Maria', desc: 'Caminho seguro.', icon: Crown }
        ])}
        {step === 3 && renderSelectionStep('Qual seu estado de vida?', 'Define seus deveres.', 'stateOfLife', [
            { val: 'student', label: 'Estudante', icon: BookOpen, desc: 'Construindo o futuro.' },
            { val: 'single', label: 'Solteiro(a)', icon: User, desc: 'Desafios do mundo.' },
            { val: 'married', label: 'Casado(a)', icon: Heart, desc: 'Santificar o lar.' },
            { val: 'parent', label: 'Com Filhos', icon: Users, desc: 'Doação total.' },
            { val: 'retired', label: 'Aposentado(a)', icon: Coffee, desc: 'A sabedoria.' }
        ])}
        {step >= 4 && step <= 7 && (
            <div className="h-full">
                {step === 4 && renderSelectionStep('Como é seu ritmo?', 'Para a carga certa.', 'routineType', [
                    { val: 'chaotic', label: 'Caótico', desc: 'Imprevisível.', icon: Zap },
                    { val: 'structured', label: 'Estruturado', desc: 'Tenho horários.', icon: Anchor },
                    { val: 'overwhelmed', label: 'Exausto', desc: 'Sem energia.', icon: CloudRain },
                    { val: 'flexible', label: 'Flexível', desc: 'Tenho tempo.', icon: Clock }
                ])}
                {step === 5 && renderSelectionStep('Sua luta principal?', 'Remédio para a alma.', 'primaryStruggle', [
                    { val: 'anxiety', label: 'Ansiedade', desc: 'Ruído mental.', icon: Brain },
                    { val: 'laziness', label: 'Preguiça', desc: 'Falta de ânimo.', icon: Coffee },
                    { val: 'dryness', label: 'Aridez', desc: 'Vazio interior.', icon: CloudRain },
                    { val: 'lust', label: 'Vícios', desc: 'Luta contra impulsos.', icon: Shield },
                    { val: 'ignorance', label: 'Dúvida', desc: 'Desconhecimento.', icon: BookOpen },
                    { val: 'pride', label: 'Soberba', desc: 'Ego.', icon: User }
                ])}
                {step === 6 && renderSelectionStep('Sua "brecha" no dia?', 'Onde encaixar Deus.', 'bestMoment', [
                    { val: 'morning', label: 'Ao acordar', desc: 'Primícias.', icon: Sun },
                    { val: 'commute', label: 'No trânsito', desc: 'Tempo morto.', icon: Car },
                    { val: 'breaks', label: 'Pausas', desc: 'Intervalos.', icon: Coffee },
                    { val: 'night', label: 'Antes de dormir', desc: 'Silêncio.', icon: Moon }
                ])}
                {step === 7 && renderSelectionStep('Seu objetivo hoje?', 'Sede da alma.', 'spiritualGoal', [
                    { val: 'peace', label: 'Paz Interior', desc: 'Silêncio.', icon: Brain },
                    { val: 'truth', label: 'Sabedoria', desc: 'Entendimento.', icon: BookOpen },
                    { val: 'discipline', label: 'Força', desc: 'Vencer-se.', icon: Shield },
                    { val: 'love', label: 'Amar', desc: 'Perdoar.', icon: Heart }
                ])}
            </div>
        )}
        {step === 8 && renderAccountCreation()}
      </div>
      {step > 0 && (
        <div className="fixed top-0 left-0 right-0 p-6 pt-8 bg-slate-50 dark:bg-brand-dark z-30">
          <div className="max-w-2xl mx-auto">
            <div className="flex justify-between items-center mb-4">
              <button onClick={() => setStep(step - 1)} className="text-slate-400 font-bold text-sm">Voltar</button>
              <span className="text-[10px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-widest">PASSO {step} / {TOTAL_STEPS}</span>
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
