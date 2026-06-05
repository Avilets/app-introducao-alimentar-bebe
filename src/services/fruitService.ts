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
import { getDayDateRange } from './feedingService';
import type { FruitLog } from '../types';

const getFruitsCollection = (userId: string) => {
  return collection(db, 'users', userId, 'fruits');
};

/**
 * Escuta em tempo real todos os registros de frutas do usuário.
 */
export const subscribeToFruits = (userId: string, callback: (logs: FruitLog[]) => void) => {
  const q = query(getFruitsCollection(userId), orderBy('datetime', 'desc'));
  
  return onSnapshot(q, (snapshot) => {
    const list: FruitLog[] = [];
    snapshot.forEach((docSnap) => {
      list.push({
        id: docSnap.id,
        ...docSnap.data()
      } as FruitLog);
    });
    callback(list);
  }, (error) => {
    console.error('Erro ao assinar frutas:', error);
  });
};

/**
 * Busca de forma assíncrona todas as frutas registradas pelo usuário.
 */
export const getFruits = async (userId: string): Promise<FruitLog[]> => {
  try {
    const q = query(getFruitsCollection(userId), orderBy('datetime', 'desc'));
    const snapshot = await getDocs(q);
    const list: FruitLog[] = [];
    snapshot.forEach((docSnap) => {
      list.push({
        id: docSnap.id,
        ...docSnap.data()
      } as FruitLog);
    });
    return list;
  } catch (error) {
    console.error('Erro ao buscar frutas:', error);
    throw error;
  }
};

/**
 * Busca apenas as frutas registradas no dia de hoje.
 */
export const getTodayFruits = async (userId: string): Promise<FruitLog[]> => {
  try {
    const range = getDayDateRange();
    const q = query(
      getFruitsCollection(userId),
      where('datetime', '>=', range.start),
      where('datetime', '<=', range.end)
    );
    const snapshot = await getDocs(q);
    const list: FruitLog[] = [];
    snapshot.forEach((docSnap) => {
      list.push({
        id: docSnap.id,
        ...docSnap.data()
      } as FruitLog);
    });
    return list.sort((a, b) => b.datetime.localeCompare(a.datetime));
  } catch (error) {
    console.error('Erro ao buscar frutas de hoje:', error);
    throw error;
  }
};

/**
 * Cria ou atualiza um registro de fruta no Firestore.
 */
export const saveFruitLog = async (
  userId: string,
  logData: Omit<FruitLog, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }
): Promise<string> => {
  try {
    const now = Date.now();
    const fruitsCol = getFruitsCollection(userId);
    
    const payload: Omit<FruitLog, 'id'> = {
      babyId: logData.babyId,
      fruitName: logData.fruitName,
      datetime: logData.datetime,
      quantity: logData.quantity,
      reaction: logData.reaction,
      notes: logData.notes || '',
      createdAt: now,
      updatedAt: now
    };

    if (logData.id) {
      const docRef = doc(db, 'users', userId, 'fruits', logData.id);
      await setDoc(docRef, {
        ...payload,
        updatedAt: now
      }, { merge: true });
      return logData.id;
    } else {
      const docRef = await addDoc(fruitsCol, payload);
      return docRef.id;
    }
  } catch (error) {
    console.error('Erro ao salvar fruta:', error);
    throw error;
  }
};

/**
 * Exclui um registro de fruta do Firestore.
 */
export const deleteFruitLog = async (userId: string, id: string): Promise<void> => {
  try {
    const docRef = doc(db, 'users', userId, 'fruits', id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Erro ao excluir fruta:', error);
    throw error;
  }
};
