import { deleteUser } from 'firebase/auth';
import { collection, doc, getDocs, deleteDoc, getDoc } from 'firebase/firestore';
import { db, auth } from './firebase';
import {
  getStoredBaby,
  getStoredLogs,
  getStoredReminders,
  getStoredGrowthRecords,
  getStoredVaccineRecords,
  getStoredCustomVaccines,
  getStoredSleepRecords,
  getStoredDiaperRecords,
  getStoredMedications,
  getStoredMedicationLogs,
  getStoredPediatricianNotes
} from '../config/mockData';

export interface UserDataPayload {
  baby: any;
  feedings: any[];
  fruits: any[];
  meals: any[];
  reminders: any[];
  growthRecords: any[];
  vaccineRecords: any[];
  customVaccines: any[];
  sleepRecords: any[];
  diaperRecords: any[];
  medications: any[];
  medicationLogs: any[];
  notificationTokens?: any[];
  pediatricianNotes: string;
  exportedAt: string;
}

/**
 * Exporta todos os dados do usuário/família do banco de dados.
 * Remove ou mascara campos de segurança/tokens confidenciais.
 */
export const exportUserData = async (userId: string, familyId?: string): Promise<UserDataPayload> => {
  const exportedAt = new Date().toISOString();

  if (userId === 'demo-uid') {
    const rawLogs = getStoredLogs();
    const feedings = rawLogs.filter((l: any) => l.type !== undefined && l.fruitName === undefined && l.foodName === undefined);
    const fruits = rawLogs.filter((l: any) => l.fruitName !== undefined);
    const meals = rawLogs.filter((l: any) => l.foodName !== undefined);

    return {
      baby: getStoredBaby(),
      feedings,
      fruits,
      meals,
      reminders: getStoredReminders(),
      growthRecords: getStoredGrowthRecords(),
      vaccineRecords: getStoredVaccineRecords(),
      customVaccines: getStoredCustomVaccines(),
      sleepRecords: getStoredSleepRecords(),
      diaperRecords: getStoredDiaperRecords(),
      medications: getStoredMedications(),
      medicationLogs: getStoredMedicationLogs(),
      pediatricianNotes: getStoredPediatricianNotes(),
      exportedAt
    };
  }

  // Real Firestore integration
  const getSubDocs = async (subName: string) => {
    try {
      const colPath = familyId 
        ? collection(db, 'families', familyId, subName)
        : collection(db, 'users', userId, subName);
      const snap = await getDocs(colPath);
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (e) {
      console.warn(`Aviso ao exportar subcoleção ${subName}:`, e);
      return [];
    }
  };

  const babyColPath = familyId 
    ? collection(db, 'families', familyId, 'babies')
    : collection(db, 'users', userId, 'babies');
  const babyProfileSnap = await getDocs(babyColPath);
  const baby = babyProfileSnap.empty ? null : { id: babyProfileSnap.docs[0].id, ...babyProfileSnap.docs[0].data() };

  const feedings = await getSubDocs('feedings');
  const fruits = await getSubDocs('fruits');
  const meals = await getSubDocs('meals');
  const reminders = await getSubDocs('reminders');
  const growthRecords = await getSubDocs('growthRecords');
  const vaccineRecords = await getSubDocs('vaccineRecords');
  const customVaccines = await getSubDocs('customVaccines');
  const sleepRecords = await getSubDocs('sleepRecords');
  const diaperRecords = await getSubDocs('diaperRecords');
  const medications = await getSubDocs('medications');
  const medicationLogs = await getSubDocs('medicationLogs');

  // Máscara de segurança para os tokens de notificação push
  const rawTokens = await getSubDocs('notificationTokens');
  const notificationTokens = rawTokens.map((t: any) => ({
    id: t.id,
    platform: t.platform || 'unknown',
    userAgent: t.userAgent || 'unknown',
    active: t.active ?? false,
    createdAt: t.createdAt || 0,
    updatedAt: t.updatedAt || 0,
    token: '***MASKED_FOR_PRIVACY***'
  }));

  const pedDocPath = familyId
    ? doc(db, 'families', familyId, 'pediatrician', 'notes')
    : doc(db, 'users', userId, 'pediatrician', 'notes');
  const pedDoc = await getDoc(pedDocPath);
  const pediatricianNotes = pedDoc.exists() ? (pedDoc.data().content || pedDoc.data().notes || '') : '';

  return {
    baby,
    feedings,
    fruits,
    meals,
    reminders,
    growthRecords,
    vaccineRecords,
    customVaccines,
    sleepRecords,
    diaperRecords,
    medications,
    medicationLogs,
    notificationTokens,
    pediatricianNotes,
    exportedAt
  };
};

/**
 * Apaga permanentemente todos os registros do usuário no Firestore (ou localStorage se for convidado).
 * Implementa validação de administrador e único membro na família.
 */
export const deleteAllUserData = async (userId: string, familyId?: string): Promise<void> => {
  if (userId === 'demo-uid') {
    localStorage.removeItem('rt_baby');
    localStorage.removeItem('rt_logs');
    localStorage.removeItem('rt_reminders');
    localStorage.removeItem('rt_growth_records');
    localStorage.removeItem('rt_vaccine_records');
    localStorage.removeItem('rt_custom_vaccines');
    localStorage.removeItem('rt_sleep_records');
    localStorage.removeItem('rt_diaper_records');
    localStorage.removeItem('rt_medications');
    localStorage.removeItem('rt_medication_logs');
    localStorage.removeItem('rt_ped_notes');
    localStorage.removeItem('rt_user');
    return;
  }

  // Se estiver associado a uma família
  if (familyId) {
    try {
      const membersCol = collection(db, 'families', familyId, 'members');
      const membersSnap = await getDocs(membersCol);
      const members = membersSnap.docs.map(d => ({ id: d.id, ...d.data() } as any));

      // Se houver outros membros
      if (members.length > 1) {
        const userMember = members.find(m => m.userId === userId);
        const otherAdmins = members.filter(m => m.userId !== userId && m.role === 'admin');

        // Se o usuário for admin e não houver outros administradores
        if (userMember?.role === 'admin' && otherAdmins.length === 0) {
          throw new Error('Você é o único administrador desta família. Promova outro membro a administrador antes de excluir sua conta, ou remova os outros membros primeiro.');
        }

        // Se puder sair com segurança, remove o membro da família
        await deleteDoc(doc(db, 'families', familyId, 'members', userId));
      } else {
        // Se for o único membro, exclui a família inteira e todos os seus registros.
        // Excluímos 'members' por último para evitar a perda instantânea de permissão de escrita/exclusão (regras do Firestore)
        const subcollections = [
          'invites',
          'babies',
          'feedings',
          'fruits',
          'meals',
          'reminders',
          'growthRecords',
          'vaccineRecords',
          'customVaccines',
          'sleepRecords',
          'diaperRecords',
          'medications',
          'medicationLogs',
          'notificationTokens'
        ];

        for (const sub of subcollections) {
          try {
            const snap = await getDocs(collection(db, 'families', familyId, sub));
            for (const docSnap of snap.docs) {
              await deleteDoc(doc(db, 'families', familyId, sub, docSnap.id));
            }
          } catch (e) {
            console.error(`Erro ao apagar subcoleção da família ${sub}:`, e);
          }
        }

        // Apaga notas do pediatra
        try {
          await deleteDoc(doc(db, 'families', familyId, 'pediatrician', 'notes'));
        } catch (e) {
          // Ignora
        }

        // Apaga o documento da família
        try {
          await deleteDoc(doc(db, 'families', familyId));
        } catch (e) {
          console.error('Erro ao apagar documento da família:', e);
        }

        // Por fim, apaga os membros (onde está o próprio usuário admin)
        try {
          const snap = await getDocs(collection(db, 'families', familyId, 'members'));
          for (const docSnap of snap.docs) {
            await deleteDoc(doc(db, 'families', familyId, 'members', docSnap.id));
          }
        } catch (e) {
          console.error('Erro ao apagar membros da família:', e);
        }
      }
    } catch (error: any) {
      console.error('Erro ao processar remoção da família:', error);
      // Tenta apagar o registro do próprio membro como último esforço
      try {
        await deleteDoc(doc(db, 'families', familyId, 'members', userId));
      } catch (e) {
        // Ignora
      }
      
      // Se for o nosso erro customizado do único administrador, relança para mostrar na tela
      if (error.message && error.message.includes('administrador')) {
        throw error;
      }
    }
  }

  // Deleta o perfil do usuário
  try {
    await deleteDoc(doc(db, 'users', userId));
  } catch (e) {
    console.error('Erro ao deletar perfil do usuário:', e);
  }
};

/**
 * Exclui a conta do usuário logado no Firebase Auth.
 * Trata o erro auth/requires-recent-login para solicitar reautenticação.
 */
export const deleteUserAccount = async (): Promise<void> => {
  const currentUserObj = auth.currentUser;
  if (!currentUserObj) {
    throw new Error('Nenhum usuário logado no Firebase Auth.');
  }

  try {
    await deleteUser(currentUserObj);
  } catch (error: any) {
    console.error('Erro ao deletar usuário do Firebase Auth:', error);
    if (error.code === 'auth/requires-recent-login') {
      const err = new Error('Por segurança, faça login novamente antes de excluir sua conta.');
      (err as any).code = 'requires-recent-login';
      throw err;
    }
    throw error;
  }
};
