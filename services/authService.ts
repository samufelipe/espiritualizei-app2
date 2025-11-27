
import { UserProfile, OnboardingData, AuthSession } from '../types';
import { createClient } from '@supabase/supabase-js';

// --- CONFIGURATION ---

// URL do seu projeto Supabase
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://anoqhwpdrztaqmlocnzx.supabase.co';

// SUA CHAVE ANON (PÚBLICA)
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFub3Fod3Bkcnp0YXFtbG9jbnp4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM2ODM3OTQsImV4cCI6MjA3OTI1OTc5NH0.eUg9hLctWst7nolKxk5OUgka6s8xUaaBNH3dP6kCduY'; 

// Validação simplificada: Se tem URL e Chave, ativa o Supabase
const isSupabaseEnabled = !!(SUPABASE_URL && SUPABASE_KEY && SUPABASE_KEY.startsWith('eyJ'));

export let supabase: any = null; // Exported for use in databaseService

// Inicialização do Cliente
if (isSupabaseEnabled) {
  try {
    supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
    console.log("🔌 Supabase Client Initialized");
  } catch (e) {
    console.error("Erro ao inicializar Supabase:", e);
  }
} else {
  console.log("⚠️ Supabase: Chave inválida. Usando Modo Simulado (LocalStorage).");
}

// --- MOCK DATABASE KEYS ---
const DB_USERS_KEY = 'espiritualizei_users_db';
const SESSION_KEY = 'espiritualizei_session';

// Helper to delay execution (simulate network in mock mode)
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// --- SAFETY HELPERS (Prevent JSON Crashes) ---

/**
 * Safely stringifies an object, removing circular references and DOM nodes.
 * This prevents the "Converting circular structure to JSON" error.
 */
const safeStringify = (obj: any) => {
  const cache = new Set();
  return JSON.stringify(obj, (key, value) => {
    if (typeof value === 'object' && value !== null) {
      // Prevent Circular Refs
      if (cache.has(value)) {
        return; // Discard
      }
      // Prevent DOM Nodes (HTMLAudioElement, etc)
      if (value.constructor && value.constructor.name && (value.constructor.name.startsWith('HTML') || value.constructor.name.includes('Element'))) {
         return; // Discard
      }
      // Prevent React Fiber Nodes
      if (key.startsWith('_react')) {
         return;
      }
      cache.add(value);
    }
    return value;
  });
};

// --- HELPER FUNCTIONS ---

// Converts Supabase DB format (snake_case) to App format (camelCase)
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
  stateOfLife: dbProfile.state_of_life,
  joinedDate: new Date(dbProfile.joined_date),
  // Mapping Subscription Fields
  isPremium: dbProfile.is_premium || false,
  subscriptionStatus: dbProfile.subscription_status || 'canceled',
  patronSaint: dbProfile.patron_saint
});

// --- PUBLIC HELPER FOR UI ---
export const getConnectionStatus = () => isSupabaseEnabled;

// --- AUTH SERVICES ---

export const sendPasswordResetEmail = async (email: string) => {
  if (isSupabaseEnabled) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + '/reset-password',
    });
    if (error) throw error;
    return true;
  }
  await delay(1000); // Mock
  return true;
};

export const registerUser = async (data: OnboardingData): Promise<AuthSession> => {
  
  // 1. SUPABASE MODE
  if (isSupabaseEnabled) {
    console.log("Tentando registrar no Supabase...");
    
    // Normalizar email
    const email = data.email.trim().toLowerCase();

    // A. Create Auth User
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: email,
      password: data.password,
    });

    if (authError) {
      console.error("Supabase Auth Error:", authError);
      throw new Error(authError.message); 
    }
    
    if (!authData.user) throw new Error("Erro ao criar usuário. Verifique seus dados.");

    // B. Insert Profile Data (With Fallback Strategy)
    const profilePayload = {
      id: authData.user.id,
      name: data.name,
      phone: data.phone,
      spiritual_maturity: 'Iniciante',
      spiritual_focus: data.primaryStruggle,
      state_of_life: data.stateOfLife,
      patron_saint: data.patronSaint, // New field
      level: 1,
      current_xp: 0,
      is_premium: false,
      subscription_status: 'trial' 
    };

    let profileError = null;

    // Tentativa 1: Inserção Completa
    const { error: fullInsertError } = await supabase.from('profiles').insert([profilePayload]);
    
    if (fullInsertError) {
       console.warn("Full profile insert failed (likely missing columns). Trying basic insert...", fullInsertError);
       profileError = fullInsertError;

       // Tentativa 2: Inserção Básica (Fallback para não travar o usuário)
       const basicPayload = {
          id: authData.user.id,
          name: data.name,
          phone: data.phone
       };
       const { error: basicInsertError } = await supabase.from('profiles').insert([basicPayload]);
       
       if (basicInsertError) {
          console.error("Critical: Basic profile insert failed", basicInsertError);
          // Mesmo se falhar o perfil, o Auth User existe. Prosseguimos para permitir o login.
       }
    }

    // C. Return Session
    const newUser = mapProfileFromDB({ 
      ...profilePayload, // Usamos o payload local para a sessão imediata
      joined_date: new Date().toISOString()
    }, email);

    const session: AuthSession = {
      user: newUser,
      token: authData.session?.access_token || '',
      expiresAt: authData.session?.expires_at ? authData.session.expires_at * 1000 : Date.now() + 86400000
    };
    
    localStorage.setItem(SESSION_KEY, safeStringify(session));
    return session;
  }

  // 2. MOCK MODE (LocalStorage)
  console.log("Registrando em Modo Simulado...");
  await delay(1000);
  const usersStr = localStorage.getItem(DB_USERS_KEY);
  const users = usersStr ? JSON.parse(usersStr) : [];
  
  if (users.find((u: any) => u.email === data.email)) {
    throw new Error("Este e-mail já está cadastrado.");
  }

  // Sanitize Data explicitly
  const newUser: UserProfile = {
    id: crypto.randomUUID(),
    name: String(data.name),
    email: String(data.email),
    phone: String(data.phone),
    level: 1,
    currentXP: 0,
    nextLevelXP: 100,
    streakDays: 0,
    spiritualMaturity: 'Iniciante',
    spiritualFocus: String(data.primaryStruggle),
    stateOfLife: String(data.stateOfLife),
    joinedDate: new Date(),
    isPremium: false,
    subscriptionStatus: 'trial',
    patronSaint: data.patronSaint
  };

  const dbRecord = { ...newUser, password: data.password };
  users.push(dbRecord);
  localStorage.setItem(DB_USERS_KEY, safeStringify(users));
  
  const session: AuthSession = {
    user: newUser,
    token: 'mock-token-' + Date.now(),
    expiresAt: Date.now() + (7 * 24 * 60 * 60 * 1000)
  };

  localStorage.setItem(SESSION_KEY, safeStringify(session));
  return session;
};

export const loginUser = async (email: string, password: string): Promise<AuthSession> => {
  const normalizedEmail = email.trim().toLowerCase();

  // 1. SUPABASE MODE
  if (isSupabaseEnabled) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    });

    if (error) {
      if (error.message.includes("Email not confirmed")) {
         throw new Error("Por favor, confirme seu e-mail antes de entrar.");
      }
      throw new Error("E-mail ou senha incorretos.");
    }
    
    if (!data.user || !data.session) throw new Error("Erro na sessão.");

    // Fetch Profile Data
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (profileError || !profile) {
       console.error("Profile fetch error:", profileError);
       // Fallback minimal profile if DB fetch fails but Auth works
       const fallbackProfile = {
         id: data.user.id,
         name: data.user.user_metadata?.name || 'Usuário',
         email: normalizedEmail,
         level: 1,
         currentXP: 0,
         nextLevelXP: 100,
         streakDays: 0,
         joinedDate: new Date(),
         isPremium: false,
         subscriptionStatus: 'canceled'
       };
       const session: AuthSession = {
        user: fallbackProfile as UserProfile,
        token: data.session.access_token,
        expiresAt: data.session.expires_at ? data.session.expires_at * 1000 : Date.now() + 86400000
      };
      localStorage.setItem(SESSION_KEY, safeStringify(session));
      return session;
    }

    const userProfile = mapProfileFromDB(profile, normalizedEmail);

    const session: AuthSession = {
      user: userProfile,
      token: data.session.access_token,
      expiresAt: data.session.expires_at ? data.session.expires_at * 1000 : Date.now() + 86400000
    };

    localStorage.setItem(SESSION_KEY, safeStringify(session));
    return session;
  }

  // 2. MOCK MODE
  await delay(1200);
  const usersStr = localStorage.getItem(DB_USERS_KEY);
  const users = usersStr ? JSON.parse(usersStr) : [];
  const userRecord = users.find((u: any) => u.email === normalizedEmail && u.password === password);

  if (!userRecord) throw new Error("E-mail ou senha incorretos.");

  const { password: _, ...userProfile } = userRecord;
  
  const session: AuthSession = {
    user: userProfile as UserProfile,
    token: 'mock-token-' + Date.now(),
    expiresAt: Date.now() + (7 * 24 * 60 * 60 * 1000)
  };

  localStorage.setItem(SESSION_KEY, safeStringify(session));
  return session;
};

export const logoutUser = async () => {
  localStorage.removeItem(SESSION_KEY);
  if (isSupabaseEnabled) {
    await supabase.auth.signOut();
  }
};

export const getSession = (): AuthSession | null => {
  const sessionStr = localStorage.getItem(SESSION_KEY);
  if (!sessionStr) return null;
  
  try {
    const session = JSON.parse(sessionStr) as AuthSession;
    // Simple expiry check
    if (Date.now() > session.expiresAt) {
      localStorage.removeItem(SESSION_KEY);
      return null;
    }
    return session;
  } catch (e) {
    console.error("Session corrupted, clearing storage.", e);
    localStorage.removeItem(SESSION_KEY); // Auto-recovery
    return null;
  }
};

export const updateUserProfile = async (updatedUser: UserProfile) => {
  // Update Local Session
  const session = getSession();
  if (session) {
    session.user = updatedUser;
    localStorage.setItem(SESSION_KEY, safeStringify(session));
  }

  // 1. SUPABASE MODE
  if (isSupabaseEnabled) {
    const { error } = await supabase
      .from('profiles')
      .update({
        name: updatedUser.name,
        phone: updatedUser.phone,
        level: updatedUser.level,
        current_xp: updatedUser.currentXP,
        streak_days: updatedUser.streakDays,
        spiritual_maturity: updatedUser.spiritualMaturity,
        patron_saint: updatedUser.patronSaint
      })
      .eq('id', updatedUser.id);
      
    if (error) console.error("Failed to sync profile update to Supabase", error);
    return;
  }
  
  // 2. MOCK MODE
  const usersStr = localStorage.getItem(DB_USERS_KEY);
  const users = usersStr ? JSON.parse(usersStr) : [];
  const index = users.findIndex((u: any) => u.id === updatedUser.id);
  if (index >= 0) {
     const password = users[index].password;
     users[index] = { ...updatedUser, password };
     localStorage.setItem(DB_USERS_KEY, safeStringify(users));
  }
};
