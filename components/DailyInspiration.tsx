
import React, { useState, useEffect } from 'react';
import { X, Share2, Sun, Sparkles } from 'lucide-react';
import BrandLogo from './BrandLogo';
import { generateDailyReflection } from '../services/geminiService';

interface DailyInspirationProps {
  onClose: () => void;
  userName: string;
}

const DailyInspiration: React.FC<DailyInspirationProps> = ({ onClose, userName }) => {
  const [quote, setQuote] = useState("Buscai primeiro o Reino de Deus, e tudo mais vos será acrescentado.");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadQuote = async () => {
      // Tenta gerar uma frase nova via IA baseada no dia
      try {
        const todaySaint = "Santo do Dia"; // Simplificação, idealmente viria do contexto
        const text = await generateDailyReflection(todaySaint);
        setQuote(text);
      } catch (e) {
        // Fallback mantém o texto padrão
      } finally {
        setLoading(false);
      }
    };
    loadQuote();
  }, []);

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-6">
      {/* Backdrop Escuro e Focado */}
      <div className="absolute inset-0 bg-brand-dark/95 backdrop-blur-md animate-fade-in" onClick={onClose} />
      
      {/* Card Estilo 'Instagram Story' */}
      <div className="relative w-full max-w-sm bg-gradient-to-br from-[#2A2136] to-[#1A1625] rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/10 animate-slide-up flex flex-col aspect-[9/16] max-h-[80vh]">
         
         {/* Background Effects */}
         <div className="absolute top-0 right-0 w-64 h-64 bg-brand-violet/20 rounded-full blur-[80px] animate-pulse-slow pointer-events-none" />
         <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-500/10 rounded-full blur-[80px] pointer-events-none" />

         {/* Content */}
         <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-8 text-center">
            <div className="mb-8 opacity-80">
               <BrandLogo size={48} variant="fill" className="text-white mx-auto mb-4" />
               <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/60">Inspiração Diária</p>
            </div>

            <div className="mb-8">
               {loading ? (
                 <Sparkles className="text-white animate-spin mx-auto" />
               ) : (
                 <blockquote className="text-2xl font-serif text-white leading-relaxed font-medium italic">
                   "{quote}"
                 </blockquote>
               )}
            </div>

            <div className="w-12 h-1 bg-white/20 rounded-full mb-4" />
            <p className="text-sm text-white/80 font-medium">Bom dia, {userName}.</p>
         </div>

         {/* Footer Actions */}
         <div className="p-6 pb-8 flex gap-3">
            <button 
              onClick={onClose}
              className="flex-1 bg-white text-brand-dark font-bold py-4 rounded-2xl shadow-lg hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
            >
               <Sun size={18} /> Começar o Dia
            </button>
            <button className="w-14 bg-white/10 text-white rounded-2xl flex items-center justify-center hover:bg-white/20 transition-colors">
               <Share2 size={20} />
            </button>
         </div>
      </div>
    </div>
  );
};

export default DailyInspiration;
