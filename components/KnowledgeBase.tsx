import React, { useState, useMemo, useRef } from 'react';
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

// --- ACERVO COMPLETO EXPANDIDO E APROFUNDADO ---
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
        content: `A Quaresma de 2026 começa no dia 18 de fevereiro. Este não é apenas um marco no calendário, mas um chamado profundo à metanoia — a mudança de mente e de coração. As cinzas que recebemos sobre a cabeça são um lembrete da nossa finitude ("Lembra-te que és pó"), mas também um sinal de esperança: do pó, Deus pode recriar a vida.\n\nNesta jornada de 40 dias, somos convidados a entrar no deserto com Jesus. O deserto litúrgico não é um lugar de solidão vazia, mas de silêncio fecundo. É onde as vozes do mundo se calam para que a voz do Amado possa ser ouvida. Como ensinava São João da Cruz, "Deus fala no silêncio".\n\nPara que esta Quaresma seja diferente de todas as outras, você precisa de um plano de batalha. A Igreja nos oferece três armas fundamentais: a Oração (que nos liga a Deus), o Jejum (que nos liberta de nós mesmos) e a Esmola (que nos liga ao próximo). Não escolha sacrifícios por vaidade espiritual; escolha aqueles que realmente quebram o seu orgulho e te tornam mais dócil à vontade do Pai.`
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
        content: `Vivemos em uma era de hiperestimulação. O cérebro moderno está constantemente sendo bombardeado por notificações, vídeos curtos e curtidas, criando um ciclo de dependência de dopamina que torna a oração profunda quase impossível. A alma, para rezar, precisa de estabilidade e atenção, coisas que o ruído digital destrói.\n\nO jejum de telas na Quaresma é uma forma de "ascese digital". Não se trata de demonizar a tecnologia, mas de recuperar o domínio sobre os nossos sentidos. Quando desligamos o celular, forçamos nossa mente a lidar com o tédio, e é justamente no tédio que muitas vezes Deus começa a falar.\n\nPrática sugerida: Determine "zonas livres de tecnologia" na sua casa e horários sagrados onde o celular não entra. Ao acordar, que a sua primeira conexão seja com o Criador, não com o Wi-Fi. Ao deitar, que a última imagem seja a de uma cruz ou de uma oração, não a luz azul de uma tela. Recupere sua liberdade interior para que sua alma possa voar livremente em direção a Deus.`
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
        title: 'O Mistério do Altar',
        description: 'Não é um compromisso social, é o sacrifício vivo de Cristo.',
        category: 'mass',
        duration: '12 min',
        icon: Church,
        videoSuggestion: { title: "O que acontece na Missa?", url: "https://www.youtube.com/results?search_query=padre+paulo+ricardo+santa+missa", channelName: "Pe. Paulo Ricardo" },
        musicSuggestion: { title: "Anjos de Resgate", url: "https://www.youtube.com/results?search_query=anjos+de+resgate+eucaristica", artist: "Anjos de Resgate" },
        content: `A Santa Missa é o centro e o ápice de toda a vida cristã. Nela, o sacrifício único de Cristo no Calvário torna-se presente de forma incruenta sobre o altar. Não estamos meramente "lembrando" de um evento passado; estamos sendo transportados, pelo poder do Espírito Santo, para o pé da Cruz.\n\nCada gesto da liturgia tem um significado eterno. Quando o padre faz o sinal da cruz, entramos no espaço sagrado. Quando pedimos perdão no Ato Penitencial, lavamos as vestes da alma para o banquete. E no momento da Consagração, o pão e o vinho deixam de existir em sua substância para darem lugar ao Corpo, Sangue, Alma e Divindade de Nosso Senhor Jesus Cristo.\n\nParticipar da Missa com consciência é o maior ato que um ser humano pode realizar na terra. É o momento em que o Céu beija a Terra e nós, pobres pecadores, somos convidados a cear com o Rei dos Reis. Nunca vá à Missa por obrigação; vá por amor, pois ali está Aquele que te amou até o fim.`
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
        title: 'Lectio Divina: O Diálogo com a Palavra',
        description: 'Aprenda a ouvir a voz de Deus através das Escrituras.',
        category: 'prayer',
        duration: '15 min',
        icon: BookOpen,
        videoSuggestion: { title: "Como fazer Lectio Divina?", url: "https://www.youtube.com/results?search_query=como+fazer+lectio+divina+passo+a+passo", channelName: "Canção Nova" },
        musicSuggestion: { title: "Pela tua palavra", url: "https://www.youtube.com/results?search_query=musica+pela+tua+palavra", artist: "Walmir Alencar" },
        content: `A Bíblia não é um livro de informações, mas um lugar de encontro. A Lectio Divina (Leitura Orante) é um método milenar que nos ensina a mastigar a Palavra de Deus até que ela se torne parte de nós. Ela se divide em quatro degraus fundamentais:\n\n1. **Lectio (Leitura):** Leia o texto lentamente. O que o texto diz em si? Identifique os personagens, o cenário e a ação.\n2. **Meditatio (Meditação):** O que o texto diz para mim hoje? Qual palavra ou frase ecoa no meu coração? Deixe que a Palavra ilumine sua vida atual.\n3. **Oratio (Oração):** O que eu digo a Deus a partir do que li? É um momento de resposta, de súplica, de louvor ou de pedido de perdão.\n4. **Contemplatio (Contemplação):** Silencie. Descanse na presença de Deus. Deixe que Ele transforme seu olhar e seu coração.\n\nA oração não é um monólogo, mas um diálogo de amor. Através da Lectio Divina, permitimos que Deus tome a iniciativa e nos conduza pelas estradas da Sua vontade.`
      }
    ]
  }
];

const KnowledgeBase: React.FC = () => {
  const [selectedItem, setSelectedItem] = useState<KnowledgeItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<'all' | 'doctrine' | 'prayer' | 'mass'>('all');

  const filteredTracks = useMemo(() => {
    return STATIC_DATA.map(track => ({
      ...track,
      items: track.items.filter(item => {
        const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            item.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
        return matchesSearch && matchesCategory;
      })
    })).filter(track => track.items.length > 0);
  }, [searchQuery, activeCategory]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black/20 pb-32 animate-fade-in">
      {/* Header */}
      <div className="bg-white dark:bg-[#1A1F26] border-b border-slate-100 dark:border-white/5 pt-12 pb-8 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl font-extrabold text-brand-dark dark:text-white mb-2 flex items-center gap-3">
                <BookOpen className="text-brand-violet" /> Biblioteca da Fé
              </h1>
              <p className="text-slate-500 dark:text-slate-400 font-medium">Formação e espiritualidade para sua jornada diária.</p>
            </div>
            
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-violet transition-colors" size={18} />
              <input 
                type="text"
                placeholder="O que você quer aprender hoje?"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full md:w-80 bg-slate-100 dark:bg-white/5 border-none rounded-2xl py-3.5 pl-12 pr-4 text-sm outline-none focus:ring-2 ring-brand-violet/20 dark:text-white transition-all"
              />
            </div>
          </div>

          {/* Categories */}
          <div className="flex gap-2 mt-8 overflow-x-auto pb-2 no-scrollbar">
            {[
              { id: 'all', label: 'Tudo', icon: Sparkles },
              { id: 'doctrine', label: 'Doutrina', icon: GraduationCap },
              { id: 'prayer', label: 'Oração', icon: Flame },
              { id: 'mass', label: 'Santa Missa', icon: Church }
            ].map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id as any)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
                  activeCategory === cat.id 
                    ? 'bg-brand-violet text-white shadow-lg shadow-brand-violet/20' 
                    : 'bg-white dark:bg-white/5 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/10'
                }`}
              >
                <cat.icon size={16} />
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 py-10">
        {filteredTracks.length > 0 ? (
          <div className="space-y-12">
            {filteredTracks.map(track => (
              <div key={track.id} className="animate-slide-up">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-extrabold text-brand-dark dark:text-white">{track.title}</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{track.description}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {track.items.map(item => (
	                    <div 
	                      key={item.id}
	                      onClick={() => setSelectedItem(item)}
	                      className="bg-white dark:bg-[#1A1F26] rounded-[2rem] p-6 shadow-card border border-slate-100 dark:border-white/5 hover:shadow-xl hover:border-brand-violet/20 transition-all cursor-pointer group active:scale-[0.98]"
	                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="w-12 h-12 flex items-center justify-center text-brand-violet group-hover:scale-110 transition-transform">
                          <item.icon size={32} />
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          <Clock size={12} /> {item.duration}
                        </div>
                      </div>
                      <h3 className="text-lg font-bold text-brand-dark dark:text-white mb-2 group-hover:text-brand-violet transition-colors">{item.title}</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed mb-6">{item.description}</p>
                      
                      <div className="flex items-center justify-between pt-4 border-t border-slate-50 dark:border-white/5">
                        <span className="text-[10px] font-bold text-brand-violet uppercase tracking-widest">Ler agora</span>
                        <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-white/5 flex items-center justify-center text-slate-400 group-hover:bg-brand-violet group-hover:text-white transition-all">
                          <ChevronRight size={16} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 bg-slate-100 dark:bg-white/5 rounded-full flex items-center justify-center text-slate-400 mb-4">
              <Search size={32} />
            </div>
            <h3 className="text-xl font-bold text-brand-dark dark:text-white">Nenhum conteúdo encontrado</h3>
            <p className="text-slate-500 dark:text-slate-400 max-w-xs mt-2">Tente buscar por outros termos ou mude a categoria.</p>
          </div>
        )}
      </div>

      {/* Modal de Conteúdo */}
      {selectedItem && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-brand-dark/90 backdrop-blur-md animate-fade-in" onClick={() => setSelectedItem(null)} />
          
          <div className="relative w-full max-w-4xl bg-white dark:bg-brand-dark rounded-[2.5rem] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-slide-up border border-white/10">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 dark:border-white/5 flex justify-between items-center bg-slate-50 dark:bg-black/20">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-brand-violet/10 flex items-center justify-center text-brand-violet">
                  <selectedItem.icon size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-brand-dark dark:text-white leading-tight">{selectedItem.title}</h2>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{selectedItem.duration} de leitura</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedItem(null)}
                className="w-10 h-10 rounded-full bg-white dark:bg-white/10 flex items-center justify-center text-slate-500 hover:text-brand-dark dark:hover:text-white transition-colors shadow-sm"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-8 sm:p-12">
              <div className="max-w-2xl mx-auto">
                <div className="prose prose-slate dark:prose-invert max-w-none">
                  {selectedItem.content.split('\n\n').map((paragraph, idx) => (
                    <p key={idx} className="text-slate-600 dark:text-slate-300 text-lg leading-relaxed mb-6 font-medium">
                      {paragraph}
                    </p>
                  ))}
                </div>

                {/* Aprofundamento */}
                <div className="mt-12 pt-12 border-t border-slate-100 dark:border-white/10">
                  <h3 className="text-xl font-bold text-brand-dark dark:text-white mb-6 flex items-center gap-2">
                    <Zap className="text-brand-violet" size={20} /> Aprofunde sua Experiência
                  </h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <a 
                      href={selectedItem.videoSuggestion.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-white/5 rounded-2xl hover:bg-brand-violet/5 transition-all group border border-transparent hover:border-brand-violet/20"
                    >
                      <div className="w-12 h-12 rounded-xl bg-red-100 dark:bg-red-900/20 flex items-center justify-center text-red-600">
                        <Youtube size={24} />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Vídeo Sugerido</p>
                        <p className="text-sm font-bold text-brand-dark dark:text-white group-hover:text-brand-violet transition-colors">{selectedItem.videoSuggestion.title}</p>
                      </div>
                    </a>

                    <a 
                      href={selectedItem.musicSuggestion.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-white/5 rounded-2xl hover:bg-brand-violet/5 transition-all group border border-transparent hover:border-brand-violet/20"
                    >
                      <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center text-blue-600">
                        <Music size={24} />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Música para Rezar</p>
                        <p className="text-sm font-bold text-brand-dark dark:text-white group-hover:text-brand-violet transition-colors">{selectedItem.musicSuggestion.title}</p>
                      </div>
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 bg-slate-50 dark:bg-black/20 border-t border-slate-100 dark:border-white/5 flex justify-center">
              <button 
                onClick={() => setSelectedItem(null)}
                className="bg-brand-violet text-white font-bold px-10 py-4 rounded-2xl shadow-lg shadow-brand-violet/20 hover:scale-105 active:scale-95 transition-all"
              >
                Concluir Leitura
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KnowledgeBase;
