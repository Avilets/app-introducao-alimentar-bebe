import {
  collection,
  doc,
  setDoc,
  addDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy
} from 'firebase/firestore';
import { db } from './firebase';
import type { Reminder, ReminderMode } from '../types';

/**
 * Obtém a referência da subcoleção 'reminders' do usuário.
 */
const getRemindersCollection = (userId: string) => {
  return collection(db, 'users', userId, 'reminders');
};

/**
 * Calcula o timestamp de disparo com base no modo (horário fixo ou timer).
 */
export const calculateNextTrigger = (
  mode: ReminderMode,
  fixedTime?: string,
  intervalMinutes?: number
): number => {
  const now = Date.now();

  if (mode === 'timer') {
    const minutes = intervalMinutes || 120; // Padrão 2 horas se indefinido
    return now + minutes * 60 * 1000;
  }

  // Modo Horário Fixo (formato esperado: "HH:MM")
  if (mode === 'fixed' && fixedTime) {
    const [hoursStr, minutesStr] = fixedTime.split(':');
    const hours = parseInt(hoursStr, 10);
    const minutes = parseInt(minutesStr, 10);

    const targetDate = new Date();
    targetDate.setHours(hours, minutes, 0, 0);

    // Se o horário de hoje já passou, agenda para amanhã
    if (targetDate.getTime() <= now) {
      targetDate.setDate(targetDate.getDate() + 1);
    }
    return targetDate.getTime();
  }

  // Fallback seguro: agendar para daqui a 1 hora
  return now + 60 * 60 * 1000;
};

/**
 * Escuta em tempo real os lembretes do usuário.
 */
export const subscribeToReminders = (userId: string, callback: (reminders: Reminder[]) => void) => {
  const q = query(getRemindersCollection(userId), orderBy('nextTriggerAt', 'asc'));
  
  return onSnapshot(q, (snapshot) => {
    const remindersList: Reminder[] = [];
    snapshot.forEach((docSnap) => {
      remindersList.push({
        id: docSnap.id,
        ...docSnap.data()
      } as Reminder);
    });
    callback(remindersList);
  }, (error) => {
    console.error('Erro ao escutar lembretes:', error);
  });
};

/**
 * Verifica se um timestamp numérico corresponde ao dia de hoje no fuso local.
 */
const isTimestampToday = (timestamp?: number | null): boolean => {
  if (!timestamp) return false;
  const compDate = new Date(timestamp);
  const today = new Date();
  return compDate.getDate() === today.getDate() &&
         compDate.getMonth() === today.getMonth() &&
         compDate.getFullYear() === today.getFullYear();
};

/**
 * Cria ou atualiza um lembrete no Firestore.
 */
export const saveReminder = async (
  userId: string,
  reminderData: Omit<Reminder, 'id' | 'createdAt' | 'updatedAt' | 'nextTriggerAt'> & {
    id?: string;
    createdAt?: number;
    nextTriggerAt?: number;
    nextDueAt?: number;
    completedToday?: boolean;
    lastNotifiedAt?: number | null;
    notificationStatus?: 'sent' | 'failed' | 'skipped' | null;
  }
): Promise<string> => {
  try {
    const now = Date.now();
    const remindersCol = getRemindersCollection(userId);

    // Se estiver ativado e não possuir um nextTriggerAt calculado, calcula agora
    let triggerAt = reminderData.nextTriggerAt || reminderData.nextDueAt;
    if (reminderData.active && !triggerAt) {
      triggerAt = calculateNextTrigger(
        reminderData.mode,
        reminderData.fixedTime,
        reminderData.intervalMinutes
      );
    } else if (!reminderData.active) {
      // Se estiver desativado, define nextTriggerAt como 0 ou valor seguro
      triggerAt = 0;
    }

    const completed = isTimestampToday(reminderData.lastCompletedAt);

    const payload: Omit<Reminder, 'id'> = {
      babyId: reminderData.babyId,
      type: reminderData.type,
      title: reminderData.title,
      mode: reminderData.mode,
      fixedTime: reminderData.fixedTime || null as any,
      intervalMinutes: reminderData.intervalMinutes !== undefined ? reminderData.intervalMinutes : null as any,
      repeatDaily: reminderData.repeatDaily,
      active: reminderData.active,
      notes: reminderData.notes || '',
      createdAt: reminderData.createdAt || now,
      updatedAt: now,
      lastCompletedAt: reminderData.lastCompletedAt || null,
      nextTriggerAt: triggerAt || 0,
      nextDueAt: triggerAt || 0,
      completedToday: completed,
      lastNotifiedAt: reminderData.lastNotifiedAt || null,
      notificationStatus: reminderData.notificationStatus || null
    };

    if (reminderData.id) {
      const docRef = doc(db, 'users', userId, 'reminders', reminderData.id);
      
      const { createdAt, ...updatePayload } = payload;
      await setDoc(docRef, {
        ...updatePayload,
        updatedAt: now
      }, { merge: true });
      
      return reminderData.id;
    } else {
      const docRef = await addDoc(remindersCol, payload);
      return docRef.id;
    }
  } catch (error) {
    console.error('Erro ao salvar lembrete:', error);
    throw error;
  }
};

/**
 * Marca um lembrete como concluído (reagenda ou desativa).
 */
export const completeReminder = async (userId: string, reminder: Reminder): Promise<void> => {
  try {
    const now = Date.now();
    let nextActive = reminder.active;
    let triggerAt = 0;

    if (reminder.mode === 'timer') {
      // Temporizadores sempre repetem re-agendando a partir do momento de conclusão
      triggerAt = now + (reminder.intervalMinutes || 120) * 60 * 1000;
    } else {
      // Horário Fixo
      if (reminder.repeatDaily) {
        // Incrementa em 24h a partir do trigger atual para garantir que vá para o dia seguinte
        const [hoursStr, minutesStr] = (reminder.fixedTime || '08:00').split(':');
        const hours = parseInt(hoursStr, 10);
        const minutes = parseInt(minutesStr, 10);

        const targetDate = new Date();
        targetDate.setHours(hours, minutes, 0, 0);
        
        // Se targetDate calculada para hoje já passou ou é menor que a hora de conclusão, agenda para amanhã
        if (targetDate.getTime() <= now) {
          targetDate.setDate(targetDate.getDate() + 1);
        }
        triggerAt = targetDate.getTime();
      } else {
        // Se não repete diariamente, desativa após conclusão
        nextActive = false;
        triggerAt = 0;
      }
    }

    const docRef = doc(db, 'users', userId, 'reminders', reminder.id!);
    await setDoc(docRef, {
      active: nextActive,
      lastCompletedAt: now,
      nextTriggerAt: triggerAt,
      nextDueAt: triggerAt,
      completedToday: true,
      updatedAt: now
    }, { merge: true });
  } catch (error) {
    console.error('Erro ao concluir lembrete:', error);
    throw error;
  }
};

/**
 * Ativa ou desativa um lembrete, recalculando o disparo se ativado.
 */
export const toggleReminderActive = async (userId: string, reminder: Reminder): Promise<void> => {
  try {
    const now = Date.now();
    const nextActive = !reminder.active;
    
    let triggerAt = 0;
    if (nextActive) {
      triggerAt = calculateNextTrigger(reminder.mode, reminder.fixedTime, reminder.intervalMinutes);
    }

    const docRef = doc(db, 'users', userId, 'reminders', reminder.id!);
    await setDoc(docRef, {
      active: nextActive,
      nextTriggerAt: triggerAt,
      nextDueAt: triggerAt,
      updatedAt: now
    }, { merge: true });
  } catch (error) {
    console.error('Erro ao alternar status do lembrete:', error);
    throw error;
  }
};

/**
 * Exclui um lembrete do Firestore.
 */
export const deleteReminder = async (userId: string, id: string): Promise<void> => {
  try {
    const docRef = doc(db, 'users', userId, 'reminders', id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Erro ao excluir lembrete:', error);
    throw error;
  }
};
