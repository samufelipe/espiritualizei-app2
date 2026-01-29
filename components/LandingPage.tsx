
import React, { useState, useRef } from 'react';
import { Shield, ArrowRight, CheckCircle2, ChevronDown, ChevronUp, Crown, Play, Moon, Brain, Coffee, CloudRain, ChevronLeft, ChevronRight, Quote, Sun, Heart, Users, Flame, BookOpen, Plus, MapPin, Navigation, Star, Clock, MessageCircle, ExternalLink, Menu, X, Instagram, Youtube, Twitter, Mail, GraduationCap, Music, Video, Sparkles, Map, Bookmark, Check, Bell, Search, Home, Headphones, RefreshCw, Calendar, Wifi, Lock, ShieldCheck, Zap, PenTool, Trophy, HeartHandshake, MessageSquare } from 'lucide-react';
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
    const container = document.querySelector('main');
    if (element && container) {
      const headerOffset = 100;
      const elementPosition = element.offsetTop;
      container.scrollTo({ top: elementPosition - headerOffset, behavior: "smooth" });
    } else if (id === 'top' && container) {
      container.scrollTo({ top: 0, behavior: 'smooth' });
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
      <nav className="fixed top-4 sm:top-6 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-5xl">
        <div className="bg-white/90 dark:bg-brand-dark/95 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-full px-4 sm:px-6 py-3 flex items-center justify-between shadow-2xl">
          <div className="flex items-center gap-2 cursor-pointer group" onClick={() => scrollToSection('top')}>
            <BrandLogo size={28} variant="fill" className="text-brand-violet" />
            <span className="font-bold text-lg tracking-tighter">Espiritualizei</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8 text-[11px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
            <button onClick={() => scrollToSection('metodo')} className="hover:text-brand-violet transition-colors">O Método</button>
            <button onClick={() => scrollToSection('comunidade')} className="hover:text-brand-violet transition-colors">Comunidade</button>
            <button onClick={() => scrollToSection('biblioteca')} className="hover:text-brand-violet transition-colors">Formação</button>
            <button onClick={() => scrollToSection('assinatura')} className="hover:text-brand-violet transition-colors">Planos</button>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={onLogin} className="hidden sm:block text-xs font-bold hover:text-brand-violet transition-colors">Entrar</button>
            <button onClick={onStart} className="bg-brand-violet text-white px-5 py-2.5 rounded-full text-xs font-black shadow-lg hover:bg-purple-600 active:scale-95 transition-all">COMEÇAR</button>
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
            Sabemos que sua vida é corrida. **Nosso aplicativo** cria uma Regra de Vida que se adapta à sua realidade, para que a oração deixe de ser um peso e se torne seu porto seguro.
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
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Plano de Hoje</p>
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
           {/* Decorative Element */}
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
                  <h3 className="text-2xl font-bold mb-4">Regra de Vida Real</h3>
                  <p className="text-slate-500 dark:text-slate-400 leading-relaxed font-medium">**Nosso aplicativo** analisa sua rotina e sugere práticas que cabem no seu tempo. Se sua vida mudar, o plano muda com você.</p>
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

      {/* --- COMUNIDADE (NOVA SEÇÃO) --- */}
      <section id="comunidade" className="py-32 bg-brand-dark text-white relative overflow-hidden">
         <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-violet/10 rounded-full blur-[120px]" />
         <div className="max-w-6xl mx-auto px-6 flex flex-col lg:flex-row items-center gap-20">
            <div className="flex-1 space-y-8 animate-slide-in-left">
               <span className="text-brand-violet font-black uppercase tracking-[0.3em] text-xs">Fraternidade Ativa</span>
               <h2 className="text-5xl md:text-7xl font-black leading-[0.95] tracking-tighter">Ninguém caminha sozinho para o Céu.</h2>
               <p className="text-xl text-slate-400 leading-relaxed font-medium">
                  No **Espiritualizei**, você faz parte de uma família. Interceda por irmãos no Mural de Orações, partilhe graças no Feed e conecte-se em tempo real.
               </p>
               
               <div className="space-y-6 pt-4">
                  <div className="flex gap-4 items-start">
                     <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-brand-violet shrink-0 border border-white/10"><MessageSquare size={24} /></div>
                     <div>
                        <h4 className="font-bold text-lg">Chat Global ao Vivo</h4>
                        <p className="text-sm text-slate-500">Converse com outros peregrinos, tire dúvidas e sinta o suporte da comunidade 24h por dia.</p>
                     </div>
                  </div>
                  <div className="flex gap-4 items-start">
                     <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-amber-500 shrink-0 border border-white/10"><Trophy size={24} /></div>
                     <div>
                        <h4 className="font-bold text-lg">Ranking de Caridade</h4>
                        <p className="text-sm text-slate-500">Um incentivo fraterno. Ganhe pontos ao rezar pelos outros e manter sua constância diária.</p>
                     </div>
                  </div>
               </div>
            </div>
            
            <div className="flex-1 w-full max-w-md">
               <div className="bg-[#1A1F26] rounded-[3.5rem] p-8 border border-white/10 shadow-2xl relative card-float">
                  <div className="flex items-center gap-4 mb-8">
                     <div className="w-12 h-12 rounded-full bg-brand-violet/20 flex items-center justify-center text-brand-violet"><Users size={24} /></div>
                     <p className="text-white font-black text-xl">Mural de Orações</p>
                  </div>
                  <div className="space-y-4">
                     <div className="bg-white/5 p-4 rounded-2xl border border-white/5 animate-pulse">
                        <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">MARIA R. PEDIU ORAÇÃO</p>
                        <p className="text-white text-sm italic font-medium">"Pela saúde da minha mãe que está no hospital..."</p>
                        <div className="mt-3 flex items-center gap-2 text-brand-violet">
                           <Flame size={14} fill="currentColor" /> <span className="text-[10px] font-black uppercase">42 irmãos rezando agora</span>
                        </div>
                     </div>
                     <button onClick={onStart} className="w-full bg-brand-violet text-white py-4 rounded-2xl font-black shadow-lg">ENTRAR NA FRATERNIDADE</button>
                  </div>
               </div>
            </div>
         </div>
      </section>

      {/* --- BIBLIOTECA --- */}
      <section id="biblioteca" className="py-32 bg-white dark:bg-[#0F1115]">
         <div className="max-w-6xl mx-auto px-6">
            <div className="flex flex-col lg:flex-row items-center gap-24">
               <div className="flex-1 grid grid-cols-2 gap-6">
                  <div className="p-8 bg-slate-50 dark:bg-[#1A1F26] rounded-[2.5rem] border border-slate-100 dark:border-white/5 space-y-4">
                     <GraduationCap size={40} className="text-blue-500" />
                     <h4 className="font-bold text-lg">Doutrina Clara</h4>
                     <p className="text-xs text-slate-500 leading-relaxed font-medium">Entenda os dogmas e a fé de forma simples, fiel ao Magistério.</p>
                  </div>
                  <div className="p-8 bg-slate-50 dark:bg-[#1A1F26] rounded-[2.5rem] border border-slate-100 dark:border-white/5 space-y-4 shadow-xl">
                     <Users size={40} className="text-purple-500" />
                     <h4 className="font-bold text-lg">Vidas de Santos</h4>
                     <p className="text-xs text-slate-500 leading-relaxed font-medium">Inspire-se com Carlo Acutis, Santa Teresinha e outros heróis reais.</p>
                  </div>
                  <div className="p-8 bg-slate-50 dark:bg-[#1A1F26] rounded-[2.5rem] border border-slate-100 dark:border-white/5 space-y-4">
                     <Sun size={40} className="text-amber-500" />
                     <h4 className="font-bold text-lg">Sentido da Missa</h4>
                     <p className="text-xs text-slate-500 leading-relaxed font-medium">Nunca mais vá à Missa por obrigação. Entenda cada gesto do altar.</p>
                  </div>
                  <div className="p-8 bg-slate-50 dark:bg-[#1A1F26] rounded-[2.5rem] border border-slate-100 dark:border-white/5 space-y-4">
                     <Heart size={40} className="text-rose-500" />
                     <h4 className="font-bold text-lg">Escola de Oração</h4>
                     <p className="text-xs text-slate-500 leading-relaxed font-medium">Aprenda métodos como a Lectio Divina e o Exame de Consciência.</p>
                  </div>
               </div>
               <div className="flex-1 space-y-8">
                  <h2 className="text-5xl font-black tracking-tighter leading-[0.95]">Alimento real para a sua inteligência.</h2>
                  <p className="text-xl text-slate-500 dark:text-slate-300 leading-relaxed font-medium">
                     Ninguém ama o que não conhece. **Nosso aplicativo** reúne um acervo curado para que sua fé seja fundamentada na verdade e na beleza da Tradição.
                  </p>
                  <button onClick={onStart} className="bg-brand-dark dark:bg-white text-white dark:text-brand-dark px-10 py-5 rounded-[2rem] font-black text-lg shadow-xl flex items-center gap-3 transition-all">
                     Acessar Biblioteca <ArrowRight size={20} />
                  </button>
               </div>
            </div>
         </div>
      </section>

      {/* --- PRICING --- */}
      <section id="assinatura" className="py-32 bg-brand-violet/5 relative overflow-hidden">
         <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-brand-violet/20 to-transparent" />
         <div className="max-w-4xl mx-auto px-6 text-center">
            <h2 className="text-5xl md:text-7xl font-black mb-12 tracking-tighter">Sua alma não tem preço. <br /> <span className="text-brand-violet">Sua rotina tem método.</span></h2>
            
            <div className="bg-white dark:bg-[#1A1F26] rounded-[3.5rem] p-10 sm:p-16 shadow-2xl border border-brand-violet/20 relative overflow-hidden max-w-lg mx-auto transform hover:scale-[1.02] transition-all">
               <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-brand-violet to-purple-500" />
               <div className="bg-brand-violet/10 text-brand-violet text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest mb-8 w-fit mx-auto border border-brand-violet/20">PLANO PEREGRINO</div>
               
               <div className="flex items-center justify-center gap-1 mb-2">
                  <span className="text-2xl font-bold text-slate-400 mt-2">R$</span>
                  <span className="text-7xl font-black tracking-tighter">37,90</span>
               </div>
               <p className="text-sm text-slate-400 font-bold uppercase tracking-widest mb-12">mensal • PIX Automático ou Cartão</p>
               
               <div className="space-y-5 text-left mb-12">
                  {[
                     { t: 'Regra de Vida Adaptável', d: 'Seu plano se ajusta à sua vida real.' },
                     { t: 'Direção Espiritual via Chat', d: 'Tire dúvidas e peça conselhos 24h.' },
                     { t: 'Mural e Chat Global', d: 'Nunca reze ou caminhe sozinho.' },
                     { t: 'Biblioteca de Formação', d: 'Conteúdo profundo para sua alma.' },
                     { t: 'Diário da Alma', d: 'Registre e acompanhe sua evolução.' }
                  ].map((feat, i) => (
                     <div key={i} className="flex gap-4">
                        <div className="w-6 h-6 rounded-full bg-green-500/10 text-green-500 flex items-center justify-center shrink-0"><Check size={14} strokeWidth={4} /></div>
                        <div>
                           <p className="text-sm font-black text-brand-dark dark:text-white leading-none">{feat.t}</p>
                           <p className="text-[10px] text-slate-500 mt-1">{feat.d}</p>
                        </div>
                     </div>
                  ))}
               </div>

               <button onClick={onStart} className="w-full bg-brand-violet text-white py-6 rounded-3xl font-black text-xl shadow-2xl shadow-brand-violet/30 hover:bg-purple-600 active:scale-95 transition-all mb-6">
                  COMEÇAR MINHA JORNADA
               </button>
               
               <div className="flex items-center justify-center gap-6 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                  <span className="flex items-center gap-1.5"><Lock size={12} /> Checkout Seguro</span>
                  <span className="flex items-center gap-1.5"><Shield size={12} /> 7 dias de Garantia</span>
               </div>
            </div>
         </div>
      </section>

      {/* --- FAQ --- */}
      <section className="py-32 px-6">
         <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl font-black mb-16 text-center tracking-tight">Dúvidas Frequentes</h2>
            <div className="space-y-4">
               {[
                  { q: "O aplicativo substitui o Diretor Espiritual?", a: "Não. O Espiritualizei é uma ferramenta de organização e apoio. Ele te ajuda a ter o que partilhar com seu diretor presencial ou confessor, organizando os frutos da sua oração diária." },
                  { q: "Preciso dedicar muito tempo por dia?", a: "Pelo contrário. Nosso método foca na 'pequena via'. Se você tiver apenas 15 minutos, o aplicativo organizará o essencial para que esses 15 minutos sejam de profunda intimidade com Deus." },
                  { q: "O conteúdo é fiel à Igreja Católica?", a: "Sim, 100%. Todo o nosso acervo e as lógicas de rotina são baseados no Magistério da Igreja, na vida dos santos e na tradição bimilenar católica." },
                  { q: "Posso cancelar a assinatura quando quiser?", a: "Sim. A assinatura é mensal e não possui fidelidade. Você pode cancelar com um único clique diretamente no seu perfil dentro do aplicativo." }
               ].map((item, i) => (
                  <div key={i} className="bg-slate-50 dark:bg-white/5 rounded-3xl p-8 border border-transparent hover:border-brand-violet/20 transition-all">
                     <button onClick={() => toggleFaq(i)} className="w-full flex justify-between items-center text-left">
                        <span className="font-bold text-lg">{item.q}</span>
                        <div className={`w-8 h-8 rounded-full bg-white dark:bg-white/10 flex items-center justify-center transition-transform ${openFaq === i ? 'rotate-180' : ''}`}>
                           <ChevronDown size={20} />
                        </div>
                     </button>
                     {openFaq === i && <p className="mt-6 text-slate-500 dark:text-slate-400 leading-relaxed font-medium animate-fade-in">{item.a}</p>}
                  </div>
               ))}
            </div>
         </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="bg-slate-50 dark:bg-[#0F1115] pt-32 pb-12 px-6 border-t border-slate-100 dark:border-white/5">
         <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-16 mb-24">
            <div className="space-y-8">
               <div className="flex items-center gap-3">
                  <BrandLogo size={36} variant="fill" className="text-brand-violet" />
                  <span className="font-black text-2xl tracking-tighter">Espiritualizei</span>
               </div>
               <p className="text-sm text-slate-500 leading-relaxed font-medium max-w-xs">Humilde tecnologia católica a serviço da sua santidade. Organize sua vida espiritual com ordem, beleza e fraternidade.</p>
            </div>
            <div>
               <h4 className="font-black text-xs uppercase tracking-[0.2em] text-slate-400 mb-8">Navegação</h4>
               <ul className="space-y-4 text-sm font-bold text-slate-500">
                  <li><button onClick={() => scrollToSection('metodo')} className="hover:text-brand-violet transition-colors">O Método</button></li>
                  <li><button onClick={() => scrollToSection('comunidade')} className="hover:text-brand-violet transition-colors">Comunidade</button></li>
                  <li><button onClick={() => scrollToSection('biblioteca')} className="hover:text-brand-violet transition-colors">Aprender</button></li>
               </ul>
            </div>
            <div>
               <h4 className="font-black text-xs uppercase tracking-[0.2em] text-slate-400 mb-8">Suporte</h4>
               <ul className="space-y-4 text-sm font-bold text-slate-500">
                  <li><button onClick={() => setActiveModal('contact')} className="hover:text-brand-violet transition-colors">Fale Conosco</button></li>
                  <li><button onClick={() => setActiveModal('terms')} className="hover:text-brand-violet transition-colors">Termos</button></li>
                  <li><button onClick={() => setActiveModal('privacy')} className="hover:text-brand-violet transition-colors">Privacidade</button></li>
               </ul>
            </div>
            <div>
               <h4 className="font-black text-xs uppercase tracking-[0.2em] text-slate-400 mb-8">Newsletter</h4>
               <p className="text-xs text-slate-500 mb-6 font-medium">Receba sementes de espiritualidade semanalmente.</p>
               <div className="flex gap-2">
                  <input className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-xs flex-1 outline-none" placeholder="Seu e-mail" />
                  <button className="bg-brand-violet text-white p-3 rounded-xl shadow-lg"><ArrowRight size={18} /></button>
               </div>
            </div>
         </div>
         <div className="border-t border-slate-200 dark:border-white/10 pt-12 text-center space-y-4">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Ad Maiorem Dei Gloriam</p>
            <p className="text-[10px] text-slate-500 font-medium">© 2025 Espiritualizei. Desenvolvido com fé para a Igreja.</p>
         </div>
      </footer>

      {activeModal === 'terms' && <TermsModal onClose={() => setActiveModal(null)} />}
      {activeModal === 'privacy' && <PrivacyModal onClose={() => setActiveModal(null)} />}
      {activeModal === 'contact' && <ContactModal onClose={() => setActiveModal(null)} />}
      {activeModal === 'about' && <AboutModal onClose={() => setActiveModal(null)} />}
    </div>
  );
};

export default LandingPage;
