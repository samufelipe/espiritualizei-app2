
import React, { useState, useEffect } from 'react';
import { Check, Shield, Zap, Lock, ArrowRight, LogOut, RefreshCw, BookOpen, Users, Star } from 'lucide-react';
import BrandLogo from './BrandLogo';
import { getSession } from '../services/authService';

interface CheckoutProps {
  onSuccess: () => void;
  userName: string;
  onLogout: () => void;
}

/**
 * CONFIGURAÇÃO OFICIAL CAKTO - ESPIRITUALIZEI
 * CLIENT ID: 9myaqhhlOQIjCakfYilX92scbRYH7c7PTQkVwBaj
 */
const CAKTO_CHECKOUT_URL = "https://pay.cakto.com.br/iwruwu8_691446"; // Substitua pelo slug real do seu produto

const Checkout: React.FC<CheckoutProps> = ({ onSuccess, userName, onLogout }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState<string>("");

  useEffect(() => {
    const session = getSession();
    if (session?.user?.id) {
      setUserId(session.user.id);
    }
  }, []);

  const handleSubscribe = () => {
    setIsLoading(true);
    
    // Construímos a URL com o ID do usuário como referência (ref)
    // Isso é CRÍTICO para que seu webhook identifique quem pagou
    const checkoutUrl = new URL(CAKTO_CHECKOUT_URL);
    checkoutUrl.searchParams.set('ref', userId);
    
    const session = getSession();
    if (session?.user?.name) checkoutUrl.searchParams.set('name', session.user.name);
    if (session?.user?.email) checkoutUrl.searchParams.set('email', session.user.email);

    // Redirecionamento oficial para o Checkout da Cakto
    window.location.href = checkoutUrl.toString();
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-brand-dark flex flex-col relative overflow-hidden font-sans transition-colors">
      <div className="absolute top-0 left-0 w-full h-[300px] bg-brand-violet/10 rounded-b-[3rem] z-0" />
      <div className="absolute top-[-100px] right-[-100px] w-64 h-64 bg-brand-violet/20 rounded-full blur-[80px] animate-pulse-slow pointer-events-none" />

      <div className="relative z-10 flex-1 flex flex-col items-center px-6 pt-12 pb-8 overflow-y-auto">
        
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-white dark:bg-white/10 rounded-2xl flex items-center justify-center shadow-xl shadow-brand-violet/20 mx-auto mb-6 border border-white/20">
             <BrandLogo size={40} variant="fill" />
          </div>
          <h1 className="text-3xl font-extrabold text-brand-dark dark:text-white mb-2">
            Quase lá, {userName.split(' ')[0]}!
          </h1>
          <p className="text-slate-600 dark:text-slate-300 text-lg">
            Sua jornada de santidade organizada começa agora.
          </p>
        </div>

        <div className="w-full max-w-lg bg-white dark:bg-[#1A1F26] rounded-[2.5rem] p-8 border border-slate-100 dark:border-white/5 shadow-2xl shadow-brand-violet/10 mb-8 relative overflow-hidden">
           <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-brand-violet to-purple-500" />
           
           <div className="flex flex-col items-center text-center mb-8">
              <span className="bg-brand-violet/10 text-brand-violet text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest mb-4 flex items-center gap-2">
                 <Star size={12} fill="currentColor" /> Assinatura Mensal
              </span>
              <div className="flex items-center justify-center gap-1 mb-2">
                 <span className="text-2xl font-bold text-slate-400 align-top mt-2">R$</span>
                 <span className="text-6xl font-black text-brand-dark dark:text-white tracking-tighter">37,90</span>
              </div>
              <p className="text-slate-400 text-sm font-medium">cobrança recorrente • cancele quando quiser</p>
           </div>

           <div className="space-y-5 mb-8">
              <div className="flex gap-4">
                 <div className="w-10 h-10 rounded-full bg-green-500/10 text-green-600 flex items-center justify-center shrink-0"><RefreshCw size={20} /></div>
                 <div className="min-w-0">
                    <h4 className="font-bold text-brand-dark dark:text-white text-sm">Plano Adaptável</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mt-0.5">Rotina gerada por IA que respeita seu tempo real.</p>
                 </div>
              </div>

              <div className="flex gap-4">
                 <div className="w-10 h-10 rounded-full bg-purple-500/10 text-purple-600 flex items-center justify-center shrink-0"><Users size={20} /></div>
                 <div>
                    <h4 className="font-bold text-brand-dark dark:text-white text-sm">Comunidade e Ranking</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mt-0.5">Intercessão mútua e frutos da caridade.</p>
                 </div>
              </div>

              <div className="flex gap-4">
                 <div className="w-10 h-10 rounded-full bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0"><BookOpen size={20} /></div>
                 <div>
                    <h4 className="font-bold text-brand-dark dark:text-white text-sm">Direção Espiritual</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mt-0.5">Acesso ilimitado ao Diretor Espiritual e Biblioteca.</p>
                 </div>
              </div>
           </div>

           <button
             onClick={handleSubscribe}
             disabled={isLoading}
             className="w-full bg-brand-violet text-white font-bold text-lg py-4 rounded-2xl shadow-xl shadow-brand-violet/30 hover:bg-purple-600 transition-all active:scale-95 flex items-center justify-center gap-2 group"
           >
              {isLoading ? (
                <>Preparando seu Acesso <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin ml-2" /></>
              ) : (
                <>Ativar Acesso Premium <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" /></>
              )}
           </button>
           
           <p className="text-[10px] text-center text-slate-400 mt-4">
              Pagamento 100% seguro processado pela <b>Cakto</b>.
           </p>
        </div>
        
        <div className="flex flex-col items-center gap-4">
           <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
              <Lock size={12} />
              <span>Garantia incondicional de 7 dias.</span>
           </div>
           
           <button onClick={onLogout} className="text-xs text-slate-400 hover:text-brand-violet underline flex items-center gap-1">
              <LogOut size={10} /> Sair do app
           </button>
        </div>

      </div>
    </div>
  );
};

export default Checkout;
