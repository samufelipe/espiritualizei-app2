
import React, { useState, useEffect } from 'react';
import { X, Share, PlusSquare, MoreVertical, Download, Smartphone, CheckCircle2, ArrowDown } from 'lucide-react';
import BrandLogo from './BrandLogo';

interface InstallPWAGuideProps {
  onClose: () => void;
}

const InstallPWAGuide: React.FC<InstallPWAGuideProps> = ({ onClose }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [platform, setPlatform] = useState<'ios' | 'android' | 'desktop'>('desktop');

  useEffect(() => {
    // Detectar plataforma
    const isIos = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    const isAndroid = /Android/.test(navigator.userAgent);
    
    if (isIos) setPlatform('ios');
    else if (isAndroid) setPlatform('android');
    else setPlatform('desktop');

    // Capturar evento de instalação para Android
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      onClose();
    }
  };

  const renderIOSInstructions = () => (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h3 className="text-2xl font-black text-white">Instalar no iPhone</h3>
        <p className="text-sm text-slate-400 leading-relaxed">
          Siga estes passos simples para ter o Espiritualizei na sua tela inicial:
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex items-start gap-4 bg-white/5 p-5 rounded-2xl border border-white/10">
          <div className="w-10 h-10 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 font-black">1</div>
          <div>
            <p className="text-sm font-bold text-white mb-1">Toque no ícone de Compartilhar</p>
            <p className="text-xs text-slate-400 flex items-center gap-2">
              Na barra inferior do Safari, toque em <Share size={16} className="text-blue-400" />
            </p>
          </div>
        </div>

        <div className="flex items-start gap-4 bg-white/5 p-5 rounded-2xl border border-white/10">
          <div className="w-10 h-10 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center shrink-0 font-black">2</div>
          <div>
            <p className="text-sm font-bold text-white mb-1">Role e encontre "Adicionar à Tela de Início"</p>
            <p className="text-xs text-slate-400 flex items-center gap-2">
              Toque em <PlusSquare size={16} className="text-green-400" /> Adicionar à Tela de Início
            </p>
          </div>
        </div>

        <div className="flex items-start gap-4 bg-white/5 p-5 rounded-2xl border border-white/10">
          <div className="w-10 h-10 rounded-full bg-brand-violet/20 text-brand-violet flex items-center justify-center shrink-0 font-black">3</div>
          <div>
            <p className="text-sm font-bold text-white mb-1">Confirme tocando em "Adicionar"</p>
            <p className="text-xs text-slate-400">
              O ícone do Espiritualizei aparecerá na sua tela inicial!
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAndroidInstructions = () => (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h3 className="text-2xl font-black text-white">Instalar no Android</h3>
        <p className="text-sm text-slate-400 leading-relaxed">
          {deferredPrompt 
            ? "Clique no botão abaixo para instalar instantaneamente!" 
            : "Siga estes passos para ter o app na sua tela inicial:"}
        </p>
      </div>

      {deferredPrompt ? (
        <button
          onClick={handleInstallClick}
          className="w-full bg-brand-violet text-white py-5 rounded-2xl font-black text-lg shadow-xl shadow-brand-violet/30 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
        >
          <Download size={24} /> Instalar Agora
        </button>
      ) : (
        <div className="space-y-4">
          <div className="flex items-start gap-4 bg-white/5 p-5 rounded-2xl border border-white/10">
            <div className="w-10 h-10 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 font-black">1</div>
            <div>
              <p className="text-sm font-bold text-white mb-1">Toque no menu do navegador</p>
              <p className="text-xs text-slate-400 flex items-center gap-2">
                No Chrome, toque em <MoreVertical size={16} className="text-blue-400" /> (três pontinhos)
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 bg-white/5 p-5 rounded-2xl border border-white/10">
            <div className="w-10 h-10 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center shrink-0 font-black">2</div>
            <div>
              <p className="text-sm font-bold text-white mb-1">Selecione "Instalar app" ou "Adicionar à tela inicial"</p>
              <p className="text-xs text-slate-400">
                A opção pode variar dependendo do navegador
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 bg-white/5 p-5 rounded-2xl border border-white/10">
            <div className="w-10 h-10 rounded-full bg-brand-violet/20 text-brand-violet flex items-center justify-center shrink-0 font-black">3</div>
            <div>
              <p className="text-sm font-bold text-white mb-1">Confirme a instalação</p>
              <p className="text-xs text-slate-400">
                O app será adicionado à sua tela inicial automaticamente!
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderDesktopInstructions = () => (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h3 className="text-2xl font-black text-white">Instalar no Computador</h3>
        <p className="text-sm text-slate-400 leading-relaxed">
          Tenha acesso rápido ao Espiritualizei direto do seu desktop:
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex items-start gap-4 bg-white/5 p-5 rounded-2xl border border-white/10">
          <div className="w-10 h-10 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 font-black">1</div>
          <div>
            <p className="text-sm font-bold text-white mb-1">Procure o ícone de instalação</p>
            <p className="text-xs text-slate-400">
              Na barra de endereços do Chrome, clique no ícone <Download size={14} className="inline text-blue-400" />
            </p>
          </div>
        </div>

        <div className="flex items-start gap-4 bg-white/5 p-5 rounded-2xl border border-white/10">
          <div className="w-10 h-10 rounded-full bg-brand-violet/20 text-brand-violet flex items-center justify-center shrink-0 font-black">2</div>
          <div>
            <p className="text-sm font-bold text-white mb-1">Clique em "Instalar"</p>
            <p className="text-xs text-slate-400">
              O Espiritualizei será adicionado como um app no seu computador!
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-brand-dark/95 backdrop-blur-xl animate-fade-in" onClick={onClose} />
      
      <div className="relative w-full max-w-md bg-[#1A1F26] rounded-[2.5rem] shadow-2xl overflow-hidden animate-slide-up border border-white/10">
        {/* Header */}
        <div className="relative p-8 pb-6 text-center bg-gradient-to-b from-brand-violet/20 to-transparent">
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
          
          <div className="w-20 h-20 bg-brand-violet/20 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-brand-violet/20">
            <Smartphone size={40} className="text-brand-violet" />
          </div>
          
          <p className="text-xs font-bold text-brand-violet uppercase tracking-widest mb-2">Acesso Rápido</p>
          <h2 className="text-xl font-black text-white">Instale o Espiritualizei</h2>
        </div>

        {/* Content */}
        <div className="p-8 pt-4">
          {platform === 'ios' && renderIOSInstructions()}
          {platform === 'android' && renderAndroidInstructions()}
          {platform === 'desktop' && renderDesktopInstructions()}
        </div>

        {/* Footer */}
        <div className="p-6 pt-0">
          <button
            onClick={onClose}
            className="w-full bg-white/5 text-slate-400 py-4 rounded-2xl font-bold text-sm hover:bg-white/10 transition-colors"
          >
            Talvez depois
          </button>
          
          <div className="flex items-center justify-center gap-2 mt-4 text-[10px] text-slate-500">
            <CheckCircle2 size={12} className="text-green-500" />
            <span>Funciona offline • Notificações • Acesso rápido</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstallPWAGuide;
