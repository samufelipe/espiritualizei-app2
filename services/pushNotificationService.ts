/**
 * ESPIRITUALIZEI - SERVIÇO DE NOTIFICAÇÕES PUSH
 * Sistema completo de notificações para PWA
 * Suporta iOS 16.4+, Android e Desktop
 */

import { supabase, getConnectionStatus } from './authService';

// Chave pública VAPID para Web Push (você precisará gerar uma)
// Gere em: https://web-push-codelab.glitch.me/
const VAPID_PUBLIC_KEY = 'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U';

/**
 * TIPOS DE NOTIFICAÇÃO
 */
export type NotificationType = 
  | 'daily_inspiration'    // Inspiração diária (1x/dia manhã)
  | 'routine_morning'      // Lembrete rotina manhã
  | 'routine_afternoon'    // Lembrete rotina tarde
  | 'routine_evening'      // Lembrete rotina noite
  | 'challenge_new'        // Novo desafio (a cada 3 dias)
  | 'intercession'         // Alguém rezou por você
  | 'library_suggestion'   // Sugestão de estudo
  | 'inactivity'           // Usuário inativo
  | 'achievement'          // Conquista desbloqueada
  | 'streak'               // Streak de dias consecutivos
  | 'level_up';            // Subiu de nível

/**
 * CONFIGURAÇÃO DE NOTIFICAÇÕES
 */
export interface NotificationConfig {
  daily_inspiration: boolean;
  routine_reminders: boolean;
  challenge_updates: boolean;
  intercession_alerts: boolean;
  library_suggestions: boolean;
  inactivity_reminders: boolean;
}

const DEFAULT_CONFIG: NotificationConfig = {
  daily_inspiration: true,
  routine_reminders: true,
  challenge_updates: true,
  intercession_alerts: true,
  library_suggestions: true,
  inactivity_reminders: true
};

/**
 * DETECÇÃO DE SUPORTE A NOTIFICAÇÕES
 */
export interface PushSupport {
  isSupported: boolean;
  isPWA: boolean;
  isIOS: boolean;
  isAndroid: boolean;
  iosVersion: number | null;
  canReceivePush: boolean;
  reason: string;
}

export const detectPushSupport = (): PushSupport => {
  const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
  
  // Detectar iOS
  const isIOS = /iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream;
  
  // Detectar Android
  const isAndroid = /android/i.test(userAgent);
  
  // Detectar se está instalado como PWA
  const isPWA = window.matchMedia('(display-mode: standalone)').matches || 
                (window.navigator as any).standalone === true ||
                document.referrer.includes('android-app://');
  
  // Detectar versão do iOS
  let iosVersion: number | null = null;
  if (isIOS) {
    const match = userAgent.match(/OS (\d+)_/);
    if (match) {
      iosVersion = parseInt(match[1], 10);
    }
  }
  
  // Verificar suporte a Service Worker e Push
  const hasServiceWorker = 'serviceWorker' in navigator;
  const hasPushManager = 'PushManager' in window;
  const hasNotification = 'Notification' in window;
  
  // Determinar se pode receber push
  let canReceivePush = false;
  let reason = '';
  
  if (!hasServiceWorker) {
    reason = 'Seu navegador não suporta Service Workers.';
  } else if (!hasPushManager) {
    reason = 'Seu navegador não suporta notificações push.';
  } else if (!hasNotification) {
    reason = 'Seu navegador não suporta a API de Notificações.';
  } else if (isIOS && !isPWA) {
    reason = 'No iPhone, instale o app na tela inicial para receber notificações.';
  } else if (isIOS && iosVersion && iosVersion < 16) {
    reason = 'Atualize seu iOS para a versão 16.4 ou superior para receber notificações.';
  } else {
    canReceivePush = true;
    reason = 'Seu dispositivo suporta notificações push!';
  }
  
  return {
    isSupported: hasServiceWorker && hasPushManager && hasNotification,
    isPWA,
    isIOS,
    isAndroid,
    iosVersion,
    canReceivePush,
    reason
  };
};

/**
 * SOLICITAR PERMISSÃO DE NOTIFICAÇÃO
 */
export const requestPushPermission = async (): Promise<'granted' | 'denied' | 'default'> => {
  const support = detectPushSupport();
  
  if (!support.canReceivePush) {
    console.warn('⚠️ Push não suportado:', support.reason);
    return 'denied';
  }
  
  try {
    const permission = await Notification.requestPermission();
    console.log('🔔 Permissão de notificação:', permission);
    return permission;
  } catch (e) {
    console.error('❌ Erro ao solicitar permissão:', e);
    return 'denied';
  }
};

/**
 * REGISTRAR PARA PUSH NOTIFICATIONS
 */
export const subscribeToPush = async (userId: string): Promise<PushSubscription | null> => {
  const support = detectPushSupport();
  
  if (!support.canReceivePush) {
    console.warn('⚠️ Push não suportado:', support.reason);
    return null;
  }
  
  try {
    const registration = await navigator.serviceWorker.ready;
    
    // Verificar se já existe uma subscription
    let subscription = await registration.pushManager.getSubscription();
    
    if (!subscription) {
      // Criar nova subscription
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY) as BufferSource
      });
      
      console.log('✅ Nova subscription criada:', subscription.endpoint);
    }
    
    // Salvar subscription no servidor
    await savePushSubscription(userId, subscription);
    
    return subscription;
  } catch (e) {
    console.error('❌ Erro ao registrar push:', e);
    return null;
  }
};

/**
 * SALVAR SUBSCRIPTION NO SERVIDOR
 */
const savePushSubscription = async (userId: string, subscription: PushSubscription) => {
  if (!getConnectionStatus()) return;
  
  const subscriptionJSON = subscription.toJSON();
  
  try {
    const { error } = await supabase!.from('push_subscriptions').upsert({
      user_id: userId,
      endpoint: subscription.endpoint,
      p256dh: subscriptionJSON.keys?.p256dh,
      auth: subscriptionJSON.keys?.auth,
      device_info: {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        ...detectPushSupport()
      },
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'user_id'
    });
    
    if (error) throw error;
    console.log('✅ Subscription salva no servidor');
  } catch (e) {
    console.error('❌ Erro ao salvar subscription:', e);
  }
};

/**
 * SALVAR PREFERÊNCIAS DE NOTIFICAÇÃO
 */
export const saveNotificationPreferences = async (userId: string, config: NotificationConfig) => {
  if (!getConnectionStatus()) {
    localStorage.setItem(`notification_config_${userId}`, JSON.stringify(config));
    return;
  }
  
  try {
    const { error } = await supabase!.from('notification_preferences').upsert({
      user_id: userId,
      ...config,
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'user_id'
    });
    
    if (error) throw error;
    
    // Também salvar localmente
    localStorage.setItem(`notification_config_${userId}`, JSON.stringify(config));
    console.log('✅ Preferências de notificação salvas');
  } catch (e) {
    console.error('❌ Erro ao salvar preferências:', e);
  }
};

/**
 * CARREGAR PREFERÊNCIAS DE NOTIFICAÇÃO
 */
export const loadNotificationPreferences = async (userId: string): Promise<NotificationConfig> => {
  // Tentar carregar do localStorage primeiro
  const local = localStorage.getItem(`notification_config_${userId}`);
  if (local) {
    try {
      return JSON.parse(local);
    } catch (e) {}
  }
  
  // Tentar carregar do servidor
  if (getConnectionStatus()) {
    try {
      const { data, error } = await supabase!
        .from('notification_preferences')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();
      
      if (data && !error) {
        const config: NotificationConfig = {
          daily_inspiration: data.daily_inspiration ?? true,
          routine_reminders: data.routine_reminders ?? true,
          challenge_updates: data.challenge_updates ?? true,
          intercession_alerts: data.intercession_alerts ?? true,
          library_suggestions: data.library_suggestions ?? true,
          inactivity_reminders: data.inactivity_reminders ?? true
        };
        localStorage.setItem(`notification_config_${userId}`, JSON.stringify(config));
        return config;
      }
    } catch (e) {
      console.error('❌ Erro ao carregar preferências:', e);
    }
  }
  
  return DEFAULT_CONFIG;
};

/**
 * AGENDAR NOTIFICAÇÕES LOCAIS (para quando o servidor não está disponível)
 */
export const scheduleLocalNotification = async (
  title: string,
  body: string,
  type: NotificationType,
  delayMs: number = 0
): Promise<void> => {
  const support = detectPushSupport();
  
  if (!support.canReceivePush) return;
  
  const permission = await Notification.requestPermission();
  if (permission !== 'granted') return;
  
  setTimeout(() => {
    const notification = new Notification(title, {
      body,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-72x72.png',
      tag: type,
      data: { type }
    } as NotificationOptions);
    
    notification.onclick = () => {
      window.focus();
      notification.close();
    };
  }, delayMs);
};

/**
 * ENVIAR NOTIFICAÇÃO VIA SERVIDOR (para notificações em tempo real)
 */
export const sendPushNotification = async (
  userId: string,
  title: string,
  body: string,
  type: NotificationType,
  data?: any
): Promise<boolean> => {
  if (!getConnectionStatus()) return false;
  
  try {
    // Inserir na fila de notificações do Supabase
    const { error } = await supabase!.from('notification_queue').insert({
      user_id: userId,
      title,
      body,
      type,
      data: data || {},
      status: 'pending',
      created_at: new Date().toISOString()
    });
    
    if (error) throw error;
    
    console.log('✅ Notificação enfileirada:', type);
    return true;
  } catch (e) {
    console.error('❌ Erro ao enviar notificação:', e);
    return false;
  }
};

/**
 * NOTIFICAÇÕES ESPECÍFICAS
 */

// Notificação de Intercessão
export const notifyIntercession = async (userId: string, intercessorName: string) => {
  return sendPushNotification(
    userId,
    'Alguém rezou por você! 🙏',
    `${intercessorName} acendeu uma vela e intercedeu pela sua intenção.`,
    'intercession',
    { intercessorName }
  );
};

// Notificação de Conquista
export const notifyAchievement = async (userId: string, achievementName: string) => {
  return sendPushNotification(
    userId,
    'Nova Conquista Desbloqueada! 🏆',
    `Parabéns! Você conquistou: ${achievementName}`,
    'achievement',
    { achievementName }
  );
};

// Notificação de Subida de Nível
export const notifyLevelUp = async (userId: string, newLevel: number) => {
  return sendPushNotification(
    userId,
    'Você Subiu de Nível! ⭐',
    `Parabéns! Você alcançou o nível ${newLevel}. Continue sua jornada espiritual!`,
    'level_up',
    { newLevel }
  );
};

// Notificação de Streak
export const notifyStreak = async (userId: string, streakDays: number) => {
  return sendPushNotification(
    userId,
    `${streakDays} Dias Consecutivos! 🔥`,
    `Incrível! Você está em uma sequência de ${streakDays} dias de oração. Continue firme!`,
    'streak',
    { streakDays }
  );
};

/**
 * UTILITÁRIOS
 */

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/**
 * VERIFICAR STATUS DE NOTIFICAÇÕES
 */
export const getNotificationStatus = (): 'granted' | 'denied' | 'default' | 'unsupported' => {
  if (!('Notification' in window)) {
    return 'unsupported';
  }
  return Notification.permission;
};

/**
 * CANCELAR SUBSCRIPTION
 */
export const unsubscribeFromPush = async (userId: string): Promise<boolean> => {
  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    
    if (subscription) {
      await subscription.unsubscribe();
      
      // Remover do servidor
      if (getConnectionStatus()) {
        await supabase!.from('push_subscriptions').delete().eq('user_id', userId);
      }
      
      console.log('✅ Unsubscribed from push');
      return true;
    }
    
    return false;
  } catch (e) {
    console.error('❌ Erro ao cancelar subscription:', e);
    return false;
  }
};
