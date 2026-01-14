
import { supabase, getConnectionStatus, getSession, safeStringify } from './authService';
import { RoutineItem, PrayerIntention, JournalEntry, CommunityPost, Comment, Notification, LeaderboardData, CommunityChallenge, DailyTopic } from '../types';
import { getSeasonDetailedInfo } from './liturgyService';

/**
 * GERAÇÃO DE DESAFIOS INTERATIVOS SINCRONIZADOS (3 DIAS)
 * Esta lógica garante que o desafio mude a cada 3 dias e seja temático ao tempo da Igreja.
 */
const generateDeterministicChallenge = (date: Date): CommunityChallenge => {
  const season = getSeasonDetailedInfo(date);
  
  // Cálculo do ciclo de 3 dias (72 horas)
  const MS_PER_DAY = 24 * 60 * 60 * 1000;
  const cycleId = Math.floor(date.getTime() / (MS_PER_DAY * 3));
  
  // Verifica proximidade da Quaresma 2026 (18/02/2026)
  const isPreLent = date.getMonth() === 1 && date.getDate() < 18 && date.getFullYear() === 2026;
  const isLent = (date.getMonth() === 1 && date.getDate() >= 18 && date.getFullYear() === 2026) || season.id === 'lent';

  // Pool de tarefas temáticas
  const taskPool = {
    ORDINARY: {
        RELATIONAL: [
            { title: "Caridade no Olhar", desc: "Procure uma qualidade em alguém que você costuma criticar e elogie essa pessoa hoje.", action: "Mude o ambiente com um elogio sincero.", script: "Acima de tudo, cultivai o amor, que é o laço da perfeição. (Col 3, 14)" },
            { title: "Escuta Fraterna", desc: "Dedique 10 minutos para ouvir alguém sem interromper ou dar conselhos não pedidos.", action: "Seja o ouvido de Cristo para um irmão.", script: "Todo homem deve ser pronto para ouvir, tardio para falar. (Tg 1, 19)" }
        ],
        SACRIFICE: [
            { title: "Pontualidade Sagrada", desc: "Cumpra rigorosamente seu horário de trabalho ou compromisso como oferta a Deus.", action: "Deus habita na ordem. Seja pontual.", script: "O que fizerdes, fazei-o de bom coração, como para o Senhor. (Col 3, 23)" },
            { title: "Doce Renúncia", desc: "Abstenha-se de reclamar do clima, do trânsito ou do cansaço durante todo o dia.", action: "Transforme reclamação em oração silenciosa.", script: "Fazei tudo sem murmurações nem críticas. (Fl 2, 14)" }
        ]
    },
    LENT: {
        PRAYER: [
            { title: "Deserto Interior", desc: "Passe 15 minutos em silêncio absoluto, sem celular ou distrações, apenas ouvindo Deus.", action: "Abra espaço para a voz do Espírito Santo.", script: "Conduzi-la-ei ao deserto e falarei ao seu coração. (Os 2, 16)" },
            { title: "Via Sacra Viva", desc: "Ao sentir qualquer dor ou cansaço hoje, una esse sofrimento à Paixão de Cristo.", action: "Sua cruz diária é o caminho da glória.", script: "Quem quiser vir após mim, negue-se a si mesmo e tome sua cruz. (Mt 16, 24)" }
        ],
        FASTING: [
            { title: "Jejum de Telas", desc: "Desligue todas as notificações não essenciais e só use redes sociais para o necessário.", action: "Recupere o controle da sua atenção para o Céu.", script: "Vigiai e orai, para que não entreis em tentação. (Mt 26, 41)" },
            { title: "Mesa Humilde", desc: "Faça uma refeição mais simples hoje e ofereça a diferença em esmola ou oração.", action: "Alimente a alma mortificando o corpo.", script: "Nem só de pão vive o homem. (Mt 4, 4)" }
        ]
    }
  };

  // Seleção baseada no tempo litúrgico
  const activePool = (isLent || isPreLent) ? taskPool.LENT : taskPool.ORDINARY;
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
    actionType: typeKey === 'RELATIONAL' ? 'RELATIONSHIP' : (typeKey === 'FASTING' || typeKey === 'SACRIFICE' ? 'SACRIFICE' : 'PRAYER')
  }));

  const themeName = isLent ? "Caminho do Calvário" : isPreLent ? "Vigília do Deserto" : "Fé no Cotidiano";

  return {
    id: `liturgical-cycle-${cycleId}`,
    title: `Jornada: ${themeName}`,
    description: `Um ciclo de 3 dias para fortalecer sua ${isLent ? 'conversão' : 'constância'} através de gestos concretos.`,
    currentAmount: 0,
    targetAmount: 5000,
    unit: 'atos de amor',
    daysLeft: 3 - (Math.floor((date.getTime() / MS_PER_DAY)) % 3),
    seasonColor: isLent ? '#7C3AED' : '#10B981',
    icon: isLent ? 'cross' : 'fire',
    type: 'season',
    startDate: new Date(cycleId * 3 * MS_PER_DAY),
    endDate: new Date((cycleId + 1) * 3 * MS_PER_DAY),
    status: 'active',
    participants: 1450 + (cycleId % 100),
    userContribution: 0,
    currentDay: (Math.floor(date.getTime() / MS_PER_DAY) % 3) + 1,
    totalDays: 3,
    dailyTopics
  };
};

/**
 * BUSCA DE DESAFIO COMUNITÁRIO
 * Tenta buscar do Supabase primeiro, senão gera o desafio litúrgico do ciclo atual.
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
            return {
                ...data,
                startDate: new Date(data.start_date),
                endDate: new Date(data.end_date)
            };
        }
    }
  } catch (e) {
    console.warn("Gerando desafio litúrgico automático.");
  }
  return generateDeterministicChallenge(new Date());
};

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
