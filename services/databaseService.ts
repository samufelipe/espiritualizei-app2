
import { supabase, getConnectionStatus } from './authService';
import { RoutineItem, PrayerIntention, JournalEntry, CommunityPost, Comment } from '../types';

const MOCK_ROUTINE_KEY = 'espiritualizei_routine_local';
const MOCK_INTENTIONS_KEY = 'espiritualizei_intentions_local';
const MOCK_JOURNAL_KEY = 'espiritualizei_journal_local';
const MOCK_POSTS_KEY = 'espiritualizei_posts_local';

// --- DIAGNOSTICS ---
export const testDatabaseConnection = async (): Promise<{ success: boolean; message: string }> => {
  if (!getConnectionStatus()) {
    return { success: false, message: "Modo Offline (Chave API não configurada)" };
  }
  try {
    // Tenta buscar qualquer perfil apenas para testar a conexão e a tabela
    const { count, error } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    if (error) throw error;
    return { success: true, message: `Conectado! Tabelas operacionais.` };
  } catch (e: any) {
    return { success: false, message: `Erro de Conexão: ${e.message || 'Verifique as tabelas no Supabase.'}` };
  }
};

// --- IMAGE UPLOAD HELPER (Hybrid) ---
export const uploadImage = async (file: File, bucket: 'avatars' | 'posts'): Promise<string> => {
  // 1. Always generate Base64 first for instant UI feedback
  const base64 = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });

  // 2. If Supabase Storage is active AND buckets are configured, upload there
  // NOTE: For this MVP to be "Zero Config", we return the base64 so it works immediately without breaking.
  // In a production deploy, you would uncomment the upload logic below.
  
  /*
  if (getConnectionStatus()) {
     try {
       const fileExt = file.name.split('.').pop();
       const fileName = `${Math.random()}.${fileExt}`;
       const { error } = await supabase.storage.from(bucket).upload(fileName, file);
       if (!error) {
          const { data } = supabase.storage.from(bucket).getPublicUrl(fileName);
          return data.publicUrl;
       }
     } catch (e) {
       console.warn("Storage upload failed, using base64 fallback", e);
     }
  }
  */

  return base64;
};

// --- PREMIUM SUBSCRIPTION ---

export const upgradeUserToPremium = async (userId: string) => {
  if (getConnectionStatus()) {
    const { error } = await supabase
      .from('profiles')
      .update({ 
        is_premium: true,
        subscription_status: 'active'
      })
      .eq('id', userId);
    
    if (error) console.error("Failed to upgrade user in DB", error);
  } 
};

// --- ROUTINES CRUD ---

export const saveUserRoutine = async (userId: string, routine: RoutineItem[]) => {
  if (getConnectionStatus()) {
    await supabase.from('user_routines').delete().eq('user_id', userId);

    const dbItems = routine.map(item => ({
      user_id: userId,
      title: item.title,
      description: item.description,
      detailed_content: item.detailedContent,
      icon: item.icon,
      xp_reward: item.xpReward,
      completed: item.completed
    }));

    const { error } = await supabase.from('user_routines').insert(dbItems);
    if (error) console.error("Error saving routine to DB", error);
  } else {
    localStorage.setItem(MOCK_ROUTINE_KEY, JSON.stringify(routine));
  }
};

export const addRoutineItem = async (userId: string, item: RoutineItem) => {
  if (getConnectionStatus()) {
    const dbItem = {
      user_id: userId,
      title: item.title,
      description: item.description,
      detailed_content: item.detailedContent,
      icon: item.icon,
      xp_reward: item.xpReward,
      completed: false
    };
    const { error } = await supabase.from('user_routines').insert([dbItem]);
    if (error) throw error;
  } else {
    const routine = JSON.parse(localStorage.getItem(MOCK_ROUTINE_KEY) || '[]');
    routine.push(item);
    localStorage.setItem(MOCK_ROUTINE_KEY, JSON.stringify(routine));
  }
};

export const deleteRoutineItem = async (itemId: string) => {
  if (getConnectionStatus()) {
    if (itemId.length > 10 && !itemId.startsWith('gen-') && !itemId.startsWith('loc-')) {
        await supabase.from('user_routines').delete().eq('id', itemId);
    }
  } else {
    const routine = JSON.parse(localStorage.getItem(MOCK_ROUTINE_KEY) || '[]');
    const newRoutine = routine.filter((i: any) => i.id !== itemId);
    localStorage.setItem(MOCK_ROUTINE_KEY, JSON.stringify(newRoutine));
  }
};

export const fetchUserRoutine = async (userId: string): Promise<RoutineItem[]> => {
  if (getConnectionStatus()) {
    const { data, error } = await supabase
      .from('user_routines')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error("Error fetching routine", error);
      return [];
    }

    return data.map((item: any) => ({
      id: item.id,
      title: item.title,
      description: item.description,
      detailedContent: item.detailed_content,
      icon: item.icon,
      xpReward: item.xp_reward,
      completed: item.completed
    }));
  } else {
    const local = localStorage.getItem(MOCK_ROUTINE_KEY);
    return local ? JSON.parse(local) : [];
  }
};

export const toggleRoutineItemStatus = async (itemId: string, completed: boolean) => {
  if (getConnectionStatus()) {
    if (itemId.length > 10 && !itemId.startsWith('gen-') && !itemId.startsWith('loc-')) { 
        await supabase
        .from('user_routines')
        .update({ completed: completed })
        .eq('id', itemId);
    }
  } else {
     const routine = JSON.parse(localStorage.getItem(MOCK_ROUTINE_KEY) || '[]');
     const idx = routine.findIndex((i: any) => i.id === itemId);
     if(idx >= 0) {
        routine[idx].completed = completed;
        localStorage.setItem(MOCK_ROUTINE_KEY, JSON.stringify(routine));
     }
  }
};

// --- INTENTIONS (COMMUNITY) ---

export const createIntention = async (userId: string, authorName: string, content: string, category: string, tags: string[]): Promise<PrayerIntention | null> => {
  const newIntention = {
    user_id: userId,
    author_name: authorName,
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
    
    if (error) {
      console.error("Error creating intention", error);
      throw error;
    }

    return {
      id: data.id,
      author: data.author_name,
      content: data.content,
      prayingCount: 0,
      isPrayedByUser: false,
      timestamp: new Date(data.created_at),
      category: data.category,
      tags: data.tags
    };
  } else {
    const localIntentions = JSON.parse(localStorage.getItem(MOCK_INTENTIONS_KEY) || '[]');
    const mockItem: PrayerIntention = {
      id: crypto.randomUUID(),
      author: authorName,
      content,
      category: category as PrayerIntention['category'],
      tags,
      prayingCount: 0,
      isPrayedByUser: false,
      timestamp: new Date()
    };
    localIntentions.unshift(mockItem);
    localStorage.setItem(MOCK_INTENTIONS_KEY, JSON.stringify(localIntentions));
    return mockItem;
  }
};

export const fetchCommunityIntentions = async (currentUserId: string): Promise<PrayerIntention[]> => {
  if (getConnectionStatus()) {
    const { data: intentions, error } = await supabase
      .from('prayer_intentions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error("Error fetching intentions", error);
      return [];
    }

    const { data: interactions } = await supabase
      .from('prayer_interactions')
      .select('intention_id')
      .eq('user_id', currentUserId);

    const prayedIds = new Set(interactions?.map((i: any) => i.intention_id));

    return intentions.map((i: any) => ({
      id: i.id,
      author: i.author_name || 'Anônimo',
      content: i.content,
      prayingCount: i.praying_count || 0,
      isPrayedByUser: prayedIds.has(i.id),
      timestamp: new Date(i.created_at),
      category: i.category,
      tags: i.tags || []
    }));
  } else {
    const local = localStorage.getItem(MOCK_INTENTIONS_KEY);
    return local ? JSON.parse(local) : [];
  }
};

export const togglePrayerInteraction = async (intentionId: string) => {
  if (getConnectionStatus()) {
    const { error } = await supabase.rpc('toggle_prayer', { intention_id_input: intentionId });
    if (error) console.error("Error toggling prayer", error);
  } else {
    const local = JSON.parse(localStorage.getItem(MOCK_INTENTIONS_KEY) || '[]');
    const idx = local.findIndex((i: any) => i.id === intentionId);
    if (idx >= 0) {
      if (local[idx].isPrayedByUser) {
        local[idx].prayingCount--;
        local[idx].isPrayedByUser = false;
      } else {
        local[idx].prayingCount++;
        local[idx].isPrayedByUser = true;
      }
      localStorage.setItem(MOCK_INTENTIONS_KEY, JSON.stringify(local));
    }
  }
};

// --- SOCIAL FEED ---

export const fetchCommunityPosts = async (): Promise<CommunityPost[]> => {
   const local = localStorage.getItem(MOCK_POSTS_KEY);
   if (local) return JSON.parse(local);

   const seeds: CommunityPost[] = [
      {
         id: 'post-1',
         userId: 'user-1',
         userName: 'Maria Silva',
         content: 'Hoje completei o 5º dia da Novena! Sentindo muita paz.',
         imageUrl: 'https://images.unsplash.com/photo-1515558679601-fc3d43c3856f?auto=format&fit=crop&q=80&w=600',
         likesCount: 12,
         commentsCount: 1,
         isLikedByUser: false,
         timestamp: new Date(),
         type: 'challenge_update',
         comments: [
            { id: 'c1', userId: 'u2', userName: 'Ana', content: 'Glória a Deus! Continue firme.', timestamp: new Date() }
         ]
      },
      {
         id: 'post-2',
         userId: 'user-2',
         userName: 'João Marcos',
         content: 'Meu cantinho de oração está pronto para a Quaresma. Vamos juntos irmãos!',
         imageUrl: 'https://images.unsplash.com/photo-1543989381-15957b4c972d?auto=format&fit=crop&q=80&w=600',
         likesCount: 45,
         commentsCount: 0,
         isLikedByUser: true,
         timestamp: new Date(Date.now() - 3600000),
         type: 'inspiration',
         comments: []
      }
   ];
   localStorage.setItem(MOCK_POSTS_KEY, JSON.stringify(seeds));
   return seeds;
};

export const createCommunityPost = async (userId: string, userName: string, content: string, imageUrl?: string): Promise<CommunityPost> => {
   const cleanContent = content.replace(/<[^>]*>?/gm, '');

   const newPost: CommunityPost = {
      id: crypto.randomUUID(),
      userId,
      userName,
      content: cleanContent,
      imageUrl,
      likesCount: 0,
      commentsCount: 0,
      isLikedByUser: false,
      timestamp: new Date(),
      type: imageUrl ? 'inspiration' : 'testimony',
      comments: []
   };
   
   const posts = JSON.parse(localStorage.getItem(MOCK_POSTS_KEY) || '[]');
   posts.unshift(newPost);
   localStorage.setItem(MOCK_POSTS_KEY, JSON.stringify(posts));
   return newPost;
};

export const togglePostLike = async (postId: string) => {
   const posts = JSON.parse(localStorage.getItem(MOCK_POSTS_KEY) || '[]');
   const idx = posts.findIndex((p: any) => p.id === postId);
   if (idx >= 0) {
      if (posts[idx].isLikedByUser) {
         posts[idx].likesCount--;
         posts[idx].isLikedByUser = false;
      } else {
         posts[idx].likesCount++;
         posts[idx].isLikedByUser = true;
      }
      localStorage.setItem(MOCK_POSTS_KEY, JSON.stringify(posts));
   }
};

export const addComment = async (postId: string, userId: string, userName: string, content: string): Promise<Comment> => {
   const cleanContent = content.replace(/<[^>]*>?/gm, '');

   const posts = JSON.parse(localStorage.getItem(MOCK_POSTS_KEY) || '[]');
   const idx = posts.findIndex((p: any) => p.id === postId);
   
   const newComment: Comment = {
      id: crypto.randomUUID(),
      userId,
      userName,
      content: cleanContent,
      timestamp: new Date()
   };

   if (idx >= 0) {
      if (!posts[idx].comments) posts[idx].comments = [];
      posts[idx].comments.push(newComment);
      posts[idx].commentsCount = posts[idx].comments.length;
      localStorage.setItem(MOCK_POSTS_KEY, JSON.stringify(posts));
   }
   
   return newComment;
};

export const createJournalEntry = async (userId: string, mood: string, content: string, aiReflection?: string, bibleVerse?: string): Promise<JournalEntry | null> => {
    const entry = {
        user_id: userId,
        mood,
        content,
        ai_reflection: aiReflection,
        bible_verse: bibleVerse
    };

    if (getConnectionStatus()) {
        const { data, error } = await supabase
            .from('journal_entries')
            .insert([entry])
            .select()
            .single();
        
        if(error) throw error;

        return {
            id: data.id,
            mood: data.mood,
            content: data.content,
            aiReflection: data.ai_reflection,
            bibleVerse: data.bible_verse,
            createdAt: new Date(data.created_at)
        };
    } else {
        const local = JSON.parse(localStorage.getItem(MOCK_JOURNAL_KEY) || '[]');
        const mock: JournalEntry = {
            id: crypto.randomUUID(),
            mood: mood as any,
            content,
            aiReflection,
            bibleVerse,
            createdAt: new Date()
        };
        local.unshift(mock);
        localStorage.setItem(MOCK_JOURNAL_KEY, JSON.stringify(local));
        return mock;
    }
};

export const deleteUserAccount = async () => {
    if (getConnectionStatus()) {
        const { error } = await supabase.rpc('delete_user_account');
        if (error) throw error;
    } else {
        localStorage.clear();
    }
};
