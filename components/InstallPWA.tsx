
import React, { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';

const InstallPWA: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setIsVisible(false);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-sm animate-slide-up">
      <div className="bg-brand-dark/95 text-white p-4 rounded-2xl shadow-2xl border border-white/10 backdrop-blur-md flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-brand-violet rounded-xl flex items-center justify-center shadow-lg shadow-brand-violet/20">
            <Download size={20} className="text-white" />
          </div>
          <div>
            <p className="font-bold text-sm">Instalar Espiritualizei</p>
            <p className="text-[10px] text-slate-300">Acesso rápido e offline</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsVisible(false)}
            className="p-2 text-slate-400 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
          <button 
            onClick={handleInstallClick}
            className="bg-white text-brand-dark px-4 py-2 rounded-xl text-xs font-bold hover:bg-slate-200 transition-colors shadow-lg"
          >
            Instalar
          </button>
        </div>
      </div>
    </div>
  );
};

export default InstallPWA;
