import React, { useState, useMemo } from 'react';
import { BookOpen, ChevronRight, Clock, GraduationCap, Search, Bookmark, Youtube, Music, X, Heart, CloudRain, Shield, Users, Flame, Cross, Mic2, Headphones, Wifi, Footprints, Sparkles, Church, MessageSquare, Moon, Star, Sunrise, Wind } from 'lucide-react';
import { useLiturgicalSeason } from '../hooks/useLiturgicalSeason';

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
  // Épocas litúrgicas em que este track é o destaque — 'all' = sempre visível
  seasons: ('lent' | 'easter' | 'advent' | 'christmas' | 'ordinary' | 'all')[];
}

// --- ACERVO COMPLETO ---
// Tracks sazonais surgem em destaque na época certa.
// Tracks marcados com 'all' são sempre visíveis (formação permanente).
const STATIC_DATA: KnowledgeTrack[] = [
  // ═══════════════════════════════════════
  // TEMPO PASCAL (Páscoa → Pentecostes)
  // ═══════════════════════════════════════
  {
    id: 'track-tempo-pascal',
    title: 'Jornada Pascal — 50 Dias de Aleluia',
    description: 'A Páscoa não é um dia. É uma estação de 50 dias de alegria na Igreja.',
    seasons: ['easter'],
    items: [
      {
        id: 'pascal-50dias',
        title: 'Os 50 Dias que Mudam Tudo',
        description: 'Por que a Páscoa é uma estação inteira, não apenas um domingo.',
        category: 'doctrine',
        duration: '10 min',
        icon: Sunrise,
        videoSuggestion: { title: "O Tempo Pascal explicado", url: "https://www.youtube.com/results?search_query=tempo+pascal+50+dias+significado", channelName: "Padre Paulo Ricardo" },
        musicSuggestion: { title: "Aleluia (Handel)", url: "https://www.youtube.com/results?search_query=hallelujah+handel+messiah", artist: "G. F. Handel" },
        content: `A maioria dos cristãos trata a Páscoa como um único domingo de celebração e depois retorna imediatamente ao ritmo comum da vida. Mas a Igreja pensa diferente: ela dedica cinquenta dias inteiros à comemoração da Ressurreição — o mesmo período que os discípulos passaram entre o sepulcro vazio e a descida do Espírito Santo.\n\nEste período é chamado de Tempo Pascal. Do latim Tempus Paschale, é a estação litúrgica mais alegre do ano, mais longa até que a própria Quaresma. Se dedicamos quarenta dias à penitência e preparação, merecemos ao menos cinquenta à celebração e aprofundamento do mistério que é o centro de toda a fé cristã.\n\nO Aleluia — suprimido durante toda a Quaresma — retorna na Vigília Pascal e ressoa durante cinquenta dias seguidos. A cor litúrgica é o branco dourado, simbolizando a glória da Ressurreição. A saudação dos primeiros cristãos era "Christos Anesti" — "Cristo ressuscitou" — respondida com "Alithos Anesti" — "Em verdade, ressuscitou".\n\nViver o Tempo Pascal é negar o "espiritualismo da derrota" — aquela tristeza que age como se Cristo ainda estivesse no sepulcro. O cristão ressuscitado é aquele que mesmo diante do sofrimento, da injustiça e da morte, mantém no rosto a paz que o mundo não pode dar — porque a vitória definitiva já foi conquistada.`
      },
      {
        id: 'pascal-aparicoes',
        title: 'As Aparições do Ressuscitado',
        description: 'Cinco encontros que revelam como Cristo nos visita ainda hoje.',
        category: 'doctrine',
        duration: '15 min',
        icon: Star,
        videoSuggestion: { title: "Aparições de Cristo Ressuscitado", url: "https://www.youtube.com/results?search_query=aparicoes+de+jesus+ressuscitado+biblia", channelName: "Canção Nova" },
        musicSuggestion: { title: "Ressuscitou", url: "https://www.youtube.com/results?search_query=ressuscitou+musica+pascal+catolica", artist: "Anjos de Resgate" },
        content: `Os Evangelhos registram ao menos onze aparições do Cristo Ressuscitado antes da Ascensão. Cada uma revela um aspecto diferente de como o Senhor continua a encontrar seus discípulos — e como Ele nos encontra hoje.\n\n**Maria Madalena (Jo 20,11-18):** Jesus se aproxima de quem está chorando junto ao sepulcro. A primeira aparição é para a mais ferida, a que mais amou. Ele a chama pelo nome — "Maria!" — e ela imediatamente O reconhece. Lição: Cristo ressuscitado encontra você no meio do luto e das lágrimas, e te chama pelo nome.\n\n**Os discípulos de Emaús (Lc 24,13-35):** Dois discípulos confusos e desanimados caminham de Jerusalém. Jesus caminha ao lado deles, mas eles não O reconhecem. É no partir do pão — a Eucaristia — que os olhos se abrem. Lição: Cristo Ressuscitado está ao nosso lado mesmo quando não O reconhecemos, e Se revela de modo especial na Missa.\n\n**São Tomé (Jo 20,24-29):** O apóstolo da dúvida razoável. Ele não estava presente e se recusa a crer sem provas. Jesus volta oito dias depois especialmente para ele. Lição: a dúvida honesta não afasta Cristo; ela O convida a se aproximar ainda mais.\n\n**A pesca milagrosa (Jo 21,1-14):** Os discípulos voltam a pescar, à vida ordinária, como se tudo tivesse acabado. Cristo os encontra no trabalho de cada dia, nas redes vazias, e a abundância vem com a obediência. Lição: o Ressuscitado entra na nossa vida comum e a transforma por dentro.\n\n**A Ascensão (At 1,9-11):** A última aparição visível. Os discípulos ficam olhando o céu. Os anjos os trazem de volta à terra: "Por que ficais olhando o céu?" A missão é aqui. Lição: a esperança do Céu não nos afasta da terra — nos envia a ela com mais amor.`
      },
      {
        id: 'pascal-aleluia',
        title: 'O Aleluia que a Igreja Suprimiu',
        description: 'Por que esta palavra hebraica guarda o segredo de toda a fé cristã.',
        category: 'prayer',
        duration: '12 min',
        icon: Wind,
        videoSuggestion: { title: "Significado do Aleluia", url: "https://www.youtube.com/results?search_query=significado+aleluia+liturgia+catolica", channelName: "Minuto com Deus" },
        musicSuggestion: { title: "Aleluia — Taizé", url: "https://www.youtube.com/results?search_query=aleluia+taize+pascal", artist: "Taizé" },
        content: `"Aleluia" é uma das poucas palavras hebraicas que atravessou todas as traduções da Bíblia sem ser traduzida. Do hebraico Hallelu-Yah: "Louvai a Yahweh". A Igreja decidiu mantê-la intocada porque há coisas que nenhuma língua humana consegue expressar adequadamente.\n\nDurante toda a Quaresma — quarenta dias — o Aleluia desaparece completamente da liturgia. É um silêncio deliberado, uma suspensão da maior aclamação da história. Os monges medievais chegavam a "enterrar" o Aleluia antes da Quarta-feira de Cinzas, num ritual poético que simbolizava que ele ressuscitaria com Cristo.\n\nE ressuscita. Na Vigília Pascal, no momento mais dramático da liturgia, quando as luzes se acendem e o "Exsultet" é cantado, o Aleluia explode depois de quarenta dias de silêncio. É como se o próprio universo suprisse o ar que estava preso nos pulmões.\n\nCantar Aleluia não é apenas uma expressão de alegria — é uma declaração teológica. É dizer que o sofrimento não tem a última palavra, que a morte foi vencida, que estamos do lado do vencedor. Por isso a Igreja manda que cantemos o Aleluia por cinquenta dias seguidos: para gravar nas entranhas da alma que vivemos numa vitória, não numa derrota.\n\nPrática para o Tempo Pascal: reserve um momento cada manhã para simplesmente dizer ou cantar "Aleluia" — sozinho, em voz alta, com gratidão. Deixe que a palavra milenar ative nele o que as palavras novas às vezes não conseguem.`
      },
      {
        id: 'pascal-pentecostes',
        title: 'Pentecostes: Não Fique Olhando o Céu',
        description: 'Como o fogo do Espírito Santo transforma testemunhas assustadas em missionários.',
        category: 'doctrine',
        duration: '12 min',
        icon: Flame,
        videoSuggestion: { title: "Pentecostes e o Espírito Santo", url: "https://www.youtube.com/results?search_query=pentecostes+significado+espirito+santo+catholico", channelName: "Padre Paulo Ricardo" },
        musicSuggestion: { title: "Vem Espírito Santo", url: "https://www.youtube.com/results?search_query=vem+espirito+santo+musica+catolica", artist: "Com. Shalom" },
        content: `Cinquenta dias após a Páscoa, os discípulos estavam reunidos com Maria no Cenáculo. Lucas descreve o cenário: ainda tinham medo. Ainda estavam "trancados", ainda processando a morte, a ressurreição e a partida de Jesus. Então acontece Pentecostes.\n\nUm vento impetuoso, línguas de fogo, e homens que horas antes se escondiam por medo da perseguição saem pregando em praça pública. Não na mesma língua — em línguas que cada pessoa do mundo presente entendia. Era um sinal: a Boa Nova não pertence a uma cultura, uma língua ou um povo. Ela pertence à humanidade inteira.\n\nO Espírito Santo não veio para dar conforto espiritual particular. Ele veio para equipar para a missão. Pedro, que havia negado Cristo três vezes por medo de uma criada, faz um discurso público que converte três mil pessoas. A transformação não foi de personalidade, mas de fonte: ele parou de depender das próprias forças e passou a depender do Espírito.\n\nPentecostes é o "aniversário da Igreja". É quando a comunidade de discípulos se torna uma comunidade de missionários. A diferença é simples: o discípulo aprende; o missionário transmite. O Espírito Santo não foi dado para você guardar como um tesouro privado, mas para você dar como um dom público.\n\nComo se preparar até Pentecostes: rezar a Novena do Espírito Santo (os 9 dias antes de Pentecostes), participar de uma Missa, e perguntar honestamente: "Em que área da minha vida estou 'trancado'? Onde preciso do fogo do Espírito?"`,
      }
    ]
  },

  // ═══════════════════════════════════════
  // QUARESMA
  // ═══════════════════════════════════════
  {
    id: 'track-quaresma-2026',
    title: 'Jornada Quaresmal',
    description: 'Prepare seu coração para o deserto que floresce.',
    seasons: ['lent'],
    items: [
      {
        id: 'quaresma-inicio',
        title: 'Cinzas: O Novo Início',
        description: 'Por que o dia da sua volta para Deus começa com pó.',
        category: 'doctrine',
        duration: '10 min',
        icon: Footprints,
        videoSuggestion: { title: "O Sentido da Quaresma", url: "https://www.youtube.com/results?search_query=significado+quarta+feira+de+cinzas", channelName: "Minuto com Deus" },
        musicSuggestion: { title: "Pecador, agora é tempo", url: "https://www.youtube.com/results?search_query=pecador+agora+e+tempo+musica", artist: "Tradicional" },
        content: `A Quaresma começa com as cinzas. Este não é apenas um marco no calendário, mas um chamado profundo à metanoia — a mudança de mente e de coração. As cinzas que recebemos sobre a cabeça são um lembrete da nossa finitude ("Lembra-te que és pó"), mas também um sinal de esperança: do pó, Deus pode recriar a vida.\n\nNesta jornada de 40 dias, somos convidados a entrar no deserto com Jesus. O deserto litúrgico não é um lugar de solidão vazia, mas de silêncio fecundo. É onde as vozes do mundo se calam para que a voz do Amado possa ser ouvida. Como ensinava São João da Cruz, "Deus fala no silêncio".\n\nPara que esta Quaresma seja diferente de todas as outras, você precisa de um plano de batalha. A Igreja nos oferece três armas fundamentais: a Oração (que nos liga a Deus), o Jejum (que nos liberta de nós mesmos) e a Esmola (que nos liga ao próximo). Não escolha sacrifícios por vaidade espiritual; escolha aqueles que realmente quebram o seu orgulho e te tornam mais dócil à vontade do Pai.`
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

  // ═══════════════════════════════════════
  // ADVENTO
  // ═══════════════════════════════════════
  {
    id: 'track-advento',
    title: 'Jornada do Advento',
    description: 'Quatro semanas de espera ativa, não de correria.',
    seasons: ['advent'],
    items: [
      {
        id: 'advento-espera',
        title: 'A Arte da Espera Ativa',
        description: 'Como o Advento nos ensina a viver o presente com esperança.',
        category: 'doctrine',
        duration: '10 min',
        icon: Moon,
        videoSuggestion: { title: "O significado do Advento", url: "https://www.youtube.com/results?search_query=significado+advento+tempo+liturgico", channelName: "Padre Paulo Ricardo" },
        musicSuggestion: { title: "Vem Senhor Jesus", url: "https://www.youtube.com/results?search_query=vem+senhor+jesus+musica+advento", artist: "Com. Shalom" },
        content: `O Advento começa com uma palavra que o mundo moderno não gosta: espera. Numa cultura de gratificação imediata, onde qualquer coisa pode ser entregue em horas e qualquer informação acessada em segundos, a Igreja nos pede para sentar, ficar quietos e esperar.\n\nMas é uma espera diferente das filas e dos atrasos — é uma espera ativa, expectante, cheia de desejo. É a espera do noivo que prepara a casa para a amada, do filho que conta os dias para voltar para casa. Os profetas de Israel aguardaram séculos pelo Messias, e foi exatamente essa expectativa de geração em geração que preparou o coração da humanidade para receber o Emmanuel, o Deus-conosco.\n\nO Advento tem quatro domingos, cada um com uma vela acesa no Advento. Esperança, Paz, Alegria, Amor — virtudes que se constroem na obscuridade do inverno como a luz que cresce na escuridão. Não apresse o Natal; deixe o Advento fazer seu trabalho de preparação.`
      },
      {
        id: 'advento-profetas',
        title: 'A Voz dos Profetas',
        description: 'Isaías, João Batista e o grito que atravessa os séculos.',
        category: 'doctrine',
        duration: '12 min',
        icon: Mic2,
        videoSuggestion: { title: "João Batista e o Advento", url: "https://www.youtube.com/results?search_query=joao+batista+advento+preparai+o+caminho", channelName: "Canção Nova" },
        musicSuggestion: { title: "Prepare o Caminho", url: "https://www.youtube.com/results?search_query=preparai+o+caminho+musica+catolica", artist: "Padre Zezinho" },
        content: `"Uma voz clama no deserto: preparai o caminho do Senhor!" (Is 40,3). Estas palavras de Isaías, escritas séculos antes de Cristo, ganham vida na figura de João Batista — o último e o maior dos profetas. O Advento nos coloca diante de duas vozes fundamentais: a de Isaías, que anuncia a vinda do Messias, e a de João Batista, que aponta para Ele com o dedo: "É esse!"\n\nSer profeta no sentido bíblico não é prever o futuro, mas anunciar a verdade de Deus no tempo presente. O profeta é alguém que "vê" com clareza aquilo que os outros não querem enxergar e tem coragem de dizê-lo. João Batista fazia isso tão radicalmente que acabou decapitado por causa da verdade que falou ao rei Herodes.\n\nNo Advento, a Igreja nos convida a nos tornamos também vozes no deserto: a vida dos cristãos deve ser ela própria uma proclamação de que algo novo e definitivo entrou na história da humanidade. Como poderia o seu dia a dia ser uma voz que prepara o caminho do Senhor?`
      }
    ]
  },

  // ═══════════════════════════════════════
  // NATAL
  // ═══════════════════════════════════════
  {
    id: 'track-natal',
    title: 'O Mistério do Natal',
    description: 'O Verbo se fez carne — e habitou entre nós.',
    seasons: ['christmas'],
    items: [
      {
        id: 'natal-encarnacao',
        title: 'A Loucura da Encarnação',
        description: 'Por que Deus escolheu nascer em uma manjedoura.',
        category: 'doctrine',
        duration: '12 min',
        icon: Star,
        videoSuggestion: { title: "A Encarnação explicada", url: "https://www.youtube.com/results?search_query=encarnacao+natal+significado+teologia", channelName: "Padre Paulo Ricardo" },
        musicSuggestion: { title: "Noite Feliz", url: "https://www.youtube.com/results?search_query=noite+feliz+cantata+natal+coral", artist: "Tradicional" },
        content: `O Natal celebra o evento mais improvável da história: o Criador de todo o universo entrou no tempo e no espaço como um bebê humano, dependente, vulnerável, que chorava de fome e precisava que o trocassem. A teologia chama isso de "Encarnação" — do latim carne, carne. O Verbo eterno de Deus se fez carne.\n\nPor que desta forma? Por que não aparecer como um rei triunfante, um general vitorioso ou ao menos um homem adulto e impressionante? Porque Deus queria ser recebido, não temido. Queria entrar pela porta da ternura, não do poder. Um bebê não ameaça ninguém; um bebê convida ao amor.\n\nA manjedoura não foi um acidente logístico — foi uma escolha teológica. Deus nasce onde há animais, feno, barulho e cheiro de estrume, não num templo perfumado de incenso. Ele escolheu o lugar dos excluídos para nascer, para que nenhum ser humano pudesse dizer "esse Deus não entende minha pobreza, minha bagunça, minha condição".`
      }
    ]
  },

  // ═══════════════════════════════════════
  // SEMPRE DISPONÍVEIS (formação permanente)
  // ═══════════════════════════════════════
  {
    id: 'track-duvidas-coracao',
    title: 'Dúvidas de Coração',
    description: 'Respostas para as inquietações da alma peregrina.',
    seasons: ['all'],
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
        content: `Deus raramente fala em trovões; Ele prefere a "brisa leve", como descobriu o profeta Elias. Para ouvi-Lo, o primeiro passo é o silêncio exterior e interior. Mas como saber se é Deus falando ou apenas a nossa imaginação? O discernimento passa por três filtros:\n\n1. A Palavra: Deus nunca dirá algo que contradiga as Escrituras ou o ensinamento da Igreja.\n2. A Paz: A voz de Deus traz uma paz profunda, mesmo que peça algo difícil. A voz do inimigo ou do nosso ego traz agitação e ansiedade.\n3. Os Frutos: O que essa "voz" produz em você? Mais humildade, caridade e paciência? Então, provavelmente, vem do Alto.`
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
        content: `Há dias em que rezar é um deleite, e há dias em que parece que estamos falando com o teto. Essa "aridez" é uma etapa comum e necessária na vida espiritual. No início, Deus nos dá "doces" (consolações) para nos atrair, mas depois Ele os retira para ver se O amamos por quem Ele é, ou apenas pelos sentimentos bons que Ele nos proporciona.\n\nSanta Teresa d'Ávila dizia que a oração não consiste em pensar muito, mas em amar muito. Na secura, o seu "sim" vale o dobro. Continue fiel ao seu horário, mesmo sem sentir nada. É no deserto que a fé amadurece e deixa de ser emocional para se tornar uma decisão da vontade.`
      }
    ]
  },
  {
    id: 'track-santos',
    title: 'Vidas que Inspiram',
    description: 'Conheça os amigos de Deus que caminharam antes de nós.',
    seasons: ['all'],
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
        content: `Muitas vezes pintamos os santos em redomas de vidro, como se nunca tivessem sentido medo, raiva ou cansaço. Mas a verdade é que eles foram homens e mulheres de carne e osso. São Marcos tinha um temperamento difícil; Santa Jane de Chantal lutou contra a depressão; São Camilo de Lellis era viciado em jogos antes da conversão.\n\nA santidade não é a ausência de lutas, mas a persistência em Deus apesar delas. Eles não foram perfeitos, foram fiéis.`
      }
    ]
  },
  {
    id: 'track-beleza-liturgia',
    title: 'Beleza e Liturgia',
    description: 'Descubra o sagrado nos detalhes da nossa fé.',
    seasons: ['all'],
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
        content: `Na Missa, nada é por acaso. O incenso que sobe representa nossas orações elevando-se a Deus. O roxo da Quaresma fala de penitência e espera. Quando o padre mistura uma gota de água no vinho, ele está simbolizando a nossa humanidade sendo mergulhada na divindade de Cristo.\n\nEntender esses sinais transforma a Missa de um rito repetitivo em uma experiência mística. Quando você se ajoelha, não é apenas um gesto físico, mas a sua alma reconhecendo a grandeza do Criador.`
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
        content: `Muitos desistem de ler a Bíblia porque tentam começar pelo Gênesis e param no Levítico. A Bíblia é uma biblioteca, e toda biblioteca precisa de um guia. Para o cristão, o centro de tudo é Jesus. Por isso, comece sempre pelos Evangelhos (Marcos é o mais curto e dinâmico). Depois, siga para os Atos dos Apóstolos. O Antigo Testamento deve ser lido como uma promessa que se cumpre em Cristo.`
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
        content: `O Rosário não é uma repetição mecânica de palavras, mas uma meditação dos mistérios da vida de Cristo através dos olhos de Maria. É o "Evangelho dos humildes". Enquanto nossos lábios dizem a Ave-Maria, nossa mente contempla o nascimento, a paixão e a glória do Senhor.\n\nNossa Senhora prometeu em Fátima que o Rosário é a arma para alcançar a paz. Se você não consegue rezar o Rosário inteiro, comece com um mistério por dia. O importante é a constância e o amor com que cada conta é percorrida.`
      }
    ]
  },
  {
    id: 'track-missa',
    title: 'A Santa Missa',
    description: 'Entenda o mistério do Calvário em cada altar.',
    seasons: ['all'],
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
        content: `A Santa Missa é o centro e o ápice de toda a vida cristã. Nela, o sacrifício único de Cristo no Calvário torna-se presente de forma incruenta sobre o altar. Não estamos meramente "lembrando" de um evento passado; estamos sendo transportados, pelo poder do Espírito Santo, para o pé da Cruz.\n\nNo momento da Consagração, o pão e o vinho deixam de existir em sua substância para darem lugar ao Corpo, Sangue, Alma e Divindade de Nosso Senhor Jesus Cristo. Nunca vá à Missa por obrigação; vá por amor, pois ali está Aquele que te amou até o fim.`
      }
    ]
  },
  {
    id: 'track-escola-oracao',
    title: 'Escola de Oração',
    description: 'Métodos para elevar o coração a Deus.',
    seasons: ['all'],
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
        content: `A Lectio Divina (Leitura Orante) é um método milenar que nos ensina a mastigar a Palavra de Deus até que ela se torne parte de nós. Ela se divide em quatro degraus:\n\n1. **Lectio (Leitura):** O que o texto diz em si?\n2. **Meditatio (Meditação):** O que o texto diz para mim hoje?\n3. **Oratio (Oração):** O que eu digo a Deus a partir do que li?\n4. **Contemplatio (Contemplação):** Silencie. Descanse na presença de Deus.\n\nAtravés da Lectio Divina, permitimos que Deus tome a iniciativa e nos conduza pelas estradas da Sua vontade.`
      }
    ]
  }
];

// Cor do header/acento por season
const SEASON_ACCENT: Record<string, string> = {
  easter:   'text-amber-400',
  lent:     'text-brand-violet',
  advent:   'text-violet-400',
  christmas:'text-amber-300',
  ordinary: 'text-emerald-400',
};
const SEASON_BG: Record<string, string> = {
  easter:   'bg-amber-500/10 border-amber-500/20',
  lent:     'bg-brand-violet/10 border-brand-violet/20',
  advent:   'bg-violet-500/10 border-violet-500/20',
  christmas:'bg-amber-500/10 border-amber-500/20',
  ordinary: 'bg-emerald-500/10 border-emerald-500/20',
};
const SEASON_BTN: Record<string, string> = {
  easter:   'bg-amber-500 text-white shadow-amber-500/20',
  lent:     'bg-brand-violet text-white shadow-brand-violet/20',
  advent:   'bg-violet-600 text-white shadow-violet-500/20',
  christmas:'bg-amber-500 text-white shadow-amber-500/20',
  ordinary: 'bg-emerald-600 text-white shadow-emerald-500/20',
};

const KnowledgeBase: React.FC = () => {
  const season = useLiturgicalSeason();
  const [selectedItem, setSelectedItem] = useState<KnowledgeItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<'all' | 'doctrine' | 'prayer' | 'mass'>('all');

  const accentText  = SEASON_ACCENT[season.id] ?? 'text-brand-violet';
  const accentBg    = SEASON_BG[season.id]     ?? 'bg-brand-violet/10 border-brand-violet/20';
  const accentBtn   = SEASON_BTN[season.id]    ?? 'bg-brand-violet text-white shadow-brand-violet/20';

  // Separar track sazonal do restante
  const { featuredTrack, otherTracks } = useMemo(() => {
    const seasonal = STATIC_DATA.filter(t => t.seasons.includes(season.id));
    const always   = STATIC_DATA.filter(t => t.seasons.includes('all'));
    const featured = seasonal[0] ?? null;
    return { featuredTrack: featured, otherTracks: always };
  }, [season.id]);

  const filteredOther = useMemo(() => {
    return otherTracks.map(track => ({
      ...track,
      items: track.items.filter(item => {
        const matchesSearch   = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                item.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
        return matchesSearch && matchesCategory;
      })
    })).filter(track => track.items.length > 0);
  }, [searchQuery, activeCategory, otherTracks]);

  const filteredFeatured = useMemo(() => {
    if (!featuredTrack) return null;
    const items = featuredTrack.items.filter(item => {
      const matchesSearch   = !searchQuery || item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              item.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
    return items.length > 0 ? { ...featuredTrack, items } : null;
  }, [searchQuery, activeCategory, featuredTrack]);

  const renderCard = (item: KnowledgeItem) => (
    <div
      key={item.id}
      onClick={() => setSelectedItem(item)}
      className="min-w-[280px] sm:min-w-0 group bg-white dark:bg-[#1A1F26] rounded-[2.5rem] border border-slate-100 dark:border-white/5 p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer snap-center"
    >
      <div className="flex items-start justify-between mb-6">
        <div className={accentText}><item.icon size={32} strokeWidth={1.5} /></div>
        <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-50 dark:bg-white/5 rounded-full text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          <Clock size={12} />{item.duration}
        </div>
      </div>
      <h3 className="text-lg font-bold text-brand-dark dark:text-white mb-2 group-hover:text-brand-violet transition-colors leading-tight">{item.title}</h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed">{item.description}</p>
      <div className="mt-8 flex items-center justify-between pt-5 border-t border-slate-50 dark:border-white/5">
        <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${accentText}`}>Ler agora</span>
        <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${accentBg} group-hover:${accentBtn}`}>
          <ChevronRight size={20} />
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black/20 pb-32 animate-fade-in">
      {/* Header */}
      <div className="bg-white dark:bg-[#1A1F26] border-b border-slate-100 dark:border-white/5 pt-12 pb-8 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              {/* Badge litúrgico */}
              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold mb-3 border ${accentBg} ${accentText}`}>
                <span>{season.seasonBadge}</span>
                {season.totalDays <= 55 && (
                  <span className="opacity-70">• Dia {season.daysIntoSeason}/{season.totalDays}</span>
                )}
              </div>
              <h1 className="text-3xl font-extrabold text-brand-dark dark:text-white mb-2 flex items-center gap-3">
                <BookOpen className={accentText} /> Biblioteca da Fé
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
              { id: 'all',      label: 'Tudo',    icon: Sparkles     },
              { id: 'doctrine', label: 'Doutrina', icon: GraduationCap },
              { id: 'prayer',   label: 'Oração',   icon: Heart        },
              { id: 'mass',     label: 'Missa',    icon: Church       },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id as any)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap shadow-lg ${
                  activeCategory === cat.id ? accentBtn : 'bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 hover:bg-slate-200 shadow-none'
                }`}
              >
                <cat.icon size={16} />{cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 mt-10 space-y-16">
        {/* ── DESTAQUE SAZONAL ── */}
        {filteredFeatured && (
          <div className="animate-slide-up">
            <div className={`rounded-3xl border p-6 mb-8 ${accentBg}`}>
              <div className="flex items-center gap-3 mb-1">
                <span className={`text-xs font-black uppercase tracking-widest ${accentText}`}>
                  EM DESTAQUE — {season.seasonBadge}
                </span>
                {season.daysUntilNext > 0 && (
                  <span className="text-xs text-slate-400">{season.daysUntilNext} dias até {season.nextSeasonName}</span>
                )}
              </div>
              <h2 className="text-xl font-black text-brand-dark dark:text-white tracking-tight">{filteredFeatured.title}</h2>
              <p className="text-sm text-slate-500 mt-1">{filteredFeatured.description}</p>
            </div>
            <div className="flex overflow-x-auto pb-8 -mx-6 px-6 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-6 scrollbar-hide snap-x">
              {filteredFeatured.items.map(renderCard)}
            </div>
          </div>
        )}

        {/* ── FORMAÇÃO PERMANENTE ── */}
        {filteredOther.length === 0 && !filteredFeatured ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-slate-100 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="text-slate-300" size={32} />
            </div>
            <h3 className="text-lg font-bold text-brand-dark dark:text-white">Nenhum conteúdo encontrado</h3>
            <p className="text-slate-500">Tente buscar por outros termos ou categorias.</p>
          </div>
        ) : (
          filteredOther.map((track) => (
            <div key={track.id} className="animate-slide-up">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-black text-brand-dark dark:text-white tracking-tight">{track.title}</h2>
                  <p className="text-sm text-slate-500 font-medium">{track.description}</p>
                </div>
              </div>
              <div className="flex overflow-x-auto pb-8 -mx-6 px-6 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-6 scrollbar-hide snap-x">
                {track.items.map(renderCard)}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Detail Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-brand-dark/80 backdrop-blur-md animate-fade-in" onClick={() => setSelectedItem(null)} />
          <div className="relative w-full max-w-3xl bg-white dark:bg-[#1A1F26] rounded-[2.5rem] shadow-2xl overflow-hidden animate-slide-up flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className={`relative h-48 sm:h-64 overflow-hidden shrink-0 bg-gradient-to-br ${season.colorGradient.replace('from-', 'from-').replace('to-brand-dark', 'to-[#1A1625]')}`}>
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
              <div className="absolute inset-0 flex items-center justify-center opacity-20">
                <selectedItem.icon size={120} strokeWidth={1} className="text-white" />
              </div>
              <button onClick={() => setSelectedItem(null)} className="absolute top-6 right-6 z-20 w-10 h-10 bg-black/20 backdrop-blur-md text-white rounded-full flex items-center justify-center hover:bg-black/40 transition-all">
                <X size={20} />
              </button>
              <div className="absolute bottom-8 left-8 right-8 z-20">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-3 py-1 bg-white/20 text-white text-[10px] font-black uppercase tracking-widest rounded-full">
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
                <a href={selectedItem.videoSuggestion.url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-4 p-4 bg-red-50 dark:bg-red-500/10 rounded-2xl border border-red-100 dark:border-red-500/20 hover:scale-[1.02] transition-all">
                  <div className="w-12 h-12 bg-red-500 text-white rounded-xl flex items-center justify-center shadow-lg shadow-red-500/20">
                    <Youtube size={24} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-red-500 uppercase tracking-widest">Vídeo Sugerido</p>
                    <p className="text-sm font-bold text-brand-dark dark:text-white truncate max-w-[180px]">{selectedItem.videoSuggestion.title}</p>
                  </div>
                </a>
                <a href={selectedItem.musicSuggestion.url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-4 p-4 bg-blue-50 dark:bg-blue-500/10 rounded-2xl border border-blue-100 dark:border-blue-500/20 hover:scale-[1.02] transition-all">
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
              <button className={`px-8 py-3 rounded-xl font-bold text-sm shadow-lg hover:scale-105 active:scale-95 transition-all ${accentBtn}`}>
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