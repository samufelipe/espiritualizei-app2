
import { supabase, getConnectionStatus, getSession, safeStringify } from './authService';
import { RoutineItem, PrayerIntention, JournalEntry, CommunityPost, Comment, Notification, LeaderboardData, CommunityChallenge, DailyTopic } from '../types';
import { getSeasonDetailedInfo } from './liturgyService';

/**
 * Persistência de Rotina Espiritual
 */
export const saveUserRoutine = async (userId: string, items: RoutineItem[]) => {
  if (getConnectionStatus()) {
    try {
        await supabase!.from('routines').delete().eq('user_id', userId);
        const payload = items.map(item => ({ 
            id: item.id,
            user_id: userId,
            title: item.title,
            description: item.description,
            detailed_content: item.detailedContent || '',
            xp_reward: item.xpReward,
            completed: item.completed,
            icon: item.icon,
            time_of_day: item.timeOfDay,
            day_of_week: item.dayOfWeek,
            action_link: item.actionLink || 'NONE'
        }));
        const { error } = await supabase!.from('routines').insert(payload);
        if (error) throw error;
    } catch (e) {
        console.error("Erro ao salvar rotina:", e);
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

/**
 * GERAÇÃO DE DESAFIOS INTERATIVOS E RELACIONAIS (FALLBACK DETERMINÍSTICO)
 */
const generateDeterministicChallenge = (date: Date): CommunityChallenge => {
  const season = getSeasonDetailedInfo(date);
  const dayOfMonth = date.getDate();
  const dayOfWeek = date.getDay(); // 0-6

  // Banco de tarefas por categoria
  const tasks = {
    RELATIONAL: [
      { title: "Intercessão Amiga", desc: "Ligue para um amigo que não fala há tempo e pergunte como pode rezar por ele.", action: "Faça uma ligação ou mande um áudio pessoal hoje." },
      { title: "Perdão Oculto", desc: "Reze um mistério do terço por alguém que te magoou profundamente.", action: "Não conte a ninguém, apenas ofereça a oração." },
      { title: "Honra aos Pais", desc: "Faça um elogio sincero ou um gesto de serviço para seus pais ou alguém mais velho.", action: "Demonstre gratidão por quem te antecedeu." }
    ],
    WORK_ROUTINE: [
      { title: "Trabalho Santificado", desc: "Realize sua tarefa mais difícil hoje com perfeição e sem reclamar.", action: "Ofereça o cansaço pela conversão dos pecadores." },
      { title: "Ordem na Mesa", desc: "Organize seu ambiente de trabalho ou casa como se estivesse preparando um altar.", action: "Deus habita na ordem e no capricho." },
      { title: "Silêncio Heroico", desc: "Passe 1 hora do seu expediente ou rotina sem checar redes sociais ou conversas inúteis.", action: "Foque totalmente na sua missão presente." }
    ],
    PRAYER_SACRIFICE: [
      { title: "Visita ao Rei", desc: "Passe em frente a uma Igreja e faça o sinal da cruz, ou entre por 5 minutos.", action: "Reconheça a presença real de Jesus no sacrário." },
      { title: "Oferta do Gosto", desc: "Abstenha-se de algo que você gosta muito (café, doce, música) por amor a Deus.", action: "Fortaleça sua vontade contra os sentidos." },
      { title: "Misericórdia Concreta", desc: "Dê um alimento ou uma palavra de esperança real para alguém em necessidade.", action: "Toque na carne sofredora de Cristo." }
    ]
  };

  // Seleciona tarefas baseadas no dia do mês para variar
  const getTask = (list: any[], seed: number) => list[seed % list.length];

  const dailyTopics: DailyTopic[] = [
    { 
        day: 1, 
        ...getTask(tasks.RELATIONAL, dayOfMonth),
        isCompleted: false, isLocked: false, actionType: 'RELATIONSHIP'
    },
    { 
        day: 2, 
        ...getTask(tasks.WORK_ROUTINE, dayOfMonth + 1),
        isCompleted: false, isLocked: false, actionType: 'GENERIC'
    },
    { 
        day: 3, 
        ...getTask(tasks.PRAYER_SACRIFICE, dayOfMonth + 2),
        isCompleted: false, isLocked: false, actionType: 'SACRIFICE'
    }
  ];

  // Ajusta o desafio baseado na temporada
  let title = `Jornada: ${season.theme}`;
  let description = `Um caminho de 3 dias focado em ${season.theme.toLowerCase()} no seu cotidiano.`;

  return {
    id: `generated-${season.id}-${dayOfMonth}`,
    title,
    description,
    currentAmount: 2450 + (dayOfMonth * 10),
    targetAmount: 10000,
    unit: 'gestos',
    daysLeft: 7 - (dayOfMonth % 7),
    seasonColor: season.color,
    icon: season.id === 'lent' ? 'cross' : season.id === 'easter' ? 'star' : 'fire',
    type: 'season',
    startDate: new Date(),
    endDate: new Date(),
    status: 'active',
    participants: 1200 + (dayOfMonth * 5),
    userContribution: 0,
    currentDay: (dayOfMonth % 3) + 1,
    totalDays: 3,
    dailyTopics
  };
};

/**
 * BUSCA DE DESAFIO COMUNITÁRIO (Com Garantia de Exibição)
 */
export const fetchGlobalChallenge = async (): Promise<CommunityChallenge | null> => {
  try {
    if (getConnectionStatus()) {
        const { data, error } = await supabase!
            .from('challenges')
            .select('*')
            .eq('status', 'active')
            .maybeSingle();
        
        if (data && !error) {
            // Se o dado do Supabase existir, tentamos enriquecer ou usar o que veio
            return {
                ...data,
                startDate: new Date(data.start_date),
                endDate: new Date(data.end_date)
            };
        }
    }
  } catch (e) {
    console.warn("DB offline ou erro na busca. Gerando desafio determinístico...");
  }

  // RETORNO GARANTIDO: Nunca retorna null
  return generateDeterministicChallenge(new Date());
};

// ... restante das funções do databaseService ...
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
      { id: '3', userId: 'u3', userName: 'Ana Souza', score: 850, rank: 3, badges: ['top3'] }
    ],
    pilgrims: [
      { id: 'p1', userId: 'up1', userName: 'José Santos', score: 15, rank: 1, badges: ['streak'] }
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
