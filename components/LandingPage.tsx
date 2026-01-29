
import React, { useState } from 'react';
import { Shield, ArrowRight, CheckCircle2, ChevronDown, ChevronUp, Moon, Brain, Coffee, CloudRain, Quote, Sun, Heart, Users, Flame, BookOpen, Star, Clock, MessageCircle, Instagram, Youtube, Twitter, Sparkles, Calendar, Lock, ShieldCheck, Zap, Trophy, Check, Home, RefreshCw, Smartphone, Cross, Anchor, Target } from 'lucide-react';
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
      const headerOffset = 100;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - headerOffset;

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
            <button onClick={(e) => { e.preventDefault(); scrollToSection('metodo'); }} className="hover:text-brand-violet transition-colors">O Método</button>
            <button onClick={(e) => { e.preventDefault(); scrollToSection('funcionalidades'); }} className="hover:text-brand-violet transition-colors">O App</button>
            <button onClick={(e) => { e.preventDefault(); scrollToSection('assinatura'); }} className="hover:text-brand-violet transition-colors">Assinatura</button>
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
            A vida espiritual não precisa ser um fardo pesado. O Espiritualizei ajuda você a organizar sua jornada diária com humildade e constância, adaptando-se à sua realidade para que a oração seja seu verdadeiro porto seguro.
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
               <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto text-lg font-medium leading-relaxed">Não queremos ser mais um peso na sua lista de tarefas, mas a mão que te ajuda a caminhar quando você se sente cansado ou perdido.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
               <div className="bg-white dark:bg-[#1A1F26] p-10 rounded-[3rem] shadow-sm border border-slate-100 dark:border-white/5 group hover:border-brand-violet/40 transition-all">
                  <div className="w-16 h-16 flex items-center justify-center text-brand-violet mb-8 group-hover:scale-110 transition-transform"><RefreshCw size={40} /></div>
                  <h3 className="text-2xl font-bold mb-4">Jornada Diária Real</h3>
                  <p className="text-slate-500 dark:text-slate-400 leading-relaxed font-medium">O Espiritualizei entende sua rotina e sugere práticas que cabem no seu tempo. Com humildade, caminhamos um passo de cada vez, ajustando o plano conforme sua vida muda.</p>
               </div>
               <div className="bg-white dark:bg-[#1A1F26] p-10 rounded-[3rem] shadow-sm border border-slate-100 dark:border-white/5 group hover:border-blue-500/40 transition-all">
                  <div className="w-16 h-16 flex items-center justify-center text-blue-600 mb-8 group-hover:scale-110 transition-transform"><BookOpen size={40} /></div>
                  <h3 className="text-2xl font-bold mb-4">Formação Sem Pressa</h3>
                  <p className="text-slate-500 dark:text-slate-400 leading-relaxed font-medium">Acesse a Biblioteca da Fé com textos curtos e profundos. Aprenda sobre os santos e a doutrina enquanto aguarda um café ou no trajeto do trabalho.</p>
               </div>
               <div className="bg-white dark:bg-[#1A1F26] p-10 rounded-[3rem] shadow-sm border border-slate-100 dark:border-white/5 group hover:border-orange-500/40 transition-all">
                  <div className="w-16 h-16 flex items-center justify-center text-orange-600 mb-8 group-hover:scale-110 transition-transform"><Zap size={40} /></div>
                  <h3 className="text-2xl font-bold mb-4">Foco na Constância</h3>
                  <p className="text-slate-500 dark:text-slate-400 leading-relaxed font-medium">Menos é mais. Nosso foco é te ajudar a rezar 15 minutos todos os dias com qualidade, em vez de tentar grandes metas que acabam sendo abandonadas.</p>
               </div>
            </div>
         </div>
      </section>

      {/* --- FUNCIONALIDADES DETALHADAS --- */}
      <section id="funcionalidades" className="py-32 bg-white dark:bg-brand-dark">
        <div className="max-w-6xl mx-auto px-6">
          <div className="space-y-32">
            
            {/* Feature 1: Jornada Personalizada */}
            <div className="grid md:grid-cols-2 gap-16 items-center">
              <div className="order-2 md:order-1">
                <div className="w-[300px] h-[550px] bg-brand-dark rounded-[3rem] border-[8px] border-slate-800 shadow-2xl overflow-hidden mx-auto relative">
                  <div className="absolute inset-0 bg-gradient-to-b from-brand-violet/20 to-transparent pointer-events-none" />
                  <div className="p-6 pt-12">
                    <div className="flex items-center gap-3 mb-8">
                      <div className="w-10 h-10 flex items-center justify-center text-brand-violet"><Calendar size={24} /></div>
                      <h4 className="text-white font-bold">Minha Jornada</h4>
                    </div>
                    <div className="space-y-4">
                      {[
                        { t: 'Oração da Manhã', d: '5 min • Primícias', c: true },
                        { t: 'Terço da Misericórdia', d: '10 min • Tarde', c: false },
                        { t: 'Exame de Consciência', d: '5 min • Noite', c: false }
                      ].map((item, i) => (
                        <div key={i} className={`p-4 rounded-2xl border ${item.c ? 'bg-brand-violet/20 border-brand-violet/30' : 'bg-white/5 border-white/10'}`}>
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="text-white text-sm font-bold">{item.t}</p>
                              <p className="text-slate-400 text-[10px]">{item.d}</p>
                            </div>
                            {item.c && <CheckCircle2 size={16} className="text-brand-violet" />}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="order-1 md:order-2 space-y-6">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-brand-violet/10 rounded-full text-brand-violet text-[10px] font-black uppercase tracking-widest">
                  Exclusivo e Pessoal
                </div>
                <h2 className="text-4xl sm:text-5xl font-black tracking-tighter leading-tight">Um plano de vida que respeita seu tempo.</h2>
                <p className="text-slate-500 dark:text-slate-400 text-lg leading-relaxed">
                  Através de um questionário inicial, entendemos seu estado de vida, suas lutas e sua disponibilidade. O Espiritualizei cria uma jornada diária que não te sobrecarrega, mas te mantém no caminho da santidade com passos firmes e possíveis.
                </p>
                <ul className="space-y-4">
                  <li className="flex items-center gap-3 text-slate-600 dark:text-slate-300 font-medium">
                    <CheckCircle2 size={20} className="text-brand-violet" /> Sugestões baseadas na sua rotina real
                  </li>
                  <li className="flex items-center gap-3 text-slate-600 dark:text-slate-300 font-medium">
                    <CheckCircle2 size={20} className="text-brand-violet" /> Notificações suaves para te lembrar de parar e rezar
                  </li>
                  <li className="flex items-center gap-3 text-slate-600 dark:text-slate-300 font-medium">
                    <CheckCircle2 size={20} className="text-brand-violet" /> Ajuste flexível conforme seu progresso
                  </li>
                </ul>
              </div>
            </div>

            {/* Feature 2: Comunidade */}
            <div className="grid md:grid-cols-2 gap-16 items-center">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-rose-100 dark:bg-rose-900/20 rounded-full text-rose-600 text-[10px] font-black uppercase tracking-widest">
                  União e Intercessão
                </div>
                <h2 className="text-4xl sm:text-5xl font-black tracking-tighter leading-tight">Você nunca mais rezará sozinho.</h2>
                <p className="text-slate-500 dark:text-slate-400 text-lg leading-relaxed">
                  A vida espiritual no mundo pode ser solitária. No Espiritualizei, você faz parte de uma comunidade viva. Peça orações em momentos de dificuldade e sinta o conforto de saber que outros irmãos estão intercedendo por você naquele exato momento.
                </p>
                <div className="grid grid-cols-2 gap-4 pt-4">
                  <div className="p-6 bg-slate-50 dark:bg-white/5 rounded-3xl border border-slate-100 dark:border-white/10">
                    <h4 className="font-bold text-brand-violet mb-2">Mural de Orações</h4>
                    <p className="text-xs text-slate-500">Poste suas intenções e receba o apoio da comunidade.</p>
                  </div>
                  <div className="p-6 bg-slate-50 dark:bg-white/5 rounded-3xl border border-slate-100 dark:border-white/10">
                    <h4 className="font-bold text-brand-violet mb-2">Desafios Coletivos</h4>
                    <p className="text-xs text-slate-500">Participe de novenas e jornadas com milhares de pessoas.</p>
                  </div>
                </div>
              </div>
              <div className="relative">
                <div className="w-[300px] h-[550px] bg-brand-dark rounded-[3rem] border-[8px] border-slate-800 shadow-2xl overflow-hidden mx-auto relative">
                  <div className="p-6 pt-12">
                    <div className="flex items-center gap-3 mb-8">
                      <div className="w-10 h-10 flex items-center justify-center text-rose-500"><Heart size={24} /></div>
                      <h4 className="text-white font-bold">Comunidade</h4>
                    </div>
                    <div className="space-y-4">
                      <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-6 h-6 bg-slate-700 rounded-full"></div>
                          <p className="text-[10px] text-slate-400 font-bold">Maria Silva</p>
                        </div>
                        <p className="text-white text-xs italic">"Peço orações pela restauração da minha família."</p>
                        <div className="mt-3 flex items-center gap-1 text-rose-500 text-[10px] font-black">
                          <Flame size={12} fill="currentColor" /> 84 pessoas rezando
                        </div>
                      </div>
                      <div className="bg-brand-violet/20 p-4 rounded-2xl border border-brand-violet/30">
                        <p className="text-white text-xs font-bold mb-1">Desafio Quaresmal</p>
                        <div className="w-full bg-white/10 h-1.5 rounded-full mt-2">
                          <div className="w-3/4 h-full bg-brand-violet rounded-full"></div>
                        </div>
                        <p className="text-[9px] text-slate-400 mt-2">1.240 participantes ativos</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Feature 3: Biblioteca e Formação */}
            <div className="grid md:grid-cols-2 gap-16 items-center">
              <div className="order-2 md:order-1">
                <div className="w-[300px] h-[550px] bg-brand-dark rounded-[3rem] border-[8px] border-slate-800 shadow-2xl overflow-hidden mx-auto relative">
                  <div className="p-6 pt-12">
                    <div className="flex items-center gap-3 mb-8">
                      <div className="w-10 h-10 flex items-center justify-center text-blue-400"><BookOpen size={24} /></div>
                      <h4 className="text-white font-bold">Biblioteca</h4>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {['Santos', 'Doutrina', 'Liturgia', 'Orações'].map((cat, i) => (
                        <div key={i} className="aspect-square bg-white/5 rounded-2xl border border-white/10 flex flex-col items-center justify-center p-4 text-center">
                          <div className="w-8 h-8 text-blue-400 flex items-center justify-center mb-2"><Star size={20} /></div>
                          <p className="text-white text-[10px] font-bold">{cat}</p>
                        </div>
                      ))}
                    </div>
                    <div className="mt-6 p-4 bg-white/5 rounded-2xl border border-white/10">
                      <p className="text-white text-xs font-bold mb-1">Evangelho de Hoje</p>
                      <p className="text-slate-400 text-[10px] line-clamp-3">"Naquele tempo, Jesus disse aos seus discípulos..."</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="order-1 md:order-2 space-y-6">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-100 dark:bg-blue-900/20 rounded-full text-blue-600 text-[10px] font-black uppercase tracking-widest">
                  Sabedoria Milenar
                </div>
                <h2 className="text-4xl sm:text-5xl font-black tracking-tighter leading-tight">Conhecer para amar mais profundamente.</h2>
                <p className="text-slate-500 dark:text-slate-400 text-lg leading-relaxed">
                  A fé não é apenas sentimento, é também inteligência. Nossa biblioteca oferece conteúdos curtos, mas densos, para que você possa se formar enquanto vive sua rotina. Da vida dos santos às explicações da Santa Missa, tudo está ao alcance de um toque.
                </p>
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/10">
                    <div className="w-10 h-10 text-blue-500 flex items-center justify-center shrink-0"><Target size={24} /></div>
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Conteúdos curtos para ler em 5 minutos</p>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/10">
                    <div className="w-10 h-10 text-blue-500 flex items-center justify-center shrink-0"><Smartphone size={24} /></div>
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Acesso offline para seus momentos de deserto</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* --- ASSINATURA --- */}
      <section id="assinatura" className="py-32 bg-slate-50 dark:bg-black/20">
         <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-20">
               <h2 className="text-4xl sm:text-6xl font-black tracking-tighter mb-6">Sua jornada começa aqui</h2>
               <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto font-medium text-lg">O Espiritualizei é um projeto mantido por leigos para ajudar você a manter a chama da fé acesa todos os dias.</p>
            </div>
            <div className="max-w-2xl mx-auto">
               <div className="bg-brand-dark p-10 rounded-[3rem] border-2 border-brand-violet relative flex flex-col shadow-2xl shadow-brand-violet/20">
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-brand-violet text-white px-6 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">Acesso Completo</div>
                  <div className="mb-8 text-center">
                     <h3 className="text-3xl font-bold mb-2 text-white">Plano Peregrino</h3>
                     <p className="text-slate-400 text-sm">Tudo o que você precisa para uma vida de oração constante.</p>
                  </div>
                  <div className="flex items-baseline justify-center gap-1 mb-8">
                     <span className="text-5xl font-black text-white">R$ 37,90</span>
                     <span className="text-slate-400 text-sm">/mês</span>
                  </div>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
                     <li className="flex items-center gap-3 text-sm font-medium text-white"><CheckCircle2 size={18} className="text-brand-violet" /> Jornada Diária com IA</li>
                     <li className="flex items-center gap-3 text-sm font-medium text-white"><CheckCircle2 size={18} className="text-brand-violet" /> Comunidade de Orações</li>
                     <li className="flex items-center gap-3 text-sm font-medium text-white"><CheckCircle2 size={18} className="text-brand-violet" /> Biblioteca da Fé Completa</li>
                     <li className="flex items-center gap-3 text-sm font-medium text-white"><CheckCircle2 size={18} className="text-brand-violet" /> Liturgia Diária</li>
                     <li className="flex items-center gap-3 text-sm font-medium text-white"><CheckCircle2 size={18} className="text-brand-violet" /> Desafios de Virtude</li>
                     <li className="flex items-center gap-3 text-sm font-medium text-white"><CheckCircle2 size={18} className="text-brand-violet" /> Suporte Exclusivo</li>
                  </ul>
                  <button onClick={onStart} className="w-full py-5 bg-brand-violet text-white rounded-2xl font-black text-lg shadow-lg shadow-brand-violet/30 hover:bg-purple-600 hover:scale-[1.02] active:scale-[0.98] transition-all">COMEÇAR MINHA JORNADA</button>
                  <div className="mt-6 flex flex-col items-center gap-2">
                    <p className="text-center text-[10px] text-slate-500 font-bold uppercase tracking-widest">Assinatura mensal recorrente</p>
                    <div className="flex items-center gap-2 text-brand-violet/80 text-[11px] font-bold">
                      <ShieldCheck size={14} />
                      <span>Cancele a qualquer momento, sem taxas</span>
                    </div>
                  </div>
               </div>
               <p className="text-center mt-8 text-slate-500 text-sm font-medium">
                 Assim como na Netflix, você tem acesso total enquanto sua assinatura estiver ativa e pode interromper o plano quando desejar, com apenas um clique.
               </p>
            </div>
         </div>
      </section>

      {/* --- FAQ --- */}
      <section className="py-32 bg-white dark:bg-brand-dark">
         <div className="max-w-3xl mx-auto px-6">
            <h2 className="text-4xl font-black text-center mb-16 tracking-tighter">Dúvidas Frequentes</h2>
            <div className="space-y-4">
               {[
                  { q: "O aplicativo é realmente católico?", a: "Sim. Todo o conteúdo é baseado na doutrina da Igreja Católica Apostólica Romana, com foco na vida de oração, virtudes e sacramentos." },
                  { q: "Como funciona a Jornada Diária?", a: "Você responde um questionário sobre sua rotina e nossa inteligência sugere os melhores horários e práticas para você rezar, adaptando-se ao seu dia a dia com humildade." },
                  { q: "Como funciona o cancelamento?", a: "O Espiritualizei utiliza um modelo de assinatura mensal. Você pode cancelar a renovação a qualquer momento diretamente nas configurações do seu perfil, sem burocracia." },
                  { q: "O app substitui a direção espiritual?", a: "De forma alguma. O Espiritualizei é uma ferramenta de auxílio para a constância diária. Recomendamos sempre que você busque um sacerdote para direção espiritual pessoal." }
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
