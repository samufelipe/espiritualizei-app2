
import React, { useState } from 'react';
import { Check, Shield, Zap, Star, Lock, ArrowRight, LogOut } from 'lucide-react';
import BrandLogo from './BrandLogo';
import { logoutUser } from '../services/authService';

interface CheckoutProps {
  onSuccess: () => void;
  userName: string;
}

const Checkout: React.FC<CheckoutProps> = ({ onSuccess, userName }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'semestral'>('semestral');

  const handleSubscribe = async () => {
    setIsLoading(true);
    
    // SIMULAÇÃO DE PROCESSAMENTO DO STRIPE
    setTimeout(() => {
      setIsLoading(false);
      onSuccess();
    }, 2000);
  };

  const handleLogout = async () => {
     await logoutUser();
     window.location.reload();
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-brand-dark flex flex-col relative overflow-hidden font-sans transition-colors">
      {/* Background Effects */}
      <div className="absolute top-0 left-0 w-full h-[400px] bg-brand-violet/10 rounded-b-[3rem] z-0" />
      <div className="absolute top-[-100px] right-[-100px] w-64 h-64 bg-brand-violet/20 rounded-full blur-[80px] animate-pulse-slow pointer-events-none" />

      <div className="relative z-10 flex-1 flex flex-col items-center px-6 pt-12 pb-8 overflow-y-auto">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-white dark:bg-white/10 rounded-2xl flex items-center justify-center shadow-xl shadow-brand-violet/20 mx-auto mb-6 border border-white/20">
             <BrandLogo size={40} variant="fill" />
          </div>
          <h1 className="text-3xl font-extrabold text-brand-dark dark:text-white mb-2">
            A última etapa.
          </h1>
          <p className="text-slate-600 dark:text-slate-300 text-lg">
            {userName}, garanta agora as ferramentas para sua constância espiritual.
          </p>
        </div>

        {/* Plan Cards */}
        <div className="w-full max-w-md space-y-4 mb-8">
           {/* Semestral Plan (Best Value) */}
           <button
             onClick={() => setSelectedPlan('semestral')}
             className={`w-full relative p-6 rounded-3xl border-2 transition-all duration-300 text-left group ${
               selectedPlan === 'semestral' 
                 ? 'bg-white dark:bg-white/10 border-brand-violet shadow-xl shadow-brand-violet/10 scale-[1.02]' 
                 : 'bg-white/60 dark:bg-white/5 border-transparent hover:border-brand-violet/30'
             }`}
           >
              {selectedPlan === 'semestral' && (
                <div className="absolute -top-3 right-6 bg-brand-violet text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-md animate-bounce">
                   RECOMENDADO
                </div>
              )}
              <div className="flex justify-between items-center mb-2">
                 <span className={`font-bold text-lg ${selectedPlan === 'semestral' ? 'text-brand-violet' : 'text-slate-500 dark:text-slate-400'}`}>Plano Semestral</span>
                 <div className="text-right">
                    <span className="text-2xl font-black text-brand-dark dark:text-white">R$ 189,90</span>
                    <span className="text-xs font-bold text-slate-400">/total</span>
                 </div>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-0">Apenas <b>R$ 31,65/mês</b> por um diretor espiritual.</p>
              <div className="mt-2 text-xs font-bold text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400 px-2 py-1 rounded-lg inline-block">
                 Economia inteligente de R$ 37,50
              </div>
           </button>

           {/* Monthly Plan */}
           <button
             onClick={() => setSelectedPlan('monthly')}
             className={`w-full relative p-6 rounded-3xl border-2 transition-all duration-300 text-left ${
               selectedPlan === 'monthly' 
                 ? 'bg-white dark:bg-white/10 border-brand-violet shadow-xl shadow-brand-violet/10 scale-[1.02]' 
                 : 'bg-white/60 dark:bg-white/5 border-transparent hover:border-brand-violet/30'
             }`}
           >
              <div className="flex justify-between items-center mb-1">
                 <span className={`font-bold text-lg ${selectedPlan === 'monthly' ? 'text-brand-violet' : 'text-slate-500 dark:text-slate-400'}`}>Plano Mensal</span>
                 <div className="text-right">
                    <span className="text-2xl font-black text-brand-dark dark:text-white">R$ 37,90</span>
                    <span className="text-xs font-bold text-slate-400">/mês</span>
                 </div>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Pagamento recorrente. Sem fidelidade.</p>
           </button>
        </div>

        {/* Features List (Value Stack) */}
        <div className="w-full max-w-md bg-slate-100/50 dark:bg-white/5 rounded-3xl p-6 mb-8">
           <h3 className="text-xs font-bold uppercase text-slate-400 dark:text-slate-500 tracking-widest mb-4">O que você recebe agora</h3>
           <ul className="space-y-3">
              {[
                'Direcionamento Espiritual Personalizado (24h)',
                'Regra de Vida adaptada à sua realidade',
                'Comunidade Exclusiva de Intercessão',
                'Diário da Alma com Análise Espiritual',
                'Formação Católica (Doutrina e Liturgia)'
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-sm font-medium text-brand-dark dark:text-slate-200">
                   <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center text-white shrink-0">
                      <Check size={12} strokeWidth={3} />
                   </div>
                   {item}
                </li>
              ))}
           </ul>
        </div>

        {/* CTA Button */}
        <button
          onClick={handleSubscribe}
          disabled={isLoading}
          className="w-full max-w-md bg-brand-violet text-white font-bold text-lg py-4 rounded-2xl shadow-2xl shadow-brand-violet/30 hover:bg-purple-600 transition-all active:scale-95 flex items-center justify-center gap-2"
        >
           {isLoading ? (
             <>Confirmando acesso <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /></>
           ) : (
             <>Assinar Plano {selectedPlan === 'semestral' ? 'Semestral' : 'Mensal'} <ArrowRight size={20} /></>
           )}
        </button>
        
        <div className="mt-6 flex flex-col items-center gap-4">
           <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
              <Lock size={12} />
              <span>Pagamento 100% Seguro e Criptografado.</span>
           </div>
           
           {/* EXIT BUTTON */}
           <button onClick={handleLogout} className="text-xs text-slate-400 hover:text-brand-violet underline flex items-center gap-1">
              <LogOut size={10} /> Sair / Começar de novo
           </button>
        </div>

      </div>
    </div>
  );
};

export default Checkout;
