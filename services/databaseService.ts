import { supabase, getConnectionStatus, getSession, safeStringify } from './authService';
import { RoutineItem, PrayerIntention, JournalEntry, CommunityPost, Comment, Notification, LeaderboardData, CommunityChallenge, DailyTopic, PaymentLog } from '../types';
import { getSeasonDetailedInfo } from './liturgyService';
import * as EmailTemplates from './emailTemplates';
import { sendEmail } from './resendService';

/**
 * BUSCA HISTÓRICO DE PAGAMENTOS
 */
export const fetchUserPaymentLogs = async (userId: string): Promise<PaymentLog[]> => {
  if (getConnectionStatus()) {
    try {
      const { data, error } = await supabase!
        .from('payment_logs')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return (data || []).map(p => ({
        id: p.id,
        provider: p.provider,
        amount: p.payload?.amount || 37.90,
        status: p.status,
        created_at: new Date(p.created_at)
      }));
    } catch (e) {
      console.error("Erro ao buscar logs de pagamento:", e);
    }
  }
  return [];
};

/**
 * MENSAGENS DO CHAT DA COMUNIDADE (SOCIAL HUB)
 */
export const fetchChatMessages = async (): Promise<any[]> => {
  if (getConnectionStatus()) {
    try {
      const { data, error } = await supabase!
        .from('chat_messages')
        .select('*')
        .order('timestamp', { ascending: true })
        .limit(100);
      
      if (error) throw error;
      return (data || []).map(m => ({
        id: m.id,
        userId: m.user_id,
        userName: m.user_name,
        userAvatar: m.user_avatar,
        userLevel: m.user_level,
        text: m.text,
        timestamp: new Date(m.timestamp),
        type: m.type || 'chat',
        reactions: m.reactions || { heart: 0, candle: 0, pray: 0 },
        userReactions: { heart: false, candle: false, pray: false }
      }));
    } catch (e) {
      console.error("Erro ao buscar mensagens do chat:", e);
    }
  }
  return [];
};

export const createChatMessage = async (message: any) => {
  if (getConnectionStatus()) {
    try {
      const { error } = await supabase!
        .from('chat_messages')
        .insert([{
          id: message.id,
          user_id: message.userId,
          user_name: message.userName,
          user_avatar: message.userAvatar,
          user_level: message.userLevel,
          text: message.text,
          timestamp: message.timestamp.toISOString(),
          type: message.type,
          reactions: message.reactions
        }]);
      if (error) throw error;
    } catch (e) {
      console.error("Erro ao salvar mensagem no chat:", e);
    }
  }
};

export const updateChatMessageReaction = async (messageId: string, reactions: any) => {
  if (getConnectionStatus()) {
    try {
      await supabase!
        .from('chat_messages')
        .update({ reactions })
        .eq('id', messageId);
    } catch (e) {
      console.error("Erro ao atualizar reação no chat:", e);
    }
  }
};

/**
 * PERSISTÊNCIA LOCAL DE CONCLUSÃO DE DESAFIOS
 * Armazena por challenge_id + day para evitar reset ao recarregar
 */
const CHALLENGE_COMPLETIONS_KEY = 'espiritualizei_challenge_completions';

const getChallengeCompletion = (challengeId: string, day: number): boolean => {
  try {
    const stored = localStorage.getItem(CHALLENGE_COMPLETIONS_KEY);
    if (!stored) return false;
    const completions: Record<string, boolean> = JSON.parse(stored);
    return !!completions[`${challengeId}_${day}`];
  } catch { return false; }
};

export const markChallengeCompleted = (challengeId: string, day: number): void => {
  try {
    const stored = localStorage.getItem(CHALLENGE_COMPLETIONS_KEY);
    const completions: Record<string, boolean> = stored ? JSON.parse(stored) : {};
    completions[`${challengeId}_${day}`] = true;
    localStorage.setItem(CHALLENGE_COMPLETIONS_KEY, JSON.stringify(completions));
  } catch (e) {
    console.error('Erro ao salvar conclusão do desafio:', e);
  }
};

/**
 * GERAÇÃO DE DESAFIOS LITÚRGICOS SINCRONIZADOS (3 DIAS)
 * Pool enriquecido com mandamentos de Cristo, Santos padroeiros e vida cotidiana
 */
const generateDeterministicChallenge = (date: Date): CommunityChallenge => {
  const season = getSeasonDetailedInfo(date);
  const MS_PER_DAY = 24 * 60 * 60 * 1000;
  const daysSinceEpoch = Math.floor(date.getTime() / MS_PER_DAY);
  const cycleId = Math.floor(daysSinceEpoch / 3);
  const isPreLent = date.getMonth() === 1 && date.getDate() < 18 && date.getFullYear() === 2026;

  const taskPool = {
    ORDINARY: {
        RELATIONAL: [
            { title: "Caridade no Olhar", desc: "Procure uma qualidade em alguém que você costuma criticar e elogie essa pessoa hoje, de forma sincera e específica.", action: "Mude o ambiente ao seu redor com um elogio concreto - cite o que você admirou.", script: "Acima de tudo, cultivai o amor, que é o laço da perfeição. (Col 3, 14)" },
            { title: "Escuta Fraterna", desc: "Dedique 10 minutos ininterruptos para ouvir alguém sem interromper, sem dar conselhos não pedidos, sem olhar o celular.", action: "Seja o ouvido de Cristo para um irmão. Olhe nos olhos e ouça com o coração.", script: "Todo homem deve ser pronto para ouvir, tardio para falar. (Tg 1, 19)" },
            { title: "Gesto Escondido de São José", desc: "Faça uma tarefa doméstica ou profissional que ninguém gosta de fazer, sem que ninguém perceba - como José trabalhava na sombra.", action: "Sirva em silêncio. A santidade escondida de José edificou o lar de Cristo.", script: "O maior entre vós seja como o menor, e quem governa como quem serve. (Lc 22, 26)" }
        ],
        SACRIFICE: [
            { title: "Pontualidade como Oferta", desc: "Cumpra rigorosamente seus compromissos de hoje como uma oferta a Deus - o tempo do próximo é sagrado.", action: "Chegue antes. Seja fiel no pequeno. Deus habita na ordem e na confiabilidade.", script: "O que fizerdes, fazei-o de bom coração, como para o Senhor e não para os homens. (Col 3, 23)" },
            { title: "Doce Renúncia", desc: "Abstenha-se de reclamar do clima, do trânsito ou do cansaço durante todo o dia. Cada situação difícil é uma oportunidade de oferta.", action: "Transforme cada reclamação que surgir em uma oração silenciosa por alguém que sofre mais.", script: "Fazei tudo sem murmurações nem críticas. (Fl 2, 14)" },
            { title: "Jejum Digital de Santa Teresinha", desc: "Não abra redes sociais por prazer hoje. Use o tempo recuperado para uma leitura espiritual, mesmo que sejam só 10 minutos.", action: "As 'pequenas flores' de Teresinha são gestos simples feitos com grande amor. Guarde sua atenção.", script: "Guarda a tua língua do mal e teus lábios de falar enganosamente. (Sl 34, 13)" }
        ],
        MERCY: [
            { title: "Obra de Misericórdia Corporal", desc: "Escolha uma obra: dar de comer a quem tem fome, visitar um doente ou preso, acolher um estrangeiro - ou seu equivalente moderno.", action: "Doe alimento a uma instituição, visite um parente doente ou ajude um imigrante hoje.", script: "Tudo o que fizestes a um destes meus irmãos mais pequeninos, a mim o fizestes. (Mt 25, 40)" },
            { title: "Obra de Misericórdia Espiritual", desc: "Corrija com amor quem erra, instrua quem não sabe, console os tristes ou perdoe quem te ofendeu.", action: "Escreva uma mensagem de reconciliação, ou perdoe em silêncio alguém que te magoou.", script: "Sede misericordiosos como o vosso Pai é misericordioso. (Lc 6, 36)" },
            { title: "Paz no Coração por São Miguel", desc: "São Miguel venceu o diabo com humildade e fé. Identifique onde você está cedendo ao orgulho ou à raiva hoje e ofereça isso a Deus.", action: "Se sentir raiva ou orgulho, diga internamente: 'São Miguel, defende-me nesta batalha.'", script: "Sede sóbrios e vigilantes. O diabo, como leão rugindo, anda em derredor. (1Pd 5, 8)" }
        ],
        JOSEPH: [
            { title: "Santificação do Trabalho", desc: "São José santificou o trabalho cotidiano. Hoje, ofereça cada tarefa do seu trabalho ou estudos como oração - faça com cuidado o que seria fácil fazer de qualquer jeito.", action: "Antes de começar o trabalho, diga: 'São José, ensina-me a trabalhar com amor e perfeição.'", script: "O Senhor, teu Deus, está contigo em tudo o que empreendes. (Js 1, 9)" },
            { title: "Proteção da Família", desc: "José protegeu Maria e Jesus com prudência, sem hesitar. Ore hoje pela proteção de sua família e da família da sua comunidade.", action: "Reze um Pai-Nosso e uma Ave-Maria pelas famílias em crise que você conhece.", script: "Levantai-vos, tomai o menino e sua mãe, e fugi para o Egito. (Mt 2, 13)" },
            { title: "Silêncio Fecundo de José", desc: "José não disse uma única palavra nos Evangelhos - agiu. Hoje, substitua palavras desnecessárias por ações concretas de amor.", action: "Identifique algo que você prometeu e não fez. Faça hoje, sem anunciar.", script: "Não sejamos amantes de palavras e de língua, mas da obra e da verdade. (1Jo 3, 18)" }
        ]
    },
    LENT: {
        PRAYER: [
            { title: "Deserto Interior", desc: "Passe 15 minutos em silêncio absoluto - sem celular, música ou distrações. Apenas fique quieto diante de Deus.", action: "Abra espaço para a voz do Espírito Santo. Se vier distração, ofereça-a como oração.", script: "Conduzi-la-ei ao deserto e falarei ao seu coração. (Os 2, 16)" },
            { title: "Via Sacra Viva", desc: "Ao sentir qualquer dor física ou emocional hoje, una conscientemente esse sofrimento à Paixão de Cristo pelas almas do mundo.", action: "Diga ao sentir dor: 'Jesus, ofereço isto por [intenção]. Que minha cruz tenha fruto eterno.'", script: "Quem quiser vir após mim, negue-se a si mesmo, tome sua cruz cada dia e siga-me. (Lc 9, 23)" },
            { title: "Intercessão pelo Inimigo", desc: "Reze um mistério do Rosário por alguém que te ofendeu, que te irrita ou que você tem dificuldade de amar.", action: "Ame seus inimigos com a oração. Maria intercede por nós - interceda você por quem não merece.", script: "Rezai pelos que vos perseguem e vos maltratam. (Mt 5, 44)" }
        ],
        FASTING: [
            { title: "Jejum de Telas", desc: "Desligue todas as notificações não essenciais. Use redes sociais apenas para o estritamente necessário. Cada impulso de checar é uma oportunidade de orar.", action: "A cada vez que for checar o celular por hábito, reze uma Ave-Maria antes de abrir qualquer app.", script: "Vigiai e orai para que não entreis em tentação. O espírito está pronto, mas a carne é fraca. (Mt 26, 41)" },
            { title: "Mesa Simples como Cristo", desc: "Faça uma refeição mais simples hoje. Coma menos do que quisera, e ofereça essa pequena mortificação por almas do purgatório.", action: "Coma sem sobremesa, ou sem um item que gosta, e diga: 'Ofereço por aquelas almas que mais precisam.'", script: "Nem só de pão vive o homem, mas de toda palavra que sai da boca de Deus. (Mt 4, 4)" },
            { title: "Silêncio da Quaresma", desc: "Evite falar palavras desnecessárias. Antes de falar, pergunte: 'Isso edifica? É verdadeiro? É necessário?'", action: "O silêncio é a linguagem do amor. Pratique o filtro das 3 perguntas em cada conversa hoje.", script: "No muito falar não falta pecado; quem modera os lábios é sábio. (Pr 10, 19)" }
        ]
    },
    EASTER: {
        WITNESS: [
            { title: "Testemunho da Ressurreição", desc: "A Ressurreição não é só dogma - é estilo de vida. Compartilhe uma palavra de esperança concreta com alguém em dificuldade.", action: "Envie uma mensagem específica de encorajamento, citando o que você admira nessa pessoa e que Deus a ama.", script: "Vós sois a luz do mundo. Assim brilhe a vossa luz diante dos homens. (Mt 5, 14-16)" },
            { title: "Alegria Pascal no Cotidiano", desc: "Cristo ressuscitou - e isso muda tudo. Faça um esforço consciente para sorrir e ser gentil com todos, especialmente nos momentos de estresse.", action: "A alegria do Senhor é nossa força. Seja o sinal da Páscoa para sua família ou colegas hoje.", script: "Alegrai-vos sempre no Senhor. Outra vez vos digo: Alegrai-vos! (Fl 4, 4)" },
            { title: "Visita de Carlos Acutis", desc: "Bl. Carlos Acutis, o 'influencer de Deus', usou a internet para evangelizar. Compartilhe hoje algo belo sobre a fé nas suas redes.", action: "Poste um versículo, uma imagem de um santo, ou um testemunho simples da sua fé. Seja digital e autêntico.", script: "Ide por todo o mundo e pregai o Evangelho a toda criatura. (Mc 16, 15)" }
        ]
    },
    ADVENT: {
        VIGILANCE: [
            { title: "Coração em Espera", desc: "O Advento nos convida a preparar o coração para Cristo. Organize um pequeno espaço de oração em casa com uma vela e a Bíblia.", action: "Prepare o caminho do Senhor. Acenda a vela e leia uma profecia do Advento antes de dormir.", script: "Vigiai, pois não sabeis o dia nem a hora em que o Filho do Homem há de vir. (Mt 25, 13)" },
            { title: "Paciência da Esperança", desc: "A espera de Israel por milênios nos ensina: Deus cumpre suas promessas no tempo certo. Pratique a paciência hoje.", action: "Em filas, trânsito ou conversas difíceis, ofereça a espera como preparação para o Natal.", script: "Sede pacientes, irmãos, até a vinda do Senhor. (Tg 5, 7)" },
            { title: "Esmola do Advento", desc: "João Batista preparou o caminho com conversão e partilha. Faça uma doação concreta - dinheiro, alimento ou tempo.", action: "Quem tiver duas túnicas, dê uma. Doe algo concreto a alguém que precisa antes do Natal.", script: "Quem tiver duas túnicas, reparta com quem não tem; e quem tiver alimentos, faça o mesmo. (Lc 3, 11)" }
        ]
    }
  };

  const activePool = (season.id === 'lent' || isPreLent) ? taskPool.LENT :
                   (season.id === 'easter' ? taskPool.EASTER :
                   (season.id === 'advent' ? taskPool.ADVENT : taskPool.ORDINARY));

  const poolKeys = Object.keys(activePool);
  const typeKey = poolKeys[cycleId % poolKeys.length];
  const list = (activePool as any)[typeKey];

  const dailyTopics: DailyTopic[] = list.map((t: any, idx: number) => ({
    day: idx + 1,
    title: t.title,
    description: t.desc,
    actionContent: t.action,
    scripture: t.script,
    isCompleted: false,
    isLocked: false,
    actionType: typeKey === 'RELATIONAL' || typeKey === 'WITNESS' || typeKey === 'MERCY' ? 'RELATIONSHIP' :
               (typeKey === 'FASTING' || typeKey === 'SACRIFICE' ? 'SACRIFICE' : 'PRAYER')
  }));

  const themeNames: Record<string, string> = {
    lent: "Caminho do Calvário",
    easter: "Luz da Ressurreição",
    advent: "Vigília da Esperança",
    christmas: "Alegria do Natal",
  };
  const themeName = themeNames[season.id] || (isPreLent ? "Vigília do Deserto" : "Fé no Cotidiano");

  return {
    id: `liturgical-cycle-${cycleId}`,
    title: `Jornada: ${themeName}`,
    description: `Um ciclo de 3 dias para fortalecer sua ${season.theme.toLowerCase()} através de gestos concretos no cotidiano.`,
    currentAmount: 0,
    targetAmount: 5000,
    unit: 'atos de amor',
    daysLeft: 3 - (daysSinceEpoch % 3),
    seasonColor: season.color,
    icon: season.id === 'lent' ? 'cross' : (season.id === 'easter' ? 'fire' : (season.id === 'advent' ? 'star' : 'fire')),
    type: 'season',
    startDate: new Date(cycleId * 3 * MS_PER_DAY),
    endDate: new Date((cycleId + 1) * 3 * MS_PER_DAY),
    status: 'active',
    participants: 1450 + (cycleId % 100),
    userContribution: 0,
    currentDay: (daysSinceEpoch % 3) + 1,
    totalDays: 3,
    dailyTopics
  };
};

export const fetchGlobalChallenge = async (): Promise<CommunityChallenge | null> => {
  // Sempre gera o desafio determinístico (garante dailyTopics e currentDay)
  const challenge = generateDeterministicChallenge(new Date());

  // Patch isCompleted a partir do localStorage (persiste entre sessões)
  if (challenge.dailyTopics) {
    challenge.dailyTopics = challenge.dailyTopics.map(topic => ({
      ...topic,
      isCompleted: getChallengeCompletion(challenge.id, topic.day)
    }));
  }

  // Enriquece com contagem real de participantes do DB (melhor esforço)
  try {
    if (getConnectionStatus()) {
      const { data } = await supabase!
        .from('community_challenges')
        .select('participants_count')
        .eq('is_active', true)
        .limit(1)
        .maybeSingle();

      if (data?.participants_count) {
        challenge.participants = data.participants_count;
      }
    }
  } catch (_e) {
    // Usa contagem local do gerador determinístico
  }

  return challenge;
};

export const saveUserRoutine = async (userId: string, items: RoutineItem[]) => {
  if (!getConnectionStatus()) {
    console.warn('[saveUserRoutine] Sem conexão com Supabase');
    return;
  }
  try {
    // 1. Capturar IDs antigos ANTES de qualquer alteração
    const { data: existing } = await supabase!
      .from('routines')
      .select('id')
      .eq('user_id', userId);
    const oldIds = (existing || []).map((r: any) => r.id);

    // 2. Inserir novos itens - se falhar, os antigos permanecem intactos
    const payload = items.map(item => ({
      id: item.id,
      user_id: userId,
      title: item.title,
      description: item.description,
      detailed_content: item.detailedContent || '',
      xp_reward: item.xpReward,
      completed: item.completed || false,
      icon: item.icon,
      time_of_day: item.timeOfDay,
      day_of_week: item.dayOfWeek,
      action_link: item.actionLink || 'NONE',
    }));

    const { error: insertError } = await supabase!.from('routines').insert(payload);
    if (insertError) throw insertError;

    // 3. Remover itens antigos SOMENTE após insert bem-sucedido
    if (oldIds.length > 0) {
      await supabase!.from('routines').delete().in('id', oldIds);
    }

    console.log('[saveUserRoutine] Rotina salva com sucesso:', payload.length, 'itens');
  } catch (e) {
    console.error('[saveUserRoutine] Erro ao salvar rotina:', e);
  }
};

export const fetchUserRoutine = async (userId: string): Promise<RoutineItem[]> => {
  if (getConnectionStatus()) {
    try {
        const { data, error } = await supabase!.from('routines').select('*').eq('user_id', userId).order('created_at', { ascending: true });
        if (error) throw error;
        return (data || []).map((item: any) => ({
            id: item.id,
            title: item.title,
            description: item.description,
            detailedContent: item.detailed_content,
            xpReward: item.xp_reward,
            completed: item.completed,
            icon: item.icon,
            timeOfDay: item.time_of_day,
            dayOfWeek: item.day_of_week,
            actionLink: item.action_link
        }));
    } catch (e) {
        console.error("Erro ao buscar rotina:", e);
    }
  }
  return [];
};

export const savePartialLead = async (email: string, name: string, step: number, data: any) => {
  if (getConnectionStatus()) {
    try {
      await supabase!.from('onboarding_leads').upsert({
        email: email.toLowerCase().trim(),
        name: name,
        last_step: step,
        metadata: data,
        updated_at: new Date().toISOString()
      }, { onConflict: 'email' });
    } catch (e) {
      console.warn("Falha ao salvar lead parcial", e);
    }
  }
};

export const updateLastConfessionDate = async (userId: string, date: Date) => {
    if (getConnectionStatus()) {
        await supabase!.from('profiles').update({ last_confession_at: date.toISOString() }).eq('id', userId);
    }
};

export const fetchCommunityIntentions = async (userId: string): Promise<PrayerIntention[]> => {
  if (getConnectionStatus()) {
    try {
        const { data, error } = await supabase!.from('intentions').select(`
            *,
            prayer_intercessions(user_id)
        `).order('timestamp', { ascending: false });
        
        if (error) throw error;

        return (data || []).map((i: any) => ({
            ...i,
            isPrayedByUser: i.prayer_intercessions?.some((p: any) => p.user_id === userId)
        }));
    } catch (e) {
        console.error("Erro ao buscar intenções:", e);
    }
  }
  return [];
};

export const togglePrayerInteraction = async (intentionId: string) => {
  const session = getSession();
  if (!session || !getConnectionStatus()) return;

  const { data: existing } = await supabase!.from('prayer_intercessions')
    .select('*')
    .eq('intention_id', intentionId)
    .eq('user_id', session.user.id)
    .maybeSingle();

  if (existing) {
    await supabase!.from('prayer_intercessions').delete().eq('id', existing.id);
    await supabase!.rpc('decrement_praying_count', { row_id: intentionId });
  } else {
    await supabase!.from('prayer_intercessions').insert([{ intention_id: intentionId, user_id: session.user.id }]);
    await supabase!.rpc('increment_praying_count', { row_id: intentionId });
    
    // NOTIFICAR O AUTOR DA INTENÇÃO
    try {
      // Buscar dados da intenção para notificar o autor
      const { data: intention } = await supabase!.from('prayer_intentions')
        .select('user_id, user_name')
        .eq('id', intentionId)
        .maybeSingle();
      
      if (intention && intention.user_id !== session.user.id) {
        // Enfileirar notificação push (ignorar erro se tabela não existir)
        try {
          await supabase!.from('notification_queue').insert({
            user_id: intention.user_id,
            title: 'Alguém rezou por você! 🙏',
            body: `${session.user.name} acendeu uma vela e intercedeu pela sua intenção.`,
            type: 'intercession',
            data: { intercessorName: session.user.name, intentionId },
            status: 'pending',
            created_at: new Date().toISOString()
          });
        } catch (notifError) {
          console.warn('⚠️ Tabela notification_queue pode não existir:', notifError);
        }
        
        // Também enviar e-mail de notificação
        const { data: authorProfile } = await supabase!.from('profiles')
          .select('email')
          .eq('id', intention.user_id)
          .maybeSingle();
        
        if (authorProfile?.email) {
          // E-mail será enviado pelo sistema de backup
          console.log(`📧 Notificação de intercessão enfileirada para ${authorProfile.email}`);
        }
      }
    } catch (e) {
      console.error('❌ Erro ao notificar intercessão:', e);
    }
  }
};

export const togglePostLike = async (postId: string) => {
  const session = getSession();
  if (!session || !getConnectionStatus()) return;

  const { data: existing } = await supabase!.from('post_likes')
    .select('*')
    .eq('post_id', postId)
    .eq('user_id', session.user.id)
    .maybeSingle();

  if (existing) {
    await supabase!.from('post_likes').delete().eq('id', existing.id);
    await supabase!.rpc('decrement_likes_count', { row_id: postId });
  } else {
    await supabase!.from('post_likes').insert([{ post_id: postId, user_id: session.user.id }]);
    await supabase!.rpc('increment_likes_count', { row_id: postId });
  }
};

export const toggleRoutineItemStatus = async (id: string, completed: boolean, userId?: string, xpReward?: number): Promise<{ newXP?: number; newLevel?: number; leveledUp?: boolean }> => {
  if (getConnectionStatus()) {
    await supabase!.from('routines').update({ completed }).eq('id', id);
    
    // Se completou a tarefa e temos userId e xpReward, adicionar XP
    if (completed && userId && xpReward && xpReward > 0) {
      const result = await addUserXP(userId, xpReward);
      return result;
    }
  }
  return {};
};

export const createIntention = async (userId: string, author: string, avatar: string | undefined, content: string, category: string, tags: string[]): Promise<PrayerIntention> => {
  const newItem: PrayerIntention = {
    id: crypto.randomUUID(),
    author,
    authorAvatar: avatar,
    content,
    category: category as any,
    tags,
    prayingCount: 0,
    isPrayedByUser: false,
    timestamp: new Date()
  };

  if (getConnectionStatus()) {
    await supabase!.from('intentions').insert([{ 
        id: newItem.id,
        user_id: userId,
        author: newItem.author,
        authorAvatar: newItem.authorAvatar,
        content: newItem.content,
        category: newItem.category,
        tags: newItem.tags,
        prayingCount: 0,
        timestamp: newItem.timestamp.toISOString()
    }]);
  }
  return newItem;
};

export const createCommunityPost = async (userId: string, userName: string, avatar: string | undefined, content: string, imageUrl?: string): Promise<CommunityPost> => {
  const newPost: CommunityPost = {
    id: crypto.randomUUID(),
    userId,
    userName,
    userAvatar: avatar,
    content,
    imageUrl,
    likesCount: 0,
    commentsCount: 0,
    isLikedByUser: false,
    timestamp: new Date(),
    type: 'testimony',
    comments: []
  };

  if (getConnectionStatus()) {
    await supabase!.from('posts').insert([{
        id: newPost.id,
        user_id: userId,
        user_name: userName,
        user_avatar: avatar,
        content: content,
        image_url: imageUrl,
        likes_count: 0,
        comments_count: 0,
        timestamp: newPost.timestamp.toISOString(),
        type: 'testimony'
    }]);
  }
  return newPost;
};

export const upgradeUserToPremium = async (userId: string) => {
  if (getConnectionStatus()) {
    try {
      const { error } = await supabase!
        .from('profiles')
        .update({
          is_premium: true,
          subscription_status: 'active',
          subscription_renewal_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        })
        .eq('id', userId);
      
      if (error) throw error;

      // Registrar log de pagamento para auditoria
      await supabase!.from('payment_logs').insert([{
        user_id: userId,
        provider: 'stripe',
        status: 'completed',
        payload: { amount: 37.90, date: new Date().toISOString() }
      }]);

    } catch (e) {
      console.error("Erro crítico ao atualizar para premium:", e);
      throw e;
    }
  }
};

export const addRoutineItem = async (userId: string, item: RoutineItem) => {
  if (getConnectionStatus()) {
    await supabase!.from('routines').insert([{ 
        id: item.id,
        user_id: userId,
        title: item.title,
        description: item.description,
        xp_reward: item.xpReward,
        completed: item.completed,
        icon: item.icon,
        time_of_day: item.timeOfDay,
        day_of_week: item.dayOfWeek,
        // Fix: Changed action_link: item.action_link -> item.actionLink
        action_link: item.actionLink || 'NONE'
    }]);
  }
};

export const deleteRoutineItem = async (id: string) => {
  if (getConnectionStatus()) {
    await supabase!.from('routines').delete().eq('id', id);
  }
};

export const createJournalEntry = async (userId: string, mood: string, content: string, reflection?: string, verse?: string) => {
  if (getConnectionStatus()) {
    const entry = {
      id: crypto.randomUUID(),
      mood,
      content,
      ai_reflection: reflection,
      bible_verse: verse,
      user_id: userId,
      created_at: new Date().toISOString()
    };
    await supabase!.from('journal').insert([entry]);
  }
};

export const fetchCommunityPosts = async (page: number = 0, pageSize: number = 10): Promise<CommunityPost[]> => {
  const session = getSession();
  const userId = session?.user?.id;

  if (getConnectionStatus()) {
    try {
        const from = page * pageSize;
        const to = from + pageSize - 1;

        const { data, error } = await supabase!
          .from('posts')
          .select(`
            *,
            comments(*),
            post_likes!left(user_id)
          `)
          .order('timestamp', { ascending: false })
          .range(from, to);
          
        if (error) throw error;
        
        if (!data || data.length === 0) {
            // Retornar posts padrão caso o banco esteja vazio para não travar a UI
            return [
                {
                    id: 'welcome-1',
                    userId: 'system',
                    userName: 'Equipe Espiritualizei',
                    userAvatar: '',
                    content: 'Bem-vindo à nossa família de fé! Use este espaço para partilhar suas graças e testemunhos.',
                    likesCount: 0,
                    commentsCount: 0,
                    isLikedByUser: false,
                    timestamp: new Date(),
                    type: 'testimony',
                    comments: []
                }
            ];
        }

        return (data || []).map((p: any) => ({
            id: p.id,
            userId: p.user_id,
            userName: p.user_name,
            userAvatar: p.user_avatar,
            content: p.content,
            imageUrl: p.image_url,
            likesCount: p.likes_count,
            commentsCount: p.comments_count,
            isLikedByUser: userId ? p.post_likes?.some((l: any) => l.user_id === userId) : false,
            timestamp: new Date(p.timestamp),
            type: p.type || 'testimony',
            comments: (p.comments || []).map((c: any) => ({ 
                id: c.id,
                userId: c.user_id,
                userName: c.user_name,
                content: c.content,
                timestamp: new Date(c.timestamp) 
            }))
        }));
    } catch (e) {
        console.error("Erro ao buscar posts:", e);
        return [
            {
                id: 'error-fallback',
                userId: 'system',
                userName: 'Espiritualizei',
                userAvatar: '',
                content: 'Estamos preparando as partilhas da comunidade para você. Em breve aparecerão aqui!',
                likesCount: 0,
                commentsCount: 0,
                isLikedByUser: false,
                timestamp: new Date(),
                type: 'testimony',
                comments: []
            }
        ];
    }
  }
  return [];
};

export const addComment = async (postId: string, userId: string, userName: string, content: string): Promise<Comment> => {
  const newComment: Comment = {
    id: crypto.randomUUID(),
    userId,
    userName,
    content,
    timestamp: new Date()
  };
  if (getConnectionStatus()) {
    await supabase!.from('comments').insert([{ 
        id: newComment.id,
        post_id: postId,
        user_id: userId,
        user_name: userName,
        content: content,
        timestamp: newComment.timestamp.toISOString()
    }]);
    await supabase!.rpc('increment_comments_count', { row_id: postId });
  }
  return newComment;
};

export const fetchNotifications = async (userId: string): Promise<Notification[]> => {
  if (getConnectionStatus()) {
    const { data } = await supabase!.from('notifications').select('*').eq('user_id', userId).order('created_at', { ascending: false });
    return (data || []).map((n: any) => ({ ...n, createdAt: new Date(n.created_at) }));
  }
  return [];
};

export const markNotificationAsRead = async (id: string) => {
  if (getConnectionStatus()) {
    await supabase!.from('notifications').update({ is_read: true }).eq('id', id);
  }
};

/**
 * BUSCA DE RANKING REAL NO SUPABASE
 */
export const fetchLeaderboard = async (): Promise<LeaderboardData> => {
  if (!getConnectionStatus()) {
      return { intercessors: [], pilgrims: [] };
  }

  try {
    const { data: pilgrimsData, error: pError } = await supabase!
      .from('profiles')
      .select('id, name, photo_url, current_xp, level')
      .order('current_xp', { ascending: false })
      .limit(30);

    if (pError) throw pError;

    const { data: intercessorsData, error: iError } = await supabase!
      .from('profiles')
      .select('id, name, photo_url, current_xp, level')
      .order('level', { ascending: false })
      .limit(30);

    if (iError) throw iError;

    const mapEntry = (p: any, index: number) => ({
      id: p.id,
      userId: p.id,
      userName: p.name || 'Peregrino',
      avatarUrl: p.photo_url,
      score: p.current_xp || 0,
      rank: index + 1,
      badges: (p.level || 1) > 10 ? ['streak'] : []
    });

    return {
      pilgrims: (pilgrimsData || []).map(mapEntry),
      intercessors: (intercessorsData || []).map(mapEntry)
    };
  } catch (e) {
    console.error("Erro ao carregar ranking real:", e);
    return { intercessors: [], pilgrims: [] };
  }
};

export const uploadImage = async (file: File, bucket: 'avatars' | 'posts'): Promise<string | undefined> => {
  if (getConnectionStatus()) {
    const fileName = `${Date.now()}_${file.name}`;
    const { data, error } = await supabase!.storage.from(bucket).upload(fileName, file);
    if (error) throw error;
    const { data: { publicUrl } } = supabase!.storage.from(bucket).getPublicUrl(data.path);
    return publicUrl;
  }
  return undefined;
};

/**
 * FILA DE E-MAILS PARA ENGAJAMENTO
 */
export const queueEngagementEmail = async (userId: string, type: 'welcome' | 'achievement' | 'liturgy' | 'intercession' | 'inactivity', payload: any) => {
  if (getConnectionStatus()) {
    try {
      let htmlContent = '';
      let subject = '';

      switch (type) {
        case 'welcome':
          htmlContent = EmailTemplates.getWelcomeEmail(payload.userName);
          subject = `Bem-vindo ao Espiritualizei, ${payload.userName.split(' ')[0]}!`;
          break;
        case 'achievement':
          htmlContent = EmailTemplates.getAchievementEmail(payload.userName, payload.achievement);
          subject = 'Sua alma está florescendo! ✨';
          break;
        case 'liturgy':
          htmlContent = EmailTemplates.getLiturgyEmail(payload.userName, payload.seasonName, payload.seasonColor);
          subject = `Um novo tempo começou: ${payload.seasonName}`;
          break;
        case 'intercession':
          htmlContent = EmailTemplates.getIntercessionEmail(payload.userName);
          subject = 'Alguém acendeu uma vela por você! 🕯️';
          break;
        case 'inactivity':
          htmlContent = EmailTemplates.getInactivityEmail(payload.userName);
          subject = 'Sentimos sua falta... Vamos retomar?';
          break;
      }

      await supabase!.from('email_queue').insert([{
        user_id: userId,
        email_type: type,
        subject: subject,
        html_content: htmlContent,
        payload: payload,
        status: 'pending',
        created_at: new Date().toISOString()
      }]);

      // Tenta enviar imediatamente se for um e-mail crítico (como boas-vindas)
      if (type === 'welcome') {
        const userEmail = localStorage.getItem('user_email');
        if (userEmail) {
          await sendEmail(userEmail, subject, htmlContent);
        }
      }
    } catch (e) {
      console.error("Erro ao enfileirar e-mail:", e);
    }
  }
};

/**
 * DETECÇÃO DE INATIVIDADE (Para ser chamado no App.tsx)
 */
export const checkAndLogActivity = async (userId: string) => {
  if (getConnectionStatus()) {
    try {
      await supabase!.from('profiles').update({ 
        last_activity_at: new Date().toISOString() 
      }).eq('id', userId);
    } catch (e) {
      console.error("Erro ao registrar atividade:", e);
    }
  }
};

/**
 * REGISTRAR CONCLUSÃO DE TAREFA DA ROTINA (Para painel admin)
 */
export const logRoutineTaskCompletion = async (userId: string, taskId: string, xpReward: number) => {
  if (getConnectionStatus()) {
    try {
      await supabase!.from('activity_logs').insert({
        user_id: userId,
        activity_type: 'routine_task_completed',
        metadata: { taskId, xpReward },
        created_at: new Date().toISOString()
      });
    } catch (e) {
      console.error("Erro ao registrar conclusão de tarefa:", e);
    }
  }
};

/**
 * VERIFICAÇÃO E RENOVAÇÃO DO CICLO ESPIRITUAL DE 30 DIAS
 * Chamado ao iniciar o app para verificar se o ciclo do usuário precisa ser renovado
 */
export const checkAndRenewSpiritualCycle = async (userId: string, cycleStart: Date): Promise<{ needsRenewal: boolean; newCycleStart?: Date }> => {
  const now = new Date();
  const daysSinceCycleStart = Math.floor((now.getTime() - cycleStart.getTime()) / (1000 * 60 * 60 * 24));
  
  if (daysSinceCycleStart >= 30) {
    // Ciclo expirado, renovar
    const newCycleStart = new Date();
    
    if (getConnectionStatus()) {
      try {
        await supabase!.from('profiles').update({
          spiritual_cycle_start: newCycleStart.toISOString(),
          last_routine_update: newCycleStart.toISOString()
        }).eq('id', userId);
        
        console.log("🔄 Ciclo espiritual renovado para o usuário:", userId);
      } catch (e) {
        console.error("Erro ao renovar ciclo espiritual:", e);
      }
    }
    
    return { needsRenewal: true, newCycleStart };
  }
  
  return { needsRenewal: false };
};

/**
 * ATUALIZAÇÃO DE XP E NÍVEL DO USUÁRIO
 * Chamado quando o usuário completa uma atividade
 */
export const addUserXP = async (userId: string, xpAmount: number): Promise<{ newXP: number; newLevel: number; leveledUp: boolean }> => {
  if (!getConnectionStatus()) {
    return { newXP: 0, newLevel: 1, leveledUp: false };
  }
  
  try {
    // Buscar dados atuais do usuário
    const { data: profile, error: fetchError } = await supabase!
      .from('profiles')
      .select('current_xp, level, next_level_xp')
      .eq('id', userId)
      .single();
    
    if (fetchError || !profile) throw fetchError;
    
    let currentXP = (profile.current_xp || 0) + xpAmount;
    let currentLevel = profile.level || 1;
    let nextLevelXP = profile.next_level_xp || 100;
    let leveledUp = false;
    
    // Verificar se subiu de nível
    while (currentXP >= nextLevelXP) {
      currentXP -= nextLevelXP;
      currentLevel += 1;
      nextLevelXP = Math.floor(nextLevelXP * 1.5); // Progressão exponencial
      leveledUp = true;
    }
    
    // Atualizar no banco
    const { error: updateError } = await supabase!.from('profiles').update({
      current_xp: currentXP,
      level: currentLevel,
      next_level_xp: nextLevelXP
    }).eq('id', userId);
    
    if (updateError) throw updateError;
    
    console.log(`✨ XP adicionado: +${xpAmount} | Nível: ${currentLevel} | XP Total: ${currentXP}`);
    
    return { newXP: currentXP, newLevel: currentLevel, leveledUp };
  } catch (e) {
    console.error("Erro ao adicionar XP:", e);
    return { newXP: 0, newLevel: 1, leveledUp: false };
  }
};

/**
 * ATUALIZAÇÃO DE STREAK (DIAS CONSECUTIVOS)
 * Chamado diariamente para verificar e atualizar o streak do usuário
 */
export const updateUserStreak = async (userId: string): Promise<{ streakDays: number; streakBroken: boolean }> => {
  if (!getConnectionStatus()) {
    return { streakDays: 0, streakBroken: false };
  }
  
  try {
    const { data: profile, error: fetchError } = await supabase!
      .from('profiles')
      .select('streak_days, last_activity_at')
      .eq('id', userId)
      .single();
    
    if (fetchError || !profile) throw fetchError;
    
    const now = new Date();
    const lastActivity = profile.last_activity_at ? new Date(profile.last_activity_at) : null;
    let streakDays = profile.streak_days || 0;
    let streakBroken = false;
    
    if (lastActivity) {
      const daysSinceLastActivity = Math.floor((now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysSinceLastActivity === 0) {
        // Já acessou hoje, não faz nada
      } else if (daysSinceLastActivity === 1) {
        // Acessou ontem, incrementa streak
        streakDays += 1;
      } else {
        // Mais de 1 dia sem acessar, streak quebrado
        streakDays = 1;
        streakBroken = true;
      }
    } else {
      // Primeiro acesso
      streakDays = 1;
    }
    
    // Atualizar no banco
    await supabase!.from('profiles').update({
      streak_days: streakDays,
      last_activity_at: now.toISOString()
    }).eq('id', userId);
    
    console.log(`🔥 Streak atualizado: ${streakDays} dias`);
    
    return { streakDays, streakBroken };
  } catch (e) {
    console.error("Erro ao atualizar streak:", e);
    return { streakDays: 0, streakBroken: false };
  }
};

/**
 * SINCRONIZAÇÃO COMPLETA DO PERFIL
 * Garante que todos os dados estejam consistentes entre local e servidor
 */
export const syncProfileData = async (userId: string): Promise<any | null> => {
  if (!getConnectionStatus()) return null;
  
  try {
    const { data: profile, error } = await supabase!
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) throw error;
    
    return profile;
  } catch (e) {
    console.error("Erro ao sincronizar perfil:", e);
    return null;
  }
};
