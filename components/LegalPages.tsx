
import React from 'react';
import { ArrowLeft, Shield, FileText, Heart, Mail, MessageSquare, MapPin, Send } from 'lucide-react';
import BrandLogo from './BrandLogo';

const PageLayout: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="min-h-screen bg-slate-50 dark:bg-brand-dark font-sans text-brand-dark dark:text-white">
    <div className="max-w-4xl mx-auto p-6 md:p-12">
      <div className="mb-8">
        <a href="/" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-brand-violet transition-colors mb-6">
          <ArrowLeft size={16} /> Voltar ao Início
        </a>
        <div className="flex items-center gap-3">
           <BrandLogo size={32} variant="fill" />
           <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">{title}</h1>
        </div>
      </div>
      <div className="bg-white dark:bg-white/5 rounded-[2rem] p-8 md:p-12 shadow-xl border border-slate-100 dark:border-white/5 leading-relaxed">
        {children}
      </div>
      <div className="mt-12 text-center opacity-50">
        <BrandLogo size={24} className="mx-auto mb-2" />
        <p className="text-xs">Espiritualizei © 2025</p>
      </div>
    </div>
  </div>
);

// --- TERMOS DE USO ---
export const TermsPage: React.FC = () => (
  <PageLayout title="Termos de Uso">
    <div className="prose prose-lg prose-slate dark:prose-invert max-w-none">
        <h3>1. Aceitação</h3>
        <p>Ao acessar o Espiritualizei, você concorda em utilizar a plataforma para fins de crescimento espiritual, respeitando a comunidade e a doutrina católica.</p>
        
        <h3>2. Comunidade e Conduta</h3>
        <p>Este é um espaço de oração e paz. Não toleramos discurso de ódio, desrespeito, spam ou conteúdo inadequado. Reservamo-nos o direito de banir usuários que violem a harmonia da comunidade.</p>
        
        <h3>3. Pagamentos e Assinaturas</h3>
        <p>O acesso premium é concedido mediante assinatura (mensal ou semestral). O cancelamento pode ser feito a qualquer momento, interrompendo a renovação automática. Não realizamos reembolsos parciais de períodos já iniciados.</p>
        
        <h3>4. Responsabilidade</h3>
        <p>O direcionamento espiritual oferecido pela tecnologia é uma ferramenta de apoio, catequese e organização, baseada em documentos da Igreja. Ela <strong>NÃO substitui</strong> o Sacramento da Confissão, a direção espiritual presencial com um sacerdote ou o aconselhamento psicológico profissional.</p>
        
        <h3>5. Propriedade Intelectual</h3>
        <p>Todo o conteúdo, design, código e curadoria presentes no aplicativo são propriedade exclusiva do Espiritualizei. É vedada a cópia ou reprodução não autorizada.</p>
    </div>
  </PageLayout>
);

// --- POLÍTICA DE PRIVACIDADE ---
export const PrivacyPage: React.FC = () => (
  <PageLayout title="Política de Privacidade">
    <div className="prose prose-lg prose-slate dark:prose-invert max-w-none">
        <h3>1. Dados Coletados</h3>
        <p>Coletamos apenas o necessário para personalizar sua jornada: nome, e-mail e suas preferências espirituais (estado de vida, lutas, santo patrono). Não coletamos dados sensíveis financeiros (o processamento é feito externamente via Stripe).</p>
        
        <h3>2. Diário Seguro (Criptografia)</h3>
        <p>O conteúdo do seu "Diário da Alma" e suas conversas no chat são estritamente privados. Utilizamos tecnologias de segurança para garantir que apenas você tenha acesso a essas reflexões íntimas.</p>
        
        <h3>3. Uso de Dados</h3>
        <p>Utilizamos dados anônimos de uso (ex: funcionalidades mais acessadas) para melhorar o aplicativo. Nunca vendemos seus dados para terceiros ou anunciantes.</p>
        
        <h3>4. Exclusão de Conta (LGPD)</h3>
        <p>Você tem o direito total de solicitar a exclusão da sua conta e de todos os seus dados a qualquer momento através das configurações do perfil no aplicativo. A exclusão é irreversível.</p>
        
        <h3>5. Cookies</h3>
        <p>Utilizamos cookies apenas para manter sua sessão ativa e segura. Não utilizamos cookies de rastreamento publicitário agressivo.</p>
    </div>
  </PageLayout>
);

// --- SOBRE NÓS ---
export const AboutPage: React.FC = () => (
  <PageLayout title="Sobre Nós">
    <div className="text-center md:text-left space-y-10">
       <div>
          <h3 className="text-2xl font-bold text-brand-dark dark:text-white mb-4">Tecnologia para a Alma</h3>
          <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
             O Espiritualizei nasceu de uma inquietação: a tecnologia moderna é incrível, mas quase sempre é usada para nos distrair e nos viciar. E se usássemos o mesmo poder dos algoritmos para nos aproximar de Deus?
          </p>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-50 dark:bg-white/5 p-8 rounded-2xl border border-slate-100 dark:border-white/5">
             <Heart className="text-brand-violet mb-4" size={32} />
             <h4 className="text-xl font-bold text-brand-dark dark:text-white mb-2">Propósito</h4>
             <p className="text-base text-slate-500 dark:text-slate-400">Ajudar católicos a encontrar constância na oração em meio ao caos da vida moderna, oferecendo um refúgio de paz no celular.</p>
          </div>
          <div className="bg-slate-50 dark:bg-white/5 p-8 rounded-2xl border border-slate-100 dark:border-white/5">
             <Shield className="text-brand-violet mb-4" size={32} />
             <h4 className="text-xl font-bold text-brand-dark dark:text-white mb-2">Valores</h4>
             <p className="text-base text-slate-500 dark:text-slate-400">Fidelidade ao Magistério, Beleza que eleva, Privacidade absoluta e Comunidade real.</p>
          </div>
       </div>

       <div className="border-t border-slate-100 dark:border-white/10 pt-10 text-center">
          <p className="text-2xl font-serif italic text-slate-700 dark:text-slate-200 mb-3">"Não vos conformeis com este mundo, mas transformai-vos pela renovação do vosso espírito."</p>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">— Romanos 12, 2</p>
       </div>
    </div>
  </PageLayout>
);

// --- CONTATO ---
export const ContactPage: React.FC = () => {
  const [formData, setFormData] = React.useState({
    name: '',
    surname: '',
    email: '',
    subject: 'Dúvida sobre o App',
    message: ''
  });
  const [error, setError] = React.useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Basic Validation
    if (!formData.name.trim()) {
      setError("Por favor, preencha seu nome.");
      return;
    }

    // Email Validation Regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim() || !emailRegex.test(formData.email)) {
      setError("Por favor, insira um e-mail válido.");
      return;
    }

    if (!formData.message.trim()) {
      setError("Por favor, digite sua mensagem.");
      return;
    }

    // Success Simulation
    alert("Mensagem enviada com sucesso! Em breve entraremos em contato.");
    setFormData({ name: '', surname: '', email: '', subject: 'Dúvida sobre o App', message: '' });
  };

  return (
    <PageLayout title="Fale Conosco">
      <div className="flex flex-col md:flex-row gap-12">
          {/* Left Side: Info */}
          <div className="w-full md:w-1/3 space-y-8">
             <p className="text-slate-600 dark:text-slate-300 text-lg">Estamos aqui para ouvir você. Dúvidas, sugestões ou testemunhos.</p>
             
             <div className="space-y-6">
                <div className="flex items-center gap-4">
                   <div className="w-12 h-12 rounded-full bg-brand-violet/10 flex items-center justify-center text-brand-violet"><Mail size={20} /></div>
                   <div>
                      <p className="text-xs font-bold text-slate-400 uppercase">E-mail</p>
                      <p className="font-medium text-brand-dark dark:text-white">contato@espiritualizei.com</p>
                   </div>
                </div>
                <div className="flex items-center gap-4">
                   <div className="w-12 h-12 rounded-full bg-brand-violet/10 flex items-center justify-center text-brand-violet"><MessageSquare size={20} /></div>
                   <div>
                      <p className="text-xs font-bold text-slate-400 uppercase">Suporte</p>
                      <p className="font-medium text-brand-dark dark:text-white">Seg a Sex, 9h às 18h</p>
                   </div>
                </div>
                <div className="flex items-center gap-4">
                   <div className="w-12 h-12 rounded-full bg-brand-violet/10 flex items-center justify-center text-brand-violet"><MapPin size={20} /></div>
                   <div>
                      <p className="text-xs font-bold text-slate-400 uppercase">Sede</p>
                      <p className="font-medium text-brand-dark dark:text-white">São Paulo, Brasil</p>
                   </div>
                </div>
             </div>
          </div>

          {/* Right Side: Form */}
          <div className="w-full md:w-2/3">
             <form className="space-y-4" onSubmit={handleSubmit}>
                {error && (
                   <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-300 p-3 rounded-xl text-sm font-bold border border-red-100 dark:border-red-900/30 animate-fade-in">
                      {error}
                   </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 uppercase">Nome</label>
                      <input 
                        className={`w-full bg-slate-50 dark:bg-white/5 border ${error && !formData.name.trim() ? 'border-red-400' : 'border-slate-200 dark:border-white/10'} rounded-xl p-3 text-sm outline-none focus:border-brand-violet transition-all`} 
                        placeholder="Seu nome" 
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                      />
                   </div>
                   <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 uppercase">Sobrenome</label>
                      <input 
                        className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-3 text-sm outline-none focus:border-brand-violet transition-all" 
                        placeholder="Seu sobrenome"
                        value={formData.surname}
                        onChange={(e) => setFormData({...formData, surname: e.target.value})}
                      />
                   </div>
                </div>
                
                <div className="space-y-1">
                   <label className="text-xs font-bold text-slate-500 uppercase">E-mail</label>
                   <input 
                     type="text" 
                     className={`w-full bg-slate-50 dark:bg-white/5 border ${error && (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) ? 'border-red-400' : 'border-slate-200 dark:border-white/10'} rounded-xl p-3 text-sm outline-none focus:border-brand-violet transition-all`} 
                     placeholder="exemplo@email.com" 
                     value={formData.email}
                     onChange={(e) => setFormData({...formData, email: e.target.value})}
                   />
                </div>

                <div className="space-y-1">
                   <label className="text-xs font-bold text-slate-500 uppercase">Assunto</label>
                   <select 
                     className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-3 text-sm outline-none focus:border-brand-violet transition-all"
                     value={formData.subject}
                     onChange={(e) => setFormData({...formData, subject: e.target.value})}
                   >
                      <option>Dúvida sobre o App</option>
                      <option>Problema com Pagamento</option>
                      <option>Parcerias</option>
                      <option>Outros</option>
                   </select>
                </div>

                <div className="space-y-1">
                   <label className="text-xs font-bold text-slate-500 uppercase">Mensagem</label>
                   <textarea 
                     className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-3 text-sm outline-none focus:border-brand-violet min-h-[150px] resize-none transition-all" 
                     placeholder="Como podemos ajudar?" 
                     value={formData.message}
                     onChange={(e) => setFormData({...formData, message: e.target.value})}
                   />
                </div>

                <button type="submit" className="w-full bg-brand-violet text-white font-bold py-4 rounded-xl shadow-lg hover:bg-purple-600 active:scale-95 transition-all flex items-center justify-center gap-2">
                   <Send size={18} /> Enviar Mensagem
                </button>
             </form>
          </div>
      </div>
    </PageLayout>
  );
};
