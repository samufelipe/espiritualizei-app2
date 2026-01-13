
import { supabase, getConnectionStatus, getSession, safeStringify } from './authService';
import { RoutineItem, PrayerIntention, JournalEntry, CommunityPost, Comment, Notification, LeaderboardData, CommunityChallenge } from '../types';

const DB_ROUTINE_KEY = 'espiritualizei_routine_db';
const DB_INTENTIONS_KEY = 'espiritualizei_intentions_db';

export const savePartialLead = async (email: string, name: string, step: number, data: any) => {
  if (supabase) {
    try {
      await supabase.from('onboarding_leads').upsert({
        email: email.toLowerCase().trim(),
        name: name,
        last_step: step,
        metadata: data,
        updated_at: new Date().toISOString()
      }, { onConflict: 'email' });
    } catch (e) {
      console.warn("Falha ao salvar lead parcial (tabela pode não existir)", e);
    }
  }
};

export const fetchGlobalChallenge = async (): Promise<CommunityChallenge | null> => {
    if (supabase) {
        try {
            const { data, error } = await supabase.from('global_challenges').select('*').eq('status', 'active').maybeSingle();
            if (error) throw error;
            if (data) return {
                ...data,
                startDate: new Date(data.start_date),
                endDate: new Date(data.end_date),
                dailyTopics: data.daily_topics
            };
        } catch (e) {
            console.error("Erro ao buscar desafio global:", e);
        }
    }
    return null;
};

export const updateLastConfessionDate = async (userId: string, date: Date) => {
    if (supabase) {
        await supabase.from('profiles').update({ last_confession_at: date.toISOString() }).eq('id', userId);
    }
};

export const fetchCommunityIntentions = async (userId: string): Promise<PrayerIntention[]> => {
  if (supabase) {
    try {
        const { data, error } = await supabase.from('intentions').select(`
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
  const saved = localStorage.getItem(DB_INTENTIONS_KEY);
  return saved ? JSON.parse(saved) : [];
};

export const togglePrayerInteraction = async (intentionId: string) => {
  const session = getSession();
  if (!session || !supabase) return;

  const { data: existing } = await supabase.from('prayer_intercessions')
    .select('*')
    .eq('intention_id', intentionId)
    .eq('user_id', session.user.id)
    .maybeSingle();

  if (existing) {
    await supabase.from('prayer_intercessions').delete().eq('id', existing.id);
    await supabase.rpc('decrement_praying_count', { row_id: intentionId });
  } else {
    await supabase.from('prayer_intercessions').insert([{ intention_id: intentionId, user_id: session.user.id }]);
    await supabase.rpc('increment_praying_count', { row_id: intentionId });
  }
};

export const togglePostLike = async (postId: string) => {
  const session = getSession();
  if (!session || !supabase) return;

  const { data: existing } = await supabase.from('post_likes')
    .select('*')
    .eq('post_id', postId)
    .eq('user_id', session.user.id)
    .maybeSingle();

  if (existing) {
    await supabase.from('post_likes').delete().eq('id', existing.id);
    await supabase.rpc('decrement_likes_count', { row_id: postId });
  } else {
    await supabase.from('post_likes').insert([{ post_id: postId, user_id: session.user.id }]);
    await supabase.rpc('increment_likes_count', { row_id: postId });
  }
};

export const saveUserRoutine = async (userId: string, items: RoutineItem[]) => {
  if (supabase) {
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
        const { error } = await supabase.from('routines').upsert(payload);
        if (error) throw error;
    } catch (e) {
        console.error("Erro ao salvar rotina no Supabase:", e);
    }
  } else {
    localStorage.setItem(`${DB_ROUTINE_KEY}_${userId}`, safeStringify(items));
  }
};

export const fetchUserRoutine = async (userId: string): Promise<RoutineItem[]> => {
  if (supabase) {
    try {
        const { data, error } = await supabase.from('routines').select('*').eq('user_id', userId);
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
        return [];
    }
  }
  const saved = localStorage.getItem(`${DB_ROUTINE_KEY}_${userId}`);
  return saved ? JSON.parse(saved) : [];
};

export const toggleRoutineItemStatus = async (id: string, completed: boolean) => {
  if (supabase) {
    await supabase.from('routines').update({ completed }).eq('id', id);
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

  if (supabase) {
    await supabase.from('intentions').insert([{ 
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

  if (supabase) {
    await supabase.from('posts').insert([{
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
  if (supabase) {
    await supabase.from('profiles').update({ is_premium: true, subscription_status: 'active' }).eq('id', userId);
  }
};

export const addRoutineItem = async (userId: string, item: RoutineItem) => {
  if (supabase) {
    await supabase.from('routines').insert([{ 
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
  if (supabase) {
    await supabase.from('routines').delete().eq('id', id);
  }
};

export const createJournalEntry = async (userId: string, mood: string, content: string, reflection?: string, verse?: string) => {
  if (supabase) {
    const entry = {
      id: crypto.randomUUID(),
      mood,
      content,
      ai_reflection: reflection,
      bible_verse: verse,
      user_id: userId,
      created_at: new Date().toISOString()
    };
    await supabase.from('journal').insert([entry]);
  }
};

export const fetchCommunityPosts = async (): Promise<CommunityPost[]> => {
  if (supabase) {
    try {
        const { data, error } = await supabase.from('posts').select('*, comments(*)').order('timestamp', { ascending: false });
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
            isLikedByUser: false, // Idealmente checar via post_likes
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
  if (supabase) {
    await supabase.from('comments').insert([{ 
        id: newComment.id,
        post_id: postId,
        user_id: userId,
        user_name: userName,
        content: content,
        timestamp: newComment.timestamp.toISOString()
    }]);
    await supabase.rpc('increment_comments_count', { row_id: postId });
  }
  return newComment;
};

export const fetchNotifications = async (userId: string): Promise<Notification[]> => {
  if (supabase) {
    const { data } = await supabase.from('notifications').select('*').eq('user_id', userId).order('created_at', { ascending: false });
    return (data || []).map((n: any) => ({ ...n, createdAt: new Date(n.created_at) }));
  }
  return [];
};

export const markNotificationAsRead = async (id: string) => {
  if (supabase) {
    await supabase.from('notifications').update({ is_read: true }).eq('id', id);
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
  if (supabase) {
    const fileName = `${Date.now()}_${file.name}`;
    const { data, error } = await supabase.storage.from(bucket).upload(fileName, file);
    if (error) throw error;
    const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(data.path);
    return publicUrl;
  }
  return undefined;
};
