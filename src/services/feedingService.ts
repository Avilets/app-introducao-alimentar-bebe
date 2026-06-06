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
import type { FeedingLog } from '../types';

/**
 * Auxiliar: gera o intervalo de data e hora local do dia selecionado (padrão hoje).
 * Retorna as strings no formato YYYY-MM-DDT00:00 e YYYY-MM-DDT23:59 para filtros.
 */
export const getDayDateRange = (date?: Date) => {
  const d = date || new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const dateStr = `${year}-${month}-${day}`;
  return {
    start: `${dateStr}T00:00`,
    end: `${dateStr}T23:59`
  };
};

const getFeedingsCollection = (familyId: string) => {
  return collection(db, 'families', familyId, 'feedings');
};

/**
 * Escuta em tempo real todas as mamadas e registros de água do usuário.
 */
export const subscribeToFeedings = (familyId: string, callback: (logs: FeedingLog[]) => void) => {
  const q = query(getFeedingsCollection(familyId), orderBy('datetime', 'desc'));
  
  return onSnapshot(q, (snapshot) => {
    const list: FeedingLog[] = [];
    snapshot.forEach((docSnap) => {
      list.push({
        id: docSnap.id,
        ...docSnap.data()
      } as FeedingLog);
    });
    callback(list);
  }, (error) => {
    console.error('Erro ao assinar mamadas/água:', error);
  });
};

/**
 * Busca de forma assíncrona todas as mamadas e registros de água do usuário.
 */
export const getFeedings = async (familyId: string): Promise<FeedingLog[]> => {
  try {
    const q = query(getFeedingsCollection(familyId), orderBy('datetime', 'desc'));
    const snapshot = await getDocs(q);
    const list: FeedingLog[] = [];
    snapshot.forEach((docSnap) => {
      list.push({
        id: docSnap.id,
        ...docSnap.data()
      } as FeedingLog);
    });
    return list;
  } catch (error) {
    console.error('Erro ao buscar mamadas/água:', error);
    throw error;
  }
};

/**
 * Busca apenas as mamadas e registros de água do dia de hoje.
 */
export const getTodayFeedings = async (familyId: string): Promise<FeedingLog[]> => {
  try {
    const range = getDayDateRange();
    const q = query(
      getFeedingsCollection(familyId),
      where('datetime', '>=', range.start),
      where('datetime', '<=', range.end)
    );
    const snapshot = await getDocs(q);
    const list: FeedingLog[] = [];
    snapshot.forEach((docSnap) => {
      list.push({
        id: docSnap.id,
        ...docSnap.data()
      } as FeedingLog);
    });
    // Ordenar localmente por datetime decrescente
    return list.sort((a, b) => b.datetime.localeCompare(a.datetime));
  } catch (error) {
    console.error('Erro ao buscar mamadas/água de hoje:', error);
    throw error;
  }
};

/**
 * Cria ou atualiza um registro de mamada/água no Firestore.
 */
export const saveFeedingLog = async (
  familyId: string,
  logData: Omit<FeedingLog, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }
): Promise<string> => {
  try {
    const now = Date.now();
    const feedingsCol = getFeedingsCollection(familyId);
    
    const payload: any = {
      babyId: logData.babyId,
      type: logData.type,
      datetime: logData.datetime,
      notes: logData.notes || '',
      createdAt: now,
      updatedAt: now
    };

    if (logData.amountMl !== undefined && logData.amountMl !== null) {
      payload.amountMl = Number(logData.amountMl);
    }
    if (logData.durationMinutes !== undefined && logData.durationMinutes !== null) {
      payload.durationMinutes = Number(logData.durationMinutes);
    }
    if (logData.breastSide !== undefined) {
      payload.breastSide = logData.breastSide;
    }
    if (logData.leftBreastDurationSeconds !== undefined && logData.leftBreastDurationSeconds !== null) {
      payload.leftBreastDurationSeconds = Number(logData.leftBreastDurationSeconds);
    }
    if (logData.rightBreastDurationSeconds !== undefined && logData.rightBreastDurationSeconds !== null) {
      payload.rightBreastDurationSeconds = Number(logData.rightBreastDurationSeconds);
    }
    if (logData.totalBreastDurationSeconds !== undefined && logData.totalBreastDurationSeconds !== null) {
      payload.totalBreastDurationSeconds = Number(logData.totalBreastDurationSeconds);
    }
    if (logData.startedAt !== undefined && logData.startedAt !== null) {
      payload.startedAt = Number(logData.startedAt);
    }
    if (logData.endedAt !== undefined && logData.endedAt !== null) {
      payload.endedAt = Number(logData.endedAt);
    }

    if (logData.id) {
      // Atualizar existente (preservando o createdAt original)
      const docRef = doc(db, 'families', familyId, 'feedings', logData.id);
      
      // Remove createdAt para não sobrescrever
      const { createdAt, ...updatePayload } = payload;
      await setDoc(docRef, {
        ...updatePayload,
        updatedAt: now
      }, { merge: true });
      
      return logData.id;
    } else {
      // Criar novo
      const docRef = await addDoc(feedingsCol, payload);
      return docRef.id;
    }
  } catch (error) {
    console.error('Erro ao salvar mamada/água:', error);
    throw error;
  }
};

/**
 * Exclui um registro de mamada/água do Firestore.
 */
export const deleteFeedingLog = async (familyId: string, id: string): Promise<void> => {
  try {
    const docRef = doc(db, 'families', familyId, 'feedings', id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Erro ao excluir mamada/água:', error);
    throw error;
  }
};
