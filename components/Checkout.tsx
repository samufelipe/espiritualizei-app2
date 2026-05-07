
import React, { useState } from 'react';
import { Check, Shield, Zap, Lock, ArrowRight, LogOut, RefreshCw, BookOpen, Users, Star, ArrowLeft, Loader2, Sparkles } from 'lucide-react';
import BrandLogo from './BrandLogo';

interface CheckoutProps {
  onSuccess: () => void;
  onVerifyPayment?: () => Promise<void>;
  userName: string;
  userEmail: string;
  userId: string;
  onLogout: () => void;
}

import { SUPABASE_URL, SUPABASE_KEY } from '../services/authService';

const Checkout: React.FC<CheckoutProps> = ({ onSuccess, onVerifyPayment, userName, userEmail, userId, onLogout }) => {
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');

  const handleGoToPayment = async () => {
    setIsRedirecting(true);
    setCheckoutError('');
    try {
      const res = await fetch(`${SUPABASE_URL}/functions/v1/create-checkout-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
        },
        body: JSON.stringify({ userId, email: userEmail }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error || 'Erro ao criar sessão de pagamento');
      window.location.href = data.url;
    } catch (err: any) {
      setCheckoutError('Não foi possível abrir o checkout. Tente novamente.');
      setIsRedirecting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-brand-dark flex flex-col relative overflow-hidden font-sans transition-colors">
      <div className="absolute top-0 left-0 w-full h-[300px] bg-brand-violet/10 rounded-b-[3rem] z-0" />
      
      <div className="relative z-10 flex-1 flex flex-col items-center px-6 pt-12 pb-8 overflow-y-auto no-scrollbar">
        
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-white dark:bg-white/10 rounded-2xl flex items-center justify-center shadow-xl shadow-brand-violet/20 mx-auto mb-6 border border-white/20">
             <BrandLogo size={40} variant="fill" />
          </div>
          <h1 className="text-3xl font-extrabold text-brand-dark dark:text-white mb-2 leading-tight">
            Seu Plano está Pronto, {userName.split(' ')[0]}!
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-lg">
            Ative seu acesso para liberar todas as ferramentas.
          </p>
        </div>

        <div className="w-full max-w-lg bg-white dark:bg-[#1A1F26] rounded-[2.5rem] p-8 border border-slate-100 dark:border-white/5 shadow-2xl shadow-brand-violet/10 mb-8 relative overflow-hidden">
           <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-brand-violet to-purple-500" />
           
           <div className="flex flex-col items-center text-center mb-8">
              <span className="bg-brand-violet/10 text-brand-violet text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest mb-4 flex items-center gap-2 border border-brand-violet/20">
                 <Sparkles size={12} fill="currentColor" /> ACESSO TOTAL PREMIUM
              </span>
              <div className="flex items-center justify-center gap-1 mb-2">
                 <span className="text-2xl font-bold text-slate-400 align-top mt-2">R$</span>
                 <span className="text-6xl font-black text-brand-dark dark:text-white tracking-tighter">37,90</span>
              </div>
              <p className="text-slate-400 text-sm font-medium">mensal • PIX automático ou Cartão</p>
           </div>

           <div className="space-y-4 mb-10">
              {[
                { icon: Zap, color: 'text-amber-500', t: 'Direção Espiritual com IA', d: 'Converse e tire dúvidas 24h por dia.' },
                { icon: Users, color: 'text-purple-500', t: 'Comunidade e Ranking', d: 'Reze em conjunto e interceda por irmãos.' },
                { icon: BookOpen, color: 'text-blue-500', t: 'Biblioteca Completa', d: 'Doutrina, Liturgia e Vida dos Santos.' },
                { icon: Star, color: 'text-green-500', t: 'Regra de Vida Mensal', d: 'Sua rotina ajustada pela IA todo mês.' }
              ].map((item, idx) => (
                <div key={idx} className="flex gap-4 items-start">
                   <div className={`w-8 h-8 rounded-lg bg-slate-50 dark:bg-white/5 ${item.color} flex items-center justify-center shrink-0`}>
                      <item.icon size={18} />
                   </div>
                   <div className="min-w-0">
                      <h4 className="font-bold text-brand-dark dark:text-white text-sm leading-tight">{item.t}</h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed mt-0.5">{item.d}</p>
                   </div>
                </div>
              ))}
           </div>

           {checkoutError && (
             <p className="text-red-400 text-xs text-center mb-3 font-medium">{checkoutError}</p>
           )}
           <button
             onClick={handleGoToPayment}
             disabled={isRedirecting}
             className="w-full bg-brand-violet text-white font-black text-lg py-5 rounded-2xl shadow-xl shadow-brand-violet/30 hover:bg-purple-600 transition-all active:scale-95 flex items-center justify-center gap-2 group"
           >
              {isRedirecting ? (
                <>Preparando Checkout... <Loader2 className="w-5 h-5 animate-spin ml-2" /></>
              ) : (
                <>Pagar com PIX ou Cartão <ArrowRight size={22} className="group-hover:translate-x-1 transition-transform" /></>
              )}
           </button>
           
           <div className="mt-6 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-2xl p-5 border-2 border-blue-200 dark:border-blue-800/30">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                  <Shield size={18} className="text-white" />
                </div>
                <div>
                  <h4 className="font-black text-brand-dark dark:text-white text-sm mb-1">Como funciona o pagamento</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    Você será redirecionado para o ambiente seguro da <strong>Cakto</strong> para concluir o pagamento.
                  </p>
                </div>
              </div>

              <div className="bg-white dark:bg-white/5 rounded-xl p-4 border border-blue-200 dark:border-blue-800/30">
                <p className="text-xs font-bold text-brand-dark dark:text-white mb-2 flex items-center gap-2">
                  <ArrowRight size={14} className="text-blue-500" />
                  Após concluir o pagamento:
                </p>
                <ol className="text-xs text-slate-600 dark:text-slate-300 space-y-2 ml-5 list-decimal">
                  <li>Você será <strong>redirecionado automaticamente</strong> para o Espiritualizei</li>
                  <li>Seu <strong>acesso Premium será liberado</strong> em segundos</li>
                </ol>
              </div>

              <p className="text-[10px] text-center text-slate-500 dark:text-slate-400 mt-3 font-medium italic">
                A ativação é automática e leva apenas alguns segundos.
              </p>
           </div>

           {onVerifyPayment && (
             <button
               type="button"
               onClick={async () => {
                 setIsVerifying(true);
                 await onVerifyPayment();
                 setIsVerifying(false);
               }}
               disabled={isVerifying}
               className="w-full mt-4 py-3 rounded-xl border border-brand-violet/30 text-brand-violet font-bold text-sm hover:bg-brand-violet/10 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
             >
               {isVerifying ? <><Loader2 size={16} className="animate-spin" /> Verificando...</> : <><RefreshCw size={16} /> Já paguei — Verificar meu acesso</>}
             </button>
           )}
        </div>
        
        <div className="flex flex-col items-center gap-6 mb-10">
           <div className="flex items-center justify-center gap-2 text-xs font-bold text-slate-400">
              <Lock size={14} />
              <span>Garantia total de 7 dias ou seu dinheiro de volta.</span>
           </div>
           
           <button onClick={onLogout} className="text-sm font-bold text-slate-400 hover:text-red-400 transition-colors flex items-center gap-2">
              <LogOut size={16} /> Sair e continuar depois
           </button>
        </div>

      </div>
    </div>
  );
};

export default Checkout;
