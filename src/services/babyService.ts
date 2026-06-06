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
const getBabiesCollection = (familyId: string) => {
  return collection(db, 'families', familyId, 'babies');
};

/**
 * Busca o primeiro bebê cadastrado para o usuário.
 * Retorna null se nenhum bebê for encontrado.
 */
export const getBaby = async (familyId: string): Promise<Baby | null> => {
  try {
    const q = query(getBabiesCollection(familyId), limit(1));
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
export const subscribeToBaby = (familyId: string, callback: (baby: Baby | null) => void) => {
  const q = query(getBabiesCollection(familyId), limit(1));
  
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
export const saveBaby = async (familyId: string, babyData: Baby): Promise<string> => {
  try {
    const babiesCol = getBabiesCollection(familyId);
    
    if (babyData.id) {
      // Editar bebê existente
      const docRef = doc(db, 'families', familyId, 'babies', babyData.id);
      await setDoc(docRef, {
        name: babyData.name,
        birthDate: babyData.birthDate,
        gender: babyData.gender,
        targetWeight: babyData.targetWeight || null,
        photoBase64: babyData.photoBase64 || null
      }, { merge: true });
      return babyData.id;
    } else {
      // Cadastrar novo bebê
      const docRef = await addDoc(babiesCol, {
        name: babyData.name,
        birthDate: babyData.birthDate,
        gender: babyData.gender,
        targetWeight: babyData.targetWeight || null,
        photoBase64: babyData.photoBase64 || null
      });
      return docRef.id;
    }
  } catch (error) {
    console.error('Erro ao salvar dados do bebê:', error);
    throw error;
  }
};
