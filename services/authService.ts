
import { UserProfile, OnboardingData, AuthSession } from '../types';
import { createClient } from '@supabase/supabase-js';

// Função de validação robusta
const isPopulated = (val: any) => {
  if (!val) return false;
  const s = String(val).trim();
  return s !== "" && s !== "undefined" && s !== "null" && s !== "[object Object]";
};

/**
 * BUSCA DE VARIÁVEIS:
 * O Vite injeta variáveis no process.env via config define.
 */
// Fixed: Replacing import.meta.env with process.env to match vite.config.ts defines
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || "";
// Fixed: Replacing import.meta.env with process.env to match vite.config.ts defines
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY || "";

export let supabase: any = null;

// Verifica se temos chaves válidas
const isSupabaseConfigured = isPopulated(SUPABASE_URL) && isPopulated(SUPABASE_KEY);

if (isSupabaseConfigured) {
  try {
    supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
    console.log("✅ Banco de Dados conectado com sucesso.");
  } catch (e) {
    console.error("❌ Erro ao inicializar cliente Supabase:", e);
  }
} else {
  // Esse aviso só deve aparecer se após o REDEPLOY as chaves ainda vierem vazias
  console.warn("⚠️ Banco de Dados Offline: Verifique as chaves VITE_SUPABASE_* na Vercel.");
}

const DB_USERS_KEY = 'espiritualizei_users_db';
const SESSION_KEY = 'espiritualizei_session';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const safeStringify = (obj: any) => {
  const cache = new Set();
  return JSON.stringify(obj, (key, value) => {
    if (typeof value === 'object' && value !== null) {
      if (cache.has(value)) return;
      cache.add(value);
    }
    return value;
  });
};

const mapProfileFromDB = (dbProfile: any, email: string): UserProfile => ({
  id: dbProfile.id,
  name: dbProfile.name || 'Peregrino',
  email: email,
  phone: dbProfile.phone,
  level: dbProfile.level || 1,
  currentXP: dbProfile.current_xp || 0,
  nextLevelXP: dbProfile.next_level_xp || 100,
  streakDays: dbProfile.streak_days || 0,
  spiritualMaturity: dbProfile.spiritual_maturity || 'Iniciante',
  spiritualFocus: dbProfile.spiritual_focus,
  spiritualGoal: dbProfile.spiritual_goal,
  stateOfLife: dbProfile.state_of_life,
  joinedDate: new Date(dbProfile.joined_date || Date.now()),
  lastRoutineUpdate: dbProfile.last_routine_update ? new Date(dbProfile.last_routine_update) : new Date(dbProfile.joined_date || Date.now()),
  isPremium: dbProfile.is_premium || false,
  subscriptionStatus: dbProfile.subscription_status || 'canceled',
  patronSaint: dbProfile.patron_saint,
  lastConfessionAt: dbProfile.last_confession_at ? new Date(dbProfile.last_confession_at) : undefined,
  confessionFrequency: dbProfile.confession_frequency
});

export const getConnectionStatus = () => !!supabase;

export const loginUser = async (email: string, password: string): Promise<AuthSession> => {
  const normalizedEmail = email.trim().toLowerCase();
  const normalizedPassword = password.trim();

  if (getConnectionStatus()) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ 
        email: normalizedEmail, 
        password: normalizedPassword 
      });

      if (error) throw error;
      
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', data.user!.id).maybeSingle();
      
      const session = {
        user: mapProfileFromDB(profile || { id: data.user!.id, name: 'Usuário' }, normalizedEmail),
        token: data.session!.access_token,
        expiresAt: data.session!.expires_at! * 1000
      };
      localStorage.setItem(SESSION_KEY, safeStringify(session));
      return session;
    } catch (error: any) {
      if (error.message === "Failed to fetch") {
        throw new Error("Erro de conexão.");
      }
      throw error;
    }
  }

  await delay(800);
  const usersStr = localStorage.getItem(DB_USERS_KEY);
  const users = usersStr ? JSON.parse(usersStr) : [];
  const u = users.find((u: any) => u.email === normalizedEmail && u.password === normalizedPassword);
  
  if (!u) throw new Error("E-mail ou senha incorretos.");

  const { password: _, ...profileData } = u;
  const session = {
    user: { ...profileData, joinedDate: new Date(profileData.joinedDate), lastRoutineUpdate: new Date(profileData.lastRoutineUpdate || profileData.joinedDate) },
    token: 'mock-' + Date.now(),
    expiresAt: Date.now() + 604800000
  };
  localStorage.setItem(SESSION_KEY, safeStringify(session));
  return session;
};

export const registerUser = async (data: OnboardingData): Promise<AuthSession> => {
  const email = data.email.trim().toLowerCase();
  const password = data.password?.trim();

  if (getConnectionStatus()) {
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email,
        password: password,
      });

      if (authError) throw authError;

      const profilePayload = {
        id: authData.user!.id,
        name: data.name.trim(),
        phone: data.phone,
        spiritual_maturity: 'Iniciante',
        spiritual_focus: data.primaryStruggle,
        spiritual_goal: data.spiritualGoal,
        state_of_life: data.stateOfLife,
        patron_saint: data.patronSaint,
        confession_frequency: data.confessionFrequency,
        level: 1,
        current_xp: 0,
        is_premium: false,
        subscription_status: 'trial',
        joined_date: new Date().toISOString()
      };

      await supabase.from('profiles').insert([profilePayload]);

      const newUser = mapProfileFromDB(profilePayload, email);
      const session: AuthSession = {
        user: newUser,
        token: authData.session?.access_token || '',
        expiresAt: authData.session?.expires_at ? authData.session.expires_at * 1000 : Date.now() + 86400000
      };
      
      if (authData.session) {
        localStorage.setItem(SESSION_KEY, safeStringify(session));
      } else {
        throw new Error("Cadastro ok! Verifique seu e-mail.");
      }
      return session;
    } catch (error: any) {
      if (error.message === "Failed to fetch") {
        throw new Error("Erro de rede.");
      }
      throw error;
    }
  }

  await delay(800);
  const usersStr = localStorage.getItem(DB_USERS_KEY);
  const users = usersStr ? JSON.parse(usersStr) : [];
  
  if (users.find((u: any) => u.email === email)) throw new Error("E-mail já cadastrado.");

  const newUser: UserProfile = {
    id: crypto.randomUUID(),
    name: data.name,
    email: email,
    phone: data.phone,
    level: 1,
    currentXP: 0,
    nextLevelXP: 100,
    streakDays: 0,
    spiritualMaturity: 'Iniciante',
    spiritualFocus: data.primaryStruggle,
    spiritualGoal: data.spiritualGoal,
    stateOfLife: data.stateOfLife,
    joinedDate: new Date(),
    lastRoutineUpdate: new Date(),
    isPremium: false,
    subscriptionStatus: 'trial',
    patronSaint: data.patronSaint,
    confessionFrequency: data.confessionFrequency
  };

  users.push({ ...newUser, password: password });
  localStorage.setItem(DB_USERS_KEY, safeStringify(users));
  
  const session = { user: newUser, token: 'mock-' + Date.now(), expiresAt: Date.now() + 604800000 };
  localStorage.setItem(SESSION_KEY, safeStringify(session));
  return session;
};

export const logoutUser = async () => {
  localStorage.removeItem(SESSION_KEY);
  if (getConnectionStatus()) {
    try {
      await supabase.auth.signOut();
    } catch (e) {}
  }
};

export const getSession = (): AuthSession | null => {
  const s = localStorage.getItem(SESSION_KEY);
  if (!s) return null;
  try {
    const session = JSON.parse(s);
    if (session.user) {
        session.user.joinedDate = new Date(session.user.joinedDate);
        if(session.user.lastRoutineUpdate) session.user.lastRoutineUpdate = new Date(session.user.lastRoutineUpdate);
        if(session.user.lastConfessionAt) session.user.lastConfessionAt = new Date(session.user.lastConfessionAt);
    }
    return session;
  } catch (e) {
    return null;
  }
};

export const updateUserProfile = async (u: UserProfile) => {
  const s = getSession();
  if (s) { s.user = u; localStorage.setItem(SESSION_KEY, safeStringify(s)); }

  if (getConnectionStatus()) {
    try {
      await supabase.from('profiles').update({
          name: u.name,
          phone: u.phone,
          level: u.level,
          current_xp: u.currentXP,
          streak_days: u.streakDays,
          spiritual_maturity: u.spiritualMaturity,
          patron_saint: u.patronSaint,
          spiritual_focus: u.spiritualFocus,
          spiritual_goal: u.spiritualGoal,
          last_routine_update: u.lastRoutineUpdate,
          last_confession_at: u.lastConfessionAt,
          confession_frequency: u.confessionFrequency
        }).eq('id', u.id);
    } catch (e) {
      console.error("Erro ao atualizar perfil:", e);
    }
  }
};

export const sendPasswordResetEmail = async (email: string) => {
  const cleanEmail = email.trim().toLowerCase();
  if (getConnectionStatus()) {
    const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
      redirectTo: window.location.origin, 
    });
    if (error) throw error;
    return true;
  }
  return true;
};

export const updateUserPassword = async (newPassword: string) => {
  if (getConnectionStatus()) {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw error;
    return true;
  }
  return true;
};