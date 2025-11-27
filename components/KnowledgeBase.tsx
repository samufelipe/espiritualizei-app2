
import React, { useState, useMemo, useRef } from 'react';
import { KnowledgeTrack, KnowledgeItem } from '../types';
import { BookOpen, PlayCircle, CheckCircle2, X, ChevronRight, Clock, GraduationCap, Search, Bookmark, Share2, Sparkles, ChevronLeft, MoreVertical } from 'lucide-react';
import BrandLogo from './BrandLogo';

const MOCK_TRACKS: KnowledgeTrack[] = [
  {
    id: 'track-1',
    title: 'Fundamentos da Fé',
    description: 'O essencial para começar sua caminhada com solidez.',
    items: [
      {
        id: 'item-1',
        title: 'O que é Santidade?',
        description: 'Entenda que ser santo não é ser perfeito, mas ser amigo de Deus.',
        duration: '3 min',
        category: 'doctrine',
        imageUrl: 'https://images.unsplash.com/photo-1568024846754-67296a770d31?auto=format&fit=crop&w=600&q=80', // Saint Statue
        content: `
# O que é Santidade?

Muitos pensam que santidade é algo inalcançável...
        `
      },
      {
        id: 'item-2',
        title: 'Terço vs. Rosário',
        description: 'Qual a diferença e como rezar cada um corretamente.',
        duration: '5 min',
        category: 'prayer',
        imageUrl: 'https://images.unsplash.com/photo-1594583322913-442c6067b097?auto=format&fit=crop&w=600&q=80', // Rosary
        content: `
# Terço ou Rosário?

Você já se confundiu? É simples...
        `
      },
      {
        id: 'item-5',
        title: 'A Oração Mental',
        description: 'O segredo dos grandes santos para ouvir a Deus.',
        duration: '6 min',
        category: 'prayer',
        imageUrl: 'https://images.unsplash.com/photo-1507434965515-61970f2bd7c6?auto=format&fit=crop&w=600&q=80', // Bible/Lectio
        content: 'Conteúdo sobre oração mental...'
      }
    ]
  },
  {
    id: 'track-2',
    title: 'Viver a Missa',
    description: 'Não assista, participe. Entenda os gestos sagrados.',
    items: [
      {
        id: 'item-3',
        title: 'O Sinal da Cruz',
        description: 'Muito mais que um gesto automático, é uma renovação do Batismo.',
        duration: '2 min',
        category: 'mass',
        imageUrl: 'https://images.unsplash.com/photo-1598237696339-944b73b70b35?auto=format&fit=crop&w=600&q=80', // St Michael/Power
        content: `
# O Sinal da Cruz...
        `
      },
      {
        id: 'item-4',
        title: 'A Eucaristia Explicada',
        description: 'O centro da nossa fé: Jesus vivo, Corpo, Sangue, Alma e Divindade.',
        duration: '7 min',
        category: 'doctrine',
        imageUrl: 'https://images.unsplash.com/photo-1544387092-727335915267?auto=format&fit=crop&w=600&q=80', // Chalice
        content: `
# A Eucaristia...
        `
      }
    ]
  }
];

// Internal component for independent row scrolling
const KnowledgeTrackRow: React.FC<{ track: KnowledgeTrack, onSelect: (item: KnowledgeItem) => void }> = ({ track, onSelect }) => {
  const rowRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (rowRef.current) {
      const scrollAmount = 300;
      rowRef.current.scrollBy({ 
        left: direction === 'left' ? -scrollAmount : scrollAmount, 
        behavior: 'smooth' 
      });
    }
  };

  return (
    <div className="animate-slide-up relative group/row">
      <div className="flex items-end justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-brand-dark dark:text-white flex items-center gap-2">
              {track.title}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">{track.description}</p>
          </div>
          
          {/* Navigation Controls */}
          <div className="flex gap-2 opacity-0 group-hover/row:opacity-100 transition-opacity">
             <button 
                onClick={() => scroll('left')}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center hover:bg-brand-violet hover:text-white transition-colors"
             >
                <ChevronLeft size={16} />
             </button>
             <button 
                onClick={() => scroll('right')}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center hover:bg-brand-violet hover:text-white transition-colors"
             >
                <ChevronRight size={16} />
             </button>
          </div>
      </div>

      <div ref={rowRef} className="flex gap-5 overflow-x-auto pb-8 -mx-6 px-6 no-scrollbar snap-x scroll-smooth">
          {track.items.map((item) => (
            <div 
              key={item.id}
              onClick={() => onSelect(item)}
              className="snap-start min-w-[220px] max-w-[220px] group cursor-pointer flex flex-col"
            >
              {/* Poster Image */}
              <div className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-card group-hover:shadow-float group-hover:-translate-y-2 transition-all duration-500 ease-[cubic-bezier(0.25,0.8,0.25,1)] bg-brand-dark mb-4">
                  <img 
                    src={item.imageUrl} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                    alt={item.title} 
                    onError={(e) => {
                       (e.target as HTMLImageElement).style.display = 'none'; // Fallback to bg color
                    }}
                  />
                  
                  {/* Dark Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
                  
                  {/* Duration Badge */}
                  <div className="absolute top-3 right-3 bg-black/40 backdrop-blur-md border border-white/10 text-white text-[10px] font-bold px-2 py-1 rounded-lg flex items-center gap-1">
                    <Clock size={10} /> {item.duration}
                  </div>

                  {/* Play Button Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 scale-90 group-hover:scale-100">
                    <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/40 shadow-2xl">
                        <BookOpen size={24} fill="currentColor" className="ml-0.5" />
                    </div>
                  </div>
              </div>

              {/* Meta Info */}
              <div className="px-1">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-[9px] font-black uppercase tracking-wider text-brand-violet bg-brand-violet/10 px-1.5 py-0.5 rounded">
                      {item.category === 'doctrine' ? 'Doutrina' : item.category === 'prayer' ? 'Oração' : 'Liturgia'}
                    </span>
                  </div>
                  <h4 className="font-bold text-brand-dark dark:text-white text-base leading-tight line-clamp-2 mb-1.5 group-hover:text-brand-violet transition-colors">
                    {item.title}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>
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
    return MOCK_TRACKS.map(track => ({
      ...track,
      items: track.items.filter(item => {
        const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || item.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
        return matchesSearch && matchesCategory;
      })
    })).filter(track => track.items.length > 0);
  }, [searchQuery, selectedCategory]);

  const FeaturedItem = MOCK_TRACKS[1].items[1]; // Eucaristia as Featured

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-brand-dark font-sans transition-colors pb-32 animate-fade-in">
      
      {/* --- Sticky Header with Blur --- */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-brand-dark/80 backdrop-blur-xl border-b border-slate-200 dark:border-white/5 px-6 py-4 transition-all">
        <div className="max-w-5xl mx-auto flex flex-col gap-4">
          <div className="flex justify-between items-center">
             <div>
               <h1 className="text-2xl font-bold text-brand-dark dark:text-white tracking-tight">Aprender</h1>
               <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Escola de Fé & Doutrina</p>
             </div>
             <div className="w-10 h-10 rounded-full bg-brand-violet/10 dark:bg-white/10 border border-brand-violet/10 flex items-center justify-center text-brand-violet dark:text-white shadow-sm">
                <GraduationCap size={20} />
             </div>
          </div>

          {/* Search Input */}
          <div className="relative group">
             <Search className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-brand-violet transition-colors" size={18} />
             <input 
               type="text" 
               placeholder="O que você quer descobrir hoje?" 
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
               className="w-full bg-slate-100 dark:bg-black/20 border-none rounded-2xl py-3 pl-11 pr-4 text-sm font-medium text-brand-dark dark:text-white placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-brand-violet/30 transition-all shadow-inner"
             />
          </div>

          {/* Category Pills */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {[
              { id: 'all', label: 'Todos' },
              { id: 'doctrine', label: 'Doutrina' },
              { id: 'prayer', label: 'Espiritualidade' },
              { id: 'mass', label: 'Liturgia' }
            ].map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id as any)}
                className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${
                  selectedCategory === cat.id 
                    ? 'bg-brand-dark dark:bg-white text-white dark:text-brand-dark border-brand-dark dark:border-white shadow-lg shadow-brand-dark/10' 
                    : 'bg-white dark:bg-white/5 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-white/10 hover:bg-slate-50'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-12">
        
        {/* --- Cinematic Hero Section --- */}
        {!searchQuery && selectedCategory === 'all' && (
          <div 
            onClick={() => setActiveItem(FeaturedItem)}
            className="relative w-full aspect-[4/5] sm:aspect-[21/9] rounded-[2.5rem] overflow-hidden shadow-2xl group cursor-pointer ring-1 ring-black/5 dark:ring-white/10"
          >
            <div className="absolute inset-0 bg-brand-dark">
               <img 
                 src={FeaturedItem.imageUrl} 
                 className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[1.5s] ease-out opacity-80" 
                 alt="Destaque"
               />
               <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-brand-dark/40 to-transparent opacity-90" />
            </div>

            <div className="absolute bottom-0 left-0 p-8 sm:p-12 w-full">
               <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md border border-white/20 text-white text-[10px] font-bold px-3 py-1 rounded-full mb-4 shadow-lg">
                  <Sparkles size={12} fill="currentColor" /> DESTAQUE DO DIA
               </div>
               <h2 className="text-3xl sm:text-5xl font-extrabold text-white mb-3 leading-tight max-w-2xl drop-shadow-md">
                 {FeaturedItem.title}
               </h2>
               <p className="text-slate-200 text-sm sm:text-lg line-clamp-2 max-w-lg mb-8 font-medium leading-relaxed drop-shadow-sm">
                 {FeaturedItem.description}
               </p>
               <button className="bg-white text-brand-dark px-8 py-4 rounded-2xl font-bold text-sm flex items-center gap-2 hover:bg-slate-100 transition-colors shadow-xl hover:scale-105 active:scale-95 duration-300">
                 <PlayCircle size={20} fill="currentColor" className="text-brand-violet" /> Começar a Ler
               </button>
            </div>
          </div>
        )}

        {/* --- Knowledge Tracks (Row Component) --- */}
        {filteredTracks.map((track) => (
           <KnowledgeTrackRow key={track.id} track={track} onSelect={setActiveItem} />
        ))}

        {filteredTracks.length === 0 && (
          <div className="text-center py-20 opacity-50">
             <div className="w-16 h-16 bg-slate-100 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                <Search size={24} />
             </div>
            <p className="font-bold text-brand-dark dark:text-white">Nenhum conteúdo encontrado.</p>
            <p className="text-sm text-slate-500">Tente buscar por outro termo.</p>
          </div>
        )}
      </div>

      {/* --- Immersive Reader Modal --- */}
      {activeItem && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center sm:p-6">
          <div 
            className="absolute inset-0 bg-brand-dark/80 backdrop-blur-md transition-opacity animate-fade-in" 
            onClick={() => setActiveItem(null)}
          />
          
          <div className="relative w-full max-w-3xl h-full sm:h-[95vh] bg-white dark:bg-brand-dark sm:rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col animate-slide-up border border-white/10">
            
            {/* Reader Header */}
            <div className="px-6 py-4 border-b border-slate-100 dark:border-white/5 flex justify-between items-center bg-white/90 dark:bg-brand-dark/90 backdrop-blur-md absolute top-0 w-full z-20">
               <div className="flex items-center gap-4">
                  <button 
                    onClick={() => setActiveItem(null)}
                    className="w-10 h-10 rounded-full bg-slate-50 dark:bg-white/10 flex items-center justify-center text-brand-dark dark:text-white hover:bg-slate-200 dark:hover:bg-white/20 transition-colors"
                  >
                    <ChevronLeft size={24} />
                  </button>
                  <div className="hidden sm:block">
                    <p className="text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500 tracking-wider">Lendo agora</p>
                    <p className="text-sm font-bold text-brand-dark dark:text-white truncate max-w-[200px]">{activeItem.title}</p>
                  </div>
               </div>
               <div className="flex gap-3">
                  <button className="w-10 h-10 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-50 dark:hover:bg-white/10 transition-colors hover:text-brand-violet">
                     <Bookmark size={20} />
                  </button>
                  <button className="w-10 h-10 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-50 dark:hover:bg-white/10 transition-colors hover:text-brand-violet">
                     <Share2 size={20} />
                  </button>
                  <button className="w-10 h-10 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-50 dark:hover:bg-white/10 transition-colors sm:hidden">
                     <MoreVertical size={20} />
                  </button>
               </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto bg-[#FDFBF7] dark:bg-[#111]">
               {/* Cover Image in Reader */}
               <div className="relative w-full h-64 sm:h-80 bg-brand-dark">
                  <img 
                    src={activeItem.imageUrl} 
                    className="w-full h-full object-cover" 
                    alt="Cover"
                    onError={(e) => (e.target as HTMLImageElement).style.display = 'none'} 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#FDFBF7] dark:from-[#111] to-transparent" />
               </div>

               <div className="px-6 sm:px-12 pb-32 -mt-20 relative z-10">
                  <div className="max-w-2xl mx-auto">
                     <div className="flex items-center gap-2 mb-4">
                        <span className="bg-brand-violet text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">
                           {activeItem.category}
                        </span>
                        <span className="text-slate-500 text-xs font-bold flex items-center gap-1">
                           <Clock size={12} /> {activeItem.duration}
                        </span>
                     </div>

                     <h1 className="text-3xl sm:text-5xl font-black text-brand-dark dark:text-white mb-8 font-serif leading-[1.1] tracking-tight">
                        {activeItem.title}
                     </h1>

                     <div className="prose prose-lg prose-stone dark:prose-invert prose-headings:font-serif prose-headings:font-bold prose-p:font-serif prose-p:text-[1.1rem] prose-p:leading-loose text-slate-800 dark:text-slate-300">
                        <div className="whitespace-pre-line">
                          {activeItem.content}
                        </div>
                     </div>
                     
                     <div className="mt-12 pt-8 border-t border-slate-200 dark:border-white/10 text-center">
                        <BrandLogo size={32} className="mx-auto text-slate-300 mb-4" />
                        <p className="text-xs text-slate-400 font-serif italic">Fim da leitura</p>
                     </div>
                  </div>
               </div>
            </div>

            {/* Reader Footer (Progress/Action) */}
            <div className="absolute bottom-0 left-0 w-full p-6 bg-white/90 dark:bg-brand-dark/90 backdrop-blur-xl border-t border-slate-100 dark:border-white/5 z-20">
               <div className="max-w-2xl mx-auto flex items-center justify-between gap-4">
                  <div className="hidden sm:flex flex-col gap-1 w-full mr-8">
                     <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        <span>Progresso</span>
                        <span>100%</span>
                     </div>
                     <div className="h-1 w-full bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full w-full bg-brand-violet rounded-full" />
                     </div>
                  </div>
                  <button 
                    onClick={() => setActiveItem(null)}
                    className="w-full sm:w-auto bg-brand-dark dark:bg-white text-white dark:text-brand-dark font-bold py-3.5 px-8 rounded-xl shadow-lg hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 whitespace-nowrap"
                  >
                    <CheckCircle2 size={18} /> Concluir Leitura
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
