
import React, { useState, useEffect } from 'react';
import { Bell, BellOff, X, CheckCircle2, Smartphone, AlertCircle, ArrowRight, Settings } from 'lucide-react';
import BrandLogo from './BrandLogo';
import { detectPushSupport, requestPushPermission, subscribeToPush, PushSupport } from '../services/pushNotificationService';

interface NotificationPermissionModalProps {
  userId: string;
  onClose: () => void;
  onSuccess: () => void;
}

const NotificationPermissionModal: React.FC<NotificationPermissionModalProps> = ({ userId, onClose, onSuccess }) => {
  const [step, setStep] = useState<'intro' | 'checking' | 'requesting' | 'success' | 'denied' | 'unsupported'>('intro');
  const [support, setSupport] = useState<PushSupport | null>(null);

  useEffect(() => {
    // Detectar suporte ao montar
    const detected = detectPushSupport();
    setSupport(detected);
    
    if (!detected.canReceivePush) {
      setStep('unsupported');
    }
  }, []);

  const handleRequestPermission = async () => {
    setStep('requesting');
    
    const permission = await requestPushPermission();
    
    if (permission === 'granted') {
      // Registrar para push
      await subscribeToPush(userId);
      setStep('success');
      setTimeout(() => {
        onSuccess();
      }, 2000);
    } else if (permission === 'denied') {
      setStep('denied');
    } else {
      setStep('denied');
    }
  };

  const renderContent = () => {
    switch (step) {
      case 'intro':
        return (
          <>
            <div className="w-20 h-20 bg-brand-violet/10 rounded-3xl flex items-center justify-center mx-auto mb-6 ring-4 ring-brand-violet/20">
              <Bell size={40} className="text-brand-violet" />
            </div>
            
            <h2 className="text-2xl font-black text-brand-dark dark:text-white mb-3">
              Ative as Notificações
            </h2>
            
            <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm leading-relaxed">
              Receba lembretes diários de oração, inspirações e saiba quando alguém interceder por você.
            </p>
            
            <div className="bg-slate-50 dark:bg-white/5 rounded-2xl p-4 mb-6 space-y-3">
              {[
                { icon: '🌅', text: 'Inspiração diária toda manhã' },
                { icon: '🙏', text: 'Lembretes da sua rotina espiritual' },
                { icon: '🔥', text: 'Novos desafios comunitários' },
                { icon: '💜', text: 'Quando alguém rezar por você' }
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                  <span className="text-lg">{item.icon}</span>
                  <span className="font-medium">{item.text}</span>
                </div>
              ))}
            </div>
            
            <button
              onClick={handleRequestPermission}
              className="w-full bg-brand-violet text-white font-bold py-4 rounded-2xl shadow-lg shadow-brand-violet/20 hover:bg-purple-600 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              Ativar Notificações <ArrowRight size={18} />
            </button>
            
            <button
              onClick={onClose}
              className="w-full text-slate-400 font-medium py-3 mt-2 text-sm hover:text-slate-600 transition-colors"
            >
              Agora não
            </button>
          </>
        );
        
      case 'requesting':
        return (
          <>
            <div className="w-20 h-20 bg-brand-violet/10 rounded-3xl flex items-center justify-center mx-auto mb-6 animate-pulse">
              <Bell size={40} className="text-brand-violet" />
            </div>
            
            <h2 className="text-2xl font-black text-brand-dark dark:text-white mb-3">
              Aguarde...
            </h2>
            
            <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm">
              Clique em "Permitir" na janela do navegador para ativar as notificações.
            </p>
            
            <div className="flex items-center justify-center gap-2 text-brand-violet">
              <div className="w-2 h-2 bg-brand-violet rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
              <div className="w-2 h-2 bg-brand-violet rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
              <div className="w-2 h-2 bg-brand-violet rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
            </div>
          </>
        );
        
      case 'success':
        return (
          <>
            <div className="w-20 h-20 bg-green-500/10 rounded-3xl flex items-center justify-center mx-auto mb-6 ring-4 ring-green-500/20">
              <CheckCircle2 size={40} className="text-green-500" />
            </div>
            
            <h2 className="text-2xl font-black text-brand-dark dark:text-white mb-3">
              Notificações Ativadas!
            </h2>
            
            <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm">
              Você receberá lembretes diários para fortalecer sua vida espiritual.
            </p>
            
            <div className="text-green-500 font-bold text-sm">
              Redirecionando...
            </div>
          </>
        );
        
      case 'denied':
        return (
          <>
            <div className="w-20 h-20 bg-amber-500/10 rounded-3xl flex items-center justify-center mx-auto mb-6 ring-4 ring-amber-500/20">
              <BellOff size={40} className="text-amber-500" />
            </div>
            
            <h2 className="text-2xl font-black text-brand-dark dark:text-white mb-3">
              Permissão Negada
            </h2>
            
            <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm leading-relaxed">
              Sem problemas! Você pode ativar as notificações depois nas configurações do seu navegador ou dispositivo.
            </p>
            
            <div className="bg-amber-50 dark:bg-amber-900/20 rounded-2xl p-4 mb-6 border border-amber-200 dark:border-amber-900/30">
              <div className="flex items-start gap-3">
                <Settings size={20} className="text-amber-600 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-700 dark:text-amber-300 leading-relaxed">
                  <strong>Para ativar depois:</strong> Vá em Configurações do navegador → Permissões → Notificações → Permitir para este site.
                </p>
              </div>
            </div>
            
            <button
              onClick={onClose}
              className="w-full bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-white font-bold py-4 rounded-2xl transition-all active:scale-95"
            >
              Entendi
            </button>
          </>
        );
        
      case 'unsupported':
        return (
          <>
            <div className="w-20 h-20 bg-slate-100 dark:bg-white/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <AlertCircle size={40} className="text-slate-400" />
            </div>
            
            <h2 className="text-2xl font-black text-brand-dark dark:text-white mb-3">
              {support?.isIOS && !support?.isPWA ? 'Instale o App Primeiro' : 'Notificações Indisponíveis'}
            </h2>
            
            <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm leading-relaxed">
              {support?.reason}
            </p>
            
            {support?.isIOS && !support?.isPWA && (
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-4 mb-6 border border-blue-200 dark:border-blue-900/30">
                <div className="flex items-start gap-3">
                  <Smartphone size={20} className="text-blue-600 shrink-0 mt-0.5" />
                  <div className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
                    <p className="font-bold mb-1">Como instalar no iPhone:</p>
                    <ol className="list-decimal list-inside space-y-1">
                      <li>Toque no ícone de Compartilhar (quadrado com seta)</li>
                      <li>Role e toque em "Adicionar à Tela de Início"</li>
                      <li>Toque em "Adicionar"</li>
                      <li>Abra o app pela tela inicial</li>
                    </ol>
                  </div>
                </div>
              </div>
            )}
            
            {support?.isIOS && support?.iosVersion && support.iosVersion < 16 && (
              <div className="bg-amber-50 dark:bg-amber-900/20 rounded-2xl p-4 mb-6 border border-amber-200 dark:border-amber-900/30">
                <div className="flex items-start gap-3">
                  <AlertCircle size={20} className="text-amber-600 shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-700 dark:text-amber-300 leading-relaxed">
                    <strong>Atualize seu iOS:</strong> Notificações push em PWAs requerem iOS 16.4 ou superior. Vá em Ajustes → Geral → Atualização de Software.
                  </p>
                </div>
              </div>
            )}
            
            <p className="text-slate-400 text-xs mb-4">
              Não se preocupe! Você ainda receberá lembretes importantes por e-mail.
            </p>
            
            <button
              onClick={onClose}
              className="w-full bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-white font-bold py-4 rounded-2xl transition-all active:scale-95"
            >
              Entendi
            </button>
          </>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 animate-fade-in">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={step === 'intro' || step === 'denied' || step === 'unsupported' ? onClose : undefined}
      />
      
      {/* Modal */}
      <div className="relative bg-white dark:bg-brand-dark rounded-[2rem] p-8 max-w-sm w-full shadow-2xl animate-slide-up border border-slate-100 dark:border-white/10">
        {/* Close Button */}
        {(step === 'intro' || step === 'denied' || step === 'unsupported') && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X size={16} />
          </button>
        )}
        
        <div className="text-center">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default NotificationPermissionModal;
