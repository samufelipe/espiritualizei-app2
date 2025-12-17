
import { supabase, getConnectionStatus, getSession, safeStringify } from './authService';
import { RoutineItem, PrayerIntention, JournalEntry, CommunityPost, Comment, Notification, KnowledgeTrack, LeaderboardData } from '../types';

const getLocalKey = (baseKey: string, userId?: string) => {
   const currentUserId = userId || getSession()?.user?.id || 'guest';
   return `${baseKey}_${currentUserId}`;
};

const BASE_KEYS = {
   ROUTINE: 'espiritualizei_routine_local',
   INTENTIONS: 'espiritualizei_intentions_local',
   JOURNAL: 'espiritualizei_journal_local',
   POSTS: 'espiritualizei_posts_local',
   NOTIFICATIONS: 'espiritualizei_notifications_local'
};

export const testDatabaseConnection = async (): Promise<{ success: boolean; message: string }> => {
  if (!getConnectionStatus()) {
     return { success: false, message: "Modo Offline" };
  }
  return { success: true, message: "Conectado." };
};

// --- DEV TOOLS ---
export const devHardReset = () => {
    // Limpa chaves específicas do Mock Mode
    localStorage.removeItem('espiritualizei_users_db');
    localStorage.removeItem('espiritualizei_session');
    
    // Limpa dados de funcionalidades
    Object.values(BASE_KEYS).forEach(key => {
        // Tenta limpar variações da chave
        localStorage.removeItem(key);
        // Limpa chaves com prefixos comuns
        for (let i = 0; i < localStorage.length; i++) {
            const k = localStorage.key(i);
            if (k && k.includes(key)) {
                localStorage.removeItem(k);
            }
        }
    });

    // Limpa caches do Gemini
    for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && (k.startsWith('gemini_') || k.startsWith('liturgy_'))) {
            localStorage.removeItem(k);
        }
    }

    // Recarrega a página para resetar estados de memória
    window.location.reload();
};

export const fetchLeaderboard = async (): Promise<LeaderboardData> => {
  await new Promise(resolve => setTimeout(resolve, 600));
  return {
    intercessors: [
      { id: '1', userId: 'u1', userName: 'Maria Clara', score: 142, rank: 1, badges: ['top3', 'veteran'], avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=100' },
      { id: '2', userId: 'u2', userName: 'João Paulo', score: 98, rank: 2, badges: ['top3'] },
      { id: '3', userId: 'u3', userName: 'Ana Beatriz', score: 85, rank: 3, badges: ['top3'] },
      { id: '4', userId: 'u4', userName: 'Carlos E.', score: 62, rank: 4 },
      { id: '5', userId: 'u5', userName: 'Fernanda S.', score: 45, rank: 5 }
    ],
    pilgrims: [
      { id: '6', userId: 'u6', userName: 'Ricardo O.', score: 45, rank: 1, badges: ['top3', 'streak'] }, 
      { id: '7', userId: 'u7', userName: 'Gustavo H.', score: 32, rank: 2, badges: ['top3', 'streak'] },
      { id: '8', userId: 'u8', userName: 'Lúcia F.', score: 28, rank: 3, badges: ['top3'] },
      { id: '9', userId: 'u9', userName: 'Pe. Marcelo', score: 21, rank: 4, badges: ['veteran'] },
      { id: '10', userId: 'u10', userName: 'Rafael M.', score: 14, rank: 5 }
    ]
  };
};

// --- ROUTINES CRUD (FIXED) ---

export const saveUserRoutine = async (userId: string, routine: RoutineItem[]) => {
  if (getConnectionStatus()) {
    try {
        await supabase.from('user_routines').delete().eq('user_id', userId);
        
        const dbItems = routine.map(item => ({
          user_id: userId,
          title: item.title,
          description: item.description,
          detailed_content: item.detailedContent,
          icon: item.icon,
          xp_reward: item.xpReward,
          completed: item.completed,
          day_of_week: item.dayOfWeek,
          time_of_day: item.timeOfDay
        }));

        if (dbItems.length > 0) {
            const { error } = await supabase.from('user_routines').insert(dbItems);
            if (error) {
                console.warn("Save Routine Failed:", error.message);
                const key = getLocalKey(BASE_KEYS.ROUTINE, userId);
                localStorage.setItem(key, safeStringify(routine));
            }
        }
    } catch (e) {
        console.error("Critical DB Error (Routine):", e);
    }
  } else {
    const key = getLocalKey(BASE_KEYS.ROUTINE, userId);
    localStorage.setItem(key, safeStringify(routine));
  }
};

export const addRoutineItem = async (userId: string, item: RoutineItem) => {
  if (getConnectionStatus()) {
    try {
        const dbItem = {
          user_id: userId,
          title: item.title,
          description: item.description,
          detailed_content: item.detailedContent,
          icon: item.icon,
          xp_reward: item.xpReward,
          completed: false,
          day_of_week: item.dayOfWeek,
          time_of_day: item.timeOfDay
        };
        const { error } = await supabase.from('user_routines').insert([dbItem]);
        if (error) throw error;
    } catch (e) {
        console.warn("Add item failed, saving locally:", e);
        const key = getLocalKey(BASE_KEYS.ROUTINE, userId);
        const routine = JSON.parse(localStorage.getItem(key) || '[]');
        routine.push(item);
        localStorage.setItem(key, safeStringify(routine));
    }
  } else {
    const key = getLocalKey(BASE_KEYS.ROUTINE, userId);
    const routine = JSON.parse(localStorage.getItem(key) || '[]');
    routine.push(item);
    localStorage.setItem(key, safeStringify(routine));
  }
};

export const deleteRoutineItem = async (itemId: string) => {
  const isLocalId = itemId.length < 20 || itemId.startsWith('gen-') || itemId.startsWith('f');

  if (getConnectionStatus() && !isLocalId) {
      const { error } = await supabase.from('user_routines').delete().eq('id', itemId);
      if (error) console.error("Delete failed", error);
  }
  
  const userId = getSession()?.user?.id;
  const key = getLocalKey(BASE_KEYS.ROUTINE, userId);
  const routine = JSON.parse(localStorage.getItem(key) || '[]');
  const newRoutine = routine.filter((i: any) => i.id !== itemId);
  localStorage.setItem(key, safeStringify(newRoutine));
};

export const fetchUserRoutine = async (userId: string): Promise<RoutineItem[]> => {
  if (getConnectionStatus()) {
    const { data, error } = await supabase
      .from('user_routines')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });

    if (!error && data && data.length > 0) {
        return data.map((item: any) => ({
          id: item.id,
          title: item.title,
          description: item.description,
          detailedContent: item.detailed_content,
          icon: item.icon,
          xpReward: item.xp_reward,
          completed: item.completed,
          dayOfWeek: item.day_of_week || [0,1,2,3,4,5,6],
          timeOfDay: item.time_of_day || 'morning',
          actionLink: 'NONE'
        }));
    }
  }
  
  const key = getLocalKey(BASE_KEYS.ROUTINE, userId);
  const local = localStorage.getItem(key);
  return local ? JSON.parse(local) : [];
};

export const toggleRoutineItemStatus = async (itemId: string, completed: boolean) => {
  const isLocalId = itemId.length < 20 || itemId.startsWith('gen-') || itemId.startsWith('f');

  if (getConnectionStatus() && !isLocalId) {
        await supabase
        .from('user_routines')
        .update({ completed: completed })
        .eq('id', itemId);
  } 
  
  const userId = getSession()?.user?.id; 
  const key = getLocalKey(BASE_KEYS.ROUTINE, userId);
  const routine = JSON.parse(localStorage.getItem(key) || '[]');
  const idx = routine.findIndex((i: any) => i.id === itemId);
  if(idx >= 0) {
    routine[idx].completed = completed;
    localStorage.setItem(key, safeStringify(routine));
  }
};

export const createIntention = async (userId: string, authorName: string, authorAvatar: string | undefined, content: string, category: string, tags: string[]): Promise<PrayerIntention | null> => {
  const newIntention = {
    user_id: userId,
    author_name: authorName,
    author_avatar: authorAvatar || null,
    content,
    category,
    tags,
    praying_count: 0
  };

  if (getConnectionStatus()) {
    const { data, error } = await supabase
      .from('prayer_intentions')
      .insert([newIntention])
      .select()
      .single();
    
    if (!error && data) {
        return {
          id: data.id,
          author: data.author_name,
          authorAvatar: data.author_avatar,
          content: data.content,
          prayingCount: 0,
          isPrayedByUser: false,
          timestamp: new Date(data.created_at),
          category: data.category,
          tags: data.tags
        };
    }
    console.error("Create Intention DB Error:", error);
  } 
  
  const key = getLocalKey(BASE_KEYS.INTENTIONS, 'global'); 
  const localIntentions = JSON.parse(localStorage.getItem(key) || '[]');
  const mockItem = {
    id: crypto.randomUUID(),
    author: authorName,
    authorAvatar: authorAvatar,
    content,
    category,
    tags,
    prayingCount: 0,
    isPrayedByUser: false,
    timestamp: new Date()
  };
  localIntentions.unshift(mockItem);
  localStorage.setItem(key, safeStringify(localIntentions));
  return mockItem as any;
};

export const fetchCommunityIntentions = async (currentUserId: string): Promise<PrayerIntention[]> => {
  if (getConnectionStatus()) {
    const { data: intentions, error } = await supabase
      .from('prayer_intentions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (!error && intentions) {
        const { data: interactions } = await supabase
          .from('prayer_interactions')
          .select('intention_id')
          .eq('user_id', currentUserId);

        const prayedIds = new Set(interactions?.map((i: any) => i.intention_id));

        return intentions.map((i: any) => ({
          id: i.id,
          author: i.author_name || 'Anônimo',
          authorAvatar: i.author_avatar,
          content: i.content,
          prayingCount: i.praying_count || 0,
          isPrayedByUser: prayedIds.has(i.id),
          timestamp: new Date(i.created_at),
          category: i.category,
          tags: i.tags || []
        }));
    }
  } 
  
  const key = getLocalKey(BASE_KEYS.INTENTIONS, 'global');
  const local = localStorage.getItem(key);
  return local ? JSON.parse(local) : [];
};

export const togglePrayerInteraction = async (intentionId: string) => {
  if (getConnectionStatus()) {
    const session = getSession();
    const userId = session?.user?.id;
    if (!userId) return;

    try {
        const { error: rpcError } = await supabase.rpc('toggle_prayer', { intention_id_input: intentionId });
        if (rpcError) throw rpcError;
    } catch (e) {
        const { data: existing } = await supabase
            .from('prayer_interactions')
            .select('*')
            .eq('user_id', userId)
            .eq('intention_id', intentionId)
            .single();

        if (existing) {
            await supabase.from('prayer_interactions').delete().eq('id', existing.id);
            const { data: current } = await supabase.from('prayer_intentions').select('praying_count').eq('id', intentionId).single();
            if (current) {
                await supabase.from('prayer_intentions').update({ praying_count: Math.max(0, current.praying_count - 1) }).eq('id', intentionId);
            }
        } else {
            await supabase.from('prayer_interactions').insert([{ user_id: userId, intention_id: intentionId }]);
            const { data: current } = await supabase.from('prayer_intentions').select('praying_count').eq('id', intentionId).single();
            if (current) {
                await supabase.from('prayer_intentions').update({ praying_count: current.praying_count + 1 }).eq('id', intentionId);
            }
        }
    }
  } else {
    const key = getLocalKey(BASE_KEYS.INTENTIONS, 'global');
    const local = JSON.parse(localStorage.getItem(key) || '[]');
    const idx = local.findIndex((i: any) => i.id === intentionId);
    if (idx >= 0) {
      if (local[idx].isPrayedByUser) {
        local[idx].prayingCount--;
        local[idx].isPrayedByUser = false;
      } else {
        local[idx].prayingCount++;
        local[idx].isPrayedByUser = true;
      }
      localStorage.setItem(key, safeStringify(local));
    }
  }
};

export const fetchCommunityPosts = async (): Promise<CommunityPost[]> => {
   const key = getLocalKey(BASE_KEYS.POSTS, 'global');
   const local = localStorage.getItem(key);
   if (local) return JSON.parse(local);
   const seeds: CommunityPost[] = [{
         id: 'post-1',
         userId: 'user-1',
         userName: 'Maria Silva',
         userAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=100',
         content: 'Hoje completei o 5º dia da Novena! Sentindo muita paz.',
         imageUrl: 'https://images.unsplash.com/photo-1515558679601-fc3d43c3856f?auto=format&fit=crop&q=80&w=600',
         likesCount: 12,
         commentsCount: 1,
         isLikedByUser: false,
         timestamp: new Date(),
         type: 'challenge_update',
         contextTag: 'Novena',
         comments: []
      }];
   localStorage.setItem(key, safeStringify(seeds));
   return seeds;
};

export const createCommunityPost = async (userId: string, userName: string, userAvatar: string | undefined, content: string, imageUrl?: string): Promise<CommunityPost> => {
   const newPost = { 
       id: crypto.randomUUID(), 
       userId, 
       userName, 
       userAvatar, 
       content, 
       imageUrl, 
       likesCount: 0, 
       commentsCount: 0, 
       isLikedByUser: false, 
       timestamp: new Date(), 
       type: imageUrl ? 'inspiration' : 'testimony', 
       contextTag: 'Novo', 
       comments: [] 
   };
   const key = getLocalKey(BASE_KEYS.POSTS, 'global');
   const posts = JSON.parse(localStorage.getItem(key) || '[]');
   posts.unshift(newPost);
   localStorage.setItem(key, safeStringify(posts));
   return newPost as any;
};

export const togglePostLike = async (postId: string) => {
   const key = getLocalKey(BASE_KEYS.POSTS, 'global');
   const posts = JSON.parse(localStorage.getItem(key) || '[]');
   const idx = posts.findIndex((p: any) => p.id === postId);
   if (idx >= 0) {
      if (posts[idx].isLikedByUser) { posts[idx].likesCount--; posts[idx].isLikedByUser = false; } 
      else { posts[idx].likesCount++; posts[idx].isLikedByUser = true; }
      localStorage.setItem(key, safeStringify(posts));
   }
};

export const addComment = async (postId: string, userId: string, userName: string, content: string): Promise<Comment> => {
   const key = getLocalKey(BASE_KEYS.POSTS, 'global');
   const posts = JSON.parse(localStorage.getItem(key) || '[]');
   const idx = posts.findIndex((p: any) => p.id === postId);
   const newComment = { id: crypto.randomUUID(), userId, userName, content, timestamp: new Date() };
   if (idx >= 0) {
      if (!posts[idx].comments) posts[idx].comments = [];
      posts[idx].comments.push(newComment);
      posts[idx].commentsCount = posts[idx].comments.length;
      localStorage.setItem(key, safeStringify(posts));
   }
   return newComment;
};

export const createJournalEntry = async (userId: string, mood: string, content: string, aiReflection?: string, bibleVerse?: string): Promise<JournalEntry | null> => {
    const entry = { user_id: userId, mood, content, ai_reflection: aiReflection, bible_verse: bibleVerse };
    if (getConnectionStatus()) {
        const { data, error } = await supabase.from('journal_entries').insert([entry]).select().single();
        if(error) {
            console.error("Journal save error", error);
            const key = getLocalKey(BASE_KEYS.JOURNAL, userId);
            const local = JSON.parse(localStorage.getItem(key) || '[]');
            const mock = { id: crypto.randomUUID(), mood, content, aiReflection, bibleVerse, createdAt: new Date() };
            local.unshift(mock);
            localStorage.setItem(key, safeStringify(local));
            return mock as any;
        }
        return { id: data.id, mood: data.mood, content: data.content, aiReflection: data.ai_reflection, bibleVerse: data.bible_verse, createdAt: new Date(data.created_at) };
    } else {
        const key = getLocalKey(BASE_KEYS.JOURNAL, userId);
        const local = JSON.parse(localStorage.getItem(key) || '[]');
        const mock = { id: crypto.randomUUID(), mood, content, aiReflection, bibleVerse, createdAt: new Date() };
        local.unshift(mock);
        localStorage.setItem(key, safeStringify(local));
        return mock as any;
    }
};

export const deleteUserAccount = async () => {
    if (getConnectionStatus()) { 
        try {
            await supabase.rpc('delete_user_account');
        } catch(e) {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
               await supabase.from('user_routines').delete().eq('user_id', user.id);
               await supabase.from('prayer_intentions').delete().eq('user_id', user.id);
               await supabase.from('journal_entries').delete().eq('user_id', user.id);
               await supabase.from('profiles').delete().eq('id', user.id);
            }
        }
    }
    localStorage.clear();
};

export const fetchNotifications = async (userId: string): Promise<Notification[]> => {
  if (getConnectionStatus()) {
    const { data, error } = await supabase.from('notifications').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(20);
    if (error) return [];
    return data.map((n: any) => ({ id: n.id, type: n.type, content: n.content, isRead: n.is_read, createdAt: new Date(n.created_at), resourceId: n.resource_id }));
  } else {
    const key = getLocalKey(BASE_KEYS.NOTIFICATIONS, userId);
    const local = localStorage.getItem(key);
    return local ? JSON.parse(local) : [];
  }
};

export const markNotificationAsRead = async (notificationId: string) => {
  if (getConnectionStatus()) {
    await supabase.from('notifications').update({ is_read: true }).eq('id', notificationId);
  } else {
    const userId = getSession()?.user?.id;
    const key = getLocalKey(BASE_KEYS.NOTIFICATIONS, userId);
    const local = JSON.parse(localStorage.getItem(key) || '[]');
    const idx = local.findIndex((n: any) => n.id === notificationId);
    if(idx >= 0) { local[idx].isRead = true; localStorage.setItem(key, safeStringify(local)); }
  }
};

// --- IMAGE UPLOAD SERVICE (Implemented) ---
export const uploadImage = async (file: File, bucket: string): Promise<string> => {
  // 1. SUPABASE MODE
  if (getConnectionStatus()) {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
      return data.publicUrl;
    } catch (error) {
      console.error('Error uploading image to Supabase:', error);
      // Fallback to Base64 if bucket fails (rare but safe)
    }
  }

  // 2. MOCK MODE (Base64 + Resize)
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            // Resize logic to avoid large strings in LocalStorage
            const MAX_WIDTH = 300; 
            const MAX_HEIGHT = 300;
            let width = img.width;
            let height = img.height;

            if (width > height) {
              if (width > MAX_WIDTH) {
                height *= MAX_WIDTH / width;
                width = MAX_WIDTH;
              }
            } else {
              if (height > MAX_HEIGHT) {
                width *= MAX_HEIGHT / height;
                height = MAX_HEIGHT;
              }
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx?.drawImage(img, 0, 0, width, height);
            
            // Compress to JPEG 0.7 quality
            resolve(canvas.toDataURL('image/jpeg', 0.7));
        };
        img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
};

export const fetchKnowledgeTracks = async (): Promise<any[]> => { return []; }
export const upgradeUserToPremium = async (uid: string) => {};
