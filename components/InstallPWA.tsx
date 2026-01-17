
import React, { useEffect, useState } from 'react';
import { Download, X, Share, PlusSquare, ArrowBigDownDash, Smartphone } from 'lucide-react';

const InstallPWA: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showAndroidPrompt, setShowAndroidPrompt] = useState(false);
  const [showIosInstructions, setShowIosInstructions] = useState(false);

  useEffect(() => {
    // Detecta se já está instalado
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    if (isStandalone) return;

    // Detecta iOS
    const isIos = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowAndroidPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Se for iOS e não estiver instalado, mostramos as instruções após 3 segundos
    if (isIos && !isStandalone) {
      const timer = setTimeout(() => setShowIosInstructions(true), 3000);
      return () => clearTimeout(timer);
    }

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setShowAndroidPrompt(false);
    }
  };

  // UI para Android (Nativa do Navegador)
  if (showAndroidPrompt && deferredPrompt) {
    return (
      <div className="fixed bottom-6 left-4 right-4 z-[100] animate-slide-up">
        <div className="bg-brand-violet text-white p-5 rounded-[2rem] shadow-2xl flex items-center justify-between gap-4 border border-white/20">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center shrink-0 shadow-inner">
              <Download size={24} className="text-white" />
            </div>
            <div>
              <p className="font-black text-sm uppercase tracking-tight">Instalar Espiritualizei</p>
              <p className="text-[10px] text-purple-100 font-medium leading-tight">Tenha acesso rápido na sua tela de início.</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowAndroidPrompt(false)} className="p-2 text-white/50 hover:text-white"><X size={20} /></button>
            <button 
              onClick={handleInstallClick}
              className="bg-white text-brand-violet px-5 py-2.5 rounded-xl text-xs font-black uppercase shadow-lg active:scale-95 transition-transform"
            >
              Instalar
            </button>
          </div>
        </div>
      </div>
    );
  }

  // UI para iOS (Instrução Manual, já que a Apple não permite o botão direto)
  if (showIosInstructions) {
    return (
      <div className="fixed inset-0 z-[100] flex items-end justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
        <div className="w-full max-w-sm bg-white dark:bg-brand-dark rounded-[2.5rem] p-8 shadow-2xl relative animate-slide-up">
          <button 
            onClick={() => setShowIosInstructions(false)}
            className="absolute top-6 right-6 text-slate-400 hover:text-slate-600"
          >
            <X size={24} />
          </button>
          
          <div className="text-center space-y-6">
             <div className="w-20 h-20 bg-brand-violet/10 text-brand-violet rounded-3xl flex items-center justify-center mx-auto shadow-inner">
                <Smartphone size={40} />
             </div>
             
             <div className="space-y-2">
                <h3 className="text-xl font-black text-brand-dark dark:text-white">Instalar no iPhone</h3>
                <p className="text-sm text-slate-500 leading-relaxed font-medium">Siga estes 2 passos para ter o app na sua tela inicial:</p>
             </div>

             <div className="space-y-4 text-left">
                <div className="flex items-center gap-4 bg-slate-50 dark:bg-white/5 p-4 rounded-2xl border border-slate-100 dark:border-white/10">
                   <div className="w-8 h-8 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">1</div>
                   <p className="text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                      Toque no ícone <Share size={16} className="text-blue-500" /> (Compartilhar)
                   </p>
                </div>
                <div className="flex items-center gap-4 bg-slate-50 dark:bg-white/5 p-4 rounded-2xl border border-slate-100 dark:border-white/10">
                   <div className="w-8 h-8 rounded-full bg-green-500/10 text-green-500 flex items-center justify-center shrink-0">2</div>
                   <p className="text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                      Role e toque em <PlusSquare size={16} className="text-green-500" /> "Adicionar à Tela de Início"
                   </p>
                </div>
             </div>

             <button 
               onClick={() => setShowIosInstructions(false)}
               className="w-full bg-brand-violet text-white py-4 rounded-2xl font-bold shadow-xl shadow-brand-violet/20"
             >
               Entendi
             </button>
          </div>
          
          {/* Seta apontando para o botão de compartilhar do Safari */}
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-white dark:text-brand-dark animate-bounce">
             <ArrowBigDownDash size={40} fill="currentColor" className="text-brand-violet" />
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default InstallPWA;
