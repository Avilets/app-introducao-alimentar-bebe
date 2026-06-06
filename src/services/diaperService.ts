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
import type { DiaperRecord } from '../types';

const getDiaperCollection = (familyId: string) => {
  return collection(db, 'families', familyId, 'diaperRecords');
};

/**
 * Escuta em tempo real as trocas de fralda.
 */
export const subscribeToDiaperRecords = (
  familyId: string,
  callback: (records: DiaperRecord[]) => void
) => {
  const q = query(getDiaperCollection(familyId), orderBy('datetime', 'desc'));
  
  return onSnapshot(q, (snapshot) => {
    const list: DiaperRecord[] = [];
    snapshot.forEach((docSnap) => {
      list.push({
        id: docSnap.id,
        ...docSnap.data()
      } as DiaperRecord);
    });
    callback(list);
  }, (error) => {
    console.error('Erro ao assinar trocas de fralda:', error);
  });
};

/**
 * Cria ou atualiza uma troca de fralda.
 */
export const saveDiaperRecord = async (
  familyId: string,
  recordData: Omit<DiaperRecord, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }
): Promise<string> => {
  try {
    const now = Date.now();
    const diaperCol = getDiaperCollection(familyId);
    
    const payload: any = {
      babyId: recordData.babyId,
      diaperType: recordData.diaperType,
      datetime: recordData.datetime,
      stoolColor: recordData.stoolColor || null,
      stoolConsistency: recordData.stoolConsistency || null,
      notes: recordData.notes || '',
      updatedAt: now
    };

    if (!recordData.id) {
      payload.createdAt = now;
    }

    if (recordData.id) {
      const docRef = doc(db, 'families', familyId, 'diaperRecords', recordData.id);
      await setDoc(docRef, {
        ...payload,
        updatedAt: now
      }, { merge: true });
      return recordData.id;
    } else {
      const docRef = await addDoc(diaperCol, payload);
      return docRef.id;
    }
  } catch (error) {
    console.error('Erro ao salvar troca de fralda:', error);
    throw error;
  }
};

/**
 * Exclui um registro de troca de fralda.
 */
export const deleteDiaperRecord = async (familyId: string, id: string): Promise<void> => {
  try {
    const docRef = doc(db, 'families', familyId, 'diaperRecords', id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Erro ao excluir troca de fralda:', error);
    throw error;
  }
};

/**
 * Verifica se a última troca de fralda com xixi ocorreu há mais de X horas.
 * Padrão recomendado de observação sem alarme: 6 horas.
 */
export const checkDiaperUrgency = (records: DiaperRecord[], limitHours = 6): boolean => {
  const wetRecords = records.filter(r => r.diaperType === 'xixi' || r.diaperType === 'xixi e cocô');
  if (wetRecords.length === 0) return true; // Nenhuma fralda molhada registrada

  const lastWet = wetRecords[0];
  const lastTime = new Date(lastWet.datetime).getTime();
  const diffHours = (Date.now() - lastTime) / (3600 * 1000);

  return diffHours > limitHours;
};
