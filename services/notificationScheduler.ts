/**
 * ESPIRITUALIZEI - AGENDADOR DE NOTIFICAÇÕES
 * Sistema de agendamento inteligente de notificações
 */

import { supabase, getConnectionStatus } from './authService';
import { 
  detectPushSupport, 
  sendPushNotification, 
  scheduleLocalNotification,
  NotificationType,
  loadNotificationPreferences
} from './pushNotificationService';

/**
 * INSPIRAÇÕES DIÁRIAS
 */
const DAILY_INSPIRATIONS = [
  { title: "Luz para Hoje", body: "Confiai no Senhor de todo o coração e não vos apoieis na vossa própria inteligência. (Pr 3,5)" },
  { title: "Palavra do Dia", body: "O Senhor é meu pastor, nada me faltará. (Sl 23,1)" },
  { title: "Reflexão Matinal", body: "Buscai primeiro o Reino de Deus e a sua justiça, e todas as coisas vos serão dadas por acréscimo. (Mt 6,33)" },
  { title: "Força para Hoje", body: "Eu sou a luz do mundo. Quem me segue não andará nas trevas, mas terá a luz da vida. (Jo 8,12)" },
  { title: "Coragem", body: "Tudo posso naquele que me fortalece. (Fl 4,13)" },
  { title: "Paz Interior", body: "Deixo-vos a paz, a minha paz vos dou; não vo-la dou como o mundo a dá. (Jo 14,27)" },
  { title: "Esperança", body: "Porque eu bem sei os pensamentos que penso de vós, diz o Senhor; pensamentos de paz, e não de mal. (Jr 29,11)" },
  { title: "Amor", body: "Nisto conhecerão todos que sois meus discípulos, se tiverdes amor uns aos outros. (Jo 13,35)" },
  { title: "Fé", body: "Ora, a fé é a certeza das coisas que se esperam, a convicção de fatos que não se veem. (Hb 11,1)" },
  { title: "Perseverança", body: "Bem-aventurado o homem que suporta a provação; porque, depois de aprovado, receberá a coroa da vida. (Tg 1,12)" },
  { title: "Gratidão", body: "Em tudo dai graças, porque esta é a vontade de Deus em Cristo Jesus para convosco. (1Ts 5,18)" },
  { title: "Humildade", body: "Deus resiste aos soberbos, mas dá graça aos humildes. (Tg 4,6)" },
  { title: "Confiança", body: "Entrega o teu caminho ao Senhor; confia nele, e ele tudo fará. (Sl 37,5)" },
  { title: "Misericórdia", body: "Bem-aventurados os misericordiosos, porque alcançarão misericórdia. (Mt 5,7)" },
  { title: "Sabedoria", body: "Se algum de vós tem falta de sabedoria, peça-a a Deus, que a todos dá liberalmente. (Tg 1,5)" }
];

/**
 * MENSAGENS DE LEMBRETE DE ROTINA
 */
const ROUTINE_REMINDERS = {
  morning: [
    { title: "Bom Dia! ☀️", body: "Que tal começar o dia com sua rotina espiritual?" },
    { title: "Manhã de Graças", body: "Um momento de oração para iluminar todo o seu dia." },
    { title: "Despertar Espiritual", body: "O Senhor renova suas misericórdias a cada manhã. (Lm 3,23)" }
  ],
  afternoon: [
    { title: "Pausa para Deus 🙏", body: "No meio do dia, um momento de paz com o Senhor." },
    { title: "Renovação", body: "Renove suas forças com uma breve oração." },
    { title: "Angelus", body: "É hora do Angelus! Uma tradição de séculos te espera." }
  ],
  evening: [
    { title: "Boa Noite 🌙", body: "Encerre o dia em paz com sua rotina espiritual." },
    { title: "Exame de Consciência", body: "Um momento para agradecer e refletir sobre o dia." },
    { title: "Descanso em Deus", body: "Em paz me deito e logo adormeço, pois só tu, Senhor, me fazes repousar seguro. (Sl 4,9)" }
  ]
};

/**
 * MENSAGENS DE DESAFIO COMUNITÁRIO
 */
const CHALLENGE_MESSAGES = [
  { title: "Novo Desafio! 🔥", body: "Um novo desafio comunitário está disponível. Participe e fortaleça sua fé!" },
  { title: "Desafio da Comunidade", body: "A comunidade te espera! Veja o novo desafio de 3 dias." },
  { title: "Missão Espiritual", body: "Uma nova missão te aguarda. Junte-se aos irmãos neste desafio!" }
];

/**
 * MENSAGENS DE BIBLIOTECA
 */
const LIBRARY_SUGGESTIONS = [
  { title: "Hora de Estudar 📚", body: "Que tal aprofundar sua fé com um estudo na Biblioteca?" },
  { title: "Formação Espiritual", body: "A Biblioteca tem conteúdos incríveis esperando por você." },
  { title: "Conhecimento da Fé", body: "Dedique alguns minutos para crescer no conhecimento de Deus." }
];

/**
 * MENSAGENS DE INATIVIDADE
 */
const INACTIVITY_MESSAGES = [
  { title: "Sentimos sua falta! 💜", body: "Sua jornada espiritual te espera. Volte quando puder." },
  { title: "Não desista!", body: "Cada dia é uma nova chance de recomeçar. Estamos aqui por você." },
  { title: "Retorne à Oração", body: "O Senhor te espera de braços abertos. Volte para sua rotina." }
];

/**
 * OBTER INSPIRAÇÃO DO DIA
 */
export const getDailyInspiration = (): { title: string; body: string } => {
  const today = new Date();
  const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000);
  return DAILY_INSPIRATIONS[dayOfYear % DAILY_INSPIRATIONS.length];
};

/**
 * OBTER LEMBRETE DE ROTINA POR PERÍODO
 */
export const getRoutineReminder = (period: 'morning' | 'afternoon' | 'evening'): { title: string; body: string } => {
  const messages = ROUTINE_REMINDERS[period];
  const randomIndex = Math.floor(Math.random() * messages.length);
  return messages[randomIndex];
};

/**
 * AGENDAR NOTIFICAÇÃO DE INSPIRAÇÃO DIÁRIA
 */
export const scheduleDailyInspiration = async (userId: string): Promise<void> => {
  const config = await loadNotificationPreferences(userId);
  if (!config.daily_inspiration) return;
  
  const inspiration = getDailyInspiration();
  
  // Calcular tempo até as 7h da manhã
  const now = new Date();
  const scheduledTime = new Date(now);
  scheduledTime.setHours(7, 0, 0, 0);
  
  if (scheduledTime <= now) {
    scheduledTime.setDate(scheduledTime.getDate() + 1);
  }
  
  const delayMs = scheduledTime.getTime() - now.getTime();
  
  // Agendar notificação local
  await scheduleLocalNotification(
    inspiration.title,
    inspiration.body,
    'daily_inspiration',
    delayMs
  );
  
  console.log(`📅 Inspiração diária agendada para ${scheduledTime.toLocaleString()}`);
};

/**
 * AGENDAR LEMBRETES DE ROTINA
 */
export const scheduleRoutineReminders = async (userId: string): Promise<void> => {
  const config = await loadNotificationPreferences(userId);
  if (!config.routine_reminders) return;
  
  const now = new Date();
  
  // Manhã (7h)
  const morningTime = new Date(now);
  morningTime.setHours(7, 30, 0, 0);
  if (morningTime > now) {
    const morning = getRoutineReminder('morning');
    await scheduleLocalNotification(
      morning.title,
      morning.body,
      'routine_morning',
      morningTime.getTime() - now.getTime()
    );
  }
  
  // Tarde (12h)
  const afternoonTime = new Date(now);
  afternoonTime.setHours(12, 0, 0, 0);
  if (afternoonTime > now) {
    const afternoon = getRoutineReminder('afternoon');
    await scheduleLocalNotification(
      afternoon.title,
      afternoon.body,
      'routine_afternoon',
      afternoonTime.getTime() - now.getTime()
    );
  }
  
  // Noite (20h)
  const eveningTime = new Date(now);
  eveningTime.setHours(20, 0, 0, 0);
  if (eveningTime > now) {
    const evening = getRoutineReminder('evening');
    await scheduleLocalNotification(
      evening.title,
      evening.body,
      'routine_evening',
      eveningTime.getTime() - now.getTime()
    );
  }
  
  console.log('📅 Lembretes de rotina agendados para hoje');
};

/**
 * VERIFICAR E ENVIAR NOTIFICAÇÃO DE DESAFIO
 */
export const checkAndNotifyChallenge = async (userId: string): Promise<void> => {
  const config = await loadNotificationPreferences(userId);
  if (!config.challenge_updates) return;
  
  // Verificar se é dia de novo desafio (a cada 3 dias)
  const daysSinceEpoch = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
  const isNewChallengeDay = daysSinceEpoch % 3 === 0;
  
  if (isNewChallengeDay) {
    const lastNotified = localStorage.getItem(`challenge_notified_${userId}`);
    const today = new Date().toDateString();
    
    if (lastNotified !== today) {
      const message = CHALLENGE_MESSAGES[Math.floor(Math.random() * CHALLENGE_MESSAGES.length)];
      
      await scheduleLocalNotification(
        message.title,
        message.body,
        'challenge_new',
        0
      );
      
      localStorage.setItem(`challenge_notified_${userId}`, today);
      console.log('🔥 Notificação de novo desafio enviada');
    }
  }
};

/**
 * ENVIAR SUGESTÃO DE BIBLIOTECA
 */
export const sendLibrarySuggestion = async (userId: string): Promise<void> => {
  const config = await loadNotificationPreferences(userId);
  if (!config.library_suggestions) return;
  
  // Enviar apenas 2x por semana (terça e sexta)
  const today = new Date().getDay();
  if (today !== 2 && today !== 5) return;
  
  const lastSent = localStorage.getItem(`library_suggestion_${userId}`);
  const todayStr = new Date().toDateString();
  
  if (lastSent !== todayStr) {
    const message = LIBRARY_SUGGESTIONS[Math.floor(Math.random() * LIBRARY_SUGGESTIONS.length)];
    
    await scheduleLocalNotification(
      message.title,
      message.body,
      'library_suggestion',
      0
    );
    
    localStorage.setItem(`library_suggestion_${userId}`, todayStr);
    console.log('📚 Sugestão de biblioteca enviada');
  }
};

/**
 * VERIFICAR INATIVIDADE E NOTIFICAR
 */
export const checkInactivityAndNotify = async (userId: string, lastActivityDate: Date): Promise<void> => {
  const config = await loadNotificationPreferences(userId);
  if (!config.inactivity_reminders) return;
  
  const now = new Date();
  const daysSinceActivity = Math.floor((now.getTime() - lastActivityDate.getTime()) / (1000 * 60 * 60 * 24));
  
  // Notificar após 3 dias de inatividade
  if (daysSinceActivity >= 3) {
    const lastNotified = localStorage.getItem(`inactivity_notified_${userId}`);
    const today = now.toDateString();
    
    if (lastNotified !== today) {
      const message = INACTIVITY_MESSAGES[Math.floor(Math.random() * INACTIVITY_MESSAGES.length)];
      
      await sendPushNotification(
        userId,
        message.title,
        message.body,
        'inactivity'
      );
      
      localStorage.setItem(`inactivity_notified_${userId}`, today);
      console.log('💜 Notificação de inatividade enviada');
    }
  }
};

/**
 * INICIALIZAR TODAS AS NOTIFICAÇÕES AGENDADAS
 */
export const initializeNotificationScheduler = async (userId: string): Promise<void> => {
  const support = detectPushSupport();
  
  if (!support.canReceivePush) {
    console.log('⚠️ Notificações não suportadas neste dispositivo');
    return;
  }
  
  if (Notification.permission !== 'granted') {
    console.log('⚠️ Permissão de notificação não concedida');
    return;
  }
  
  console.log('🔔 Inicializando agendador de notificações...');
  
  // Agendar todas as notificações
  await Promise.all([
    scheduleDailyInspiration(userId),
    scheduleRoutineReminders(userId),
    checkAndNotifyChallenge(userId),
    sendLibrarySuggestion(userId)
  ]);
  
  console.log('✅ Agendador de notificações inicializado');
};

/**
 * REGISTRAR PERIODIC BACKGROUND SYNC (para notificações mesmo com app fechado)
 */
export const registerPeriodicSync = async (): Promise<boolean> => {
  if (!('serviceWorker' in navigator) || !('periodicSync' in ServiceWorkerRegistration.prototype)) {
    console.log('⚠️ Periodic Background Sync não suportado');
    return false;
  }
  
  try {
    const registration = await navigator.serviceWorker.ready;
    
    // Verificar permissão
    const status = await navigator.permissions.query({
      name: 'periodic-background-sync' as PermissionName
    });
    
    if (status.state !== 'granted') {
      console.log('⚠️ Permissão de Periodic Sync não concedida');
      return false;
    }
    
    // Registrar sync para inspiração diária (a cada 24h)
    await (registration as any).periodicSync.register('daily-inspiration', {
      minInterval: 24 * 60 * 60 * 1000 // 24 horas
    });
    
    // Registrar sync para lembretes de rotina (a cada 6h)
    await (registration as any).periodicSync.register('routine-reminder', {
      minInterval: 6 * 60 * 60 * 1000 // 6 horas
    });
    
    // Registrar sync para desafios (a cada 24h)
    await (registration as any).periodicSync.register('challenge-update', {
      minInterval: 24 * 60 * 60 * 1000 // 24 horas
    });
    
    console.log('✅ Periodic Background Sync registrado');
    return true;
  } catch (e) {
    console.error('❌ Erro ao registrar Periodic Sync:', e);
    return false;
  }
};
