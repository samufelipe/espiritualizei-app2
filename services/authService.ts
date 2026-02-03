import { UserProfile, OnboardingData, AuthSession } from '../types';
import { createClient } from '@supabase/supabase-js';

// @ts-ignore - Vite usa import.meta.env
export const SUPABASE_URL = (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_SUPABASE_URL) || (typeof process !== 'undefined' && process.env?.VITE_SUPABASE_URL) || "";
// @ts-ignore - Vite usa import.meta.env
export const SUPABASE_KEY = (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_SUPABASE_ANON_KEY) || (typeof process !== 'undefined' && process.env?.VITE_SUPABASE_ANON_KEY) || "";

const initSupabase = () => {
  if (SUPABASE_URL && SUPABASE_URL.startsWith('https://')) {
    try {
      return createClient(SUPABASE_URL, SUPABASE_KEY, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          storageKey: 'espiritualizei_supabase_auth', // Chave única para evitar conflitos
        }
      });
    } catch (e) {
      console.error("❌ Erro fatal na inicialização do Supabase:", e);
      return null;
    }
  }
  return null;
};

export const supabase = initSupabase();

export const getConnectionStatus = () => {
    if (!supabase) return false;
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

export const mapProfileFromDB = (dbProfile: any, email: string): UserProfile => ({
  id: dbProfile.id,
  name: dbProfile.name || 'Peregrino',
  email: email,
  phone: dbProfile.phone,
  photoUrl: dbProfile.photo_url,
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
  spiritualCycleStart: dbProfile.spiritual_cycle_start ? new Date(dbProfile.spiritual_cycle_start) : new Date(dbProfile.joined_date || Date.now()),
  isPremium: dbProfile.is_premium || false,
  subscriptionStatus: dbProfile.subscription_status || 'canceled',
  subscriptionRenewalAt: dbProfile.subscription_renewal_at ? new Date(dbProfile.subscription_renewal_at) : undefined,
  patronSaint: dbProfile.patron_saint,
  lastConfessionAt: dbProfile.last_confession_at ? new Date(dbProfile.last_confession_at) : undefined,
  confessionFrequency: dbProfile.confession_frequency
});

/**
 * SINCRONIZAÇÃO MESTRE: Busca os dados mais recentes do servidor
 * Esta função é chamada sempre que o app é aberto para garantir consistência
 */
export const syncUserFromServer = async (userId: string, email: string): Promise<UserProfile | null> => {
  if (!supabase) return null;
  
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
    
    if (profile && !error) {
      const updatedUser = mapProfileFromDB(profile, email);
      
      // Atualiza o cache local com os dados do servidor
      const session = getSession();
      if (session) {
        session.user = updatedUser;
        localStorage.setItem(SESSION_KEY, safeStringify(session));
      }
      
      console.log("🛡️ Sincronização Mestre: Perfil restaurado do servidor com sucesso.");
      return updatedUser;
    }
  } catch (e) {
    console.error("❌ Erro na sincronização mestre:", e);
  }
  
  return null;
};

export const loginUser = async (email: string, password: string): Promise<AuthSession> => {
  if (!supabase) throw new Error("Banco de dados não configurado.");
  const normalizedEmail = email.trim().toLowerCase();
  
  try {
    const { data, error } = await supabase.auth.signInWithPassword({ 
      email: normalizedEmail, 
      password: password.trim() 
    });
    
    if (error) throw error;
    if (!data.session) throw new Error("Falha ao iniciar sessão.");
    
    // Buscar perfil completo do banco
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user!.id)
      .maybeSingle();
    
    const session: AuthSession = {
      user: mapProfileFromDB(profile || { id: data.user!.id, name: 'Usuário' }, normalizedEmail),
      token: data.session.access_token,
      expiresAt: (data.session.expires_at || 0) * 1000
    };
    
    // Salvar sessão no localStorage
    localStorage.setItem(SESSION_KEY, safeStringify(session));
    localStorage.setItem('user_email', normalizedEmail);
    
    console.log("✅ Login realizado com sucesso. Dados persistidos.");
    return session;
    
  } catch (error: any) {
    throw error;
  }
};

export const registerUser = async (data: OnboardingData): Promise<AuthSession> => {
  if (!supabase) throw new Error("Serviço indisponível.");
  const email = data.email.trim().toLowerCase();
  
  // 1. Criar o usuário no Auth
  const { data: authData, error: authError } = await supabase.auth.signUp({ 
    email, 
    password: data.password || '',
    options: {
      data: {
        full_name: data.name.trim()
      }
    }
  });
  
  if (authError) {
    console.error("❌ Erro no Auth SignUp:", authError);
    throw authError;
  }
  
  if (!authData.user) throw new Error("Falha ao criar usuário no sistema de autenticação.");

  // 2. Preparar o payload do perfil (apenas campos que existem na tabela)
  const profilePayload: Record<string, any> = {
    id: authData.user.id,
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
    streak_days: 0,
    joined_date: new Date().toISOString()
  };
  
  // Campos opcionais - adicionar apenas se a coluna existir no banco
  // Esses campos serão ignorados silenciosamente se não existirem
  const optionalFields = {
    spiritual_cycle_start: new Date().toISOString(),
    last_routine_update: new Date().toISOString()
  };

  // 3. Inserir o perfil básico primeiro
  const { error: dbError } = await supabase.from('profiles').upsert([profilePayload]);
  
  if (dbError) {
    console.error("❌ Erro ao criar perfil no banco de dados:", dbError);
    throw new Error(`Erro ao salvar dados do perfil: ${dbError.message}`);
  }
  
  // 4. Tentar adicionar campos opcionais (ignorar erros se colunas não existirem)
  try {
    await supabase.from('profiles').update(optionalFields).eq('id', authData.user.id);
    console.log('✅ Campos opcionais atualizados com sucesso');
  } catch (optionalError) {
    console.warn('⚠️ Campos opcionais não puderam ser atualizados (colunas podem não existir):', optionalError);
    // Não lançar erro - campos opcionais não são críticos
  }

  const newUser = mapProfileFromDB(profilePayload, email);
  const session: AuthSession = { 
    user: newUser, 
    token: authData.session?.access_token || '', 
    expiresAt: Date.now() + (30 * 24 * 60 * 60 * 1000) // 30 dias de expiração
  };
  
  localStorage.setItem(SESSION_KEY, safeStringify(session));
  localStorage.setItem('user_email', email);
  
  console.log("✅ Registro realizado com sucesso. Dados persistidos.");
  return session;
};

export const logoutUser = async () => {
  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem('user_email');
  localStorage.removeItem('espiritualizei_daily_inspiration_date');
  if (supabase) await supabase.auth.signOut();
};

export const getSession = (): AuthSession | null => {
  const s = localStorage.getItem(SESSION_KEY);
  if (!s) return null;
  
  try {
    const session = JSON.parse(s);
    if (session.user) {
      // Restaurar datas como objetos Date
      session.user.joinedDate = new Date(session.user.joinedDate);
      if (session.user.lastRoutineUpdate) session.user.lastRoutineUpdate = new Date(session.user.lastRoutineUpdate);
      if (session.user.spiritualCycleStart) session.user.spiritualCycleStart = new Date(session.user.spiritualCycleStart);
      if (session.user.subscriptionRenewalAt) session.user.subscriptionRenewalAt = new Date(session.user.subscriptionRenewalAt);
      if (session.user.lastConfessionAt) session.user.lastConfessionAt = new Date(session.user.lastConfessionAt);
    }
    return session;
  } catch (e) { 
    console.error("Erro ao parsear sessão:", e);
    return null; 
  }
};

/**
 * ATUALIZAÇÃO DE PERFIL: Salva no servidor E no cache local
 * Garante que os dados persistam entre sessões
 */
export const updateUserProfile = async (u: UserProfile): Promise<boolean> => {
  // 1. Atualizar cache local PRIMEIRO (resposta imediata)
  const s = getSession();
  if (s) { 
    s.user = u; 
    localStorage.setItem(SESSION_KEY, safeStringify(s)); 
  }
  
  // 2. Persistir no servidor (fonte da verdade)
  if (supabase) {
    try {
      const { error } = await supabase.from('profiles').update({
        name: u.name,
        phone: u.phone,
        photo_url: u.photoUrl,
        level: u.level,
        current_xp: u.currentXP,
        next_level_xp: u.nextLevelXP,
        streak_days: u.streakDays,
        spiritual_maturity: u.spiritualMaturity,
        spiritual_focus: u.spiritualFocus,
        spiritual_goal: u.spiritualGoal,
        state_of_life: u.stateOfLife,
        patron_saint: u.patronSaint,
        last_routine_update: u.lastRoutineUpdate?.toISOString(),
        spiritual_cycle_start: u.spiritualCycleStart?.toISOString(),
        last_confession_at: u.lastConfessionAt?.toISOString(),
        confession_frequency: u.confessionFrequency,
        is_premium: u.isPremium,
        subscription_status: u.subscriptionStatus,
        subscription_renewal_at: u.subscriptionRenewalAt?.toISOString()
      }).eq('id', u.id);
      
      if (error) {
        console.error("❌ Erro ao salvar perfil no servidor:", error);
        return false;
      }
      
      console.log("✅ Perfil salvo no servidor com sucesso.");
      return true;
    } catch (e) {
      console.error("❌ Exceção ao salvar perfil:", e);
      return false;
    }
  }
  
  return false;
};

export const sendPasswordResetEmail = async (email: string) => {
  if (supabase) {
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
      redirectTo: 'https://www.espiritualizei.com/reset-password'
    });
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
