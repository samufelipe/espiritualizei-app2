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

// --- ACERVO COMPLETO BLINDADO ---
// Este acervo é a base do app e não deve ser removido.
// Novos temas litúrgicos semanais são adicionados aqui sem excluir os anteriores.
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
      },
      {
        id: 'jejum-agrada-deus',
        title: 'O Jejum que Agrada a Deus',
        description: 'Diferença entre dieta e sacrifício espiritual real.',
        category: 'prayer',
        duration: '12 min',
        icon: Flame,
        videoSuggestion: { title: "Como jejuar corretamente", url: "https://www.youtube.com/results?search_query=como+fazer+jejum+catolico", channelName: "Padre Paulo Ricardo" },
        musicSuggestion: { title: "Attende Domine", url: "https://www.youtube.com/results?search_query=attende+domine+gregoriano", artist: "Canto Gregoriano" },
        content: `Muitas vezes confundimos o jejum cristão com uma simples restrição alimentar ou dieta. No entanto, o jejum espiritual tem um propósito muito mais profundo: ele serve para "domar" a nossa vontade e abrir espaço para a fome de Deus. Quando sentimos o vazio no estômago, somos lembrados de que "nem só de pão vive o homem".\n\nO verdadeiro jejum deve ser acompanhado de caridade. Se você economiza dinheiro deixando de comer algo, esse valor deve ser destinado a quem passa fome. Caso contrário, é apenas economia, não sacrifício. Além disso, o jejum deve nos tornar mais pacientes e dóceis, não irritados. Se o seu jejum faz você tratar mal as pessoas ao seu redor, é melhor comer e trabalhar a sua humildade.`
      },
      {
        id: 'vencendo-tentacoes',
        title: 'Vencendo as Tentações',
        description: 'Como lidar com a ira e a preguiça no cotidiano.',
        category: 'doctrine',
        duration: '15 min',
        icon: Shield,
        videoSuggestion: { title: "Combate Espiritual", url: "https://www.youtube.com/results?search_query=combate+espiritual+tentacoes", channelName: "Padre Leonardo Holtz" },
        musicSuggestion: { title: "Agnus Dei", url: "https://www.youtube.com/results?search_query=agnus+dei+catolico", artist: "Tradicional" },
        content: `As tentações não acontecem apenas em grandes dilemas morais, mas nas pequenas frestas do nosso dia. A preguiça de acordar no horário, a ira no trânsito, a fofoca disfarçada de "preocupação". Na Quaresma, essas batalhas se intensificam porque estamos tentando subir a montanha.\n\nA estratégia dos santos para vencer a tentação é a vigilância. Santo Agostinho dizia que o inimigo é como um cão acorrentado: ele só morde quem se aproxima demais. Identifique os seus gatilhos. Se você sabe que certas conversas te levam ao pecado, evite-as. Se o cansaço te torna impaciente, reze antes de chegar em casa. A vitória não vem da nossa força, mas da nossa docilidade em pedir socorro a Deus no exato momento da prova.`
      }
    ]
  },
  {
    id: 'track-duvidas-coracao',
    title: 'Dúvidas de Coração',
    description: 'Respostas para as inquietações da alma peregrina.',
    items: [
      {
        id: 'por-que-rezar',
        title: 'Por que rezar se Deus já sabe?',
        description: 'A teologia da oração explicada com simplicidade.',
        category: 'doctrine',
        duration: '10 min',
        icon: MessageSquare,
        videoSuggestion: { title: "Por que rezar?", url: "https://www.youtube.com/results?search_query=por+que+rezar+se+deus+sabe+tudo", channelName: "Padre Paulo Ricardo" },
        musicSuggestion: { title: "Oração de São Francisco", url: "https://www.youtube.com/results?search_query=oracao+de+sao+francisco+musica", artist: "Fagner" },
        content: `Se Deus é onisciente e sabe do que precisamos antes mesmo de pedirmos, por que Ele insiste na oração? A resposta é simples e profunda: Deus não precisa da nossa oração, mas nós precisamos dela. A oração não serve para mudar a mente de Deus, mas para mudar o nosso coração e nos tornar capazes de receber o que Ele já quer nos dar.\n\nRezar é cultivar um relacionamento. Imagine um filho que nunca fala com o pai porque "o pai já sabe que eu o amo". O relacionamento esfriaria. A oração dilata a nossa alma, cria intimidade e nos sintoniza com a vontade divina. É no diálogo orante que deixamos de ser escravos do medo para nos tornarmos filhos da confiança.`
      },
      {
        id: 'ouvir-voz-deus',
        title: 'Como ouvir a voz de Deus?',
        description: 'Técnicas de discernimento para o barulho moderno.',
        category: 'prayer',
        duration: '15 min',
        icon: Headphones,
        videoSuggestion: { title: "Como discernir a voz de Deus", url: "https://www.youtube.com/results?search_query=como+ouvir+a+voz+de+deus+catolico", channelName: "Comunidade Shalom" },
        musicSuggestion: { title: "Voz de Deus", url: "https://www.youtube.com/results?search_query=musica+voz+de+deus+instrumental", artist: "Suave" },
        content: `Deus raramente fala em trovões; Ele prefere a "brisa leve", como descobriu o profeta Elias. Para ouvi-Lo, o primeiro passo é o silêncio exterior e interior. Mas como saber se é Deus falando ou apenas a nossa imaginação? O discernimento passa por três filtros:\n\n1. A Palavra: Deus nunca dirá algo que contradiga as Escrituras ou o ensinamento da Igreja.\n2. A Paz: A voz de Deus traz uma paz profunda, mesmo que peça algo difícil. A voz do inimigo ou do nosso ego traz agitação e ansiedade.\n3. Os Frutos: O que essa "voz" produz em você? Mais humildade, caridade e paciência? Então, provavelmente, vem do Alto. Aprenda a ler os sinais nos acontecimentos e nas moções do seu coração durante a oração silenciosa.`
      },
      {
        id: 'oracao-seca',
        title: 'Quando a oração parece seca',
        description: 'Lidando com a desolação sem desistir do caminho.',
        category: 'prayer',
        duration: '12 min',
        icon: CloudRain,
        videoSuggestion: { title: "Aridez Espiritual", url: "https://www.youtube.com/results?search_query=aridez+espiritual+como+lidar", channelName: "Padre Paulo Ricardo" },
        musicSuggestion: { title: "Nada te turbe", url: "https://www.youtube.com/results?search_query=nada+te+turbe+taize", artist: "Taizé" },
        content: `Há dias em que rezar é um deleite, e há dias em que parece que estamos falando com o teto. Essa "aridez" é uma etapa comum e necessária na vida espiritual. No início, Deus nos dá "doces" (consolações) para nos atrair, mas depois Ele os retira para ver se O amamos por quem Ele é, ou apenas pelos sentimentos bons que Ele nos proporciona.\n\nSanta Teresa d'Ávila dizia que a oração não consiste em pensar muito, mas em amar muito. Na secura, o seu "sim" vale o dobro. Continue fiel ao seu horário, mesmo sem sentir nada. É no deserto que a fé amadurece e deixa de ser emocional para se tornar uma decisão da vontade. Não desista; o sol continua lá, mesmo atrás das nuvens.`
      }
    ]
  },
  {
    id: 'track-santos',
    title: 'Vidas que Inspiram',
    description: 'Conheça os amigos de Deus que caminharam antes de nós.',
    items: [
      {
        id: 'santo-agostinho',
        title: 'Santo Agostinho',
        description: 'Da busca inquieta ao repouso em Deus.',
        category: 'doctrine',
        duration: '12 min',
        icon: Heart,
        videoSuggestion: { title: "A Vida de Santo Agostinho", url: "https://www.youtube.com/results?search_query=vida+de+santo+agostinho", channelName: "Padre Paulo Ricardo" },
        musicSuggestion: { title: "Tarde te amei", url: "https://www.youtube.com/results?search_query=musica+tarde+te+amei", artist: "Com. Shalom" },
        content: `"Tarde te amei, ó Beleza tão antiga e tão nova, tarde te amei!" Estas palavras de Santo Agostinho resumem a jornada de uma alma que buscou a felicidade em todas as coisas criadas, até descobrir que seu coração só repousaria quando encontrasse o Criador. Agostinho nos ensina que não importa quão longe tenhamos ido, a misericórdia de Deus é sempre maior e está à nossa espera.`
      },
      {
        id: 'santa-teresinha',
        title: 'Santa Teresinha',
        description: 'A Pequena Via da infância espiritual.',
        category: 'prayer',
        duration: '10 min',
        icon: Sparkles,
        videoSuggestion: { title: "A Pequena Via de Teresinha", url: "https://www.youtube.com/results?search_query=santa+teresinha+pequena+via", channelName: "Minuto com Deus" },
        musicSuggestion: { title: "Só por amor", url: "https://www.youtube.com/results?search_query=musica+santa+teresinha", artist: "Com. Shalom" },
        content: `Santa Teresinha do Menino Jesus revolucionou a espiritualidade moderna com sua "Pequena Via". Ela nos ensina que a santidade não consiste em realizar obras grandiosas, mas em fazer as pequenas coisas do dia a dia com um amor extraordinário. Para Teresinha, ser santo é ser como uma criança nos braços do Pai: confiante, simples e totalmente dependente da Sua graça.`
      },
      {
        id: 'santos-humanos',
        title: 'Santos "Gente como a Gente"',
        description: 'Lutas modernas de quem alcançou o céu.',
        category: 'doctrine',
        duration: '15 min',
        icon: Users,
        videoSuggestion: { title: "Santos e suas fraquezas", url: "https://www.youtube.com/results?search_query=santos+que+tiveram+depressao+ou+ansiedade", channelName: "Canção Nova" },
        musicSuggestion: { title: "Hino dos Santos", url: "https://www.youtube.com/results?search_query=musica+todos+os+santos", artist: "Tradicional" },
        content: `Muitas vezes pintamos os santos em redomas de vidro, como se nunca tivessem sentido medo, raiva ou cansaço. Mas a verdade é que eles foram homens e mulheres de carne e osso. São Marcos tinha um temperamento difícil; Santa Jane de Chantal lutou contra a depressão; São Camilo de Lellis era viciado em jogos antes da conversão.\n\nA santidade não é a ausência de lutas, mas a persistência em Deus apesar delas. Eles não foram perfeitos, foram fiéis. Conhecer o lado humano dos santos nos dá esperança: se Deus fez maravilhas na fraqueza deles, também pode fazer na nossa. Você não precisa ser um anjo para começar o caminho; precisa apenas ser um pecador que não desiste de ser amado.`
      }
    ]
  },
  {
    id: 'track-beleza-liturgia',
    title: 'Beleza e Liturgia',
    description: 'Descubra o sagrado nos detalhes da nossa fé.',
    items: [
      {
        id: 'simbolos-missa',
        title: 'Símbolos que você não vê',
        description: 'O significado das cores, incenso e gestos.',
        category: 'mass',
        duration: '10 min',
        icon: Sparkles,
        videoSuggestion: { title: "Significado dos Símbolos Litúrgicos", url: "https://www.youtube.com/results?search_query=simbolos+da+missa+significado", channelName: "Minuto com Deus" },
        musicSuggestion: { title: "Kyrie Eleison", url: "https://www.youtube.com/results?search_query=kyrie+eleison+gregoriano", artist: "Tradicional" },
        content: `Na Missa, nada é por acaso. O incenso que sobe representa nossas orações elevando-se a Deus. O roxo da Quaresma fala de penitência e espera. Quando o padre mistura uma gota de água no vinho, ele está simbolizando a nossa humanidade sendo mergulhada na divindade de Cristo.\n\nEntender esses sinais transforma a Missa de um rito repetitivo em uma experiência mística. Quando você se ajoelha, não é apenas um gesto físico, mas a sua alma reconhecendo a grandeza do Criador. Ao bater no peito no "Confesso", você está despertando o seu coração para a necessidade de cura. A liturgia é uma linguagem de amor que fala aos nossos sentidos para alcançar o nosso espírito.`
      },
      {
        id: 'ler-biblia',
        title: 'Como ler a Bíblia sem se perder',
        description: 'Um mapa para começar pelos Evangelhos.',
        category: 'doctrine',
        duration: '12 min',
        icon: BookOpen,
        videoSuggestion: { title: "Como começar a ler a Bíblia", url: "https://www.youtube.com/results?search_query=como+ler+a+biblia+catolico+por+onde+comecar", channelName: "Padre Paulo Ricardo" },
        musicSuggestion: { title: "Tua Palavra", url: "https://www.youtube.com/results?search_query=musica+tua+palavra+e+luz", artist: "Aline Barros" },
        content: `Muitos desistem de ler a Bíblia porque tentam começar pelo Gênesis e param no Levítico. A Bíblia é uma biblioteca, e toda biblioteca precisa de um guia. Para o cristão, o centro de tudo é Jesus. Por isso, comece sempre pelos Evangelhos (Marcos é o mais curto e dinâmico).\n\nDepois, siga para os Atos dos Apóstolos para ver a Igreja nascendo. Só então mergulhe nos Salmos para aprender a rezar com todas as emoções humanas. O Antigo Testamento deve ser lido como uma promessa que se cumpre em Cristo. Não tenha pressa de terminar; tenha sede de encontrar. Use uma boa tradução e, se possível, uma Bíblia de estudos para entender o contexto histórico e teológico.`
      },
      {
        id: 'poder-rosario',
        title: 'O Poder do Rosário',
        description: 'Por que esta oração ainda é a arma mais poderosa.',
        category: 'prayer',
        duration: '15 min',
        icon: Cross,
        videoSuggestion: { title: "O Poder do Santo Terço", url: "https://www.youtube.com/results?search_query=por+que+rezar+o+terço+todos+os+dias", channelName: "Padre Paulo Ricardo" },
        musicSuggestion: { title: "Maria de Nazaré", url: "https://www.youtube.com/results?search_query=musica+maria+de+nazare", artist: "Padre Zezinho" },
        content: `O Rosário não é uma repetição mecânica de palavras, mas uma meditação dos mistérios da vida de Cristo através dos olhos de Maria. É o "Evangelho dos humildes". Enquanto nossos lábios dizem a Ave-Maria, nossa mente contempla o nascimento, a paixão e a glória do Senhor.\n\nNossa Senhora prometeu em Fátima que o Rosário é a arma para alcançar a paz. Ele acalma a mente, disciplina o coração e nos coloca sob a proteção materna da Rainha do Céu. Se você não consegue rezar o Rosário inteiro, comece com um mistério (uma dezena) por dia. O importante é a constância e o amor com que cada conta é percorrida.`
      },
      {
        id: 'domingo-familia',
        title: 'Viver o Domingo em Família',
        description: 'Como santificar o dia do Senhor na correria.',
        category: 'mass',
        duration: '10 min',
        icon: Moon,
        videoSuggestion: { title: "Como santificar o Domingo", url: "https://www.youtube.com/results?search_query=como+viver+o+domingo+em+familia+catolico", channelName: "Família Católica" },
        musicSuggestion: { title: "Dia do Senhor", url: "https://www.youtube.com/results?search_query=musica+dia+do+senhor", artist: "Com. Shalom" },
        content: `O Domingo não é apenas o "fim de semana", é o Dia do Senhor, o oitavo dia da criação. Santificá-lo vai além de ir à Missa. Significa fazer desse dia um tempo de repouso sagrado, de convívio familiar e de caridade.\n\nEvite trabalhos desnecessários e compras que poderiam ser feitas em outro dia. Prepare um almoço especial, desligue as telas e dedique tempo real aos seus filhos, pais ou cônjuge. O descanso dominical é um ato de rebeldia contra o mundo que nos quer transformar em máquinas de produção. É o dia em que lembramos que somos filhos amados de Deus, destinados à eternidade.`
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
              { id: 'prayer', label: 'Oração', icon: Heart },
              { id: 'mass', label: 'Missa', icon: Church },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id as any)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
                  activeCategory === cat.id 
                    ? 'bg-brand-violet text-white shadow-lg shadow-brand-violet/20' 
                    : 'bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 hover:bg-slate-200'
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
      <div className="max-w-6xl mx-auto px-6 mt-10">
        {filteredTracks.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-slate-100 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="text-slate-300" size={32} />
            </div>
            <h3 className="text-lg font-bold text-brand-dark dark:text-white">Nenhum conteúdo encontrado</h3>
            <p className="text-slate-500">Tente buscar por outros termos ou categorias.</p>
          </div>
        ) : (
          <div className="space-y-12">
            {filteredTracks.map((track) => (
              <div key={track.id} className="animate-slide-up">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-black text-brand-dark dark:text-white tracking-tight">{track.title}</h2>
                    <p className="text-sm text-slate-500 font-medium">{track.description}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {track.items.map((item) => (
                    <div 
                      key={item.id}
                      onClick={() => setSelectedItem(item)}
                      className="group bg-white dark:bg-[#1A1F26] rounded-[2rem] border border-slate-100 dark:border-white/5 p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="text-brand-violet">
                          <item.icon size={28} strokeWidth={1.5} />
                        </div>
                        <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-50 dark:bg-white/5 rounded-full text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          <Clock size={12} />
                          {item.duration}
                        </div>
                      </div>
                      <h3 className="text-lg font-bold text-brand-dark dark:text-white mb-2 group-hover:text-brand-violet transition-colors">{item.title}</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">{item.description}</p>
                      
                      <div className="mt-6 flex items-center justify-between">
                        <span className="text-[10px] font-black text-brand-violet uppercase tracking-[0.2em]">Ler agora</span>
                        <div className="w-8 h-8 rounded-xl bg-brand-violet/10 text-brand-violet flex items-center justify-center group-hover:bg-brand-violet group-hover:text-white transition-all">
                          <ChevronRight size={18} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-brand-dark/80 backdrop-blur-md animate-fade-in" onClick={() => setSelectedItem(null)} />
          <div className="relative w-full max-w-3xl bg-white dark:bg-[#1A1F26] rounded-[2.5rem] shadow-2xl overflow-hidden animate-slide-up flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="relative h-48 sm:h-64 bg-brand-violet overflow-hidden shrink-0">
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
              <div className="absolute inset-0 flex items-center justify-center opacity-20">
                <selectedItem.icon size={120} strokeWidth={1} className="text-white" />
              </div>
              <button 
                onClick={() => setSelectedItem(null)}
                className="absolute top-6 right-6 z-20 w-10 h-10 bg-black/20 backdrop-blur-md text-white rounded-full flex items-center justify-center hover:bg-black/40 transition-all"
              >
                <X size={20} />
              </button>
              <div className="absolute bottom-8 left-8 right-8 z-20">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-3 py-1 bg-brand-violet text-white text-[10px] font-black uppercase tracking-widest rounded-full">
                    {selectedItem.category === 'doctrine' ? 'Doutrina' : selectedItem.category === 'prayer' ? 'Oração' : 'Missa'}
                  </span>
                  <span className="text-white/80 text-xs font-medium flex items-center gap-1">
                    <Clock size={12} /> {selectedItem.duration} de leitura
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">{selectedItem.title}</h2>
              </div>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-8 sm:p-10 no-scrollbar">
              <div className="prose prose-slate dark:prose-invert max-w-none">
                {selectedItem.content.split('\n\n').map((paragraph, idx) => (
                  <p key={idx} className="text-slate-600 dark:text-slate-300 text-base sm:text-lg leading-relaxed mb-6 font-medium">
                    {paragraph}
                  </p>
                ))}
              </div>

              {/* Suggestions */}
              <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <a 
                  href={selectedItem.videoSuggestion.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 p-4 bg-red-50 dark:bg-red-500/10 rounded-2xl border border-red-100 dark:border-red-500/20 group hover:scale-[1.02] transition-all"
                >
                  <div className="w-12 h-12 bg-red-500 text-white rounded-xl flex items-center justify-center shadow-lg shadow-red-500/20">
                    <Youtube size={24} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-red-500 uppercase tracking-widest">Vídeo Sugerido</p>
                    <p className="text-sm font-bold text-brand-dark dark:text-white truncate max-w-[180px]">{selectedItem.videoSuggestion.title}</p>
                  </div>
                </a>

                <a 
                  href={selectedItem.musicSuggestion.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 p-4 bg-blue-50 dark:bg-blue-500/10 rounded-2xl border border-blue-100 dark:border-blue-500/20 group hover:scale-[1.02] transition-all"
                >
                  <div className="w-12 h-12 bg-blue-500 text-white rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                    <Music size={24} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Música para Orar</p>
                    <p className="text-sm font-bold text-brand-dark dark:text-white truncate max-w-[180px]">{selectedItem.musicSuggestion.title}</p>
                  </div>
                </a>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-slate-100 dark:border-white/5 flex items-center justify-between bg-slate-50/50 dark:bg-black/20">
              <button className="flex items-center gap-2 text-slate-500 font-bold text-sm hover:text-brand-violet transition-colors">
                <Bookmark size={18} /> Salvar nos favoritos
              </button>
              <button className="bg-brand-violet text-white px-8 py-3 rounded-xl font-bold text-sm shadow-lg shadow-brand-violet/20 hover:scale-105 active:scale-95 transition-all">
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
