
import React, { useState } from 'react';
import { X, Shield, FileText, Heart, Mail, MessageSquare, CheckCircle2, Send, Loader2, AlertCircle } from 'lucide-react';
import BrandLogo from './BrandLogo';

interface ModalProps {
  onClose: () => void;
}

// --- TERMOS DE USO ---
export const TermsModal: React.FC<ModalProps> = ({ onClose }) => (
  <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
    <div className="absolute inset-0 bg-brand-dark/90 backdrop-blur-md animate-fade-in" onClick={onClose} />
    <div className="relative w-full max-w-2xl bg-white dark:bg-brand-dark rounded-3xl shadow-2xl flex flex-col max-h-[85vh] animate-slide-up border border-white/10">
      <div className="p-6 border-b border-slate-100 dark:border-white/5 flex justify-between items-center bg-slate-50 dark:bg-black/20 rounded-t-3xl">
        <div className="flex items-center gap-3">
           <div className="w-10 h-10 rounded-full bg-brand-violet/10 flex items-center justify-center text-brand-violet"><FileText size={20} /></div>
           <h2 className="text-xl font-bold text-brand-dark dark:text-white">Termos de Uso</h2>
        </div>
        <button onClick={onClose} className="w-9 h-9 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center text-slate-500 hover:text-brand-dark dark:hover:text-white transition-colors"><X size={18} /></button>
      </div>
      <div className="p-8 overflow-y-auto prose prose-sm prose-slate dark:prose-invert max-w-none leading-relaxed">
        <h3>1. Aceitação</h3>
        <p>Ao acessar o Espiritualizei, você concorda em utilizar a plataforma para fins de crescimento espiritual, respeitando a comunidade e a doutrina católica.</p>
        
        <h3>2. Comunidade e Conduta</h3>
        <p>O Espiritualizei é um santuário digital. Não toleramos discurso de ódio, desrespeito, spam ou conteúdo inadequado. Reservamo-nos o direito de banir usuários que violem a paz da comunidade.</p>
        
        <h3>3. Pagamentos e Assinaturas</h3>
        <p>O acesso premium é concedido mediante assinatura. O cancelamento pode ser feito a qualquer momento, interrompendo a renovação automática.</p>
        
        <h3>4. Responsabilidade</h3>
        <p>O direcionamento espiritual oferecido pela tecnologia é uma ferramenta de apoio e organização. Ela <strong>NÃO substitui</strong> o Sacramento da Confissão ou a direção espiritual presencial com um sacerdote.</p>
        
        <h3>5. Propriedade Intelectual</h3>
        <p>Todo o conteúdo, design e curadoria presentes no aplicativo são propriedade exclusiva do Espiritualizei.</p>
      </div>
    </div>
  </div>
);

// --- POLÍTICA DE PRIVACIDADE ---
export const PrivacyModal: React.FC<ModalProps> = ({ onClose }) => (
  <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
    <div className="absolute inset-0 bg-brand-dark/90 backdrop-blur-md animate-fade-in" onClick={onClose} />
    <div className="relative w-full max-w-2xl bg-white dark:bg-brand-dark rounded-3xl shadow-2xl flex flex-col max-h-[85vh] animate-slide-up border border-white/10">
      <div className="p-6 border-b border-slate-100 dark:border-white/5 flex justify-between items-center bg-slate-50 dark:bg-black/20 rounded-t-3xl">
        <div className="flex items-center gap-3">
           <div className="w-10 h-10 rounded-full bg-green-100/20 flex items-center justify-center text-green-500"><Shield size={20} /></div>
           <h2 className="text-xl font-bold text-brand-dark dark:text-white">Privacidade</h2>
        </div>
        <button onClick={onClose} className="w-9 h-9 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center text-slate-500 hover:text-brand-dark dark:hover:text-white transition-colors"><X size={18} /></button>
      </div>
      <div className="p-8 overflow-y-auto prose prose-sm prose-slate dark:prose-invert max-w-none leading-relaxed">
        <h3>Dados Coletados</h3>
        <p>Coletamos apenas nome, e-mail e suas preferências espirituais para personalizar sua jornada. O conteúdo do seu "Diário da Alma" é estritamente privado.</p>
        <h3>Exclusão de Dados</h3>
        <p>Você pode solicitar a exclusão total da sua conta e de todos os seus dados a qualquer momento nas configurações do perfil.</p>
      </div>
    </div>
  </div>
);

// --- SOBRE NÓS ---
// Added missing AboutModal export to resolve LandingPage.tsx import error
export const AboutModal: React.FC<ModalProps> = ({ onClose }) => (
  <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
    <div className="absolute inset-0 bg-brand-dark/90 backdrop-blur-md animate-fade-in" onClick={onClose} />
    <div className="relative w-full max-w-2xl bg-white dark:bg-brand-dark rounded-3xl shadow-2xl flex flex-col max-h-[85vh] animate-slide-up border border-white/10">
      <div className="p-6 border-b border-slate-100 dark:border-white/5 flex justify-between items-center bg-slate-50 dark:bg-black/20 rounded-t-3xl">
        <div className="flex items-center gap-3">
           <div className="w-10 h-10 rounded-full bg-brand-violet/10 flex items-center justify-center text-brand-violet shadow-lg shadow-brand-violet/20">
              <BrandLogo size={24} variant="fill" className="text-white" />
           </div>
           <h2 className="text-xl font-bold text-brand-dark dark:text-white">Nossa Missão</h2>
        </div>
        <button onClick={onClose} className="w-9 h-9 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center text-slate-500 hover:text-brand-dark dark:hover:text-white transition-colors"><X size={18} /></button>
      </div>
      <div className="p-8 overflow-y-auto prose prose-sm prose-slate dark:prose-invert max-w-none leading-relaxed">
        <h3>Tecnologia para a Santidade</h3>
        <p>O Espiritualizei nasceu do desejo de colocar a tecnologia a serviço da vida espiritual. Acreditamos que, em um mundo cada vez mais barulhento e distraído, as ferramentas digitais podem ser aliadas fundamentais para recuperar o silêncio, a ordem e a constância na oração.</p>
        
        <h3>Fidelidade e Profundidade</h3>
        <p>Nossa plataforma é desenvolvida por leigos comprometidos com o Magistério da Igreja Católica. Buscamos traduzir os tesouros da nossa fé para uma linguagem moderna e acessível, sem nunca perder a profundidade teológica necessária para o verdadeiro crescimento da alma.</p>
        
        <h3>Comunidade e Fraternidade</h3>
        <p>A santidade não é um caminho solitário. No Espiritualizei, você caminha ao lado de milhares de outros peregrinos, intercedendo uns pelos outros e partilhando as graças que Deus realiza no cotidiano através da comunidade.</p>

        <div className="mt-8 text-center opacity-40 font-bold uppercase tracking-widest text-[10px]">
          Ad Maiorem Dei Gloriam
        </div>
      </div>
    </div>
  </div>
);

// --- CONTATO REAL ---
export const ContactModal: React.FC<ModalProps> = ({ onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSending, setIsSending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const SUBJECT_OPTIONS = [
    { value: 'Sugestão', label: '💡 Sugestão de Melhoria' },
    { value: 'Erro', label: '🪲 Relatar Erro' },
    { value: 'Dúvida', label: '❓ Dúvida sobre o App' },
    { value: 'Pagamento', label: '💳 Problema com Pagamento' },
    { value: 'Outros', label: '📝 Outros Assuntos' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.message.trim() || !formData.subject) return;

    setIsSending(true);

    const subject = encodeURIComponent(`[Espiritualizei] ${formData.subject}: ${formData.name}`);
    const body = encodeURIComponent(
      `Olá, Equipe Espiritualizei.\n\n` +
      `Me chamo ${formData.name} (${formData.email}).\n\n` +
      `Mensagem:\n${formData.message}`
    );

    setTimeout(() => {
        window.location.href = `mailto:espiritualizeiapp@gmail.com?subject=${subject}&body=${body}`;
        setIsSending(false);
        setIsSuccess(true); 
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:p-4">
      <div className="absolute inset-0 bg-brand-dark/90 backdrop-blur-md animate-fade-in" onClick={onClose} />
      
      <div className="relative w-full max-w-4xl bg-white dark:bg-brand-dark rounded-t-[2rem] sm:rounded-[2.5rem] shadow-2xl flex flex-col md:flex-row overflow-hidden animate-slide-up border-t border-white/10 h-auto max-h-[92dvh] sm:max-h-[90vh]">
        <div className="w-full md:w-2/5 bg-brand-violet p-6 md:p-10 text-white flex flex-col justify-between relative shrink-0">
           <div className="relative z-10">
              <h2 className="text-2xl md:text-3xl font-extrabold mb-4">Fale Conosco</h2>
              <p className="text-purple-100 text-sm mb-10 opacity-90">Sua voz nos ajuda a construir este caminho de oração.</p>
              <div className="space-y-6">
                 <div className="flex items-center gap-3">
                    <Mail size={18} />
                    <p className="font-medium text-sm">espiritualizeiapp@gmail.com</p>
                 </div>
              </div>
           </div>
           <div className="relative z-10 mt-10"><BrandLogo size={32} className="text-white opacity-50" /></div>
        </div>

        <div className="w-full md:w-3/5 p-6 md:p-10 bg-white dark:bg-brand-dark flex flex-col relative overflow-y-auto">
           {isSuccess ? (
             <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6"><CheckCircle2 size={40} /></div>
                <h3 className="text-xl font-bold text-brand-dark dark:text-white mb-2">E-mail Preparado!</h3>
                <p className="text-slate-500 text-sm mb-6">Seu aplicativo de e-mail foi aberto. Envie a mensagem por lá.</p>
                <button onClick={onClose} className="bg-brand-dark dark:bg-white text-white dark:text-brand-dark font-bold px-8 py-3 rounded-xl">Fechar</button>
             </div>
           ) : (
             <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="space-y-1"><label className="text-xs font-bold text-slate-500 uppercase">Nome</label><input className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-3 text-sm outline-none focus:border-brand-violet dark:text-white" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} /></div>
                <div className="space-y-1"><label className="text-xs font-bold text-slate-500 uppercase">Assunto</label><select className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-3 text-sm outline-none focus:border-brand-violet dark:text-white" value={formData.subject} required onChange={(e) => setFormData({...formData, subject: e.target.value})}><option value="">Selecione...</option>{SUBJECT_OPTIONS.map(opt => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}</select></div>
                <div className="space-y-1"><label className="text-xs font-bold text-slate-500 uppercase">Mensagem</label><textarea className="w-full h-32 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-3 text-sm outline-none focus:border-brand-violet resize-none dark:text-white" required value={formData.message} onChange={(e) => setFormData({...formData, message: e.target.value})} /></div>
                <button type="submit" disabled={isSending} className="w-full bg-brand-violet text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2">
                   {isSending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />} Abrir Aplicativo de E-mail
                </button>
             </form>
           )}
        </div>
      </div>
    </div>
  );
};
