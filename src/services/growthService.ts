import {
  collection,
  doc,
  setDoc,
  addDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  getDocs
} from 'firebase/firestore';
import { db } from './firebase';
import type { GrowthRecord } from '../types';

const getGrowthCollection = (familyId: string) => {
  return collection(db, 'families', familyId, 'growthRecords');
};

/**
 * Escuta em tempo real os registros de crescimento do usuário.
 */
export const subscribeToGrowthRecords = (
  familyId: string,
  callback: (records: GrowthRecord[]) => void
) => {
  const q = query(getGrowthCollection(familyId), orderBy('date', 'desc'));
  
  return onSnapshot(q, (snapshot) => {
    const list: GrowthRecord[] = [];
    snapshot.forEach((docSnap) => {
      list.push({
        id: docSnap.id,
        ...docSnap.data()
      } as GrowthRecord);
    });
    callback(list);
  }, (error) => {
    console.error('Erro ao assinar registros de crescimento:', error);
  });
};

/**
 * Busca de forma assíncrona todos os registros de crescimento do usuário.
 */
export const getGrowthRecords = async (familyId: string): Promise<GrowthRecord[]> => {
  try {
    const q = query(getGrowthCollection(familyId), orderBy('date', 'desc'));
    const snapshot = await getDocs(q);
    const list: GrowthRecord[] = [];
    snapshot.forEach((docSnap) => {
      list.push({
        id: docSnap.id,
        ...docSnap.data()
      } as GrowthRecord);
    });
    return list;
  } catch (error) {
    console.error('Erro ao buscar registros de crescimento:', error);
    throw error;
  }
};

/**
 * Cria ou atualiza um registro de crescimento no Firestore.
 */
export const saveGrowthRecord = async (
  familyId: string,
  recordData: Omit<GrowthRecord, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }
): Promise<string> => {
  try {
    const now = Date.now();
    const growthCol = getGrowthCollection(familyId);
    
    // Preparar campos para gravação (tratando perimetro opcional)
    const payload: any = {
      babyId: recordData.babyId,
      date: recordData.date,
      ageInDays: recordData.ageInDays,
      weightKg: Number(recordData.weightKg),
      lengthCm: Number(recordData.lengthCm),
      notes: recordData.notes || '',
      createdAt: now,
      updatedAt: now
    };

    if (recordData.headCircumferenceCm !== undefined && recordData.headCircumferenceCm !== null) {
      payload.headCircumferenceCm = Number(recordData.headCircumferenceCm);
    }

    if (recordData.id) {
      const docRef = doc(db, 'families', familyId, 'growthRecords', recordData.id);
      await setDoc(docRef, {
        ...payload,
        updatedAt: now
      }, { merge: true });
      return recordData.id;
    } else {
      const docRef = await addDoc(growthCol, payload);
      return docRef.id;
    }
  } catch (error) {
    console.error('Erro ao salvar registro de crescimento:', error);
    throw error;
  }
};

/**
 * Exclui um registro de crescimento do Firestore.
 */
export const deleteGrowthRecord = async (familyId: string, id: string): Promise<void> => {
  try {
    const docRef = doc(db, 'families', familyId, 'growthRecords', id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Erro ao excluir registro de crescimento:', error);
    throw error;
  }
};

/**
 * Retorna o último registro de crescimento (mais recente por data).
 */
export const getLatestGrowthRecord = (records: GrowthRecord[]): GrowthRecord | null => {
  if (!records || records.length === 0) return null;
  // Os registros já vêm ordenados por data decrescente
  return records[0];
};

/**
 * Calcula a variação de peso, comprimento e perímetro cefálico em relação ao registro anterior.
 */
export const calculateGrowthVariation = (
  current: GrowthRecord,
  previous?: GrowthRecord
): {
  weightDiff: number;
  lengthDiff: number;
  headDiff: number;
} => {
  if (!previous) {
    return { weightDiff: 0, lengthDiff: 0, headDiff: 0 };
  }
  
  const currentHead = current.headCircumferenceCm || 0;
  const prevHead = previous.headCircumferenceCm || 0;

  return {
    weightDiff: current.weightKg - previous.weightKg,
    lengthDiff: current.lengthCm - previous.lengthCm,
    headDiff: currentHead > 0 && prevHead > 0 ? currentHead - prevHead : 0
  };
};
