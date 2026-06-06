import {
  collection,
  doc,
  setDoc,
  addDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  getDocs,
  where
} from 'firebase/firestore';
import { db } from './firebase';
import type { Medication, MedicationLog, Reminder } from '../types';
import { saveReminder, deleteReminder } from './reminderService';

const getMedicationsCollection = (familyId: string) => {
  return collection(db, 'families', familyId, 'medications');
};

const getMedicationLogsCollection = (familyId: string) => {
  return collection(db, 'families', familyId, 'medicationLogs');
};

const getRemindersCollection = (familyId: string) => {
  return collection(db, 'families', familyId, 'reminders');
};

/**
 * Escuta em tempo real os medicamentos cadastrados.
 */
export const subscribeToMedications = (
  userId: string,
  callback: (medications: Medication[]) => void
) => {
  const q = query(getMedicationsCollection(userId), orderBy('createdAt', 'desc'));
  
  return onSnapshot(q, (snapshot) => {
    const list: Medication[] = [];
    snapshot.forEach((docSnap) => {
      list.push({
        id: docSnap.id,
        ...docSnap.data()
      } as Medication);
    });
    callback(list);
  }, (error) => {
    console.error('Erro ao assinar medicamentos:', error);
  });
};

/**
 * Escuta em tempo real o histórico de administrações.
 */
export const subscribeToMedicationLogs = (
  userId: string,
  callback: (logs: MedicationLog[]) => void
) => {
  const q = query(getMedicationLogsCollection(userId), orderBy('datetime', 'desc'));
  
  return onSnapshot(q, (snapshot) => {
    const list: MedicationLog[] = [];
    snapshot.forEach((docSnap) => {
      list.push({
        id: docSnap.id,
        ...docSnap.data()
      } as MedicationLog);
    });
    callback(list);
  }, (error) => {
    console.error('Erro ao assinar histórico de administrações:', error);
  });
};

/**
 * Calcula os horários de lembrete com base nas regras de frequência.
 */
export const calculateReminderTimes = (med: Omit<Medication, 'id' | 'createdAt' | 'updatedAt'>): string[] => {
  const times: string[] = [];
  const baseTime = med.reminderTime || '08:00';
  const [baseHourStr, baseMinuteStr] = baseTime.split(':');
  const baseHour = Number(baseHourStr) || 8;
  const baseMinute = Number(baseMinuteStr) || 0;

  if (med.frequencyType === 'dose única') {
    times.push(baseTime); // Horário padrão/customizado para dose única
  } else if (med.frequencyType === 'horários fixos' && med.fixedTimes) {
    return med.fixedTimes;
  } else if (med.frequencyType === 'a cada X horas' && med.intervalHours) {
    const interval = Number(med.intervalHours);
    const dosesPerDay = Math.floor(24 / interval);
    let currentHour = baseHour;
    for (let i = 0; i < dosesPerDay; i++) {
      const hStr = String(currentHour % 24).padStart(2, '0');
      const mStr = String(baseMinute).padStart(2, '0');
      times.push(`${hStr}:${mStr}`);
      currentHour += interval;
    }
  } else if (med.frequencyType === 'X vezes ao dia' && med.timesPerDay) {
    const count = Number(med.timesPerDay);
    const interval = Math.floor(24 / count);
    let currentHour = baseHour;
    for (let i = 0; i < count; i++) {
      const hStr = String(currentHour % 24).padStart(2, '0');
      const mStr = String(baseMinute).padStart(2, '0');
      times.push(`${hStr}:${mStr}`);
      currentHour += interval;
    }
  }

  return times;
};

/**
 * Cria ou atualiza os lembretes do sistema para um medicamento.
 */
const syncMedicationReminders = async (userId: string, medicationId: string, medData: Medication) => {
  try {
    // 1. Busca lembretes antigos vinculados a esta medicação
    const remindersCol = getRemindersCollection(userId);
    const q = query(remindersCol, where('medicationId', '==', medicationId));
    const snapshot = await getDocs(q);

    // 2. Apaga lembretes antigos
    const deletePromises = snapshot.docs.map(docSnap => deleteReminder(userId, docSnap.id));
    await Promise.all(deletePromises);

    // Se o medicamento estiver inativo ou lembrete desabilitado, não criamos novos lembretes
    if (!medData.active || medData.enableReminder === false) return;

    // 3. Calcula novos horários e agenda
    const times = calculateReminderTimes(medData);
    const savePromises = times.map(time => {
      const payload: Omit<Reminder, 'id'> = {
        babyId: medData.babyId,
        type: 'medicamento',
        title: `${medData.name} (${medData.dose} ${medData.unit})`,
        mode: 'fixed',
        fixedTime: time,
        repeatDaily: medData.frequencyType !== 'dose única',
        active: true,
        medicationId: medicationId,
        notes: medData.notes || `Administrar ${medData.name}`,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        nextTriggerAt: 0 // Será calculado pelo saveReminder
      };
      return saveReminder(userId, payload);
    });

    await Promise.all(savePromises);
  } catch (error) {
    console.error('Erro ao sincronizar lembretes do medicamento:', error);
  }
};

/**
 * Cadastra ou edita um medicamento.
 */
export const saveMedication = async (
  userId: string,
  medData: Omit<Medication, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }
): Promise<string> => {
  try {
    const now = Date.now();
    const medCol = getMedicationsCollection(userId);

    const payload: any = {
      babyId: medData.babyId,
      name: medData.name,
      dose: medData.dose,
      unit: medData.unit,
      frequencyType: medData.frequencyType,
      intervalHours: medData.intervalHours !== undefined ? Number(medData.intervalHours) : null,
      timesPerDay: medData.timesPerDay !== undefined ? Number(medData.timesPerDay) : null,
      fixedTimes: medData.fixedTimes || null,
      startDate: medData.startDate,
      endDate: medData.endDate || null,
      prescribedBy: medData.prescribedBy || '',
      notes: medData.notes || '',
      active: medData.active !== undefined ? medData.active : true,
      enableReminder: medData.enableReminder !== undefined ? medData.enableReminder : true,
      reminderTime: medData.reminderTime || '08:00',
      updatedAt: now
    };

    if (!medData.id) {
      payload.createdAt = now;
    }

    let medicationId = medData.id || '';

    if (medData.id) {
      const docRef = doc(db, 'families', userId, 'medications', medData.id);
      await setDoc(docRef, payload, { merge: true });
    } else {
      const docRef = await addDoc(medCol, payload);
      medicationId = docRef.id;
    }

    // Sincroniza lembretes no Firestore
    const fullMedData = { ...payload, id: medicationId } as Medication;
    await syncMedicationReminders(userId, medicationId, fullMedData);

    return medicationId;
  } catch (error) {
    console.error('Erro ao salvar medicamento:', error);
    throw error;
  }
};

/**
 * Exclui um medicamento e seus lembretes associados.
 */
export const deleteMedication = async (userId: string, id: string): Promise<void> => {
  try {
    // 1. Apaga lembretes vinculados
    const remindersCol = getRemindersCollection(userId);
    const q = query(remindersCol, where('medicationId', '==', id));
    const snapshot = await getDocs(q);
    const deletePromises = snapshot.docs.map(docSnap => deleteReminder(userId, docSnap.id));
    await Promise.all(deletePromises);

    // 2. Apaga o medicamento
    const docRef = doc(db, 'families', userId, 'medications', id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Erro ao excluir medicamento:', error);
    throw error;
  }
};

/**
 * Registra a administração (log) de um medicamento.
 */
export const saveMedicationLog = async (
  userId: string,
  logData: Omit<MedicationLog, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }
): Promise<string> => {
  try {
    const now = Date.now();
    const logCol = getMedicationLogsCollection(userId);

    const payload: any = {
      babyId: logData.babyId,
      medicationId: logData.medicationId,
      medicationName: logData.medicationName,
      datetime: logData.datetime,
      doseGiven: logData.doseGiven,
      status: logData.status,
      notes: logData.notes || '',
      updatedAt: now
    };

    if (!logData.id) {
      payload.createdAt = now;
    }

    if (logData.id) {
      const docRef = doc(db, 'families', userId, 'medicationLogs', logData.id);
      await setDoc(docRef, payload, { merge: true });
      return logData.id;
    } else {
      const docRef = await addDoc(logCol, payload);
      return docRef.id;
    }
  } catch (error) {
    console.error('Erro ao salvar log de medicamento:', error);
    throw error;
  }
};

/**
 * Exclui um log de administração.
 */
export const deleteMedicationLog = async (userId: string, id: string): Promise<void> => {
  try {
    const docRef = doc(db, 'families', userId, 'medicationLogs', id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Erro ao excluir log de medicamento:', error);
    throw error;
  }
};
