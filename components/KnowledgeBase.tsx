
import React, { useState, useMemo, useRef } from 'react';
import { BookOpen, PlayCircle, CheckCircle2, ChevronLeft, ChevronRight, Clock, GraduationCap, Search, Bookmark, Share2, Sparkles, Youtube, Music, ExternalLink, X, Heart, Sun, CloudRain, Shield, Anchor, Users, Flame, Cross, Eye, Mic2, Headphones, Wifi, Globe, PenTool, Activity } from 'lucide-react';
import BrandLogo from './BrandLogo';

// --- TIPOS LOCAIS ---
interface KnowledgeItem {
  id: string;
  title: string;
  description: string;
  content: string; // Rich text without robotic markdown
  category: 'doctrine' | 'prayer' | 'mass';
  duration: string;
  icon: React.ElementType; // Icon component
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

Sua famosa medalha e sua oração de exorcismo ("A Cruz Sagrada seja a minha luz") nos lembram também que a vida espiritual é um combate. O demônio odeia a ordem e ama a confusão. Quando organizamos nossa vida, quando cumprimos nossos deveres de estado com pontualidade e amor, estamos expulsando o mal de nossas casas.

Neste aplicativo, bebemos da fonte de São Bento. Acreditamos que organizar sua rotina de oração é o primeiro passo para organizar sua alma.`
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
      },
      {
        id: 'teresinha-full',
        title: 'Teresinha: A Pequena Via',
        description: 'Como ser grande fazendo coisas pequenas com amor.',
        category: 'prayer',
        duration: '12 min',
        icon: Heart,
        videoSuggestion: { title: "A Pequena Via", url: "https://www.youtube.com/results?search_query=pequena+via+santa+teresinha", channelName: "Carmelo" },
        musicSuggestion: { title: "Viver de Amor", url: "https://www.youtube.com/results?search_query=viver+de+amor+comunidade+shalom", artist: "Shalom" },
        content: `
Teresinha do Menino Jesus nunca fundou grandes obras, nunca viajou para missões distantes (embora desejasse) e morreu jovem, desconhecida do mundo, dentro de um carmelo. No entanto, ela é Doutora da Igreja e Padroeira das Missões. Qual é o seu segredo?

Ela descobriu a "Pequena Via". Teresinha percebeu que não tinha forças para as grandes mortificações dos antigos santos. Sentia-se pequena demais para escalar a montanha da santidade. Então, ela encontrou na Bíblia uma chave: "Se alguém é pequenino, venha a mim".

A Pequena Via consiste em fazer as coisas mais ordinárias do dia a dia com um amor extraordinário. É sorrir para a irmã que é desagradável, é dobrar os guardanapos com perfeição por amor a Jesus, é não reclamar do frio ou da comida. É transformar cada minúsculo detalhe da vida em uma oferta de amor.

Ela dizia: "Não é o valor de nossas obras que agrada a Deus, mas o amor com que as fazemos". Isso é libertador! Não precisamos realizar feitos heróicos aos olhos do mundo. Podemos ser santos trocando fraldas, estudando para uma prova ou pegando ônibus, desde que o façamos com o coração voltado para Deus.

Teresinha nos ensina a confiança cega na misericórdia de Deus. Ela se via como uma criancinha que, não conseguindo subir a escada, espera no degrau de baixo até que o Pai (Deus) desça para pegá-la no colo. Essa é a santidade acessível a todos nós.`
      },
      {
        id: 'agostinho-full',
        title: 'Agostinho: Coração Inquieto',
        description: 'A busca da verdade e a conversão intelectual.',
        category: 'doctrine',
        duration: '15 min',
        icon: Flame,
        videoSuggestion: { title: "Conversão de Agostinho", url: "https://www.youtube.com/results?search_query=conversao+santo+agostinho", channelName: "Felipe Aquino" },
        musicSuggestion: { title: "Tarde te amei", url: "https://www.youtube.com/results?search_query=tarde+te+amei+musica", artist: "Vários" },
        content: `
Santo Agostinho é o padroeiro de todos nós que, algum dia, procuramos a felicidade nos lugares errados. Ele foi um jovem brilhante, apaixonado, que buscou preencher o vazio do seu coração com festas, romances, filosofias estranhas e sucesso profissional.

Sua oração, antes da conversão, é famosa pela honestidade brutal: "Senhor, dai-me castidade... mas não agora!". Ele queria Deus, mas ainda estava apegado aos prazeres do mundo.

Mas Agostinho tinha uma mãe que rezava. Santa Mônica chorou por ele durante décadas. E ele tinha um coração que não se contentava com pouco. "Inquieto está o nosso coração enquanto não repousa em Ti", escreveria ele mais tarde.

Sua conversão não foi apenas emocional, foi intelectual. Ele precisou entender que a Verdade não é uma ideia, é uma Pessoa: Jesus Cristo. Quando finalmente se rendeu, sua vida explodiu em santidade e sabedoria, tornando-se um dos maiores teólogos da história.

Agostinho nos ensina que nunca é tarde para amar a Deus. "Tarde te amei, ó Beleza tão antiga e tão nova!", lamentou ele. Mas esse amor tardio foi tão intenso que marcou a Igreja para sempre. Ele é a prova de que Deus pode pegar os cacos de uma vida desregrada e construir uma catedral de santidade.`
      },
      {
        id: 'teresa-avila-full',
        title: 'Teresa D\'Ávila: Castelo Interior',
        description: 'A oração como amizade e a determinação de nunca parar.',
        category: 'prayer',
        duration: '16 min',
        icon: PenTool,
        videoSuggestion: { title: "Castelo Interior", url: "https://www.youtube.com/results?search_query=castelo+interior+santa+teresa", channelName: "Carmelo Descalço" },
        musicSuggestion: { title: "Nada te Turbe", url: "https://www.youtube.com/results?search_query=nada+te+turbe+taize", artist: "Taizé" },
        content: `
Santa Teresa de Ávila, a grande reformadora do Carmelo, é uma gigante da espiritualidade. Mulher forte, decidida e cheia de humor ("Livra-nos, Senhor, de santos com cara azeda!"), ela nos deixou o mapa mais completo da alma humana: o "Castelo Interior".

Para Teresa, a oração não é uma técnica complicada de meditação. Ela define oração de forma simples e revolucionária: "Tratar de amizade, estando muitas vezes a sós com Quem sabemos que nos ama". Rezar é ser amigo de Deus. E como se constrói uma amizade? Passando tempo juntos, conversando com sinceridade.

Mas ela sabia que o caminho não é fácil. Existem distrações, secas espirituais e tentações. Por isso, seu conselho principal é a "determinada determinação". É preciso decidir não parar de rezar, aconteça o que acontecer, sinta o que sentir. "Importa muito uma grande e muito determinada determinação de não parar até chegar à fonte", dizia ela.

Teresa nos ensina que Deus habita no centro da nossa alma (a sétima morada do castelo), e a vida cristã é uma viagem para dentro, para encontrar esse Rei que vive em nós. Não precisamos buscar Deus fora, nas estrelas ou em lugares distantes; Ele está mais perto de nós do que nós mesmos.

Sua famosa oração, encontrada em seu breviário, é um remédio para a ansiedade moderna: "Nada te perturbe, nada te espante, tudo passa. Deus não muda. A paciência tudo alcança. Quem a Deus tem, nada lhe falta. Só Deus basta".`
      },
      {
        id: 'pio-full',
        title: 'Padre Pio: O Combate',
        description: 'Os estigmas, a confissão e o sofrimento redentor.',
        category: 'prayer',
        duration: '13 min',
        icon: Activity,
        videoSuggestion: { title: "História Padre Pio", url: "https://www.youtube.com/results?search_query=filme+padre+pio+resumo", channelName: "Santos Católicos" },
        musicSuggestion: { title: "Fica Senhor Comigo", url: "https://www.youtube.com/results?search_query=fica+senhor+comigo+celina+borges", artist: "Celina Borges" },
        content: `
São Pio de Pietrelcina é um dos santos mais intrigantes e amados do século XX. Ele carregou no próprio corpo, por 50 anos, as chagas de Cristo (os estigmas). Mas seus maiores milagres não foram os sinais físicos, e sim as conversões que aconteciam em seu confessionário.

Padre Pio passava até 16 horas por dia atendendo confissões. Ele tinha o dom de ler as almas e, às vezes, era duro com quem não estava arrependido, mas acolhia com doçura infinita quem buscava mudar de vida. Ele sabia que o pecado é o maior mal do mundo e lutava corpo a corpo contra o demônio para salvar almas.

Ele nos ensina o valor do sofrimento. Para o mundo, a dor é algo a ser evitado a todo custo (com remédios, distrações, prazeres). Para Padre Pio, unido à Cruz de Cristo, o sofrimento se torna moeda de ouro para comprar o céu para os pecadores. Ele não sofria com revolta, mas com amor, oferecendo cada dor pela Igreja.

Sua relação com o Anjo da Guarda era íntima e real. Ele nos lembra que não estamos sozinhos nas batalhas do dia a dia; temos um amigo celeste ao nosso lado. Ele dizia: "Envie-me o seu Anjo da Guarda quando você não puder vir".

Seu conselho mais famoso resume a vida cristã em confiança e paz: "Reze, espere e não se preocupe. A agitação não serve para nada. Deus é misericordioso e ouvirá sua oração".`
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

Imagine que você está caminhando por uma estrada longa com uma mochila cheia de pedras. A cada quilômetro, o peso aumenta, suas costas doem, e a alegria da viagem desaparece. O pecado é exatamente isso: um peso morto que insistimos em carregar, achando que somos fortes o suficiente, ou pior, achando que não merecemos nos livrar dele.

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
        icon: Sparkles,
        videoSuggestion: { title: "Santidade para todos", url: "https://www.youtube.com/results?search_query=chamado+a+santidade+padre+leo", channelName: "Pe. Léo" },
        musicSuggestion: { title: "Rumo à Santidade", url: "https://www.youtube.com/results?search_query=rumo+a+santidade+musica", artist: "Com. Shalom" },
        content: `
Quando pensamos em santos, é comum imaginarmos figuras distantes, inalcançáveis, pessoas que nunca erraram, que viviam flutuando em êxtase ou que morreram de formas trágicas em séculos passados. Olhamos para os vitrais das igrejas e pensamos: "Isso não é para mim. Eu tenho defeitos demais, eu me irrito no trânsito, eu tenho preguiça, eu sou humano demais".

Mas esse é o grande equívoco que nos paralisa. A santidade não é sinônimo de impecabilidade ou perfeccionismo. Ser santo não é anular a sua humanidade, mas sim permitir que a graça de Deus a transforme e a plenifique.

A definição mais bela de santidade é, talvez, a mais simples: ser santo é ser amigo íntimo de Deus. Santa Teresa de Ávila dizia que a oração é apenas "tratar de amizade, estando muitas vezes a sós com Quem sabemos que nos ama". Portanto, a santidade é uma relação, não uma performance.

Você se torna santo lavando a louça com amor, suportando com paciência aquele colega de trabalho difícil, ouvindo seu filho quando você está cansado, rezando mesmo quando não sente vontade nenhuma. A santidade acontece no anonimato do cotidiano, nas pequenas batalhas vencidas por amor a Deus.

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
      },
      {
        id: 'maria-full',
        title: 'Maria: Nossa Mãe',
        description: 'Por que os católicos não adoram, mas amam Maria?',
        category: 'doctrine',
        duration: '11 min',
        icon: Heart,
        videoSuggestion: { title: "Quem é Maria?", url: "https://www.youtube.com/results?search_query=padre+paulo+ricardo+quem+é+maria", channelName: "Pe. Paulo Ricardo" },
        musicSuggestion: { title: "Acaso não Sabeis", url: "https://www.youtube.com/results?search_query=acaso+nao+sabeis+colo+de+deus", artist: "Colo de Deus" },
        content: `
Existe uma confusão antiga e persistente de que os católicos "adoram" Maria. Mas o coração da fé católica sabe a diferença essencial: adoração é devida somente a Deus, o Criador de tudo. A Maria, nós oferecemos um amor especial, uma veneração profunda, porque foi isso que o próprio Jesus fez.

Ninguém amou Maria mais do que Jesus. Ele a escolheu desde toda a eternidade para ser a porta pela qual Ele entraria no mundo. Se Deus quis precisar de Maria para chegar até nós, quem somos nós para dizermos que não precisamos dela para chegar até Ele?

Maria é como a lua. A lua não tem luz própria; ela brilha na escuridão da noite apenas porque reflete a luz do sol. Maria não é a fonte da graça, ela é o espelho puríssimo que reflete perfeitamente a luz de Cristo. Quando olhamos para ela, não paramos nela; somos imediatamente redirecionados para o seu Filho.

O seu último conselho registrado na Bíblia, nas Bodas de Caná, resume toda a sua missão: "Fazei tudo o que Ele vos disser". Ela não quer glória para si; ela quer que nossos odres vazios sejam preenchidos pelo vinho novo de Jesus.

Ter Maria como mãe não é uma invenção humana, é um testamento. Aos pés da cruz, no momento de maior dor, Jesus nos deu Maria: "Filho, eis aí a tua mãe". Ela nos acolhe não como juíza, mas como advogada, como aquela que entende nossas dores porque também sofreu, que entende nossas incertezas porque também teve que caminhar pela fé.

Caminhar com Maria é pegar um atalho seguro. Ela conhece o caminho para o Coração de Jesus melhor do que ninguém. Segurar em sua mão é a garantia de que, mesmo nas tempestades, não nos perderemos do destino final.`
      },
      {
        id: 'biblia-full',
        title: 'Escritura e Tradição',
        description: 'A Bíblia não caiu do céu pronta. Entenda sua origem.',
        category: 'doctrine',
        duration: '13 min',
        icon: BookOpen,
        videoSuggestion: { title: "Sola Scriptura?", url: "https://www.youtube.com/results?search_query=padre+paulo+ricardo+sola+scriptura", channelName: "Pe. Paulo Ricardo" },
        musicSuggestion: { title: "Tua Palavra", url: "https://www.youtube.com/results?search_query=tua+palavra+shalom", artist: "Com. Shalom" },
        content: `
Muitas vezes imaginamos a Bíblia como um livro que caiu pronto do céu, encadernado e com zíper. Mas a história da nossa fé é muito mais orgânica e viva. Antes de haver uma única linha do Novo Testamento escrita, a Igreja já existia, os mártires já davam a vida por Jesus e a Eucaristia já era celebrada.

A fé católica não é a "religião do livro", é a religião da Palavra encarnada, Jesus Cristo. E essa Palavra chega até nós através de dois grandes canais que nunca se contradizem: a Sagrada Escritura e a Sagrada Tradição.

Imagine uma família. As histórias dessa família, seus valores e sua identidade são transmitidos oralmente, na convivência, no dia a dia. Isso é a Tradição. Em certo momento, parte dessas histórias é colocada em um álbum de fotos ou em cartas. Isso é a Escritura. Tentar entender as cartas sem conhecer a vida viva da família pode levar a grandes mal-entendidos.

Foi a Igreja Católica, guiada pelo Espírito Santo, que discerniu e decidiu, no século IV, quais livros eram inspirados por Deus e quais não eram. A Bíblia é, portanto, filha da Igreja, e não o contrário.

Ler a Bíblia dentro da Tradição é ter a segurança de que não estamos inventando um "Jesus à nossa imagem e semelhança". É ter a garantia de que a fé que professamos hoje é a mesma fé dos Apóstolos, a mesma fé que venceu impérios e transformou o mundo.

A Escritura ilumina nossa vida, e a Tradição garante que estamos segurando a lanterna do jeito certo. Juntas, elas nos dão a plenitude da Revelação de Deus.`
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
      },
      {
        id: 'lectio-full',
        title: 'Lectio Divina',
        description: 'Os 4 degraus para subir ao céu através da leitura.',
        category: 'prayer',
        duration: '12 min',
        icon: BookOpen,
        videoSuggestion: { title: "Passo a passo da Lectio", url: "https://www.youtube.com/results?search_query=lectio+divina+passo+a+passo", channelName: "Shalom" },
        musicSuggestion: { title: "Instrumental Prayer", url: "https://www.youtube.com/results?search_query=instrumental+worship+piano", artist: "Instrumental" },
        content: `
A Bíblia não foi feita apenas para ser estudada, mas para ser "comida". Os antigos monges comparavam a leitura da Palavra ao ato de se alimentar, e criaram um método simples e profundo chamado Lectio Divina (Leitura Divina), que é como uma escada de quatro degraus que nos leva da terra ao céu.

O primeiro degrau é a Leitura (Lectio). Aqui, lemos o texto com calma, respeitando as vírgulas, imaginando a cena. Perguntamos: "O que o texto diz em si?". É como colocar o alimento na boca.

O segundo degrau é a Meditação (Meditatio). Agora, trazemos o texto para a nossa vida. Não é mais uma história antiga, é uma carta para hoje. "O que Deus está me dizendo através desse texto? O que isso tem a ver com minhas dores e alegrias atuais?". É o ato de mastigar e saborear o alimento.

O terceiro degrau é a Oração (Oratio). É a nossa resposta. Depois de ouvir Deus falar, nós falamos. Pode ser um pedido de perdão, um agradecimento, um grito de socorro ou um louvor. A oração brota naturalmente da meditação. É o ato de engolir e assimilar.

O quarto e último degrau é a Contemplação (Contemplatio). Aqui, as palavras cessam. É o momento do silêncio amoroso. É como estar nos braços de quem amamos, onde não precisamos mais explicar nada, apenas estar. É o repouso da alma em Deus.

Você não precisa de horas. Dedique 15 minutos do seu dia a esses quatro passos e verá que a Bíblia deixará de ser um livro de história para se tornar a voz viva de Deus guiando seus passos.`
      },
      {
        id: 'exame-full',
        title: 'O Exame da Noite',
        description: 'A oração que encerra o dia e prepara o amanhã.',
        category: 'prayer',
        duration: '10 min',
        icon: Eye,
        videoSuggestion: { title: "Exame de Consciência", url: "https://www.youtube.com/results?search_query=exame+de+consciencia+santo+inacio", channelName: "Jesuítas Brasil" },
        musicSuggestion: { title: "Noite de Paz", url: "https://www.youtube.com/results?search_query=night+prayer+music", artist: "Gregorian" },
        content: `
Muitas vezes vivemos no "piloto automático". Os dias passam, as semanas voam, e repetimos os mesmos erros, as mesmas reações impacientes, os mesmos vícios, sem nunca parar para entender o que está acontecendo dentro de nós. Santo Inácio de Loyola dizia que, se tivéssemos que escolher apenas uma oração para fazer no dia, deveria ser o Exame de Consciência.

O Exame não é apenas uma lista de pecados para nos sentirmos culpados antes de dormir. É, na verdade, uma revisão do "filme" do nosso dia sob a luz do Espírito Santo, para encontrar onde Deus esteve presente e onde nós O ignoramos.

Começamos sempre agradecendo. Encontramos as pequenas pérolas escondidas no dia: um café quente, um sorriso, um livramento, uma tarefa concluída. A gratidão abre os olhos da alma.

Depois, pedimos luz para ver a verdade e revisamos as horas que passaram. Onde perdi a paz? Onde fui egoísta? Onde deixei de amar? Não para nos condenar, mas para aprender. Percebemos que aquela irritação no jantar, na verdade, veio de uma falta de oração na manhã. Começamos a entender nossos padrões.

Pedimos perdão com confiança de filhos e, o mais importante, olhamos para o amanhã. Como posso amar melhor amanhã? Que armadilha devo evitar?

Quem termina o dia entregando tudo a Deus dorme melhor. O Exame da Noite nos permite esvaziar a bagagem emocional antes de descansar, para que possamos acordar leves e prontos para recomeçar.`
      },
      {
        id: 'adoracao-full',
        title: 'Adoração Eucarística',
        description: 'A arte de perder tempo com Deus.',
        category: 'prayer',
        duration: '10 min',
        icon: Sun,
        videoSuggestion: { title: "O que fazer na adoração?", url: "https://www.youtube.com/results?search_query=o+que+fazer+na+adoracao", channelName: "Canção Nova" },
        musicSuggestion: { title: "Em Tua Presença", url: "https://www.youtube.com/results?search_query=em+tua+presenca+nivea+soares", artist: "Nívea Soares" },
        content: `
Certa vez, São João Maria Vianney perguntou a um camponês simples que passava horas na igreja olhando para o sacrário: "O que você faz aí tanto tempo?". O homem respondeu com uma sabedoria desconcertante: "Eu olho para Ele e Ele olha para mim".

Isso é Adoração. No nosso mundo utilitarista, onde tudo precisa servir para alguma coisa, produzir algum resultado, a Adoração parece "perda de tempo". Mas é exatamente isso que a torna tão preciosa. É o tempo que "perdemos" com Deus apenas porque Ele merece, apenas para estar com Ele.

Adorar não exige que você leia mil livros ou reze mil fórmulas complexas. É como tomar sol. Você não precisa "fazer força" para se bronzear; você só precisa se expor ao sol. Na Adoração, nós expomos as feridas, os medos e os sonhos da nossa alma à luz curadora da Eucaristia. E, silenciosamente, essa Luz nos transforma.

Às vezes, a adoração será cheia de sentimentos e lágrimas; outras vezes, será árida e silenciosa. Não importa. O valor da oração não está no que sentimos, mas no amor que investimos ao decidir permanecer ali.

Se você não souber o que dizer, não diga nada. Ou diga apenas: "Senhor, eis-me aqui. Eu te amo, mas aumenta a minha capacidade de amar". Deixe que Ele trabalhe no silêncio. As maiores obras de Deus são feitas quando a alma se cala e permite que Ele seja Deus.`
      },
      {
        id: 'jejum-full',
        title: 'Jejum e Mortificação',
        description: 'Não é dieta. É oração do corpo.',
        category: 'prayer',
        duration: '8 min',
        icon: Anchor,
        videoSuggestion: { title: "Por que jejuar?", url: "https://www.youtube.com/results?search_query=por+que+jejuar+padre+paulo", channelName: "Pe. Paulo Ricardo" },
        musicSuggestion: { title: "Deserto", url: "https://www.youtube.com/results?search_query=deserto+padre+fabio", artist: "Pe. Fábio de Melo" },
        content: `
Para a mentalidade moderna, o jejum parece algo medieval ou uma dieta disfarçada de religião. Mas Jesus foi claro: "Quando jejuardes...", e não "Se jejuardes". Ele sabia que, sem o jejum, nossa vida espiritual ficaria manca.

Nós somos uma unidade de corpo e alma. Se o corpo está sempre saciado, cheio de confortos e prazeres imediatos, a alma tende a ficar pesada, lenta, surda para as coisas sutis de Deus. O jejum é uma forma de dizer ao nosso corpo: "Você é importante, mas você não é o senhor da casa. O espírito é quem manda".

O jejum tem três dimensões fundamentais. Primeiro, o domínio próprio: se eu não consigo dizer "não" a um pedaço de chocolate ou a um café, como terei força para dizer "não" a um pecado grave na hora da tentação? O jejum fortalece o músculo da vontade.

Segundo, a solidariedade: o jejum cristão autêntico deve nos levar a partilhar. O que economizo na minha mesa deve ir para a mesa do pobre. Sem caridade, o jejum é apenas fome.

Terceiro, e mais importante, a fome de Deus. A fome física deve despertar em nós a fome espiritual. Quando o estômago ronca, a alma reza: "Senhor, assim como meu corpo precisa de pão, eu preciso de Ti. Tu és o meu sustento verdadeiro".

Comece pequeno. Tire um conforto, um doce, uma refeição na sexta-feira. Ofereça esse pequeno sacrifício pela conversão de alguém. Você descobrirá uma força interior que desconhecia.`
      }
    ]
  },
  {
    id: 'track-3',
    title: 'Viver a Santa Missa',
    description: 'Deixando de assistir para participar do Sacrifício.',
    items: [
      {
        id: 'silencio-full',
        title: 'Ritos Iniciais',
        description: 'Por que o silêncio e o ato penitencial importam.',
        category: 'mass',
        duration: '8 min',
        icon: Mic2,
        videoSuggestion: { title: "Ato Penitencial", url: "https://www.youtube.com/results?search_query=ato+penitencial+explicacao", channelName: "Liturgia Diária" },
        musicSuggestion: { title: "Kyrie Eleison", url: "https://www.youtube.com/results?search_query=kyrie+eleison+gregoriano", artist: "Gregoriano" },
        content: `
A Santa Missa não começa quando o padre entra e faz o sinal da cruz. Ela começa, espiritualmente, quando saímos de casa. Mas o momento decisivo acontece nos minutos antes do início da celebração.

Muitas vezes, chegamos à igreja agitados, conversando, checando o celular, com a cabeça cheia de ruídos da semana. Se o terreno do nosso coração estiver cheio de ervas daninhas, a semente da Palavra não conseguirá penetrar. Por isso, o silêncio antes da Missa não é apenas uma regra de educação, é uma necessidade vital. É o momento de "baixar a poeira", de desconectar do mundo para se conectar com o Eterno.

Logo no início, somos convidados ao Ato Penitencial. Não é apenas um "pedido de desculpas" formal. Quando cantamos o "Kyrie Eleison" (Senhor, tende piedade), estamos nos colocando na postura da verdade. Estamos reconhecendo que somos mendigos espirituais diante do Rei.

Não adianta fingir que somos autossuficientes. Ali, batemos no peito e dizemos: "Senhor, eu falhei. Eu preciso da tua graça. Sem Ti, eu nada posso". Essa humildade é a chave que abre as portas da misericórdia de Deus. Quem se reconhece pequeno, sai da Missa engrandecido pela graça. Quem chega se achando justo, sai vazio.

Viva os ritos iniciais como quem tira a roupa suja da viagem para vestir a veste de festa. É a preparação para o grande banquete que virá.`
      },
      {
        id: 'palavra-full',
        title: 'Liturgia da Palavra',
        description: 'Deus está falando. Você está ouvindo?',
        category: 'mass',
        duration: '9 min',
        icon: BookOpen,
        videoSuggestion: { title: "A Palavra na Missa", url: "https://www.youtube.com/results?search_query=liturgia+da+palavra+explicacao", channelName: "Catequese" },
        musicSuggestion: { title: "Tua Palavra é Luz", url: "https://www.youtube.com/results?search_query=tua+palavra+e+luz", artist: "Com. Shalom" },
        content: `
Imagine que você recebeu uma carta da pessoa que mais te ama no mundo. Você a leria com pressa, pensando na lista de compras? Ou pararia tudo para sorver cada palavra? Na Liturgia da Palavra, Deus não está apenas nos contando histórias antigas; Ele está falando conosco, aqui e agora.

A Bíblia proclamada na Missa é um evento atual. A Palavra é viva e eficaz.

Na Primeira Leitura, geralmente ouvimos a voz do Antigo Testamento, a promessa de Deus sendo preparada ao longo dos séculos. O Salmo é a nossa resposta cantada e orante, onde usamos as próprias palavras inspiradas por Deus para falar com Ele. A Segunda Leitura nos traz os conselhos dos apóstolos sobre como viver essa fé no mundo real.

E então, chega o ápice: o Evangelho. Ficamos de pé, aclamamos, o padre beija o livro. Por que tanta solenidade? Porque ali é o próprio Cristo quem fala. Não são apenas palavras sobre Jesus; é a voz do Mestre ecoando na Igreja.

Um desafio prático: tente guardar uma frase, apenas uma, de toda a liturgia. Leve essa frase para casa, repita-a durante a semana. Se saímos da Missa sem lembrar de nada do que Deus nos disse, estivemos lá de corpo presente, mas de alma ausente. A Palavra precisa encontrar terra boa em nós para dar fruto.`
      },
      {
        id: 'ofertorio-full',
        title: 'O Ofertório',
        description: 'Colocando a vida no altar junto com o pão.',
        category: 'mass',
        duration: '7 min',
        icon: HandHeartIcon,
        videoSuggestion: { title: "O Sentido do Ofertório", url: "https://www.youtube.com/results?search_query=ofertorio+missa+explicacao", channelName: "Pe. Paulo Ricardo" },
        musicSuggestion: { title: "Venho Senhor Oferecer", url: "https://www.youtube.com/results?search_query=venho+senhor+oferecer", artist: "Liturgia" },
        content: `
Para muitos, o Ofertório é apenas o "intervalo" da Missa. É a hora em que nos sentamos, relaxamos, olhamos quem chegou ou procuramos o dinheiro da coleta. Mas perdemos, assim, um dos momentos mais profundos de nossa participação pessoal no sacrifício.

O pão e o vinho que são levados ao altar representam o "fruto da terra e do trabalho humano". Eles representam tudo o que somos e tudo o que fazemos. Representam o esforço da semana, o cansaço do trabalho, as alegrias da família, as lágrimas derramadas no escondido.

Quando o sacerdote eleva a patena com a hóstia (que ainda é pão), é o momento de você colocar, espiritualmente, a sua vida naquela patena.

Diga em seu coração: "Senhor, recebe o meu casamento. Recebe a minha preocupação com meu filho. Recebe o meu desemprego ou o meu sucesso. Recebe a minha luta contra aquele vício. Eu não tenho muito, mas o que tenho é Teu".

Se não nos ofertamos no ofertório, nossa comunhão fica incompleta. Deus quer transformar não apenas o pão em Corpo de Cristo, mas quer transformar a nossa vida ofertada em vida divina. Não seja um espectador. Suba ao altar com sua oferta.`
      },
      {
        id: 'consagracao-full',
        title: 'A Consagração',
        description: 'O céu desce à terra. O momento do milagre.',
        category: 'mass',
        duration: '12 min',
        icon: Sun,
        videoSuggestion: { title: "O que acontece na Consagração?", url: "https://www.youtube.com/results?search_query=consagracao+missa+explicacao", channelName: "Formação Católica" },
        musicSuggestion: { title: "Panis Angelicus", url: "https://www.youtube.com/results?search_query=panis+angelicus", artist: "Sacra" },
        content: `
Chegamos ao coração da Missa, ao centro da nossa fé, ao momento em que o tempo e a eternidade se tocam. O sacerdote estende as mãos sobre as ofertas e invoca o Espírito Santo. O céu se abre. Os anjos e santos se prostram ao redor daquele altar, seja numa catedral dourada ou numa capela simples de barro.

Quando o padre pronuncia as palavras de Jesus na Última Ceia — "Isto é o meu Corpo... Isto é o meu Sangue" — não é uma representação teatral. Não é um "faz de conta". Acontece o milagre da Transubstanciação. O que era pão deixa de ser pão, embora mantenha a cor e o sabor de pão. O que era vinho deixa de ser vinho. Agora, é Deus.

Estamos, misticamente, aos pés da Cruz no Calvário. O sacrifício de Jesus é tornado presente para nós. Aquele mesmo amor que se entregou há dois mil anos está ali, palpitante, vivo, real, a poucos metros de nós.

O que fazer diante de tal mistério? Ajoelhar-se (se a saúde permitir) é o sinal do corpo que reconhece a sua pequenez diante da grandeza de Deus. Mas a alma também deve se prostrar.

Olhe para a Hóstia Santa elevada e faça como o apóstolo Tomé, que tocou as feridas de Jesus e recuperou a fé: diga em seu coração, com todo o amor que puder reunir: "Meu Senhor e meu Deus!". Adore. Agradeça. Entregue-se. Ali está a fonte de toda a força que você precisa para viver.`
      },
      {
        id: 'envio-full',
        title: 'Ritos Finais: Missão',
        description: '"Ite, missa est". A Missa termina, a missão começa.',
        category: 'mass',
        duration: '6 min',
        icon: Users,
        videoSuggestion: { title: "Ite Missa Est", url: "https://www.youtube.com/results?search_query=significado+ite+missa+est", channelName: "Cléofas" },
        musicSuggestion: { title: "Ide e Anunciai", url: "https://www.youtube.com/results?search_query=ide+e+anunciai", artist: "Música Católica" },
        content: `
A Missa termina, mas a vida cristã está apenas recomeçando. A própria palavra "Missa" vem da expressão latina "Ite, missa est", que significa "Ide, sois enviados". Não é um simples "tchau, até domingo que vem". É uma ordem de envio, quase militar.

Nós entramos na igreja como discípulos para aprender e nos alimentar. Agora, saímos como missionários. Fomos cheios da Palavra e do Corpo de Cristo não para guardar essa graça em uma caixa, mas para transbordá-la no mundo.

Agora, você é um sacrário vivo caminhando pelas ruas. O Cristo que você recebeu quer amar através de você. Ele quer sorrir para o porteiro através do seu sorriso. Ele quer ter paciência com seus filhos através da sua paciência. Ele quer ser honesto no seu trabalho através da sua honestidade.

Se a Missa não muda a nossa vida, se saímos dela exatamente iguais a como entramos — ou pior, criticando a roupa dos outros no estacionamento — então a Missa foi estéril em nós. O verdadeiro fruto da Eucaristia é a caridade.

A missão começa quando cruzamos a porta da igreja para fora. O mundo lá fora está sedento, faminto de sentido e de amor. Nós temos o Pão. Vamos reparti-lo com a nossa vida.`
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
          {/* Navigation Arrows - Visible on Mobile now */}
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
      
      {/* Scroll Container */}
      <div ref={rowRef} className="flex gap-4 overflow-x-auto pb-8 -mx-6 px-6 no-scrollbar snap-x scroll-smooth">
          {track.items.map((item) => (
            <div 
              key={item.id} 
              onClick={() => onSelect(item)} 
              className="snap-start min-w-[220px] max-w-[220px] sm:min-w-[240px] sm:max-w-[240px] group cursor-pointer flex flex-col relative transition-all duration-300 hover:-translate-y-2"
            >
              {/* Card Art (COMPACT & PROPORTIONAL) */}
              <div className="relative h-auto aspect-[3.5/4] rounded-[2rem] overflow-hidden shadow-card border border-slate-100 dark:border-white/5 bg-white dark:bg-[#15191E] flex flex-col justify-between p-5">
                 
                 {/* Top Badge */}
                 <div className="flex justify-between items-start mb-4">
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-lg uppercase tracking-widest text-brand-violet bg-brand-violet/5 border border-brand-violet/10">
                        {item.category === 'doctrine' ? 'Doutrina' : item.category === 'prayer' ? 'Oração' : 'Liturgia'}
                    </span>
                 </div>

                 {/* Center Icon (RESIZED FOR BALANCE) */}
                 <div className="flex-1 flex items-center justify-center mb-4">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-slate-50 dark:bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform duration-500 border border-slate-100 dark:border-white/5">
                        <item.icon size={28} className="text-brand-violet opacity-80" strokeWidth={1.5} />
                    </div>
                 </div>

                 {/* Content Bottom */}
                 <div>
                    <h4 className="font-bold text-brand-dark dark:text-white text-base leading-tight mb-2 line-clamp-2">{item.title}</h4>
                    <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500 text-[10px] font-bold">
                        <Clock size={12} /> {item.duration}
                    </div>
                 </div>
                 
                 {/* Hover Effect Border */}
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
      
      {/* Header Fixo */}
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
                  placeholder="Buscar tema (ex: Confissão)..." 
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
        
        {/* HERO SECTION (MOBILE OPTIMIZED) */}
        {!searchQuery && selectedCategory === 'all' && FeaturedItem && (
          <div onClick={() => setActiveItem(FeaturedItem)} className="relative w-full rounded-[2rem] overflow-hidden shadow-xl border border-white/10 group cursor-pointer bg-gradient-to-br from-[#2E2344] to-[#1A1625] flex flex-col sm:flex-row min-h-[220px] sm:min-h-[300px]">
            
            {/* Background Decoration (Icon as Watermark) */}
            <div className="absolute -right-10 -bottom-10 opacity-10 sm:opacity-20 transform rotate-12 pointer-events-none">
               <FeaturedItem.icon size={240} className="text-white" strokeWidth={0.5} />
            </div>
            
            {/* Content */}
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
               
               <button className="bg-white text-brand-dark px-6 py-3 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 hover:bg-slate-100 transition-colors shadow-lg hover:scale-105 active:scale-95 duration-300 w-fit">
                  <PlayCircle size={18} fill="currentColor" /> Ler Agora
               </button>
            </div>
          </div>
        )}

        {/* Tracks List */}
        <div className="space-y-4">
           {filteredTracks.map((track) => (
              <KnowledgeTrackRow key={track.id} track={track} onSelect={setActiveItem} />
           ))}
        </div>

        {/* Empty State */}
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

      {/* --- READER MODAL (FULL SCREEN) --- */}
      {activeItem && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center sm:p-4">
          <div className="absolute inset-0 bg-brand-dark/95 backdrop-blur-xl transition-opacity animate-fade-in" onClick={() => setActiveItem(null)} />
          
          <div className="relative w-full max-w-4xl h-full sm:h-[95vh] bg-white dark:bg-[#0F1115] sm:rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col animate-slide-up border border-white/10">
            
            {/* Modal Header */}
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

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto bg-[#FAF9F6] dark:bg-[#0F1115] relative">
               
               {/* Hero Header (Icon on Clean Background) */}
               <div className="relative w-full h-[35vh] sm:h-[40vh] bg-slate-50 dark:bg-[#1A1F26] flex items-center justify-center overflow-hidden">
                  <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
                  <activeItem.icon size={120} className="text-brand-violet opacity-90 relative z-10 drop-shadow-2xl animate-scale-in" strokeWidth={1} />
                  
                  {/* Fade to content */}
                  <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-[#FAF9F6] dark:from-[#0F1115] to-transparent" />
               </div>

               {/* Article Content */}
               <div className="px-6 sm:px-12 pb-32 -mt-20 relative z-10">
                  <div className="max-w-2xl mx-auto">
                     {/* Metadata Chips */}
                     <div className="flex flex-wrap items-center gap-3 mb-6 animate-slide-up justify-center sm:justify-start">
                        <span className="bg-brand-violet text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-md">
                           {activeItem.category === 'doctrine' ? 'Doutrina' : activeItem.category === 'prayer' ? 'Espiritualidade' : 'Liturgia'}
                        </span>
                        <span className="bg-white/80 dark:bg-white/10 backdrop-blur-md text-slate-500 dark:text-slate-300 text-xs font-bold flex items-center gap-1.5 px-3 py-1 rounded-full border border-slate-200 dark:border-white/10 shadow-sm">
                           <Clock size={12} /> {activeItem.duration} de leitura
                        </span>
                     </div>
                     
                     {/* Title */}
                     <h1 className="text-3xl sm:text-5xl font-black text-brand-dark dark:text-white mb-10 font-serif leading-[1.1] tracking-tight drop-shadow-sm animate-slide-up text-center sm:text-left">
                        {activeItem.title}
                     </h1>
                     
                     {/* Text Render (PROSE) */}
                     <div className="prose prose-lg prose-slate dark:prose-invert prose-p:font-serif prose-p:text-[1.15rem] prose-p:leading-loose prose-p:text-slate-700 dark:prose-p:text-slate-300 animate-slide-up" style={{animationDelay: '200ms'}}>
                        <div className="whitespace-pre-line">{activeItem.content}</div>
                     </div>
                     
                     {/* Multimedia Suggestions (Deep Dive Links - DUAL OPTION) */}
                     <div className="mt-16 pt-10 border-t border-slate-200 dark:border-white/10 animate-slide-up" style={{animationDelay: '300ms'}}>
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6 text-center">Aprofunde-se no Tema</h3>
                        <div className="grid sm:grid-cols-2 gap-4">
                           {/* VIDEO BUTTON */}
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
                           
                           {/* MUSIC BUTTON */}
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

            {/* Sticky Footer Action */}
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
