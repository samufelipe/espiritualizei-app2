
import React, { useState } from 'react';
import { Shield, ArrowRight, CheckCircle2, ChevronDown, ChevronUp, Moon, Brain, Coffee, CloudRain, Quote, Sun, Heart, Users, Flame, BookOpen, Star, Clock, MessageCircle, Instagram, Youtube, Twitter, Sparkles, Calendar, Lock, ShieldCheck, Zap, Trophy, Check } from 'lucide-react';
import BrandLogo from './BrandLogo';
import { TermsModal, PrivacyModal, AboutModal, ContactModal } from './LegalModals';

interface LandingPageProps {
  onStart: () => void;
  onLogin: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onStart, onLogin }) => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [activeModal, setActiveModal] = useState<'terms' | 'privacy' | 'about' | 'contact' | null>(null);
  
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const headerOffset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
    }
  };

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-brand-dark font-sans text-brand-dark dark:text-white transition-colors selection:bg-brand-violet/30 overflow-x-hidden">
      
      <style>{`
        @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        .card-float { animation: float 6s ease-in-out infinite; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .perspective-1000 { perspective: 1000px; }
      `}</style>

      {/* --- Navbar --- */}
      <nav className="fixed top-4 sm:top-6 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-5xl">
        <div className="bg-white/90 dark:bg-brand-dark/95 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-full px-4 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between shadow-2xl">
          <div className="flex items-center gap-2 cursor-pointer group shrink-0" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
            <BrandLogo size={24} variant="fill" className="text-brand-violet" />
            <span className="font-bold text-base sm:text-lg tracking-tighter">Espiritualizei</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8 text-[11px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
            <button onClick={() => scrollToSection('metodo')} className="hover:text-brand-violet transition-colors">O Método</button>
            <button onClick={() => scrollToSection('comunidade')} className="hover:text-brand-violet transition-colors">Comunidade</button>
            <button onClick={() => scrollToSection('biblioteca')} className="hover:text-brand-violet transition-colors">Formação</button>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <button 
              onClick={(e) => { e.preventDefault(); onLogin(); }} 
              className="text-[11px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-brand-violet transition-colors px-2 py-1"
            >
              Entrar
            </button>
            <button 
              onClick={(e) => { e.preventDefault(); onStart(); }} 
              className="bg-brand-violet text-white px-4 sm:px-6 py-2 sm:py-2.5 rounded-full text-[10px] sm:text-xs font-black shadow-lg hover:bg-purple-600 active:scale-95 transition-all whitespace-nowrap"
            >
              COMEÇAR
            </button>
          </div>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <section id="top" className="pt-44 pb-24 px-6 relative overflow-hidden flex flex-col items-center text-center">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[150vw] h-[100vh] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-brand-violet/20 via-transparent to-transparent pointer-events-none" />
        
        <div className="max-w-4xl relative z-10 space-y-8 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-brand-violet/10 border border-brand-violet/20 rounded-full text-brand-violet text-[10px] font-black uppercase tracking-widest mx-auto">
            <Sparkles size={12} fill="currentColor" /> Sua alma merece paz, não mais cansaço
          </div>
          <h1 className="text-5xl sm:text-7xl md:text-8xl font-black tracking-tighter leading-[0.95]">
            Pare de recomeçar <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-violet to-purple-400">toda segunda-feira.</span>
          </h1>
          <p className="text-lg sm:text-xl text-slate-500 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed font-medium">
            A vida espiritual não precisa ser um fardo. O **Espiritualizei** ajuda você a organizar sua jornada diária com humildade e constância, adaptando-se à sua realidade para que a oração seja seu verdadeiro porto seguro.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
             <button onClick={onStart} className="w-full sm:w-auto px-10 py-5 bg-brand-violet text-white rounded-[2rem] font-black text-xl shadow-2xl shadow-brand-violet/30 hover:scale-105 transition-all flex items-center justify-center gap-3">
                Organizar Minha Vida <ArrowRight size={24} />
             </button>
          </div>
          <div className="flex items-center justify-center gap-6 pt-8 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
             <div className="flex items-center gap-2"><ShieldCheck size={16} className="text-green-500" /> Doutrina 100% Católica</div>
             <div className="flex items-center gap-2"><Heart size={16} className="text-rose-500" /> Feito por leigos para leigos</div>
          </div>
        </div>

        {/* Mockup Preview */}
        <div className="mt-24 relative w-full max-w-5xl mx-auto flex justify-center perspective-1000">
           <div className="relative z-20 w-[280px] sm:w-[340px] h-[600px] bg-brand-dark rounded-[3.5rem] border-[10px] border-slate-800 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] overflow-hidden transform rotate-3 hover:rotate-0 transition-transform duration-700 ring-1 ring-white/10">
              <div className="w-full h-full bg-[#15191E] flex flex-col">
                 <div className="p-8 pt-16">
                    <div className="flex justify-between items-center mb-8">
                       <div>
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Jornada de Hoje</p>
                          <h3 className="text-white font-black text-2xl">Constância</h3>
                       </div>
                       <div className="w-12 h-12 bg-brand-violet rounded-2xl flex items-center justify-center text-white shadow-lg"><Check size={24} strokeWidth={3} /></div>
                    </div>
                    <div className="space-y-4">
                       <div className="bg-white/5 p-5 rounded-3xl border border-white/5">
                          <p className="text-[9px] text-brand-violet font-black uppercase mb-1">Manhã • 10 min</p>
                          <p className="text-white font-bold text-base">Evangelho Meditado</p>
                       </div>
                       <div className="bg-brand-violet/10 p-5 rounded-3xl border border-brand-violet/20 relative overflow-hidden">
                          <p className="text-[9px] text-brand-violet font-black uppercase mb-1">Tarde • 5 min</p>
                          <p className="text-white font-bold text-base">Desafio: Um ato de caridade</p>
                       </div>
                       <div className="bg-white/5 p-5 rounded-3xl border border-white/5 opacity-50">
                          <p className="text-[9px] text-slate-500 font-black uppercase mb-1">Noite</p>
                          <p className="text-white font-bold text-base">Exame de Consciência</p>
                       </div>
                    </div>
                 </div>
                 <div className="mt-auto p-8 bg-black/40 border-t border-white/5 flex justify-around backdrop-blur-md">
                    <Home className="text-slate-500" />
                    <Calendar className="text-brand-violet" />
                    <Users className="text-slate-500" />
                    <BookOpen className="text-slate-500" />
                 </div>
              </div>
           </div>
           <div className="absolute z-10 w-[300px] h-[500px] bg-brand-violet/30 rounded-[3rem] blur-3xl transform -translate-x-20 translate-y-20 opacity-30"></div>
        </div>
      </section>

      {/* --- O MÉTODO --- */}
      <section id="metodo" className="py-32 bg-slate-50 dark:bg-black/20">
         <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-20">
               <h2 className="text-4xl sm:text-6xl font-black text-brand-dark dark:text-white mb-6 tracking-tighter">Um caminho pensado para você</h2>
               <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto text-lg font-medium leading-relaxed">Não queremos ser mais um peso na sua lista de tarefas, mas a mão que te ajuda a caminhar quando você se sente cansado.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
               <div className="bg-white dark:bg-[#1A1F26] p-10 rounded-[3rem] shadow-sm border border-slate-100 dark:border-white/5 group hover:border-brand-violet/40 transition-all">
                  <div className="w-16 h-16 bg-brand-violet/10 rounded-2xl flex items-center justify-center text-brand-violet mb-8 group-hover:scale-110 transition-transform"><RefreshCw size={32} /></div>
                  <h3 className="text-2xl font-bold mb-4">Jornada Diária Real</h3>
                  <p className="text-slate-500 dark:text-slate-400 leading-relaxed font-medium">O **Espiritualizei** entende sua rotina e sugere práticas que cabem no seu tempo. Com humildade, caminhamos um passo de cada vez, ajustando o plano conforme sua vida muda.</p>
               </div>
               <div className="bg-white dark:bg-[#1A1F26] p-10 rounded-[3rem] shadow-sm border border-slate-100 dark:border-white/5 group hover:border-blue-500/40 transition-all">
                  <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center text-blue-600 mb-8 group-hover:scale-110 transition-transform"><BookOpen size={32} /></div>
                  <h3 className="text-2xl font-bold mb-4">Formação Sem Pressa</h3>
                  <p className="text-slate-500 dark:text-slate-400 leading-relaxed font-medium">Acesse a Biblioteca da Fé com textos curtos e profundos. Aprenda sobre os santos e a doutrina enquanto aguarda um café ou no trajeto.</p>
               </div>
               <div className="bg-white dark:bg-[#1A1F26] p-10 rounded-[3rem] shadow-sm border border-slate-100 dark:border-white/5 group hover:border-orange-500/40 transition-all">
                  <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/20 rounded-2xl flex items-center justify-center text-orange-600 mb-8 group-hover:scale-110 transition-transform"><Zap size={32} /></div>
                  <h3 className="text-2xl font-bold mb-4">Foco na Constância</h3>
                  <p className="text-slate-500 dark:text-slate-400 leading-relaxed font-medium">Menos é mais. Nosso foco é te ajudar a rezar 15 minutos todos os dias com qualidade, em vez de 2 horas apenas uma vez por mês.</p>
               </div>
            </div>
         </div>
      </section>

      {/* --- COMUNIDADE --- */}
      <section id="comunidade" className="py-32 bg-brand-dark text-white relative overflow-hidden">
         <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-violet/10 rounded-full blur-[120px]" />
         <div className="max-w-6xl mx-auto px-6 relative z-10">
            <div className="grid md:grid-cols-2 gap-16 items-center">
               <div>
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-brand-violet/20 border border-brand-violet/30 rounded-full text-brand-violet text-[10px] font-black uppercase tracking-widest mb-6">
                     <Users size={12} fill="currentColor" /> Você não está sozinho
                  </div>
                  <h2 className="text-4xl sm:text-6xl font-black mb-8 tracking-tighter leading-tight">Uma rede de oração que nunca dorme.</h2>
                  <p className="text-slate-400 text-lg mb-10 leading-relaxed font-medium">No Espiritualizei, você pode postar suas intenções e saber que centenas de pessoas estão rezando por você naquele exato momento. A fé se fortalece na união.</p>
                  <div className="space-y-6">
                     <div className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-brand-violet/20 rounded-xl flex items-center justify-center text-brand-violet shrink-0"><MessageCircle size={20} /></div>
                        <div>
                           <h4 className="font-bold text-xl mb-1">Comunidade de Orações</h4>
                           <p className="text-slate-400">Peça orações e reze pelos outros com apenas um toque.</p>
                        </div>
                     </div>
                     <div className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-brand-violet/20 rounded-xl flex items-center justify-center text-brand-violet shrink-0"><Flame size={20} /></div>
                        <div>
                           <h4 className="font-bold text-xl mb-1">Desafios de Virtude</h4>
                           <p className="text-slate-400">Participe de desafios semanais para crescer em santidade com a comunidade.</p>
                        </div>
                     </div>
                  </div>
               </div>
               <div className="relative">
                  <div className="bg-white/5 border border-white/10 p-8 rounded-[3rem] backdrop-blur-md">
                     <div className="space-y-6">
                        <div className="bg-white/5 p-6 rounded-3xl border border-white/5 animate-pulse">
                           <div className="flex items-center gap-3 mb-3">
                              <div className="w-8 h-8 bg-slate-700 rounded-full"></div>
                              <div className="h-3 w-24 bg-slate-700 rounded"></div>
                           </div>
                           <div className="h-4 w-full bg-slate-800 rounded mb-2"></div>
                           <div className="h-4 w-2/3 bg-slate-800 rounded"></div>
                        </div>
                        <div className="bg-brand-violet/10 p-6 rounded-3xl border border-brand-violet/20">
                           <div className="flex items-center gap-3 mb-3">
                              <div className="w-8 h-8 bg-brand-violet rounded-full flex items-center justify-center text-[10px] font-bold">SF</div>
                              <div className="text-xs font-bold">Samuel Felipe</div>
                           </div>
                           <p className="text-sm font-medium italic">"Peço orações pela saúde da minha avó que fará uma cirurgia amanhã."</p>
                           <div className="mt-4 flex items-center gap-2 text-brand-violet text-[10px] font-black uppercase">
                              <Flame size={14} fill="currentColor" /> 124 pessoas rezando agora
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </section>

      {/* --- BIBLIOTECA --- */}
      <section id="biblioteca" className="py-32 bg-white dark:bg-brand-dark">
         <div className="max-w-6xl mx-auto px-6">
            <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-20">
               <div className="max-w-2xl">
                  <h2 className="text-4xl sm:text-6xl font-black tracking-tighter leading-tight mb-6">Conhecimento que transforma a alma.</h2>
                  <p className="text-slate-500 dark:text-slate-400 text-lg font-medium">Nossa biblioteca é atualizada semanalmente com conteúdos que te ajudam a entender a beleza da nossa fé.</p>
               </div>
               <button onClick={onStart} className="px-8 py-4 bg-slate-100 dark:bg-white/5 rounded-2xl font-bold hover:bg-brand-violet hover:text-white transition-all flex items-center gap-2">Explorar Biblioteca <ArrowRight size={20} /></button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
               {[
                  { title: 'Vidas de Santos', icon: <Star />, color: 'bg-amber-100 text-amber-600' },
                  { title: 'Doutrina Católica', icon: <Shield />, color: 'bg-blue-100 text-blue-600' },
                  { title: 'Liturgia Diária', icon: <Calendar />, color: 'bg-purple-100 text-purple-600' },
                  { title: 'Orações e Terços', icon: <Heart />, color: 'bg-rose-100 text-rose-600' }
               ].map((item, i) => (
                  <div key={i} className="p-8 rounded-[2.5rem] border border-slate-100 dark:border-white/5 flex flex-col items-center text-center hover:shadow-xl transition-all cursor-pointer group">
                     <div className={`w-16 h-16 ${item.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>{item.icon}</div>
                     <h4 className="font-bold text-lg">{item.title}</h4>
                  </div>
               ))}
            </div>
         </div>
      </section>

      {/* --- CTA FINAL --- */}
      <section className="py-32 bg-slate-50 dark:bg-black/20">
         <div className="max-w-4xl mx-auto px-6 text-center">
            <div className="bg-brand-dark p-12 sm:p-20 rounded-[4rem] border border-white/10 shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-brand-violet/20 via-transparent to-transparent opacity-50" />
               <div className="relative z-10">
                  <h2 className="text-4xl sm:text-6xl font-black text-white mb-8 tracking-tighter">Pronto para começar?</h2>
                  <p className="text-slate-400 text-xl mb-12 font-medium max-w-xl mx-auto">Junte-se a centenas de leigos que estão transformando suas vidas através da constância espiritual.</p>
                  <button onClick={onStart} className="w-full sm:w-auto px-12 py-6 bg-brand-violet text-white rounded-[2rem] font-black text-2xl shadow-2xl shadow-brand-violet/30 hover:scale-105 transition-all flex items-center justify-center gap-3 mx-auto">
                     COMEÇAR MINHA JORNADA <ArrowRight size={28} />
                  </button>
                  <p className="mt-8 text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Acesso imediato • 100% Católico</p>
               </div>
            </div>
         </div>
      </section>

      {/* --- FAQ --- */}
      <section className="py-32 bg-white dark:bg-brand-dark">
         <div className="max-w-3xl mx-auto px-6">
            <h2 className="text-4xl font-black text-center mb-16 tracking-tighter">Dúvidas Frequentes</h2>
            <div className="space-y-4">
               {[
                  { q: "O aplicativo é realmente católico?", a: "Sim! Todo o conteúdo é baseado na doutrina da Igreja Católica Apostólica Romana, com foco na vida de oração e virtudes." },
                  { q: "Como funciona a Jornada Diária?", a: "Você responde um questionário sobre sua rotina e nossa IA sugere os melhores horários e práticas para você rezar, adaptando-se ao seu dia a dia com humildade." },
                  { q: "O acesso é gratuito?", a: "O Espiritualizei é um projeto mantido por leigos e oferece uma experiência completa via assinatura, garantindo a manutenção do app e a criação de novos conteúdos sem anúncios." }
               ].map((item, i) => (
                  <div key={i} className="border border-slate-100 dark:border-white/5 rounded-3xl overflow-hidden">
                     <button onClick={() => toggleFaq(i)} className="w-full p-6 text-left flex justify-between items-center hover:bg-slate-50 dark:hover:bg-white/5 transition-all">
                        <span className="font-bold">{item.q}</span>
                        {openFaq === i ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                     </button>
                     {openFaq === i && <div className="p-6 pt-0 text-slate-500 dark:text-slate-400 font-medium leading-relaxed">{item.a}</div>}
                  </div>
               ))}
            </div>
         </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="py-20 bg-slate-50 dark:bg-black/40 border-t border-slate-100 dark:border-white/5">
         <div className="max-w-6xl mx-auto px-6">
            <div className="grid md:grid-cols-4 gap-12 mb-16">
               <div className="col-span-2">
                  <div className="flex items-center gap-2 mb-6">
                     <BrandLogo size={32} variant="fill" className="text-brand-violet" />
                     <span className="font-bold text-2xl tracking-tighter">Espiritualizei</span>
                  </div>
                  <p className="text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed font-medium">Ajudando leigos a encontrarem a santidade no meio do mundo, através de uma jornada diária constante e equilibrada.</p>
               </div>
               <div>
                  <h5 className="font-black uppercase text-[10px] tracking-widest text-slate-400 mb-6">Links Úteis</h5>
                  <ul className="space-y-4 text-sm font-bold">
                     <li><button onClick={() => setActiveModal('about')} className="hover:text-brand-violet transition-colors">Sobre Nós</button></li>
                     <li><button onClick={() => setActiveModal('contact')} className="hover:text-brand-violet transition-colors">Contato</button></li>
                     <li><button onClick={() => setActiveModal('terms')} className="hover:text-brand-violet transition-colors">Termos de Uso</button></li>
                     <li><button onClick={() => setActiveModal('privacy')} className="hover:text-brand-violet transition-colors">Privacidade</button></li>
                  </ul>
               </div>
               <div>
                  <h5 className="font-black uppercase text-[10px] tracking-widest text-slate-400 mb-6">Redes Sociais</h5>
                  <div className="flex gap-4">
                     <a href="#" className="w-10 h-10 bg-white dark:bg-white/5 rounded-xl flex items-center justify-center hover:text-brand-violet transition-all shadow-sm"><Instagram size={20} /></a>
                     <a href="#" className="w-10 h-10 bg-white dark:bg-white/5 rounded-xl flex items-center justify-center hover:text-brand-violet transition-all shadow-sm"><Youtube size={20} /></a>
                     <a href="#" className="w-10 h-10 bg-white dark:bg-white/5 rounded-xl flex items-center justify-center hover:text-brand-violet transition-all shadow-sm"><Twitter size={20} /></a>
                  </div>
               </div>
            </div>
            <div className="pt-8 border-t border-slate-200 dark:border-white/5 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
               © 2026 Espiritualizei. Todos os direitos reservados. Feito com amor para a maior glória de Deus.
            </div>
         </div>
      </footer>

      {/* Modais */}
      {activeModal === 'terms' && <TermsModal onClose={() => setActiveModal(null)} />}
      {activeModal === 'privacy' && <PrivacyModal onClose={() => setActiveModal(null)} />}
      {activeModal === 'about' && <AboutModal onClose={() => setActiveModal(null)} />}
      {activeModal === 'contact' && <ContactModal onClose={() => setActiveModal(null)} />}
    </div>
  );
};

export default LandingPage;
