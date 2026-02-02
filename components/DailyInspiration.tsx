
import React, { useState, useEffect } from 'react';
import { X, Share2, Sun, Download, Instagram, Copy, Check } from 'lucide-react';
import BrandLogo from './BrandLogo';

interface DailyInspirationProps {
  onClose: () => void;
  userName: string;
}

// Frases pré-carregadas para carregamento instantâneo
const INSPIRATIONS = [
  "Buscai primeiro o Reino de Deus, e tudo mais vos será acrescentado. (Mt 6,33)",
  "O Senhor é meu pastor, nada me faltará. (Sl 23,1)",
  "Tudo posso naquele que me fortalece. (Fl 4,13)",
  "Confiai no Senhor de todo o coração. (Pr 3,5)",
  "Eu sou a luz do mundo. Quem me segue não andará nas trevas. (Jo 8,12)",
  "Deixo-vos a paz, a minha paz vos dou. (Jo 14,27)",
  "Bem-aventurados os misericordiosos, porque alcançarão misericórdia. (Mt 5,7)",
  "Entrega o teu caminho ao Senhor; confia nele, e ele tudo fará. (Sl 37,5)",
  "Ora, a fé é a certeza das coisas que se esperam. (Hb 11,1)",
  "Em tudo dai graças, porque esta é a vontade de Deus. (1Ts 5,18)",
  "Deus resiste aos soberbos, mas dá graça aos humildes. (Tg 4,6)",
  "Bem-aventurado o homem que suporta a provação. (Tg 1,12)",
  "Se algum de vós tem falta de sabedoria, peça-a a Deus. (Tg 1,5)",
  "Nisto conhecerão todos que sois meus discípulos, se tiverdes amor uns aos outros. (Jo 13,35)",
  "Porque eu bem sei os pensamentos que penso de vós, pensamentos de paz. (Jr 29,11)"
];

const DailyInspiration: React.FC<DailyInspirationProps> = ({ onClose, userName }) => {
  const [quote, setQuote] = useState("");
  const [copied, setCopied] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);

  const firstName = userName.split(' ')[0];
  const hour = new Date().getHours();
  const greeting = hour >= 5 && hour < 12 ? "Bom dia" : hour >= 12 && hour < 18 ? "Boa tarde" : "Boa noite";

  // Carregamento instantâneo baseado no dia do ano
  useEffect(() => {
    const today = new Date();
    const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000);
    const todayQuote = INSPIRATIONS[dayOfYear % INSPIRATIONS.length];
    setQuote(todayQuote);
  }, []);

  // Função de compartilhamento
  const handleShare = async (method: 'native' | 'copy' | 'instagram') => {
    const shareText = `"${quote}"\n\n✨ Inspiração do dia via Espiritualizei\n🔗 espiritualizei.com`;
    
    if (method === 'native') {
      if (navigator.share) {
        try {
          await navigator.share({
            title: 'Inspiração Diária - Espiritualizei',
            text: shareText,
            url: 'https://espiritualizei.com'
          });
        } catch (e) {
          // Usuário cancelou ou erro
          console.log('Compartilhamento cancelado');
        }
      } else {
        // Fallback para copiar
        handleShare('copy');
      }
    } else if (method === 'copy') {
      try {
        await navigator.clipboard.writeText(shareText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (e) {
        console.error('Erro ao copiar:', e);
      }
    } else if (method === 'instagram') {
      // Copiar texto e abrir Instagram
      try {
        await navigator.clipboard.writeText(shareText);
        setCopied(true);
        setTimeout(() => {
          setCopied(false);
          // Tentar abrir Instagram
          window.open('instagram://story-camera', '_blank');
          // Fallback para web
          setTimeout(() => {
            window.open('https://www.instagram.com/', '_blank');
          }, 1000);
        }, 500);
      } catch (e) {
        window.open('https://www.instagram.com/', '_blank');
      }
    }
    
    setShowShareMenu(false);
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-6">
      {/* Backdrop Escuro e Focado */}
      <div className="absolute inset-0 bg-brand-dark/95 backdrop-blur-md animate-fade-in" onClick={onClose} />
      
      {/* Card Estilo 'Instagram Story' */}
      <div className="relative w-full max-w-sm bg-gradient-to-br from-[#2A2136] to-[#1A1625] rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/10 animate-slide-up flex flex-col aspect-[9/16] max-h-[85vh]">
         
         {/* Background Effects */}
         <div className="absolute top-0 right-0 w-64 h-64 bg-brand-violet/20 rounded-full blur-[80px] animate-pulse-slow pointer-events-none" />
         <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-500/10 rounded-full blur-[80px] pointer-events-none" />

         {/* Content */}
         <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-8 text-center overflow-hidden">
            <div className="mb-8 opacity-80 shrink-0">
               <BrandLogo size={48} variant="fill" className="text-white mx-auto mb-4" />
               <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/60">Inspiração Diária</p>
            </div>

            <div className="mb-8 w-full overflow-y-auto no-scrollbar max-h-[40vh] flex items-center justify-center">
               <blockquote className="text-2xl sm:text-3xl font-serif text-white leading-relaxed font-medium italic drop-shadow-md">
                 "{quote}"
               </blockquote>
            </div>

            <div className="w-12 h-1 bg-white/20 rounded-full mb-4 shrink-0" />
            <p className="text-sm text-white/80 font-medium shrink-0">{greeting}, {firstName}.</p>
         </div>

         {/* Footer Actions */}
         <div className="p-6 pb-8 flex gap-3 shrink-0 bg-[#1A1625]/50 backdrop-blur-sm relative">
            <button 
              onClick={onClose}
              className="flex-1 bg-white text-brand-dark font-bold py-4 rounded-2xl shadow-lg hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
            >
               <Sun size={18} /> Começar o Dia
            </button>
            <button 
              onClick={() => setShowShareMenu(!showShareMenu)}
              className="w-14 bg-white/10 text-white rounded-2xl flex items-center justify-center hover:bg-white/20 transition-colors"
            >
               {copied ? <Check size={20} className="text-green-400" /> : <Share2 size={20} />}
            </button>

            {/* Menu de Compartilhamento */}
            {showShareMenu && (
              <div className="absolute bottom-full right-6 mb-2 bg-white rounded-2xl shadow-2xl overflow-hidden animate-slide-up">
                <button
                  onClick={() => handleShare('native')}
                  className="w-full px-4 py-3 flex items-center gap-3 hover:bg-slate-100 transition-colors text-brand-dark"
                >
                  <Share2 size={18} className="text-brand-violet" />
                  <span className="font-medium text-sm">Compartilhar</span>
                </button>
                <button
                  onClick={() => handleShare('instagram')}
                  className="w-full px-4 py-3 flex items-center gap-3 hover:bg-slate-100 transition-colors text-brand-dark border-t border-slate-100"
                >
                  <Instagram size={18} className="text-pink-500" />
                  <span className="font-medium text-sm">Instagram Story</span>
                </button>
                <button
                  onClick={() => handleShare('copy')}
                  className="w-full px-4 py-3 flex items-center gap-3 hover:bg-slate-100 transition-colors text-brand-dark border-t border-slate-100"
                >
                  <Copy size={18} className="text-slate-500" />
                  <span className="font-medium text-sm">Copiar Texto</span>
                </button>
              </div>
            )}
         </div>
      </div>
    </div>
  );
};

export default DailyInspiration;
