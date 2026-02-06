/**
 * SERVIÇO DE CACHE ROBUSTO PARA PERSISTÊNCIA DE DADOS
 * 
 * Garante que todos os dados críticos (desafios, rotinas, intenções, etc.)
 * estejam disponíveis imediatamente, mesmo no primeiro acesso PWA/Mobile/Desktop
 * 
 * Estratégia:
 * 1. Cache local via localStorage
 * 2. Carregamento otimista (cache-first)
 * 3. Sincronização em background
 * 4. Fallback automático
 */

import { CommunityChallenge, RoutineItem, PrayerIntention, UserProfile } from '../types';

// Chaves de cache
const CACHE_KEYS = {
  CHALLENGE: 'espiritualizei_challenge_cache',
  ROUTINE: 'espiritualizei_routine_cache',
  INTENTIONS: 'espiritualizei_intentions_cache',
  USER: 'espiritualizei_user_cache',
  LAST_SYNC: 'espiritualizei_last_sync'
};

// TTL (Time To Live) para cada tipo de dado
const CACHE_TTL = {
  CHALLENGE: 3 * 24 * 60 * 60 * 1000, // 3 dias
  ROUTINE: 24 * 60 * 60 * 1000, // 1 dia
  INTENTIONS: 60 * 60 * 1000, // 1 hora
  USER: 7 * 24 * 60 * 60 * 1000 // 7 dias
};

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  version: string;
}

/**
 * Salvar dados no cache com timestamp
 */
function setCache<T>(key: string, data: T): void {
  try {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      version: '1.0'
    };
    localStorage.setItem(key, JSON.stringify(entry));
    console.log(`✅ Cache salvo: ${key}`);
  } catch (e) {
    console.error(`❌ Erro ao salvar cache ${key}:`, e);
  }
}

/**
 * Obter dados do cache se ainda válidos
 */
function getCache<T>(key: string, ttl: number): T | null {
  try {
    const cached = localStorage.getItem(key);
    if (!cached) return null;

    const entry: CacheEntry<T> = JSON.parse(cached);
    const age = Date.now() - entry.timestamp;

    if (age > ttl) {
      console.log(`⏰ Cache expirado: ${key} (${Math.round(age / 1000 / 60)} min)`);
      localStorage.removeItem(key);
      return null;
    }

    console.log(`📦 Cache válido: ${key} (${Math.round(age / 1000 / 60)} min atrás)`);
    return entry.data;
  } catch (e) {
    console.error(`❌ Erro ao ler cache ${key}:`, e);
    return null;
  }
}

/**
 * Limpar cache específico
 */
function clearCache(key: string): void {
  try {
    localStorage.removeItem(key);
    console.log(`🗑️ Cache limpo: ${key}`);
  } catch (e) {
    console.error(`❌ Erro ao limpar cache ${key}:`, e);
  }
}

/**
 * Limpar todos os caches
 */
export function clearAllCache(): void {
  Object.values(CACHE_KEYS).forEach(clearCache);
  console.log('🗑️ Todos os caches limpos');
}

// ============================================
// DESAFIO COMUNITÁRIO
// ============================================

export function cacheChallenge(challenge: CommunityChallenge): void {
  setCache(CACHE_KEYS.CHALLENGE, challenge);
}

export function getCachedChallenge(): CommunityChallenge | null {
  return getCache<CommunityChallenge>(CACHE_KEYS.CHALLENGE, CACHE_TTL.CHALLENGE);
}

export function clearChallengeCache(): void {
  clearCache(CACHE_KEYS.CHALLENGE);
}

// ============================================
// ROTINA
// ============================================

export function cacheRoutine(routine: RoutineItem[]): void {
  setCache(CACHE_KEYS.ROUTINE, routine);
}

export function getCachedRoutine(): RoutineItem[] | null {
  return getCache<RoutineItem[]>(CACHE_KEYS.ROUTINE, CACHE_TTL.ROUTINE);
}

export function clearRoutineCache(): void {
  clearCache(CACHE_KEYS.ROUTINE);
}

// ============================================
// INTENÇÕES
// ============================================

export function cacheIntentions(intentions: PrayerIntention[]): void {
  setCache(CACHE_KEYS.INTENTIONS, intentions);
}

export function getCachedIntentions(): PrayerIntention[] | null {
  return getCache<PrayerIntention[]>(CACHE_KEYS.INTENTIONS, CACHE_TTL.INTENTIONS);
}

export function clearIntentionsCache(): void {
  clearCache(CACHE_KEYS.INTENTIONS);
}

// ============================================
// USUÁRIO
// ============================================

export function cacheUser(user: UserProfile): void {
  setCache(CACHE_KEYS.USER, user);
}

export function getCachedUser(): UserProfile | null {
  return getCache<UserProfile>(CACHE_KEYS.USER, CACHE_TTL.USER);
}

export function clearUserCache(): void {
  clearCache(CACHE_KEYS.USER);
}

// ============================================
// SINCRONIZAÇÃO
// ============================================

export function markSyncComplete(): void {
  localStorage.setItem(CACHE_KEYS.LAST_SYNC, Date.now().toString());
}

export function getLastSyncTime(): number {
  const lastSync = localStorage.getItem(CACHE_KEYS.LAST_SYNC);
  return lastSync ? parseInt(lastSync) : 0;
}

export function shouldSync(intervalMs: number = 5 * 60 * 1000): boolean {
  const lastSync = getLastSyncTime();
  const timeSinceSync = Date.now() - lastSync;
  return timeSinceSync > intervalMs;
}

// ============================================
// ESTRATÉGIA DE CARREGAMENTO OTIMISTA
// ============================================

/**
 * Carrega dados com estratégia cache-first
 * 1. Retorna cache imediatamente se disponível
 * 2. Busca dados frescos em background
 * 3. Atualiza cache e retorna novos dados
 */
export async function loadWithCacheFirst<T>(
  cacheGetter: () => T | null,
  fetchFn: () => Promise<T | null>,
  cacheSetter: (data: T) => void
): Promise<{ cached: T | null; fresh: T | null }> {
  // 1. Tentar cache primeiro
  const cached = cacheGetter();
  
  // 2. Buscar dados frescos em background
  let fresh: T | null = null;
  try {
    fresh = await fetchFn();
    if (fresh) {
      cacheSetter(fresh);
    }
  } catch (e) {
    console.error('Erro ao buscar dados frescos:', e);
  }

  return { cached, fresh };
}

/**
 * Obter dados com fallback automático
 * Prioridade: fresh > cached > null
 */
export function getDataWithFallback<T>(
  fresh: T | null,
  cached: T | null
): T | null {
  return fresh || cached || null;
}
