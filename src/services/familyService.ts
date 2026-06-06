import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  deleteDoc,
  onSnapshot,
  writeBatch
} from 'firebase/firestore';
import { db } from './firebase';
import type { FamilyMember, FamilyInvite, UserProfile } from '../types';

/**
 * Escuta em tempo real o perfil do usuário logado.
 */
export const subscribeToUserProfile = (
  userId: string,
  callback: (profile: UserProfile | null) => void
) => {
  const docRef = doc(db, 'users', userId);
  return onSnapshot(docRef, (docSnap) => {
    if (docSnap.exists()) {
      callback({
        uid: docSnap.id,
        ...docSnap.data()
      } as UserProfile);
    } else {
      callback(null);
    }
  }, (error) => {
    console.error('Erro ao assinar perfil do usuário:', error);
  });
};

/**
 * Escuta em tempo real os membros de uma família.
 */
export const subscribeToFamilyMembers = (
  familyId: string,
  callback: (members: FamilyMember[]) => void
) => {
  const colRef = collection(db, 'families', familyId, 'members');
  return onSnapshot(colRef, (snapshot) => {
    const list: FamilyMember[] = [];
    snapshot.forEach((docSnap) => {
      list.push(docSnap.data() as FamilyMember);
    });
    callback(list);
  }, (error) => {
    console.error('Erro ao assinar membros da família:', error);
  });
};

/**
 * Escuta em tempo real os convites de uma família.
 */
export const subscribeToFamilyInvites = (
  familyId: string,
  callback: (invites: FamilyInvite[]) => void
) => {
  const colRef = collection(db, 'families', familyId, 'invites');
  return onSnapshot(colRef, (snapshot) => {
    const list: FamilyInvite[] = [];
    snapshot.forEach((docSnap) => {
      list.push({
        id: docSnap.id,
        ...docSnap.data()
      } as FamilyInvite);
    });
    callback(list);
  }, (error) => {
    console.error('Erro ao assinar convites da família:', error);
  });
};

/**
 * Cria uma nova família e define o usuário criador como admin.
 */
export const createFamily = async (
  userId: string,
  userEmail: string,
  babyName?: string
): Promise<string> => {
  try {
    const now = Date.now();
    const familyName = babyName ? `Família do ${babyName}` : 'Minha Família';
    
    // 1. Cria o documento da família
    const familiesCol = collection(db, 'families');
    const familyDocRef = await addDoc(familiesCol, {
      name: familyName,
      ownerUserId: userId,
      createdAt: now,
      updatedAt: now
    });
    const familyId = familyDocRef.id;

    // 2. Adiciona o criador como membro admin
    const memberDocRef = doc(db, 'families', familyId, 'members', userId);
    await setDoc(memberDocRef, {
      userId,
      email: userEmail,
      displayName: userEmail.split('@')[0],
      role: 'admin',
      status: 'active',
      createdAt: now,
      updatedAt: now
    });

    // 3. Atualiza o perfil do usuário com a activeFamilyId
    const userDocRef = doc(db, 'users', userId);
    await setDoc(userDocRef, {
      email: userEmail,
      displayName: userEmail.split('@')[0],
      activeFamilyId: familyId,
      updatedAt: now
    }, { merge: true });

    return familyId;
  } catch (error) {
    console.error('Erro ao criar família:', error);
    throw error;
  }
};

/**
 * Gera um código de convite único com formato BG-XXXXXX
 */
const generateInviteCode = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `BG-${code}`;
};

/**
 * Cria um convite para um membro na família e registra globalmente para busca rápida.
 */
export const createInvite = async (
  familyId: string,
  email: string,
  role: 'cuidador' | 'leitura',
  invitedByUserId: string,
  invitedByEmail: string,
  restrictedToEmail: boolean = true
): Promise<string> => {
  try {
    const now = Date.now();
    const expiresAt = now + 7 * 24 * 60 * 60 * 1000; // 7 dias
    const inviteCode = generateInviteCode();
    const inviteEmail = email.toLowerCase().trim();

    // 1. Salva o convite na subcoleção da família
    const inviteCol = collection(db, 'families', familyId, 'invites');
    const inviteDocRef = await addDoc(inviteCol, {
      email: inviteEmail,
      role,
      status: 'pending',
      invitedByUserId,
      invitedByEmail,
      invitedAt: now,
      expiresAt,
      createdAt: now,
      updatedAt: now,
      inviteCode,
      restrictedToEmail
    });

    // 2. Salva o código na coleção de busca global de convites
    const globalInviteDocRef = doc(db, 'familyInvites', inviteCode);
    await setDoc(globalInviteDocRef, {
      inviteCode,
      familyId,
      inviteId: inviteDocRef.id,
      email: inviteEmail,
      role,
      status: 'pending',
      expiresAt,
      restrictedToEmail,
      createdAt: now
    });

    return inviteCode;
  } catch (error) {
    console.error('Erro ao criar convite:', error);
    throw error;
  }
};

/**
 * Revoga um convite pendente.
 */
export const revokeInvite = async (
  familyId: string,
  inviteId: string,
  inviteCode: string
): Promise<void> => {
  try {
    const now = Date.now();
    
    // Atualiza na subcoleção da família
    const inviteDocRef = doc(db, 'families', familyId, 'invites', inviteId);
    await setDoc(inviteDocRef, {
      status: 'revoked',
      updatedAt: now
    }, { merge: true });

    // Atualiza na busca global
    const globalInviteDocRef = doc(db, 'familyInvites', inviteCode);
    await setDoc(globalInviteDocRef, {
      status: 'revoked'
    }, { merge: true });
  } catch (error) {
    console.error('Erro ao revogar convite:', error);
    throw error;
  }
};

/**
 * Valida e aceita um convite de família por código.
 */
export const acceptInvite = async (
  userId: string,
  userEmail: string,
  displayName: string,
  inviteCode: string
): Promise<{ success: boolean; message: string; familyId?: string }> => {
  try {
    const now = Date.now();
    const cleanCode = inviteCode.toUpperCase().trim();

    // 1. Busca o convite global
    const globalInviteDocRef = doc(db, 'familyInvites', cleanCode);
    const globalInviteSnap = await getDoc(globalInviteDocRef);

    if (!globalInviteSnap.exists()) {
      return { success: false, message: 'Código de convite não encontrado. Verifique se digitou corretamente.' };
    }

    const inviteData = globalInviteSnap.data();

    if (inviteData.status !== 'pending') {
      return { success: false, message: `Este convite já foi ${inviteData.status === 'accepted' ? 'utilizado' : 'revogado'}.` };
    }

    if (inviteData.expiresAt < now) {
      // Atualiza estado do convite para expirado
      await setDoc(globalInviteDocRef, { status: 'expired' }, { merge: true });
      await setDoc(doc(db, 'families', inviteData.familyId, 'invites', inviteData.inviteId), { status: 'expired', updatedAt: now }, { merge: true });
      return { success: false, message: 'Este convite expirou. Solicite um novo código.' };
    }

    // Valida e-mail de destino se restrito
    const userEmailClean = userEmail.toLowerCase().trim();
    if (inviteData.restrictedToEmail && inviteData.email !== userEmailClean) {
      return { success: false, message: `Este convite é restrito ao e-mail ${inviteData.email}. Você está logado como ${userEmail}.` };
    }

    const familyId = inviteData.familyId;

    // 2. Cria o registro de membro na família
    const memberDocRef = doc(db, 'families', familyId, 'members', userId);
    await setDoc(memberDocRef, {
      userId,
      email: userEmailClean,
      displayName: displayName || userEmail.split('@')[0],
      role: inviteData.role,
      status: 'active',
      createdAt: now,
      updatedAt: now
    });

    // 3. Atualiza o perfil do usuário com a activeFamilyId
    const userDocRef = doc(db, 'users', userId);
    await setDoc(userDocRef, {
      email: userEmailClean,
      displayName: displayName || userEmail.split('@')[0],
      activeFamilyId: familyId,
      updatedAt: now
    }, { merge: true });

    // 4. Marca o convite como aceito nas duas coleções
    await setDoc(globalInviteDocRef, { status: 'accepted' }, { merge: true });
    await setDoc(doc(db, 'families', familyId, 'invites', inviteData.inviteId), {
      status: 'accepted',
      acceptedAt: now,
      updatedAt: now
    }, { merge: true });

    return { success: true, message: 'Convite aceito com sucesso!', familyId };
  } catch (error: any) {
    console.error('Erro ao aceitar convite:', error);
    return { success: false, message: error.message || 'Erro desconhecido ao aceitar convite.' };
  }
};

/**
 * Remove um membro da família (apenas admin ou o próprio usuário saindo).
 */
export const removeFamilyMember = async (
  familyId: string,
  memberUserId: string
): Promise<void> => {
  try {
    // 1. Exclui o membro da subcoleção
    const memberDocRef = doc(db, 'families', familyId, 'members', memberUserId);
    await deleteDoc(memberDocRef);

    // 2. Limpa activeFamilyId no documento do usuário
    const userDocRef = doc(db, 'users', memberUserId);
    await setDoc(userDocRef, {
      activeFamilyId: null,
      updatedAt: Date.now()
    }, { merge: true });
  } catch (error) {
    console.error('Erro ao remover membro da família:', error);
    throw error;
  }
};

/**
 * Atualiza o papel de um membro na família (apenas admin).
 */
export const updateFamilyMemberRole = async (
  familyId: string,
  memberUserId: string,
  role: 'admin' | 'cuidador' | 'leitura'
): Promise<void> => {
  try {
    const memberDocRef = doc(db, 'families', familyId, 'members', memberUserId);
    await setDoc(memberDocRef, {
      role,
      updatedAt: Date.now()
    }, { merge: true });
  } catch (error) {
    console.error('Erro ao atualizar papel do membro:', error);
    throw error;
  }
};

/**
 * Copia com segurança documentos do caminho antigo users/{userId} para families/{familyId}.
 * Evita duplicações pois preserva os IDs dos documentos.
 */
export const migrateUserDataToFamily = async (
  userId: string,
  familyId: string
): Promise<void> => {
  const subcollections = [
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

  try {
    const now = Date.now();

    for (const sub of subcollections) {
      const sourceCol = collection(db, 'users', userId, sub);
      const snapshot = await getDocs(sourceCol);
      
      if (snapshot.empty) continue;

      // Executa a cópia em lotes (batch) por subcoleção para desempenho e atomicidade
      const batch = writeBatch(db);
      
      snapshot.docs.forEach((docSnap) => {
        const destDocRef = doc(db, 'families', familyId, sub, docSnap.id);
        batch.set(destDocRef, docSnap.data(), { merge: true });
      });

      await batch.commit();
    }

    // Copia anotações do pediatra se houver
    const pedNotesDocRef = doc(db, 'users', userId, 'pediatrician', 'notes');
    const pedNotesSnap = await getDoc(pedNotesDocRef);
    if (pedNotesSnap.exists()) {
      const destPedNotesRef = doc(db, 'families', familyId, 'pediatrician', 'notes');
      await setDoc(destPedNotesRef, pedNotesSnap.data(), { merge: true });
    }

    // Atualiza o status de migração concluída no perfil do usuário
    const userDocRef = doc(db, 'users', userId);
    await setDoc(userDocRef, {
      migrationToFamilyCompleted: true,
      updatedAt: now
    }, { merge: true });

    console.log(`Migração concluída com sucesso para o usuário ${userId} e família ${familyId}`);
  } catch (error) {
    console.error('Erro durante a migração de dados:', error);
    throw error;
  }
};

/**
 * Exclui a família inteira e todos os seus subdocumentos (somente se não houver outros membros ou confirmado).
 */
export const deleteFamily = async (familyId: string): Promise<void> => {
  const subcollections = [
    'members',
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

  try {
    // 1. Limpa activeFamilyId de todos os membros que estão associados a ela antes de apagar
    const membersSnap = await getDocs(collection(db, 'families', familyId, 'members'));
    for (const mDoc of membersSnap.docs) {
      const mUid = mDoc.id;
      await setDoc(doc(db, 'users', mUid), {
        activeFamilyId: null,
        updatedAt: Date.now()
      }, { merge: true });
    }

    // 2. Apaga todas as subcoleções
    for (const sub of subcollections) {
      const subSnap = await getDocs(collection(db, 'families', familyId, sub));
      for (const docSnap of subSnap.docs) {
        await deleteDoc(doc(db, 'families', familyId, sub, docSnap.id));
      }
    }

    // 3. Apaga pediatra notes se houver
    try {
      await deleteDoc(doc(db, 'families', familyId, 'pediatrician', 'notes'));
    } catch (e) {
      // Ignora se não existir
    }

    // 4. Exclui o documento da própria família
    await deleteDoc(doc(db, 'families', familyId));
  } catch (error) {
    console.error('Erro ao excluir família:', error);
    throw error;
  }
};
