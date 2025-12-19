
import { supabase, getConnectionStatus, getSession, safeStringify } from './authService';
import { RoutineItem, PrayerIntention, JournalEntry, CommunityPost, Comment, Notification, LeaderboardData } from '../types';

// Key for local storage fallbacks
const DB_ROUTINE_KEY = 'espiritualizei_routine_db';
const DB_INTENTIONS_KEY = 'espiritualizei_intentions_db';
const DB_POSTS_KEY = 'espiritualizei_posts_db';
const DB_NOTIFICATIONS_KEY = 'espiritualizei_notifications_db';

/**
 * SALVA UM LEAD PARCIAL (Resend/Recuperação)
 * Chamado assim que o usuário digita o e-mail no onboarding
 */
export const savePartialLead = async (email: string, name: string, step: number, data: any) => {
  if (getConnectionStatus()) {
    try {
      // Usamos upsert para atualizar o mesmo lead se ele mudar de passo
      const { error } = await supabase.from('onboarding_leads').upsert({
        email: email.toLowerCase().trim(),
        name: name,
        last_step: step,
        metadata: data,
        updated_at: new Date().toISOString()
      }, { onConflict: 'email' });
      
      if (error) console.warn("Erro ao salvar lead:", error.message);
    } catch (e) {
      console.warn("Falha de conexão ao salvar lead parcial", e);
    }
  }
};

/**
 * ATUALIZA USUÁRIO PARA PREMIUM
 */
export const upgradeUserToPremium = async (userId: string) => {
  if (getConnectionStatus()) {
    await supabase.from('profiles').update({ 
      is_premium: true, 
      subscription_status: 'active' 
    }).eq('id', userId);
  }
};

/**
 * ROTINA DO USUÁRIO
 */
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

/**
 * INTENÇÕES E ORAÇÕES
 */
export const fetchCommunityIntentions = async (userId: string): Promise<PrayerIntention[]> => {
  if (getConnectionStatus()) {
    const { data } = await supabase.from('intentions').select('*').order('timestamp', { ascending: false });
    return data || [];
  }
  const saved = localStorage.getItem(DB_INTENTIONS_KEY);
  return saved ? JSON.parse(saved) : [];
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
    await supabase.from('intentions').insert([newItem]);
  } else {
    const saved = localStorage.getItem(DB_INTENTIONS_KEY);
    const intentions = saved ? JSON.parse(saved) : [];
    intentions.unshift(newItem);
    localStorage.setItem(DB_INTENTIONS_KEY, safeStringify(intentions));
  }
  return newItem;
};

export const togglePrayerInteraction = async (id: string) => {
  if (getConnectionStatus()) {
    // In a real app, this would update a separate table or use a stored procedure
  }
};

/**
 * DIÁRIO DA ALMA
 */
export const createJournalEntry = async (userId: string, mood: string, content: string, reflection?: string, verse?: string) => {
  const entry: JournalEntry = {
    id: crypto.randomUUID(),
    mood: mood as any,
    content,
    aiReflection: reflection,
    bibleVerse: verse,
    createdAt: new Date()
  };
  if (getConnectionStatus()) {
    await supabase.from('journal').insert([{ ...entry, user_id: userId }]);
  }
};

/**
 * FEED DA COMUNIDADE
 */
export const fetchCommunityPosts = async (): Promise<CommunityPost[]> => {
  if (getConnectionStatus()) {
    const { data } = await supabase.from('posts').select('*, comments(*)').order('timestamp', { ascending: false });
    return data || [];
  }
  const saved = localStorage.getItem(DB_POSTS_KEY);
  return saved ? JSON.parse(saved) : [];
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
  } else {
    const saved = localStorage.getItem(DB_POSTS_KEY);
    const posts = saved ? JSON.parse(saved) : [];
    posts.unshift(newPost);
    localStorage.setItem(DB_POSTS_KEY, safeStringify(posts));
  }
  return newPost;
};

export const togglePostLike = async (postId: string) => {
  if (getConnectionStatus()) {
    // Supabase logic for likes
  }
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

/**
 * NOTIFICAÇÕES
 */
export const fetchNotifications = async (userId: string): Promise<Notification[]> => {
  if (getConnectionStatus()) {
    const { data } = await supabase.from('notifications').select('*').eq('user_id', userId).order('createdAt', { ascending: false });
    return data || [];
  }
  const saved = localStorage.getItem(DB_NOTIFICATIONS_KEY);
  return saved ? JSON.parse(saved) : [];
};

export const markNotificationAsRead = async (id: string) => {
  if (getConnectionStatus()) {
    await supabase.from('notifications').update({ isRead: true }).eq('id', id);
  }
};

/**
 * RANKING / LEADERBOARD
 */
export const fetchLeaderboard = async (): Promise<LeaderboardData> => {
  if (getConnectionStatus()) {
    // Real query for top users
  }
  // Mock data as fallback or for demo
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

/**
 * UPLOAD DE IMAGENS
 */
export const uploadImage = async (file: File, bucket: 'avatars' | 'posts'): Promise<string | undefined> => {
  if (getConnectionStatus()) {
    const fileName = `${Date.now()}_${file.name}`;
    const { data, error } = await supabase.storage.from(bucket).upload(fileName, file);
    if (error) throw error;
    const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(data.path);
    return publicUrl;
  }
  // Fallback to Data URL for local testing
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.readAsDataURL(file);
  });
};
