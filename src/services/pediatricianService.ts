import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './firebase';

/**
 * Obtém as observações importantes salvas para o pediatra no Firestore.
 */
export const getPediatricianNotes = async (userId: string): Promise<string> => {
  try {
    const docRef = doc(db, 'users', userId, 'pediatrician', 'notes');
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data().content || '';
    }
    return '';
  } catch (error) {
    console.error('Erro ao buscar observações do pediatra no Firestore:', error);
    return '';
  }
};

/**
 * Salva as observações importantes para o pediatra no Firestore.
 */
export const savePediatricianNotes = async (userId: string, content: string): Promise<void> => {
  try {
    const docRef = doc(db, 'users', userId, 'pediatrician', 'notes');
    await setDoc(docRef, {
      content,
      updatedAt: Date.now()
    }, { merge: true });
  } catch (error) {
    console.error('Erro ao salvar observações do pediatra no Firestore:', error);
    throw error;
  }
};
