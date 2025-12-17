
import { UserProfile, OnboardingData, AuthSession } from '../types';
import { createClient } from '@supabase/supabase-js';

// --- CONFIGURATION ---

// Em produção, estas variáveis DEVEM vir do ambiente (process.env ou import.meta.env)
// NÃO deixe chaves reais hardcoded aqui para publicação final.
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || '';
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY || '';

// Validação rigorosa para Produção
const isSupabaseConfigured = !!(SUPABASE_URL && SUPABASE_KEY && SUPABASE_URL.startsWith('https'));

export let supabase: any = null;

// Inicialização do Cliente
if (isSupabaseConfigured) {
  try {
    supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
    console.log("🔌 Supabase: Cliente Inicializado com Sucesso.");
  } catch (e) {
    console.error("❌ Supabase: Erro crítico na inicialização.", e);
  }
} else {
  console.warn("⚠️ Supabase: Variáveis de ambiente não detectadas. O app está rodando em MOCK MODE (LocalStorage). Dados não serão persistidos na nuvem.");
}

// --- MOCK DATABASE KEYS ---
const DB_USERS_KEY = 'espiritualizei_users_db';
const SESSION_KEY = 'espiritualizei_session';

// Helper to delay execution (simulate network in mock mode)
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// --- SAFETY HELPERS (Prevent JSON Crashes) ---

export const safeStringify = (obj: any) => {
  const cache = new Set();
  return JSON.stringify(obj, (key, value) => {
    if (typeof value === 'object' && value !== null) {
      if (cache.has(value)) return;
      if (value.constructor && value.constructor.name && (value.constructor.name.startsWith('HTML') || value.constructor.name.includes('Element'))) return;
      if (key.startsWith('_react')) return;
      cache.add(value);
    }
    return value;
  });
};

// --- HELPER FUNCTIONS ---

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
  // Fallback seguro: se last_routine_update não existir, usa joined_date
  lastRoutineUpdate: dbProfile.last_routine_update ? new Date(dbProfile.last_routine_update) : new Date(dbProfile.joined_date),
  isPremium: dbProfile.is_premium || false,
  subscriptionStatus: dbProfile.subscription_status || 'canceled',
  patronSaint: dbProfile.patron_saint
});

export const getConnectionStatus = () => isSupabaseConfigured && !!supabase;

// --- AUTH SERVICES ---

export const sendPasswordResetEmail = async (email: string) => {
  if (getConnectionStatus()) {
    // Usamos a origem atual como redirecionamento para evitar erros de URL não permitida
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin, 
    });
    if (error) throw error;
    return true;
  }
  await delay(1000); // Mock
  return true;
};

export const updateUserPassword = async (newPassword: string) => {
  if (getConnectionStatus()) {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw error;
    return true;
  }
  await delay(1000); // Mock
  return true;
};

export const registerUser = async (data: OnboardingData): Promise<AuthSession> => {
  if (getConnectionStatus()) {
    console.log("Tentando registrar no Supabase...");
    const email = data.email.trim().toLowerCase();

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: email,
      password: data.password,
    });

    if (authError) {
      console.error("Supabase Auth Error:", authError);
      // Repassa a mensagem exata para o frontend tratar
      throw new Error(authError.message); 
    }
    
    if (!authData.user) throw new Error("Erro ao criar usuário. Verifique seus dados.");

    const profilePayload = {
      id: authData.user.id,
      name: data.name,
      phone: data.phone,
      spiritual_maturity: 'Iniciante',
      spiritual_focus: data.primaryStruggle,
      state_of_life: data.stateOfLife,
      patron_saint: data.patronSaint,
      level: 1,
      current_xp: 0,
      is_premium: false,
      subscription_status: 'trial'
      // last_routine_update será gerenciado pelo DB ou inserido na primeira revisão
    };

    const { error: fullInsertError } = await supabase.from('profiles').insert([profilePayload]);
    
    if (fullInsertError) {
       console.warn("Full profile insert failed.", fullInsertError.message);
       // Check duplicate phone in profile
       if (fullInsertError.message.includes('unique constraint') && fullInsertError.message.includes('phone')) {
          // Rollback auth user creation if profile fails due to duplicate phone? 
          // Ideally yes, but for now we just throw so UI can show error.
          throw new Error("Este telefone já está cadastrado.");
       }

       // Fallback simples caso falhe por outros motivos de schema
       const basicPayload = {
          id: authData.user.id,
          name: data.name,
          phone: data.phone
       };
       const { error: basicInsertError } = await supabase.from('profiles').insert([basicPayload]);
       if (basicInsertError) console.error("Critical: Basic profile insert failed", basicInsertError);
    }

    // Adiciona joined_date manualmente para o objeto local, já que o DB gera automaticamente
    const newUser = mapProfileFromDB({ ...profilePayload, joined_date: new Date().toISOString() }, email);

    const session: AuthSession = {
      user: newUser,
      token: authData.session?.access_token || '',
      expiresAt: authData.session?.expires_at ? authData.session.expires_at * 1000 : Date.now() + 86400000
    };
    
    localStorage.setItem(SESSION_KEY, safeStringify(session));
    return session;
  }

  // MOCK MODE
  await delay(1000);
  const normalizedEmail = data.email.trim().toLowerCase(); // Normaliza e-mail no registro
  
  const usersStr = localStorage.getItem(DB_USERS_KEY);
  const users = usersStr ? JSON.parse(usersStr) : [];
  
  if (users.find((u: any) => u.email === normalizedEmail)) {
    throw new Error("Este e-mail já está cadastrado.");
  }

  if (data.phone && users.find((u: any) => u.phone === data.phone)) {
    throw new Error("Este telefone já está cadastrado.");
  }

  const newUser: UserProfile = {
    id: crypto.randomUUID(),
    name: String(data.name),
    email: normalizedEmail,
    phone: String(data.phone),
    level: 1,
    currentXP: 0,
    nextLevelXP: 100,
    streakDays: 0,
    spiritualMaturity: 'Iniciante',
    spiritualFocus: String(data.primaryStruggle),
    stateOfLife: String(data.stateOfLife),
    joinedDate: new Date(),
    lastRoutineUpdate: new Date(),
    isPremium: false,
    subscriptionStatus: 'trial',
    patronSaint: data.patronSaint
  };

  // STORE TRIMMED PASSWORD
  const dbRecord = { ...newUser, password: data.password?.trim() };
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

  if (getConnectionStatus()) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    });

    if (error) {
      if (error.message.includes("Email not confirmed")) throw new Error("Por favor, confirme seu e-mail antes de entrar.");
      throw new Error("E-mail ou senha incorretos.");
    }
    
    if (!data.user || !data.session) throw new Error("Erro na sessão.");

    const { data: profile } = await supabase.from('profiles').select('*').eq('id', data.user.id).maybeSingle();

    if (!profile) {
       // Auto-heal: Create profile if missing
       const fallbackProfile = {
         id: data.user.id,
         name: data.user.user_metadata?.name || 'Usuário',
         email: normalizedEmail,
         phone: '',
         level: 1,
         current_xp: 0,
         next_level_xp: 100,
         streak_days: 0,
         joined_date: new Date().toISOString(),
         is_premium: false,
         subscription_status: 'trial',
         spiritual_maturity: 'Iniciante',
         state_of_life: 'single',
         spiritual_focus: 'Paz'
       };
       try { supabase.from('profiles').insert([fallbackProfile]).then(() => {}); } catch (err) {}
       
       const session = {
        user: mapProfileFromDB(fallbackProfile, normalizedEmail),
        token: data.session.access_token,
        expiresAt: data.session.expires_at ? data.session.expires_at * 1000 : Date.now() + 86400000
      };
      localStorage.setItem(SESSION_KEY, safeStringify(session));
      return session;
    }

    const session = {
      user: mapProfileFromDB(profile, normalizedEmail),
      token: data.session.access_token,
      expiresAt: data.session.expires_at ? data.session.expires_at * 1000 : Date.now() + 86400000
    };

    localStorage.setItem(SESSION_KEY, safeStringify(session));
    return session;
  }

  // MOCK MODE
  await delay(1200);
  const usersStr = localStorage.getItem(DB_USERS_KEY);
  const users = usersStr ? JSON.parse(usersStr) : [];
  
  // ROBUST PASSWORD CHECK: Checks normal and trimmed to support legacy/whitespace errors
  const userRecord = users.find((u: any) => 
      (u.email?.toLowerCase() === normalizedEmail) && 
      (u.password === password || u.password === password.trim())
  );

  if (!userRecord) throw new Error("E-mail ou senha incorretos.");

  const { password: _, ...userProfile } = userRecord;
  // Restore date objects in mock
  const user = {
      ...userProfile,
      joinedDate: new Date(userProfile.joinedDate),
      lastRoutineUpdate: userProfile.lastRoutineUpdate ? new Date(userProfile.lastRoutineUpdate) : new Date(userProfile.joinedDate)
  } as UserProfile;

  const session = {
    user: user,
    token: 'mock-token-' + Date.now(),
    expiresAt: Date.now() + (7 * 24 * 60 * 60 * 1000)
  };

  localStorage.setItem(SESSION_KEY, safeStringify(session));
  return session;
};

export const logoutUser = async () => {
  localStorage.removeItem(SESSION_KEY);
  if (getConnectionStatus()) {
    await supabase.auth.signOut();
  }
};

export const getSession = (): AuthSession | null => {
  const sessionStr = localStorage.getItem(SESSION_KEY);
  if (!sessionStr) return null;
  try {
    const session = JSON.parse(sessionStr) as AuthSession;
    if (Date.now() > session.expiresAt) {
      localStorage.removeItem(SESSION_KEY);
      return null;
    }
    // Rehydrate Dates
    session.user.joinedDate = new Date(session.user.joinedDate);
    if(session.user.lastRoutineUpdate) session.user.lastRoutineUpdate = new Date(session.user.lastRoutineUpdate);
    return session;
  } catch (e) {
    localStorage.removeItem(SESSION_KEY);
    return null;
  }
};

export const updateUserProfile = async (updatedUser: UserProfile) => {
  const session = getSession();
  if (session) {
    session.user = updatedUser;
    localStorage.setItem(SESSION_KEY, safeStringify(session));
  }

  if (getConnectionStatus()) {
    // ATIVANDO GRAVAÇÃO DO last_routine_update
    await supabase.from('profiles').update({
        name: updatedUser.name,
        phone: updatedUser.phone,
        level: updatedUser.level,
        current_xp: updatedUser.currentXP,
        streak_days: updatedUser.streakDays,
        spiritual_maturity: updatedUser.spiritualMaturity,
        patron_saint: updatedUser.patronSaint,
        spiritual_focus: updatedUser.spiritualFocus,
        last_routine_update: updatedUser.lastRoutineUpdate // AGORA É REAL E PERSISTENTE
      }).eq('id', updatedUser.id);
    return;
  }
  
  // MOCK MODE UPDATE
  const usersStr = localStorage.getItem(DB_USERS_KEY);
  const users = usersStr ? JSON.parse(usersStr) : [];
  const index = users.findIndex((u: any) => u.id === updatedUser.id);
  if (index >= 0) {
     const password = users[index].password;
     users[index] = { ...updatedUser, password };
     localStorage.setItem(DB_USERS_KEY, safeStringify(users));
  }
};
