
import { UserProfile, OnboardingData, AuthSession } from '../types';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || '';
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY || '';

const isSupabaseConfigured = !!(SUPABASE_URL && SUPABASE_KEY && SUPABASE_URL.startsWith('https'));

export let supabase: any = null;

if (isSupabaseConfigured) {
  try {
    supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
  } catch (e) {
    console.error("❌ Supabase Init Error", e);
  }
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
  name: dbProfile.name,
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
  joinedDate: new Date(dbProfile.joined_date),
  lastRoutineUpdate: dbProfile.last_routine_update ? new Date(dbProfile.last_routine_update) : new Date(dbProfile.joined_date),
  isPremium: dbProfile.is_premium || false,
  subscriptionStatus: dbProfile.subscription_status || 'canceled',
  patronSaint: dbProfile.patron_saint
});

export const getConnectionStatus = () => isSupabaseConfigured && !!supabase;

export const sendPasswordResetEmail = async (email: string) => {
  const cleanEmail = email.trim().toLowerCase();
  if (getConnectionStatus()) {
    const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
      redirectTo: window.location.origin, 
    });
    if (error) throw error;
    return true;
  }
  await delay(1000);
  return true;
};

export const updateUserPassword = async (newPassword: string) => {
  if (getConnectionStatus()) {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw error;
    return true;
  }
  await delay(1000);
  return true;
};

export const registerUser = async (data: OnboardingData): Promise<AuthSession> => {
  const email = data.email.trim().toLowerCase();
  const password = data.password?.trim();

  if (getConnectionStatus()) {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: email,
      password: password,
    });

    if (authError) throw new Error(authError.message); 
    if (!authData.user) throw new Error("Erro ao criar usuário.");

    // Tenta criar o perfil público
    const profilePayload = {
      id: authData.user.id,
      name: data.name.trim(),
      phone: data.phone,
      spiritual_maturity: 'Iniciante',
      spiritual_focus: data.primaryStruggle,
      spiritual_goal: data.spiritualGoal,
      state_of_life: data.stateOfLife,
      patron_saint: data.patronSaint,
      level: 1,
      current_xp: 0,
      is_premium: false,
      subscription_status: 'trial',
      joined_date: new Date().toISOString()
    };

    // Nota: Se a confirmação de e-mail estiver ON, este insert pode falhar dependendo das RLS
    const { error: insertError } = await supabase.from('profiles').insert([profilePayload]);
    if (insertError) console.warn("Aviso: Perfil será criado após confirmação de e-mail.", insertError.message);

    const newUser = mapProfileFromDB(profilePayload, email);
    const session: AuthSession = {
      user: newUser,
      token: authData.session?.access_token || '',
      expiresAt: authData.session?.expires_at ? authData.session.expires_at * 1000 : Date.now() + 86400000
    };
    
    // Só salva sessão se o login for automático (confirmação OFF)
    if (authData.session) {
      localStorage.setItem(SESSION_KEY, safeStringify(session));
    } else {
      // Se não há sessão, o Supabase provavelmente enviou e-mail de confirmação
      throw new Error("Conta criada! Por favor, verifique seu e-mail para confirmar o cadastro antes de fazer login.");
    }
    
    return session;
  }

  await delay(1000);
  const usersStr = localStorage.getItem(DB_USERS_KEY);
  const users = usersStr ? JSON.parse(usersStr) : [];
  
  if (users.find((u: any) => u.email === email)) throw new Error("Este e-mail já está cadastrado.");

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
    patronSaint: data.patronSaint
  };

  users.push({ ...newUser, password: password });
  localStorage.setItem(DB_USERS_KEY, safeStringify(users));
  
  const session = {
    user: newUser,
    token: 'mock-' + Date.now(),
    expiresAt: Date.now() + 604800000
  };
  localStorage.setItem(SESSION_KEY, safeStringify(session));
  return session;
};

export const loginUser = async (email: string, password: string): Promise<AuthSession> => {
  const normalizedEmail = email.trim().toLowerCase();
  const normalizedPassword = password.trim();

  if (getConnectionStatus()) {
    const { data, error } = await supabase.auth.signInWithPassword({ 
      email: normalizedEmail, 
      password: normalizedPassword 
    });

    if (error) {
      // Tradução amigável de erros comuns do Supabase
      if (error.message.includes("Email not confirmed")) {
        throw new Error("Seu e-mail ainda não foi confirmado. Verifique sua caixa de entrada.");
      }
      if (error.message.includes("Invalid login credentials")) {
        throw new Error("E-mail ou senha incorretos.");
      }
      throw new Error(error.message);
    }
    
    const { data: profile } = await supabase.from('profiles').select('*').eq('id', data.user!.id).maybeSingle();
    const session = {
      user: mapProfileFromDB(profile || { id: data.user!.id, name: 'Usuário' }, normalizedEmail),
      token: data.session!.access_token,
      expiresAt: data.session!.expires_at! * 1000
    };
    localStorage.setItem(SESSION_KEY, safeStringify(session));
    return session;
  }

  await delay(1000);
  const usersStr = localStorage.getItem(DB_USERS_KEY);
  const users = usersStr ? JSON.parse(usersStr) : [];
  const u = users.find((u: any) => u.email === normalizedEmail && u.password === normalizedPassword);
  if (!u) throw new Error("E-mail ou senha incorretos.");

  const { password: _, ...profile } = u;
  const session = {
    user: { ...profile, joinedDate: new Date(profile.joinedDate), lastRoutineUpdate: new Date(profile.lastRoutineUpdate || profile.joinedDate) },
    token: 'mock-' + Date.now(),
    expiresAt: Date.now() + 604800000
  };
  localStorage.setItem(SESSION_KEY, safeStringify(session));
  return session;
};

export const logoutUser = async () => {
  localStorage.removeItem(SESSION_KEY);
  if (getConnectionStatus()) await supabase.auth.signOut();
};

export const getSession = (): AuthSession | null => {
  const s = localStorage.getItem(SESSION_KEY);
  if (!s) return null;
  try {
    const session = JSON.parse(s);
    session.user.joinedDate = new Date(session.user.joinedDate);
    if(session.user.lastRoutineUpdate) session.user.lastRoutineUpdate = new Date(session.user.lastRoutineUpdate);
    return session;
  } catch (e) {
    return null;
  }
};

export const updateUserProfile = async (u: UserProfile) => {
  const s = getSession();
  if (s) { s.user = u; localStorage.setItem(SESSION_KEY, safeStringify(s)); }

  if (getConnectionStatus()) {
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
        last_routine_update: u.lastRoutineUpdate
      }).eq('id', u.id);
  }
};
