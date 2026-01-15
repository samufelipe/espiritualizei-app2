
import React from 'react';
import { Crown, Check, ArrowRight, Lock, Sparkles, ShieldCheck } from 'lucide-react';
import BrandLogo from './BrandLogo';

interface PaywallProps {
  onCheckout: () => void;
  title?: string;
  description?: string;
}

const Paywall: React.FC<PaywallProps> = ({ onCheckout, title, description }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center animate-fade-in min-h-[60vh] bg-white dark:bg-brand-dark rounded-[3rem] border border-slate-100 dark:border-white/5 shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-brand-violet/10 rounded-full blur-[80px] pointer-events-none" />
      
      <div className="relative z-10 space-y-6 max-w-sm">
        <div className="w-20 h-20 bg-brand-violet/10 rounded-3xl flex items-center justify-center mx-auto shadow-inner border border-brand-violet/20">
          <Lock size={32} className="text-brand-violet animate-pulse" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-black text-brand-dark dark:text-white tracking-tight">
            {title || "Funcionalidade Premium"}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
            {description || "Aprofunde sua vida espiritual com acesso total aos tesouros da Igreja e direção personalizada."}
          </p>
        </div>

        <div className="bg-slate-50 dark:bg-white/5 rounded-2xl p-4 space-y-3 text-left">
          {[
            'Biblioteca completa de formação',
            'Chat com Direção Espiritual (IA)',
            'Chat da Comunidade e Ranking',
            'Plano de vida adaptável mensal'
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3 text-xs font-bold text-slate-600 dark:text-slate-300">
              <Check size={14} className="text-green-500 shrink-0" strokeWidth={3} />
              {item}
            </div>
          ))}
        </div>

        <button 
          onClick={onCheckout}
          className="w-full bg-brand-violet text-white font-black py-4 rounded-2xl shadow-xl shadow-brand-violet/20 hover:bg-purple-600 transition-all flex items-center justify-center gap-2 active:scale-95 group"
        >
          Liberar Acesso Agora <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
        </button>

        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center justify-center gap-2">
          <ShieldCheck size={12} /> Assinatura segura via Cakto
        </p>
      </div>
    </div>
  );
};

export default Paywall;
