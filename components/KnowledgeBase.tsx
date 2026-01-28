
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { BookOpen, PlayCircle, CheckCircle2, ChevronLeft, ChevronRight, Clock, GraduationCap, Search, Bookmark, Share2, Youtube, Music, ExternalLink, X, Heart, Sun, CloudRain, Shield, Anchor, Users, Flame, Cross, Eye, Mic2, Headphones, Wifi, Globe, PenTool, Activity, Footprints, Zap } from 'lucide-react';
import BrandLogo from './BrandLogo';

// --- TIPOS LOCAIS ---
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
  deepenActions?: { label: string; type: string }[];
}

interface KnowledgeTrack {
  id: string;
  title: string;
  description: string;
  items: KnowledgeItem[];
}

// --- DADOS REAIS E COMPLETOS (TEXTOS HUMANIZADOS) ---
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
        content: `
A Quaresma de 2026 começa no dia 18 de fevereiro. Para muitos, é apenas uma quarta-feira comum; para o cristão, é o dia de receber cinzas sobre a cabeça e ouvir o lembrete mais honesto da vida: "Convertei-vos e crede no Evangelho".

O tempo quaresmal não é uma "tristeza deprimida", mas uma "tristeza esperançosa". É o tempo de retirar o excesso. Assim como um escultor retira o excesso da pedra para revelar a estátua, a Quaresma retira nossos vícios para revelar a imagem de Cristo em nós.

Nesta preparação, o silêncio é seu maior aliado. O deserto não é um lugar de solidão vazia, mas de encontro. Jesus foi ao deserto para ser tentado e vencer. Nós entramos na Quaresma para permitir que Ele vença em nós aquelas batalhas que, sozinhos, sempre perdemos.

Comece agora a pensar: qual será sua "arma" este ano? Não escolha sacrifícios impossíveis. Escolha aqueles que realmente doem no seu orgulho e te fazem mais dependente de Deus. No dia 18, não apenas receba as cinzas na testa, mas permita que elas queimem as ilusões do seu ego.`
      },
      {
        id: 'pilares-quaresma',
        title: 'Oração, Jejum e Esmola',
        description: 'Os três remédios da alma para o tempo de conversão.',
        category: 'prayer',
        duration: '12 min',
        icon: Shield,
        videoSuggestion: { title: "Os 3 Pilares da Quaresma", url: "https://www.youtube.com/results?search_query=padre+paulo+ricardo+pilares+quaresma", channelName: "Pe. Paulo Ricardo" },
        musicSuggestion: { title: "Vou cantar teu amor", url: "https://www.youtube.com/results?search_query=musica+caridade+catolica", artist: "Vários" },
        content: `
A Igreja nos dá três ferramentas essenciais para a Quaresma. Se usarmos apenas uma, nossa vida espiritual fica desequilibrada. Elas funcionam como um tripé.

1. Oração (Relação com Deus): É o pilar que sustenta tudo. Sem oração, o jejum é dieta e a esmola é filantropia. Na Quaresma, reze não apenas "mais", mas "melhor". Busque o silêncio. Fale menos, escute mais a Palavra de Deus.

2. Jejum (Relação comigo mesmo): O jejum serve para "domar a fera". Nossos sentidos estão sempre querendo mais prazer, mais comida, mais telas. Ao dizer "não" a algo bom (como uma comida que gostamos), fortalecemos nossa vontade para dizer "não" ao pecado na hora da tentação. É a oração do corpo.

3. Esmola (Relação com o próximo): A Quaresma deve nos tornar mais sensíveis à dor do outro. A esmola não é apenas dar o que sobra, mas partilhar o que nos faz falta. Pode ser dinheiro, mas também pode ser tempo, atenção ou um perdão que estava guardado há anos.

Prepare seu plano para 2026 equilibrando essas três dimensões. O que você vai rezar? Do que vai jejuar? A quem vai servir?`
      }
    ]
  },
  {
    id: 'track-4',
    title: 'Heróis da Fé (Santos)',
    description: 'Vidas que imitaram Cristo perfeitamente.',
    items: [
      {
        id: 'carlo-full',
        title: 'Carlo Acutis: O Ciberapóstolo',
        description: 'Transformou a internet em um sacrário. Nosso padroeiro.',
        category: 'doctrine',
        duration: '10 min',
        icon: Wifi,
        videoSuggestion: { title: "Quem foi Carlo Acutis?", url: "https://www.youtube.com/results?search_query=quem+foi+carlo+acutis", channelName: "Shalom" },
        musicSuggestion: { title: "Original, não cópia", url: "https://www.youtube.com/results?search_query=musica+carlo+acutis", artist: "Jovens" },
        content: `
Carlo Acutis é o santo da nossa era. Ele não viveu em um deserto distante nem em um mosteiro medieval; ele jogava videogame, programava computadores, amava seus amigos e vestia calça jeans. Sua vida é a prova viva de que a santidade é possível no século XXI, entre telas e teclados.

Desde muito pequeno, Carlo demonstrou uma sensibilidade sobrenatural. Sua "estrada para o céu" tinha um nome: Eucaristia. Ele dizia que "a Eucaristia é a minha autoestrada para o Céu". Não era uma frase de efeito; era sua vida. Participava da Missa diariamente e fazia adoração sempre que podia.

Mas o que torna Carlo único é como ele uniu essa fé profunda com a tecnologia. Ele percebeu que a internet, muitas vezes usada para o mal ou para a futilidade, poderia ser o maior púlpito do mundo. Aprendeu a programar sozinho e criou um site catalogando todos os milagres eucarísticos do mundo. Ele não queria "likes" para si; queria que o mundo soubesse que Jesus está vivo na Hóstia Santa.

Sua frase mais famosa é um alerta para todos nós: "Todos nascem originais, mas muitos morrem como fotocópias". Carlo nos ensina que Deus não quer que sejamos cópias de outros santos, mas que sejamos nós mesmos, plenamente, vivendo nossa vocação única.

Ele faleceu aos 15 anos, de uma leucemia fulminante, oferecendo suas dores pelo Papa e pela Igreja. Sua vida foi breve, mas intensa como uma chama. Ele nos mostra que não precisamos fugir do mundo digital para encontrar Deus, mas precisamos santificar o mundo digital com a nossa presença cristã.

O Espiritualizei é dedicado a ele. Que Carlo Acutis interceda por cada toque que damos na tela, para que seja um toque em direção a Deus.`
      },
      {
        id: 'bento-full',
        title: 'São Bento: O Mestre da Rotina',
        description: 'Ora et Labora. Como a ordem exterior cria paz interior.',
        category: 'doctrine',
        duration: '14 min',
        icon: Clock,
        videoSuggestion: { title: "A Regra de São Bento", url: "https://www.youtube.com/results?search_query=regra+de+sao+bento+padre+paulo+ricardo", channelName: "Pe. Paulo Ricardo" },
        musicSuggestion: { title: "Hino de São Bento", url: "https://www.youtube.com/results?search_query=hino+de+sao+bento+latim", artist: "Monjes Beneditinos" },
        content: `
Vivemos em um mundo de caos, ansiedade e dispersão. Notificações constantes, multitarefas e a sensação de que o tempo nunca é suficiente. Séculos atrás, São Bento de Núrsia enfrentou um mundo em colapso (a queda do Império Romano) e propôs uma solução que salvou a civilização ocidental: a Regra.

O lema beneditino "Ora et Labora" (Reza e Trabalha) não é apenas para monges; é um segredo de vida para qualquer cristão. São Bento entendeu que o ócio é inimigo da alma, mas o ativismo desenfreado também o é. Ele propôs um ritmo sagrado onde o dia é dividido de forma equilibrada entre a oração, o trabalho manual, o estudo e o descanso.

São Bento nos ensina que a santidade precisa de *estrutura*. Não basta ter "vontade" de rezar; é preciso ter horário. Não basta querer ser bom; é preciso ter disciplina. Para ele, a rotina não é uma prisão, mas a ferramenta que nos liberta dos caprichos dos nossos sentimentos momentâneos.

Sua famosa medalha e sua oração de exorcismo ("A Cruz Sagrada seja a minha luz") nos lembram também que a vida espiritual é um combate. O demônio odeia a ordem e ama a confusão. Quando organizamos nossa vida, quando cumprimos nossos deveres de estado com pontualidade e amor, estamos propagandando a ordem divina.`
      }
    ]
  }
];

const KnowledgeBase: React.FC = () => {
  const [selectedItem, setSelectedItem] = useState<KnowledgeItem | any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [dynamicTracks, setDynamicTracks] = useState<KnowledgeTrack[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'doctrine' | 'prayer' | 'mass'>('all');

  useEffect(() => {
    const fetchDynamicContent = async () => {
      const { supabase } = await import('../services/authService');
      if (!supabase) return;

      const { data: items } = await supabase
        .from('knowledge_items')
        .select('*')
        .order('created_at', { ascending: false });

      if (items && items.length > 0) {
        const weeklyTrack: KnowledgeTrack = {
          id: 'track-weekly-highlights',
          title: 'Destaques da Semana',
          description: 'Conteúdos especiais baseados no calendário litúrgico.',
          items: items.map((i: any) => ({
            id: i.id,
            title: i.title,
            description: i.description,
            content: i.content,
            category: i.category,
            duration: i.duration,
            icon: Flame, 
            videoSuggestion: i.video_suggestion,
            musicSuggestion: i.music_suggestion,
            deepenActions: i.deepen_actions
          }))
        };
        setDynamicTracks([weeklyTrack]);
      }
    };
    fetchDynamicContent();
  }, []);

  const filteredTracks = useMemo(() => {
    const allTracks = [...dynamicTracks, ...STATIC_DATA];
    return allTracks.map(track => ({
      ...track,
      items: track.items.filter(item => {
        const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                             item.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
        return matchesSearch && matchesCategory;
      })
    })).filter(track => track.items.length > 0);
  }, [searchQuery, selectedCategory, dynamicTracks]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-brand-dark font-sans transition-colors pb-32 animate-fade-in">
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-brand-dark/90 backdrop-blur-xl border-b border-slate-200 dark:border-white/5 px-4 sm:px-6 py-4 transition-all">
        <div className="max-w-5xl mx-auto flex flex-col gap-4">
          <div className="flex justify-between items-center">
             <div>
                <h1 className="text-xl sm:text-2xl font-bold text-brand-dark dark:text-white tracking-tight flex items-center gap-2">
                   Biblioteca
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Conhecer para amar: alimento simples para a alma</p>
             </div>
          </div>
          
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-violet transition-colors" size={18} />
            <input 
              type="text"
              placeholder="O que você quer aprender hoje?"
              className="w-full bg-slate-100 dark:bg-white/5 border-none rounded-2xl py-3.5 pl-12 pr-4 text-sm focus:ring-2 focus:ring-brand-violet/50 transition-all outline-none dark:text-white"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {filteredTracks.map(track => (
          <section key={track.id} className="mb-12">
            <div className="flex items-end justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-brand-dark dark:text-white">{track.title}</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">{track.description}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {track.items.map(item => (
                <div 
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  className="bg-white dark:bg-white/5 rounded-[2rem] p-6 border border-slate-100 dark:border-white/5 hover:shadow-xl hover:shadow-brand-violet/10 transition-all cursor-pointer group relative overflow-hidden"
                >
                  <div className="w-12 h-12 rounded-2xl bg-brand-violet/10 text-brand-violet flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <item.icon size={24} />
                  </div>
                  <h3 className="font-bold text-brand-dark dark:text-white mb-2 line-clamp-1">{item.title}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">{item.description}</p>
                  <div className="mt-4 flex items-center gap-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    <span className="flex items-center gap-1"><Clock size={12} /> {item.duration}</span>
                    <span className="w-1 h-1 rounded-full bg-slate-300" />
                    <span>{item.category}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </main>

      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-brand-dark/80 backdrop-blur-md" onClick={() => setSelectedItem(null)} />
          <div className="relative w-full max-w-3xl max-h-[90vh] bg-white dark:bg-[#1A1F26] rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
            <div className="sticky top-0 z-10 flex items-center justify-between p-6 bg-white/80 dark:bg-[#1A1F26]/80 backdrop-blur-md border-b border-slate-100 dark:border-white/5">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-brand-violet/10 text-brand-violet flex items-center justify-center">
                  <selectedItem.icon size={20} />
                </div>
                <div>
                  <h2 className="font-bold text-brand-dark dark:text-white leading-tight">{selectedItem.title}</h2>
                  <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">{selectedItem.category} • {selectedItem.duration}</p>
                </div>
              </div>
              <button onClick={() => setSelectedItem(null)} className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-full transition-colors">
                <X size={20} className="text-slate-400" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 sm:p-10">
              <div className="prose prose-slate dark:prose-invert max-w-none">
                <div className="whitespace-pre-wrap text-slate-600 dark:text-slate-300 leading-relaxed text-base sm:text-lg">
                  {selectedItem.content}
                </div>
              </div>

              {selectedItem.deepenActions && (
                <div className="mt-12 p-6 bg-brand-violet/5 rounded-3xl border border-brand-violet/10">
                  <h4 className="text-brand-violet font-bold mb-4 flex items-center gap-2">
                    <Zap size={18} /> Aprofunde sua Experiência
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {selectedItem.deepenActions.map((action: any, idx: number) => (
                      <button key={idx} className="flex items-center gap-3 p-3 bg-white dark:bg-white/5 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-brand-violet hover:text-white transition-all shadow-sm">
                        <CheckCircle2 size={16} /> {action.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-6">
                <a href={selectedItem.videoSuggestion.url} target="_blank" rel="noreferrer" className="group p-6 bg-red-50 dark:bg-red-500/5 rounded-3xl border border-red-100 dark:border-red-500/10 transition-all hover:scale-[1.02]">
                  <Youtube className="text-red-500 mb-4" size={32} />
                  <h4 className="font-bold text-brand-dark dark:text-white text-sm mb-1">Sugestão de Vídeo</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">{selectedItem.videoSuggestion.title}</p>
                  <span className="text-[10px] font-bold text-red-500 uppercase tracking-wider flex items-center gap-1">Assistir no {selectedItem.videoSuggestion.channelName} <ExternalLink size={10} /></span>
                </a>

                <a href={selectedItem.musicSuggestion.url} target="_blank" rel="noreferrer" className="group p-6 bg-blue-50 dark:bg-blue-500/5 rounded-3xl border border-blue-100 dark:border-blue-500/10 transition-all hover:scale-[1.02]">
                  <Music className="text-blue-500 mb-4" size={32} />
                  <h4 className="font-bold text-brand-dark dark:text-white text-sm mb-1">Sugestão de Música</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">{selectedItem.musicSuggestion.title}</p>
                  <span className="text-[10px] font-bold text-blue-500 uppercase tracking-wider flex items-center gap-1">Ouvir {selectedItem.musicSuggestion.artist} <ExternalLink size={10} /></span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KnowledgeBase;
