
import { supabase, getConnectionStatus, getSession, safeStringify } from './authService';
import { RoutineItem, PrayerIntention, JournalEntry, CommunityPost, Comment, Notification, LeaderboardData, CommunityChallenge } from '../types';

const DB_ROUTINE_KEY = 'espiritualizei_routine_db';
const DB_INTENTIONS_KEY = 'espiritualizei_intentions_db';
const DB_POSTS_KEY = 'espiritualizei_posts_db';
const DB_NOTIFICATIONS_KEY = 'espiritualizei_notifications_db';

export const savePartialLead = async (email: string, name: string, step: number, data: any) => {
  if (getConnectionStatus()) {
    try {
      await supabase.from('onboarding_leads').upsert({
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

export const fetchGlobalChallenge = async (): Promise<CommunityChallenge | null> => {
    if (getConnectionStatus()) {
        try {
            const { data, error } = await supabase.from('global_challenges').select('*').eq('status', 'active').maybeSingle();
            if (error) throw error;
            if (data) return {
                ...data,
                startDate: new Date(data.start_date),
                endDate: new Date(data.end_date),
                dailyTopics: data.daily_topics // Assume que o banco já retorna o array de tópicos
            };
        } catch (e) {
            console.error("Erro ao buscar desafio global:", e);
        }
    }
    return null;
};

export const updateLastConfessionDate = async (userId: string, date: Date) => {
    if (getConnectionStatus()) {
        await supabase.from('profiles').update({ last_confession_at: date.toISOString() }).eq('id', userId);
    }
};

export const fetchCommunityIntentions = async (userId: string): Promise<PrayerIntention[]> => {
  if (getConnectionStatus()) {
    const { data } = await supabase.from('intentions').select(`
        *,
        is_prayed:prayer_intercessions(user_id)
    `).order('timestamp', { ascending: false });
    
    return (data || []).map((i: any) => ({
        ...i,
        isPrayedByUser: i.is_prayed?.some((p: any) => p.user_id === userId)
    }));
  }
  const saved = localStorage.getItem(DB_INTENTIONS_KEY);
  return saved ? JSON.parse(saved) : [];
};

export const togglePrayerInteraction = async (intentionId: string) => {
  const session = getSession();
  if (!session || !getConnectionStatus()) return;

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
  if (!session || !getConnectionStatus()) return;

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
  if (getConnectionStatus()) {
    const payload = items.map(item => ({ ...item, user_id: userId }));
    await supabase.from('routines').upsert(payload);
  } else {
    localStorage.setItem(`${DB_ROUTINE_KEY}_${userId}`, safeStringify(items));
  }
};

export const fetchUserRoutine = async (userId: string): Promise<RoutineItem[]> => {
  if (getConnectionStatus()) {
    const { data } = await supabase.from('routines').select('*').eq('user_id', userId);
    return data || [];
  }
  const saved = localStorage.getItem(`${DB_ROUTINE_KEY}_${userId}`);
  return saved ? JSON.parse(saved) : [];
};

export const toggleRoutineItemStatus = async (id: string, completed: boolean) => {
  if (getConnectionStatus()) {
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

  if (getConnectionStatus()) {
    await supabase.from('intentions').insert([{ ...newItem, user_id: userId }]);
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
    await supabase.from('posts').insert([newPost]);
  }
  return newPost;
};

export const upgradeUserToPremium = async (userId: string) => {
  if (getConnectionStatus()) {
    await supabase.from('profiles').update({ is_premium: true, subscription_status: 'active' }).eq('id', userId);
  }
};

export const addRoutineItem = async (userId: string, item: RoutineItem) => {
  if (getConnectionStatus()) {
    await supabase.from('routines').insert([{ ...item, user_id: userId }]);
  }
};

export const deleteRoutineItem = async (id: string) => {
  if (getConnectionStatus()) {
    await supabase.from('routines').delete().eq('id', id);
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
    await supabase.from('journal').insert([entry]);
  }
};

export const fetchCommunityPosts = async (): Promise<CommunityPost[]> => {
  if (getConnectionStatus()) {
    const { data } = await supabase.from('posts').select('*, comments(*)').order('timestamp', { ascending: false });
    return (data || []).map((p: any) => ({
        ...p,
        timestamp: new Date(p.timestamp),
        comments: (p.comments || []).map((c: any) => ({ ...c, timestamp: new Date(c.timestamp) }))
    }));
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
    await supabase.from('comments').insert([{ ...newComment, post_id: postId }]);
  }
  return newComment;
};

export const fetchNotifications = async (userId: string): Promise<Notification[]> => {
  if (getConnectionStatus()) {
    const { data } = await supabase.from('notifications').select('*').eq('user_id', userId).order('created_at', { ascending: false });
    return (data || []).map((n: any) => ({ ...n, createdAt: new Date(n.created_at) }));
  }
  return [];
};

export const markNotificationAsRead = async (id: string) => {
  if (getConnectionStatus()) {
    await supabase.from('notifications').update({ is_read: true }).eq('id', id);
  }
};

export const fetchLeaderboard = async (): Promise<LeaderboardData> => {
  // Simulação de ranking real que poderia vir do Supabase
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
    const { data, error } = await supabase.storage.from(bucket).upload(fileName, file);
    if (error) throw error;
    const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(data.path);
    return publicUrl;
  }
  return undefined;
};
