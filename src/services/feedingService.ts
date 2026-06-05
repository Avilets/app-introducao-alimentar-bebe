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

const getFeedingsCollection = (userId: string) => {
  return collection(db, 'users', userId, 'feedings');
};

/**
 * Escuta em tempo real todas as mamadas e registros de água do usuário.
 */
export const subscribeToFeedings = (userId: string, callback: (logs: FeedingLog[]) => void) => {
  const q = query(getFeedingsCollection(userId), orderBy('datetime', 'desc'));
  
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
export const getFeedings = async (userId: string): Promise<FeedingLog[]> => {
  try {
    const q = query(getFeedingsCollection(userId), orderBy('datetime', 'desc'));
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
export const getTodayFeedings = async (userId: string): Promise<FeedingLog[]> => {
  try {
    const range = getDayDateRange();
    const q = query(
      getFeedingsCollection(userId),
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
  userId: string,
  logData: Omit<FeedingLog, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }
): Promise<string> => {
  try {
    const now = Date.now();
    const feedingsCol = getFeedingsCollection(userId);
    
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

    if (logData.id) {
      // Atualizar existente (preservando o createdAt original)
      const docRef = doc(db, 'users', userId, 'feedings', logData.id);
      
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
export const deleteFeedingLog = async (userId: string, id: string): Promise<void> => {
  try {
    const docRef = doc(db, 'users', userId, 'feedings', id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Erro ao excluir mamada/água:', error);
    throw error;
  }
};
