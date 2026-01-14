
import { supabase, getConnectionStatus, getSession, safeStringify } from './authService';
import { RoutineItem, PrayerIntention, JournalEntry, CommunityPost, Comment, Notification, LeaderboardData, CommunityChallenge, DailyTopic } from '../types';
import { getSeasonDetailedInfo } from './liturgyService';

/**
 * MATRIZ DE SABEDORIA LITÚRGICA (Humanizada e Relacional)
 * Cada categoria contém desafios práticos que conectam a fé à vida cotidiana.
 */
const CHALLENGE_POOL: Record<string, any[]> = {
  lent: [
    {
      title: "O Perdão na Raiz",
      desc: "Limpar o coração de toda amargura nesta Quaresma.",
      action: "Pense na pessoa que você tem mais dificuldade de conviver. Hoje, envie uma mensagem curta de paz ou faça um favor concreto para ela sem que ela saiba que foi você.",
      verse: "Perdoai e sereis perdoados. (Lc 6, 37)",
      type: 'RELATIONSHIP'
    },
    {
      title: "Jejum de Críticas",
      desc: "O deserto é o lugar do silêncio que edifica.",
      action: "Hoje, seu desafio é o 'Silêncio Heróico': não reclame de nada e não fale mal de ninguém. Se alguém te irritar, responda com um sorriso e uma oração mental.",
      verse: "Jesus, porém, guardava silêncio. (Mt 26, 63)",
      type: 'SACRIFICE'
    },
    {
      title: "Oração de Intercessão Viva",
      desc: "Carregar a cruz do irmão.",
      action: "Ligue (não mande áudio) para um amigo que você sabe que está passando por uma luta. Ouça-o por 10 minutos e termine rezando uma Ave-Maria com ele por telefone.",
      verse: "Orai uns pelos outros para serdes curados. (Tg 5, 16)",
      type: 'PRAYER'
    }
  ],
  easter: [
    {
      title: "Visita da Ressurreição",
      desc: "Cristo ressuscitou e quer visitar seus irmãos através de você.",
      action: "Identifique um parente idoso ou alguém que mora sozinho. Leve um pequeno doce ou uma flor e passe 15 minutos partilhando a alegria da fé.",
      verse: "A paz esteja convosco! (Jo 20, 19)",
      type: 'RELATIONSHIP'
    },
    {
      title: "Elogio que Ilumina",
      desc: "Espalhar a luz do Ressuscitado.",
      action: "Faça um elogio sincero e profundo a um colega de trabalho ou funcionário que raramente recebe reconhecimento pelo que faz.",
      verse: "Vós sois a luz do mundo. (Mt 5, 14)",
      type: 'RELATIONSHIP'
    }
  ],
  advent: [
    {
      title: "Vigilância no Trânsito/Fila",
      desc: "Preparar o caminho do Senhor na paciência.",
      action: "Em qualquer fila ou trânsito hoje, ceda sua vez. Não use o celular. Use esse tempo para rezar um mistério do terço por quem está ao seu redor.",
      verse: "Preparai o caminho do Senhor. (Lc 3, 4)",
      type: 'SACRIFICE'
    },
    {
      title: "Carta de Gratidão",
      desc: "Reconhecer a presença de Deus nas pessoas.",
      action: "Escreva uma mensagem ou carta para alguém que foi importante na sua caminhada de fé este ano, agradecendo especificamente por um gesto dela.",
      verse: "Dou graças a Deus sempre que me lembro de vós. (Fl 1, 3)",
      type: 'RELATIONSHIP'
    }
  ],
  christmas: [
    {
      title: "Bênção da Mesa",
      desc: "Deus conosco na simplicidade do lar.",
      action: "Na próxima refeição, tome a iniciativa de conduzir a oração. Agradeça por cada pessoa presente e peça a paz para as famílias vizinhas.",
      verse: "O Verbo se fez carne e habitou entre nós. (Jo 1, 14)",
      type: 'RELATIONSHIP'
    }
  ],
  ordinary: [
    {
      title: "O Altar do Trabalho",
      desc: "Santificar o cotidiano como São José.",
      action: "Identifique a tarefa que você mais detesta fazer no trabalho ou em casa. Faça-a hoje com o máximo de perfeição e alegria, oferecendo-a pela conversão dos pecadores.",
      verse: "Tudo o que fizerdes, fazei-o de coração. (Cl 3, 23)",
      type: 'RELATIONSHIP'
    },
    {
      title: "Reconciliação Pendente",
      desc: "Não deixe o sol se pôr sobre sua ira.",
      action: "Peça desculpas por algo pequeno (uma resposta ríspida, um esquecimento) a alguém da sua casa. Humilhe-se para que Deus te exalte.",
      verse: "Sede bondosos e tende compaixão. (Ef 4, 32)",
      type: 'RELATIONSHIP'
    },
    {
      title: "Oração pelo 'Inimigo'",
      desc: "Amar como Jesus amou.",
      action: "Reze um Terço da Misericórdia (ou 1 dezena) especificamente pela pessoa que mais te persegue ou que você menos suporta. Peça a bênção de Deus para a vida dela.",
      verse: "Amai vossos inimigos. (Mt 5, 44)",
      type: 'PRAYER'
    },
    {
      title: "A Escuta que Cura",
      desc: "Dar o seu tempo, o bem mais precioso.",
      action: "Ao conversar com alguém hoje, guarde o celular. Não interrompa. Apenas ouça com o coração, dando atenção total como se fosse o próprio Cristo falando.",
      verse: "Todo homem seja pronto para ouvir. (Tg 1, 19)",
      type: 'RELATIONSHIP'
    }
  ]
};

/**
 * Gera um desafio comunitário baseado no ciclo litúrgico atual.
 * A lógica garante que todos os usuários vejam o mesmo desafio diariamente.
 */
const getDeterministicLiturgicalChallenge = (): CommunityChallenge => {
  const season = getSeasonDetailedInfo();
  const today = new Date();
  
  // Usamos o dia do ano para garantir que o desafio mude a cada 24h e seja igual para todos
  const startOfYear = new Date(today.getFullYear(), 0, 0);
  const diff = today.getTime() - startOfYear.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);
  
  const pool = CHALLENGE_POOL[season.id] || CHALLENGE_POOL.ordinary;
  const selectedIndex = dayOfYear % pool.length;
  const challengeTemplate = pool[selectedIndex];

  const seasonTitles: Record<string, string> = {
    lent: "Caminho de Conversão",
    easter: "Alegria da Vida Nova",
    advent: "Vigilância da Esperança",
    christmas: "Luz que Nasce",
    ordinary: "Santidade no Dia a Dia"
  };

  return {
    id: `liturgical-cycle-${dayOfYear}-${season.id}`,
    title: seasonTitles[season.id] || "Jornada do Peregrino",
    description: "Um passo concreto para tirar sua fé do papel e vivê-la nos relacionamentos.",
    currentAmount: 2450 + (dayOfYear * 5),
    targetAmount: 10000,
    unit: 'gestos de amor',
    daysLeft: 1, // Desafio diário
    seasonColor: season.color,
    icon: 'heart',
    type: 'season',
    startDate: new Date(),
    endDate: new Date(),
    status: 'active',
    participants: 1200 + (dayOfYear % 200),
    isUserParticipating: false,
    userContribution: 0,
    currentDay: 1,
    totalDays: 1,
    dailyTopics: [
      {
        day: 1,
        title: challengeTemplate.title,
        description: challengeTemplate.desc,
        isCompleted: false,
        isLocked: false,
        actionType: challengeTemplate.type,
        actionContent: challengeTemplate.action,
        scripture: challengeTemplate.verse
      }
    ]
  };
};

export const fetchGlobalChallenge = async (): Promise<CommunityChallenge | null> => {
  try {
    if (getConnectionStatus()) {
      const { data, error } = await supabase!
        .from('global_challenges')
        .select('*')
        .eq('status', 'active')
        .maybeSingle();
      
      if (error) throw error;
      
      if (data) {
        return {
          ...data,
          startDate: new Date(data.start_date),
          endDate: new Date(data.end_date),
          dailyTopics: data.daily_topics || []
        };
      }
    }
  } catch (e) {
    console.error("Erro ao buscar desafio customizado no DB:", e);
  }
  
  // Se não houver desafio manual no Supabase, gera o litúrgico automático
  return getDeterministicLiturgicalChallenge();
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

export const saveUserRoutine = async (userId: string, items: RoutineItem[]) => {
  if (getConnectionStatus()) {
    try {
        const payload = items.map(item => ({ 
            id: item.id,
            user_id: userId,
            title: item.title,
            description: item.description,
            xp_reward: item.xpReward,
            completed: item.completed,
            icon: item.icon,
            time_of_day: item.timeOfDay,
            day_of_week: item.dayOfWeek,
            // Fixed: Changed action_link to item.actionLink to match RoutineItem interface
            action_link: item.actionLink || 'NONE'
        }));
        const { error } = await supabase!.from('routines').upsert(payload);
        if (error) throw error;
    } catch (e) {
        console.error("Erro ao salvar rotina no Supabase:", e);
    }
  } 
};

export const fetchUserRoutine = async (userId: string): Promise<RoutineItem[]> => {
  if (getConnectionStatus()) {
    try {
        const { data, error } = await supabase!.from('routines').select('*').eq('user_id', userId);
        if (error) throw error;
        return (data || []).map((item: any) => ({
            id: item.id,
            title: item.title,
            description: item.description,
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

export const toggleRoutineItemStatus = async (id: string, completed: boolean) => {
  if (getConnectionStatus()) {
    await supabase!.from('routines').update({ completed }).eq('id', id);
  }
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
    await supabase!.from('profiles').update({ is_premium: true, subscription_status: 'active' }).eq('id', userId);
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
  if (getConnectionStatus()) {
    try {
        const from = page * pageSize;
        const to = from + pageSize - 1;

        const { data, error } = await supabase!
          .from('posts')
          .select('*, comments(*)')
          .order('timestamp', { ascending: false })
          .range(from, to);
          
        if (error) throw error;
        return (data || []).map((p: any) => ({
            id: p.id,
            userId: p.user_id,
            userName: p.user_name,
            userAvatar: p.user_avatar,
            content: p.content,
            imageUrl: p.image_url,
            likesCount: p.likes_count,
            commentsCount: p.comments_count,
            isLikedByUser: false,
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

export const fetchLeaderboard = async (): Promise<LeaderboardData> => {
  return {
    intercessors: [
      { id: '1', userId: 'u1', userName: 'Maria Silva', score: 1250, rank: 1, badges: ['top3', 'streak'] },
      { id: '2', userId: 'u2', userName: 'Pedro Alvares', score: 980, rank: 2, badges: ['top3'] },
      { id: '3', userId: 'u3', userName: 'Ana Souza', score: 850, rank: 3, badges: ['top3'] },
      { id: '4', userId: 'u4', userName: 'Lucas Lima', score: 720, rank: 4 },
      { id: '5', userId: 'u5', userName: 'Clara Nunes', score: 650, rank: 5 }
    ],
    pilgrims: [
      { id: 'p1', userId: 'up1', userName: 'José Santos', score: 15, rank: 1, badges: ['streak'] },
      { id: 'p2', userId: 'up2', userName: 'Marta Rocha', score: 12, rank: 2, badges: ['streak'] },
      { id: 'p3', userId: 'up3', userName: 'Tiago Mendes', score: 10, rank: 3 }
    ]
  };
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
