
import { supabase, getConnectionStatus, getSession, safeStringify } from './authService';
import { RoutineItem, PrayerIntention, JournalEntry, CommunityPost, Comment, Notification, LeaderboardData, CommunityChallenge, DailyTopic } from '../types';
import { getSeasonDetailedInfo } from './liturgyService';

/**
 * Matriz de Desafios Relacionais e Litúrgicos.
 * Cada desafio é pensado para durar um ciclo de 3 dias.
 */
const CHALLENGE_MATRIX: Record<string, any[]> = {
    lent: [
        {
            title: "O Perdão na Raiz",
            desc: "A Quaresma nos convida a limpar o coração de toda amargura.",
            action: "Pense na pessoa que mais te feriu ou que você tem mais dificuldade de conviver. Hoje, você não vai apenas rezar por ela, você vai enviar uma mensagem curta de paz ou fazer um favor concreto para ela sem esperar nada em troca.",
            verse: "Perdoai e seris perdoados. (Lc 6, 37)",
            type: 'RELATIONSHIP'
        },
        {
            title: "Jejum de Palavras",
            desc: "O deserto é o lugar do silêncio que escuta a Deus.",
            action: "Hoje seu desafio é o silêncio heroico: não reclame de nada e não fale mal de ninguém (nem por 'critica construtiva'). Se alguém te irritar, responda com um sorriso e um 'Deus te abençoe' mental.",
            verse: "Jesus, porém, guardava silêncio. (Mt 26, 63)",
            type: 'SACRIFICE'
        }
    ],
    easter: [
        {
            title: "A Luz que Visita",
            desc: "Cristo ressuscitou e quer visitar seus irmãos através de você.",
            action: "Escolha um amigo ou parente que está isolado ou triste. Não mande mensagem. Ligue ou vá até a casa da pessoa. Leve uma palavra de esperança e termine perguntando: 'Como posso rezar por você hoje?'",
            verse: "A paz esteja convosco! (Jo 20, 19)",
            type: 'RELATIONSHIP'
        }
    ],
    ordinary: [
        {
            title: "O Altar da Mesa",
            desc: "A santidade começa no comer junto, como os primeiros cristãos.",
            action: "Na próxima refeição em família ou com amigos, declare o local uma 'Zona Livre de Telas'. Guarde todos os celulares. Olhe nos olhos de quem está com você e faça uma pergunta profunda: 'O que te fez feliz hoje?'.",
            verse: "Eram perseverantes na comunhão e na fração do pão. (At 2, 42)",
            type: 'RELATIONSHIP'
        },
        {
            title: "O Ofício de Nazaré",
            desc: "Jesus santificou o trabalho e o serviço doméstico.",
            action: "Identifique a tarefa doméstica que todos em sua casa evitam (lavar a louça, levar o lixo, organizar a bagunça alheia). Faça-a silenciosamente e com perfeição, como se estivesse servindo ao próprio Cristo.",
            verse: "Servi uns aos outros pelo amor. (Gl 5, 13)",
            type: 'RELATIONSHIP'
        },
        {
            title: "Intercessão de Impacto",
            desc: "Nossa fé é comunitária, ninguém se salva sozinho.",
            action: "Escolha uma pessoa que você viu hoje no Mural de Orações ou no seu trabalho que está sofrendo. Pare o que está fazendo, reze um mistério do Terço especificamente por ela e, se possível, diga a ela: 'Estou contigo em oração'.",
            verse: "Orai uns pelos outros para serdes curados. (Tg 5, 16)",
            type: 'PRAYER'
        },
        {
            title: "A Escuta que Cura",
            desc: "Ouvir é o primeiro ato de caridade.",
            action: "Hoje, ao conversar com alguém, resista à vontade de falar de si ou dar conselhos. Apenas ouça com o coração. Dê à pessoa o presente da sua atenção total, sem pressa, como Jesus fazia.",
            verse: "Todo homem seja pronto para ouvir. (Tg 1, 19)",
            type: 'RELATIONSHIP'
        }
    ]
};

/**
 * Gera um desafio comunitário baseado no ciclo de 3 dias e na liturgia atual.
 */
const getDynamicHumanizedChallenge = (): CommunityChallenge => {
    const season = getSeasonDetailedInfo();
    const today = new Date();
    const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000);
    
    // Ciclo de 3 dias: Muda o desafio a cada 72 horas
    const cycleIndex = Math.floor(dayOfYear / 3);
    
    const pool = CHALLENGE_MATRIX[season.id] || CHALLENGE_MATRIX.ordinary;
    const selected = pool[cycleIndex % pool.length];

    // Ajustamos o título da temporada para ser mais inspirador
    const seasonTitles: Record<string, string> = {
      lent: "Caminho de Conversão",
      easter: "Alegria da Vida Nova",
      advent: "Vigilância da Esperança",
      christmas: "Deus Conosco",
      ordinary: "Santidade no Cotidiano"
    };

    return {
        id: `cycle-${cycleIndex}-${season.id}`,
        title: seasonTitles[season.id] || "Jornada da Alma",
        description: "Um passo concreto para transformar sua rotina em uma oferta viva.",
        currentAmount: 1500 + (cycleIndex * 15),
        targetAmount: 5000,
        unit: 'atos de amor',
        daysLeft: 3 - (dayOfYear % 3), // Dias restantes no ciclo atual de 3 dias
        seasonColor: season.color,
        icon: 'heart',
        type: 'season',
        startDate: new Date(),
        endDate: new Date(),
        status: 'active',
        participants: 850 + (cycleIndex % 100),
        isUserParticipating: false,
        userContribution: 0,
        currentDay: (dayOfYear % 3) + 1,
        totalDays: 3,
        dailyTopics: [
            {
                day: (dayOfYear % 3) + 1,
                title: selected.title,
                description: selected.desc,
                isCompleted: false,
                isLocked: false,
                actionType: selected.type,
                actionContent: selected.action,
                scripture: selected.verse
            }
        ]
    };
};

export const fetchGlobalChallenge = async (): Promise<CommunityChallenge | null> => {
    if (getConnectionStatus()) {
        try {
            const { data, error } = await supabase!.from('global_challenges').select('*').eq('status', 'active').maybeSingle();
            if (error) throw error;
            if (data) return {
                ...data,
                startDate: new Date(data.start_date),
                endDate: new Date(data.end_date),
                dailyTopics: data.daily_topics
            };
        } catch (e) {
            console.error("Erro ao buscar desafio no DB:", e);
        }
    }
    return getDynamicHumanizedChallenge();
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
