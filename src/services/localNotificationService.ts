import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import type { Reminder } from '../types';

/**
 * Converte um ID string (como os do Firestore) em um inteiro de 32 bits positivo.
 * O Capacitor exige IDs numéricos para agendar notificações locais.
 */
export const getNumericId = (strId: string): number => {
  let hash = 0;
  for (let i = 0; i < strId.length; i++) {
    const char = strId.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Converte para inteiro de 32 bits
  }
  // Garante que seja um inteiro positivo válido para a API Android (menor que 2147483647)
  return Math.abs(hash) % 2147483647;
};

/**
 * Cria o canal de notificações obrigatório para Android 8.0+.
 */
const setupNotificationChannel = async () => {
  if (!Capacitor.isNativePlatform()) return;
  try {
    await LocalNotifications.createChannel({
      id: 'baby-reminders',
      name: 'Lembretes do Bebê',
      description: 'Alertas sobre a rotina alimentar do bebê',
      importance: 5, // Alta importância (Heads-up notification)
      visibility: 1, // Visível na tela de bloqueio
      vibration: true,
      sound: 'default'
    });
  } catch (error) {
    console.error('Erro ao configurar canal de notificações nativas:', error);
  }
};

/**
 * Verifica se a permissão para notificações locais está concedida.
 */
export const checkLocalNotificationPermission = async (): Promise<boolean> => {
  if (!Capacitor.isNativePlatform()) {
    if ('Notification' in window) {
      return Notification.permission === 'granted';
    }
    return false;
  }
  try {
    const status = await LocalNotifications.checkPermissions();
    return status.display === 'granted';
  } catch (error) {
    console.error('Erro ao verificar permissão de notificações locais:', error);
    return false;
  }
};

/**
 * Solicita permissão para exibir notificações locais.
 */
export const requestLocalNotificationPermission = async (): Promise<boolean> => {
  if (!Capacitor.isNativePlatform()) {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  }
  try {
    // Garante que o canal do Android exista antes de pedir a permissão
    await setupNotificationChannel();
    const status = await LocalNotifications.requestPermissions();
    return status.display === 'granted';
  } catch (error) {
    console.error('Erro ao solicitar permissão de notificações locais:', error);
    return false;
  }
};

/**
 * Obtém o prefixo de emoji/texto apropriado para cada tipo de lembrete.
 */
const getNotificationTitle = (reminder: Reminder): string => {
  switch (reminder.type) {
    case 'feeding':
      return `🍼 Hora de Mamar: ${reminder.title}`;
    case 'fruit':
      return `🍎 Hora da Frutinha: ${reminder.title}`;
    case 'meal':
      return `🍛 Hora da Refeição: ${reminder.title}`;
    default:
      return `⏰ Lembrete: ${reminder.title}`;
  }
};

/**
 * Agenda uma notificação local nativa.
 * Cancela qualquer agendamento existente com o mesmo ID antes de agendar.
 */
export const scheduleReminderNotification = async (reminder: Reminder): Promise<void> => {
  if (!Capacitor.isNativePlatform()) {
    console.log('[NotificationService WEB] Lembrete agendado (Web/Simulado):', reminder);
    return;
  }

  if (!reminder.id) {
    console.warn('[NotificationService] Não é possível agendar lembrete sem ID.');
    return;
  }

  // Primeiro, garante que limpou qualquer agendamento antigo do mesmo lembrete
  await cancelReminderNotification(reminder.id);

  // Se o lembrete estiver desativado ou sem horário de disparo, apenas cancela e sai
  if (!reminder.active || !reminder.nextTriggerAt || reminder.nextTriggerAt <= Date.now()) {
    return;
  }

  try {
    // Garante o canal antes de agendar
    await setupNotificationChannel();

    const numericId = getNumericId(reminder.id);
    const title = getNotificationTitle(reminder);
    const body = reminder.notes || 'Hora de cuidar do bebê!';
    const scheduleDate = new Date(reminder.nextTriggerAt);

    const scheduleOptions: any = {
      at: scheduleDate,
      allowWhileIdle: true
    };

    // Adiciona repetição diária se aplicável no modo fixo
    if (reminder.mode === 'fixed' && reminder.repeatDaily) {
      scheduleOptions.every = 'day';
    }

    await LocalNotifications.schedule({
      notifications: [
        {
          id: numericId,
          title,
          body,
          schedule: scheduleOptions,
          channelId: 'baby-reminders',
          smallIcon: 'ic_stat_name', // Nome padrão do ícone configurado pelo Capacitor
          actionTypeId: 'OPEN_APP'
        }
      ]
    });

    console.log(`[NotificationService NATIVE] Lembrete agendado com sucesso! ID: ${numericId}, Horário: ${scheduleDate.toLocaleString()}`);
  } catch (error) {
    console.error('Erro ao agendar notificação local nativa:', error);
  }
};

/**
 * Cancela uma notificação local pendente pelo ID.
 */
export const cancelReminderNotification = async (reminderId: string): Promise<void> => {
  if (!Capacitor.isNativePlatform()) {
    return;
  }

  try {
    const numericId = getNumericId(reminderId);
    await LocalNotifications.cancel({
      notifications: [{ id: numericId }]
    });
    console.log(`[NotificationService NATIVE] Lembrete cancelado. ID: ${numericId}`);
  } catch (error) {
    console.error('Erro ao cancelar notificação local nativa:', error);
  }
};
