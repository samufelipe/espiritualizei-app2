
import React, { useState, useRef } from 'react';
import { Shield, ArrowRight, CheckCircle2, ChevronDown, ChevronUp, Crown, Sparkles, Play, Moon, Brain, Coffee, CloudRain, ChevronLeft, ChevronRight, Quote, Sun, Heart, Users, Flame, BookOpen, Plus, MapPin, Navigation, Star, Clock, MessageCircle, ExternalLink } from 'lucide-react';
import BrandLogo from './BrandLogo';

interface LandingPageProps {
  onStart: () => void;
  onLogin: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onStart, onLogin }) => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const carouselRef = useRef<HTMLDivElement>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const scroll = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const { current } = carouselRef;
      const scrollAmount = 300; // Width of a card approx
      if (direction === 'left') {
        current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      } else {
        current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }
    }
  };

  const ACERVO_ITEMS = [
     { title: 'Terço Mariano', subtitle: 'Meditações Diárias', img: 'https://images.unsplash.com/photo-1594583322913-442c6067b097?auto=format&fit=crop&w=600&q=80' },
     { title: 'Lectio Divina', subtitle: 'Oração com a Bíblia', img: 'https://images.unsplash.com/photo-1491841550275-ad7854e35ca6?auto=format&fit=crop&w=600&q=80' },
     { title: 'Vidas dos Santos', subtitle: 'Heróis da Fé', img: 'https://images.unsplash.com/photo-1568024846754-67296a770d31?auto=format&fit=crop&w=600&q=80' },
     { title: 'Teologia do Corpo', subtitle: 'Amor Humano', img: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=600&q=80' },
     { title: 'Combate Espiritual', subtitle: 'São Miguel', img: 'https://images.unsplash.com/photo-1598237696339-944b73b70b35?auto=format&fit=crop&w=600&q=80' },
     { title: 'Liturgia Diária', subtitle: 'Acompanhe a Missa', img: 'https://images.unsplash.com/photo-1544387092-727335915267?auto=format&fit=crop&w=600&q=80' }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-brand-dark font-sans text-brand-dark dark:text-white transition-colors selection:bg-brand-violet/30 overflow-x-hidden">
      
      {/* --- Navbar Float --- */}
      <nav className="fixed top-4 sm:top-6 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-5xl">
        <div className="bg-white/90 dark:bg-brand-dark/90 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-full px-4 sm:px-6 py-3 flex items-center justify-between shadow-float">
          <div className="flex items-center gap-2 group cursor-pointer" onClick={() => window.scrollTo(0,0)}>
            <BrandLogo size={24} variant="fill" className="text-brand-violet" />
            <span className="font-bold text-lg tracking-tight text-brand-dark dark:text-white block sm:block">Espiritualizei</span>
          </div>
          
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-400">
            <a href="#momentos" className="hover:text-brand-violet transition-colors">Jornada</a>
            <a href="#acervo" className="hover:text-brand-violet transition-colors">Biblioteca</a>
            <a href="#gps" className="hover:text-brand-violet transition-colors">Igrejas</a>
            <a href="#planos" className="hover:text-brand-violet transition-colors">Planos</a>
          </div>

          <button 
            onClick={onLogin}
            className="bg-brand-dark dark:bg-white text-white dark:text-brand-dark px-5 py-2 rounded-full text-sm font-bold hover:scale-105 active:scale-95 transition-all shadow-lg"
          >
            Entrar
          </button>
        </div>
      </nav>

      {/* --- Hero Section: Double Showcase --- */}
      <section className="pt-32 pb-20 px-4 sm:px-6 relative overflow-hidden min-h-[90vh] flex items-center">
        {/* Living Atmosphere Background */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[150vw] h-[120vh] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-200/30 via-transparent to-transparent dark:from-brand-violet/20 dark:via-brand-dark dark:to-brand-dark pointer-events-none" />
        
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12 lg:gap-16 relative z-10 w-full">
          
          {/* Left: Copywriting */}
          <div className="text-center lg:text-left animate-slide-in-right flex-1 lg:pr-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-violet/10 dark:bg-brand-violet/20 border border-brand-violet/20 rounded-full text-brand-violet text-xs font-bold uppercase tracking-widest mb-6">
              <Crown size={12} className="animate-pulse" fill="currentColor" /> App #1 para Católicos
            </div>
            
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6 leading-[1.1] text-brand-dark dark:text-white">
              Sua fé não precisa ser <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-violet to-purple-400">uma luta solitária.</span>
            </h1>
            
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 mb-8 max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium">
              Encontre direcionamento espiritual, uma rotina sólida e uma comunidade que te entende e reza por você, tudo em um só lugar.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start mb-12">
              <button 
                onClick={onStart}
                className="w-full sm:w-auto px-8 py-4 bg-brand-violet text-white rounded-2xl font-bold text-lg shadow-2xl shadow-brand-violet/30 hover:bg-purple-600 hover:scale-105 transition-all flex items-center justify-center gap-2"
              >
                Quero Fazer Parte <ArrowRight size={20} />
              </button>
              <div className="flex items-center gap-2 text-sm font-bold text-slate-500 dark:text-slate-400">
                 <Shield size={16} /> AMBIENTE SEGURO E CURADO
              </div>
            </div>
          </div>

          {/* Right: Dual Phone Mockup */}
          <div className="relative w-full max-w-[350px] lg:max-w-[500px] h-[500px] sm:h-[600px] lg:h-[700px] flex-shrink-0 animate-slide-up mx-auto lg:mx-0 mt-8 lg:mt-0">
             {/* Glow */}
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-brand-violet/20 rounded-full blur-[80px] pointer-events-none" />
             
             {/* PHONE 1: Routine (Background) */}
             <div className="absolute top-0 left-0 sm:left-4 w-[240px] sm:w-[280px] h-[480px] sm:h-[580px] bg-brand-dark rounded-[2.5rem] border-[6px] border-slate-800 shadow-2xl overflow-hidden ring-1 ring-white/10 transform -rotate-6 scale-90 opacity-80 blur-[0.5px] transition-all duration-500 z-10">
                {/* Status Bar Sim */}
                <div className="h-6 w-full flex justify-between px-4 items-center mt-1 opacity-50">
                   <div className="w-8 h-2 bg-white rounded-full"/>
                   <div className="flex gap-1"><div className="w-2 h-2 bg-white rounded-full"/><div className="w-2 h-2 bg-white rounded-full"/></div>
                </div>

                <div className="w-full h-full flex flex-col p-4 pt-6 relative">
                   {/* Header */}
                   <div className="mb-6">
                      <h3 className="text-white font-bold text-lg mb-1">Regra de Vida</h3>
                      <p className="text-slate-400 text-xs">5 de 7 completados</p>
                      <div className="w-full h-1.5 bg-white/10 rounded-full mt-3 overflow-hidden">
                         <div className="h-full w-[70%] bg-brand-violet" />
                      </div>
                   </div>

                   {/* Real List Items */}
                   <div className="space-y-3">
                      {[
                        { icon: Sun, title: 'Oferecimento', time: 'Manhã', done: true },
                        { icon: CheckCircle2, title: 'Angelus', time: '12:00', done: true },
                        { icon: Shield, title: 'Terço Diário', time: 'Tarde', done: false },
                        { icon: BookOpen, title: 'Leitura Espiritual', time: 'Noite', done: true },
                        { icon: Moon, title: 'Exame de Consciência', time: 'Dormir', done: false },
                      ].map((item, i) => (
                         <div key={i} className={`flex items-center gap-3 p-3 rounded-xl border ${item.done ? 'bg-brand-violet text-white border-brand-violet' : 'bg-white/5 border-white/10'}`}>
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${item.done ? 'bg-white/20 text-white' : 'bg-white/5 text-slate-400'}`}>
                               <item.icon size={14} strokeWidth={3} />
                            </div>
                            <div className="flex-1 min-w-0">
                               <p className={`text-xs font-bold ${item.done ? 'text-white' : 'text-slate-200'}`}>{item.title}</p>
                               <p className={`text-[10px] ${item.done ? 'text-white/70' : 'text-slate-500'}`}>{item.time}</p>
                            </div>
                            {item.done && <div className="w-4 h-4 bg-white rounded-full flex items-center justify-center"><div className="w-2 h-2 bg-brand-violet rounded-full" /></div>}
                         </div>
                      ))}
                   </div>
                   
                   <div className="absolute bottom-8 right-4 w-10 h-10 bg-brand-violet rounded-full shadow-lg shadow-brand-violet/30 flex items-center justify-center text-white">
                      <Plus size={20} />
                   </div>
                </div>
             </div>

             {/* PHONE 2: Community (Foreground) */}
             <div className="absolute top-12 sm:top-16 right-0 sm:right-4 w-[260px] sm:w-[300px] h-[500px] sm:h-[600px] bg-brand-dark rounded-[2.5rem] border-[6px] border-slate-800 shadow-[0_35px_60px_-15px_rgba(0,0,0,0.6)] overflow-hidden ring-1 ring-white/10 transform rotate-3 z-20 transition-all duration-500">
                {/* Notch */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-5 bg-slate-800 rounded-b-lg z-30" />

                <div className="w-full h-full bg-gradient-to-b from-[#1A2530] to-[#0F1623] flex flex-col relative">
                   
                   {/* App Header */}
                   <div className="pt-12 px-5 flex justify-between items-center mb-4">
                      <h3 className="font-bold text-white text-sm sm:text-base">Mural de Orações</h3>
                      <div className="w-7 h-7 bg-white/10 rounded-full flex items-center justify-center text-white"><Users size={12} /></div>
                   </div>

                   {/* Prayer Card (Hero Content) */}
                   <div className="mx-4 p-4 bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl relative overflow-hidden mb-3 shadow-lg">
                      <div className="flex items-center gap-3 mb-3">
                         <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-purple-400 to-blue-500 p-[2px]">
                            <div className="w-full h-full bg-slate-800 rounded-full flex items-center justify-center text-white text-xs font-bold">AC</div>
                         </div>
                         <div>
                            <p className="text-xs font-bold text-white">Ana Clara</p>
                            <span className="text-[9px] text-brand-violet bg-brand-violet/10 px-2 py-0.5 rounded uppercase font-bold">Vocação</span>
                         </div>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-200 leading-relaxed mb-3 font-medium">
                         "Peço orações pelo meu discernimento. Sinto que Deus me chama a algo mais."
                      </p>
                      <div className="flex items-center justify-between pt-3 border-t border-white/10">
                         <button className="flex items-center gap-1.5 bg-brand-violet text-white px-3 py-1.5 rounded-lg text-[10px] sm:text-xs font-bold shadow-lg shadow-brand-violet/20">
                            <Flame size={12} fill="currentColor" className="animate-pulse" /> Vela Acesa
                         </button>
                         <div className="flex items-center gap-1 text-[10px] sm:text-xs font-bold text-slate-400">
                            <span className="text-white">12</span> orando
                         </div>
                      </div>
                   </div>

                   {/* Feed List Simulation */}
                   <div className="px-4 space-y-3 opacity-60">
                      <div className="p-3 bg-white/5 border border-white/5 rounded-xl flex gap-3 items-center">
                         <div className="w-8 h-8 bg-slate-700 rounded-full shrink-0" />
                         <div className="space-y-2 flex-1">
                            <div className="h-2 w-3/4 bg-slate-700 rounded-full" />
                            <div className="h-2 w-1/2 bg-slate-700 rounded-full" />
                         </div>
                      </div>
                      <div className="p-3 bg-white/5 border border-white/5 rounded-xl flex gap-3 items-center">
                         <div className="w-8 h-8 bg-slate-700 rounded-full shrink-0" />
                         <div className="space-y-2 flex-1">
                            <div className="h-2 w-full bg-slate-700 rounded-full" />
                         </div>
                      </div>
                   </div>

                   {/* Tab Bar Sim */}
                   <div className="mt-auto bg-brand-dark/90 backdrop-blur-xl border-t border-white/5 p-3 flex justify-around text-slate-500 items-center">
                      <div className="w-5 h-5 bg-slate-700 rounded-md" />
                      <div className="w-5 h-5 bg-slate-700 rounded-md" />
                      <div className="flex flex-col items-center gap-0.5 text-brand-violet transform -translate-y-1">
                         <Heart size={20} fill="currentColor" />
                      </div>
                      <div className="w-5 h-5 bg-slate-700 rounded-md" />
                      <div className="w-5 h-5 bg-slate-700 rounded-md" />
                   </div>

                </div>
             </div>
          </div>
        </div>
      </section>

      {/* --- 1. SECTION: NEEDS & MOMENTS --- */}
      <section id="momentos" className="py-20 px-6 bg-slate-50 dark:bg-black/30">
         <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
               <h2 className="text-3xl font-bold text-brand-dark dark:text-white mb-4">Para cada momento, um refúgio.</h2>
               <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto text-lg">
                  O aplicativo se adapta ao que sua alma precisa agora. Seja paz, força ou descanso.
               </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
               {[
                  { icon: Moon, title: 'Dormir em Paz', desc: 'Encerre o dia com orações noturnas e sons de chuva.', color: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300' },
                  { icon: Brain, title: 'Acalmar a Mente', desc: 'Meditações guiadas para momentos de crise e ansiedade.', color: 'bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-300' },
                  { icon: Coffee, title: 'Começar Bem', desc: 'Oração do Oferecimento e leitura breve do Evangelho.', color: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-300' },
                  { icon: CloudRain, title: 'Dias Difíceis', desc: 'Consolo espiritual e comunidade quando tudo parece dar errado.', color: 'bg-slate-200 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300' },
               ].map((item, i) => (
                  <div key={i} className="bg-white dark:bg-white/5 p-6 rounded-3xl border border-slate-100 dark:border-white/5 hover:scale-[1.02] transition-transform shadow-sm">
                     <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${item.color}`}>
                        <item.icon size={24} />
                     </div>
                     <h3 className="font-bold text-lg text-brand-dark dark:text-white mb-2">{item.title}</h3>
                     <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{item.desc}</p>
                  </div>
               ))}
            </div>
         </div>
      </section>

      {/* --- 2. SECTION: CONTENT SHOWCASE --- */}
      <section id="acervo" className="py-24 px-0 overflow-hidden bg-white dark:bg-brand-dark relative">
         <div className="max-w-6xl mx-auto px-6 mb-12 flex justify-between items-end">
            <div>
               <span className="text-brand-violet font-bold text-xs uppercase tracking-widest">Biblioteca Espiritual</span>
               <h2 className="text-3xl md:text-4xl font-extrabold text-brand-dark dark:text-white mt-2">
                  Conheça mais sobre sua fé.<br />Um dia de cada vez.
               </h2>
               <p className="text-slate-500 mt-3 max-w-lg">Textos e áudios preparados para quem está começando ou quer se aprofundar, sem linguagem complicada.</p>
            </div>
            <div className="hidden md:block">
               <button onClick={onStart} className="text-brand-violet font-bold flex items-center gap-1 hover:gap-2 transition-all">
                  Explorar Biblioteca <ArrowRight size={18} />
               </button>
            </div>
         </div>

         <div className="absolute top-[60%] z-20 w-full flex justify-between px-2 sm:px-8 pointer-events-none">
            <button 
              onClick={() => scroll('left')} 
              className="w-10 h-10 rounded-full bg-white/80 dark:bg-black/50 backdrop-blur-md shadow-lg flex items-center justify-center hover:scale-110 transition-all pointer-events-auto text-brand-dark dark:text-white"
            >
               <ChevronLeft size={24} />
            </button>
            <button 
              onClick={() => scroll('right')} 
              className="w-10 h-10 rounded-full bg-white/80 dark:bg-black/50 backdrop-blur-md shadow-lg flex items-center justify-center hover:scale-110 transition-all pointer-events-auto text-brand-dark dark:text-white"
            >
               <ChevronRight size={24} />
            </button>
         </div>

         <div ref={carouselRef} className="flex gap-6 overflow-x-auto pb-12 px-6 md:px-[max(24px,calc(50vw-36rem))] no-scrollbar snap-x scroll-smooth">
            {ACERVO_ITEMS.map((card, i) => (
               <div key={i} className="snap-start min-w-[240px] md:min-w-[280px] aspect-[3/4] relative rounded-[2rem] overflow-hidden group cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 bg-brand-dark">
                  <div className="absolute inset-0">
                     <img 
                        src={card.img} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                        alt={card.title} 
                        onError={(e) => {
                           (e.target as HTMLImageElement).style.display = 'none';
                           (e.target as HTMLImageElement).parentElement!.style.backgroundColor = '#1A2530'; 
                        }}
                     />
                     <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                  </div>
                  <div className="absolute bottom-0 left-0 p-6 w-full">
                     <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white mb-4 opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-4 group-hover:translate-y-0 duration-300">
                        <Play size={20} fill="currentColor" />
                     </div>
                     <p className="text-slate-300 text-xs uppercase tracking-wider font-bold mb-1">{card.subtitle}</p>
                     <h3 className="text-white text-xl font-bold leading-tight">{card.title}</h3>
                  </div>
               </div>
            ))}
         </div>
      </section>

      {/* --- NEW: LOCALIZADOR DE IGREJAS (iPhone List Mockup) --- */}
      <section id="gps" className="py-24 px-6 bg-gradient-to-b from-slate-50 to-white dark:from-brand-dark dark:to-black/40 relative overflow-hidden">
         <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-16 relative z-10">
            
            {/* Mockup iPhone Left */}
            <div className="flex-1 relative w-full max-w-[320px] mx-auto animate-slide-up">
               <div className="absolute inset-0 bg-brand-violet/20 blur-[100px] rounded-full" />
               
               {/* Phone Frame */}
               <div className="relative w-[300px] h-[600px] bg-[#1A2530] rounded-[3rem] border-[8px] border-slate-800 shadow-2xl overflow-hidden ring-1 ring-white/10 mx-auto">
                  {/* Notch */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-6 bg-slate-800 rounded-b-xl z-30" />
                  
                  <div className="w-full h-full bg-slate-900 flex flex-col relative overflow-hidden">
                     {/* Header Sim */}
                     <div className="pt-12 pb-4 px-5 bg-slate-900/90 backdrop-blur-md z-20 border-b border-white/5 sticky top-0">
                        <h3 className="text-white font-bold text-lg">Localizar Paróquia</h3>
                        <p className="text-slate-400 text-xs">Exibindo locais próximos</p>
                     </div>

                     {/* List Content */}
                     <div className="p-4 space-y-4 overflow-hidden relative">
                        <div className="absolute inset-0 bg-gradient-to-b from-slate-900 to-transparent pointer-events-none h-4 z-10"/>
                        
                        {/* Card 1 */}
                        <div className="bg-white/5 rounded-[1.5rem] overflow-hidden border border-white/10 shadow-lg">
                           <div className="h-20 bg-slate-800 relative overflow-hidden">
                              <div className="absolute inset-0 opacity-30 bg-[url('https://www.transparenttextures.com/patterns/city-fields.png')] mix-blend-overlay" />
                              <div className="absolute top-3 left-3 flex gap-2">
                                 <div className="bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-full flex items-center gap-1 text-[9px] font-bold text-white border border-white/10">
                                    <Star size={8} className="text-amber-400 fill-amber-400" /> 4.9
                                 </div>
                                 <div className="bg-green-900/60 px-2 py-0.5 rounded-full text-[9px] font-bold text-green-400 border border-green-800">Aberto</div>
                              </div>
                              <div className="absolute top-3 right-3 bg-brand-violet text-white text-[9px] font-bold px-2 py-1 rounded-lg shadow-sm">
                                 0.8 km
                              </div>
                           </div>
                           <div className="p-4 pt-3">
                              <h4 className="text-white font-bold text-sm mb-2 leading-tight">Paróquia N. Sra. Aparecida</h4>
                              <div className="bg-brand-violet/10 rounded-lg p-2 mb-3 flex gap-2 items-start">
                                 <MapPin size={12} className="text-brand-violet mt-0.5 shrink-0" />
                                 <p className="text-[10px] text-slate-300 leading-tight">Esta casa de Deus está aguardando sua visita. ♥</p>
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                 <div className="bg-white/5 py-2 rounded-lg flex justify-center items-center gap-1 text-[10px] font-bold text-slate-300 border border-white/5">
                                    <MessageCircle size={12} /> Convidar
                                 </div>
                                 <div className="bg-white/5 py-2 rounded-lg flex justify-center items-center gap-1 text-[10px] font-bold text-slate-300 border border-white/5">
                                    <ExternalLink size={12} /> Google
                                 </div>
                              </div>
                              <div className="mt-2 w-full bg-brand-violet text-white py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-brand-violet/20">
                                 <Navigation size={12} /> Traçar Rota
                              </div>
                           </div>
                        </div>

                        {/* Card 2 (Partial) */}
                        <div className="bg-white/5 rounded-[1.5rem] overflow-hidden border border-white/10 shadow-lg opacity-60">
                           <div className="h-20 bg-slate-800 relative overflow-hidden">
                              <div className="absolute top-3 left-3 flex gap-2">
                                 <div className="bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-full flex items-center gap-1 text-[9px] font-bold text-white border border-white/10">
                                    <Star size={8} className="text-amber-400 fill-amber-400" /> 4.8
                                 </div>
                              </div>
                              <div className="absolute top-3 right-3 bg-brand-violet text-white text-[9px] font-bold px-2 py-1 rounded-lg shadow-sm">
                                 1.2 km
                              </div>
                           </div>
                           <div className="p-4 pt-3">
                              <h4 className="text-white font-bold text-sm mb-2">Santuário São Judas Tadeu</h4>
                              <div className="w-full h-8 bg-brand-violet/20 rounded-lg mb-3"/>
                              <div className="w-full h-8 bg-brand-violet rounded-xl"/>
                           </div>
                        </div>

                     </div>
                  </div>
               </div>
            </div>

            {/* Content Right */}
            <div className="flex-1 text-center md:text-left">
               <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-full text-xs font-bold uppercase tracking-widest mb-6">
                  <Navigation size={12} /> LOCALIZADOR DE IGREJAS
               </div>
               <h2 className="text-3xl md:text-5xl font-extrabold text-brand-dark dark:text-white mb-6 leading-tight">
                  Nunca mais perca<br/>uma Santa Missa.
               </h2>
               <p className="text-lg text-slate-600 dark:text-slate-300 mb-8 leading-relaxed font-medium">
                  Viajou? Mudou de bairro? O Espiritualizei localiza todas as igrejas, capelas e santuários católicos ao seu redor em segundos.
               </p>
               <ul className="space-y-4 mb-8">
                  <li className="flex items-center gap-3 text-brand-dark dark:text-slate-200 font-medium">
                     <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 flex items-center justify-center"><CheckCircle2 size={14} /></div>
                     Encontre horários e avaliações reais
                  </li>
                  <li className="flex items-center gap-3 text-brand-dark dark:text-slate-200 font-medium">
                     <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 flex items-center justify-center"><CheckCircle2 size={14} /></div>
                     Navegação integrada (Google Maps/Waze)
                  </li>
                  <li className="flex items-center gap-3 text-brand-dark dark:text-slate-200 font-medium">
                     <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 flex items-center justify-center"><CheckCircle2 size={14} /></div>
                     Descubra santuários históricos
                  </li>
               </ul>
            </div>
         </div>
      </section>

      {/* --- 3. SECTION: THE MANIFESTO --- */}
      <section className="py-32 px-6 relative bg-black overflow-hidden flex items-center justify-center text-center">
         <div className="absolute inset-0 opacity-40">
            <img src="https://images.unsplash.com/photo-1515558679601-fc3d43c3856f?auto=format&fit=crop&q=80&w=2000" className="w-full h-full object-cover" alt="Altar" />
            <div className="absolute inset-0 bg-black/60" />
         </div>
         
         <div className="relative z-10 max-w-3xl space-y-8">
            <Sparkles size={40} className="text-brand-violet mx-auto animate-pulse-slow" />
            <h2 className="text-3xl md:text-5xl font-serif italic text-white leading-tight">
               "O mundo grita. <br/><span className="text-brand-violet not-italic font-sans font-extrabold">Sua alma precisa de silêncio.</span>"
            </h2>
            <p className="text-slate-300 text-lg md:text-xl leading-relaxed font-medium">
               Criamos o Espiritualizei porque acreditamos que a tecnologia não deve apenas nos distrair, mas nos elevar. 
               Este é o seu santuário digital. Um lugar onde o algoritmo trabalha para a sua santidade, não para a sua atenção.
            </p>
            <button 
               onClick={onStart}
               className="bg-white text-black px-8 py-4 rounded-full font-bold text-sm uppercase tracking-widest hover:bg-slate-200 transition-colors"
            >
               Entre no Silêncio
            </button>
         </div>
      </section>

      {/* --- 4. SECTION: SOCIAL PROOF --- */}
      <section className="py-24 px-6 bg-[#FDFBF7] dark:bg-brand-dark border-t border-slate-200 dark:border-white/5">
         <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
               <h2 className="text-3xl md:text-4xl font-bold text-brand-dark dark:text-white mb-4">O que dizem os irmãos?</h2>
               <p className="text-slate-500 dark:text-slate-400">Histórias reais de quem encontrou constância.</p>
            </div>

            <div className="columns-1 md:columns-3 gap-6 space-y-6">
               {[
                  { text: "Eu nunca conseguia rezar o terço inteiro. Com o áudio guiado e a comunidade, já estou no 40º dia seguido!", name: "Mariana S.", role: "Mãe de 2" },
                  { text: "A funcionalidade de direcionamento espiritual me salvou numa crise de ansiedade as 3 da manhã. Foi como um abraço de Deus.", name: "Pedro H.", role: "Estudante" },
                  { text: "Finalmente um app que entende que minha vida é corrida. A rotina adaptável é genial.", name: "Carlos Eduardo", role: "Advogado" },
                  { text: "Sinto que faço parte de algo maior. Rezar pelas intenções dos outros mudou meu coração.", name: "Irmã Lúcia", role: "Vocacionada" },
                  { text: "O design é lindo, traz uma paz só de olhar. Vale cada centavo do investimento.", name: "Fernanda L.", role: "Designer" },
                  { text: "Deixei de usar o Instagram pela manhã e comecei a usar o Espiritualizei. Meu dia mudou.", name: "Ricardo M.", role: "Empresário" },
               ].map((testimonial, i) => (
                  <div key={i} className="break-inside-avoid bg-white dark:bg-white/5 p-6 rounded-3xl border border-slate-100 dark:border-white/5 shadow-sm hover:shadow-lg transition-shadow">
                     <Quote size={24} className="text-brand-violet/20 mb-4" fill="currentColor" />
                     <p className="text-slate-700 dark:text-slate-300 text-base leading-relaxed mb-6 font-medium">"{testimonial.text}"</p>
                     <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-brand-violet/10 rounded-full flex items-center justify-center text-brand-violet font-bold text-sm">
                           {testimonial.name.charAt(0)}
                        </div>
                        <div>
                           <p className="text-sm font-bold text-brand-dark dark:text-white">{testimonial.name}</p>
                           <p className="text-xs text-slate-400">{testimonial.role}</p>
                        </div>
                     </div>
                  </div>
               ))}
            </div>
         </div>
      </section>

      {/* --- PLANS SECTION --- */}
      <section id="planos" className="py-20 sm:py-24 px-6 bg-white dark:bg-black/20">
         <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
               <h2 className="text-3xl md:text-4xl font-bold text-brand-dark dark:text-white mb-4">Quanto vale a sua paz?</h2>
               <p className="text-slate-500 dark:text-slate-400 text-lg max-w-2xl mx-auto">
                  Invista na sua salvação com ferramentas profissionais.
               </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
               {/* Monthly Plan */}
               <div className="bg-slate-50 dark:bg-white/5 p-8 rounded-[2.5rem] border border-slate-200 dark:border-white/10 flex flex-col hover:shadow-xl transition-shadow">
                  <div className="mb-6">
                     <span className="bg-white dark:bg-white/10 text-slate-500 dark:text-slate-300 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide shadow-sm">Acesso Mensal</span>
                  </div>
                  <div className="mb-6">
                     <span className="text-4xl font-extrabold text-brand-dark dark:text-white">R$ 37,90</span>
                     <span className="text-slate-400 font-medium">/mês</span>
                  </div>
                  <p className="text-slate-500 dark:text-slate-400 text-sm mb-8">
                     Para quem quer experimentar a mudança imediata na rotina de oração.
                  </p>
                  <ul className="space-y-4 mb-8 flex-1">
                     {[
                        'Direcionamento Espiritual (24h)', 
                        'Regra de Vida adaptável', 
                        'Comunidade Exclusiva', 
                        'Diário da Alma', 
                        'Biblioteca de Formação'
                     ].map(i => (
                        <li key={i} className="flex items-center gap-3 text-sm font-medium text-slate-700 dark:text-slate-300">
                           <CheckCircle2 size={18} className="text-brand-violet" /> {i}
                        </li>
                     ))}
                  </ul>
                  <button 
                     onClick={onStart}
                     className="w-full py-4 rounded-2xl border-2 border-brand-dark dark:border-white text-brand-dark dark:text-white font-bold hover:bg-brand-dark hover:text-white dark:hover:bg-white dark:hover:text-brand-dark transition-all"
                  >
                     Começar Agora
                  </button>
               </div>

               {/* Semestral Plan */}
               <div className="bg-brand-dark dark:bg-white p-8 rounded-[2.5rem] border border-brand-dark dark:border-white flex flex-col relative transform md:-translate-y-4 shadow-2xl">
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-brand-violet text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wide shadow-lg flex items-center gap-1">
                     <Crown size={12} fill="currentColor" /> ESCOLHA DA COMUNIDADE
                  </div>
                  <div className="mb-6 mt-2">
                     <span className="bg-brand-violet/20 text-brand-violet dark:text-brand-dark px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">Plano Semestral</span>
                  </div>
                  <div className="mb-6 text-white dark:text-brand-dark">
                     <span className="text-5xl font-extrabold">R$ 189,90</span>
                     <div className="text-white/60 dark:text-brand-dark/60 text-sm font-medium mt-1">
                        Apenas <span className="font-bold text-white dark:text-brand-dark">R$ 31,65/mês</span>
                     </div>
                  </div>
                  <p className="text-white/70 dark:text-brand-dark/70 text-sm mb-8">
                     Para quem entendeu que santidade exige constância e tempo.
                  </p>
                  <ul className="space-y-4 mb-8 flex-1">
                     {[
                        'Todos os benefícios Premium', 
                        'Prioridade nas intenções', 
                        'Economia real de 16%', 
                        'Selos exclusivos no perfil'
                     ].map(i => (
                        <li key={i} className="flex items-center gap-3 text-sm font-medium text-white dark:text-brand-dark">
                           <div className="bg-brand-violet rounded-full p-0.5"><CheckCircle2 size={14} className="text-white" strokeWidth={3} /></div> {i}
                        </li>
                     ))}
                  </ul>
                  <button 
                     onClick={onStart}
                     className="w-full py-4 rounded-2xl bg-brand-violet text-white font-bold shadow-lg hover:bg-purple-600 hover:scale-105 transition-all active:scale-95 flex items-center justify-center gap-2"
                  >
                     Firmar Compromisso <ArrowRight size={20} />
                  </button>
               </div>
            </div>
         </div>
      </section>

      {/* --- FAQ --- */}
      <section id="faq" className="py-24 px-6">
         <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
               <h2 className="text-3xl font-bold text-brand-dark dark:text-white mb-4">Perguntas Frequentes</h2>
            </div>
            <div className="space-y-3">
               {[
                  { q: "O conteúdo é fiel à doutrina da Igreja Católica?", a: "Sim. Todo o conteúdo, meditações e respostas do Direcionamento Espiritual são baseados na Bíblia, no Catecismo da Igreja Católica (CIC) e nos escritos dos Santos. Não inventamos nada, apenas organizamos a Tradição para você." },
                  { q: "Não tenho muito tempo. O app vai funcionar para mim?", a: "O Espiritualizei foi criado exatamente para você. Nossa tecnologia adapta a Regra de Vida à sua realidade (seja você estudante, mãe ou empresário), sugerindo orações curtas e eficazes para seus momentos de pausa e trânsito." },
                  { q: "O direcionamento espiritual substitui um Padre?", a: "Jamais. O app é uma ferramenta de apoio diário e formação. Para a Confissão e a Eucaristia, o sacerdote é insubstituível. Nós te ajudamos a chegar na Missa mais preparado e constante." },
                  { q: "Meus desabafos no Diário e Chat são privados?", a: "Absolutamente. Seus dados são criptografados e ninguém tem acesso ao que você escreve. Diferente de redes sociais gratuitas que vendem sua atenção, aqui você paga para ter um santuário seguro e privado." },
                  { q: "Por que o aplicativo é pago?", a: "Para manter a comunidade livre de anúncios, distrações e algoritmos viciantes. Seu investimento sustenta a equipe que cura o conteúdo e garante que o app continue evoluindo sem vender seus dados." }
               ].map((item, i) => (
                  <div key={i} className="border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden bg-white dark:bg-brand-dark">
                     <button 
                        onClick={() => toggleFaq(i)}
                        className="w-full flex items-center justify-center p-6 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors text-left"
                     >
                        <span className="font-bold text-brand-dark dark:text-white text-sm md:text-base flex-1">{item.q}</span>
                        {openFaq === i ? <ChevronUp size={20} className="text-brand-violet shrink-0" /> : <ChevronDown size={20} className="text-slate-400 shrink-0" />}
                     </button>
                     {openFaq === i && (
                        <div className="p-6 pt-0 text-slate-600 dark:text-slate-400 text-sm leading-relaxed animate-fade-in">
                           {item.a}
                        </div>
                     )}
                  </div>
               ))}
            </div>
         </div>
      </section>

      {/* --- Footer --- */}
      <footer className="bg-slate-50 dark:bg-black/40 py-16 border-t border-slate-200 dark:border-white/5">
         <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-2">
               <BrandLogo size={24} className="text-slate-400" />
               <span className="font-bold text-slate-500">Espiritualizei © 2025</span>
            </div>
            <div className="flex gap-6 text-sm text-slate-500">
               <a href="#" className="hover:text-brand-violet">Termos de Uso</a>
               <a href="#" className="hover:text-brand-violet">Privacidade</a>
               <a href="#" className="hover:text-brand-violet">Contato</a>
            </div>
         </div>
      </footer>
    </div>
  );
};

export default LandingPage;
