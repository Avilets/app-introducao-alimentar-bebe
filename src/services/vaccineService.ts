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
import type { VaccineRecord, CustomVaccine, Reminder } from '../types';
import { saveReminder } from './reminderService';

const getVaccineRecordsCollection = (familyId: string) => {
  return collection(db, 'families', familyId, 'vaccineRecords');
};

const getCustomVaccinesCollection = (familyId: string) => {
  return collection(db, 'families', familyId, 'customVaccines');
};

/**
 * Escuta em tempo real os registros de vacinas aplicadas.
 */
export const subscribeToVaccineRecords = (
  familyId: string,
  callback: (records: VaccineRecord[]) => void
) => {
  const q = query(getVaccineRecordsCollection(familyId), orderBy('appliedDate', 'desc'));
  
  return onSnapshot(q, (snapshot) => {
    const list: VaccineRecord[] = [];
    snapshot.forEach((docSnap) => {
      list.push({
        id: docSnap.id,
        ...docSnap.data()
      } as VaccineRecord);
    });
    callback(list);
  }, (error) => {
    console.error('Erro ao assinar registros de vacinas:', error);
  });
};

/**
 * Escuta em tempo real as vacinas personalizadas cadastradas pelo usuário.
 */
export const subscribeToCustomVaccines = (
  familyId: string,
  callback: (customVaccines: CustomVaccine[]) => void
) => {
  const q = query(getCustomVaccinesCollection(familyId), orderBy('recommendedAgeMonths', 'asc'));
  
  return onSnapshot(q, (snapshot) => {
    const list: CustomVaccine[] = [];
    snapshot.forEach((docSnap) => {
      list.push({
        id: docSnap.id,
        ...docSnap.data()
      } as CustomVaccine);
    });
    callback(list);
  }, (error) => {
    console.error('Erro ao assinar vacinas customizadas:', error);
  });
};

/**
 * Cria ou atualiza um registro de vacina aplicada.
 */
export const saveVaccineRecord = async (
  familyId: string,
  recordData: Omit<VaccineRecord, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }
): Promise<string> => {
  try {
    const now = Date.now();
    const vaccineRecCol = getVaccineRecordsCollection(familyId);
    
    const payload: any = {
      babyId: recordData.babyId,
      vaccineId: recordData.vaccineId,
      vaccineName: recordData.vaccineName,
      dose: recordData.dose,
      recommendedAgeMonths: Number(recordData.recommendedAgeMonths),
      recommendedDate: recordData.recommendedDate,
      applied: recordData.applied,
      appliedDate: recordData.appliedDate,
      location: recordData.location || '',
      batchNumber: recordData.batchNumber || '',
      clinic: recordData.clinic || '',
      reaction: recordData.reaction || '',
      notes: recordData.notes || '',
      source: recordData.source || 'SUS',
      updatedAt: now
    };

    if (!recordData.id) {
      payload.createdAt = now;
    }

    if (recordData.id) {
      const docRef = doc(db, 'families', familyId, 'vaccineRecords', recordData.id);
      await setDoc(docRef, {
        ...payload,
        updatedAt: now
      }, { merge: true });
      return recordData.id;
    } else {
      const docRef = await addDoc(vaccineRecCol, payload);
      return docRef.id;
    }
  } catch (error) {
    console.error('Erro ao salvar registro de vacina:', error);
    throw error;
  }
};

/**
 * Exclui um registro de vacina aplicada.
 */
export const deleteVaccineRecord = async (familyId: string, id: string): Promise<void> => {
  try {
    const docRef = doc(db, 'families', familyId, 'vaccineRecords', id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Erro ao excluir registro de vacina:', error);
    throw error;
  }
};

/**
 * Cria ou atualiza uma vacina customizada/personalizada.
 */
export const saveCustomVaccine = async (
  familyId: string,
  customData: Omit<CustomVaccine, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }
): Promise<string> => {
  try {
    const now = Date.now();
    const customCol = getCustomVaccinesCollection(familyId);
    
    const payload: any = {
      babyId: customData.babyId,
      vaccineName: customData.vaccineName,
      dose: customData.dose,
      recommendedAgeMonths: Number(customData.recommendedAgeMonths),
      recommendedDate: customData.recommendedDate,
      type: customData.type || 'custom',
      diseasesPrevented: customData.diseasesPrevented || '',
      notes: customData.notes || '',
      repeatDose: !!customData.repeatDose,
      updatedAt: now
    };

    if (!customData.id) {
      payload.createdAt = now;
    }

    if (customData.repeatDose) {
      payload.intervalValue = Number(customData.intervalValue);
      payload.intervalUnit = customData.intervalUnit;
      payload.dosesCount = Number(customData.dosesCount);
    }

    if (customData.id) {
      const docRef = doc(db, 'families', familyId, 'customVaccines', customData.id);
      await setDoc(docRef, {
        ...payload,
        updatedAt: now
      }, { merge: true });
      return customData.id;
    } else {
      const docRef = await addDoc(customCol, payload);
      return docRef.id;
    }
  } catch (error) {
    console.error('Erro ao salvar vacina personalizada:', error);
    throw error;
  }
};

/**
 * Exclui uma vacina personalizada.
 */
export const deleteCustomVaccine = async (familyId: string, id: string): Promise<void> => {
  try {
    const docRef = doc(db, 'families', familyId, 'customVaccines', id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Erro ao excluir vacina personalizada:', error);
    throw error;
  }
};

/**
 * Calcula a data recomendada com base na data de nascimento e idade recomendada em meses.
 */
export const calculateRecommendedDate = (birthDateStr: string, recommendedAgeMonths: number): string => {
  if (!birthDateStr) return '';
  const date = new Date(birthDateStr + 'T00:00:00');
  date.setMonth(date.getMonth() + recommendedAgeMonths);
  
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

/**
 * Cria um lembrete/agendamento de vacina no reminderService.
 */
export const createVaccineReminder = async (
  userId: string,
  babyId: string,
  vaccineName: string,
  dose: string,
  targetDateStr: string, // YYYY-MM-DD
  timeStr: string // HH:MM
): Promise<string> => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  const targetDate = new Date(targetDateStr + 'T00:00:00');
  targetDate.setHours(hours, minutes, 0, 0);

  const reminderPayload: Omit<Reminder, 'id'> = {
    babyId,
    type: 'vacina',
    title: `${vaccineName} (${dose})`,
    mode: 'fixed',
    fixedTime: timeStr,
    repeatDaily: false,
    active: true,
    notes: `Agendada para ${new Date(targetDateStr + 'T00:00:00').toLocaleDateString('pt-BR')}`,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    nextTriggerAt: targetDate.getTime(),
    nextDueAt: targetDate.getTime()
  };

  return saveReminder(userId, reminderPayload);
};

export type VaccineStatus = 'applied' | 'scheduled' | 'delayed' | 'pending';

/**
 * Calcula o estado/status de uma vacina.
 */
export const getVaccineStatus = (
  recommendedDateStr: string,
  appliedRecord?: VaccineRecord,
  hasActiveReminder?: boolean
): VaccineStatus => {
  if (appliedRecord && appliedRecord.applied) {
    return 'applied';
  }
  if (hasActiveReminder) {
    return 'scheduled';
  }
  
  const todayStr = new Date().toISOString().split('T')[0];
  if (recommendedDateStr < todayStr) {
    return 'delayed';
  }
  return 'pending';
};
