/**
 * WEB PUSH SERVICE
 * Gerencia notificações push para PWA usando Web Push API
 */

import { supabase } from './authService';

// VAPID Public Key (será gerada e configurada)
// Para gerar: npx web-push generate-vapid-keys
const VAPID_PUBLIC_KEY = '_n8jAjYQe7d2xIWsINKXDLjRPr36mRADf6L2dRT959Q_d8CAolUIA6JBs901ppKEl0ACJYvmfWoFs3RJxLpYBWA';

interface PushSubscriptionData {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

/**
 * Converte VAPID key de base64 para Uint8Array
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/**
 * Verifica se o navegador suporta notificações push
 */
export function isPushSupported(): boolean {
  return 'serviceWorker' in navigator && 
         'PushManager' in window && 
         'Notification' in window;
}

/**
 * Solicita permissão para notificações
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (!isPushSupported()) {
    console.warn('Push notifications não suportadas neste navegador');
    return false;
  }

  try {
    const permission = await Notification.requestPermission();
    console.log('📱 Permissão de notificação:', permission);
    return permission === 'granted';
  } catch (error) {
    console.error('Erro ao solicitar permissão:', error);
    return false;
  }
}

/**
 * Registra o Service Worker
 */
async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!('serviceWorker' in navigator)) {
    console.warn('Service Worker não suportado');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js');
    console.log('✅ Service Worker registrado:', registration);
    
    // Aguarda o SW estar ativo
    await navigator.serviceWorker.ready;
    
    return registration;
  } catch (error) {
    console.error('Erro ao registrar Service Worker:', error);
    return null;
  }
}

/**
 * Inscreve o usuário para receber push notifications
 */
export async function subscribeToPush(userId: string): Promise<boolean> {
  if (!isPushSupported()) {
    console.warn('Push notifications não suportadas');
    return false;
  }

  try {
    // 1. Registra o Service Worker
    const registration = await registerServiceWorker();
    if (!registration) {
      throw new Error('Falha ao registrar Service Worker');
    }

    // 2. Verifica se já existe uma inscrição
    let subscription = await registration.pushManager.getSubscription();

    // 3. Se não existe, cria uma nova
    if (!subscription) {
      const applicationServerKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);
      
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey as BufferSource
      });

      console.log('✅ Inscrição push criada:', subscription);
    } else {
      console.log('📱 Inscrição push já existe:', subscription);
    }

    // 4. Salva a inscrição no banco de dados
    const subscriptionData = subscription.toJSON() as PushSubscriptionData;
    
    const { error } = await supabase!
      .from('push_tokens')
      .upsert({
        user_id: userId,
        token: subscription.endpoint,
        endpoint: subscriptionData.endpoint,
        p256dh: subscriptionData.keys.p256dh,
        auth: subscriptionData.keys.auth,
        user_agent: navigator.userAgent,
        last_used_at: new Date().toISOString(),
        is_active: true
      }, {
        onConflict: 'token'
      });

    if (error) {
      console.error('Erro ao salvar token no banco:', error);
      throw error;
    }

    console.log('✅ Token de push salvo no banco de dados');
    return true;

  } catch (error) {
    console.error('Erro ao inscrever para push:', error);
    return false;
  }
}

/**
 * Cancela a inscrição de push notifications
 */
export async function unsubscribeFromPush(userId: string): Promise<boolean> {
  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (subscription) {
      await subscription.unsubscribe();
      console.log('✅ Inscrição push cancelada');

      // Remove do banco de dados
      await supabase!
        .from('push_tokens')
        .update({ is_active: false })
        .eq('user_id', userId);
    }

    return true;
  } catch (error) {
    console.error('Erro ao cancelar inscrição:', error);
    return false;
  }
}

/**
 * Verifica se o usuário está inscrito
 */
export async function isSubscribed(): Promise<boolean> {
  if (!isPushSupported()) {
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    return subscription !== null;
  } catch (error) {
    console.error('Erro ao verificar inscrição:', error);
    return false;
  }
}

/**
 * Salva preferências de notificação do usuário
 */
export async function saveNotificationPreferences(
  userId: string,
  preferences: {
    email_enabled?: boolean;
    push_enabled?: boolean;
    daily_inspiration?: boolean;
    routine_reminders?: boolean;
    challenge_updates?: boolean;
    community_updates?: boolean;
    preferred_time?: string;
  }
): Promise<boolean> {
  try {
    const { error } = await supabase!
      .from('notification_preferences')
      .upsert({
        user_id: userId,
        ...preferences,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      });

    if (error) {
      console.error('Erro ao salvar preferências:', error);
      return false;
    }

    console.log('✅ Preferências de notificação salvas');
    return true;
  } catch (error) {
    console.error('Erro ao salvar preferências:', error);
    return false;
  }
}

/**
 * Busca preferências de notificação do usuário
 */
export async function getNotificationPreferences(userId: string) {
  try {
    const { data, error } = await supabase!
      .from('notification_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = not found
      console.error('Erro ao buscar preferências:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Erro ao buscar preferências:', error);
    return null;
  }
}
