
import { LocalNotifications } from '@capacitor/local-notifications';
import { RoutineItem } from '../types';

export const requestNotificationPermission = async () => {
  try {
    const permission = await LocalNotifications.requestPermissions();
    return permission.display === 'granted';
  } catch (e) {
    console.warn('Notificações não suportadas neste ambiente');
    return false;
  }
};

export const scheduleRoutineNotifications = async (items: RoutineItem[]) => {
  try {
    // Limpa notificações anteriores para não duplicar
    const pending = await LocalNotifications.getPending();
    if (pending.notifications.length > 0) {
      await LocalNotifications.cancel(pending);
    }

    const notifications = items.map((item, index) => {
      // Mapeia o ícone para uma mensagem amigável
      const getMessage = (title: string) => {
        if (title.toLowerCase().includes('terço')) return 'É hora de meditar os mistérios do Rosário. 🙏';
        if (title.toLowerCase().includes('missa')) return 'O banquete do Senhor te espera. Vamos? ⛪';
        if (title.toLowerCase().includes('leitura')) return 'Um momento com a Palavra de Deus para iluminar seu dia. 📖';
        return 'Um momento de oração reservado para sua alma. ✨';
      };

      // Define um horário padrão se não houver (ex: 08:00, 12:00, 18:00 baseado no index para teste)
      // Em um cenário real, usaríamos o campo timeOfDay do item
      const hour = 8 + (index * 4); 

      return {
        title: item.title,
        body: getMessage(item.title),
        id: index + 1,
        schedule: {
          on: {
            hour: hour % 24,
            minute: 0
          },
          repeats: true,
          allowWhileIdle: true
        },
        sound: 'default',
        attachments: [],
        actionTypeId: '',
        extra: null
      };
    });

    if (notifications.length > 0) {
      await LocalNotifications.schedule({
        notifications: notifications as any
      });
    }
  } catch (e) {
    console.error('Erro ao agendar notificações:', e);
  }
};
