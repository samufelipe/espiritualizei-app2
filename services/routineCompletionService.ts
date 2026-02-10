/**
 * ROUTINE COMPLETION SERVICE
 * Gerencia conclusões diárias de rotinas
 */

import { supabase } from './authService';

export interface RoutineCompletion {
  id: string;
  user_id: string;
  routine_item_id: string;
  completed_at: string;
  completion_date: string;
  xp_earned: number;
}

/**
 * Verifica se uma rotina foi concluída hoje
 */
export async function isRoutineCompletedToday(
  userId: string,
  routineItemId: string
): Promise<boolean> {
  try {
    if (!supabase) return false;
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    const { data, error } = await supabase
      .from('routine_completions')
      .select('id')
      .eq('user_id', userId)
      .eq('routine_item_id', routineItemId)
      .eq('completion_date', today)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows
      console.error('Error checking routine completion:', error);
      return false;
    }

    return !!data;
  } catch (error) {
    console.error('Error in isRoutineCompletedToday:', error);
    return false;
  }
}

/**
 * Marca uma rotina como concluída hoje
 */
export async function completeRoutineToday(
  userId: string,
  routineItemId: string,
  xpEarned: number
): Promise<{ success: boolean; xp: number }> {
  try {
    if (!supabase) return { success: false, xp: 0 };
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    const { data, error } = await supabase
      .from('routine_completions')
      .insert({
        user_id: userId,
        routine_item_id: routineItemId,
        completion_date: today,
        xp_earned: xpEarned
      })
      .select()
      .single();

    if (error) {
      // Se já existe conclusão hoje, ignora (constraint UNIQUE)
      if (error.code === '23505') {
        return { success: false, xp: 0 };
      }
      console.error('Error completing routine:', error);
      return { success: false, xp: 0 };
    }

    return { success: true, xp: xpEarned };
  } catch (error) {
    console.error('Error in completeRoutineToday:', error);
    return { success: false, xp: 0 };
  }
}

/**
 * Remove conclusão de uma rotina hoje
 */
export async function uncompleteRoutineToday(
  userId: string,
  routineItemId: string
): Promise<{ success: boolean; xp: number }> {
  try {
    if (!supabase) return { success: false, xp: 0 };
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    const { data, error } = await supabase
      .from('routine_completions')
      .delete()
      .eq('user_id', userId)
      .eq('routine_item_id', routineItemId)
      .eq('completion_date', today)
      .select()
      .single();

    if (error) {
      console.error('Error uncompleting routine:', error);
      return { success: false, xp: 0 };
    }

    return { success: true, xp: data?.xp_earned || 0 };
  } catch (error) {
    console.error('Error in uncompleteRoutineToday:', error);
    return { success: false, xp: 0 };
  }
}

/**
 * Obtém todas as rotinas concluídas hoje
 */
export async function getTodayCompletions(
  userId: string
): Promise<string[]> {
  try {
    if (!supabase) return [];
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    const { data, error } = await supabase
      .from('routine_completions')
      .select('routine_item_id')
      .eq('user_id', userId)
      .eq('completion_date', today);

    if (error) {
      console.error('Error getting today completions:', error);
      return [];
    }

    return data?.map(item => item.routine_item_id) || [];
  } catch (error) {
    console.error('Error in getTodayCompletions:', error);
    return [];
  }
}

/**
 * Obtém total de XP ganho hoje
 */
export async function getTodayXP(userId: string): Promise<number> {
  try {
    if (!supabase) return 0;
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    const { data, error } = await supabase
      .from('routine_completions')
      .select('xp_earned')
      .eq('user_id', userId)
      .eq('completion_date', today);

    if (error) {
      console.error('Error getting today XP:', error);
      return 0;
    }

    return data?.reduce((sum, item) => sum + (item.xp_earned || 0), 0) || 0;
  } catch (error) {
    console.error('Error in getTodayXP:', error);
    return 0;
  }
}

/**
 * Obtém streak (dias consecutivos) de conclusões
 */
export async function getCompletionStreak(
  userId: string,
  routineItemId: string
): Promise<number> {
  try {
    if (!supabase) return 0;
    const { data, error } = await supabase
      .from('routine_completions')
      .select('completion_date')
      .eq('user_id', userId)
      .eq('routine_item_id', routineItemId)
      .order('completion_date', { ascending: false })
      .limit(365); // Último ano

    if (error || !data || data.length === 0) {
      return 0;
    }

    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    for (const completion of data) {
      const completionDate = new Date(completion.completion_date);
      completionDate.setHours(0, 0, 0, 0);

      const diffDays = Math.floor(
        (currentDate.getTime() - completionDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (diffDays === streak) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  } catch (error) {
    console.error('Error in getCompletionStreak:', error);
    return 0;
  }
}
