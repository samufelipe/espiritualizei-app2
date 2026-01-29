import React, { useState, useMemo, useRef } from 'react';
// Added Moon to imports to fix the error: Cannot find name 'Moon'.
import { BookOpen, PlayCircle, CheckCircle2, ChevronLeft, ChevronRight, Clock, GraduationCap, Search, Bookmark, Share2, Youtube, Music, ExternalLink, X, Heart, Sun, CloudRain, Shield, Anchor, Users, Flame, Cross, Eye, Mic2, Headphones, Wifi, Globe, PenTool, Activity, Footprints, Zap, Sparkles, Church, MessageSquare, MapPin, Moon } from 'lucide-react';
import BrandLogo from './BrandLogo';

// --- TIPOS ---
interface KnowledgeItem {
  id: string;
  title: string;
  description: string;
  content: string; 
  category: 'doctrine' | 'prayer' | 'mass';
  duration: string;
  icon: React.ElementType; 
  videoSuggestion: { title: string; url: string; channelName: string; };
  musicSuggestion: { title: string; url: string; artist: string; };
}

interface KnowledgeTrack {
  id: string;
  title: string;
  description: string;
  items: KnowledgeItem[];
}

// --- ACERVO COMPLETO RESTAURADO ---
const STATIC_DATA: KnowledgeTrack[] = [
  {
    id: 'track-quaresma-2026',
    title: 'Jornada Quaresmal 2026',
    description: 'Prepare seu coração para o deserto que floresce.',
    items: [
      {
        id: 'quaresma-inicio',
        title: 'Cinzas: O Novo Início',
        description: 'Por que 18 de fevereiro marca o dia da sua volta para Deus.',
        category: 'doctrine',
        duration: '10 min',
        icon: Footprints,
        videoSuggestion: { title: "O Sentido da Quaresma", url: "https://www.youtube.com/results?search_query=significado+quarta+feira+de+cinzas", channelName: "Minuto com Deus" },
        musicSuggestion: { title: "Pecador, agora é tempo", url: "https://www.youtube.com/results?search_query=pecador+agora+e+tempo+musica", artist: "Tradicional" },
        content: `A Quaresma de 2026 começa no dia 18 de fevereiro. É o tempo de retirar o excesso. Assim como um escultor retira o excesso da pedra para revelar a estátua, a Quaresma retira nossos vícios para revelar a imagem de Cristo em nós.\n\nNesta preparação, o silêncio é seu maior aliado. O deserto não é um lugar de solidão vazia, mas de encontro. Jesus foi ao deserto para ser tentado e vencer. Nós entramos na Quaresma para permitir que Ele vença em nós aquelas batalhas que, sozinhos, sempre perdemos.\n\nComece agora a pensar: qual será sua "arma" este ano? Não escolha sacrifícios impossíveis. Escolha aqueles que realmente doem no seu orgulho.`
      },
      {
        id: 'jejum-telas',
        title: 'Jejum de Telas e Dopamina',
        description: 'Como silenciar o ruído digital para ouvir a voz de Deus.',
        category: 'prayer',
        duration: '15 min',
        icon: Wifi,
        videoSuggestion: { title: "Jejum de Dopamina Católico", url: "https://www.youtube.com/results?search_query=jejum+de+telas+quaresma", channelName: "Italo Marsili" },
        musicSuggestion: { title: "Silêncio Sagrado", url: "https://www.youtube.com/results?search_query=musica+instrumental+catolica+silencio", artist: "Com. Shalom" },
        content: `O mundo moderno sofre de uma "obesidade mental". Consumimos informações, vídeos e notificações sem parar, deixando a alma letárgica. Na Quaresma, o jejum de telas é uma das penitências mais eficazes para recuperar a liberdade interior.\n\nNão se trata de odiar a tecnologia, mas de não ser escravo dela. Experimente desligar as notificações não essenciais. Determine horários fixos para checar redes sociais. O espaço que sobrar no seu cérebro será preenchido pela presença de Deus.`
      }
    ]
  },
  {
    id: 'track-missa',
    title: 'A Santa Missa',
    description: 'Entenda o mistério do Calvário em cada altar.',
    items: [
      {
        id: 'missa-sentido',
        title: 'Por que ir à Missa?',
        description: 'Não é um compromisso social, é o Céu na Terra.',
        category: 'mass',
        duration: '12 min',
        icon: Church,
        videoSuggestion: { title: "O que acontece na Missa?", url: "https://www.youtube.com/results?search_query=padre+paulo+ricardo+santa+missa", channelName: "Pe. Paulo Ricardo" },
        musicSuggestion: { title: "Anjos de Resgate", url: "https://www.youtube.com/results?search_query=anjos+de+resgate+eucaristica", artist: "Anjos de Resgate" },
        content: `A Missa é o maior evento da história humana. Nela, o tempo para e a eternidade invade o presente. Não estamos apenas "lembrando" de algo que Jesus fez; estamos presentes no sacrifício d'Ele de forma real e mística.\n\nQuando o padre eleva a Hóstia, ali está o mesmo Jesus que caminhou na Galileia e que morreu por você na Cruz. Ir à Missa é como ir ao Calvário sem a dor da morte, mas com toda a força da Graça.`
      },
      {
        id: 'liturgia-palavra',
        title: 'Banquete da Palavra',
        description: 'Como ouvir a Deus nas leituras dominicais.',
        category: 'mass',
        duration: '10 min',
        icon: BookOpen,
        videoSuggestion: { title: "Como entender a Bíblia na Missa", url: "https://www.youtube.com/results?search_query=liturgia+da+palavra+explicacao", channelName: "Canção Nova" },
        musicSuggestion: { title: "Tua Palavra é Luz", url: "https://www.youtube.com/results?search_query=musica+catolica+tua+palavra", artist: "Vários" },
        content: `Na primeira parte da Missa, Deus fala diretamente ao seu coração. As leituras não são "textos bonitos", são cartas vivas. Se você chega atrasado e perde as leituras, você perde o diálogo com o Anfitrião da festa.\n\nAprenda a escutar com o coração. Às vezes, uma única frase do Evangelho é o remédio que você precisava para a sua semana.`
      }
    ]
  },
  {
    id: 'track-santos',
    title: 'Vidas que Inspiram (Santos)',
    description: 'Nossos irmãos mais velhos que já chegaram lá.',
    items: [
      {
        id: 'carlo-acutis',
        title: 'Carlo Acutis: Internet e Fé',
        description: 'O jovem que santificou a era digital.',
        category: 'doctrine',
        duration: '10 min',
        icon: Wifi,
        videoSuggestion: { title: "Vida de Carlo Acutis", url: "https://www.youtube.com/results?search_query=carlo+acutis+biografia", channelName: "Shalom" },
        musicSuggestion: { title: "Original, não Cópia", url: "https://www.youtube.com/results?search_query=musica+carlo+acutis", artist: "Juventude" },
        content: `Carlo Acutis nos prova que a santidade não exige uma vida medieval. Ele jogava videogame, amava cães e computação. Mas ele tinha um segredo: a Eucaristia como sua "autoestrada para o Céu".\n\nEle usou seu talento para criar um site sobre milagres eucarísticos, evangelizando em um ambiente onde muitos se perdem. Ele nos ensina: "Todos nascem originais, mas muitos morrem como fotocópias".`
      },
      {
        id: 'santa-teresinha',
        title: 'Teresinha: A Pequena Via',
        description: 'A santidade nas pequenas coisas do dia a dia.',
        category: 'prayer',
        duration: '14 min',
        icon: Heart,
        videoSuggestion: { title: "A Pequena Via de Teresinha", url: "https://www.youtube.com/results?search_query=santa+teresinha+pequena+via", channelName: "Padre Leo" },
        musicSuggestion: { title: "Nada mais que hoje", url: "https://www.youtube.com/results?search_query=nada+mais+que+hoje+musica", artist: "Vários" },
        content: `Santa Teresinha do Menino Jesus descobriu que não precisava fazer grandes sacrifícios ou obras heróicas para ser santa. Ela inventou a "Pequena Via": fazer as coisas comuns com um amor incomum.\n\nSuportar uma humilhação em silêncio, dar um sorriso a quem nos irrita, recolher um alfinete por amor a Deus... Tudo isso tem valor de eternidade se feito com amor.`
      },
      {
        id: 'sao-jose',
        title: 'São José: O Guardião',
        description: 'O mestre da vida interior e do trabalho.',
        category: 'doctrine',
        duration: '11 min',
        icon: Anchor,
        videoSuggestion: { title: "As virtudes de São José", url: "https://www.youtube.com/results?search_query=sao+jose+o+guardiao+padre+paulo+ricardo", channelName: "Pe. Paulo Ricardo" },
        musicSuggestion: { title: "José", url: "https://www.youtube.com/results?search_query=musica+sao+jose+catolica", artist: "Músicas Religiosas" },
        content: `Na Bíblia, São José não diz uma única palavra. Sua linguagem é a ação e o silêncio. Ele é o modelo de pai, de trabalhador e de homem de oração. Ele nos ensina que a força de um homem vem da sua obediência a Deus e da proteção da sua família.`
      }
    ]
  },
  {
    id: 'track-escola-oracao',
    title: 'Escola de Oração',
    description: 'Métodos para elevar o coração a Deus.',
    items: [
      {
        id: 'lectio-divina',
        title: 'Lectio Divina: Rezar a Bíblia',
        description: 'Os 4 passos para ouvir a voz de Deus na Palavra.',
        category: 'prayer',
        duration: '15 min',
        icon: BookOpen,
        videoSuggestion: { title: "Como fazer Lectio Divina?", url: "https://www.youtube.com/results?search_query=como+fazer+lectio+divina+passo+a+passo", channelName: "Canção Nova" },
        musicSuggestion: { title: "Pela tua palavra", url: "https://www.youtube.com/results?search_query=musica+pela+tua+palavra", artist: "Walmir Alencar" },
        content: `Rezar com a Bíblia não é apenas ler. É dialogar. O método da Lectio Divina consiste em:\n1. Leitura (O que o texto diz?)\n2. Meditação (O que o texto me diz?)\n3. Oração (O que eu digo a Deus?)\n4. Contemplação (Deixo Deus agir em mim).\n\nPratique 15 minutos por dia e sua vida mudará.`
      },
      {
        id: 'exame-consciencia',
        title: 'Exame de Consciência',
        description: 'Revisar o dia com os olhos da misericórdia.',
        category: 'prayer',
        duration: '8 min',
        icon: Moon,
        videoSuggestion: { title: "Como fazer exame de consciência", url: "https://www.youtube.com/results?search_query=exame+de+consciencia+noite", channelName: "Minuto com Deus" },
        musicSuggestion: { title: "Confio em Ti", url: "https://www.youtube.com/results?search_query=musica+confio+em+ti", artist: "Vários" },
        content: `O exame de consciência noturno não é um exercício de culpa, mas de amizade. É sentar com Deus no final do dia e perguntar: "Senhor, onde nos encontramos hoje? Onde eu te ignorei? Ajuda-me a ser melhor amanhã".\n\nIsso nos ajuda a dormir em paz e a crescer em autoconhecimento espiritual.`
      },
      {
        id: 'rosario-poder',
        title: 'O Rosário: Arma de Luz',
        description: 'A oração que vence batalhas espirituais.',
        category: 'prayer',
        duration: '15 min',
        icon: Cross,
        videoSuggestion: { title: "O poder do Santo Rosário", url: "https://www.youtube.com/results?search_query=freigilson+rosario", channelName: "Frei Gilson" },
        musicSuggestion: { title: "Terço Cantado", url: "https://www.youtube.com/results?search_query=terco+cantado+paz", artist: "Tradicional" },
        content: `O Rosário é a oração dos humildes. Ao repetir as Ave-Marias, criamos um ritmo que acalma a ansiedade e nos permite meditar nos mistérios da vida de Cristo. Maria nos pega pela mão e nos leva a Jesus.`
      }
    ]
  },
  {
    id: 'track-doutrina',
    title: 'Doutrina e Vida',
    description: 'As verdades que sustentam nossa caminhada.',
    items: [
      {
        id: 'confissao-manual',
        title: 'Confissão: O Sacramento da Alegria',
        description: 'Como fazer uma boa confissão sem medo.',
        category: 'doctrine',
        duration: '12 min',
        icon: Shield,
        videoSuggestion: { title: "Confissão passo a passo", url: "https://www.youtube.com/results?search_query=como+se+confessar+bem", channelName: "Pe. Paulo Ricardo" },
        musicSuggestion: { title: "Misericórdia Infinita", url: "https://www.youtube.com/results?search_query=misericordia+infinita+musica", artist: "Walmir Alencar" },
        content: `O confessionário é o único lugar onde um réu confesso sai perdoado e livre. Deus não quer te punir, Ele quer te curar. O pecado é uma ferida; o sacramento é o remédio.\n\nPara uma boa confissão: Exame de consciência, arrependimento, propósito de não pecar mais, confissão oral e cumprimento da penitência.`
      },
      {
        id: 'eucaristia-presenca',
        title: 'Eucaristia: Presença Real',
        description: 'Corpo, Sangue, Alma e Divindade.',
        category: 'doctrine',
        duration: '15 min',
        icon: Sun,
        videoSuggestion: { title: "Milagres Eucarísticos", url: "https://www.youtube.com/results?search_query=milagres+eucaristicos+explicacao", channelName: "Canção Nova" },
        musicSuggestion: { title: "Tão Sublime Sacramento", url: "https://www.youtube.com/results?search_query=tao+sublime+sacramento", artist: "Tradicional" },
        content: `A Eucaristia não é um símbolo. É o próprio Jesus escondido sob as aparências do Pão e do Vinho. É a maior prova de humildade de Deus: Ele se faz comida para estar dentro de nós.`
      }
    ]
  }
];

// --- COMPONENTES INTERNOS ---

const KnowledgeTrackRow: React.FC<{ track: KnowledgeTrack, onSelect: (item: KnowledgeItem) => void }> = ({ track, onSelect }) => {
  const rowRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (rowRef.current) {
      const scrollAmount = 300;
      rowRef.current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="animate-slide-up relative group/row mb-12 last:mb-0">
      <div className="flex items-end justify-between mb-4 px-2">
          <div className="flex-1 pr-2">
            <h3 className="text-xl font-bold text-brand-dark dark:text-white flex items-center gap-2">{track.title}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-1 leading-tight">{track.description}</p>
          </div>
          <div className="flex gap-2 shrink-0">
             <button 
               onClick={() => scroll('left')} 
               className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white dark:bg-white/10 border border-slate-100 dark:border-white/5 flex items-center justify-center text-slate-400 hover:text-brand-violet hover:border-brand-violet transition-all active:scale-90 shadow-sm"
               aria-label="Rolar para esquerda"
             >
                <ChevronLeft size={18} />
             </button>
             <button 
               onClick={() => scroll('right')} 
               className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white dark:bg-white/10 border border-slate-100 dark:border-white/5 flex items-center justify-center text-slate-400 hover:text-brand-violet hover:border-brand-violet transition-all active:scale-90 shadow-sm"
               aria-label="Rolar para direita"
             >
                <ChevronRight size={18} />
             </button>
          </div>
      </div>
      
      <div ref={rowRef} className="flex gap-4 overflow-x-auto pb-8 -mx-6 px-6 no-scrollbar snap-x scroll-smooth">
          {track.items.map((item) => (
            <div 
              key={item.id} 
              onClick={() => onSelect(item)} 
              className="snap-start min-w-[220px] max-w-[220px] sm:min-w-[240px] sm:max-w-[240px] group cursor-pointer flex flex-col relative transition-all duration-300 hover:-translate-y-2"
            >
              <div className="relative h-auto aspect-[3.5/4] rounded-[2rem] overflow-hidden shadow-card border border-slate-100 dark:border-white/5 bg-white dark:bg-[#15191E] flex flex-col justify-between p-5">
                 <div className="flex justify-between items-start mb-4">
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-lg uppercase tracking-widest text-brand-violet bg-brand-violet/5 border border-brand-violet/10">
                        {item.category === 'doctrine' ? 'Doutrina' : item.category === 'prayer' ? 'Oração' : 'Liturgia'}
                    </span>
                 </div>
                 <div className="flex-1 flex items-center justify-center mb-4">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-slate-50 dark:bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform duration-500 border border-slate-100 dark:border-white/5">
                        <item.icon size={28} className="text-brand-violet opacity-80" strokeWidth={1.5} />
                    </div>
                 </div>
                 <div>
                    <h4 className="font-bold text-brand-dark dark:text-white text-base leading-tight mb-2 line-clamp-2">{item.title}</h4>
                    <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500 text-[10px] font-bold">
                        <Clock size={12} /> {item.duration}
                    </div>
                 </div>
                 <div className="absolute inset-0 border-2 border-transparent group-hover:border-brand-violet/10 rounded-[2rem] transition-colors pointer-events-none" />
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

const KnowledgeBase: React.FC = () => {
  const [activeItem, setActiveItem] = useState<KnowledgeItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'doctrine' | 'prayer' | 'mass'>('all');

  const filteredTracks = useMemo(() => {
    return STATIC_DATA.map(track => ({
      ...track,
      items: track.items.filter(item => {
        const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || item.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
        return matchesSearch && matchesCategory;
      })
    })).filter(track => track.items.length > 0);
  }, [searchQuery, selectedCategory]);

  const FeaturedItem = STATIC_DATA[0].items[0];

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-brand-dark font-sans transition-colors pb-32 animate-fade-in">
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-brand-dark/90 backdrop-blur-xl border-b border-slate-200 dark:border-white/5 px-4 sm:px-6 py-4 transition-all">
        <div className="max-w-5xl mx-auto flex flex-col gap-4">
          <div className="flex justify-between items-center">
             <div>
                <h1 className="text-xl sm:text-2xl font-bold text-brand-dark dark:text-white tracking-tight flex items-center gap-2">
                   Biblioteca
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Conhecer para amar: alimento para sua alma</p>
             </div>
             <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center text-slate-400 dark:text-white hover:bg-brand-violet hover:text-white transition-colors shadow-sm">
                <GraduationCap size={20} />
             </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
             <div className="relative group flex-1">
                <Search className="absolute left-3.5 top-3 text-slate-400 group-focus-within:text-brand-violet transition-colors" size={18} />
                <input 
                  type="text" 
                  placeholder="Buscar tema (ex: Quaresma, Missa)..." 
                  value={searchQuery} 
                  onChange={(e) => setSearchQuery(e.target.value)} 
                  className="w-full bg-slate-100 dark:bg-black/20 border-none rounded-xl py-2.5 pl-10 pr-4 text-sm font-medium text-brand-dark dark:text-white placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-brand-violet/30 transition-all shadow-inner" 
                />
             </div>
             <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
               {[{ id: 'all', label: 'Todos' }, { id: 'doctrine', label: 'Doutrina' }, { id: 'prayer', label: 'Oração' }, { id: 'mass', label: 'Missa' }].map(cat => (
                 <button 
                    key={cat.id} 
                    onClick={() => setSelectedCategory(cat.id as any)} 
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${selectedCategory === cat.id ? 'bg-brand-dark dark:bg-white text-white dark:text-brand-dark border-transparent shadow-md' : 'bg-white dark:bg-white/5 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-white/10 hover:bg-slate-50'}`}
                 >
                    {cat.label}
                 </button>
               ))}
             </div>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-10">
        {!searchQuery && selectedCategory === 'all' && FeaturedItem && (
          <div onClick={() => setActiveItem(FeaturedItem)} className="relative w-full rounded-[2rem] overflow-hidden shadow-xl border border-white/10 group cursor-pointer bg-gradient-to-br from-[#2E2344] to-[#1A1625] flex flex-col sm:flex-row min-h-[220px] sm:min-h-[300px]">
            <div className="absolute -right-10 -bottom-10 opacity-10 sm:opacity-20 transform rotate-12 pointer-events-none">
               <FeaturedItem.icon size={240} className="text-white" strokeWidth={0.5} />
            </div>
            <div className="p-6 sm:p-10 z-10 flex-1 flex flex-col justify-center relative">
               <div className="inline-flex items-center gap-2 bg-white/10 text-white text-[9px] font-bold px-3 py-1 rounded-full mb-4 w-fit border border-white/10 backdrop-blur-sm">
                  <Sparkles size={10} fill="currentColor" /> DESTAQUE DA SEMANA
               </div>
               <h2 className="text-2xl sm:text-4xl font-black text-white mb-3 leading-tight tracking-tight drop-shadow-md max-w-lg">
                  {FeaturedItem.title}
               </h2>
               <p className="text-slate-300 text-xs sm:text-base line-clamp-3 mb-6 font-medium leading-relaxed max-w-md">
                  {FeaturedItem.description}
               </p>
               <button className="bg-white text-brand-dark px-6 py-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 hover:bg-slate-100 transition-colors shadow-lg hover:scale-105 active:scale-95 duration-300 w-fit">
                  <PlayCircle size={18} fill="currentColor" /> Abrir Conteúdo
               </button>
            </div>
          </div>
        )}

        <div className="space-y-4">
           {filteredTracks.map((track) => (
              <KnowledgeTrackRow key={track.id} track={track} onSelect={setActiveItem} />
           ))}
        </div>

        {filteredTracks.length === 0 && (
          <div className="text-center py-20 opacity-60">
             <div className="w-20 h-20 bg-slate-100 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-400">
                <Search size={32} />
             </div>
             <h3 className="text-lg font-bold text-brand-dark dark:text-white mb-2">Nenhum conteúdo encontrado</h3>
             <p className="text-slate-500 dark:text-slate-400 max-w-xs mx-auto">Tente buscar por termos como "rosário", "missa" ou "confissão".</p>
          </div>
        )}
      </div>

      {activeItem && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center sm:p-4">
          <div className="absolute inset-0 bg-brand-dark/95 backdrop-blur-xl transition-opacity animate-fade-in" onClick={() => setActiveItem(null)} />
          <div className="relative w-full max-w-4xl h-full sm:h-[95vh] bg-white dark:bg-[#0F1115] sm:rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col animate-slide-up border border-white/10">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-white/5 flex justify-between items-center bg-white/95 dark:bg-[#0F1115]/95 backdrop-blur-md absolute top-0 w-full z-30">
               <button 
                  onClick={() => setActiveItem(null)} 
                  className="w-10 h-10 rounded-full bg-slate-50 dark:bg-white/10 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/20 transition-colors"
               >
                  <ChevronLeft size={24} />
               </button>
               <div className="flex gap-2">
                  <button className="w-10 h-10 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-50 dark:hover:bg-white/10 transition-colors hover:text-brand-violet"><Bookmark size={20} /></button>
                  <button className="w-10 h-10 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-50 dark:hover:bg-white/10 transition-colors hover:text-brand-violet"><Share2 size={20} /></button>
               </div>
            </div>
            <div className="flex-1 overflow-y-auto bg-[#FAF9F6] dark:bg-[#0F1115] relative">
               <div className="relative w-full h-[35vh] sm:h-[40vh] bg-slate-50 dark:bg-[#1A1F26] flex items-center justify-center overflow-hidden">
                  <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
                  <activeItem.icon size={120} className="text-brand-violet opacity-90 relative z-10 drop-shadow-2xl animate-scale-in" strokeWidth={1} />
                  <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-[#FAF9F6] dark:from-[#0F1115] to-transparent" />
               </div>
               <div className="px-6 sm:px-12 pb-32 -mt-20 relative z-10">
                  <div className="max-w-2xl mx-auto">
                     <div className="flex flex-wrap items-center gap-3 mb-6 animate-slide-up justify-center sm:justify-start">
                        <span className="bg-brand-violet text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-md">
                           {activeItem.category === 'doctrine' ? 'Doutrina' : activeItem.category === 'prayer' ? 'Espiritualidade' : 'Liturgia'}
                        </span>
                        <span className="bg-white/80 dark:bg-white/10 backdrop-blur-md text-slate-500 dark:text-slate-300 text-xs font-bold flex items-center gap-1.5 px-3 py-1 rounded-full border border-slate-200 dark:border-white/10 shadow-sm">
                           <Clock size={12} /> {activeItem.duration} de leitura
                        </span>
                     </div>
                     <h1 className="text-3xl sm:text-5xl font-black text-brand-dark dark:text-white mb-10 font-serif leading-[1.1] tracking-tight drop-shadow-sm animate-slide-up text-center sm:text-left">
                        {activeItem.title}
                     </h1>
                     <div className="prose prose-lg prose-slate dark:prose-invert prose-p:font-serif prose-p:text-[1.15rem] prose-p:leading-loose prose-p:text-slate-700 dark:prose-p:text-slate-300 animate-slide-up" style={{animationDelay: '200ms'}}>
                        <div className="whitespace-pre-line">{activeItem.content}</div>
                     </div>
                     <div className="mt-16 pt-10 border-t border-slate-200 dark:border-white/10 animate-slide-up" style={{animationDelay: '300ms'}}>
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6 text-center">Aprofunde-se no Tema</h3>
                        <div className="grid sm:grid-cols-2 gap-4">
                           <a href={activeItem.videoSuggestion.url} target="_blank" rel="noopener noreferrer" className="bg-white dark:bg-white/5 p-5 rounded-2xl border border-slate-100 dark:border-white/10 hover:border-red-200 dark:hover:border-red-900/50 group transition-all hover:shadow-lg flex items-center gap-4 relative overflow-hidden">
                              <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500 opacity-50 group-hover:opacity-100 transition-opacity" />
                              <div className="w-12 h-12 rounded-full bg-red-50 dark:bg-red-900/20 text-red-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform"><Youtube size={24} /></div>
                              <div className="min-w-0">
                                 <p className="text-[10px] font-bold text-red-500 uppercase mb-0.5 tracking-wide">Assistir</p>
                                 <p className="font-bold text-brand-dark dark:text-white text-sm leading-tight truncate">{activeItem.videoSuggestion.title}</p>
                                 <p className="text-[10px] text-slate-400 truncate mt-0.5">{activeItem.videoSuggestion.channelName}</p>
                              </div>
                              <ExternalLink size={16} className="ml-auto text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                           </a>
                           <a href={activeItem.musicSuggestion.url} target="_blank" rel="noopener noreferrer" className="bg-white dark:bg-white/5 p-5 rounded-2xl border border-slate-100 dark:border-white/10 hover:border-green-200 dark:hover:border-green-900/50 group transition-all hover:shadow-lg flex items-center gap-4 relative overflow-hidden">
                              <div className="absolute left-0 top-0 bottom-0 w-1 bg-green-500 opacity-50 group-hover:opacity-100 transition-opacity" />
                              <div className="w-12 h-12 rounded-full bg-green-50 dark:bg-green-900/20 text-green-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform"><Headphones size={24} /></div>
                              <div className="min-w-0">
                                 <p className="text-[10px] font-bold text-green-500 uppercase mb-0.5 tracking-wide">Ouvir</p>
                                 <p className="font-bold text-brand-dark dark:text-white text-sm leading-tight truncate">{activeItem.musicSuggestion.title}</p>
                                 <p className="text-[10px] text-slate-400 truncate mt-0.5">{activeItem.musicSuggestion.artist}</p>
                              </div>
                              <ExternalLink size={16} className="ml-auto text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                           </a>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
            <div className="absolute bottom-0 left-0 w-full p-6 bg-white/90 dark:bg-[#0F1115]/90 backdrop-blur-xl border-t border-slate-100 dark:border-white/5 z-20">
               <div className="max-w-2xl mx-auto flex items-center justify-center">
                  <button onClick={() => setActiveItem(null)} className="w-full sm:w-auto bg-brand-dark dark:bg-white text-white dark:text-brand-dark font-bold py-4 px-12 rounded-xl shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 whitespace-nowrap">
                     <CheckCircle2 size={20} /> Concluir Leitura
                  </button>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KnowledgeBase;