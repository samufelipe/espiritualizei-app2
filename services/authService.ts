
import { UserProfile, OnboardingData, AuthSession } from '../types';
import { createClient } from '@supabase/supabase-js';

// Captura as variáveis injetadas pelo define do vite.config.ts
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || "";
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY || "";

export let supabase: any = null;

// Validação de presença das chaves
const hasKeys = SUPABASE_URL.length > 10 && SUPABASE_KEY.length > 10 && !SUPABASE_URL.includes('process.env');

if (hasKeys) {
  try {
    supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      }
    });
    console.log("✅ Supabase: Cliente inicializado. Chaves detectadas.");
  } catch (e) {
    console.error("❌ Supabase: Erro fatal na inicialização do cliente.", e);
  }
} else {
  console.warn("⚠️ Supabase: Chaves de ambiente (VITE_SUPABASE_*) não encontradas no build. O app operará em modo limitado.");
}

export const getConnectionStatus = () => {
    if (!supabase) return false;
    // Opcional: Adicionar verificação de saúde se necessário no futuro
    return true;
};

const SESSION_KEY = 'espiritualizei_session';

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

export const loginUser = async (email: string, password: string): Promise<AuthSession> => {
  const normalizedEmail = email.trim().toLowerCase();
  
  if (!supabase) throw new Error("Configuração do banco de dados não encontrada.");

  try {
    const { data, error } = await supabase.auth.signInWithPassword({ 
      email: normalizedEmail, 
      password: password.trim() 
    });

    if (error) {
      if (error.message.includes('FetchError') || error.status === 503) {
        throw new Error("O servidor está acordando. Tente novamente em alguns segundos.");
      }
      throw error;
    }
    
    const { data: profile, error: pError } = await supabase.from('profiles').select('*').eq('id', data.user!.id).maybeSingle();
    
    if (pError) console.warn("Erro ao buscar perfil, usando dados básicos:", pError);

    const session = {
      user: mapProfileFromDB(profile || { id: data.user!.id, name: 'Usuário' }, normalizedEmail),
      token: data.session!.access_token,
      expiresAt: data.session!.expires_at! * 1000
    };
    localStorage.setItem(SESSION_KEY, safeStringify(session));
    return session;
  } catch (error: any) {
    console.error("Login Error:", error);
    throw error;
  }
};

export const registerUser = async (data: OnboardingData): Promise<AuthSession> => {
  const email = data.email.trim().toLowerCase();

  if (!supabase) throw new Error("Banco de dados não configurado.");

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: email,
    password: data.password,
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
    joined_date: new Date().toISOString()
  };

  const { error: insError } = await supabase.from('profiles').insert([profilePayload]);
  if (insError) console.error("Erro ao criar perfil:", insError);

  const newUser = mapProfileFromDB(profilePayload, email);
  const session = { user: newUser, token: authData.session?.access_token || '', expiresAt: Date.now() + 86400000 };
  localStorage.setItem(SESSION_KEY, safeStringify(session));
  return session;
};

export const logoutUser = async () => {
  localStorage.removeItem(SESSION_KEY);
  if (supabase) {
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
    }
    return session;
  } catch (e) { return null; }
};

export const updateUserProfile = async (u: UserProfile) => {
  const s = getSession();
  if (s) { s.user = u; localStorage.setItem(SESSION_KEY, safeStringify(s)); }

  if (supabase) {
    try {
      await supabase.from('profiles').update({
        name: u.name,
        level: u.level,
        current_xp: u.currentXP,
        spiritual_maturity: u.spiritualMaturity,
        last_routine_update: u.lastRoutineUpdate
      }).eq('id', u.id);
    } catch (e) {
        console.error("Erro ao atualizar perfil remoto:", e);
    }
  }
};

export const sendPasswordResetEmail = async (email: string) => {
  if (supabase) {
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase());
    if (error) throw error;
    return true;
  }
  return false;
};

export const updateUserPassword = async (newPassword: string) => {
  if (supabase) {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw error;
    return true;
  }
  return false;
};
