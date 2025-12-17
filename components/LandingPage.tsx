
import React, { useState, useRef } from 'react';
import { Shield, ArrowRight, CheckCircle2, ChevronDown, ChevronUp, Crown, Play, Moon, Brain, Coffee, CloudRain, ChevronLeft, ChevronRight, Quote, Sun, Heart, Users, Flame, BookOpen, Plus, MapPin, Navigation, Star, Clock, MessageCircle, ExternalLink, Menu, X, Instagram, Youtube, Twitter, Mail, GraduationCap, Music, Video, Sparkles, Map, Bookmark, Check, Bell, Search, Home, Headphones, RefreshCw, Calendar, Wifi, Lock } from 'lucide-react';
import BrandLogo from './BrandLogo';
import { TermsModal, PrivacyModal, AboutModal, ContactModal } from './LegalModals';

interface LandingPageProps {
  onStart: () => void;
  onLogin: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onStart, onLogin }) => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<'terms' | 'privacy' | 'about' | 'contact' | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const headerOffset = 100;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
      setMobileMenuOpen(false);
    }
  };

  const scrollManual = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { scrollLeft } = scrollRef.current;
      // Novo tamanho do card (280px) + gap (24px) = 304px
      const scrollTo = direction === 'left' ? scrollLeft - 304 : scrollLeft + 304;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  // --- DATA: REALISTIC TESTIMONIALS ---
  const TESTIMONIALS = [
    {
      name: "Mariana R.", role: "Médica e Mãe", avatar: "MR", color: "from-blue-400 to-blue-600",
      text: "Eu vivia ansiosa. O sistema percebeu minha rotina pesada e sugeriu orações curtas. Foi um alívio sentir que o app se adapta a mim."
    },
    {
      name: "João Paulo", role: "Engenheiro", avatar: "JP", color: "from-amber-400 to-amber-600",
      text: "Estava afastado da Igreja. A rotina gradual me ajudou a voltar sem pressão. Hoje não vivo sem minha oração da manhã."
    },
    {
      name: "Camila L.", role: "Estudante", avatar: "CL", color: "from-purple-400 to-purple-600",
      text: "Eu não sabia por onde começar. A seção de Aprender explicou tudo de forma tão simples que mudei minha perspectiva."
    },
    {
      name: "Carlos E.", role: "Motorista", avatar: "CE", color: "from-green-400 to-green-600",
      text: "Passo o dia no trânsito. A Capela Sonora transformou meu carro. Em vez de notícias ruins, agora ouço o Rosário."
    },
    {
      name: "Ana B.", role: "Designer", avatar: "AB", color: "from-rose-400 to-rose-600",
      text: "Eu ia à Missa por obrigação. O app me ensinou o que acontece no altar. Agora cada domingo é um encontro real."
    },
    {
      name: "Rafael M.", role: "Empresário", avatar: "RM", color: "from-slate-400 to-slate-600",
      text: "Achei que fosse mais um app de tarefas. Mas a comunidade é real. Quando pedi oração pelo meu pai, senti a força da Igreja."
    },
    {
      name: "Lúcia F.", role: "Aposentada", avatar: "LF", color: "from-teal-400 to-teal-600",
      text: "A letra do app é ótima. Gosto de ler a Liturgia Diária antes de levantar. Me sinto conectada com Deus logo cedo."
    },
    {
      name: "Pe. Marcelo", role: "Sacerdote", avatar: "PM", color: "from-brand-violet to-purple-800",
      text: "Recomendo aos paroquianos pela prudência. O app organiza a vida de oração com base na tradição segura da Igreja."
    }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-brand-dark font-sans text-brand-dark dark:text-white transition-colors selection:bg-brand-violet/30 overflow-x-hidden">
      
      {/* --- ESTILOS AVANÇADOS OTIMIZADOS --- */}
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(calc(-280px * 8 - 1.5rem * 8)); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        .animate-marquee-container {
          display: flex;
          gap: 1.5rem;
          width: max-content;
          animation: marquee 50s linear infinite;
        }
        .pause-on-interaction:hover .animate-marquee-container,
        .pause-on-interaction:active .animate-marquee-container {
          animation-play-state: paused;
        }
        .card-float:nth-child(odd) {
          animation: float 6s ease-in-out infinite;
        }
        .card-float:nth-child(even) {
          animation: float 8s ease-in-out infinite;
        }
        .mask-edges {
          mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
          -webkit-mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
        }
        .text-spiritual {
          font-family: 'Inter', serif;
          font-style: italic;
          letter-spacing: -0.01em;
        }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* --- Navbar --- */}
      <nav className="fixed top-4 sm:top-6 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-5xl">
        <div className="bg-white/90 dark:bg-brand-dark/90 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-full px-4 sm:px-6 py-3 flex items-center justify-between shadow-float relative">
          <div className="flex items-center gap-2 group cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <BrandLogo size={24} variant="fill" className="text-brand-violet" />
            <span className="font-bold text-lg tracking-tight text-brand-dark dark:text-white block sm:block">Espiritualizei</span>
          </div>
          
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-400">
            <button onClick={() => scrollToSection('momentos')} className="hover:text-brand-violet transition-colors">Método</button>
            <button onClick={() => scrollToSection('acervo')} className="hover:text-brand-violet transition-colors">Aprender</button>
            <button onClick={() => scrollToSection('gps')} className="hover:text-brand-violet transition-colors">Igrejas</button>
            <button onClick={() => scrollToSection('depoimentos')} className="hover:text-brand-violet transition-colors">Impacto</button>
            <button onClick={() => scrollToSection('plano')} className="hover:text-brand-violet transition-colors">Assinar</button>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <button 
              onClick={onLogin}
              className="text-brand-dark dark:text-white font-bold text-sm hover:text-brand-violet transition-colors"
            >
              Entrar
            </button>
            <button 
              onClick={onStart}
              className="bg-brand-violet text-white px-5 py-2.5 rounded-full text-sm font-bold hover:bg-purple-600 active:scale-95 transition-all shadow-lg hover:shadow-brand-violet/30"
            >
              Começar Agora
            </button>
          </div>

          <div className="flex items-center gap-2 md:hidden">
            <button 
              onClick={onStart}
              className="bg-brand-violet text-white px-4 py-2 rounded-full text-xs font-bold shadow-lg shadow-brand-violet/20 active:scale-95 transition-all"
            >
              Começar
            </button>
            <button 
              className="text-slate-600 dark:text-slate-300 p-1"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {mobileMenuOpen && (
            <div className="absolute top-full left-0 right-0 mt-3 p-4 bg-white/95 dark:bg-[#1A2530]/95 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-3xl shadow-2xl flex flex-col gap-2 md:hidden animate-fade-in origin-top">
               <button onClick={() => scrollToSection('momentos')} className="p-3 text-left font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 rounded-xl transition-colors">Método</button>
               <button onClick={() => scrollToSection('acervo')} className="p-3 text-left font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 rounded-xl transition-colors">Aprender</button>
               <button onClick={() => scrollToSection('gps')} className="p-3 text-left font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 rounded-xl transition-colors">Igrejas</button>
               <button onClick={() => scrollToSection('depoimentos')} className="p-3 text-left font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 rounded-xl transition-colors">Impacto</button>
               <button onClick={() => scrollToSection('plano')} className="p-3 text-left font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 rounded-xl transition-colors">Assinar</button>
               
               <div className="h-px bg-slate-100 dark:bg-white/10 my-1" />
               <button 
                 onClick={() => { onLogin(); setMobileMenuOpen(false); }}
                 className="p-3 text-center font-bold text-slate-500 hover:text-brand-dark dark:hover:text-white"
               >
                 Já tenho conta
               </button>
               <button 
                 onClick={() => { onStart(); setMobileMenuOpen(false); }}
                 className="p-3 text-center font-bold text-brand-violet bg-brand-violet/5 hover:bg-brand-violet/10 rounded-xl border border-brand-violet/20"
               >
                 Começar Agora
               </button>
            </div>
          )}
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <section className="pt-32 pb-20 px-4 sm:px-6 relative overflow-hidden min-h-[90vh] flex items-center">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[150vw] h-[120vh] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-200/30 via-transparent to-transparent dark:from-brand-violet/20 dark:via-brand-dark dark:to-brand-dark pointer-events-none" />
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12 lg:gap-16 relative z-10 w-full">
          <div className="text-center lg:text-left animate-slide-in-right flex-1 lg:pr-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-violet/10 dark:bg-brand-violet/20 border border-brand-violet/20 rounded-full text-brand-violet text-xs font-bold uppercase tracking-widest mb-6">
              <Crown size={12} className="animate-pulse" fill="currentColor" /> Chega de recomeçar do zero.
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6 leading-[1.1] text-brand-dark dark:text-white">
              Tenha uma vida de oração <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-violet to-purple-400">constante</span>, feita para a sua realidade.
            </h1>
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 mb-8 max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium">
              Pare de tentar encaixar rotinas de mosteiro na sua vida corrida. Nossa inteligência cria um plano espiritual que <strong>respeita seu tempo, combate seus vícios e evolui com você</strong>.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start mb-12">
              <button onClick={onStart} className="w-full sm:w-auto px-8 py-4 bg-brand-violet text-white rounded-2xl font-bold text-lg shadow-2xl shadow-brand-violet/30 hover:bg-purple-600 hover:scale-105 transition-all flex items-center justify-center gap-2">
                Gerar Plano Adaptável <ArrowRight size={20} />
              </button>
              <div className="flex items-center gap-2 text-sm font-bold text-slate-500 dark:text-slate-400">
                 <Shield size={16} /> FIDELIDADE AO MAGISTÉRIO
              </div>
            </div>
          </div>
          
          <div className="relative w-full max-w-[350px] lg:max-w-[500px] h-[500px] sm:h-[600px] lg:h-[700px] flex-shrink-0 animate-slide-up mx-auto lg:mx-0 mt-8 lg:mt-0">
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-brand-violet/20 rounded-full blur-[80px] pointer-events-none" />
             
              <div className="absolute top-4 left-0 sm:left-4 w-[240px] sm:w-[280px] h-[480px] sm:h-[580px] bg-[#1A2530] rounded-[2.5rem] border-[6px] border-slate-800 shadow-2xl overflow-hidden ring-1 ring-white/10 transform -rotate-6 scale-90 opacity-60 hover:opacity-100 transition-all duration-500 z-10 blur-[1px] hover:blur-0">
                <div className="h-6 w-full flex justify-between px-4 items-center mt-1 opacity-50">
                   <div className="w-10 h-2.5 bg-white rounded-full"/>
                   <div className="flex gap-1"><div className="w-2.5 h-2.5 bg-white rounded-full"/></div>
                </div>
                <div className="w-full h-full flex flex-col pt-4 relative bg-[#1A2530]">
                   <div className="px-4 flex justify-between items-center mb-4">
                      <h3 className="text-white font-bold text-lg">Seu Plano</h3>
                      <div className="bg-brand-violet text-white text-[10px] font-bold px-2 py-1 rounded">30 DIAS</div>
                   </div>
                   <div className="flex-1 px-3 space-y-3 overflow-hidden">
                      <div className="bg-white/10 p-4 rounded-2xl border border-white/5">
                         <div className="flex gap-3 items-center mb-2">
                            <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center text-green-400"><RefreshCw size={20}/></div>
                            <div>
                               <p className="text-white font-bold text-sm">Renovação Mensal</p>
                               <p className="text-slate-400 text-xs">Ajustando para: <span className="text-white">Menos tempo</span></p>
                            </div>
                         </div>
                         <div className="h-1 w-full bg-white/10 rounded-full mt-2">
                            <div className="h-full w-3/4 bg-green-500 rounded-full"></div>
                         </div>
                      </div>
                      <div className="bg-white/5 p-3 rounded-2xl border border-white/5 opacity-70">
                         <div className="flex justify-between items-center">
                            <p className="text-slate-300 text-xs font-bold">Terço da Misericórdia</p>
                            <CheckCircle2 size={16} className="text-brand-violet"/>
                         </div>
                      </div>
                   </div>
                </div>
             </div>

             <div className="absolute top-12 sm:top-16 right-0 sm:right-4 w-[260px] sm:w-[300px] h-[500px] sm:h-[600px] bg-[#0F1623] rounded-[2.5rem] border-[8px] border-slate-800 shadow-[0_35px_60px_-15px_rgba(0,0,0,0.6)] overflow-hidden ring-1 ring-white/10 transform rotate-3 z-20 transition-all duration-500 hover:rotate-0 hover:scale-[1.02]">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-6 bg-slate-800 rounded-b-xl z-30" />
                <div className="w-full h-full bg-gradient-to-b from-[#1A2530] to-[#0F1115] flex flex-col relative">
                   <div className="pt-12 px-5 flex justify-between items-center mb-4">
                      <div>
                         <h3 className="text-white text-base font-bold">Comunidade</h3>
                         <p className="text-[9px] text-slate-400 uppercase tracking-wider">Liturgia & Intercessão</p>
                      </div>
                      <div className="flex gap-2">
                         <div className="w-8 h-8 bg-white/5 rounded-full flex items-center justify-center text-white border border-white/10"><MapPin size={14} /></div>
                         <div className="w-8 h-8 bg-brand-violet rounded-full flex items-center justify-center text-white shadow-lg shadow-brand-violet/20"><Plus size={16} /></div>
                      </div>
                   </div>
                   <div className="px-5 mb-4 flex gap-2">
                      <div className="bg-brand-violet text-white text-[10px] font-bold px-3 py-1.5 rounded-lg shadow-md">Mural</div>
                      <div className="bg-white/5 text-slate-400 text-[10px] font-bold px-3 py-1.5 rounded-lg">Testemunhos</div>
                   </div>
                   <div className="mx-4 p-0 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl relative overflow-hidden mb-3 shadow-xl">
                      <div className="absolute top-0 left-0 w-1 h-full bg-brand-violet" />
                      <div className="p-4">
                        <div className="flex justify-between items-start mb-3">
                           <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-brand-violet to-blue-600 p-[1.5px]">
                                 <div className="w-full h-full bg-[#1A2530] rounded-full flex items-center justify-center text-white text-xs font-bold border border-transparent">AC</div>
                              </div>
                              <div>
                                 <p className="text-xs font-bold text-white">Ana Clara</p>
                                 <div className="flex items-center gap-1.5 mt-0.5">
                                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                                    <span className="text-[9px] text-slate-400">Online agora</span>
                                 </div>
                              </div>
                           </div>
                        </div>
                        <p className="text-xs text-slate-200 leading-relaxed mb-4 font-medium">
                           "Peço orações pelo meu discernimento. Sinto que Deus me chama a algo mais, mas tenho medo."
                        </p>
                        <div className="flex items-center justify-between pt-3 border-t border-white/5">
                           <button className="flex items-center gap-2 bg-brand-violet text-white px-4 py-2 rounded-xl text-[10px] font-bold shadow-lg shadow-brand-violet/20 hover:bg-purple-600 transition-colors">
                              <Heart size={12} fill="currentColor" className="animate-pulse" /> Interceder
                           </button>
                           <div className="flex items-center -space-x-2">
                              {[1,2,3].map(i => (
                                 <div key={i} className="w-5 h-5 rounded-full bg-slate-700 border border-[#1A2530]" />
                              ))}
                              <div className="w-5 h-5 rounded-full bg-slate-800 border border-[#1A2530] flex items-center justify-center text-[8px] text-white font-bold">+9</div>
                           </div>
                        </div>
                      </div>
                   </div>
                   <div className="mt-auto bg-[#0F1115]/90 backdrop-blur-xl border-t border-white/5 p-4 flex justify-around items-center text-slate-500">
                     <Home size={20} />
                     <CheckCircle2 size={20} />
                     <Heart size={20} className="text-brand-violet fill-brand-violet/20" />
                     <BookOpen size={20} />
                   </div>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* --- SECTION 2: MÉTODO --- */}
      <section id="momentos" className="py-24 bg-slate-50 dark:bg-black/20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-brand-dark dark:text-white mb-4">Sua fé, organizada e viva.</h2>
            <p className="text-slate-500 dark:text-slate-400">Ferramentas essenciais para você sair do automatismo e encontrar profundidade na sua rotina de oração.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="bg-white/5 p-8 rounded-3xl border border-white/5 hover:border-brand-violet/30 transition-all group backdrop-blur-sm relative overflow-hidden">
               <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
               <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 text-blue-600 rounded-2xl flex items-center justify-center mb-6 relative z-10"><BookOpen size={24} /></div>
               <h3 className="text-xl font-bold text-brand-dark dark:text-white mb-3 relative z-10">Biblioteca Espiritual</h3>
               <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-sm relative z-10">Acesse um acervo organizado sobre Doutrina, Liturgia e Espiritualidade, com linguagem acessível e fiel ao Magistério.</p>
            </div>
            <div className="bg-white dark:bg-brand-violet/10 p-8 rounded-3xl shadow-sm border border-brand-violet/20 hover:border-brand-violet/50 transition-all relative overflow-hidden">
               <div className="absolute top-0 right-0 bg-brand-violet text-white text-[9px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-widest">Exclusivo</div>
               <div className="w-12 h-12 bg-brand-violet text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-brand-violet/20"><RefreshCw size={24} /></div>
               <h3 className="text-xl font-bold text-brand-dark dark:text-white mb-3">Plano Vivo e Adaptável</h3>
               <p className="text-slate-500 dark:text-slate-300 leading-relaxed text-sm">
                  Esqueça as listas de tarefas impossíveis. A cada 30 dias, fazemos uma nova avaliação para ajustar sua rotina ao seu momento real de vida.
               </p>
            </div>
            <div className="bg-white dark:bg-white/5 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-white/5 hover:border-brand-violet/30 transition-all">
               <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 text-purple-600 rounded-2xl flex items-center justify-center mb-6"><Users size={24} /></div>
               <h3 className="text-xl font-bold text-brand-dark dark:text-white mb-3">Comunidade de Intercessão</h3>
               <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-sm">Publique seus pedidos de oração e veja quantas pessoas estão rezando por você em tempo real.</p>
            </div>
          </div>
          <div className="text-center">
             <button onClick={onStart} className="inline-flex items-center gap-2 text-brand-violet font-bold hover:underline decoration-2 underline-offset-4 transition-all">
               Gerar Plano Adaptável <ArrowRight size={16} />
             </button>
          </div>
        </div>
      </section>

      {/* --- SECTION 3: APRENDER --- */}
      <section id="acervo" className="py-24 bg-white dark:bg-brand-dark relative">
         <div className="max-w-6xl mx-auto px-6">
            <div className="flex flex-col md:flex-row items-center gap-12">
               <div className="flex-1">
                  <span className="text-brand-violet text-xs font-bold uppercase tracking-widest mb-4 block">Ninguém ama o que não conhece</span>
                  <h2 className="text-4xl font-extrabold text-brand-dark dark:text-white mb-6 leading-tight">Uma biblioteca completa para nutrir sua inteligência.</h2>
                  <p className="text-lg text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
                     De nada adianta rezar se não soubermos quem é Deus. Reunimos em um só lugar textos curtos, profundos e diretos sobre os tesouros da Igreja.
                  </p>
                  <div className="space-y-4">
                     {['Santos e Heróis da Fé', 'Explicação da Santa Missa', 'Métodos de Oração', 'Doutrina Segura'].map((item, i) => (
                        <div key={i} className="flex items-center gap-3">
                           <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 flex items-center justify-center shrink-0"><Check size={14} strokeWidth={3} /></div>
                           <span className="font-bold text-brand-dark dark:text-slate-200">{item}</span>
                        </div>
                     ))}
                  </div>
               </div>
               <div className="flex-1 relative">
                  <div className="absolute inset-0 bg-brand-violet/20 blur-[100px] rounded-full pointer-events-none" />
                  <div className="grid grid-cols-2 gap-4 relative z-10">
                     <div className="bg-slate-50 dark:bg-[#1A1F26] p-6 rounded-3xl border border-slate-100 dark:border-white/5 shadow-xl transform translate-y-8">
                        <Flame size={32} className="text-orange-500 mb-4" />
                        <h4 className="font-bold text-brand-dark dark:text-white">Espiritualidade</h4>
                        <p className="text-xs text-slate-500 mt-2">Como rezar, jejum e virtudes.</p>
                     </div>
                     <div className="bg-slate-50 dark:bg-[#1A1F26] p-6 rounded-3xl border border-slate-100 dark:border-white/5 shadow-xl">
                        <BookOpen size={32} className="text-blue-500 mb-4" />
                        <h4 className="font-bold text-brand-dark dark:text-white">Doutrina</h4>
                        <p className="text-xs text-slate-500 mt-2">Dogmas e catecismo explicado.</p>
                     </div>
                     <div className="bg-slate-50 dark:bg-[#1A1F26] p-6 rounded-3xl border border-slate-100 dark:border-white/5 shadow-xl transform translate-y-8">
                        <Sun size={32} className="text-amber-500 mb-4" />
                        <h4 className="font-bold text-brand-dark dark:text-white">Liturgia</h4>
                        <p className="text-xs text-slate-500 mt-2">Entenda cada parte da Missa.</p>
                     </div>
                     <div className="bg-slate-50 dark:bg-[#1A1F26] p-6 rounded-3xl border border-slate-100 dark:border-white/5 shadow-xl">
                        <Users size={32} className="text-brand-violet mb-4" />
                        <h4 className="font-bold text-brand-dark dark:text-white">Vidas de Santos</h4>
                        <p className="text-xs text-slate-500 mt-2">Exemplos reais para seguir.</p>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </section>

      {/* --- SECTION 4: IGREJAS --- */}
      <section id="gps" className="py-24 bg-brand-dark relative overflow-hidden text-white">
         <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/city-fields.png')]" />
         <div className="max-w-6xl mx-auto px-6 relative z-10 flex flex-col md:flex-row items-center gap-16">
            <div className="flex-1 flex justify-center w-full">
               <div className="relative w-[300px] h-[600px] bg-slate-900 rounded-[3rem] border-[8px] border-slate-800 shadow-2xl overflow-hidden ring-1 ring-white/10">
                  <div className="absolute inset-0 bg-slate-800">
                     <img src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=600" className="w-full h-full object-cover opacity-40 grayscale" alt="Mapa" />
                     <div className="absolute top-1/3 left-1/4 text-brand-violet animate-bounce"><MapPin size={32} fill="currentColor" /></div>
                  </div>
                  <div className="absolute bottom-8 left-4 right-4 bg-[#1A2530] p-4 rounded-2xl border border-white/10 shadow-2xl animate-slide-up">
                     <div className="flex gap-3 mb-3">
                        <div className="w-16 h-16 rounded-lg bg-slate-700 overflow-hidden shrink-0"><img src="https://images.unsplash.com/photo-1548625361-888978202d8b?auto=format&fit=crop&q=80&w=200" className="w-full h-full object-cover" /></div>
                        <div><h4 className="font-bold text-white text-sm mt-1 leading-tight">Santuário N. Sra. Aparecida</h4><p className="text-[10px] text-slate-400 mt-1">Esta casa de Deus aguarda sua visita. ♥</p></div>
                     </div>
                     <div className="grid grid-cols-2 gap-2"><button className="bg-white/10 text-white py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1">Convidar</button><button className="bg-brand-violet text-white py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1">Traçar Rota</button></div>
                  </div>
               </div>
            </div>
            <div className="flex-1 text-center md:text-left">
               <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full text-amber-500 text-xs font-bold uppercase tracking-widest mb-6">
                 <Navigation size={14} /> Localizador de Igrejas
               </div>
               <h2 className="text-4xl font-extrabold text-white mb-6 leading-tight">Nunca mais perca <br /> uma Santa Missa.</h2>
               <p className="text-lg text-slate-300 mb-8 leading-relaxed">Viajou? Mudou de bairro? O Espiritualizei localiza todas as igrejas, capelas e santuários católicos ao seu redor em segundos.</p>
               <div className="mt-10"><button onClick={onStart} className="bg-brand-violet text-white px-8 py-4 rounded-xl font-bold shadow-2xl hover:bg-purple-600 transition-all flex items-center gap-2">Começar Agora</button></div>
            </div>
         </div>
      </section>

      {/* --- SECTION 5: IMPACTO (SUPER PREMIUM OTIMIZADO) --- */}
      <section id="depoimentos" className="py-24 bg-slate-50 dark:bg-brand-dark overflow-hidden relative group/section">
         <div className="max-w-6xl mx-auto px-6 mb-12 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-violet/10 border border-brand-violet/20 rounded-full text-brand-violet text-xs font-bold uppercase tracking-widest mb-6">
               <Heart size={12} fill="currentColor" /> Histórias de Graça
            </div>
            <h2 className="text-3xl md:text-5xl font-extrabold text-brand-dark dark:text-white mb-4 tracking-tight">O que dizem os peregrinos</h2>
            <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto text-base sm:text-lg leading-relaxed">
               Ferramentas modernas para uma fé inabalável. No mobile, deslize para conhecer as histórias.
            </p>
         </div>

         {/* Container do Carrossel com Efeito de Bordas Suaves e interação mobile melhorada */}
         <div className="relative w-full mask-edges pause-on-interaction py-4">
            {/* Botões Manuais (Desktop Only) */}
            <div className="absolute inset-y-0 left-2 sm:left-10 z-30 flex items-center opacity-0 group-hover/section:opacity-100 transition-opacity hidden md:flex">
               <button 
                 onClick={() => scrollManual('left')}
                 className="w-12 h-12 bg-white/80 dark:bg-brand-dark/80 backdrop-blur-md rounded-full shadow-xl border border-slate-200 dark:border-white/10 flex items-center justify-center text-brand-violet hover:scale-110 active:scale-95 transition-all"
               >
                  <ChevronLeft size={24} />
               </button>
            </div>
            <div className="absolute inset-y-0 right-2 sm:right-10 z-30 flex items-center opacity-0 group-hover/section:opacity-100 transition-opacity hidden md:flex">
               <button 
                 onClick={() => scrollManual('right')}
                 className="w-12 h-12 bg-white/80 dark:bg-brand-dark/80 backdrop-blur-md rounded-full shadow-xl border border-slate-200 dark:border-white/10 flex items-center justify-center text-brand-violet hover:scale-110 active:scale-95 transition-all"
               >
                  <ChevronRight size={24} />
               </button>
            </div>

            {/* Linha Principal - Container animado que permite scroll manual ao interagir */}
            <div 
               ref={scrollRef}
               className="overflow-x-auto no-scrollbar snap-x snap-mandatory scroll-smooth px-6 sm:px-10"
            >
               <div className="animate-marquee-container py-4">
                  {/* Duplicamos a lista para o loop infinito sem cortes */}
                  {[...TESTIMONIALS, ...TESTIMONIALS].map((t, i) => (
                     <div 
                        key={i} 
                        className="card-float w-[260px] sm:w-[280px] shrink-0 bg-white dark:bg-[#1A1F26] p-6 rounded-[2rem] border border-slate-100 dark:border-white/5 shadow-soft hover:shadow-glow hover:border-brand-violet/20 transition-all snap-center group flex flex-col justify-between min-h-[320px] relative overflow-hidden"
                     >
                        {/* Background Pattern Sutil */}
                        <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity">
                           <Quote size={60} fill="currentColor" />
                        </div>

                        <div>
                           {/* Header com Avatar Compacto */}
                           <div className="flex items-center gap-3 mb-6">
                              <div className={`w-11 h-11 rounded-xl p-[1.5px] bg-gradient-to-tr ${t.color} shadow-lg shrink-0 group-hover:rotate-3 transition-transform duration-500`}>
                                 <div className="w-full h-full bg-white dark:bg-[#1A1F26] rounded-[10px] flex items-center justify-center font-bold text-brand-dark dark:text-white text-xs">
                                    {t.avatar}
                                 </div>
                              </div>
                              <div className="min-w-0">
                                 <p className="font-extrabold text-brand-dark dark:text-white text-sm tracking-tight truncate">{t.name}</p>
                                 <p className="text-[9px] text-brand-violet font-bold uppercase tracking-[0.1em] opacity-80 truncate">{t.role}</p>
                              </div>
                           </div>

                           {/* Corpo com Tipografia Serifada Premium Otimizada */}
                           <div className="relative">
                              <p className="text-slate-700 dark:text-slate-200 text-sm leading-relaxed font-medium italic text-spiritual relative z-10">
                                 "{t.text}"
                              </p>
                           </div>
                        </div>

                        {/* Footer com Rating Minimalista */}
                        <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-50 dark:border-white/5">
                           <div className="flex gap-0.5">
                              {[1,2,3,4,5].map(star => <Star key={star} size={12} className="text-amber-400 fill-amber-400" />) }
                           </div>
                           <div className="flex items-center gap-1 bg-slate-50 dark:bg-white/5 px-2 py-0.5 rounded-full border border-slate-100 dark:border-white/10">
                              <CheckCircle2 size={10} className="text-green-500" />
                              <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Verificado</span>
                           </div>
                        </div>
                     </div>
                  ))}
               </div>
            </div>
         </div>
         
         {/* Dica Visual para Interação Mobile */}
         <div className="flex justify-center gap-2 mt-4 md:hidden">
            <div className="w-8 h-1 rounded-full bg-brand-violet animate-pulse" />
            <div className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
            <div className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
         </div>
      </section>

      {/* --- PLANO --- */}
      <section id="plano" className="py-24 bg-brand-violet/5 dark:bg-black/40 relative overflow-hidden">
         <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-brand-violet/30 to-transparent" />
         <div className="max-w-6xl mx-auto px-6">
            <div className="text-center max-w-3xl mx-auto mb-16">
               <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full text-xs font-bold uppercase tracking-widest mb-6">
                 <CheckCircle2 size={12} /> Tudo em um só lugar
               </div>
               <h2 className="text-3xl md:text-5xl font-extrabold text-brand-dark dark:text-white mb-6 leading-tight">
                  Sua vida espiritual não precisa ser <span className="text-brand-violet">fragmentada.</span>
               </h2>
               <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl mx-auto">
                  Chega de usar o bloco de notas para intenções e o YouTube para rezar. Reunimos o essencial para você focar no Único necessário.
               </p>
            </div>
            <div className="grid lg:grid-cols-2 gap-12 max-w-5xl mx-auto items-center">
               <div className="space-y-8">
                  <div className="bg-white dark:bg-white/5 p-6 rounded-3xl border border-slate-100 dark:border-white/5">
                     <h3 className="text-xl font-bold text-brand-dark dark:text-white mb-4 flex items-center gap-3">
                        <div className="bg-brand-violet/10 p-2 rounded-lg text-brand-violet"><Shield size={20}/></div>
                        Sua oração é sagrada
                     </h3>
                     <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                        Em um mundo barulhento, oferecemos um ambiente limpo, sem anúncios, sem rastreamento e 100% focado no seu momento com Deus. Seu Diário da Alma é privado.
                     </p>
                  </div>
                  <div className="bg-white dark:bg-white/5 p-6 rounded-3xl border border-slate-100 dark:border-white/5">
                     <h3 className="text-xl font-bold text-brand-dark dark:text-white mb-4 flex items-center gap-3">
                        <div className="bg-blue-500/10 p-2 rounded-lg text-blue-500"><Brain size={20}/></div>
                        Não é mágica, é organização
                     </h3>
                     <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                        Nossa tecnologia serve para organizar o caos da sua agenda. Ela adapta sua rotina para que você encontre tempo para rezar, mesmo nos dias difíceis.
                     </p>
                  </div>
                  <div className="bg-white dark:bg-white/5 p-6 rounded-3xl border border-slate-100 dark:border-white/5">
                     <h3 className="text-xl font-bold text-brand-dark dark:text-white mb-4 flex items-center gap-3">
                        <div className="bg-amber-500/10 p-2 rounded-lg text-amber-500"><Users size={20}/></div>
                        Irmãos que rezam
                     </h3>
                     <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                        Você nunca mais rezará sozinho. Tenha uma comunidade real intercedendo por suas lutas e dores diárias.
                     </p>
                  </div>
               </div>
               <div className="bg-white dark:bg-[#1A1F26] p-2 rounded-[2.5rem] shadow-2xl shadow-brand-violet/20 border border-slate-100 dark:border-white/10 relative overflow-hidden transform hover:scale-[1.01] transition-transform">
                  <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-brand-violet to-purple-500" />
                  <div className="p-8 sm:p-10 text-center">
                     <h3 className="text-lg font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-4">Acesso Completo</h3>
                     <div className="flex items-center justify-center gap-1 mb-2">
                        <span className="text-2xl font-bold text-slate-400 align-top mt-2">R$</span>
                        <span className="text-6xl font-black text-brand-dark dark:text-white tracking-tighter">37,90</span>
                     </div>
                     <p className="text-slate-400 text-sm font-medium mb-8">cobrança mensal • cancele quando quiser</p>
                     <button onClick={onStart} className="w-full bg-brand-violet text-white py-4 rounded-2xl font-bold text-lg shadow-xl shadow-brand-violet/30 hover:bg-purple-600 transition-all active:scale-95 flex items-center justify-center gap-2 mb-6 group">
                        Começar Agora <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                     </button>
                     <div className="space-y-4 text-left border-t border-slate-100 dark:border-white/5 pt-6">
                        {[
                           'Desafios diários para sua realidade',
                           'Feed de intercessão e testemunhos',
                           'Ranking para incentivo da comunidade',
                           'Chat de Apoio e Tira-Dúvidas',
                           'Liturgia Diária e Reflexões Práticas',
                           'Acervo de Espiritualidade e Estudos',
                           'Ambiente de Foco e Oração',
                           'Localizador de Missas Global'
                        ].map((feat, i) => (
                           <div key={i} className="flex items-center gap-3 text-sm font-medium text-slate-600 dark:text-slate-300">
                              <div className="w-5 h-5 rounded-full bg-green-500/10 text-green-600 flex items-center justify-center shrink-0"><Check size={12} strokeWidth={3} /></div>
                              {feat}
                           </div>
                        ))}
                     </div>
                  </div>
                  <div className="bg-slate-50 dark:bg-white/5 p-4 text-center">
                     <p className="text-[10px] text-slate-400 flex items-center justify-center gap-2">
                        <Lock size={10} /> Pagamento seguro via Stripe. Garantia de 7 dias.
                     </p>
                  </div>
               </div>
            </div>
         </div>
      </section>

      {/* --- FAQ --- */}
      <section className="py-24 max-w-4xl mx-auto px-6">
         <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-brand-dark dark:text-white mb-4">Perguntas Frequentes</h2>
            <p className="text-slate-500 dark:text-slate-400">Tire suas dúvidas sobre o Espiritualizei.</p>
         </div>
         <div className="space-y-4">
            {[
               { q: "Por que o app não é gratuito?", a: "Para garantir sua privacidade absoluta (não vendemos dados) e oferecer uma experiência sem anúncios. É um valor simbólico para manter um projeto que nutre sua alma." },
               { q: "Como funciona a Comunidade de Intercessão?", a: "É um 'Mural de Graças' onde você pede orações e reza pelos irmãos. Você recebe notificações reais sempre que alguém intercede pela sua intenção, criando uma corrente de apoio espiritual." },
               { q: "O Localizador de Igrejas funciona em todo lugar?", a: "Sim. Utilizamos tecnologia global para localizar paróquias, capelas e santuários católicos onde quer que você esteja, ideal para viagens ou para descobrir novos locais de missa no seu bairro." },
               { q: "E se eu não conseguir cumprir a rotina?", a: "Fique em paz. O sistema de renovação mensal serve exatamente para isso: a cada 30 dias, ajustamos o plano baseados no que você conseguiu ou não fazer. O foco é o progresso, não a perfeição." },
               { q: "O conteúdo é fiel à doutrina católica?", a: "Sim. Todo o algoritmo e a biblioteca são curados com base estrita nas Sagradas Escrituras, no Magistério da Igreja e na vida dos Santos. Não há 'achismos'." },
               { q: "Tenho fidelidade na assinatura?", a: "Nenhuma. Você pode cancelar a renovação automática a qualquer momento nas configurações do seu perfil. Queremos que você fique pelos frutos espirituais, não por contrato." },
            ].map((item, idx) => (
               <div key={idx} className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-2xl overflow-hidden transition-all hover:border-brand-violet/30">
                  <button onClick={() => toggleFaq(idx)} className="w-full flex justify-between items-center p-6 text-left hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                     <span className="font-bold text-brand-dark dark:text-white text-sm md:text-base">{item.q}</span>
                     {openFaq === idx ? <ChevronUp className="text-brand-violet" /> : <ChevronDown className="text-slate-400" />}
                  </button>
                  {openFaq === idx && (
                     <div className="px-6 pb-6 pt-0 text-slate-600 dark:text-slate-400 text-sm leading-relaxed animate-fade-in border-t border-slate-100 dark:border-white/5 pt-4 mt-2">
                        {item.a}
                     </div>
                  )}
               </div>
            ))}
         </div>
      </section>

      <footer className="bg-white dark:bg-brand-dark border-t border-slate-200 dark:border-white/10 pt-20 pb-10 px-6 relative overflow-hidden">
         <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-px bg-gradient-to-r from-transparent via-brand-violet/20 to-transparent" />
         <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
               <div className="space-y-6">
                  <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                     <BrandLogo size={32} variant="fill" className="text-brand-violet" />
                     <span className="font-bold text-xl text-brand-dark dark:text-white tracking-tight">Espiritualizei</span>
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-xs">
                     Tecnologia a serviço da santidade. Sua rotina de oração, formação e comunidade em um só lugar.
                  </p>
                  <div className="flex gap-4">
                     <a href="https://instagram.com" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-500 hover:bg-gradient-to-tr hover:from-yellow-400 hover:via-red-500 hover:to-purple-500 hover:text-white transition-all shadow-sm"><Instagram size={18} /></a>
                     <a href="https://youtube.com" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-500 hover:bg-red-600 hover:text-white transition-all shadow-sm"><Youtube size={18} /></a>
                     <a href="https://twitter.com" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-500 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all shadow-sm"><Twitter size={18} /></a>
                  </div>
               </div>
               <div>
                  <h4 className="font-bold text-brand-dark dark:text-white mb-6">Produto</h4>
                  <ul className="space-y-4 text-sm text-slate-500 dark:text-slate-400 font-medium">
                     <li><button onClick={() => scrollToSection('momentos')} className="hover:text-brand-violet transition-colors text-left w-full hover:translate-x-1 duration-200">O Método</button></li>
                     <li><button onClick={() => scrollToSection('acervo')} className="hover:text-brand-violet transition-colors text-left w-full hover:translate-x-1 duration-200">Biblioteca da Fé</button></li>
                     <li><button onClick={() => scrollToSection('gps')} className="hover:text-brand-violet transition-colors text-left w-full hover:translate-x-1 duration-200">Encontrar Igrejas</button></li>
                     <li><button onClick={() => scrollToSection('depoimentos')} className="hover:text-brand-violet transition-colors text-left w-full hover:translate-x-1 duration-200">Impacto Real</button></li>
                     <li><button onClick={() => scrollToSection('plano')} className="hover:text-brand-violet transition-colors text-left w-full hover:translate-x-1 duration-200">Planos de Acesso</button></li>
                  </ul>
               </div>
               <div>
                  <h4 className="font-bold text-brand-dark dark:text-white mb-6">Suporte</h4>
                  <ul className="space-y-4 text-sm text-slate-500 dark:text-slate-400 font-medium">
                     <li><button onClick={() => setActiveModal('about')} className="hover:text-brand-violet transition-colors text-left w-full hover:translate-x-1 duration-200">Nossa Missão</button></li>
                     <li><button onClick={() => setActiveModal('contact')} className="hover:text-brand-violet transition-colors text-left w-full hover:translate-x-1 duration-200">Central de Ajuda</button></li>
                     <li><button onClick={() => setActiveModal('terms')} className="hover:text-brand-violet transition-colors text-left w-full hover:translate-x-1 duration-200">Termos de Uso</button></li>
                     <li><button onClick={() => setActiveModal('privacy')} className="hover:text-brand-violet transition-colors text-left w-full hover:translate-x-1 duration-200">Privacidade e Dados</button></li>
                  </ul>
               </div>
               <div>
                  <h4 className="font-bold text-brand-dark dark:text-white mb-6">Comece Agora</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Transforme sua vida de oração hoje mesmo.</p>
                  <button onClick={onStart} className="w-full bg-brand-dark dark:bg-white text-white dark:text-brand-dark py-3.5 rounded-xl font-bold text-sm shadow-lg hover:scale-[1.02] transition-all mb-3 flex items-center justify-center gap-2">
                     <ArrowRight size={16} /> Gerar Plano Adaptável
                  </button>
                  <p className="text-[10px] text-slate-400 text-center">Disponível para Web, iOS e Android (PWA).</p>
               </div>
            </div>
            <div className="border-t border-slate-200 dark:border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
               <p className="text-xs text-slate-400 font-medium">© 2025 Espiritualizei Tecnologia LTDA. Todos os direitos reservados.</p>
               <div className="flex gap-6 text-xs text-slate-400 font-medium">
                  <span>Ad Maiorem Dei Gloriam</span>
                  <span>Feito com † em São Paulo</span>
               </div>
            </div>
         </div>
      </footer>

      {activeModal === 'terms' && <TermsModal onClose={() => setActiveModal(null)} />}
      {activeModal === 'privacy' && <PrivacyModal onClose={() => setActiveModal(null)} />}
      {activeModal === 'about' && <AboutModal onClose={() => setActiveModal(null)} />}
      {activeModal === 'contact' && <ContactModal onClose={() => setActiveModal(null)} />}

    </div>
  );
};

export default LandingPage;
