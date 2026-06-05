import {
  collection,
  doc,
  getDocs,
  setDoc,
  addDoc,
  onSnapshot,
  query,
  limit
} from 'firebase/firestore';
import { db } from './firebase';
import type { Baby } from '../types';

/**
 * Obtém a referência da subcoleção 'babies' do usuário.
 */
const getBabiesCollection = (userId: string) => {
  return collection(db, 'users', userId, 'babies');
};

/**
 * Busca o primeiro bebê cadastrado para o usuário.
 * Retorna null se nenhum bebê for encontrado.
 */
export const getBaby = async (userId: string): Promise<Baby | null> => {
  try {
    const q = query(getBabiesCollection(userId), limit(1));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      return null;
    }
    
    const docSnap = snapshot.docs[0];
    return {
      id: docSnap.id,
      ...docSnap.data()
    } as Baby;
  } catch (error) {
    console.error('Erro ao buscar perfil do bebê:', error);
    throw error;
  }
};

/**
 * Escuta em tempo real o perfil do bebê do usuário.
 */
export const subscribeToBaby = (userId: string, callback: (baby: Baby | null) => void) => {
  const q = query(getBabiesCollection(userId), limit(1));
  
  return onSnapshot(q, (snapshot) => {
    if (snapshot.empty) {
      callback(null);
    } else {
      const docSnap = snapshot.docs[0];
      callback({
        id: docSnap.id,
        ...docSnap.data()
      } as Baby);
    }
  }, (error) => {
    console.error('Erro em tempo real no perfil do bebê:', error);
  });
};

/**
 * Salva ou edita os dados do bebê no Firestore.
 */
export const saveBaby = async (userId: string, babyData: Baby): Promise<string> => {
  try {
    const babiesCol = getBabiesCollection(userId);
    
    if (babyData.id) {
      // Editar bebê existente
      const docRef = doc(db, 'users', userId, 'babies', babyData.id);
      await setDoc(docRef, {
        name: babyData.name,
        birthDate: babyData.birthDate,
        gender: babyData.gender,
        targetWeight: babyData.targetWeight || null
      }, { merge: true });
      return babyData.id;
    } else {
      // Cadastrar novo bebê
      const docRef = await addDoc(babiesCol, {
        name: babyData.name,
        birthDate: babyData.birthDate,
        gender: babyData.gender,
        targetWeight: babyData.targetWeight || null
      });
      return docRef.id;
    }
  } catch (error) {
    console.error('Erro ao salvar dados do bebê:', error);
    throw error;
  }
};
