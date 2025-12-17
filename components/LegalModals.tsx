
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
        <p>O acesso premium é concedido mediante assinatura (mensal ou semestral). O cancelamento pode ser feito a qualquer momento, interrompendo a renovação automática. Não realizamos reembolsos parciais de períodos já iniciados.</p>
        
        <h3>4. Responsabilidade</h3>
        <p>O direcionamento espiritual oferecido pela tecnologia é uma ferramenta de apoio, catequese e organização, baseada em documentos da Igreja. Ela <strong>NÃO substitui</strong> o Sacramento da Confissão, a direção espiritual presencial com um sacerdote ou o aconselhamento psicológico profissional.</p>
        
        <h3>5. Propriedade Intelectual</h3>
        <p>Todo o conteúdo, design, código e curadoria presentes no aplicativo são propriedade exclusiva do Espiritualizei. É vedada a cópia ou reprodução não autorizada.</p>
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
           <h2 className="text-xl font-bold text-brand-dark dark:text-white">Política de Privacidade</h2>
        </div>
        <button onClick={onClose} className="w-9 h-9 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center text-slate-500 hover:text-brand-dark dark:hover:text-white transition-colors"><X size={18} /></button>
      </div>
      <div className="p-8 overflow-y-auto prose prose-sm prose-slate dark:prose-invert max-w-none leading-relaxed">
        <h3>1. Dados Coletados</h3>
        <p>Coletamos apenas o necessário para personalizar sua jornada: nome, e-mail e suas preferências espirituais (estado de vida, lutas, santo patrono). Não coletamos dados sensíveis financeiros (o processamento é feito externamente via Stripe).</p>
        
        <h3>2. Diário Seguro (Criptografia)</h3>
        <p>O conteúdo do seu "Diário da Alma" e suas conversas no chat são estritamente privados. Utilizamos criptografia para garantir que apenas você tenha acesso a essas reflexões íntimas.</p>
        
        <h3>3. Uso de Dados</h3>
        <p>Utilizamos dados anônimos de uso (ex: funcionalidades mais acessadas) para melhorar o aplicativo. Nunca vendemos seus dados para terceiros ou anunciantes.</p>
        
        <h3>4. Exclusão de Conta (LGPD)</h3>
        <p>Você tem o direito total de solicitar a exclusão da sua conta e de todos os seus dados a qualquer momento através das configurações do perfil no aplicativo. A exclusão é irreversível.</p>
        
        <h3>5. Cookies</h3>
        <p>Utilizamos cookies apenas para manter sua sessão ativa e segura. Não utilizamos cookies de rastreamento publicitário.</p>
      </div>
    </div>
  </div>
);

// --- SOBRE NÓS ---
export const AboutModal: React.FC<ModalProps> = ({ onClose }) => (
  <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
    <div className="absolute inset-0 bg-brand-dark/95 backdrop-blur-xl animate-fade-in" onClick={onClose} />
    <div className="relative w-full max-w-3xl bg-white dark:bg-brand-dark rounded-[2.5rem] shadow-2xl flex flex-col max-h-[90vh] animate-slide-up border border-white/10 overflow-hidden">
      
      {/* Hero Header */}
      <div className="relative h-48 bg-gradient-to-r from-brand-violet to-purple-800 flex items-center justify-center overflow-hidden shrink-0">
         <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
         <div className="relative z-10 text-center">
            <BrandLogo size={64} variant="fill" className="text-white mx-auto mb-2 opacity-90" />
            <h2 className="text-3xl font-extrabold text-white tracking-tight">Nossa Missão</h2>
         </div>
         <button onClick={onClose} className="absolute top-6 right-6 w-10 h-10 rounded-full bg-black/20 text-white flex items-center justify-center hover:bg-black/40 transition-colors backdrop-blur-md"><X size={20} /></button>
      </div>

      <div className="p-8 md:p-12 overflow-y-auto text-center md:text-left">
        <div className="max-w-2xl mx-auto space-y-10">
           
           <div className="flex flex-col md:flex-row gap-6 items-center">
              <div className="flex-1">
                 <h3 className="text-xl font-bold text-brand-dark dark:text-white mb-3">Tecnologia para a Santidade</h3>
                 <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                    O Espiritualizei nasceu de uma inquietação: a tecnologia moderna é incrível, mas quase sempre é usada para nos distrair e nos viciar. E se usássemos o mesmo poder dos algoritmos para nos aproximar de Deus?
                 </p>
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-50 dark:bg-white/5 p-6 rounded-2xl border border-slate-100 dark:border-white/5">
                 <Heart className="text-brand-violet mb-3" size={24} />
                 <h4 className="font-bold text-brand-dark dark:text-white mb-2">Propósito</h4>
                 <p className="text-sm text-slate-500 dark:text-slate-400">Ajudar católicos a encontrar constância na oração em meio ao caos da vida moderna.</p>
              </div>
              <div className="bg-slate-50 dark:bg-white/5 p-6 rounded-2xl border border-slate-100 dark:border-white/5">
                 <Shield className="text-brand-violet mb-3" size={24} />
                 <h4 className="font-bold text-brand-dark dark:text-white mb-2">Valores</h4>
                 <p className="text-sm text-slate-500 dark:text-slate-400">Fidelidade ao Magistério, Beleza que eleva, Privacidade absoluta e Comunidade real.</p>
              </div>
           </div>

           <div className="border-t border-slate-100 dark:border-white/10 pt-8 text-center">
              <p className="text-lg font-serif italic text-slate-700 dark:text-slate-200 mb-2">"Não vos conformeis com este mundo, mas transformai-vos pela renovação do vosso espírito."</p>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">— Romanos 12, 2</p>
           </div>
        </div>
      </div>
    </div>
  </div>
);

// --- CONTATO REAL (OTIMIZADO PARA MOBILE V2) ---
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
    { value: 'Sugestão de Melhoria', label: '💡 Sugestão de Melhoria' },
    { value: 'Relatar Erro', label: '🪲 Relatar Erro (Bug)' },
    { value: 'Dúvida sobre o App', label: '❓ Dúvida sobre o App' },
    { value: 'Problema com Pagamento', label: '💳 Problema com Pagamento' },
    { value: 'Sugestão de Conteúdo', label: '📚 Sugestão de Conteúdo' },
    { value: 'Parceria', label: '🤝 Parceria / Imprensa' },
    { value: 'Elogio', label: '🙌 Elogio' },
    { value: 'Outros Assuntos', label: '📝 Outros Assuntos' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.message.trim() || !formData.subject) return;

    setIsSending(true);

    const subject = encodeURIComponent(`[Espiritualizei] ${formData.subject}: ${formData.name}`);
    const body = encodeURIComponent(
      `Olá, Equipe Espiritualizei.\n\n` +
      `Me chamo ${formData.name} (${formData.email}).\n\n` +
      `Assunto: ${formData.subject}\n\n` +
      `Mensagem:\n${formData.message}\n\n` +
      `--------------------------------\nEnviado via App Web`
    );

    setTimeout(() => {
        window.location.href = `mailto:espiritualizeiapp@gmail.com?subject=${subject}&body=${body}`;
        setIsSending(false);
        setIsSuccess(true); 
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:p-4">
      <div className="absolute inset-0 bg-brand-dark/90 backdrop-blur-md animate-fade-in" onClick={onClose} />
      
      {/* Container: Bottom Sheet on Mobile (Rounded Top only) / Modal on Desktop (Rounded All) */}
      <div className="relative w-full max-w-4xl bg-white dark:bg-brand-dark rounded-t-[2rem] sm:rounded-[2.5rem] shadow-2xl flex flex-col md:flex-row overflow-hidden animate-slide-up border-t border-x sm:border border-white/10 h-auto max-h-[92dvh] sm:max-h-[90vh]">
        
        {/* Left Side: Info (Compact Header on Mobile with Drag Handle) */}
        <div className="w-full md:w-2/5 bg-brand-violet p-4 sm:p-5 md:p-8 text-white flex flex-col justify-between relative overflow-hidden shrink-0 transition-all">
           
           {/* Mobile "Drag Handle" Pill */}
           <div className="absolute top-2 inset-x-0 flex justify-center md:hidden pointer-events-none z-30">
              <div className="w-10 h-1 rounded-full bg-white/30" />
           </div>

           {/* Mobile Close Button (Top Right) */}
           <button 
             onClick={onClose} 
             className="absolute top-4 right-4 md:hidden text-white/80 hover:text-white transition-colors bg-black/10 rounded-full p-1.5 z-20"
           >
             <X size={18} />
           </button>

           <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/diagmonds-light.png')]" />
           
           <div className="relative z-10 pt-2 md:pt-0">
              <h2 className="text-xl md:text-3xl font-extrabold mb-1 md:mb-2 flex items-center gap-2">
                Fale Conosco
                <span className="md:hidden text-[9px] bg-white/20 px-2 py-0.5 rounded-full font-medium tracking-wide">Suporte</span>
              </h2>
              
              {/* Text: Hidden on very small screens */}
              <p className="text-purple-100 text-xs md:text-sm mb-3 md:mb-10 leading-relaxed opacity-90 md:opacity-100 pr-8 md:pr-0 hidden sm:block">
                 Sua voz nos ajuda a construir este caminho de oração com simplicidade e serviço.
              </p>
              
              {/* Contact Details: Compact Grid on Mobile */}
              <div className="grid grid-cols-2 md:grid-cols-1 gap-2 md:space-y-6 md:block">
                 <div className="flex items-center gap-2 md:gap-3 bg-white/10 md:bg-transparent p-2 md:p-0 rounded-xl md:rounded-none">
                    <div className="w-7 h-7 md:w-10 md:h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0"><Mail size={14} className="md:w-[18px] md:h-[18px]" /></div>
                    <div className="overflow-hidden min-w-0">
                       <p className="text-[9px] md:text-xs font-bold text-purple-200 uppercase truncate">E-mail</p>
                       <p className="font-medium text-xs md:text-base truncate">espiritualizeiapp@gmail.com</p>
                    </div>
                 </div>
                 
                 <div className="flex items-center gap-2 md:gap-3 bg-white/10 md:bg-transparent p-2 md:p-0 rounded-xl md:rounded-none">
                    <div className="w-7 h-7 md:w-10 md:h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0"><MessageSquare size={14} className="md:w-[18px] md:h-[18px]" /></div>
                    <div className="min-w-0">
                       <p className="text-[9px] md:text-xs font-bold text-purple-200 uppercase truncate">Retorno</p>
                       <p className="font-medium text-xs md:text-base truncate">Breve possível ♥</p>
                    </div>
                 </div>
              </div>
           </div>
           
           <div className="relative z-10 mt-6 hidden md:block">
              <BrandLogo size={32} className="text-white opacity-50" />
           </div>
        </div>

        {/* Right Side: Form (Scrollable Area) */}
        <div className="w-full md:w-3/5 p-5 md:p-10 bg-white dark:bg-brand-dark flex flex-col relative transition-all duration-300 flex-1 min-h-0 overflow-y-auto overscroll-contain">
           {/* Desktop Close Button */}
           <button onClick={onClose} className="absolute top-6 right-6 text-slate-400 hover:text-brand-dark dark:hover:text-white transition-colors z-20 hidden md:block"><X size={24} /></button>
           
           {isSuccess ? (
             /* --- TELA DE SUCESSO --- */
             <div className="flex-1 flex flex-col items-center justify-center text-center animate-scale-in py-8">
                <div className="w-20 h-20 bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-green-500/10">
                   <CheckCircle2 size={40} />
                </div>
                <h3 className="text-2xl font-bold text-brand-dark dark:text-white mb-2">Mensagem Preparada!</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 max-w-xs mx-auto leading-relaxed">
                   Seu aplicativo de e-mail deve ter aberto. Envie a mensagem por lá para que possamos receber.
                </p>
                <div className="bg-slate-50 dark:bg-white/5 p-4 rounded-xl mb-8 w-full border border-slate-100 dark:border-white/5">
                   <p className="text-xs text-slate-400 uppercase font-bold tracking-wide mb-1">Status da Solicitação</p>
                   <p className="text-brand-dark dark:text-white font-medium">Analisaremos: <span className="text-brand-violet">{formData.subject}</span></p>
                </div>
                <button onClick={onClose} className="bg-brand-dark dark:bg-white text-white dark:text-brand-dark font-bold px-8 py-3 rounded-xl hover:scale-105 transition-transform shadow-lg w-full md:w-auto">
                   Entendido, Fechar
                </button>
             </div>
           ) : (
             /* --- FORMULÁRIO --- */
             <>
               <h3 className="text-xl font-bold text-brand-dark dark:text-white mb-6 hidden md:block">Envie sua mensagem</h3>
               <form className="space-y-4 flex-1 flex flex-col pb-safe" onSubmit={handleSubmit}>
                  <div className="space-y-1">
                     <label className="text-xs font-bold text-slate-500 uppercase">Nome</label>
                     <input 
                        className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-3 text-sm outline-none focus:border-brand-violet dark:text-white" 
                        placeholder="Seu nome" 
                        required 
                        autoComplete="name"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                     />
                  </div>
                  
                  <div className="space-y-1">
                     <label className="text-xs font-bold text-slate-500 uppercase">E-mail</label>
                     <input 
                        type="email" 
                        inputMode="email"
                        autoComplete="email"
                        className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-3 text-sm outline-none focus:border-brand-violet dark:text-white" 
                        placeholder="exemplo@email.com" 
                        required 
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                     />
                  </div>

                  <div className="space-y-1">
                     <label className="text-xs font-bold text-slate-500 uppercase">Assunto</label>
                     <div className="relative">
                       <select 
                          className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-3 text-sm outline-none focus:border-brand-violet dark:text-white appearance-none cursor-pointer"
                          value={formData.subject}
                          required
                          onChange={(e) => setFormData({...formData, subject: e.target.value})}
                       >
                          <option value="" disabled className="bg-slate-50 dark:bg-[#1A2530] text-slate-500">Selecione um assunto...</option>
                          {SUBJECT_OPTIONS.map(opt => (
                            <option key={opt.value} value={opt.value} className="bg-slate-50 dark:bg-[#1A2530] text-brand-dark dark:text-white">
                               {opt.label}
                            </option>
                          ))}
                       </select>
                       <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                          <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                       </div>
                     </div>
                  </div>

                  <div className="space-y-1 flex-1 min-h-[100px]">
                     <label className="text-xs font-bold text-slate-500 uppercase">Mensagem</label>
                     <textarea 
                        className="w-full h-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-3 text-sm outline-none focus:border-brand-violet resize-none dark:text-white" 
                        placeholder="Escreva aqui os detalhes..." 
                        required 
                        value={formData.message}
                        onChange={(e) => setFormData({...formData, message: e.target.value})}
                     />
                  </div>

                  <div className="pt-2 mt-auto">
                    <button 
                      type="submit" 
                      disabled={isSending}
                      className="w-full bg-brand-dark dark:bg-white text-white dark:text-brand-dark font-bold py-3.5 rounded-xl shadow-lg hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                       {isSending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />} 
                       {isSending ? 'Abrindo E-mail...' : 'Preparar E-mail'}
                    </button>
                    <p className="text-[10px] text-center text-slate-400 mt-2 flex items-center justify-center gap-1">
                       <AlertCircle size={10} /> Ao clicar, abriremos seu aplicativo de e-mail.
                    </p>
                  </div>
               </form>
             </>
           )}
        </div>
      </div>
    </div>
  );
};
