
import React, { useState, useMemo, useRef } from 'react';
import { BookOpen, PlayCircle, CheckCircle2, ChevronLeft, ChevronRight, Clock, GraduationCap, Search, Bookmark, Share2, Youtube, Music, ExternalLink, X, Heart, Sun, CloudRain, Shield, Anchor, Users, Flame, Cross, Eye, Mic2, Headphones, Wifi, Globe, PenTool, Activity, Footprints } from 'lucide-react';
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
      },
      {
        id: 'jp2-full',
        title: 'João Paulo II: Coragem',
        description: '"Não tenhais medo!" A santidade que mudou a história.',
        category: 'doctrine',
        duration: '12 min',
        icon: Globe,
        videoSuggestion: { title: "A vida de JPII", url: "https://www.youtube.com/results?search_query=biografia+joao+paulo+ii", channelName: "Canção Nova" },
        musicSuggestion: { title: "Jesus Christ You Are My Life", url: "https://www.youtube.com/results?search_query=jesus+christ+you+are+my+life", artist: "JMJ" },
        content: `
Karol Wojtyla foi ator, poeta, operário, esquiador e Papa. Ele sobreviveu ao nazismo, ao comunismo e a um tiro no peito em plena Praça de São Pedro. Se existe um santo que nos ensina sobre força viril e coragem sobrenatural, é ele.

Sua primeira frase como Papa ecoa até hoje: "Não tenhais medo! Abri, melhor, escancarai as portas a Cristo!". João Paulo II sabia que o medo é a principal arma que nos paralisa. Medo do futuro, medo de não sermos amados, medo de entregar a vida a Deus. Ele nos mostrou que quem tem Cristo não perde nada, mas ganha tudo.

Ele foi o "Papa da Juventude" e da Família. Com sua Teologia do Corpo, ele nos ensinou que nossa sexualidade e nossos afetos não são algo sujo, mas um reflexo do amor de Deus, feitos para a doação total. Ele olhava nos olhos dos jovens e via neles a esperança da Igreja, chamando-os de "Sentinelas da Manhã".

Mesmo em sua velhice, curvado pela doença de Parkinson, ele não escondeu sua fraqueza. Ele fez de seu sofrimento um púlpito, mostrando ao mundo (que cultua a beleza e a saúde) que a dignidade humana não está na utilidade, mas no fato de sermos amados por Deus até o fim.

São João Paulo II nos ensina a ser "santos de calça jeans", santos que amam a natureza, que têm amigos, que riem, mas que têm uma espinha dorsal inquebrável feita de oração e verdade.`
      }
    ]
  },
  {
    id: 'track-1',
    title: 'Fundamentos da Fé',
    description: 'Doutrina sólida para enraizar sua alma.',
    items: [
      {
        id: 'confissao-full',
        title: 'Confissão: O Abraço',
        description: 'O tribunal onde a sentença é sempre o perdão.',
        category: 'doctrine',
        duration: '12 min',
        icon: Shield,
        videoSuggestion: { title: "Como se confessar bem?", url: "https://www.youtube.com/results?search_query=padre+paulo+ricardo+confissao", channelName: "Pe. Paulo Ricardo" },
        musicSuggestion: { title: "Misericórdia Infinita", url: "https://www.youtube.com/results?search_query=misericordia+infinita+walmir+alencar", artist: "Walmir Alencar" },
        content: `
Muitas vezes, nós fugimos do confessionário como quem foge de um tribunal severo. Carregamos o peso de nossos erros, a vergonha de nossas quedas repetidas e o medo de sermos julgados. Mas a verdade profunda sobre este sacramento é radicalmente oposta ao nosso medo. A Confissão não é o lugar da condenação; é o hospital das almas feridas.

Imagine que você está caminhando por uma estrada longa com uma mochila cheia de pedras. A cada quilômetro, o peso aumenta, suas costas doem, e a alegria da viagem desaparece. O pecado é exatamente isso: um peso morto que insistimos em carregar, achando que somos fortes o suficiente, ou pior, achando que não merececemos nos livrar dele.

Quando entramos no confessionário e nos ajoelhamos, não estamos diante apenas de um homem, o sacerdote. Estamos nos colocando nos braços do Pai da parábola do Filho Pródigo. Deus não está ali com uma régua para medir nossos erros, mas com braços abertos, ansioso para nos devolver a dignidade de filhos que perdemos pelo caminho.

Para viver bem este momento, precisamos de sinceridade, não de perfeccionismo. Não é necessário fazer uma lista técnica e fria. É preciso olhar para dentro e perguntar: onde eu deixei de amar? Onde o meu egoísmo falou mais alto que a caridade? Onde eu feri o coração de Deus e dos meus irmãos?

O arrependimento não é um sentimento de tristeza depressiva; é uma decisão corajosa de voltar para casa. É olhar para o Amor e dizer: "Eu quero te amar de volta, e sinto muito por não ter conseguido". E quando o padre pronuncia aquelas palavras libertadoras — "Eu te absolvo" — algo sobrenatural acontece. O peso cai. A mochila se esvazia. O céu faz festa.

Não tenha medo de recomeçar. A santidade não consiste em nunca cair, mas em nunca desistir de se levantar. O confessionário é a porta sempre aberta para esse novo começo.`
      },
      {
        id: 'santidade-full',
        title: 'O que é Santidade?',
        description: 'Desconstruindo a ideia de perfeição para encontrar o amor.',
        category: 'doctrine',
        duration: '10 min',
        icon: Heart,
        videoSuggestion: { title: "Santidade para todos", url: "https://www.youtube.com/results?search_query=chamado+a+santidade+padre+leo", channelName: "Pe. Léo" },
        musicSuggestion: { title: "Rumo à Santidade", url: "https://www.youtube.com/results?search_query=rumo+a+santidade+musica", artist: "Com. Shalom" },
        content: `
Quando pensamos em santos, é comum imaginarmos figuras distantes, inalcançáveis, pessoas que nunca erraram, que viviam flutuando em êxtase ou que morreram de formas trágicas em séculos passados. Olhamos para os vitrais das igrejas e pensamos: "O santuário não é para mim. Eu tenho defeitos demais".

Mas esse é o grande equívoco que nos paralisa. A santidade não é sinônimo de impecabilidade ou perfeccionismo. Ser santo não é anular a sua humanidade, mas sim permitir que a graça de Deus a transforme e a plenifique.

A definição mais bela de santidade é, talvez, a mais simples: ser santo é ser amigo íntimo de Deus. Santa Teresa de Ávila dizia que a oração é apenas "tratar de amizade, estando muitas vezes a sós com Quem sabemos que nos ama". Portanto, a santidade é uma relação, não uma performance.

Você se torna santo lavando a louça com amor, suportando com paciência aquele colega de trabalho difícil, ouvindo seu filho quando você está cansado, rezando mesmo quando não sente vontade nenhuma. A santidade acontece no anonimato do cotidiano, na pequenas batalhas vencidas por amor a Deus.

O mundo nos vende a ideia de que precisamos ser ricos, famosos ou poderosos para sermos importantes. O Evangelho nos diz que precisamos amar para sermos eternos. Deus não quer que você seja uma cópia de São Francisco ou de Santa Teresinha; Ele quer que você seja você mesmo, na sua melhor versão, purificada pelo amor d'Ele.

Não espere ser perfeito para começar a caminhar em direção a Deus. Ele nos ama imperfeitos, mas nos ama demais para nos deixar como estamos.`
      },
      {
        id: 'eucaristia-full',
        title: 'Eucaristia: Presença',
        description: 'Não é símbolo. É Carne, Sangue, Alma e Divindade.',
        category: 'doctrine',
        duration: '15 min',
        icon: Sun,
        videoSuggestion: { title: "O Milagre Eucarístico", url: "https://www.youtube.com/results?search_query=milagre+eucaristico+carlo+acutis", channelName: "Carlo Acutis" },
        musicSuggestion: { title: "Tão Sublime Sacramento", url: "https://www.youtube.com/results?search_query=tao+sublime+sacramento", artist: "Tradicional" },
        content: `
Existe um momento na história do universo que mudou tudo, e esse momento se repete silenciosamente em cada altar ao redor do mundo. Quando olhamos para aquele pequeno pedaço de pão branco, nossos olhos veem apenas matéria, mas a fé nos revela o maior tesouro da criação: o próprio Criador, escondido, pequeno, vulnerável, entregue em nossas mãos.

A Eucaristia não é um símbolo. Não é uma lembrança poética de alguém que já se foi. É a presença viva, real e substancial de Jesus Cristo. Corpo, Sangue, Alma e Divindade. É o Deus que se fez comida para que não morrêssemos de fome espiritual nesta travessia pelo deserto da vida.

É desconcertante pensar na humildade de Deus. Ele, que criou as galáxias e sustenta o universo, aceita esconder toda a sua glória na aparência de um pedaço de pão, correndo o risco de ser ignorado, derrubado ou profanado, apenas para poder estar perto de nós. A Eucaristia é a prova final de que o amor de Deus beira a loucura.

Quando comungamos, nos tornamos "sacrários vivos". Deus entra em nossa biologia, corre em nossas veias, une-se à nossa carne. Nós nos tornamos aquilo que comemos. Se comemos o Corpo de Cristo, somos transformados pouco a pouco n'Ele.

Por isso, não podemos nos aproximar da comunhão de qualquer jeito, por hábito ou automatismo. É preciso preparar a casa interior. É preciso estar em paz com Deus e com os irmãos. E, depois de recebermos tal visita, o silêncio é a única resposta adequada. Um silêncio de adoração, de gratidão, de quem sabe que não merece tamanha graça, mas a recebe porque Deus é infinitamente bom.

A Eucaristia é o coração da Igreja. Sem ela, seríamos apenas uma ONG ou um clube social. Com ela, tocamos o Céu aqui na Terra.`
      }
    ]
  },
  {
    id: 'track-2',
    title: 'Escola de Oração',
    description: 'Técnicas e tradições para elevar a alma.',
    items: [
      {
        id: 'rosario-full',
        title: 'O Poder do Rosário',
        description: 'Por que repetimos tantas Ave-Marias? O segredo do ritmo.',
        category: 'prayer',
        duration: '15 min',
        icon: Cross,
        videoSuggestion: { title: "O Santo Rosário", url: "https://www.youtube.com/results?search_query=como+rezar+o+rosario", channelName: "Canção Nova" },
        musicSuggestion: { title: "Terço Cantado", url: "https://www.youtube.com/results?search_query=terco+cantado+frei+gilson", artist: "Frei Gilson" },
        content: `
Para quem olha de fora, o Rosário pode parecer apenas uma repetição monótona e cansativa. "Para que repetir tantas vezes a mesma oração?", questionam muitos. Mas quem entra no mistério do Rosário descobre que a repetição não é um defeito, é um método.

Pense na respiração. Você não respira uma vez e diz: "Pronto, já respirei, não preciso mais". Você respira ritmicamente para se manter vivo. Ou pense em alguém que ama: quantas vezes dizemos "eu te amo"? O amor nunca se cansa de se repetir. As Ave-Marias são como rosas que entregamos, uma a uma, criando um ritmo que acalma a ansiedade do corpo e permite que a alma se eleve.

O Rosário é a oração dos simples e dos sábios. É uma "Bíblia dos pobres". Enquanto nossos lábios pronunciam a oração, nossa mente contempla as cenas da vida de Jesus: seu nascimento, sua dor, sua glória. Nós pedimos a Maria: "Mãe, empresta-me teus olhos. Deixa-me ver Jesus como a senhora O viu".

Em tempos de batalha espiritual, de confusão mental ou de aridez, o Rosário é como uma âncora. Quando não sabemos o que dizer a Deus, quando as palavras espontâneas nos faltam, nos seguramos nas contas do terço e deixamos que a oração da Igreja nos carregue.

Muitos santos diziam que o Rosário é a "arma" contra o mal. Não porque seja mágica, mas porque a humildade de rezar como uma criança desfaz a soberba do inimigo. Experimente. Nos dias difíceis, apenas comece. O ritmo suave da oração trará a paz que o raciocínio agitado não consegue encontrar.`
      }
    ]
  }
];

// Helper icon wrapper since Lucide exports components directly
function HandHeartIcon(props: any) {
    return <Heart {...props} />
}

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
    <div className="animate-slide-up relative group/row mb-12">
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
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Conhecer para amar: alimento simples para a alma</p>
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
                  placeholder="Buscar tema (ex: Quaresma)..." 
                  value={searchQuery} 
                  onChange={(e) => setSearchQuery(e.target.value)} 
                  className="w-full bg-slate-100 dark:bg-black/20 border-none rounded-xl py-2.5 pl-10 pr-4 text-sm font-medium text-brand-dark dark:text-white placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-brand-violet/30 transition-all shadow-inner" 
                />
             </div>
             <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
               {[{ id: 'all', label: 'Todos' }, { id: 'doctrine', label: 'Doutrina' }, { id: 'prayer', label: 'Oração' }, { id: 'mass', label: 'Liturgia' }].map(cat => (
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
                  <Heart size={10} fill="currentColor" /> DESTAQUE TEMPORAL
               </div>
               <h2 className="text-2xl sm:text-4xl font-black text-white mb-3 leading-tight tracking-tight drop-shadow-md max-w-lg">
                  {FeaturedItem.title}
               </h2>
               <p className="text-slate-300 text-xs sm:text-base line-clamp-3 mb-6 font-medium leading-relaxed max-w-md">
                  {FeaturedItem.description}
               </p>
               <button className="bg-white text-brand-dark px-6 py-3 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 hover:bg-slate-100 transition-colors shadow-lg hover:scale-105 active:scale-95 duration-300 w-fit">
                  <PlayCircle size={18} fill="currentColor" /> Abrir Guia
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
             <p className="text-slate-500 dark:text-slate-400 max-w-xs mx-auto">Tente buscar por termos como "rosário", "missa" ou "quaresma".</p>
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
