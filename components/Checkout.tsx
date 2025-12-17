
import React, { useState } from 'react';
import { Check, Shield, Zap, Star, Lock, ArrowRight, LogOut, CheckCircle2, Heart, RefreshCw, BookOpen, Users } from 'lucide-react';
import BrandLogo from './BrandLogo';

interface CheckoutProps {
  onSuccess: () => void;
  userName: string;
  onLogout: () => void;
}

const Checkout: React.FC<CheckoutProps> = ({ onSuccess, userName, onLogout }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubscribe = async () => {
    setIsLoading(true);
    // SIMULAÇÃO DE PROCESSAMENTO DO STRIPE
    setTimeout(() => {
      setIsLoading(false);
      onSuccess();
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-brand-dark flex flex-col relative overflow-hidden font-sans transition-colors">
      {/* Background Effects */}
      <div className="absolute top-0 left-0 w-full h-[300px] bg-brand-violet/10 rounded-b-[3rem] z-0" />
      <div className="absolute top-[-100px] right-[-100px] w-64 h-64 bg-brand-violet/20 rounded-full blur-[80px] animate-pulse-slow pointer-events-none" />

      <div className="relative z-10 flex-1 flex flex-col items-center px-6 pt-12 pb-8 overflow-y-auto">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-white dark:bg-white/10 rounded-2xl flex items-center justify-center shadow-xl shadow-brand-violet/20 mx-auto mb-6 border border-white/20">
             <BrandLogo size={40} variant="fill" />
          </div>
          <h1 className="text-3xl font-extrabold text-brand-dark dark:text-white mb-2">
            Vamos começar?
          </h1>
          <p className="text-slate-600 dark:text-slate-300 text-lg">
            {userName}, sua rotina de fé organizada está a um passo.
          </p>
        </div>

        {/* Single Plan Card */}
        <div className="w-full max-w-lg bg-white dark:bg-[#1A1F26] rounded-[2.5rem] p-8 border border-slate-100 dark:border-white/5 shadow-2xl shadow-brand-violet/10 mb-8 relative overflow-hidden">
           {/* Top Gradient Line */}
           <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-brand-violet to-purple-500" />
           
           <div className="flex flex-col items-center text-center mb-8">
              <span className="bg-brand-violet/10 text-brand-violet text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest mb-4">Acesso Total</span>
              <div className="flex items-center justify-center gap-1 mb-2">
                 <span className="text-2xl font-bold text-slate-400 align-top mt-2">R$</span>
                 <span className="text-6xl font-black text-brand-dark dark:text-white tracking-tighter">37,90</span>
              </div>
              <p className="text-slate-400 text-sm font-medium">cobrança mensal • cancele quando quiser</p>
           </div>

           {/* Value Stack - Emotional & Functional */}
           <div className="space-y-5 mb-8">
              <div className="flex gap-4">
                 <div className="w-10 h-10 rounded-full bg-green-500/10 text-green-600 flex items-center justify-center shrink-0"><RefreshCw size={20} /></div>
                 <div>
                    <h4 className="font-bold text-brand-dark dark:text-white text-sm">Desafios Diários para sua Realidade</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mt-0.5">Metas espirituais ajustáveis ao seu tempo e ritmo de vida, sem pesos impossíveis.</p>
                 </div>
              </div>

              <div className="flex gap-4">
                 <div className="w-10 h-10 rounded-full bg-purple-500/10 text-purple-600 flex items-center justify-center shrink-0"><Users size={20} /></div>
                 <div>
                    <h4 className="font-bold text-brand-dark dark:text-white text-sm">Feed de Intercessão & Ranking</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mt-0.5">Partilhe graças, testemunhos e acompanhe seu progresso junto com a comunidade.</p>
                 </div>
              </div>

              <div className="flex gap-4">
                 <div className="w-10 h-10 rounded-full bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0"><BookOpen size={20} /></div>
                 <div>
                    <h4 className="font-bold text-brand-dark dark:text-white text-sm">Biblioteca de Fé & Tira-Dúvidas</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mt-0.5">Conteúdo prático para estudo e um chat dedicado para esclarecer suas questões.</p>
                 </div>
              </div>

              <div className="flex gap-4">
                 <div className="w-10 h-10 rounded-full bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0"><Shield size={20} /></div>
                 <div>
                    <h4 className="font-bold text-brand-dark dark:text-white text-sm">Ambiente Seguro sem Anúncios</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mt-0.5">Um espaço focado no essencial, sem distrações comerciais e com privacidade total.</p>
                 </div>
              </div>
           </div>

           {/* CTA Button */}
           <button
             onClick={handleSubscribe}
             disabled={isLoading}
             className="w-full bg-brand-violet text-white font-bold text-lg py-4 rounded-2xl shadow-xl shadow-brand-violet/30 hover:bg-purple-600 transition-all active:scale-95 flex items-center justify-center gap-2 group"
           >
              {isLoading ? (
                <>Confirmando acesso <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /></>
              ) : (
                <>Iniciar Assinatura <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" /></>
              )}
           </button>
           
           <p className="text-[10px] text-center text-slate-400 mt-4">
              Pagamento processado de forma segura via Stripe.
           </p>
        </div>
        
        {/* Footer Actions */}
        <div className="flex flex-col items-center gap-4">
           <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
              <Lock size={12} />
              <span>Ambiente Seguro. Garantia de 7 dias.</span>
           </div>
           
           <button onClick={onLogout} className="text-xs text-slate-400 hover:text-brand-violet underline flex items-center gap-1">
              <LogOut size={10} /> Sair / Começar de novo
           </button>
        </div>

      </div>
    </div>
  );
};

export default Checkout;
