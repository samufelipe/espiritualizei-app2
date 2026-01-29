
import React from 'react';
// Fixed typo: changed 'lucide-center' to 'lucide-react'
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
        <p>Este é um espaço de oração e paz. Não toleramos discurso de ódio, desrespeito, spam ou conteúdo inadequado.</p>
        <h3>3. Pagamentos e Assinaturas</h3>
        <p>O acesso premium é concedido mediante assinatura mensal ou semestral.</p>
        <h3>4. Responsabilidade</h3>
        <p>A tecnologia é um apoio, não substitui sacramentos ou orientação presencial.</p>
    </div>
  </PageLayout>
);

// --- POLÍTICA DE PRIVACIDADE ---
export const PrivacyPage: React.FC = () => (
  <PageLayout title="Política de Privacidade">
    <div className="prose prose-lg prose-slate dark:prose-invert max-w-none">
        <h3>Privacidade</h3>
        <p>Seus dados são protegidos e seu Diário da Alma é privado.</p>
    </div>
  </PageLayout>
);

// --- SOBRE NÓS ---
export const AboutPage: React.FC = () => (
  <PageLayout title="Sobre Nós">
    <div className="text-center md:text-left space-y-10">
       <p className="text-lg">Tecnologia para a santidade.</p>
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
    if (!formData.name.trim() || !formData.email.trim()) {
      setError("Preencha os campos obrigatórios.");
      return;
    }
    const subject = encodeURIComponent(`[App] ${formData.subject}`);
    const body = encodeURIComponent(formData.message);
    window.location.href = `mailto:espiritualizeiapp@gmail.com?subject=${subject}&body=${body}`;
  };

  return (
    <PageLayout title="Fale Conosco">
      <div className="flex flex-col md:flex-row gap-12">
          <div className="w-full md:w-1/3 space-y-8">
             <div className="space-y-6">
                <div className="flex items-center gap-4">
                   <div className="w-12 h-12 rounded-full bg-brand-violet/10 flex items-center justify-center text-brand-violet"><Mail size={20} /></div>
                   <div>
                      <p className="text-xs font-bold text-slate-400 uppercase">E-mail</p>
                      <p className="font-medium text-brand-dark dark:text-white">espiritualizeiapp@gmail.com</p>
                   </div>
                </div>
             </div>
          </div>
          <div className="w-full md:w-2/3">
             <form className="space-y-4" onSubmit={handleSubmit}>
                <input className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-3 text-sm outline-none focus:border-brand-violet" placeholder="Seu nome" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
                <input className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-3 text-sm outline-none focus:border-brand-violet" placeholder="Seu e-mail" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
                <textarea className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-3 text-sm outline-none focus:border-brand-violet min-h-[150px]" placeholder="Sua mensagem" value={formData.message} onChange={(e) => setFormData({...formData, message: e.target.value})} />
                <button type="submit" className="w-full bg-brand-violet text-white font-bold py-4 rounded-xl shadow-lg">Enviar via E-mail</button>
             </form>
          </div>
      </div>
    </PageLayout>
  );
};
