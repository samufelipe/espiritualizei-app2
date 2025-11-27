
import React from 'react';
import { X, Shield, FileText } from 'lucide-react';

interface ModalProps {
  onClose: () => void;
}

export const TermsModal: React.FC<ModalProps> = ({ onClose }) => (
  <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
    <div className="absolute inset-0 bg-brand-dark/80 backdrop-blur-sm animate-fade-in" onClick={onClose} />
    <div className="relative w-full max-w-2xl bg-white dark:bg-brand-dark rounded-3xl shadow-2xl flex flex-col max-h-[85vh] animate-slide-up border border-white/10">
      <div className="p-6 border-b border-slate-100 dark:border-white/5 flex justify-between items-center bg-white/50 dark:bg-black/20 rounded-t-3xl">
        <div className="flex items-center gap-2">
           <FileText className="text-brand-violet" size={20} />
           <h2 className="text-lg font-bold text-brand-dark dark:text-white">Termos de Uso</h2>
        </div>
        <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center text-slate-500 hover:text-brand-dark dark:hover:text-white transition-colors"><X size={18} /></button>
      </div>
      <div className="p-8 overflow-y-auto prose prose-sm prose-slate dark:prose-invert max-w-none">
        <h3>1. Aceitação</h3>
        <p>Ao acessar o Espiritualizei, você concorda em utilizar a plataforma para fins de crescimento espiritual, respeitando a comunidade e a doutrina católica.</p>
        
        <h3>2. Comunidade e Conduta</h3>
        <p>O Espiritualizei é um santuário digital. Não toleramos discurso de ódio, desrespeito, spam ou conteúdo inadequado. Reservamo-nos o direito de banir usuários que violem a paz da comunidade.</p>
        
        <h3>3. Pagamentos e Assinaturas</h3>
        <p>O acesso premium é concedido mediante assinatura (mensal ou semestral). O cancelamento pode ser feito a qualquer momento, interrompendo a renovação automática.</p>
        
        <h3>4. Responsabilidade</h3>
        <p>O direcionamento espiritual oferecido pela IA é uma ferramenta de apoio e catequese, baseada em documentos da Igreja. Ela NÃO substitui o Sacramento da Confissão ou o aconselhamento psicológico profissional.</p>
      </div>
    </div>
  </div>
);

export const PrivacyModal: React.FC<ModalProps> = ({ onClose }) => (
  <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
    <div className="absolute inset-0 bg-brand-dark/80 backdrop-blur-sm animate-fade-in" onClick={onClose} />
    <div className="relative w-full max-w-2xl bg-white dark:bg-brand-dark rounded-3xl shadow-2xl flex flex-col max-h-[85vh] animate-slide-up border border-white/10">
      <div className="p-6 border-b border-slate-100 dark:border-white/5 flex justify-between items-center bg-white/50 dark:bg-black/20 rounded-t-3xl">
        <div className="flex items-center gap-2">
           <Shield className="text-green-500" size={20} />
           <h2 className="text-lg font-bold text-brand-dark dark:text-white">Política de Privacidade</h2>
        </div>
        <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center text-slate-500 hover:text-brand-dark dark:hover:text-white transition-colors"><X size={18} /></button>
      </div>
      <div className="p-8 overflow-y-auto prose prose-sm prose-slate dark:prose-invert max-w-none">
        <h3>1. Dados Coletados</h3>
        <p>Coletamos apenas o necessário para sua jornada: nome, e-mail e suas preferências espirituais (estado de vida, lutas) para personalizar a rotina.</p>
        
        <h3>2. Diário Seguro</h3>
        <p>O conteúdo do seu "Diário da Alma" é criptografado. Nós não vendemos seus dados para terceiros. Seus desabafos são estritamente privados.</p>
        
        <h3>3. Uso de Dados para Melhoria</h3>
        <p>Utilizamos dados anônimos de uso (ex: funcionalidades mais acessadas) para melhorar o aplicativo.</p>
        
        <h3>4. Exclusão de Conta</h3>
        <p>Você tem o direito de solicitar a exclusão total dos seus dados a qualquer momento através das configurações do perfil (LGPD).</p>
      </div>
    </div>
  </div>
);
