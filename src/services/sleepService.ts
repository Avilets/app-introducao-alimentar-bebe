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
import type { SleepRecord } from '../types';

const getSleepCollection = (familyId: string) => {
  return collection(db, 'families', familyId, 'sleepRecords');
};

/**
 * Escuta em tempo real os registros de sono do bebê.
 */
export const subscribeToSleepRecords = (
  familyId: string,
  callback: (records: SleepRecord[]) => void
) => {
  const q = query(getSleepCollection(familyId), orderBy('startDateTime', 'desc'));
  
  return onSnapshot(q, (snapshot) => {
    const list: SleepRecord[] = [];
    snapshot.forEach((docSnap) => {
      list.push({
        id: docSnap.id,
        ...docSnap.data()
      } as SleepRecord);
    });
    callback(list);
  }, (error) => {
    console.error('Erro ao assinar registros de sono:', error);
  });
};

/**
 * Cria ou atualiza um registro de sono.
 */
export const saveSleepRecord = async (
  familyId: string,
  recordData: Omit<SleepRecord, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }
): Promise<string> => {
  try {
    const now = Date.now();
    const sleepCol = getSleepCollection(familyId);
    
    // Calcula a duração em minutos se start e end estiverem preenchidos
    let durationMinutes = recordData.durationMinutes;
    if (recordData.startDateTime && recordData.endDateTime) {
      const start = new Date(recordData.startDateTime).getTime();
      const end = new Date(recordData.endDateTime).getTime();
      if (end >= start) {
        durationMinutes = Math.round((end - start) / (60 * 1000));
      }
    }

    const payload: any = {
      babyId: recordData.babyId,
      sleepType: recordData.sleepType,
      startDateTime: recordData.startDateTime,
      endDateTime: recordData.endDateTime || null,
      durationMinutes: durationMinutes !== undefined ? durationMinutes : null,
      location: recordData.location,
      notes: recordData.notes || '',
      updatedAt: now
    };

    if (!recordData.id) {
      payload.createdAt = now;
    }

    if (recordData.id) {
      const docRef = doc(db, 'families', familyId, 'sleepRecords', recordData.id);
      await setDoc(docRef, {
        ...payload,
        updatedAt: now
      }, { merge: true });
      return recordData.id;
    } else {
      const docRef = await addDoc(sleepCol, payload);
      return docRef.id;
    }
  } catch (error) {
    console.error('Erro ao salvar registro de sono:', error);
    throw error;
  }
};

/**
 * Exclui um registro de sono.
 */
export const deleteSleepRecord = async (familyId: string, id: string): Promise<void> => {
  try {
    const docRef = doc(db, 'families', familyId, 'sleepRecords', id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Erro ao excluir registro de sono:', error);
    throw error;
  }
};

/**
 * Helper para buscar o sono ativo em andamento (sem endDateTime).
 */
export const getActiveSleepRecord = (records: SleepRecord[]): SleepRecord | null => {
  const active = records.find(r => !r.endDateTime);
  return active || null;
};

/**
 * Calcula o total de horas dormidas hoje.
 */
export const calculateHoursSleptToday = (records: SleepRecord[]): number => {
  const todayStr = new Date().toISOString().split('T')[0];
  let totalMinutes = 0;

  records.forEach(r => {
    if (r.durationMinutes && r.startDateTime.startsWith(todayStr)) {
      totalMinutes += r.durationMinutes;
    }
  });

  return Number((totalMinutes / 60).toFixed(1));
};

/**
 * Calcula o total de sonecas realizadas hoje.
 */
export const countNapsToday = (records: SleepRecord[]): number => {
  const todayStr = new Date().toISOString().split('T')[0];
  return records.filter(r => r.sleepType === 'soneca' && r.endDateTime && r.startDateTime.startsWith(todayStr)).length;
};
