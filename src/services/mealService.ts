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
import type { MealLog } from '../types';

const getMealsCollection = (userId: string) => {
  return collection(db, 'users', userId, 'meals');
};

/**
 * Escuta em tempo real todas as refeições do usuário.
 */
export const subscribeToMeals = (userId: string, callback: (logs: MealLog[]) => void) => {
  const q = query(getMealsCollection(userId), orderBy('datetime', 'desc'));
  
  return onSnapshot(q, (snapshot) => {
    const list: MealLog[] = [];
    snapshot.forEach((docSnap) => {
      list.push({
        id: docSnap.id,
        ...docSnap.data()
      } as MealLog);
    });
    callback(list);
  }, (error) => {
    console.error('Erro ao assinar refeições:', error);
  });
};

/**
 * Busca de forma assíncrona todas as refeições registradas pelo usuário.
 */
export const getMeals = async (userId: string): Promise<MealLog[]> => {
  try {
    const q = query(getMealsCollection(userId), orderBy('datetime', 'desc'));
    const snapshot = await getDocs(q);
    const list: MealLog[] = [];
    snapshot.forEach((docSnap) => {
      list.push({
        id: docSnap.id,
        ...docSnap.data()
      } as MealLog);
    });
    return list;
  } catch (error) {
    console.error('Erro ao buscar refeições:', error);
    throw error;
  }
};

/**
 * Busca apenas as refeições registradas no dia de hoje.
 */
export const getTodayMeals = async (userId: string): Promise<MealLog[]> => {
  try {
    const range = getDayDateRange();
    const q = query(
      getMealsCollection(userId),
      where('datetime', '>=', range.start),
      where('datetime', '<=', range.end)
    );
    const snapshot = await getDocs(q);
    const list: MealLog[] = [];
    snapshot.forEach((docSnap) => {
      list.push({
        id: docSnap.id,
        ...docSnap.data()
      } as MealLog);
    });
    return list.sort((a, b) => b.datetime.localeCompare(a.datetime));
  } catch (error) {
    console.error('Erro ao buscar refeições de hoje:', error);
    throw error;
  }
};

/**
 * Cria ou atualiza um registro de refeição no Firestore.
 */
export const saveMealLog = async (
  userId: string,
  logData: Omit<MealLog, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }
): Promise<string> => {
  try {
    const now = Date.now();
    const mealsCol = getMealsCollection(userId);
    
    const payload: Omit<MealLog, 'id'> = {
      babyId: logData.babyId,
      category: logData.category,
      foodName: logData.foodName,
      datetime: logData.datetime,
      quantity: logData.quantity,
      texture: logData.texture,
      reaction: logData.reaction,
      notes: logData.notes || '',
      createdAt: now,
      updatedAt: now
    };

    if (logData.id) {
      const docRef = doc(db, 'users', userId, 'meals', logData.id);
      await setDoc(docRef, {
        ...payload,
        updatedAt: now
      }, { merge: true });
      return logData.id;
    } else {
      const docRef = await addDoc(mealsCol, payload);
      return docRef.id;
    }
  } catch (error) {
    console.error('Erro ao salvar refeição:', error);
    throw error;
  }
};

/**
 * Exclui um registro de refeição do Firestore.
 */
export const deleteMealLog = async (userId: string, id: string): Promise<void> => {
  try {
    const docRef = doc(db, 'users', userId, 'meals', id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Erro ao excluir refeição:', error);
    throw error;
  }
};
